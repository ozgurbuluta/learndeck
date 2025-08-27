import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Word } from '../types/database';
import { shuffleWordsForStudy } from '../utils/studyAlgorithm';

interface StudyResult {
  wordId: string;
  correct: boolean;
}

export const useStudySession = (userId: string | undefined, folderId: string | null = null) => {
  const [studyWords, setStudyWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  const startStudySession = useCallback(async (studyType: 'all' | 'due' | 'new' = 'due') => {
    if (!userId) return { success: false, message: 'User not authenticated' };

    setLoading(true);
    try {
      let query = supabase
        .from('words')
        .select('*')
        .eq('user_id', userId);

      // Optional folder filter via join on word_folders
      if (folderId) {
        // Filter words that are in the selected folder
        query = query.in(
          'id',
          (
            await supabase
              .from('word_folders')
              .select('word_id')
              .eq('folder_id', folderId)
          ).data?.map((x: any) => x.word_id) || []
        );
      }

      // Filter based on study type
      if (studyType === 'due') {
        // Include words due for review OR new words that have never been reviewed
        const now = new Date().toISOString();
        query = query.or(`next_review.lte.${now},and(difficulty.eq.new,last_reviewed.is.null)`);
      } else if (studyType === 'new') {
        query = query.eq('difficulty', 'new');
      }
      // 'all' type doesn't add any filters

      const { data, error } = await query.limit(20);

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
        // Apply intelligent randomization for optimal learning
        const shuffledWords = shuffleWordsForStudy(data);
        // Prepare initial sliding window of at least 3 cards
        setStudyWords(shuffledWords);
        setCurrentIndex(0);
        setIsFlipped(false);
        setSessionStats({ correct: 0, incorrect: 0, total: shuffledWords.length });
        // Create a study session record
        const startedAt = new Date();
        try {
          const persistedStudyType = studyType === 'due' ? 'review' : studyType;
          const { data: created, error: createError } = await supabase
            .from('study_sessions')
            .insert({
              user_id: userId,
              folder_id: folderId,
              study_type: persistedStudyType,
              started_at: startedAt.toISOString(),
            })
            .select()
            .single();
          if (createError) {
            console.warn('Failed to create study session row:', createError);
          } else {
            setSessionId(created.id);
            setSessionStartTime(startedAt);
            // Update recent study options (upsert-like)
            try {
              // Try find existing combo
              let query = supabase
                .from('recent_study_options')
                .select('id, use_count')
                .eq('user_id', userId)
                .eq('study_type', persistedStudyType);
              if (folderId) {
                query = query.eq('folder_id', folderId);
              } else {
                query = query.is('folder_id', null);
              }
              const { data: existing, error: selectErr } = await query.single();
              if (selectErr && selectErr.code !== 'PGRST116') {
                // PGRST116 = no rows found
                throw selectErr;
              }
              if (existing) {
                await supabase
                  .from('recent_study_options')
                  .update({
                    last_used_at: startedAt.toISOString(),
                    use_count: (existing as any).use_count + 1,
                  })
                  .eq('id', (existing as any).id);
              } else {
                await supabase.from('recent_study_options').insert({
                  user_id: userId,
                  folder_id: folderId,
                  study_type: persistedStudyType,
                  last_used_at: startedAt.toISOString(),
                  use_count: 1,
                });
              }
            } catch (recentErr) {
              console.warn('Failed to update recent study options:', recentErr);
            }
          }
        } catch (err) {
          console.warn('Error creating study session row:', err);
        }
        return { success: true, count: shuffledWords.length };
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
      
      const newCorrectCount = correct ? currentWord.correct_count + 1 : currentWord.correct_count;
      const accuracy = currentWord.review_count > 0 ? newCorrectCount / (currentWord.review_count + 1) : (correct ? 1 : 0);
      
      if (correct) {
        // Progress using consistent algorithm
        if (currentWord.difficulty === 'failed') {
          newDifficulty = 'learning';
          nextReview.setDate(now.getDate() + 1);
        } else if (currentWord.difficulty === 'new') {
          newDifficulty = 'learning';
          nextReview.setDate(now.getDate() + 1);
        } else if (currentWord.difficulty === 'learning' && newCorrectCount >= 3) {
          newDifficulty = 'review';
          nextReview.setDate(now.getDate() + 3);
        } else if (currentWord.difficulty === 'review' && newCorrectCount >= 10) {
          newDifficulty = 'mastered';
          nextReview.setDate(now.getDate() + 7);
        } else if (currentWord.difficulty === 'mastered') {
          nextReview.setDate(now.getDate() + 30);
        } else {
          // Stay at current level but extend interval
          if (currentWord.difficulty === 'learning') {
            nextReview.setDate(now.getDate() + 3);
          } else if (currentWord.difficulty === 'review') {
            nextReview.setDate(now.getDate() + 7);
          }
        }
        setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
      } else {
        // Demote on incorrect answers, consistent with web
        if (currentWord.review_count >= 3 && accuracy < 0.3) {
          newDifficulty = 'failed';
          nextReview.setTime(now.getTime() + 6 * 60 * 60 * 1000); // 6 hours for failed words
        } else if (currentWord.difficulty === 'mastered') {
          newDifficulty = 'review';
          nextReview.setDate(now.getDate() + 7);
        } else if (currentWord.difficulty === 'review') {
          newDifficulty = 'learning';
          nextReview.setDate(now.getDate() + 1);
        } else {
          nextReview.setDate(now.getDate() + 1);
        }
        setSessionStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      }

      // Update word in database
      await supabase
        .from('words')
        .update({
          difficulty: newDifficulty,
          next_review: nextReview.toISOString(),
          review_count: currentWord.review_count + 1,
          correct_count: newCorrectCount,
          last_reviewed: now.toISOString(),
        })
        .eq('id', currentWord.id);

      // Move to next word with sliding-window preparation
      if (currentIndex < studyWords.length - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        setIsFlipped(false);
        // Proactively ensure we have at least next 2 items prepared in memory
        // If near the end, no-op; otherwise data already exists since we fetched upfront
      }

    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  }, [currentIndex, studyWords]);

  const completeSession = useCallback(async () => {
    if (!userId || !sessionId || !sessionStartTime) return;
    try {
      const wordsStudied = sessionStats.correct + sessionStats.incorrect;
      const correctAnswers = sessionStats.correct;
      const totalTimeMinutes = Math.max(1, Math.round((Date.now() - sessionStartTime.getTime()) / 60000));
      const { error } = await supabase
        .from('study_sessions')
        .update({
          words_studied: wordsStudied,
          correct_answers: correctAnswers,
          total_time_minutes: totalTimeMinutes,
          completed_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .eq('user_id', userId);
      if (error) {
        console.warn('Failed to complete study session row:', error);
      }
    } catch (err) {
      console.warn('Error completing study session:', err);
    } finally {
      // Reset identifiers so next session starts clean
      setSessionId(null);
      setSessionStartTime(null);
    }
  }, [sessionId, sessionStartTime, sessionStats, userId]);

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
    completeSession,
  };
};