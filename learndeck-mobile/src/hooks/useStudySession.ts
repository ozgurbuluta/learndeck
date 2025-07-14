import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Word } from '../types/database';

interface StudyResult {
  wordId: string;
  correct: boolean;
}

export const useStudySession = (userId: string | undefined) => {
  const [studyWords, setStudyWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  const startStudySession = useCallback(async (studyType: 'all' | 'due' | 'new' = 'due') => {
    if (!userId) return { success: false, message: 'User not authenticated' };

    setLoading(true);
    try {
      let query = supabase
        .from('words')
        .select('*')
        .eq('user_id', userId);

      // Filter based on study type
      if (studyType === 'due') {
        // Include words due for review OR new words that have never been reviewed
        const now = new Date().toISOString();
        query = query.or(`next_review.lte.${now},and(difficulty.eq.new,last_reviewed.is.null)`);
      } else if (studyType === 'new') {
        query = query.eq('difficulty', 'new');
      }
      // 'all' type doesn't add any filters

      const { data, error } = await query.order('created_at', { ascending: true }).limit(20);

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      console.log(`Study session query for ${studyType}:`, {
        userId,
        wordsFound: data?.length || 0,
        studyType
      });

      if (data && data.length > 0) {
        setStudyWords(data);
        setCurrentIndex(0);
        setIsFlipped(false);
        setSessionStats({ correct: 0, incorrect: 0, total: data.length });
        return { success: true, count: data.length };
      } else {
        return { success: false, message: `No ${studyType === 'all' ? '' : studyType + ' '}words available for study` };
      }
    } catch (error) {
      console.error('Error starting study session:', error);
      return { success: false, message: 'Failed to start study session. Please try again.' };
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const submitAnswer = useCallback(async (correct: boolean) => {
    if (currentIndex >= studyWords.length) return;

    const currentWord = studyWords[currentIndex];
    
    try {
      // Calculate new difficulty and next review date
      const now = new Date();
      let newDifficulty = currentWord.difficulty;
      let nextReview = new Date();
      
      if (correct) {
        // Progress the word
        switch (currentWord.difficulty) {
          case 'new':
            newDifficulty = 'learning';
            nextReview.setDate(now.getDate() + 1); // 1 day
            break;
          case 'learning':
            newDifficulty = 'review';
            nextReview.setDate(now.getDate() + 3); // 3 days
            break;
          case 'review':
            newDifficulty = 'mastered';
            nextReview.setDate(now.getDate() + 7); // 1 week
            break;
          case 'mastered':
            nextReview.setDate(now.getDate() + 14); // 2 weeks
            break;
        }
        setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
      } else {
        // Reset to learning if incorrect
        if (currentWord.difficulty !== 'new') {
          newDifficulty = 'learning';
        }
        nextReview.setDate(now.getDate() + 1); // Try again tomorrow
        setSessionStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      }

      // Update word in database
      await supabase
        .from('words')
        .update({
          difficulty: newDifficulty,
          next_review: nextReview.toISOString(),
          review_count: currentWord.review_count + 1,
          correct_count: correct ? currentWord.correct_count + 1 : currentWord.correct_count,
          last_reviewed: now.toISOString(),
        })
        .eq('id', currentWord.id);

      // Move to next word
      if (currentIndex < studyWords.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsFlipped(false);
      }

    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  }, [currentIndex, studyWords]);

  const flipCard = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const resetSession = useCallback(() => {
    setStudyWords([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionStats({ correct: 0, incorrect: 0, total: 0 });
  }, []);

  const currentWord = studyWords[currentIndex];
  const isLastWord = currentIndex >= studyWords.length - 1;
  const progress = studyWords.length > 0 ? (currentIndex + 1) / studyWords.length : 0;

  return {
    studyWords,
    currentWord,
    currentIndex,
    isFlipped,
    sessionStats,
    loading,
    isLastWord,
    progress,
    startStudySession,
    submitAnswer,
    flipCard,
    resetSession,
  };
};