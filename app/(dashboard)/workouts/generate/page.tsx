// Create file: app/(dashboard)/workouts/generate/page.tsx

"use client"

import { useState, useEffect } from "react"
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
import { 
  HelpCircle, 
  ChevronRight,
  Save
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Checkbox
} from "@/components/ui/checkbox"

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
  otherEquipment: z.string().optional(),
  preferences: z.string().optional(),
  injuries: z.string().optional(),
  includeCardio: z.boolean().default(true),
  cardioTypes: z.array(z.string()).optional(),
  cardioInWorkoutTime: z.string().optional(),
  cardioTiming: z.string().optional(),
  includeMobility: z.boolean().default(false),
  mobilityTypes: z.array(z.string()).optional(),
  mobilityInWorkoutTime: z.string().optional(),
  mobilityTiming: z.string().optional(),
  researchNotes: z.string().optional(),
})

// Storage key for form data
const STORAGE_KEY = "workout_form_data";

export default function GenerateWorkoutPage() {
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()
  const { mutate: generatePlan, isPending: isGenerating } = useGenerateWorkoutPlan()
  const { createWorkoutPlan: savePlan, isLoading: isSaving } = useWorkoutPlans()
  const [researchResults, setResearchResults] = useState("")
  const [activeTab, setActiveTab] = useState("basic")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [formLoaded, setFormLoaded] = useState(false) // Track if form data has been loaded

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      daysPerWeek: 4,
      duration: 45,
      includeCardio: true,
      includeMobility: false,
      researchNotes: "",
      cardioTypes: [],
      mobilityTypes: [],
    },
  })

  const watchEquipment = form.watch("equipment");
  const watchIncludeCardio = form.watch("includeCardio");
  const watchIncludeMobility = form.watch("includeMobility");

  // Load saved form data on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && user?.id) {
      try {
        const savedData = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          
          // Reset the form with saved data
          form.reset(parsedData);
          
          // Set research results if they exist
          if (parsedData.researchNotes) {
            setResearchResults(parsedData.researchNotes);
          }
          
          console.log("Loaded saved form data:", parsedData);
          setFormLoaded(true);
        }
      } catch (error) {
        console.error("Error parsing saved form data:", error);
      }
    }
  }, [user?.id, form]);

  // Watch for form changes and mark as unsaved
  useEffect(() => {
    if (!formLoaded) return; // Don't mark as unsaved until initial load is complete
    
    const subscription = form.watch(() => {
      setHasUnsavedChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [form, formLoaded]);
  
  // Function to save form data to localStorage
  const saveFormData = () => {
    if (typeof window !== 'undefined' && user?.id) {
      try {
        const formData = form.getValues();
        const dataToSave = {
          ...formData,
          researchNotes: researchResults || formData.researchNotes
        };
        
        localStorage.setItem(
          `${STORAGE_KEY}_${user.id}`,
          JSON.stringify(dataToSave)
        );
        
        console.log("Saved form data to localStorage:", dataToSave);
        setHasUnsavedChanges(false);
        toast({
          title: "Progress saved",
          description: "Your workout plan inputs have been saved.",
        });
      } catch (error) {
        console.error("Error saving form data:", error);
        toast({
          title: "Error saving progress",
          description: "There was an error saving your workout plan inputs.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Unable to save",
        description: "You must be logged in to save your workout plan inputs.",
        variant: "destructive",
      });
    }
  };

  const handleResearchComplete = (research: string) => {
    setResearchResults(research)
    form.setValue("researchNotes", research)
    setHasUnsavedChanges(true);
    
    // Also save to localStorage when research is completed
    if (typeof window !== 'undefined' && user?.id) {
      try {
        const formData = form.getValues();
        localStorage.setItem(
          `${STORAGE_KEY}_${user.id}`,
          JSON.stringify({
            ...formData,
            researchNotes: research
          })
        );
      } catch (error) {
        console.error("Error saving research data:", error);
      }
    }
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

    // Add other equipment details if the "other" option was selected
    let equipmentValue = values.equipment;
    if (values.equipment === "other" && values.otherEquipment) {
      equipmentValue = `Other: ${values.otherEquipment}`;
    }

    // Build complete preferences string with cardio and mobility preferences
    let preferencesComplete = values.preferences || "";
    
    if (values.includeCardio && values.cardioTypes && values.cardioTypes.length > 0) {
      preferencesComplete += `\n\nCardio Preferences: 
      - Types: ${values.cardioTypes.join(", ")}
      - Included in workout time: ${values.cardioInWorkoutTime || "Yes"}
      - Timing: ${values.cardioTiming || "During workout days"}`;
    }

    if (values.includeMobility && values.mobilityTypes && values.mobilityTypes.length > 0) {
      preferencesComplete += `\n\nMobility Preferences: 
      - Types: ${values.mobilityTypes.join(", ")}
      - Included in workout time: ${values.mobilityInWorkoutTime || "Yes"}
      - Timing: ${values.mobilityTiming || "During workout days"}`;
    }

    // Add any research notes
    if (values.researchNotes) {
      preferencesComplete += `\n\nResearch Notes: ${values.researchNotes}`;
    }

    generatePlan({
      ...values,
      equipment: equipmentValue,
      preferences: preferencesComplete
    }, {
      onSuccess: (data) => {
        // Save the generated plan to the database
        savePlan({
          user_id: user.id,
          title: `${values.goal} Plan - ${new Date().toLocaleDateString()}`,
          goal: values.goal,
          experience_level: values.experience,
          equipment: equipmentValue,
          days_per_week: values.daysPerWeek,
          duration: values.duration,
          preferences: preferencesComplete,
          injuries: values.injuries,
          include_cardio: values.includeCardio,
          include_mobility: values.includeMobility,
          plan_content: data.plan,
          is_active: true
        }, {
          onSuccess: () => {
            // Clear saved form data after successful plan creation
            try {
              if (typeof window !== 'undefined' && user?.id) {
                localStorage.removeItem(`${STORAGE_KEY}_${user.id}`);
                console.log("Cleared saved form data after successful plan creation");
              }
              router.push("/workouts");
            } catch (error) {
              console.error("Error clearing saved form data:", error);
              // Still redirect even if clearing fails
              router.push("/workouts");
            }
          },
          onError: (error) => {
            console.error("Error saving workout plan:", error);
            toast({
              title: "Error saving plan",
              description: "There was an error saving your workout plan. Your form data has been preserved.",
              variant: "destructive",
            });
          }
        })
      },
      onError: (error) => {
        toast({
          title: "Error generating plan",
          description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
                              <SelectItem value="recomp">Body Recomposition</SelectItem>
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
                          <div className="flex items-center space-x-2">
                            <FormLabel>Experience Level</FormLabel>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-sm" side="right">
                                  <p><strong>Beginner:</strong> New to fitness or returning after a long break. Little to no experience with exercises.</p>
                                  <p><strong>Intermediate:</strong> 6+ months of consistent training. Familiar with most exercises and basic programming.</p>
                                  <p><strong>Advanced:</strong> 2+ years of consistent training. Strong technical knowledge and understanding of programming principles.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
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
                            <SelectItem value="other">Other Equipment</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          What equipment you have access to
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {watchEquipment === "other" && (
                    <FormField
                      control={form.control}
                      name="otherEquipment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Describe Your Equipment</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Please describe the equipment you have available..." 
                              maxLength={200}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Please keep your description brief and concise (max 200 characters)
                            <div className="text-xs text-right mt-1">
                              {field.value?.length || 0}/200 characters
                            </div>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={saveFormData}
                    disabled={!hasUnsavedChanges}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Progress
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveTab("advanced")}
                  >
                    Add Advanced Options <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
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
                  
                  {watchIncludeCardio && (
                    <div className="rounded-lg border p-4 space-y-4">
                      <h3 className="font-medium">Cardio Preferences</h3>
                      
                      <FormField
                        control={form.control}
                        name="cardioTypes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Types of Cardio</FormLabel>
                            <div className="grid grid-cols-2 gap-2">
                              {["Running", "Walking", "Cycling", "Swimming", "Rowing", "HIIT", "Jump Rope", "Stair Climbing"].map((type) => (
                                <FormItem key={type} className="flex items-center space-x-2">
                                  <FormControl>
                                    <Checkbox 
                                      checked={field.value?.includes(type) || false}
                                      onCheckedChange={(checked) => {
                                        const currentValues = field.value || [];
                                        if (checked) {
                                          field.onChange([...currentValues, type]);
                                        } else {
                                          field.onChange(currentValues.filter(value => value !== type));
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{type}</FormLabel>
                                </FormItem>
                              ))}
                            </div>
                            <FormDescription>
                              Select all cardio types you prefer or enjoy
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="cardioInWorkoutTime"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center space-x-2">
                              <FormLabel>Include in Workout Duration Time?</FormLabel>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-sm" side="right">
                                    <p>Yes: The time for both resistance training and cardio fits within your selected workout duration.</p>
                                    <p>No: Resistance training takes up your full workout duration and cardio is done separately.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <Select onValueChange={field.onChange} defaultValue={field.value || "yes"}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="cardioTiming"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cardio Timing</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || "workout_days"}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="workout_days">On workout days</SelectItem>
                                <SelectItem value="rest_days">On rest days</SelectItem>
                                <SelectItem value="mixed">Mix of both</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              When you'd prefer to do your cardio workouts
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  
                  {watchIncludeMobility && (
                    <div className="rounded-lg border p-4 space-y-4">
                      <h3 className="font-medium">Mobility & Flexibility Preferences</h3>
                      
                      <FormField
                        control={form.control}
                        name="mobilityTypes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Types of Mobility/Flexibility Work</FormLabel>
                            <div className="grid grid-cols-2 gap-2">
                              {["Stretching", "Yoga", "Foam Rolling", "Dynamic Warmups", "Joint Mobility", "Functional Movement", "Active Recovery", "Pilates"].map((type) => (
                                <FormItem key={type} className="flex items-center space-x-2">
                                  <FormControl>
                                    <Checkbox 
                                      checked={field.value?.includes(type) || false}
                                      onCheckedChange={(checked) => {
                                        const currentValues = field.value || [];
                                        if (checked) {
                                          field.onChange([...currentValues, type]);
                                        } else {
                                          field.onChange(currentValues.filter(value => value !== type));
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{type}</FormLabel>
                                </FormItem>
                              ))}
                            </div>
                            <FormDescription>
                              Select all mobility/flexibility types you prefer
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="mobilityInWorkoutTime"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center space-x-2">
                              <FormLabel>Include in Workout Duration Time?</FormLabel>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-sm" side="right">
                                    <p>Yes: The time for both resistance training and mobility work fits within your selected workout duration.</p>
                                    <p>No: Resistance training takes up your full workout duration and mobility work is done separately.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <Select onValueChange={field.onChange} defaultValue={field.value || "yes"}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="mobilityTiming"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mobility Timing</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || "workout_days"}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="workout_days">On workout days</SelectItem>
                                <SelectItem value="rest_days">On rest days</SelectItem>
                                <SelectItem value="mixed">Mix of both</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              When you'd prefer to do your mobility work
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  
                  <div className="rounded-lg border p-4 bg-muted/20">
                    <p className="text-sm">
                      You can now generate your workout plan, or use the Exercise Research tab to find science-backed exercises 
                      tailored to your preferences.
                    </p>
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
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={saveFormData}
                    disabled={!hasUnsavedChanges}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Progress
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="default"
                      onClick={() => setActiveTab("research")}
                    >
                      Add Exercise Research <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                    
                    <Button
                      type="submit"
                      disabled={isGenerating || isSaving}
                    >
                      {isGenerating || isSaving ? 'Generating...' : 'Generate Workout Plan'}
                    </Button>
                  </div>
                </CardFooter>
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
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={saveFormData}
                    disabled={!hasUnsavedChanges}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Progress
                  </Button>
                  <Button
                    type="submit"
                    disabled={isGenerating || isSaving}
                  >
                    {isGenerating || isSaving ? 'Generating...' : 'Generate Workout Plan'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isGenerating || isSaving}
                className={activeTab === "basic" || activeTab === "advanced" || activeTab === "research" ? "hidden" : ""}
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