// Create file: components/dashboard/upcoming-workouts.tsx

"use client"

import { CalendarIcon } from "lucide-react"
import { format, addDays } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useWorkoutPlans } from "@/hooks/use-workout-plans"
import { Database } from "@/types/database.types"

type WorkoutDay = Database['public']['Tables']['workout_days']['Row'];

export function UpcomingWorkouts() {
  const { workoutPlans, isLoading } = useWorkoutPlans()
  const activePlan = workoutPlans?.find(plan => plan.is_active)
  
  if (isLoading) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center">
        <CalendarIcon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!activePlan) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center">
        <p className="text-sm text-muted-foreground">No active workout plan</p>
      </div>
    )
  }

  // Get the next 7 days of workouts
  const today = new Date()
  const nextWeek = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i)
    const dayOfWeek = format(date, 'EEEE').toLowerCase()
    const workout = activePlan.workout_days.find((day: WorkoutDay) => day.day_of_week.toLowerCase() === dayOfWeek)
    
    return {
      date: format(date, 'MMM d, yyyy'),
      workout,
    }
  })

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Workout</TableHead>
              <TableHead>Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nextWeek.map(({ date, workout }) => (
              <TableRow key={date}>
                <TableCell>{date}</TableCell>
                <TableCell>
                  {workout ? (
                    workout.is_rest_day ? (
                      <span className="text-muted-foreground">Rest Day</span>
                    ) : (
                      workout.workout_type
                    )
                  ) : (
                    <span className="text-muted-foreground">No workout scheduled</span>
                  )}
                </TableCell>
                <TableCell>
                  {workout && !workout.is_rest_day ? `${workout.duration} min` : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

const upcomingWorkouts = [
  {
    id: "1",
    date: "April 3, 2025",
    name: "Full Body",
    duration: "60 min",
  },
  {
    id: "2",
    date: "April 4, 2025",
    name: "HIIT Session",
    duration: "30 min",
  },
  {
    id: "3",
    date: "April 6, 2025",
    name: "Upper Body",
    duration: "45 min",
  },
  {
    id: "4",
    date: "April 7, 2025",
    name: "Cardio & Core",
    duration: "40 min",
  },
]