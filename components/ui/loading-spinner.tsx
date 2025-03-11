"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg"
  className?: string
  text?: string
  centered?: boolean
}

export function LoadingSpinner({
  size = "md",
  className,
  text,
  centered = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        centered && "flex-col justify-center text-center",
        className
      )}
    >
      <Loader2
        className={cn("animate-spin text-primary", sizeClasses[size])}
      />
      {text && (
        <span className={cn("text-muted-foreground", centered && "text-sm")}>
          {text}
        </span>
      )}
    </div>
  )
}

interface FullPageLoaderProps {
  message?: string
}

export function FullPageLoader({ message = "Loading..." }: FullPageLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="rounded-md bg-card p-6 shadow-lg">
        <LoadingSpinner size="lg" text={message} centered />
      </div>
    </div>
  )
} 