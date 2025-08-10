import { Word } from '../types/database';

/**
 * Smart study algorithm that randomizes words while optimizing for learning effectiveness
 * Uses spaced repetition principles and prioritizes words that need more practice
 */
export const shuffleWordsForStudy = (words: Word[]): Word[] => {
  if (words.length === 0) return words;

  // Create weighted groups based on learning priority
  const priorityGroups = {
    high: [] as Word[],    // Failed words, overdue words
    medium: [] as Word[],  // Learning words, words due today
    low: [] as Word[]      // New words, mastered words
  };

  const now = new Date();
  
  words.forEach(word => {
    const daysSinceLastReview = word.last_reviewed 
      ? Math.floor((now.getTime() - new Date(word.last_reviewed).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    const isOverdue = word.next_review ? new Date(word.next_review) < now : false;
    const hasLowAccuracy = word.review_count > 0 && (word.correct_count / word.review_count) < 0.6;
    
    // High priority: words that need immediate attention
    if (hasLowAccuracy || (isOverdue && daysSinceLastReview > 2) || word.difficulty === 'failed') {
      priorityGroups.high.push(word);
    }
    // Medium priority: words in active learning phase
    else if (word.difficulty === 'learning' || (isOverdue && daysSinceLastReview <= 2)) {
      priorityGroups.medium.push(word);
    }
    // Low priority: new words and well-learned words
    else {
      priorityGroups.low.push(word);
    }
  });

  // Shuffle each group independently
  const shuffledHigh = shuffleArray([...priorityGroups.high]);
  const shuffledMedium = shuffleArray([...priorityGroups.medium]);
  const shuffledLow = shuffleArray([...priorityGroups.low]);

  // Combine groups with smart interleaving
  return interleaveGroups(shuffledHigh, shuffledMedium, shuffledLow);
};

/**
 * Fisher-Yates shuffle algorithm for true randomization
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Intelligently interleave priority groups to optimize learning
 * High priority words appear more frequently throughout the session
 */
const interleaveGroups = (high: Word[], medium: Word[], low: Word[]): Word[] => {
  const result: Word[] = [];
  const totalWords = high.length + medium.length + low.length;
  
  // If we have few words, just combine them randomly
  if (totalWords <= 5) {
    return shuffleArray([...high, ...medium, ...low]);
  }

  let highIndex = 0, mediumIndex = 0, lowIndex = 0;
  
  for (let i = 0; i < totalWords; i++) {
    // Determine which group to pick from based on position and availability
    const position = i / totalWords;
    
    // High priority words: distribute throughout, with emphasis on beginning and middle
    if (highIndex < high.length && (
      position < 0.7 && Math.random() < 0.4 || // 40% chance in first 70%
      highIndex === 0 || // Always include first high priority word early
      (mediumIndex >= medium.length && lowIndex >= low.length) // Only high priority left
    )) {
      result.push(high[highIndex++]);
    }
    // Medium priority words: steady distribution
    else if (mediumIndex < medium.length && (
      Math.random() < 0.5 || // 50% chance when available
      (highIndex >= high.length && lowIndex >= low.length) // Only medium priority left
    )) {
      result.push(medium[mediumIndex++]);
    }
    // Low priority words: fill remaining slots
    else if (lowIndex < low.length) {
      result.push(low[lowIndex++]);
    }
    // Fallback: pick from any remaining group
    else if (highIndex < high.length) {
      result.push(high[highIndex++]);
    } else if (mediumIndex < medium.length) {
      result.push(medium[mediumIndex++]);
    }
  }
  
  return result;
};

/**
 * Additional randomization for words within the same difficulty level
 * Prevents alphabetical or creation-date ordering
 */
export const randomizeWithinDifficulty = (words: Word[]): Word[] => {
  const groupedByDifficulty = words.reduce((acc, word) => {
    if (!acc[word.difficulty]) {
      acc[word.difficulty] = [];
    }
    acc[word.difficulty].push(word);
    return acc;
  }, {} as Record<string, Word[]>);

  // Shuffle within each difficulty group
  Object.keys(groupedByDifficulty).forEach(difficulty => {
    groupedByDifficulty[difficulty] = shuffleArray(groupedByDifficulty[difficulty]);
  });

  // Recombine while maintaining relative priority
  const difficulties = ['failed', 'learning', 'new', 'review', 'mastered'];
  return difficulties.flatMap(diff => groupedByDifficulty[diff] || []);
};