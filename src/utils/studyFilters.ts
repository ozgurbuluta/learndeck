import { Word, StudyType } from '../types';

export const getWordsForStudyType = (words: Word[], studyType: StudyType, folderId: string | null): Word[] => {
  // First filter by folder if specified
  let filteredWords = folderId 
    ? words.filter(word => word.folders?.some(f => f.id === folderId))
    : words;

  // Then filter by study type
  switch (studyType) {
    case 'all':
      return filteredWords;
    
    case 'new':
      return filteredWords.filter(word => word.difficulty === 'new');
    
    case 'learning':
      return filteredWords.filter(word => word.difficulty === 'learning');
    
    case 'review':
      return filteredWords.filter(word => 
        word.difficulty === 'review' || word.next_review <= new Date()
      );
    
    case 'mastered':
      return filteredWords.filter(word => word.difficulty === 'mastered');
    
    case 'failed':
      return filteredWords.filter(word => 
        word.review_count > 0 && (word.correct_count / word.review_count) < 0.5
      );
    
    default:
      return filteredWords;
  }
};

export const getStudyTypeDescription = (studyType: StudyType): string => {
  switch (studyType) {
    case 'all':
      return 'All words in the collection';
    case 'new':
      return 'Words you haven\'t studied yet';
    case 'learning':
      return 'Words you\'re currently learning';
    case 'review':
      return 'Words due for review';
    case 'mastered':
      return 'Words you\'ve mastered';
    case 'failed':
      return 'Words with low accuracy rates';
    default:
      return 'Study session';
  }
};

export const getStudyTypeIcon = (studyType: StudyType): string => {
  switch (studyType) {
    case 'all':
      return 'BookOpen';
    case 'new':
      return 'Brain';
    case 'learning':
      return 'Brain';
    case 'review':
      return 'RotateCcw';
    case 'mastered':
      return 'Trophy';
    case 'failed':
      return 'AlertCircle';
    default:
      return 'BookOpen';
  }
};