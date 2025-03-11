// Create file: components/dashboard/overview.tsx

"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useWorkoutPlans } from "@/hooks/use-workout-plans"
import { format, startOfWeek, addDays } from "date-fns"
import { Database } from "@/types/database.types"

type WorkoutDay = Database['public']['Tables']['workout_days']['Row']
type WorkoutPlan = Database['public']['Tables']['workout_plans']['Row'] & {
  workout_days: WorkoutDay[]
}

export function Overview() {
  const { workoutPlans, isLoading } = useWorkoutPlans()
  const activePlan = workoutPlans?.find(plan => plan.is_active)
  
  if (isLoading) {
    return <div>Loading workout overview...</div>
  }
  
  if (!activePlan || !activePlan.workout_days) {
    return (
      <div className="text-sm text-muted-foreground">
        No active workout plan. Generate a plan to see your weekly overview.
      </div>
    )
  }
  
  // Create a map of workout days for easy lookup
  const workoutMap = new Map<string, WorkoutDay>(
    activePlan.workout_days.map((day: WorkoutDay) => [day.day_of_week.toLowerCase(), day])
  )
  
  // Get the start of the current week
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }) // Start on Monday
  
  // Create data for each day of the week
  const data = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i)
    const dayName = format(date, "EEE").toLowerCase()
    const workout = workoutMap.get(dayName)
    
    return {
      name: format(date, "EEE"),
      total: workout && !workout.is_rest_day ? workout.duration : 0,
    }
  })
  
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}m`}
        />
        <Bar dataKey="total" fill="#3B82F6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}