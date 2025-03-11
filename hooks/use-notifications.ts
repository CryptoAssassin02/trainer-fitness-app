"use client"

import { useState, useEffect, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/types/database.types'

interface Notification {
  id?: string
  user_id: string
  title: string
  message: string
  type: 'workout' | 'progress' | 'macro' | 'system'
  is_read: boolean
  link?: string | null
  created_at?: string
}

// Define types based on the database schema
type NotificationPreferences = Database['public']['Tables']['notification_preferences']['Row'];
type NotificationPreferencesInsert = Database['public']['Tables']['notification_preferences']['Insert'];
type NotificationPreferencesUpdate = Database['public']['Tables']['notification_preferences']['Update'];

const supabase = createClient()

export const useNotifications = () => {
  const { user } = useUser()
  const queryClient = useQueryClient()
  const [unreadCount, setUnreadCount] = useState(0)
  const [isInitializing, setIsInitializing] = useState(false)

  // Fetch all notifications
  const { data: notifications, isLoading: isLoadingNotifications } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return []

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('Failed to fetch notifications')
        throw error
      }

      return (data || []) as Notification[]
    },
    enabled: !!user?.id,
  })

  // Fetch notification preferences
  const { data: preferences, isLoading: isLoadingPreferences } = useQuery({
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

  // Update unread count when notifications change
  useEffect(() => {
    if (notifications) {
      const count = notifications.filter(n => !n.is_read).length
      setUnreadCount(count)
    }
  }, [notifications])

  // Mark notification as read
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        toast.error('Failed to mark notification as read')
        throw error
      }

      return data as Notification
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
    }
  })

  // Mark all notifications as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) {
        toast.error('Failed to mark all notifications as read')
        throw error
      }

      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
    }
  })

  // Create a notification (admin/system function)
  const createNotification = useMutation({
    mutationFn: async (notification: Omit<Notification, 'user_id' | 'is_read' | 'created_at'>) => {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const newNotification = {
        ...notification,
        user_id: user.id,
        is_read: false
      }

      const { data, error } = await supabase
        .from('notifications')
        .insert(newNotification)
        .select()
        .single()

      if (error) {
        toast.error('Failed to create notification')
        throw error
      }

      return data as Notification
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
    }
  })

  // Delete a notification
  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) {
        toast.error('Failed to delete notification')
        throw error
      }

      toast.success('Notification deleted')
      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
    }
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
    if (!user?.id || isLoadingPreferences || preferences || isInitializing) return
    
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
  }, [user?.id, isLoadingPreferences, preferences, isInitializing, queryClient])

  return {
    // Notifications
    notifications,
    unreadCount,
    isLoading: isLoadingNotifications || isLoadingPreferences || isInitializing,
    markAsRead,
    markAllAsRead,
    createNotification,
    deleteNotification,
    
    // Notification Preferences
    preferences,
    updatePreferences: updatePreferences.mutate,
    ensurePreferencesExist
  }
} 