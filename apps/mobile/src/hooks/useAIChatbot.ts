import { useState } from 'react';
import { supabase } from '../lib/supabase';
import NetInfo from '@react-native-community/netinfo';

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

  const checkNetworkConnection = async (): Promise<boolean> => {
    const networkState = await NetInfo.fetch();
    return networkState.isConnected === true && networkState.isInternetReachable !== false;
  };

  const generateFlashcards = async (
    userMessage: string,
    conversationHistory: Message[] = []
  ): Promise<FlashcardResult> => {
    setLoading(true);
    setError(null);

    try {
      // First check network connectivity
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        throw new Error('No internet connection. Please check your connection and try again.');
      }

      // Set timeout for the API call to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out. The server might be busy.')), 20000);
      });

      // Actual API call
      const apiCallPromise = supabase.functions.invoke('ai-vocabulary-assistant', {
        body: {
          userMessage,
          conversationHistory: conversationHistory.slice(-10), // Keep last 10 messages for context
        },
      });

      // Race between API call and timeout
      const { data, error: functionError } = await Promise.race([
        apiCallPromise,
        timeoutPromise,
      ]);

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
      
      let userFriendlyMessage = "I'm having trouble right now. ";
      
      // Provide more specific error messages based on type of error
      if (errorMessage.includes('network') || errorMessage.includes('internet') || 
          errorMessage.includes('connection') || errorMessage.includes('timeout')) {
        userFriendlyMessage += "There seems to be a network issue. Please check your connection and try again.";
      } else {
        userFriendlyMessage += "Could you try rephrasing your request? For example, tell me what language you're studying and what specific vocabulary you need.";
      }
      
      return {
        success: false,
        error: errorMessage,
        response: userFriendlyMessage,
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