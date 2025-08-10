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

  const addWord = async (word: string, definition: string) => {
    if (!userId) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('words')
        .insert([
          {
            user_id: userId,
            word: word.trim(),
            definition: definition.trim(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setWords(prev => [data, ...prev]);
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