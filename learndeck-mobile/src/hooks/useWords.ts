import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Word } from '../types/database';

export const useWords = (userId: string | undefined) => {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWords = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setWords(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addWord = async (word: string, definition: string, folderIds: string[] = []) => {
    if (!userId) return { error: 'User not authenticated' };

    try {
      const now = new Date();
      const nextReview = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('words')
        .insert([
          {
            user_id: userId,
            word: word.trim(),
            definition: definition.trim(),
            difficulty: 'new',
            next_review: nextReview.toISOString(),
            last_reviewed: null,
            review_count: 0,
            correct_count: 0,
            created_at: now.toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setWords(prev => [data, ...prev]);

      // Link to folders if provided
      if (folderIds.length && data?.id) {
        try {
          await supabase.from('word_folders').insert(
            folderIds.map((f) => ({ word_id: data.id, folder_id: f, created_at: now.toISOString() }))
          );
        } catch (linkErr) {
          // non-fatal
          console.warn('Failed to link word to folders:', linkErr);
        }
      }
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const addWords = async (wordsToAdd: Array<Omit<Word, 'id'>>) => {
    if (!userId) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('words')
        .insert(wordsToAdd)
        .select();

      if (error) throw error;

      setWords(prev => [...(data || []), ...prev]);
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const deleteWord = async (wordId: string) => {
    if (!userId) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('words')
        .delete()
        .eq('id', wordId)
        .eq('user_id', userId);

      if (error) throw error;

      setWords(prev => prev.filter(word => word.id !== wordId));
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  useEffect(() => {
    fetchWords();

    if (!userId) return;
    // Realtime updates for the user's words
    const channel = supabase
      .channel('words-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'words', filter: `user_id=eq.${userId}` },
        () => {
          fetchWords();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return {
    words,
    loading,
    error,
    addWord,
    addWords,
    deleteWord,
    refetch: fetchWords,
  };
};