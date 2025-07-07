import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Folder } from '@shared/types';
import { User } from '@supabase/supabase-js';

export const useFolders = (user: User | null) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFolders();
    } else {
      setFolders([]);
      setLoading(false);
    }
  }, [user]);

  const fetchFolders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_folders_with_word_count', {
        p_user_id: user.id,
      });

      if (error) throw error;

      const transformedFolders: Folder[] = Array.isArray(data)
        ? (data as any[]).map((folder: any) => {
            const transformed: Folder = {
              ...folder,
              created_at: new Date(folder.created_at),
              updated_at: new Date(folder.updated_at),
            };
            return transformed;
          })
        : [];

      setFolders(transformedFolders);
    } catch (error) {
      console.error('Error fetching folders:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFolder = async (folderData: { name: string; color?: string }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('folders')
        .insert({
          user_id: user.id,
          name: folderData.name,
          color: folderData.color || '#fca311',
        })
        .select()
        .single();

      if (error) throw error;

      const newFolder: Folder = {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        word_count: 0,
      };

      setFolders(prev => [...prev, newFolder].sort((a, b) => a.name.localeCompare(b.name)));
      fetchFolders();
      return newFolder;
    } catch (error) {
      console.error('Error adding folder:', error);
      throw error;
    }
  };

  const updateFolder = async (id: string, updates: { name?: string; color?: string }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('folders')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchFolders();

      // After refetching, find the folder from the updated state
      const updatedFolder = folders.find(f => f.id === id);
      return updatedFolder;

    } catch (error) {
      console.error('Error updating folder:', error);
      throw error;
    }
  };

  const deleteFolder = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setFolders(prev => prev.filter(folder => folder.id !== id));
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  };

  const assignWordToFolders = async (wordId: string, folderIds: string[]) => {
    if (!user) return;

    try {
      // First, remove existing folder assignments for this word
      await supabase
        .from('word_folders')
        .delete()
        .eq('word_id', wordId);

      // Then add new assignments
      if (folderIds.length > 0) {
        const assignments = folderIds.map(folderId => ({
          word_id: wordId,
          folder_id: folderId,
        }));

        const { error } = await supabase
          .from('word_folders')
          .insert(assignments);

        if (error) throw error;
      }
      await fetchFolders();
    } catch (error) {
      console.error('Error assigning word to folders:', error);
      throw error;
    }
  };

  const getWordFolders = async (wordId: string): Promise<Folder[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('word_folders')
        .select(`
          folder_id,
          folders (*)
        `)
        .eq('word_id', wordId);

      if (error) throw error;

      return (data as any[]).map((item: any) => {
        const folder: Folder = {
          ...item.folders,
          created_at: new Date(item.folders.created_at),
          updated_at: new Date(item.folders.updated_at),
        };
        return folder;
      });
    } catch (error) {
      console.error('Error fetching word folders:', error);
      return [];
    }
  };

  return {
    folders,
    loading,
    addFolder,
    updateFolder,
    deleteFolder,
    assignWordToFolders,
    getWordFolders,
    refetch: fetchFolders,
  };
};