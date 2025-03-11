import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Database } from '@/types/database.types';
import { createClient } from '@/utils/supabase/client';

type WorkoutPlan = Database['public']['Tables']['workout_plans']['Row'] & {
  workout_days: Database['public']['Tables']['workout_days']['Row'][];
};
type WorkoutPlanInsert = Database['public']['Tables']['workout_plans']['Insert'];
type WorkoutPlanUpdate = Database['public']['Tables']['workout_plans']['Update'];

const supabase = createClient();

export const useWorkoutPlans = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: workoutPlans, isLoading } = useQuery({
    queryKey: ['workout-plans', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('workout_plans')
        .select(`
          *,
          workout_days (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to fetch workout plans');
        throw error;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  const createWorkoutPlan = useMutation({
    mutationFn: async (newPlan: WorkoutPlanInsert) => {
      const { data, error } = await supabase
        .from('workout_plans')
        .insert([{ ...newPlan, user_id: user?.id }])
        .select(`
          *,
          workout_days (*)
        `)
        .single();

      if (error) {
        toast.error('Failed to create workout plan');
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] });
      toast.success('Workout plan created successfully');
    },
  });

  const updateWorkoutPlan = useMutation({
    mutationFn: async ({ id, ...updates }: WorkoutPlanUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('workout_plans')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select(`
          *,
          workout_days (*)
        `)
        .single();

      if (error) {
        toast.error('Failed to update workout plan');
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] });
      toast.success('Workout plan updated successfully');
    },
  });

  const deleteWorkoutPlan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workout_plans')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        toast.error('Failed to delete workout plan');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] });
      toast.success('Workout plan deleted successfully');
    },
  });

  const getWorkoutPlan = async (id: string) => {
    const { data, error } = await supabase
      .from('workout_plans')
      .select(`
        *,
        workout_days (*)
      `)
      .eq('id', id)
      .eq('user_id', user?.id)
      .single();

    if (error) {
      toast.error('Failed to fetch workout plan');
      throw error;
    }

    return data;
  };

  return {
    workoutPlans,
    isLoading,
    createWorkoutPlan: createWorkoutPlan.mutate,
    updateWorkoutPlan: updateWorkoutPlan.mutate,
    deleteWorkoutPlan: deleteWorkoutPlan.mutate,
    getWorkoutPlan,
  };
}; 