import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Word, StudyConfig } from '@shared/types';
import { User } from '@supabase/supabase-js';

// Safe date parsing helper function
const safeParseDate = (dateString: string | null): Date | null => {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string: ${dateString}`);
      return null;
    }
    return date;
  } catch (error) {
    console.warn(`Error parsing date: ${dateString}`, error);
    return null;
  }
};

// Default date for next review if parsing fails
const getDefaultNextReview = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1); // Default to tomorrow
  return date;
};

export const useWords = (user: User | null) => {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWords = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('words')
        .select(`*, word_folders ( folder_id, folders (*) )`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const transformed: Word[] = (data || []).map((w: any) => {
        // Safely parse all dates
        const createdAt = safeParseDate(w.created_at) || new Date();
        const lastReviewed = safeParseDate(w.last_reviewed);
        const nextReview = safeParseDate(w.next_review) || getDefaultNextReview();
        
        return {
          ...w,
          created_at: createdAt,
          last_reviewed: lastReviewed,
          next_review: nextReview,
          folders: w.word_folders?.map((wf: any) => ({
            ...wf.folders,
            created_at: safeParseDate(wf.folders.created_at) || new Date(),
            updated_at: safeParseDate(wf.folders.updated_at) || new Date(),
          })) || [],
        };
      });

      setWords(transformed);
    } catch (e: any) {
      setError(e.message);
      console.error('Error fetching words:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchWords();
    } else {
      setWords([]);
      setLoading(false);
    }
  }, [user]); // Remove fetchWords dependency to prevent infinite loops

  const addWord = async (
    wordData: Pick<Word, 'word' | 'definition'>,
    folderIds: string[] = []
  ) => {
    if (!user) return;

    try {
      const now = new Date();
      const nextReview = new Date();
      nextReview.setDate(now.getDate() + 1);

      const { data, error: insertError } = await supabase
        .from('words')
        .insert({
          user_id: user.id,
          word: wordData.word,
          definition: wordData.definition,
          created_at: now.toISOString(),
          last_reviewed: null,
          review_count: 0,
          correct_count: 0,
          difficulty: 'new',
          next_review: nextReview.toISOString(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (folderIds.length > 0) {
        const assignments = folderIds.map((fid) => ({ word_id: data.id, folder_id: fid }));
        await supabase.from('word_folders').insert(assignments);
      }

      await fetchWords();
      return data;
    } catch (e: any) {
      setError(e.message);
      console.error('Error adding word:', e);
      return null;
    }
  };

  const updateWord = async (updated: Word) => {
    if (!user) return;

    try {
      // Ensure we're sending valid date formats to the API
      const { error: updateError } = await supabase
        .from('words')
        .update({
          word: updated.word,
          definition: updated.definition,
          last_reviewed: updated.last_reviewed instanceof Date ? updated.last_reviewed.toISOString() : null,
          review_count: updated.review_count,
          correct_count: updated.correct_count,
          difficulty: updated.difficulty,
          next_review: updated.next_review instanceof Date ? updated.next_review.toISOString() : getDefaultNextReview().toISOString(),
        })
        .eq('id', updated.id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      await fetchWords();
    } catch (e: any) {
      setError(e.message);
      console.error('Error updating word:', e);
      return null;
    }
  };

  const deleteWord = async (id: number) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('words').delete().eq('id', id);
      if (error) throw error;
      await fetchWords();
    } catch (e: any) {
      setError(e.message);
      console.error('Error deleting word:', e);
    }
  };

  const getWordsForStudy = useCallback(
    (config: StudyConfig, limit: number = 20): Word[] => {
      const now = new Date();
      let filteredWords: Word[] = [];

      // 1. Filter by Folder
      if (config.folderId) {
        filteredWords = words.filter(
          (w) =>
            w.folders?.some((f) => f.id === config.folderId) && w.difficulty !== 'mastered'
        );
      } else {
        filteredWords = [...words];
      }

      // 2. Filter by Study Type
      switch (config.studyType) {
        case 'all':
          // No additional filtering needed
          break;
        case 'review':
          filteredWords = filteredWords.filter((w) => {
            if (!(w.next_review instanceof Date)) return false;
            return w.next_review <= now;
          });
          break;
        case 'new':
          filteredWords = filteredWords.filter((w) => w.difficulty === 'new');
          break;
        case 'learning':
          filteredWords = filteredWords.filter((w) => w.difficulty === 'learning');
          break;
        case 'mastered':
          filteredWords = filteredWords.filter((w) => w.difficulty === 'mastered');
          break;
      }

      // 3. Sort and Limit
      const sorted = filteredWords.sort((a, b) => {
        const dateA = a.next_review instanceof Date ? a.next_review.getTime() : Infinity;
        const dateB = b.next_review instanceof Date ? b.next_review.getTime() : Infinity;
        return dateA - dateB;
      });

      return sorted.slice(0, limit);
    },
    [words]
  );

  const getWordsByFolder = (folderId: string | null) => {
    if (folderId === null) {
      return words.filter((w) => !w.folders || w.folders.length === 0);
    }
    return words.filter((w) => w.folders?.some((f) => f.id === folderId));
  };

  return {
    words,
    loading,
    error,
    refetch: fetchWords,
    addWord,
    updateWord,
    deleteWord,
    getWordsForStudy,
    getWordsByFolder,
  };
}; 