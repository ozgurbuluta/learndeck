import type { Word } from '../types';

/**
 * Smart study algorithm that randomizes words while optimizing for learning effectiveness
 * Uses spaced repetition principles and prioritizes words that need more practice
 */
export const shuffleWordsForStudy = (words: Word[]): Word[] => {
  if (words.length === 0) return words;

  const priorityGroups = {
    high: [] as Word[],
    medium: [] as Word[],
    low: [] as Word[],
  };

  const now = new Date();

  words.forEach((word) => {
    const daysSinceLastReview = word.last_reviewed
      ? Math.floor((now.getTime() - new Date(word.last_reviewed).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const isOverdue = word.next_review ? new Date(word.next_review) < now : false;
    const hasLowAccuracy = word.review_count > 0 && word.correct_count / word.review_count < 0.6;

    if (hasLowAccuracy || (isOverdue && daysSinceLastReview > 2) || word.difficulty === 'failed') {
      priorityGroups.high.push(word);
    } else if (word.difficulty === 'learning' || (isOverdue && daysSinceLastReview <= 2)) {
      priorityGroups.medium.push(word);
    } else {
      priorityGroups.low.push(word);
    }
  });

  const shuffledHigh = shuffleArray([...priorityGroups.high]);
  const shuffledMedium = shuffleArray([...priorityGroups.medium]);
  const shuffledLow = shuffleArray([...priorityGroups.low]);

  return interleaveGroups(shuffledHigh, shuffledMedium, shuffledLow);
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const interleaveGroups = (high: Word[], medium: Word[], low: Word[]): Word[] => {
  const result: Word[] = [];
  const totalWords = high.length + medium.length + low.length;

  if (totalWords <= 5) {
    return shuffleArray([...high, ...medium, ...low]);
  }

  let highIndex = 0,
    mediumIndex = 0,
    lowIndex = 0;

  for (let i = 0; i < totalWords; i++) {
    const position = i / totalWords;

    if (
      highIndex < high.length &&
      ((position < 0.7 && Math.random() < 0.4) || highIndex === 0 || (mediumIndex >= medium.length && lowIndex >= low.length))
    ) {
      result.push(high[highIndex++]);
    } else if (
      mediumIndex < medium.length &&
      (Math.random() < 0.5 || (highIndex >= high.length && lowIndex >= low.length))
    ) {
      result.push(medium[mediumIndex++]);
    } else if (lowIndex < low.length) {
      result.push(low[lowIndex++]);
    } else if (highIndex < high.length) {
      result.push(high[highIndex++]);
    } else if (mediumIndex < medium.length) {
      result.push(medium[mediumIndex++]);
    }
  }

  return result;
};

export const randomizeWithinDifficulty = (words: Word[]): Word[] => {
  const groupedByDifficulty = words.reduce((acc, word) => {
    if (!acc[word.difficulty]) {
      (acc as any)[word.difficulty] = [] as Word[];
    }
    (acc as any)[word.difficulty].push(word);
    return acc;
  }, {} as Record<string, Word[]>);

  Object.keys(groupedByDifficulty).forEach((difficulty) => {
    groupedByDifficulty[difficulty] = shuffleArray(groupedByDifficulty[difficulty]);
  });

  const difficulties = ['failed', 'learning', 'new', 'review', 'mastered'];
  return difficulties.flatMap((diff) => groupedByDifficulty[diff] || []);
};


