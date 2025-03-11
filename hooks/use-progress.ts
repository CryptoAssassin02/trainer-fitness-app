// Create file: hooks/use-progress.ts

import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Database } from '@/types/database.types';
import { createClient } from '@/utils/supabase/client';

type ProgressCheckin = Database['public']['Tables']['progress_checkins']['Row'];
type ProgressCheckinInsert = Database['public']['Tables']['progress_checkins']['Insert'];
type ProgressCheckinUpdate = Database['public']['Tables']['progress_checkins']['Update'];

const supabase = createClient();

export const useProgress = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: progressCheckins, isLoading } = useQuery({
    queryKey: ['progress-checkins', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('progress_checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('check_in_date', { ascending: false });

      if (error) {
        toast.error('Failed to fetch progress check-ins');
        throw error;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  const createCheckin = useMutation({
    mutationFn: async (newCheckin: Omit<ProgressCheckinInsert, 'user_id'>) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('progress_checkins')
        .insert([{ ...newCheckin, user_id: user.id }])
        .select()
        .single();

      if (error) {
        toast.error('Failed to create progress check-in');
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-checkins', user?.id] });
      toast.success('Progress check-in recorded successfully');
    },
  });

  const updateCheckin = useMutation({
    mutationFn: async ({ id, ...updates }: ProgressCheckinUpdate & { id: string }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('progress_checkins')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        toast.error('Failed to update progress check-in');
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-checkins', user?.id] });
      toast.success('Progress check-in updated successfully');
    },
  });

  const deleteCheckin = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('progress_checkins')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        toast.error('Failed to delete progress check-in');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-checkins', user?.id] });
      toast.success('Progress check-in deleted successfully');
    },
  });

  const getProgressStats = async (startDate: Date, endDate: Date) => {
    if (!user?.id) return null;

    const { data, error } = await supabase
      .from('progress_checkins')
      .select('*')
      .eq('user_id', user.id)
      .gte('check_in_date', startDate.toISOString())
      .lte('check_in_date', endDate.toISOString())
      .order('check_in_date', { ascending: true });

    if (error) {
      toast.error('Failed to fetch progress statistics');
      throw error;
    }

    return data;
  };

  return {
    progressCheckins,
    isLoading,
    createCheckin: createCheckin.mutate,
    updateCheckin: updateCheckin.mutate,
    deleteCheckin: deleteCheckin.mutate,
    getProgressStats,
  };
};