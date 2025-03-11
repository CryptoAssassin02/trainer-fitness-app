"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Toaster } from "sonner"
import { ClerkProvider } from "@clerk/nextjs"
import TanstackClientProvider from "@/components/providers/tanstack-client-provider"
import SupabaseProvider from "@/components/providers/supabase-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="dark" 
      enableSystem={true}
      enableColorScheme={true}
      storageKey="trainer-theme"
      disableTransitionOnChange
    >
      <ClerkProvider>
        <SupabaseProvider>
          <TanstackClientProvider>
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                className: "bg-background border border-[#3E9EFF]/20 text-foreground",
                style: {
                  background: "var(--background)",
                  color: "var(--foreground)",
                  border: "1px solid rgba(62, 158, 255, 0.2)",
                }
              }}
            />
          </TanstackClientProvider>
        </SupabaseProvider>
      </ClerkProvider>
    </NextThemesProvider>
  )
} 