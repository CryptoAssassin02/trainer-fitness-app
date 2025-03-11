import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Database } from '@/types/database.types';
import { createClient } from '@/utils/supabase/client';

type WorkoutDay = Database['public']['Tables']['workout_days']['Row'];
type WorkoutDayInsert = Database['public']['Tables']['workout_days']['Insert'];
type WorkoutDayUpdate = Database['public']['Tables']['workout_days']['Update'];

const supabase = createClient();

export const useWorkoutDays = (workoutPlanId: string) => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: workoutDays, isLoading } = useQuery({
    queryKey: ['workout-days', workoutPlanId],
    queryFn: async () => {
      if (!workoutPlanId) return [];

      const { data, error } = await supabase
        .from('workout_days')
        .select('*')
        .eq('workout_plan_id', workoutPlanId)
        .order('day_of_week');

      if (error) {
        toast.error('Failed to fetch workout days');
        throw error;
      }

      return data;
    },
    enabled: !!workoutPlanId,
  });

  const createWorkoutDay = useMutation({
    mutationFn: async (newDay: WorkoutDayInsert) => {
      const { data, error } = await supabase
        .from('workout_days')
        .insert([{ ...newDay, workout_plan_id: workoutPlanId }])
        .select()
        .single();

      if (error) {
        toast.error('Failed to create workout day');
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-days', workoutPlanId] });
      toast.success('Workout day created successfully');
    },
  });

  const updateWorkoutDay = useMutation({
    mutationFn: async ({ id, ...updates }: WorkoutDayUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('workout_days')
        .update(updates)
        .eq('id', id)
        .eq('workout_plan_id', workoutPlanId)
        .select()
        .single();

      if (error) {
        toast.error('Failed to update workout day');
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-days', workoutPlanId] });
      toast.success('Workout day updated successfully');
    },
  });

  const deleteWorkoutDay = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workout_days')
        .delete()
        .eq('id', id)
        .eq('workout_plan_id', workoutPlanId);

      if (error) {
        toast.error('Failed to delete workout day');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-days', workoutPlanId] });
      toast.success('Workout day deleted successfully');
    },
  });

  return {
    workoutDays,
    isLoading,
    createWorkoutDay: createWorkoutDay.mutate,
    updateWorkoutDay: updateWorkoutDay.mutate,
    deleteWorkoutDay: deleteWorkoutDay.mutate,
  };
}; 