// Create file: components/settings/notification-settings.tsx

"use client"

import * as React from "react"
import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
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
import { Switch } from "@/components/ui/switch"
import { useNotifications } from "@/hooks/use-notifications"

const notificationFormSchema = z.object({
  emailWorkout: z.boolean(),
  emailProgress: z.boolean(),
  emailNutrition: z.boolean(),
  pushWorkout: z.boolean(),
  pushProgress: z.boolean(),
  pushNutrition: z.boolean(),
  smsWorkout: z.boolean(),
  smsProgress: z.boolean(),
  smsNutrition: z.boolean(),
})

type NotificationFormValues = z.infer<typeof notificationFormSchema>

export function NotificationSettings() {
  const { preferences, isLoading, updatePreferences, ensurePreferencesExist } = useNotifications()
  
  // Ensure preferences exist when component mounts
  useEffect(() => {
    ensurePreferencesExist()
  }, [ensurePreferencesExist])
  
  // Default values for the form
  const defaultValues: Partial<NotificationFormValues> = {
    emailWorkout: true,
    emailProgress: true,
    emailNutrition: false,
    pushWorkout: true,
    pushProgress: false,
    pushNutrition: false,
    smsWorkout: false,
    smsProgress: false,
    smsNutrition: false,
  }

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues,
  })
  
  // Update form when preferences are loaded
  useEffect(() => {
    if (preferences) {
      form.reset({
        emailWorkout: preferences.email_workout,
        emailProgress: preferences.email_progress,
        emailNutrition: preferences.email_nutrition,
        pushWorkout: preferences.push_workout,
        pushProgress: preferences.push_progress,
        pushNutrition: preferences.push_nutrition,
        smsWorkout: preferences.sms_workout,
        smsProgress: preferences.sms_progress,
        smsNutrition: preferences.sms_nutrition,
      })
    }
  }, [preferences, form])

  function onSubmit(data: NotificationFormValues) {
    // Map form values to database fields
    const preferencesData = {
      email_workout: data.emailWorkout,
      email_progress: data.emailProgress,
      email_nutrition: data.emailNutrition,
      push_workout: data.pushWorkout,
      push_progress: data.pushProgress,
      push_nutrition: data.pushNutrition,
      sms_workout: data.smsWorkout,
      sms_progress: data.smsProgress,
      sms_nutrition: data.smsNutrition,
    }

    // Update preferences in database
    updatePreferences(preferencesData)
  }
  
  if (isLoading) {
    return <div>Loading notification preferences...</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Email Notifications</h3>
            <p className="text-sm text-muted-foreground">
              Configure how you receive email notifications.
            </p>
          </div>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="emailWorkout"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Workout Reminders</FormLabel>
                    <FormDescription>
                      Receive emails about your upcoming workouts and training schedule.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emailProgress"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Progress Updates</FormLabel>
                    <FormDescription>
                      Get notified about your fitness progress and achievements.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emailNutrition"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Nutrition Reports</FormLabel>
                    <FormDescription>
                      Receive weekly summaries of your nutrition and macro tracking.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Push Notifications</h3>
            <p className="text-sm text-muted-foreground">
              Configure your in-app notification preferences.
            </p>
          </div>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="pushWorkout"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Workout Alerts</FormLabel>
                    <FormDescription>
                      Get push notifications for workout reminders and updates.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pushProgress"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Progress Notifications</FormLabel>
                    <FormDescription>
                      Receive push notifications about your progress milestones.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pushNutrition"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Nutrition Alerts</FormLabel>
                    <FormDescription>
                      Get push notifications for nutrition tracking and reminders.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">SMS Notifications</h3>
            <p className="text-sm text-muted-foreground">
              Configure your SMS notification preferences.
            </p>
          </div>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="smsWorkout"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Workout SMS</FormLabel>
                    <FormDescription>
                      Receive SMS notifications for workout reminders.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="smsProgress"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Progress SMS</FormLabel>
                    <FormDescription>
                      Get SMS updates about your progress milestones.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="smsNutrition"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Nutrition SMS</FormLabel>
                    <FormDescription>
                      Receive SMS notifications for nutrition tracking.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  )
}