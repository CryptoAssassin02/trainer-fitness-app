import { createClientComponentClient, type SupabaseClient } from '@supabase/auth-helpers-nextjs'
import { createContext, useContext, useState } from 'react'

type SupabaseContext = {
  supabase: SupabaseClient
}

const Context = createContext<SupabaseContext | null>(null)

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClientComponentClient())

  return (
    <Context.Provider value={{ supabase }}>
      {children}
    </Context.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === null) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
} 