import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, Trophy, Folder } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';
import { Word } from '@shared/types';
import { getWordsForStudyType, getStudyTypeDescription } from '../utils/studyFilters';
import { shuffleWordsForStudy } from '../utils/studyAlgorithm';
import { useStudySessions } from '../hooks/useStudySessions';
import { useAuth } from '../hooks/useAuth';
import { useAchievements } from '../hooks/useAchievements';
import { calculateNextReview, updateWordDifficulty } from '../utils/reviewScheduling';
import { supabase } from '../lib/supabase';
import { useProfile } from '../hooks/useProfile';

interface StudySessionProps {
  words: Word[];
  onUpdateWord: (word: Word) => Promise<void>;
  onNavigate: (view: string) => void;
  currentView?: string;
}

export const StudySession: React.FC<StudySessionProps> = ({ words, onUpdateWord, onNavigate, currentView: _currentView }) => {
  const { user } = useAuth();
  const { profile } = useProfile(user);
  const { checkAchievements } = useAchievements();
  const { currentSession, updateStudySession, completeStudySession } = useStudySessions(user);
  const [studyWords, setStudyWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [cardTransform, setCardTransform] = useState('');

  const handlers = useSwipeable({
    onSwiping: (event) => {
      const maxSwipe = 100;
      const progress = Math.abs(event.deltaX) / maxSwipe;
      setSwipeProgress(Math.min(progress, 1));
      setSwipeDirection(event.deltaX > 0 ? 'right' : 'left');
      
      const translation = Math.min(Math.abs(event.deltaX), maxSwipe) * Math.sign(event.deltaX);
      const rotation = Math.min(Math.abs(event.deltaX * 0.05), 5) * Math.sign(event.deltaX);
      setCardTransform(`translateX(${translation}px) rotate(${rotation}deg)`);
    },
    onSwipedLeft: () => {
      if (swipeProgress > 0.5) {
        setCardTransform('translateX(-100px) rotate(-5deg)');
        handleAnswer(false);
      }
      setTimeout(() => {
        setSwipeDirection(null);
        setSwipeProgress(0);
        setCardTransform('');
      }, 300);
    },
    onSwipedRight: () => {
      if (swipeProgress > 0.5) {
        setCardTransform('translateX(100px) rotate(5deg)');
        handleAnswer(true);
      }
      setTimeout(() => {
        setSwipeDirection(null);
        setSwipeProgress(0);
        setCardTransform('');
      }, 300);
    },
    onTouchEndOrOnMouseUp: () => {
      if (swipeProgress < 0.5) {
        setSwipeDirection(null);
        setSwipeProgress(0);
        setCardTransform('');
      }
    },
    trackMouse: true,
    trackTouch: true,
  });

  useEffect(() => {
    if (currentSession) {
      // Get words based on the current session configuration
      const wordsToStudy = getWordsForStudyType(words, currentSession.study_type, currentSession.folder_id);
      const limitedWords = wordsToStudy.slice(0, 20); // Limit to 20 words per session
      // Apply intelligent randomization for optimal learning
      const shuffledWords = shuffleWordsForStudy(limitedWords);
      setStudyWords(shuffledWords);
      setStartTime(new Date());
      
      if (wordsToStudy.length === 0) {
        setIsComplete(true);
      }
    } else {
      // Fallback to default behavior if no session
      const dueWords = words.filter(w => w.next_review <= new Date() || w.last_reviewed === null);
      const limitedWords = dueWords.slice(0, 20);
      // Apply intelligent randomization for optimal learning
      const shuffledWords = shuffleWordsForStudy(limitedWords);
      setStudyWords(shuffledWords);
      
      if (dueWords.length === 0) {
        setIsComplete(true);
      }
    }
  }, [words, currentSession]);

  const currentWord = studyWords[currentIndex];

  const handleAnswer = async (isCorrect: boolean) => {
    if (!currentWord || !user) return;

    const now = new Date();
    const newCorrectCount = isCorrect ? currentWord.correct_count + 1 : currentWord.correct_count;
    
    const updatedWord: Word = {
      ...currentWord,
      last_reviewed: now,
      review_count: currentWord.review_count + 1,
      correct_count: newCorrectCount,
      next_review: calculateNextReview(currentWord, isCorrect),
      difficulty: updateWordDifficulty(currentWord, isCorrect, newCorrectCount),
    };

    try {
      await onUpdateWord(updatedWord);
      
      const newStats = {
        correct: sessionStats.correct + (isCorrect ? 1 : 0),
        total: sessionStats.total + 1
      };
      setSessionStats(newStats);

      // Update the current session
      if (currentSession) {
        await updateStudySession(currentSession.id, {
          words_studied: newStats.total,
          correct_answers: newStats.correct,
          total_time_minutes: Math.floor((new Date().getTime() - startTime.getTime()) / 60000),
        });
      }

      // If this was the last word, complete the session
      if (currentIndex === studyWords.length - 1) {
        if (currentSession && profile) {
          // Update session completion
          const totalTimeMinutes = Math.ceil((Date.now() - startTime.getTime()) / (1000 * 60));
          await completeStudySession(currentSession.id, {
            words_studied: newStats.total,
            correct_answers: newStats.correct,
            total_time_minutes: totalTimeMinutes
          });

          // Update profile
          await supabase
            .from('profiles')
            .update({
              study_streak: profile.study_streak + 1,
              total_study_time: profile.total_study_time + totalTimeMinutes
            })
            .eq('id', user.id);

          // Check for new achievements
          await checkAchievements();
        }
        setIsComplete(true);
      } else {
        setCurrentIndex(currentIndex + 1);
        setShowDefinition(false); // Reset to not-revealed state for next word
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  // scheduling/level utilities moved to shared util

  if (studyWords.length === 0 && !isComplete) {
    return (
      <div className="min-h-screen bg-primary-bg">
        <div className="flex items-center justify-center py-16">
          <div className="max-w-2xl mx-auto px-4">
            <div className="text-center bg-white rounded-xl shadow-lg p-8 border border-primary-bg">
              <Trophy className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-primary-navy mb-2">No Words to Review!</h2>
              <p className="text-primary-text mb-6">You're all caught up. Come back later or add more words to study.</p>
              <button
                onClick={() => onNavigate('dashboard')}
                className="bg-primary-highlight text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-highlight/90 transition-all duration-200"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-primary-bg">
        <div className="flex items-center justify-center py-16">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-primary-bg">
              <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-primary-navy mb-4">Study Session Complete!</h2>
              
              {/* Session Summary */}
              {currentSession && (
                <div className="bg-primary-cream/50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {currentSession.folder_id && (
                      <Folder className="h-4 w-4 text-primary-text/70" />
                    )}
                    <p className="text-sm text-primary-text/70">
                      {currentSession.folder_id ? 'Folder Study' : 'All Words'} • {getStudyTypeDescription(currentSession.study_type)}
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-primary-cream rounded-lg p-6 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-primary-text/80">Words Studied</p>
                    <p className="text-2xl font-bold text-primary-text">{sessionStats.total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-primary-text/80">Accuracy</p>
                    <p className="text-2xl font-bold text-green-600">
                      {sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onNavigate('dashboard')}
                className="bg-primary-highlight text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-highlight/90 transition-all duration-200"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-bg">
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center text-primary-text hover:text-primary-highlight transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-primary-navy">Study Session</h1>
              {currentSession && (
                <p className="text-sm text-primary-text/70 mt-1">
                  {getStudyTypeDescription(currentSession.study_type)}
                </p>
              )}
            </div>
            <div className="text-sm text-primary-text">
              {currentIndex + 1} of {studyWords.length}
            </div>
          </div>
          
          <div className="w-full bg-primary-cream rounded-full h-2">
            <div 
              className="bg-primary-highlight h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / studyWords.length) * 100}%` }}
            />
          </div>
        </div>

        {currentWord && (
          <div 
            {...handlers}
            className="bg-white rounded-xl shadow-lg overflow-hidden border border-primary-bg relative cursor-grab active:cursor-grabbing"
            style={{
              transform: cardTransform,
              transition: 'transform 0.3s ease-out'
            }}
          >
            {/* Swipe Indicators */}
            <div 
              className="absolute inset-0 bg-green-500/10 transition-opacity duration-200 pointer-events-none"
              style={{ opacity: swipeDirection === 'right' ? swipeProgress : 0 }}
            >
              <div className="absolute top-4 right-4 text-green-600 font-medium text-sm">
                I Know It →
              </div>
            </div>
            <div 
              className="absolute inset-0 bg-red-500/10 transition-opacity duration-200 pointer-events-none"
              style={{ opacity: swipeDirection === 'left' ? swipeProgress : 0 }}
            >
              <div className="absolute top-4 left-4 text-red-600 font-medium text-sm">
                ← Keep Learning
              </div>
            </div>

            <div className="p-8">
              <div className="text-center mb-8">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${
                  currentWord.difficulty === 'new' ? 'bg-primary-highlight/20 text-primary-highlight' :
                  currentWord.difficulty === 'learning' ? 'bg-yellow-100 text-yellow-800' :
                  currentWord.difficulty === 'review' ? 'bg-orange-100 text-orange-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {currentWord.difficulty.charAt(0).toUpperCase() + currentWord.difficulty.slice(1)}
                </div>
                
                <h2 className="text-4xl font-bold text-primary-navy mb-8">
                  {currentWord.article && <span className="text-primary-highlight mr-4">{currentWord.article}</span>}
                  {currentWord.word}
                </h2>
                
                {/* Definition area with fixed height */}
                <div className="min-h-[120px] mb-6">
                  {!showDefinition ? (
                    <button
                      onClick={() => setShowDefinition(true)}
                      className="bg-primary-navy text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-navy/90 transition-all duration-200"
                    >
                      Reveal Definition
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-primary-cream rounded-lg p-6">
                        <p className="text-lg text-primary-text leading-relaxed">{currentWord.definition}</p>
                      </div>
                      
                      <button
                        onClick={() => setShowDefinition(false)}
                        className="bg-primary-text/20 text-primary-text px-4 py-2 rounded-lg font-medium hover:bg-primary-text/30 transition-all duration-200"
                      >
                        Hide Definition
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Action buttons always visible */}
                <div className="space-y-4">
                  <div className="text-sm text-primary-text/70 text-center">
                    Swipe left to keep learning or right if you know it
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => handleAnswer(false)}
                      className="flex items-center px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors duration-200"
                    >
                      <X className="h-5 w-5 mr-2" />
                      Keep Learning
                    </button>
                    
                    <button
                      onClick={() => handleAnswer(true)}
                      className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors duration-200"
                    >
                      <Check className="h-5 w-5 mr-2" />
                      I Know It
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};