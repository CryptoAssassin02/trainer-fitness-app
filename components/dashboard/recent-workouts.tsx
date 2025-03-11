// Create file: components/dashboard/recent-workouts.tsx

"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useWorkoutPlans } from "@/hooks/use-workout-plans"
import { format, subDays } from "date-fns"
import { Database } from "@/types/database.types"

type WorkoutDay = Database['public']['Tables']['workout_days']['Row']
type WorkoutPlan = Database['public']['Tables']['workout_plans']['Row'] & {
  workout_days: WorkoutDay[]
}

interface RecentWorkout {
  id: string
  name: string
  date: string
  duration: string
  intensity: string
  icon: string
}

export function RecentWorkouts() {
  const { workoutPlans, isLoading } = useWorkoutPlans()
  
  if (isLoading) {
    return <div>Loading recent workouts...</div>
  }
  
  if (!workoutPlans?.length) {
    return (
      <div className="text-sm text-muted-foreground">
        No workout history yet. Complete some workouts to see them here.
      </div>
    )
  }
  
  // Get the most recent workout days from all plans
  const today = new Date()
  const recentWorkouts: RecentWorkout[] = workoutPlans
    .flatMap(plan => plan.workout_days || [])
    .filter((day: WorkoutDay) => !day.is_rest_day)
    .slice(0, 4)
    .map((workout: WorkoutDay, index: number) => ({
      id: workout.id,
      name: workout.workout_type,
      date: format(subDays(today, index + 1), "MMMM d, yyyy"),
      duration: `${workout.duration} min`,
      intensity: workout.intensity,
      icon: getWorkoutIcon(workout.workout_type), // Add icons based on workout type
    }))
  
  return (
    <div className="space-y-8">
      {recentWorkouts.map((workout) => (
        <div key={workout.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={workout.icon} alt="Workout" />
            <AvatarFallback>{workout.name[0]}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{workout.name}</p>
            <p className="text-sm text-muted-foreground">
              {workout.date} · {workout.duration}
            </p>
          </div>
          <div className="ml-auto font-medium">
            {workout.intensity}
          </div>
        </div>
      ))}
    </div>
  )
}

// Helper function to get workout icons
function getWorkoutIcon(workoutType: string): string {
  const icons: Record<string, string> = {
    "Upper Body": "/icons/upper-body.svg",
    "Lower Body": "/icons/lower-body.svg",
    "Full Body": "/icons/full-body.svg",
    "Core": "/icons/core.svg",
    "Cardio": "/icons/cardio.svg",
    "HIIT": "/icons/hiit.svg",
    "Yoga": "/icons/yoga.svg",
    "Recovery": "/icons/recovery.svg",
  }
  
  return icons[workoutType] || ""
}

const recentWorkouts = [
  {
    id: "1",
    name: "Upper Body",
    date: "April 2, 2025",
    duration: "45 min",
    intensity: "High",
    icon: "",
  },
  {
    id: "2",
    name: "Core & Cardio",
    date: "April 1, 2025",
    duration: "30 min",
    intensity: "Medium",
    icon: "",
  },
  {
    id: "3",
    name: "Leg Day",
    date: "March 30, 2025",
    duration: "60 min",
    intensity: "High",
    icon: "",
  },
  {
    id: "4",
    name: "Recovery",
    date: "March 29, 2025",
    duration: "25 min",
    intensity: "Low",
    icon: "",
  },
]