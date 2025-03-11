// Create file: hooks/use-nutrition.ts

import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Database } from '@/types/database.types';
import { createClient } from '@/utils/supabase/client';

type NutritionMacros = Database['public']['Tables']['nutrition_macros']['Row'];
type NutritionMacrosInsert = Database['public']['Tables']['nutrition_macros']['Insert'];
type NutritionMacrosUpdate = Database['public']['Tables']['nutrition_macros']['Update'];

const supabase = createClient();

export const useNutrition = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: activeMacros, isLoading: isLoadingActive } = useQuery({
    queryKey: ['nutrition-macros', 'active', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('nutrition_macros')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        toast.error('Failed to fetch active nutrition macros');
        throw error;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  const { data: macrosHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['nutrition-macros', 'history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('nutrition_macros')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to fetch nutrition macros history');
        throw error;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  const createMacros = useMutation({
    mutationFn: async (newMacros: NutritionMacrosInsert) => {
      // If this is marked as active, deactivate all other macro sets
      if (newMacros.is_active) {
        await supabase
          .from('nutrition_macros')
          .update({ is_active: false })
          .eq('user_id', user?.id)
          .eq('is_active', true);
      }

      const { data, error } = await supabase
        .from('nutrition_macros')
        .insert([{ ...newMacros, user_id: user?.id }])
        .select()
        .single();

      if (error) {
        toast.error('Failed to create nutrition macros');
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition-macros'] });
      toast.success('Nutrition macros created successfully');
    },
  });

  const updateMacros = useMutation({
    mutationFn: async ({ id, ...updates }: NutritionMacrosUpdate & { id: string }) => {
      // If this is being marked as active, deactivate all other macro sets
      if (updates.is_active) {
        await supabase
          .from('nutrition_macros')
          .update({ is_active: false })
          .eq('user_id', user?.id)
          .eq('is_active', true)
          .neq('id', id);
      }

      const { data, error } = await supabase
        .from('nutrition_macros')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) {
        toast.error('Failed to update nutrition macros');
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition-macros'] });
      toast.success('Nutrition macros updated successfully');
    },
  });

  const deleteMacros = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('nutrition_macros')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        toast.error('Failed to delete nutrition macros');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition-macros'] });
      toast.success('Nutrition macros deleted successfully');
    },
  });

  const setActiveMacros = useMutation({
    mutationFn: async (id: string) => {
      // First, deactivate all macro plans
      const { error: deactivateError } = await supabase
        .from('nutrition_macros')
        .update({ is_active: false })
        .eq('user_id', user?.id);

      if (deactivateError) throw deactivateError;

      // Then, activate the selected plan
      const { data, error } = await supabase
        .from('nutrition_macros')
        .update({ is_active: true })
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition-macros'] });
      toast.success('Macro plan activated successfully');
    },
  });

  return {
    activeMacros,
    macrosHistory,
    isLoading: isLoadingActive || isLoadingHistory,
    createMacros: createMacros.mutate,
    updateMacros: updateMacros.mutate,
    deleteMacros: deleteMacros.mutate,
    setActiveMacros: setActiveMacros.mutate,
  };
};