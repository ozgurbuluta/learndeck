import { Word } from '@shared/types';

/**
 * Calculate the next review date based on current difficulty and answer correctness
 */
export const calculateNextReview = (word: Word, isCorrect: boolean): Date => {
  const now = new Date();
  let intervalDays = 1;

  if (word.difficulty === 'new') {
    intervalDays = isCorrect ? 1 : 0.5; // half-day for quick retry
  } else if (word.difficulty === 'learning') {
    intervalDays = isCorrect ? 3 : 1;
  } else if (word.difficulty === 'review') {
    intervalDays = isCorrect ? 7 : 2;
  } else if (word.difficulty === 'mastered') {
    intervalDays = isCorrect ? 30 : 7;
  }

  const nextReview = new Date(now);
  const ms = intervalDays * 24 * 60 * 60 * 1000;
  nextReview.setTime(nextReview.getTime() + ms);
  return nextReview;
};

/**
 * Update difficulty based on answer performance and accumulated correct answers
 */
export const updateWordDifficulty = (
  word: Word,
  isCorrect: boolean,
  newCorrectCount: number
): Word['difficulty'] => {
  if (isCorrect) {
    if (word.difficulty === 'new') {
      return 'learning';
    }
    if (word.difficulty === 'learning' && newCorrectCount >= 3) {
      return 'review';
    }
    if (word.difficulty === 'review' && newCorrectCount >= 10) {
      return 'mastered';
    }
  } else {
    if (word.difficulty === 'mastered') return 'review';
    if (word.difficulty === 'review') return 'learning';
  }
  return word.difficulty;
};


