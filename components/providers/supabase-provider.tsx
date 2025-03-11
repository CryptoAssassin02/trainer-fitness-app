'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/utils/supabase/client'
import { type SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

type SupabaseContext = {
  supabase: SupabaseClient<Database>
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export default function SupabaseProvider({ 
  children 
}: { 
  children: ReactNode 
}) {
  const [supabase] = useState(() => createClient())

  return (
    <Context.Provider value={{ supabase }}>
      {children}
    </Context.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider')
  }
  return context
} 