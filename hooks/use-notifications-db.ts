// Create file: hooks/use-notifications-db.ts

"use client"

import { useState, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/types/database.types'

// Define types based on the database schema
type NotificationPreferences = Database['public']['Tables']['notification_preferences']['Row'];
type NotificationPreferencesInsert = Database['public']['Tables']['notification_preferences']['Insert'];
type NotificationPreferencesUpdate = Database['public']['Tables']['notification_preferences']['Update'];

const supabase = createClient()

export const useNotificationPreferences = () => {
  const { user } = useUser()
  const queryClient = useQueryClient()
  const [isInitializing, setIsInitializing] = useState(false)

  // Fetch notification preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        toast.error('Failed to fetch notification preferences')
        throw error
      }

      return data as NotificationPreferences | null
    },
    enabled: !!user?.id,
  })

  // Create or update notification preferences
  const updatePreferences = useMutation({
    mutationFn: async (preferencesData: Omit<NotificationPreferencesUpdate, 'user_id'>) => {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      // Check if preferences exist
      if (preferences) {
        // Update existing preferences
        const { data, error } = await supabase
          .from('notification_preferences')
          .update({
            ...preferencesData,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .select()
          .single()

        if (error) {
          toast.error('Failed to update notification preferences')
          throw error
        }

        return data as NotificationPreferences
      } else {
        // Create new preferences
        const { data, error } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: user.id,
            ...preferencesData
          })
          .select()
          .single()

        if (error) {
          toast.error('Failed to create notification preferences')
          throw error
        }

        return data as NotificationPreferences
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', user?.id] })
      toast.success('Notification preferences updated')
    }
  })

  // Initialize preferences for a new user if they don't exist
  const ensurePreferencesExist = useCallback(async () => {
    if (!user?.id || isLoading || preferences || isInitializing) return
    
    setIsInitializing(true)
    
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()
        
      if (error && error.code === 'PGRST116') { // No record found
        // Create default preferences
        await supabase
          .from('notification_preferences')
          .insert({
            user_id: user.id,
            email_workout: true,
            email_progress: true,
            email_nutrition: false,
            push_workout: true,
            push_progress: false,
            push_nutrition: false,
            sms_workout: false,
            sms_progress: false,
            sms_nutrition: false
          })
          
        queryClient.invalidateQueries({ queryKey: ['notification-preferences', user?.id] })
      } else if (error) {
        console.error('Error checking preferences:', error)
      }
    } catch (err) {
      console.error('Failed to ensure preferences exist:', err)
    } finally {
      setIsInitializing(false)
    }
  }, [user?.id, isLoading, preferences, isInitializing, queryClient])

  return {
    preferences,
    isLoading: isLoading || isInitializing,
    updatePreferences: updatePreferences.mutate,
    ensurePreferencesExist
  }
}