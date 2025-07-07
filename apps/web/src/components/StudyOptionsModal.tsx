import React, { useState } from 'react';
import { X, BookOpen, Brain, RotateCcw, Trophy, AlertCircle, Play } from 'lucide-react';
import { Folder, StudyType, Word } from '@shared/types';

interface StudyOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: Folder | null; // null means "All Words"
  words: Word[];
  onStartStudy: (folderId: string | null, studyType: StudyType) => void;
}

export const StudyOptionsModal: React.FC<StudyOptionsModalProps> = ({
  isOpen,
  onClose,
  folder,
  words,
  onStartStudy,
}) => {
  const [selectedStudyType, setSelectedStudyType] = useState<StudyType>('all');

  if (!isOpen) return null;

  // Filter words based on folder
  const folderWords = folder 
    ? words.filter(word => word.folders?.some(f => f.id === folder.id))
    : words;

  // Calculate word counts for each study type
  const wordCounts = {
    all: folderWords.length,
    new: folderWords.filter(w => w.difficulty === 'new').length,
    learning: folderWords.filter(w => w.difficulty === 'learning').length,
    review: folderWords.filter(w => w.difficulty === 'review').length,
    mastered: folderWords.filter(w => w.difficulty === 'mastered').length,
    failed: folderWords.filter(w => w.review_count > 0 && (w.correct_count / w.review_count) < 0.5).length,
  };

  const studyOptions = [
    {
      type: 'all' as StudyType,
      title: 'All Words',
      description: 'Study all words in this collection',
      icon: BookOpen,
      color: 'bg-primary-navy',
      count: wordCounts.all,
    },
    {
      type: 'new' as StudyType,
      title: 'New Words',
      description: 'Words you haven\'t studied yet',
      icon: Brain,
      color: 'bg-primary-highlight',
      count: wordCounts.new,
    },
    {
      type: 'review' as StudyType,
      title: 'Due for Review',
      description: 'Words scheduled for review today',
      icon: RotateCcw,
      color: 'bg-blue-500',
      count: folderWords.filter(w => w.next_review <= new Date()).length,
    },
    {
      type: 'learning' as StudyType,
      title: 'Learning',
      description: 'Words you\'re currently learning',
      icon: Brain,
      color: 'bg-yellow-500',
      count: wordCounts.learning,
    },
    {
      type: 'mastered' as StudyType,
      title: 'Mastered',
      description: 'Review your mastered words',
      icon: Trophy,
      color: 'bg-green-500',
      count: wordCounts.mastered,
    },
    {
      type: 'failed' as StudyType,
      title: 'Difficult Words',
      description: 'Words with low accuracy rates',
      icon: AlertCircle,
      color: 'bg-red-500',
      count: wordCounts.failed,
    },
  ];

  const handleStartStudy = () => {
    onStartStudy(folder?.id || null, selectedStudyType);
    onClose();
  };

  const selectedOption = studyOptions.find(opt => opt.type === selectedStudyType);
  const canStart = selectedOption && selectedOption.count > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-primary-navy mb-2">
                Study Options
              </h2>
              <div className="flex items-center gap-2">
                {folder && (
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: folder.color }}
                  />
                )}
                <p className="text-primary-text">
                  {folder ? folder.name : 'All Words'} • {folderWords.length} total words
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-primary-text/50 hover:text-primary-text transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Study Type Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {studyOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => setSelectedStudyType(option.type)}
                disabled={option.count === 0}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200 text-left
                  ${selectedStudyType === option.type
                    ? 'border-primary-highlight bg-primary-highlight/10'
                    : option.count > 0
                    ? 'border-primary-bg hover:border-primary-highlight/50 bg-primary-cream/30'
                    : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${option.color}`}>
                    <option.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className={`text-2xl font-bold ${
                    option.count > 0 ? 'text-primary-text' : 'text-gray-400'
                  }`}>
                    {option.count}
                  </span>
                </div>
                <h3 className={`font-semibold mb-1 ${
                  option.count > 0 ? 'text-primary-navy' : 'text-gray-400'
                }`}>
                  {option.title}
                </h3>
                <p className={`text-sm ${
                  option.count > 0 ? 'text-primary-text/70' : 'text-gray-400'
                }`}>
                  {option.description}
                </p>
              </button>
            ))}
          </div>

          {/* Selected Option Summary */}
          {selectedOption && (
            <div className="bg-primary-cream/50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${selectedOption.color}`}>
                  <selectedOption.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-primary-navy">
                    Ready to study: {selectedOption.title}
                  </h4>
                  <p className="text-sm text-primary-text/70">
                    {selectedOption.count} words • {folder ? folder.name : 'All Words'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleStartStudy}
              disabled={!canStart}
              className="flex-1 bg-primary-highlight text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-highlight/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              <Play className="h-5 w-5 mr-2" />
              Start Studying
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-primary-bg text-primary-text rounded-lg font-medium hover:bg-primary-cream/50 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>

          {/* Empty State */}
          {folderWords.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-16 w-16 text-primary-text/30 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-primary-navy mb-2">No Words Available</h3>
              <p className="text-primary-text/70">
                {folder 
                  ? `Add some words to the "${folder.name}" folder to start studying.`
                  : 'Add some words to your collection to start studying.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};