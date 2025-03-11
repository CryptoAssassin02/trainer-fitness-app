// Create file: components/progress/check-in-form.tsx

"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useProgress } from "@/hooks/use-progress"
import { useUser } from "@clerk/nextjs"
import { Database } from "@/types/database.types"

type ProgressCheckinInsert = Database['public']['Tables']['progress_checkins']['Insert']

const checkInFormSchema = z.object({
  weight: z.string().min(1, {
    message: "Please enter your current weight.",
  }),
  bodyFat: z.string().optional(),
  chest: z.string().optional(),
  waist: z.string().optional(),
  arms: z.string().optional(),
  legs: z.string().optional(),
  notes: z.string().max(500).optional(),
})

type CheckInFormValues = z.infer<typeof checkInFormSchema>

export function CheckInForm() {
  const { user } = useUser()
  const { createProgressCheckin } = useProgress()

  // Default values for the form
  const defaultValues: Partial<CheckInFormValues> = {
    weight: "",
    bodyFat: "",
    chest: "",
    waist: "",
    arms: "",
    legs: "",
    notes: "",
  }

  const form = useForm<CheckInFormValues>({
    resolver: zodResolver(checkInFormSchema),
    defaultValues,
  })

  function onSubmit(data: CheckInFormValues) {
    if (!user?.id) return

    // Convert string values to numbers
    const checkInData: ProgressCheckinInsert = {
      user_id: user.id,
      weight: parseFloat(data.weight),
      body_fat: data.bodyFat ? parseFloat(data.bodyFat) : null,
      chest: data.chest ? parseFloat(data.chest) : null,
      waist: data.waist ? parseFloat(data.waist) : null,
      arms: data.arms ? parseFloat(data.arms) : null,
      legs: data.legs ? parseFloat(data.legs) : null,
      notes: data.notes || null
    }

    // Submit check-in to database
    createProgressCheckin(checkInData, {
      onSuccess: () => {
        form.reset(defaultValues)
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (lbs)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="0.0" />
                </FormControl>
                <FormDescription>
                  Your current weight in pounds
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="bodyFat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body Fat %</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="0.0" />
                </FormControl>
                <FormDescription>
                  Your estimated body fat percentage
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <FormField
            control={form.control}
            name="chest"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chest (in)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="0.0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="waist"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Waist (in)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="0.0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="arms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Arms (in)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="0.0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="legs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Legs (in)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="0.0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Progress Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add notes about your recent progress, challenges, wins, etc."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional notes about your progress
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit">
          Submit Check-in
        </Button>
      </form>
    </Form>
  )
}