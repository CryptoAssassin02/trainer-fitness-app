import { z } from 'zod'

// Base schema for common fields
const baseSchema = {
  user_id: z.string(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
}

// Workout plan schema
export const workoutPlanSchema = z.object({
  ...baseSchema,
  name: z.string().min(1),
  description: z.string().optional(),
  exercises: z.array(z.object({
    name: z.string(),
    sets: z.number().int().min(1),
    reps: z.number().int().min(1),
    weight: z.number().optional(),
    notes: z.string().optional(),
  })),
  schedule: z.array(z.string()).optional(),
})

// Progress history schema
export const progressHistorySchema = z.object({
  ...baseSchema,
  check_in_date: z.string().datetime(),
  weight: z.number().optional(),
  body_fat: z.number().optional(),
  measurements: z.record(z.string(), z.number()).optional(),
  notes: z.string().optional(),
})

// Macro goals schema
export const macroGoalsSchema = z.object({
  ...baseSchema,
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
  target_date: z.string().datetime().optional(),
})

// Combined import data schema
export const importDataSchema = z.object({
  workouts: z.array(workoutPlanSchema).optional(),
  progress: z.array(progressHistorySchema).optional(),
  nutrition: z.array(macroGoalsSchema).optional(),
})

export type ImportData = z.infer<typeof importDataSchema>
export type WorkoutPlan = z.infer<typeof workoutPlanSchema>
export type ProgressHistory = z.infer<typeof progressHistorySchema>
export type MacroGoals = z.infer<typeof macroGoalsSchema> 