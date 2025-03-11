"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useProgress } from "@/hooks/use-progress"

const formSchema = z.object({
  check_in_date: z.date({
    required_error: "Please select a date for your check-in",
  }),
  weight: z.number({
    required_error: "Please enter your current weight",
  }).min(20).max(500),
  body_fat: z.number().min(1).max(50).optional(),
  measurements: z.object({
    chest: z.number().min(20).max(200).optional(),
    waist: z.number().min(20).max(200).optional(),
    hips: z.number().min(20).max(200).optional(),
    biceps: z.number().min(10).max(100).optional(),
    thighs: z.number().min(20).max(200).optional(),
  }).optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface ProgressCheckInProps {
  onComplete?: () => void
}

export function ProgressCheckIn({ onComplete }: ProgressCheckInProps) {
  const { createCheckin } = useProgress()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      check_in_date: new Date(),
      notes: "",
    },
  })

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      await createCheckin(values)
      form.reset()
      if (onComplete) {
        onComplete()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Check-In</CardTitle>
        <CardDescription>
          Record your current measurements to track your progress
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="check_in_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Check-in Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("2000-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Select the date for this check-in
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg/lbs)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Enter your current weight"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Your current body weight
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="body_fat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body Fat % (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Enter your body fat percentage"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Your current body fat percentage if known
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Body Measurements (optional)</h4>
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="measurements.chest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chest (cm/in)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Chest"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="measurements.waist"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waist (cm/in)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Waist"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="measurements.hips"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hips (cm/in)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Hips"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="measurements.biceps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biceps (cm/in)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Biceps"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="measurements.thighs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thighs (cm/in)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Thighs"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about your progress, how you're feeling, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Record any additional observations or comments
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Check-in"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
} 