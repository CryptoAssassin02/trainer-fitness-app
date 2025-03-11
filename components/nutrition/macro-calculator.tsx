// Create file: components/nutrition/macro-calculator.tsx

"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useUser } from "@clerk/nextjs"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNutrition } from "@/hooks/use-nutrition"

const macroFormSchema = z.object({
  weight: z.string().min(1, {
    message: "Please enter your weight.",
  }),
  height: z.string().min(1, {
    message: "Please enter your height.",
  }),
  age: z.string().min(1, {
    message: "Please enter your age.",
  }),
  gender: z.enum(["male", "female"], {
    required_error: "Please select your gender.",
  }),
  activityLevel: z.enum(["sedentary", "light", "moderate", "very", "extra"], {
    required_error: "Please select your activity level.",
  }),
  goal: z.enum(["lose", "maintain", "gain"], {
    required_error: "Please select your goal.",
  }),
})

type MacroFormValues = z.infer<typeof macroFormSchema>

const activityLevels = {
  sedentary: { name: "Sedentary", multiplier: 1.2 },
  light: { name: "Lightly Active", multiplier: 1.375 },
  moderate: { name: "Moderately Active", multiplier: 1.55 },
  very: { name: "Very Active", multiplier: 1.725 },
  extra: { name: "Extra Active", multiplier: 1.9 },
}

const goals = {
  lose: { name: "Lose Weight", calories: -500 },
  maintain: { name: "Maintain Weight", calories: 0 },
  gain: { name: "Gain Weight", calories: 500 },
}

export function MacroCalculator() {
  const [macros, setMacros] = useState<null | {
    calories: number
    protein: number
    carbs: number
    fat: number
    goal: string
    is_active: boolean
    user_id: string
  }>(null)
  
  const { createMacros } = useNutrition()
  const { user } = useUser()

  const form = useForm<MacroFormValues>({
    resolver: zodResolver(macroFormSchema),
    defaultValues: {
      weight: "",
      height: "",
      age: "",
      gender: "male",
      activityLevel: "moderate",
      goal: "maintain",
    },
  })

  function onSubmit(data: MacroFormValues) {
    if (!user) return
    
    // Convert string values to numbers
    const weight = parseFloat(data.weight)
    const height = parseFloat(data.height)
    const age = parseFloat(data.age)
    
    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr
    if (data.gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161
    }
    
    // Calculate TDEE (Total Daily Energy Expenditure)
    const tdee = bmr * activityLevels[data.activityLevel].multiplier
    
    // Adjust calories based on goal
    const calories = Math.round(tdee + goals[data.goal].calories)
    
    // Calculate macros
    // Protein: 1g per pound of body weight
    const protein = Math.round(weight)
    
    // Fat: 25% of calories
    const fat = Math.round((calories * 0.25) / 9)
    
    // Remaining calories from carbs
    const carbCalories = calories - (protein * 4 + fat * 9)
    const carbs = Math.round(carbCalories / 4)
    
    const macroData = {
      calories,
      protein,
      carbs,
      fat,
      goal: data.goal,
      is_active: true,
      user_id: user.id
    }
    
    setMacros(macroData)
  }
  
  const handleSaveMacros = () => {
    if (macros) {
      createMacros(macros)
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (lbs)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
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
                      className="flex gap-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="male" />
                        </FormControl>
                        <FormLabel className="font-normal">Male</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="female" />
                        </FormControl>
                        <FormLabel className="font-normal">Female</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="activityLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your activity level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(activityLevels).map(([key, { name }]) => (
                      <SelectItem key={key} value={key}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose the option that best matches your daily activity level
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="goal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Goal</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your goal" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(goals).map(([key, { name }]) => (
                      <SelectItem key={key} value={key}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  This will adjust your calorie target based on your goal
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">Calculate Macros</Button>
        </form>
      </Form>
      
      {macros && (
        <div className="space-y-4">
          <div className="rounded-md border p-4">
            <h3 className="font-medium mb-2">Your Recommended Macros</h3>
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span>Daily Calories:</span>
                <span className="font-medium">{macros.calories} kcal</span>
              </div>
              <div className="flex justify-between">
                <span>Protein:</span>
                <span className="font-medium">{macros.protein}g</span>
              </div>
              <div className="flex justify-between">
                <span>Carbohydrates:</span>
                <span className="font-medium">{macros.carbs}g</span>
              </div>
              <div className="flex justify-between">
                <span>Fat:</span>
                <span className="font-medium">{macros.fat}g</span>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleSaveMacros} 
            className="w-full"
          >
            Save Macro Goals
          </Button>
        </div>
      )}
    </div>
  )
}