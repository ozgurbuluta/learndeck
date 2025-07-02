import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { ExtractedWord, ImportResult } from '../types';

export const useImportWords = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const importWordsFromFile = async (
    content: string, 
    fileType: string, 
    folderIds: string[],
    existingWords: string[] = []
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

  return { importWordsFromFile, loading, error };
};