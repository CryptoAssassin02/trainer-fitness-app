"use client"

// Create file: app/(dashboard)/progress/page.tsx

import { Metadata } from "next"
import { ProgressCheckIn } from "@/components/progress/check-in"
import { ProgressHistory } from "@/components/progress/history"

export const metadata: Metadata = {
  title: "Progress Tracking",
  description: "Track your fitness progress over time",
}

export default function ProgressPage() {
  return (
    <div className="container space-y-8 py-8">
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-8 lg:space-y-0">
        <div className="flex-1">
          <ProgressCheckIn />
        </div>
        <div className="flex-1">
          <ProgressHistory />
        </div>
      </div>
    </div>
  )
}