import React from 'react';
import { ArrowLeft, TrendingUp, Target, Clock, Trophy } from 'lucide-react';
import { Word } from '@shared/types';

interface ProgressProps {
  words: Word[];
  onNavigate: (view: string) => void;
  currentView?: string;
}

export const Progress: React.FC<ProgressProps> = ({ words, onNavigate, currentView: _currentView }) => {
  const totalWords = words.length;
  const newWords = words.filter(w => w.difficulty === 'new').length;
  const learningWords = words.filter(w => w.difficulty === 'learning').length;
  const reviewWords = words.filter(w => w.difficulty === 'review').length;
  const masteredWords = words.filter(w => w.difficulty === 'mastered').length;
  
  const totalReviews = words.reduce((sum, word) => sum + word.review_count, 0);
  const totalCorrect = words.reduce((sum, word) => sum + word.correct_count, 0);
  const overallAccuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;
  
  const dueForReview = words.filter(w => w.next_review <= new Date()).length;

  const difficultyData = [
    { label: 'New', count: newWords, color: 'bg-primary-highlight', percentage: totalWords > 0 ? (newWords / totalWords) * 100 : 0 },
    { label: 'Learning', count: learningWords, color: 'bg-yellow-500', percentage: totalWords > 0 ? (learningWords / totalWords) * 100 : 0 },
    { label: 'Review', count: reviewWords, color: 'bg-orange-500', percentage: totalWords > 0 ? (reviewWords / totalWords) * 100 : 0 },
    { label: 'Mastered', count: masteredWords, color: 'bg-green-500', percentage: totalWords > 0 ? (masteredWords / totalWords) * 100 : 0 },
  ];

  return (
    <div className="min-h-screen bg-primary-bg">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center text-primary-text hover:text-primary-highlight transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-primary-navy mb-2">Learning Progress</h1>
          <p className="text-primary-text">Track your vocabulary learning journey and achievements.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Words"
            value={totalWords}
            icon={Target}
            color="bg-primary-navy"
          />
          <StatCard
            title="Overall Accuracy"
            value={`${overallAccuracy}%`}
            icon={TrendingUp}
            color="bg-green-500"
          />
          <StatCard
            title="Total Reviews"
            value={totalReviews}
            icon={Clock}
            color="bg-primary-highlight"
          />
          <StatCard
            title="Words Mastered"
            value={masteredWords}
            icon={Trophy}
            color="bg-yellow-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-primary-bg">
            <h2 className="text-xl font-semibold text-primary-navy mb-6">Learning Distribution</h2>
            <div className="space-y-4">
              {difficultyData.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-primary-text">{item.label}</span>
                    <span className="text-sm text-primary-text/70">{item.count} words</span>
                  </div>
                  <div className="w-full bg-primary-cream rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-primary-bg">
            <h2 className="text-xl font-semibold text-primary-navy mb-6">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-primary-bg">
                <span className="text-primary-text/80">Words due for review</span>
                <span className="font-semibold text-primary-text">{dueForReview}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-primary-bg">
                <span className="text-primary-text/80">Mastery rate</span>
                <span className="font-semibold text-primary-text">
                  {totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-primary-bg">
                <span className="text-primary-text/80">Average reviews per word</span>
                <span className="font-semibold text-primary-text">
                  {totalWords > 0 ? Math.round(totalReviews / totalWords) : 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-primary-text/80">Success rate</span>
                <span className="font-semibold text-green-600">{overallAccuracy}%</span>
              </div>
            </div>
          </div>
        </div>

        {totalWords === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-primary-text/40 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-primary-navy mb-2">No data yet</h3>
            <p className="text-primary-text mb-6">Add some words and start studying to see your progress!</p>
            <button
              onClick={() => onNavigate('add-word')}
              className="bg-primary-highlight text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-highlight/90 transition-all duration-200"
            >
              Add Your First Word
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-primary-bg">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-primary-text/70 mb-1">{title}</p>
        <p className="text-3xl font-bold text-primary-text">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);