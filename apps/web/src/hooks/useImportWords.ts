import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { ImportResult } from '@shared/types';

export const useImportWords = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const importWordsFromFile = async (
    content: string, 
    fileType: string, 
    folderIds: string[],
    existingWords: string[] = [],
    previewMode: boolean = false
  ): Promise<ImportResult> => {
    if (!user) {
      setError('You must be logged in to import words.');
      return { success: false, error: 'User not authenticated' };
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('process-document', {
        body: { 
          content,
          fileType,
          userId: user.id,
          folderIds,
          existingWords,
          previewMode,
        },
      });

      if (functionError) {
        throw new Error(`Edge Function returned a non-2xx status code`);
      }
      
      if (!data.success) {
        throw new Error(data.error || 'An unknown error occurred in the edge function.');
      }

      return {
        success: true,
        words: data.words,
        savedCount: data.savedCount,
        isPreview: data.isPreview,
      };

    } catch (err: any) {
      console.error('Error processing file:', err);
      setError(err.message || 'Failed to send a request to the Edge Function');
      return { 
        success: false, 
        error: err.message || 'Failed to process file' 
      };
    } finally {
      setLoading(false);
    }
  };

  const confirmImportWords = async (
    words: Array<{word: string, definition: string, article?: string}>,
    folderIds: string[]
  ): Promise<ImportResult> => {
    if (!user) {
      setError('You must be logged in to import words.');
      return { success: false, error: 'User not authenticated' };
    }

    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      const nextReview = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

      // Prepare words for database insertion
      const insertPayload = words.map((w) => ({
        user_id: user.id,
        word: w.word.trim(),
        definition: w.definition.trim(),
        article: w.article ?? null,
        created_at: now.toISOString(),
        last_reviewed: null,
        review_count: 0,
        correct_count: 0,
        difficulty: 'new',
        next_review: nextReview,
      }));

      // Insert words into database
      const { data: wordsData, error: wordsError } = await supabase
        .from('words')
        .insert(insertPayload)
        .select();

      if (wordsError) throw wordsError;

      // If there are folder IDs and words were successfully inserted, create relationships
      if (folderIds.length && wordsData?.length) {
        const relations = wordsData.flatMap((w: any) =>
          folderIds.map((f) => ({
            word_id: w.id,
            folder_id: f,
            created_at: now.toISOString(),
          }))
        );
        
        const { error: relationError } = await supabase
          .from('word_folders')
          .insert(relations);
          
        if (relationError) {
          console.warn('Failed to create folder relationships:', relationError);
        }
      }

      return {
        success: true,
        words: wordsData || [],
        savedCount: wordsData?.length || 0,
      };

    } catch (err: any) {
      console.error('Error confirming import:', err);
      setError(err.message || 'Failed to confirm import');
      return { 
        success: false, 
        error: err.message || 'Failed to confirm import' 
      };
    } finally {
      setLoading(false);
    }
  };

  return { importWordsFromFile, confirmImportWords, loading, error };
};