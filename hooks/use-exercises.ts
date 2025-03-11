import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Database } from '@/types/database.types';
import { createClient } from '@/utils/supabase/client';

type Exercise = Database['public']['Tables']['exercises']['Row'];
type ExerciseInsert = Database['public']['Tables']['exercises']['Insert'];
type ExerciseUpdate = Database['public']['Tables']['exercises']['Update'];

const supabase = createClient();

export const useExercises = (workoutDayId: string) => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: exercises, isLoading } = useQuery({
    queryKey: ['exercises', workoutDayId],
    queryFn: async () => {
      if (!workoutDayId) return [];

      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('workout_day_id', workoutDayId)
        .order('order_index');

      if (error) {
        toast.error('Failed to fetch exercises');
        throw error;
      }

      return data;
    },
    enabled: !!workoutDayId,
  });

  const createExercise = useMutation({
    mutationFn: async (newExercise: ExerciseInsert) => {
      const { data, error } = await supabase
        .from('exercises')
        .insert([{ ...newExercise, workout_day_id: workoutDayId }])
        .select()
        .single();

      if (error) {
        toast.error('Failed to create exercise');
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises', workoutDayId] });
      toast.success('Exercise created successfully');
    },
  });

  const updateExercise = useMutation({
    mutationFn: async ({ id, ...updates }: ExerciseUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('exercises')
        .update(updates)
        .eq('id', id)
        .eq('workout_day_id', workoutDayId)
        .select()
        .single();

      if (error) {
        toast.error('Failed to update exercise');
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises', workoutDayId] });
      toast.success('Exercise updated successfully');
    },
  });

  const deleteExercise = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id)
        .eq('workout_day_id', workoutDayId);

      if (error) {
        toast.error('Failed to delete exercise');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises', workoutDayId] });
      toast.success('Exercise deleted successfully');
    },
  });

  const reorderExercises = useMutation({
    mutationFn: async (exercises: { id: string; order_index: number }[]) => {
      const { error } = await supabase.from('exercises').upsert(
        exercises.map(({ id, order_index }) => ({
          id,
          order_index,
          workout_day_id: workoutDayId,
        }))
      );

      if (error) {
        toast.error('Failed to reorder exercises');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises', workoutDayId] });
      toast.success('Exercises reordered successfully');
    },
  });

  return {
    exercises,
    isLoading,
    createExercise: createExercise.mutate,
    updateExercise: updateExercise.mutate,
    deleteExercise: deleteExercise.mutate,
    reorderExercises: reorderExercises.mutate,
  };
}; 