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
  } else if (word.difficulty === 'failed') {
    intervalDays = isCorrect ? 1 : 0.25; // aggressive retry for failed words
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
  // Calculate accuracy for failed word detection
  const accuracy = word.review_count > 0 ? newCorrectCount / (word.review_count + 1) : (isCorrect ? 1 : 0);
  
  if (isCorrect) {
    // Correct answer - potentially promote
    if (word.difficulty === 'failed') {
      return 'learning'; // failed words go back to learning when correct
    }
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
    // Incorrect answer - potentially demote or mark as failed
    if (word.review_count >= 3 && accuracy < 0.3) {
      return 'failed'; // mark as failed if consistently wrong
    }
    if (word.difficulty === 'mastered') return 'review';
    if (word.difficulty === 'review') return 'learning';
  }
  return word.difficulty;
};


