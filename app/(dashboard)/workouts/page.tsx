"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkoutCard } from "@/components/workouts/workout-card"
import { useWorkoutPlans } from "@/hooks/use-workout-plans"
import { Database } from "@/types/database.types"
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

type WorkoutPlan = Database['public']['Tables']['workout_plans']['Row'] & {
  workout_days: Database['public']['Tables']['workout_days']['Row'][];
};

type WorkoutDay = Database['public']['Tables']['workout_days']['Row'];

export default function WorkoutsPage() {
  const { workoutPlans, isLoading, deleteWorkoutPlan } = useWorkoutPlans()
  
  if (isLoading) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  const activeWorkoutPlan = workoutPlans?.find((plan) => plan.is_active)
  const historicalWorkoutPlans = workoutPlans?.filter((plan) => !plan.is_active) || []
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Current Workout Plan</h2>
        <Separator className="my-4" />
        {activeWorkoutPlan ? (
          <Card>
            <CardHeader>
              <CardTitle>{activeWorkoutPlan.title}</CardTitle>
              <CardDescription>
                {activeWorkoutPlan.goal} | {activeWorkoutPlan.experience_level} | {activeWorkoutPlan.days_per_week} days/week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Equipment Needed:</h4>
                  <p className="text-sm text-muted-foreground">{activeWorkoutPlan.equipment}</p>
                </div>
                <div>
                  <h4 className="font-medium">Workout Days:</h4>
                  <div className="mt-2 grid gap-2">
                    {activeWorkoutPlan.workout_days.map((day: WorkoutDay) => (
                      <div key={day.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium">{day.day_of_week}</p>
                          <p className="text-sm text-muted-foreground">
                            {day.workout_type} | {day.duration} | {day.intensity}
                          </p>
                        </div>
                        {day.is_rest_day && (
                          <span className="rounded-full bg-secondary px-2 py-1 text-xs">Rest Day</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="destructive"
                onClick={() => {
                  if (activeWorkoutPlan.id) {
                    deleteWorkoutPlan(activeWorkoutPlan.id)
                  }
                }}
              >
                Delete Plan
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Active Workout Plan</CardTitle>
              <CardDescription>Generate a new workout plan to get started</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      {historicalWorkoutPlans.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold">Previous Workout Plans</h2>
          <Separator className="my-4" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {historicalWorkoutPlans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <CardTitle>{plan.title}</CardTitle>
                  <CardDescription>
                    {plan.goal} | {plan.experience_level} | {plan.days_per_week} days/week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <h4 className="font-medium">Equipment Needed:</h4>
                    <p className="text-sm text-muted-foreground">{plan.equipment}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (plan.id) {
                        deleteWorkoutPlan(plan.id)
                      }
                    }}
                  >
                    Delete Plan
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}