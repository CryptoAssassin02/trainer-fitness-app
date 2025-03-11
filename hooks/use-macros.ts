"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { toast } from "sonner"
import { createClient } from '@/utils/supabase/client'

// Define types manually instead of relying on database types
interface MacroTracking {
  id?: string
  user_id: string
  tracking_date: string
  meal_name: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  calories: number
  protein: number
  carbs: number
  fat: number
  notes?: string | null
  created_at?: string
}

interface MacroGoals {
  id?: string
  user_id: string
  calories: number
  protein: number
  carbs: number
  fat: number
  created_at?: string
  updated_at?: string
}

export interface MacroData {
  current: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  target: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  date: string
}

const supabase = createClient()

export const useMacros = (date: Date = new Date()) => {
  const { user } = useUser()
  const queryClient = useQueryClient()
  const formattedDate = format(date, 'yyyy-MM-dd')

  // Get user's macro goals
  const { data: macroGoals, isLoading: isLoadingGoals } = useQuery({
    queryKey: ['macro-goals', user?.id],
    queryFn: async () => {
      if (!user?.id) return null

      const { data, error } = await supabase
        .from('macro_goals')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        if (error.code !== 'PGRST116') { // Not found error
          toast.error('Failed to fetch macro goals')
        }
        return null
      }

      return data as MacroGoals
    },
    enabled: !!user?.id,
  })

  // Get tracked macros for the selected date
  const { data: macroEntries, isLoading: isLoadingEntries } = useQuery({
    queryKey: ['macro-tracking', user?.id, formattedDate],
    queryFn: async () => {
      if (!user?.id) return []

      const { data, error } = await supabase
        .from('macro_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('tracking_date', formattedDate)

      if (error) {
        toast.error('Failed to fetch macro entries')
        throw error
      }

      return (data || []) as MacroTracking[]
    },
    enabled: !!user?.id,
  })

  // Calculate daily totals
  const calculateDailyTotals = () => {
    if (!macroEntries || macroEntries.length === 0) {
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      }
    }

    return macroEntries.reduce((totals, entry) => {
      return {
        calories: totals.calories + (entry.calories || 0),
        protein: totals.protein + (entry.protein || 0),
        carbs: totals.carbs + (entry.carbs || 0),
        fat: totals.fat + (entry.fat || 0)
      }
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    })
  }

  // Get default macro targets based on user profile (simplified version)
  const getDefaultTargets = () => {
    return {
      calories: 2000,
      protein: 150,
      carbs: 200,
      fat: 70
    }
  }

  // Combine the data
  const macros: MacroData = {
    current: calculateDailyTotals(),
    target: macroGoals || getDefaultTargets(),
    date: formattedDate
  }

  // Add a meal or snack
  const addMacroEntry = useMutation({
    mutationFn: async (newEntry: Omit<MacroTracking, 'user_id' | 'tracking_date'>) => {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const entry = {
        ...newEntry,
        user_id: user.id,
        tracking_date: formattedDate
      }

      const { data, error } = await supabase
        .from('macro_tracking')
        .insert(entry)
        .select()
        .single()

      if (error) {
        toast.error('Failed to add meal')
        throw error
      }

      toast.success('Meal added successfully')
      return data as MacroTracking
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['macro-tracking', user?.id, formattedDate] })
    }
  })

  // Update macro goals
  const updateMacroGoals = useMutation({
    mutationFn: async (goals: Omit<MacroGoals, 'user_id'>) => {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      // Check if goals already exist
      const { data: existingGoals } = await supabase
        .from('macro_goals')
        .select('id')
        .eq('user_id', user.id)
        .single()

      let result

      if (existingGoals) {
        // Update existing
        const { data, error } = await supabase
          .from('macro_goals')
          .update(goals)
          .eq('id', existingGoals.id)
          .select()
          .single()

        if (error) {
          toast.error('Failed to update macro goals')
          throw error
        }

        result = data as MacroGoals
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('macro_goals')
          .insert({
            ...goals,
            user_id: user.id
          })
          .select()
          .single()

        if (error) {
          toast.error('Failed to create macro goals')
          throw error
        }

        result = data as MacroGoals
      }

      toast.success('Macro goals updated successfully')
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['macro-goals', user?.id] })
    }
  })

  return {
    macros,
    isLoading: isLoadingGoals || isLoadingEntries,
    addMacroEntry,
    updateMacroGoals
  }
} 