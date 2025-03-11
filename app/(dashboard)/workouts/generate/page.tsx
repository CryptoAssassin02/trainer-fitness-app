// Create file: app/(dashboard)/workouts/generate/page.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { useGenerateWorkoutPlan } from "@/hooks/use-workout-plan"
import { useWorkoutPlans } from "@/hooks/use-workout-plans"
import { ExerciseResearch } from "@/components/workout/exercise-research"
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
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  goal: z.string({
    required_error: "Please select a fitness goal",
  }),
  experience: z.string({
    required_error: "Please select your experience level",
  }),
  daysPerWeek: z.number({
    required_error: "Please select how many days per week",
  }).min(1).max(7),
  duration: z.number({
    required_error: "Please select your preferred workout duration",
  }).min(15).max(120),
  equipment: z.string({
    required_error: "Please select available equipment",
  }),
  preferences: z.string().optional(),
  injuries: z.string().optional(),
  includeCardio: z.boolean().default(true),
  includeMobility: z.boolean().default(false),
  researchNotes: z.string().optional(),
})

export default function GenerateWorkoutPage() {
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()
  const { mutate: generatePlan, isPending: isGenerating } = useGenerateWorkoutPlan()
  const { createWorkoutPlan: savePlan, isLoading: isSaving } = useWorkoutPlans()
  const [researchResults, setResearchResults] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      daysPerWeek: 4,
      duration: 45,
      includeCardio: true,
      includeMobility: false,
      researchNotes: "",
    },
  })

  const handleResearchComplete = (research: string) => {
    setResearchResults(research)
    form.setValue("researchNotes", research)
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create a workout plan",
        variant: "destructive",
      })
      return
    }

    generatePlan({
      ...values,
      // Include any research notes from Perplexity AI
      preferences: values.preferences + (values.researchNotes ? `\n\nResearch Notes: ${values.researchNotes}` : "")
    }, {
      onSuccess: (data) => {
        // Save the generated plan to the database
        savePlan({
          user_id: user.id,
          title: `${values.goal} Plan - ${new Date().toLocaleDateString()}`,
          goal: values.goal,
          experience_level: values.experience,
          equipment: values.equipment,
          days_per_week: values.daysPerWeek,
          duration: values.duration,
          preferences: values.preferences,
          injuries: values.injuries,
          include_cardio: values.includeCardio,
          include_mobility: values.includeMobility,
          plan_content: data.plan,
          is_active: true
        }, {
          onSuccess: () => {
            router.push("/workouts")
          }
        })
      }
    })
  }

  // Generate a research query based on form values
  const generateResearchQuery = () => {
    const goal = form.watch("goal")
    const experience = form.watch("experience")
    const daysPerWeek = form.watch("daysPerWeek")
    const duration = form.watch("duration")
    const equipment = form.watch("equipment")
    const injuries = form.watch("injuries")
    
    return `Best exercises and training approaches for ${experience} level with ${goal} goal, training ${daysPerWeek} days per week for ${duration} minutes, using ${equipment} equipment${injuries ? `, with the following limitations: ${injuries}` : ""}.`
  }

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Generate Workout Plan</h2>
      </div>
      
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
          <TabsTrigger value="research">Exercise Research</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Provide the essential details to create your workout plan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="goal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fitness Goal</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your primary goal" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="strength">Build Strength</SelectItem>
                              <SelectItem value="muscle">Build Muscle</SelectItem>
                              <SelectItem value="endurance">Improve Endurance</SelectItem>
                              <SelectItem value="weightloss">Weight Loss</SelectItem>
                              <SelectItem value="general">General Fitness</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            What you want to achieve with your workout plan
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your experience level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Your current fitness and workout experience
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="daysPerWeek"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Days Per Week</FormLabel>
                        <FormControl>
                          <div className="space-y-1">
                            <Slider
                              min={1}
                              max={7}
                              step={1}
                              defaultValue={[field.value]}
                              onValueChange={(values) => field.onChange(values[0])}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                                <span key={day}>{day}</span>
                              ))}
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          How many days per week you want to workout
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workout Duration (minutes)</FormLabel>
                        <FormControl>
                          <div className="space-y-1">
                            <Slider
                              min={15}
                              max={120}
                              step={5}
                              defaultValue={[field.value]}
                              onValueChange={(values) => field.onChange(values[0])}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>15</span>
                              <span>30</span>
                              <span>45</span>
                              <span>60</span>
                              <span>75</span>
                              <span>90</span>
                              <span>105</span>
                              <span>120</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Target duration for each workout session
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="equipment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available Equipment</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select available equipment" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="full_gym">Full Gym</SelectItem>
                            <SelectItem value="home_basic">Basic Home Equipment</SelectItem>
                            <SelectItem value="bodyweight">Bodyweight Only</SelectItem>
                            <SelectItem value="resistance_bands">Resistance Bands</SelectItem>
                            <SelectItem value="dumbbells">Dumbbells Only</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          What equipment you have access to
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="advanced">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Options</CardTitle>
                  <CardDescription>
                    Fine-tune your workout plan with additional details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="preferences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exercise Preferences</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="E.g., I prefer compound exercises, I enjoy kettlebell workouts, etc."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Any specific exercises or workout styles you prefer
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="injuries"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Injuries/Limitations</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="E.g., Lower back issues, knee pain, shoulder mobility problems, etc."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Any injuries or physical limitations to consider
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="includeCardio"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Include Cardio</FormLabel>
                            <FormDescription>
                              Add cardiovascular exercises to your plan
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
                      name="includeMobility"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Include Mobility</FormLabel>
                            <FormDescription>
                              Add mobility and flexibility exercises
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
                  
                  <FormField
                    control={form.control}
                    name="researchNotes"
                    render={({ field }) => (
                      <FormItem className="hidden">
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="research">
              <Card>
                <CardHeader>
                  <CardTitle>Exercise Research</CardTitle>
                  <CardDescription>
                    Use Perplexity AI to research exercises and training approaches for your specific needs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const query = generateResearchQuery()
                      const researchComponent = document.getElementById('exercise-research')
                      if (researchComponent) {
                        const textarea = researchComponent.querySelector('textarea')
                        if (textarea) {
                          textarea.value = query
                          // Trigger a change event
                          const event = new Event('input', { bubbles: true })
                          textarea.dispatchEvent(event)
                        }
                      }
                    }}
                  >
                    Generate Research Query Based on Your Selections
                  </Button>
                  
                  <div id="exercise-research">
                    <ExerciseResearch 
                      onResearchComplete={handleResearchComplete}
                    />
                  </div>
                  
                  {researchResults && (
                    <div className="rounded-md border bg-muted/50 p-4">
                      <h3 className="mb-2 font-medium">Research will be included in your plan</h3>
                      <p className="text-sm text-muted-foreground">
                        The AI will use this research to create a more evidence-based and personalized workout plan for you.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isGenerating || isSaving}
              >
                {isGenerating || isSaving ? 'Generating...' : 'Generate Workout Plan'}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  )
}