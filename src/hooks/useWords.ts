import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Word, Folder } from '../types';
import { User } from '@supabase/supabase-js';

export const useWords = (user: User | null) => {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWords();
    } else {
      setWords([]);
      setLoading(false);
    }
  }, [user]);

  const fetchWords = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('words')
        .select(`
          *,
          word_folders (
            folder_id,
            folders (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedWords: Word[] = data.map(word => ({
        ...word,
        created_at: new Date(word.created_at),
        last_reviewed: word.last_reviewed ? new Date(word.last_reviewed) : null,
        next_review: new Date(word.next_review),
        folders: word.word_folders?.map((wf: any) => ({
          ...wf.folders,
          created_at: new Date(wf.folders.created_at),
          updated_at: new Date(wf.folders.updated_at),
        })) || [],
      }));

      setWords(transformedWords);
    } catch (error) {
      console.error('Error fetching words:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWord = async (wordData: Omit<Word, 'id' | 'user_id' | 'created_at' | 'last_reviewed' | 'review_count' | 'correct_count' | 'difficulty' | 'next_review' | 'folders'>, folderIds: string[] = []) => {
    if (!user) return;

    const now = new Date();
    const nextReview = new Date(now);
    nextReview.setDate(nextReview.getDate() + 1);

    try {
      const { data, error } = await supabase
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

      if (error) throw error;

      // Assign to folders if provided
      if (folderIds.length > 0) {
        const assignments = folderIds.map(folderId => ({
          word_id: data.id,
          folder_id: folderId,
        }));

        await supabase
          .from('word_folders')
          .insert(assignments);
      }

      // Fetch the word with its folders
      await fetchWords();
      
      return data;
    } catch (error) {
      console.error('Error adding word:', error);
      throw error;
    }
  };

  const updateWord = async (updatedWord: Word) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('words')
        .update({
          word: updatedWord.word,
          definition: updatedWord.definition,
          last_reviewed: updatedWord.last_reviewed?.toISOString() || null,
          review_count: updatedWord.review_count,
          correct_count: updatedWord.correct_count,
          difficulty: updatedWord.difficulty,
          next_review: updatedWord.next_review.toISOString(),
        })
        .eq('id', updatedWord.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setWords(prev => prev.map(word => 
        word.id === updatedWord.id ? updatedWord : word
      ));
    } catch (error) {
      console.error('Error updating word:', error);
      throw error;
    }
  };

  const deleteWord = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('words')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setWords(prev => prev.filter(word => word.id !== id));
    } catch (error) {
      console.error('Error deleting word:', error);
      throw error;
    }
  };

  const getWordsByFolder = (folderId: string | null) => {
    if (folderId === null) {
      // Return words not in any folder
      return words.filter(word => !word.folders || word.folders.length === 0);
    }
    
    return words.filter(word => 
      word.folders && word.folders.some(folder => folder.id === folderId)
    );
  };

  return {
    words,
    loading,
    addWord,
    updateWord,
    deleteWord,
    getWordsByFolder,
    refetch: fetchWords,
  };
};