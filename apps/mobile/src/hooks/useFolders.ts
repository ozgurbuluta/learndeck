import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Folder } from '../types';
import { User } from '@supabase/supabase-js';

export const useFolders = (user: User | null) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFolders = useCallback(async () => {
    if (!user) {
      setFolders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_folders_with_word_count', {
        p_user_id: user.id,
      });

      if (error) throw error;

      const transformedFolders: Folder[] = Array.isArray(data)
        ? (data as any[]).map((folder: any) => ({
            ...folder,
            created_at: new Date(folder.created_at),
            updated_at: new Date(folder.updated_at),
          }))
        : [];

      setFolders(transformedFolders);
    } catch (e) {
      console.error('Error fetching folders:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  return { folders, loading, refetch: fetchFolders };
}; 