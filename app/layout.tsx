import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { Providers } from './providers'

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

export const metadata: Metadata = {
  title: "trAIner | Your AI-Powered Fitness Coach",
  description: "Customized workouts, real-time tracking, and AI-driven insights to help you achieve your fitness goals faster",
  icons: {
    icon: [
      {
        url: "/new-app-logo.png",
        sizes: "512x512 384x384 256x256 192x192 144x144 96x96 64x64 32x32 24x24 16x16",
        type: "image/png"
      }
    ],
    apple: {
      url: "/new-app-logo.png",
      sizes: "512x512 180x180",
      type: "image/png",
    },
    shortcut: { url: "/new-app-logo.png" },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
