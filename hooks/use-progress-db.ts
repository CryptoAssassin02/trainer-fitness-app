import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface CheckInData {
  weight: number
  body_fat?: number
  chest?: number
  waist?: number
  arms?: number
  legs?: number
  notes?: string
}

interface ProgressEntry extends CheckInData {
  id: string
  created_at: string
  unit_system: 'imperial' | 'metric'
}

export function useSubmitCheckIn() {
  const supabase = createClient()

  return useMutation({
    mutationFn: async (data: CheckInData) => {
      const { error } = await supabase
        .from("check_ins")
        .insert([
          {
            user_id: (await supabase.auth.getUser()).data.user?.id,
            ...data,
            created_at: new Date().toISOString(),
            unit_system: 'imperial', // Default to imperial for now
          },
        ])

      if (error) throw error
    },
    onSuccess: () => {
      toast({
        title: "Check-in recorded",
        description: "Your progress has been saved successfully.",
      })
    },
    onError: (error) => {
      console.error("Error submitting check-in:", error)
      toast({
        title: "Error",
        description: "Failed to save your check-in. Please try again.",
        variant: "destructive",
      })
    },
  })
}

export function useProgressMetrics() {
  const supabase = createClient()

  return useQuery({
    queryKey: ["progress-metrics"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("check_ins")
        .select("created_at, weight, body_fat, chest, waist, arms, legs")
        .eq("user_id", user.user.id)
        .order("created_at", { ascending: true })

      if (error) throw error

      // Transform the data for the chart
      return data.map(checkIn => ({
        date: new Date(checkIn.created_at).toLocaleDateString("en-US", { 
          month: "short", 
          day: "numeric" 
        }),
        weight: checkIn.weight,
        bodyFat: checkIn.body_fat,
        chest: checkIn.chest,
        waist: checkIn.waist,
        arms: checkIn.arms,
        legs: checkIn.legs,
      }))
    },
  })
}

export function useProgressHistory() {
  const supabase = createClient()

  return useQuery({
    queryKey: ["progress-history"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("check_ins")
        .select("*")
        .eq("user_id", user.user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      return data as ProgressEntry[]
    },
  })
}

export function useDeleteCheckIn() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (checkInId: string) => {
      const { error } = await supabase
        .from("check_ins")
        .delete()
        .eq("id", checkInId)
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)

      if (error) throw error
    },
    onSuccess: () => {
      // Invalidate both queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["progress-history"] })
      queryClient.invalidateQueries({ queryKey: ["progress-metrics"] })
      
      toast({
        title: "Check-in deleted",
        description: "The check-in has been deleted successfully.",
      })
    },
    onError: (error) => {
      console.error("Error deleting check-in:", error)
      toast({
        title: "Error",
        description: "Failed to delete the check-in. Please try again.",
        variant: "destructive",
      })
    },
  })
} 