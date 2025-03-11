// Create file: app/(auth)/layout.tsx

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <div className="container relative flex min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <Link
          href="/"
          className="absolute left-4 top-4 flex items-center text-sm font-medium text-muted-foreground md:left-8 md:top-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
        <div className="relative hidden h-full flex-col bg-muted p-10 lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium text-zinc-50">
            <span className="logo-text text-xl">trAIner</span>
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg text-zinc-50">
                "trAIner has completely transformed my fitness journey. The AI-generated workouts are perfect for my goals, and I love how the app adapts as I progress."
              </p>
              <footer className="text-sm text-zinc-400">Sofia Davis</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            {children}
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{" "}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}