import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface Message {
  type: 'user' | 'assistant';
  content: string;
}

interface FlashcardResult {
  success: boolean;
  words?: Array<{ word: string; definition: string }>;
  response?: string;
  suggestedFolderName?: string;
  language?: string;
  level?: string;
  category?: string;
  error?: string;
}

export const useAIChatbot = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateFlashcards = async (
    userMessage: string,
    conversationHistory: Message[] = []
  ): Promise<FlashcardResult> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('ai-vocabulary-assistant', {
        body: {
          userMessage,
          conversationHistory: conversationHistory.slice(-10), // Keep last 10 messages for context
        },
      });

      if (functionError) {
        throw new Error(functionError.message || 'Failed to generate flashcards');
      }

      if (!data.success) {
        throw new Error(data.error || 'AI assistant failed to process request');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        response: "I'm having trouble right now. Could you try rephrasing your request? For example, tell me what language you're studying and what specific vocabulary you need."
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    generateFlashcards,
    loading,
    error,
  };
};