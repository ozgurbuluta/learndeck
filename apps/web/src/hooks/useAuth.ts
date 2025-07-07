import { useAuth as useSharedAuth } from '@shared/hooks/useAuth';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  return useSharedAuth(supabase);
}; 