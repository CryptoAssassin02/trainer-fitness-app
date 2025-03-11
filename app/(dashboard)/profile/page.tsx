// Create file: app/(dashboard)/profile/page.tsx

"use client"

import { useState, useEffect } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"
import { useProfile } from "@/hooks/use-profile"

// Define the profile data type to match Supabase schema
interface ProfileData {
  first_name: string
  last_name: string
  bio?: string
  height: number
  weight: number
  age: number
  gender: string
  unit_system: "imperial" | "metric"
}

const profileFormSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  bio: z.string().max(160).optional(),
  height: z.string().min(1, {
    message: "Please enter your height.",
  }),
  weight: z.string().min(1, {
    message: "Please enter your weight.",
  }),
  age: z.string().min(1, {
    message: "Please enter your age.",
  }),
  gender: z.string({
    required_error: "Please select a gender.",
  }),
  units: z.enum(["imperial", "metric"], {
    required_error: "Please select a unit system.",
  }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ProfilePage() {
  const { user } = useUser()
  const { profile, isLoading, updateProfile, initializeProfile } = useProfile()

  const defaultValues: Partial<ProfileFormValues> = {
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.emailAddresses[0]?.emailAddress || "",
    units: "imperial",
    gender: "male",
  }

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (user?.id) {
      initializeProfile()
    }
  }, [user?.id, initializeProfile])

  useEffect(() => {
    if (profile) {
      form.reset({
        firstName: profile.first_name || user?.firstName || "",
        lastName: profile.last_name || user?.lastName || "",
        email: user?.emailAddresses[0]?.emailAddress || "",
        bio: profile.bio || "",
        height: profile.height?.toString() || "",
        weight: profile.weight?.toString() || "",
        age: profile.age?.toString() || "",
        gender: profile.gender || "male",
        units: profile.unit_system as "imperial" | "metric" || "imperial",
      })
    }
  }, [profile, user, form])

  function onSubmit(data: ProfileFormValues) {
    const profileData: ProfileData = {
      first_name: data.firstName,
      last_name: data.lastName,
      bio: data.bio,
      height: parseFloat(data.height),
      weight: parseFloat(data.weight),
      age: parseInt(data.age),
      gender: data.gender,
      unit_system: data.units,
    }

    updateProfile(profileData)
  }

  if (isLoading) {
    return <div>Loading profile...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          Manage your profile information and preferences.
        </p>
      </div>
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>
                Update your personal information and bio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                        <FormDescription>
                          Your email is managed by Clerk authentication.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us a bit about yourself"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          You can write a short bio about yourself. This will be visible on your profile.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">
                    Update Profile
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fitness Information</CardTitle>
              <CardDescription>
                Update your fitness metrics and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.01" />
                          </FormControl>
                          <FormDescription>
                            {form.watch("units") === "imperial" ? "In inches" : "In centimeters"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.1" />
                          </FormControl>
                          <FormDescription>
                            {form.watch("units") === "imperial" ? "In pounds" : "In kilograms"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="male" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Male
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="female" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Female
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="other" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Other
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="units"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit System</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your preferred unit system" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="imperial">Imperial (lbs, inches)</SelectItem>
                            <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose your preferred unit system for measurements.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">
                    Update Preferences
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}