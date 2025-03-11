import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import TanstackClientProvider from '@/components/providers/tanstack-client-provider'
import SupabaseProvider from '@/components/providers/supabase-provider'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export function generateMetadata(): Metadata {
  return {
    title: 'trAIner - AI Fitness App',
    description: 'Personalized workout plans powered by AI',
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <ClerkProvider>
            <SupabaseProvider>
              <TanstackClientProvider>
                {children}
                <Toaster />
              </TanstackClientProvider>
            </SupabaseProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
