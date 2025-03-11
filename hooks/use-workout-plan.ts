// Create file: hooks/use-workout-plan.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"

type WorkoutPlanFormValues = {
  goal: string
  experience: string
  daysPerWeek: number
  duration: number
  equipment: string
  preferences?: string
  injuries?: string
  includeCardio: boolean
  includeMobility: boolean
}

export function useGenerateWorkoutPlan() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (formData: WorkoutPlanFormValues) => {
      const response = await fetch("/api/workout/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        throw new Error("Failed to generate workout plan")
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] })
      toast({
        title: "Workout plan generated",
        description: "Your personalized workout plan is ready.",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate workout plan. Please try again.",
        variant: "destructive",
      })
    },
  })
}

export function useCurrentWorkoutPlan() {
  return useQuery({
    queryKey: ["workouts", "current"],
    queryFn: async () => {
      const response = await fetch("/api/workout/current")
      if (!response.ok) {
        throw new Error("Failed to fetch current workout plan")
      }
      return response.json()
    },
  })
}