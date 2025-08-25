import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Folder } from '../types/database';

export const useFolders = (userId: string | undefined) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFolders = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setFolders((data as unknown as Folder[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch folders');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addFolder = useCallback(
    async (name: string, color: string = '#FF8C00') => {
      if (!userId) return { error: 'User not authenticated' } as const;
      try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from('folders')
          .insert({ user_id: userId, name: name.trim(), color, created_at: now, updated_at: now })
          .select()
          .single();
        if (error) throw error;
        setFolders((prev) => [data as Folder, ...prev]);
        return { data: data as Folder, error: null } as const;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add folder';
        setError(message);
        return { error: message } as const;
      }
    },
    [userId]
  );

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  return { folders, loading, error, refetch: fetchFolders, addFolder };
};


