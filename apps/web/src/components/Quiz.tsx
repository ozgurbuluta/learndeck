import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, Shuffle, Award } from 'lucide-react';
import { Word } from '@shared/types';
// Local sampling helpers are defined at the bottom of this file for performance
import { calculateNextReview, updateWordDifficulty } from '../utils/reviewScheduling';

interface QuizProps {
  words: Word[];
  onUpdateWord: (word: Word) => Promise<void>;
  onNavigate: (view: string) => void;
  currentView?: string;
}

type QuizQuestion = {
  word: Word;
  choices: string[]; // definitions
  correctIndex: number;
};

const NUM_QUESTIONS_DEFAULT = 10;

export const Quiz: React.FC<QuizProps> = ({ words, onUpdateWord, onNavigate }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [numQuestions, setNumQuestions] = useState(NUM_QUESTIONS_DEFAULT);
  const [isGenerating, setIsGenerating] = useState(false);

  const eligibleWords = useMemo(() => {
    // Avoid creating new arrays unnecessarily when words is large
    return words.filter(w => !!w.definition && w.definition.trim().length > 0);
  }, [words]);

  const regenerateQuiz = useCallback(() => {
    setIsGenerating(true);
    const count = Math.min(numQuestions, Math.max(0, eligibleWords.length));
    const base = sampleWithoutReplacement(eligibleWords, count);

    const qs: QuizQuestion[] = base.map(w => {
      // Build a capped distractor pool for performance on large datasets
      const allDefs = (eligibleWords.length > 500
        ? eligibleWords.slice(0, 500)
        : eligibleWords).map(x => x.definition);
      const pool = allDefs.filter(d => d !== w.definition);
      const incorrect = sampleWithoutReplacement(pool, 3);
      const choices = shuffleArray([w.definition, ...incorrect]);
      return {
        word: w,
        choices,
        correctIndex: choices.indexOf(w.definition),
      };
    });

    setQuestions(qs);
    setCurrentIndex(0);
    setSelectedIndex(null);
    setScore(0);
    setCompleted(false);
    setIsGenerating(false);
  }, [eligibleWords, numQuestions]);

  useEffect(() => {
    if (eligibleWords.length >= 4) {
      regenerateQuiz();
    }
  }, [eligibleWords.length, numQuestions, regenerateQuiz]);

  const current = questions[currentIndex];

  const handleSelect = async (idx: number) => {
    if (selectedIndex !== null || !current) return;
    setSelectedIndex(idx);
    const isCorrect = idx === current.correctIndex;
    if (isCorrect) setScore(prev => prev + 1);

    // Update SRS stats for the word
    const now = new Date();
    const newCorrectCount = isCorrect ? current.word.correct_count + 1 : current.word.correct_count;
    const updatedWord: Word = {
      ...current.word,
      last_reviewed: now,
      review_count: current.word.review_count + 1,
      correct_count: newCorrectCount,
      next_review: calculateNextReview(current.word, isCorrect),
      difficulty: updateWordDifficulty(current.word, isCorrect, newCorrectCount),
    };
    try {
      await onUpdateWord(updatedWord);
    } catch (e) {
      // ignore, keep quiz flowing
      console.error('Failed to update word after quiz answer', e);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setCompleted(true);
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelectedIndex(null);
    }
  };

  const handleRestart = () => {
    regenerateQuiz();
  };

  if (eligibleWords.length < 4) {
    return (
      <div className="min-h-screen bg-primary-bg">
        <main className="max-w-3xl mx-auto px-4 py-8">
          <button onClick={() => onNavigate('dashboard')} className="flex items-center text-primary-text hover:text-primary-highlight transition-colors duration-200 mb-6">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-bg text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-primary-navy mb-2">Not enough words yet</h1>
            <p className="text-primary-text/80">Add at least 4 words to start a quiz.</p>
          </div>
        </main>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-primary-bg">
        <main className="max-w-3xl mx-auto px-4 py-8">
          <button onClick={() => onNavigate('dashboard')} className="flex items-center text-primary-text hover:text-primary-highlight transition-colors duration-200 mb-6">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-bg text-center">
            <Award className="h-14 w-14 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-primary-navy mb-2">Quiz Complete!</h1>
            <p className="text-primary-text/80 mb-6">You scored {score} / {questions.length}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={handleRestart} className="bg-primary-highlight text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-highlight/90 transition-all duration-200 flex items-center">
                <Shuffle className="h-5 w-5 mr-2" />
                New Quiz
              </button>
              <button onClick={() => onNavigate('dashboard')} className="px-6 py-3 border border-primary-bg rounded-lg font-medium text-primary-text hover:bg-primary-cream/50 transition-all duration-200">
                Back to Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-bg">
      <main className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => onNavigate('dashboard')} className="flex items-center text-primary-text hover:text-primary-highlight transition-colors duration-200 mb-6">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-primary-navy">Quiz</h1>
          <div className="text-sm text-primary-text">{currentIndex + 1} of {questions.length}</div>
        </div>

        <div className="w-full bg-primary-cream rounded-full h-2 mb-6">
          <div className="bg-primary-highlight h-2 rounded-full transition-all duration-500" style={{ width: `${((currentIndex + 1) / Math.max(questions.length, 1)) * 100}%` }} />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mb-6">
          <label className="text-sm text-primary-text/80">Questions:</label>
          <select
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            className="px-3 py-1 border border-primary-bg rounded-lg bg-white text-primary-text text-sm"
          >
            {[5, 10, 15, 20].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <button
            onClick={regenerateQuiz}
            disabled={isGenerating}
            className="ml-auto inline-flex items-center px-3 py-2 bg-primary-navy text-white rounded-lg text-sm hover:bg-primary-navy/90 disabled:opacity-50"
          >
            <Shuffle className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Regenerate'}
          </button>
        </div>

        {current && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-primary-bg">
            <div className="mb-6">
              <div className="text-sm text-primary-text/70 mb-2">Select the correct definition</div>
              <h2 className="text-2xl font-bold text-primary-navy">
                {current.word.article && <span className="text-primary-highlight mr-2">{current.word.article}</span>}
                {current.word.word}
              </h2>
            </div>

            <div className="space-y-3">
              {current.choices.map((choice, idx) => {
                const isSelected = selectedIndex === idx;
                const isCorrect = idx === current.correctIndex;
                const showState = selectedIndex !== null;
                const base = 'w-full text-left p-4 rounded-lg border transition-all duration-200';
                const idle = 'border-primary-bg hover:bg-primary-cream/50';
                const correct = 'border-green-200 bg-green-50';
                const wrong = 'border-red-200 bg-red-50';
                const cls = showState
                  ? isCorrect
                    ? `${base} ${correct}`
                    : isSelected
                      ? `${base} ${wrong}`
                      : `${base} ${idle}`
                  : `${base} ${idle}`;
                return (
                  <button key={idx} onClick={() => handleSelect(idx)} disabled={selectedIndex !== null} className={cls}>
                    <div className="flex items-start">
                      <span className="mr-3 mt-0.5 text-primary-text/60">{String.fromCharCode(65 + idx)}.</span>
                      <span className="text-primary-text">{choice}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {selectedIndex !== null && (
              <div className="mt-6">
                {selectedIndex === current.correctIndex ? (
                  <div className="flex items-center text-green-600"><CheckCircle2 className="h-5 w-5 mr-2" />Correct</div>
                ) : (
                  <div className="text-red-600">
                    <div className="flex items-center mb-1"><XCircle className="h-5 w-5 mr-2" />Incorrect</div>
                    <div className="text-sm text-primary-text/80">Correct answer: {current.choices[current.correctIndex]}</div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button onClick={handleNext} disabled={selectedIndex === null} className="px-5 py-2 bg-primary-highlight text-white rounded-lg font-medium disabled:opacity-50">
                {currentIndex + 1 >= questions.length ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

function shuffleArray<T>(array: T[]): T[] {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sampleWithoutReplacement<T>(array: T[], k: number): T[] {
  if (k <= 0) return [];
  if (array.length <= k) return shuffleArray(array).slice(0, k);
  const result: T[] = [];
  const used = new Set<number>();
  while (result.length < k && used.size < array.length) {
    const idx = Math.floor(Math.random() * array.length);
    if (!used.has(idx)) {
      used.add(idx);
      result.push(array[idx]);
    }
  }
  return result;
}


