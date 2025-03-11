// Create file: hooks/use-supabase-auth.ts

import { useSupabase } from '@/utils/supabase/context'
import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

export function useSupabaseAuth() {
  const { user } = useUser()
  const supabase = useSupabase()
  const [isProfileLoaded, setIsProfileLoaded] = useState(false)

  useEffect(() => {
    async function createProfileIfNotExists() {
      if (!user) return

      // Check if profile exists
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking profile:', error)
        return
      }

      // If profile doesn't exist, create it
      if (!data) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            first_name: user.firstName,
            last_name: user.lastName,
            unit_system: 'imperial',
          })

        if (insertError) {
          console.error('Error creating profile:', insertError)
          return
        }
      }

      setIsProfileLoaded(true)
    }

    if (user) {
      createProfileIfNotExists()
    }
  }, [user, supabase])

  return { isProfileLoaded }
}