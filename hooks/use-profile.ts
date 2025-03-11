// Create file: hooks/use-profile.ts

import { useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Database } from '@/types/database.types'
import { createClient } from '@/utils/supabase/client'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

const supabase = createClient()

export const useProfile = () => {
  const { user } = useUser()
  const queryClient = useQueryClient()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        toast.error('Failed to fetch profile')
        throw error
      }

      return data
    },
    enabled: !!user?.id,
  })

  const createProfile = useMutation({
    mutationFn: async (newProfile: ProfileInsert) => {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single()

      if (error) {
        toast.error('Failed to create profile')
        throw error
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
      toast.success('Profile created successfully')
    },
  })

  const updateProfile = useMutation({
    mutationFn: async (updates: ProfileUpdate) => {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        toast.error('Failed to update profile')
        throw error
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
      toast.success('Profile updated successfully')
    },
  })

  const initializeProfile = useCallback(async () => {
    if (!user?.id) return

    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!existingProfile) {
        await createProfile.mutateAsync({
          id: user.id,
          first_name: user.firstName || null,
          last_name: user.lastName || null,
          unit_system: 'metric', // Default to metric
        })
      }
    } catch (error) {
      console.error('Error initializing profile:', error)
      toast.error('Failed to initialize profile')
    }
  }, [user, createProfile])

  return {
    profile,
    isLoading,
    createProfile: createProfile.mutate,
    updateProfile: updateProfile.mutate,
    initializeProfile,
  }
}

export function useDeleteAccount() {
  const { user } = useUser()
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated')

      // Delete all user data from Supabase in the correct order
      try {
        // First get all workout plan IDs for the user
        const { data: workoutPlans, error: workoutPlansError } = await supabase
          .from('workout_plans')
          .select('id')
          .eq('user_id', user.id)

        if (workoutPlansError) throw new Error(`Failed to fetch workout plans: ${workoutPlansError.message}`)
        const workoutPlanIds = workoutPlans.map(plan => plan.id)

        // Get all workout day IDs for these plans
        const { data: workoutDays, error: workoutDaysError } = await supabase
          .from('workout_days')
          .select('id')
          .in('workout_plan_id', workoutPlanIds)

        if (workoutDaysError) throw new Error(`Failed to fetch workout days: ${workoutDaysError.message}`)
        const workoutDayIds = workoutDays.map(day => day.id)

        // Delete exercises for these workout days
        const { error: exercisesError } = await supabase
          .from('exercises')
          .delete()
          .in('workout_day_id', workoutDayIds)

        if (exercisesError) throw new Error(`Failed to delete exercises: ${exercisesError.message}`)

        // Delete workout days
        const { error: deleteDaysError } = await supabase
          .from('workout_days')
          .delete()
          .in('workout_plan_id', workoutPlanIds)

        if (deleteDaysError) throw new Error(`Failed to delete workout days: ${deleteDaysError.message}`)

        // Delete workout plans
        const { error: deletePlansError } = await supabase
          .from('workout_plans')
          .delete()
          .eq('user_id', user.id)

        if (deletePlansError) throw new Error(`Failed to delete workout plans: ${deletePlansError.message}`)

        // Delete progress check-ins
        const { error: progressError } = await supabase
          .from('progress_checkins')
          .delete()
          .eq('user_id', user.id)

        if (progressError) throw new Error(`Failed to delete progress check-ins: ${progressError.message}`)

        // Delete nutrition macros
        const { error: macrosError } = await supabase
          .from('nutrition_macros')
          .delete()
          .eq('user_id', user.id)

        if (macrosError) throw new Error(`Failed to delete nutrition macros: ${macrosError.message}`)

        // Delete notification preferences
        const { error: notificationsError } = await supabase
          .from('notification_preferences')
          .delete()
          .eq('user_id', user.id)

        if (notificationsError) throw new Error(`Failed to delete notification preferences: ${notificationsError.message}`)

        // Finally delete the profile
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', user.id)

        if (profileError) throw new Error(`Failed to delete profile: ${profileError.message}`)

        // Delete the user from Clerk
        await user.delete()
      } catch (error) {
        // Re-throw with more context
        throw new Error(`Account deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    },
    onSuccess: () => {
      queryClient.clear() // Clear all queries from cache
      toast.success('Account successfully deleted')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete account')
      console.error('Account deletion error:', error)
    },
  })
}