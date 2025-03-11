"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import ErrorBoundary from "@/components/error-boundary"
import { errorTracker } from "@/utils/error-tracking"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const { user } = useUser()
  
  // Initialize error tracking
  useEffect(() => {
    if (typeof window !== 'undefined') {
      errorTracker.init({ userId: user?.id });
      
      if (user?.id) {
        errorTracker.setUser(user.id);
      }
    }
  }, [user?.id]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider 
        attribute="class" 
        defaultTheme="dark" 
        enableSystem
        disableTransitionOnChange
      >
        <ErrorBoundary>
          {children}
          <Toaster />
          <SonnerToaster position="top-right" richColors closeButton />
        </ErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  )
} 