import { useState } from 'react';
import { supabase } from '../lib/supabase';

export interface ExtractedWord {
  word: string;
  definition: string;
  article?: string;
}

export interface CustomImportResult {
  success: boolean;
  words?: ExtractedWord[];
  savedCount?: number;
  isPreview?: boolean;
  error?: string;
}

// Mobile custom import removed; export no-op API to avoid breaking imports
export const useCustomImportWords = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const customProcessDocument = async (
    content: string,
    fileType: string,
    userId: string,
    folderIds: string[] = [],
    existingWords: string[] = [],
    previewMode: boolean = false,
    customPrompt?: string
  ): Promise<CustomImportResult> => {
    if (!userId) {
      setError('You must be logged in to process documents.');
      return { success: false, error: 'User not authenticated' };
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Calling Edge Function with:', {
        userId,
        hasContent: !!content,
        contentLength: content?.length,
        fileType,
        previewMode,
        hasCustomPrompt: !!customPrompt,
      });

      const { data, error: functionError } = await supabase.functions.invoke('process-document-custom', {
        body: {
          content,
          fileType,
          userId,
          folderIds,
          existingWords,
          previewMode,
          customPrompt: customPrompt?.trim() || undefined,
        },
      });

      console.log('Edge Function response:', {
        functionError: functionError ? JSON.stringify(functionError) : null,
        data: data ? JSON.stringify(data) : null,
      });

      if (functionError) {
        console.error('Function error details:', functionError);
        throw new Error(`Network error: ${functionError.message || 'Edge Function returned a non-2xx status code'}`);
      }

      if (!data?.success) {
        console.error('Function returned error:', data?.error);
        throw new Error(data?.error || 'An unknown error occurred in the edge function.');
      }

      return {
        success: true,
        words: data.words,
        savedCount: data.savedCount,
        isPreview: data.isPreview,
      };

    } catch (err: any) {
      console.error('Error processing document with custom prompt:', err);
      setError(err.message || 'Failed to send a request to the Edge Function');
      return {
        success: false,
        error: err.message || 'Failed to process document'
      };
    } finally {
      setLoading(false);
    }
  };

  const confirmCustomImportWords = async (
    words: ExtractedWord[],
    userId: string,
    folderIds: string[] = []
  ): Promise<CustomImportResult> => {
    if (!userId) {
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
        user_id: userId,
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
      console.error('Error confirming custom import:', err);
      setError(err.message || 'Failed to confirm import');
      return {
        success: false,
        error: err.message || 'Failed to confirm import'
      };
    } finally {
      setLoading(false);
    }
  };

  // Return inert handlers to preserve type shape; they show a friendly error
  return {
    customProcessDocument: async () => ({ success: false, error: 'Custom import is not available on mobile.' }),
    confirmCustomImportWords: async () => ({ success: false, error: 'Custom import is not available on mobile.' }),
    loading: false,
    error,
  };
};