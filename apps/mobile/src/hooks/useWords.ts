import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Word, StudyConfig } from '@shared/types';
import { User } from '@supabase/supabase-js';

export const useWords = (user: User | null) => {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWords = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('words')
        .select(`*, word_folders ( folder_id, folders (*) )`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const transformed: Word[] = (data || []).map((w: any) => ({
        ...w,
        created_at: new Date(w.created_at),
        last_reviewed: w.last_reviewed ? new Date(w.last_reviewed) : null,
        next_review: new Date(w.next_review),
        folders: w.word_folders?.map((wf: any) => ({
          ...wf.folders,
          created_at: new Date(wf.folders.created_at),
          updated_at: new Date(wf.folders.updated_at),
        })) || [],
      }));

      setWords(transformed);
    } catch (e: any) {
      setError(e.message);
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
  }, [fetchWords, user]);

  const addWord = async (
    wordData: Pick<Word, 'word' | 'definition'>,
    folderIds: string[] = []
  ) => {
    if (!user) return;

    const now = new Date();
    const nextReview = new Date();
    nextReview.setDate(now.getDate() + 1);

    try {
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
      return null;
    }
  };

  const updateWord = async (updated: Word) => {
    if (!user) return;

    try {
      const { error: updateError } = await supabase
        .from('words')
        .update({
          word: updated.word,
          definition: updated.definition,
          last_reviewed: updated.last_reviewed?.toISOString() || null,
          review_count: updated.review_count,
          correct_count: updated.correct_count,
          difficulty: updated.difficulty,
          next_review: updated.next_review.toISOString(),
        })
        .eq('id', updated.id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      await fetchWords();
      setWords((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
    } catch (e: any) {
      setError(e.message);
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
          filteredWords = filteredWords.filter((w) => new Date(w.next_review) <= now);
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
      const sorted = filteredWords.sort(
        (a, b) => new Date(a.next_review).getTime() - new Date(b.next_review).getTime()
      );

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