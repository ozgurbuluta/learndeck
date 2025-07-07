import { Word } from '@shared/types';

export const calculateNextReview = (word: Word, isCorrect: boolean): Date => {
  const now = new Date();
  let intervalDays = 1;

  if (word.difficulty === 'new') {
    intervalDays = isCorrect ? 1 : 0.5;
  } else if (word.difficulty === 'learning') {
    intervalDays = isCorrect ? 3 : 1;
  } else if (word.difficulty === 'review') {
    intervalDays = isCorrect ? 7 : 2;
  } else if (word.difficulty === 'mastered') {
    intervalDays = isCorrect ? 30 : 7;
  }

  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + intervalDays);
  return nextReview;
};

export const updateWordDifficulty = (word: Word, isCorrect: boolean, correctCount: number): Word['difficulty'] => {
  if (isCorrect) {
    // Progress through difficulty levels based on correct answers
    if (word.difficulty === 'new') {
      return 'learning'; // First correct answer moves from new to learning
    }
    if (word.difficulty === 'learning' && correctCount >= 3) {
      return 'review'; // After 3 total correct answers, move to review
    }
    if (word.difficulty === 'review' && correctCount >= 10) {
      return 'mastered'; // After 10 total correct answers, move to mastered
    }
  } else {
    // Demote on incorrect answers
    if (word.difficulty === 'mastered') return 'review';
    if (word.difficulty === 'review') return 'learning';
    // Learning and new words stay at their current level on incorrect answers
  }
  return word.difficulty;
};

export const getWordsForStudy = (words: Word[], limit: number = 20): Word[] => {
  const now = new Date();
  
  // Include words that are due for review OR have never been reviewed (new words)
  const dueWords = words
    .filter(word => word.next_review <= now || word.last_reviewed === null)
    .sort((a, b) => {
      // Prioritize by difficulty and last reviewed
      const difficultyPriority = {
        'new': 4,
        'learning': 3,
        'review': 2,
        'mastered': 1
      };
      
      const aPriority = difficultyPriority[a.difficulty];
      const bPriority = difficultyPriority[b.difficulty];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      return (a.last_reviewed?.getTime() || 0) - (b.last_reviewed?.getTime() || 0);
    });

  return dueWords.slice(0, limit);
};