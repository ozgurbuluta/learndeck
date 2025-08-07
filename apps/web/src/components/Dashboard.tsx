import { useState } from 'react';
import { Plus, BookOpen, TrendingUp, Brain, Target, Trophy, ArrowRight, Zap, Play, MessageCircle, Info, HelpCircle } from 'lucide-react';
import { Word } from '@shared/types';
import { StudyOptionsModal } from './StudyOptionsModal';
import { useStudySessions } from '../hooks/useStudySessions';
import { useAuth } from '../hooks/useAuth';
import { FloatingChatbot } from './FloatingChatbot';

interface DashboardProps {
  words: Word[];
  onNavigate: (view: string) => void;
  currentView?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ words, onNavigate, currentView: _currentView }) => {
  void _currentView;
  const { user } = useAuth();
  const { recentStudyOptions, startStudySession } = useStudySessions(user);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<any>(null);
  const [isChatbotOpen, setChatbotOpen] = useState(false);

  const handleQuickStudy = () => {
    setSelectedFolder(null); // All words
    setShowStudyModal(true);
  };

  const totalWords = words.length;
  const masteredWords = words.filter(w => w.difficulty === 'mastered').length;
  const newWords = words.filter(w => w.difficulty === 'new').length;
  const learningWords = words.filter(w => w.difficulty === 'learning').length;
  
  // Calculate how many words were added in the last 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const wordsAddedThisWeek = words.filter((w) => w.created_at >= oneWeekAgo).length;

  // Include words that are due for review OR have never been reviewed (new words)
  const dueForReview = words.filter(w => 
    w.next_review <= new Date() || w.last_reviewed === null
  ).length;

  const totalReviews = words.reduce((sum, word) => sum + word.review_count, 0);
  const totalCorrect = words.reduce((sum, word) => sum + word.correct_count, 0);
  const overallAccuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

  const handleRecentStudyOption = (option: any) => {
    setSelectedFolder(option.folder || null);
    setShowStudyModal(true);
  };

  const handleStartStudy = async (folderId: string | null, studyType: any) => {
    const session = await startStudySession(folderId, studyType);
    if (session) {
      setShowStudyModal(false);
      onNavigate('study');
    }
  };

  const stats = [
    { 
      label: 'Total Words', 
      value: totalWords, 
      icon: BookOpen, 
      color: 'bg-primary-navy', 
      trend: `${wordsAddedThisWeek > 0 ? '+' : ''}${wordsAddedThisWeek} this week`,
      onClick: () => onNavigate('word-list'),
      description: 'View all words',
      disabled: totalWords === 0
    },
    { 
      label: 'Due for Review', 
      value: dueForReview, 
      icon: Brain, 
      color: 'bg-primary-highlight', 
      trend: 'Ready now',
      onClick: handleQuickStudy,
      description: 'Start studying',
      disabled: dueForReview === 0
    },
    { 
      label: 'Mastered', 
      value: masteredWords, 
      icon: Trophy, 
      color: 'bg-green-500', 
      trend: `${totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0}% complete`,
      onClick: () => onNavigate('progress'),
      description: 'View progress',
      disabled: false
    },
    { 
      label: 'Accuracy', 
      value: `${overallAccuracy}%`, 
      icon: Target, 
      color: 'bg-blue-500', 
      trend: 'Last 7 days',
      onClick: () => onNavigate('progress'),
      description: 'View statistics',
      disabled: totalReviews === 0
    },
  ];

  const actions = [
    {
      title: "AI Assistant",
      description: "Chat with AI to create flashcards",
      icon: MessageCircle,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      onClick: () => setChatbotOpen(true),
      disabled: false,
      badge: "New",
      cta: "Open chat"
    },
    {
      title: "Quick Quiz",
      description: "Multiple-choice practice",
      icon: HelpCircle,
      color: "bg-gradient-to-r from-indigo-500 to-blue-600",
      onClick: () => onNavigate('quiz'),
      disabled: totalWords < 4,
      badge: totalWords >= 4 ? null : 'Add words',
      cta: "Start quiz"
    },
    {
      title: "Quick Study",
      description: `${dueForReview} words ready`,
      icon: Zap,
      color: "bg-gradient-to-r from-primary-highlight to-orange-500",
      onClick: handleQuickStudy,
      disabled: dueForReview === 0,
      badge: dueForReview > 0 ? dueForReview.toString() : null,
      cta: "Start session"
    },
    {
      title: "Add New Words",
      description: "Expand your vocabulary",
      icon: Plus,
      color: "bg-gradient-to-r from-primary-navy to-blue-600",
      onClick: () => onNavigate('add-word'),
      disabled: false,
      cta: "Add words"
    },
    {
      title: "View Progress",
      description: "Track learning statistics",
      icon: TrendingUp,
      color: "bg-gradient-to-r from-green-500 to-teal-500",
      onClick: () => onNavigate('progress'),
      disabled: totalReviews === 0,
      cta: "View stats"
    }
  ];

  return (
    <div className="min-h-screen bg-primary-bg">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary-navy mb-4">
            Welcome back to your learning journey
          </h2>
          <div className="text-xl text-primary-text/70 max-w-3xl mx-auto relative group">
            <p>
              Continue mastering vocabulary with our{' '}
              <span className="relative inline-block group/sr">
                <span className="text-primary-highlight font-medium cursor-help">
                  spaced repetition
                </span>
                <div className="invisible group-hover/sr:visible absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 p-3 bg-white rounded-lg shadow-lg border border-primary-bg text-sm text-left z-10">
                  <div className="text-primary-text mb-2">
                    Spaced repetition is a scientifically-proven learning technique that presents words for review at optimal intervals based on your performance, ensuring long-term retention with minimal effort.
                  </div>
                  <div className="absolute left-1/2 -top-2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-primary-bg rotate-45"></div>
                </div>
              </span>{' '}
              system.{' '}
              <button 
                onClick={() => onNavigate('spaced-repetition-guide')}
                className="inline-flex items-center text-primary-highlight hover:text-primary-highlight/80 transition-colors duration-200 ml-1"
              >
                <Info className="h-4 w-4" />
              </button>
            </p>
            <p className="mt-2">Your personalized learning experience awaits.</p>
          </div>
        </div>

        {/* Stats Grid - Now Clickable */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => (
            <button
              key={stat.label}
              onClick={stat.onClick}
              disabled={stat.disabled}
              className={`
                bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 
                transform hover:-translate-y-1 border border-primary-bg group text-left w-full
                ${stat.disabled 
                  ? 'opacity-50 cursor-not-allowed hover:transform-none hover:shadow-lg' 
                  : 'cursor-pointer hover:border-primary-highlight/20'
                }
              `}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color} group-hover:scale-110 transition-transform duration-200`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary-text">{stat.value}</p>
                  <p className="text-sm font-medium text-primary-text/70">{stat.label}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-primary-text/50">{stat.trend}</span>
                  {!stat.disabled && (
                    <span className="text-xs text-primary-highlight font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {stat.description}
                    </span>
                  )}
                </div>
                <ArrowRight className={`h-4 w-4 transition-all duration-200 ${
                  stat.disabled 
                    ? 'text-primary-text/20' 
                    : 'text-primary-text/30 group-hover:text-primary-highlight group-hover:translate-x-1'
                }`} />
              </div>
            </button>
          ))}
        </div>

        {/* Recent Study Options */}
        {recentStudyOptions.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-primary-navy mb-6">Recent Study Sessions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentStudyOptions.slice(0, 6).map((option) => {
                const folderWords = option.folder_id 
                  ? words.filter(word => word.folders?.some(f => f.id === option.folder_id))
                  : words;
                
                return (
                  <button
                    key={option.id}
                    onClick={() => handleRecentStudyOption(option)}
                    className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-4 border border-primary-bg group text-left transform hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {option.folder && (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: option.folder.color }}
                          />
                        )}
                        <h4 className="font-semibold text-primary-navy truncate">
                          {option.folder ? option.folder.name : 'All Words'}
                        </h4>
                      </div>
                      <div onClick={(e) => {
                          e.stopPropagation();
                          handleStartStudy(option.folder_id || null, 'all');
                        }}
                        className="p-2 rounded-full -m-2 hover:bg-primary-highlight/10 cursor-pointer"
                      >
                        <Play className="h-4 w-4 text-primary-text/30 group-hover:text-primary-highlight transition-colors duration-200" />
                      </div>
                    </div>
                    <p className="text-sm text-primary-text/70 mb-2">
                      {folderWords.length} words
                    </p>
                    <div className="flex items-center justify-between text-xs text-primary-text/50">
                      <span>Used {option.use_count} times</span>
                      <span>{option.last_used_at.toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Commented out Study by Folder section - can be reactivated by removing comment blocks */}
        {/*
        {folders.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-primary-navy mb-6">Study by Folder</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* All Words Option *//*}
              <button
                onClick={() => handleFolderStudy(null)}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-4 border border-primary-bg group text-left transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary-navy" />
                    <h4 className="font-semibold text-primary-navy">All Words</h4>
                  </div>
                  <div onClick={(e) => {
                      e.stopPropagation();
                      handleStartStudy(null, 'all');
                    }}
                    className="p-2 rounded-full -m-2 hover:bg-primary-highlight/10 cursor-pointer"
                  >
                    <Play className="h-4 w-4 text-primary-text/30 group-hover:text-primary-highlight transition-colors duration-200" />
                  </div>
                </div>
                <p className="text-sm text-primary-text/70">
                  {words.length} total words
                </p>
              </button>

              {/* Individual Folders *//*}
              {folders.filter(f => (f.word_count ?? 0) > 0).map(folder => {
                return (
                  <button
                    key={folder.id}
                    onClick={() => handleFolderStudy(folder)}
                    className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-4 border border-primary-bg group text-left transform hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: folder.color }}
                        />
                        <h4 className="font-semibold text-primary-navy truncate">
                          {folder.name}
                        </h4>
                      </div>
                      <div onClick={(e) => {
                          e.stopPropagation();
                          handleStartStudy(folder.id, 'all');
                        }}
                        className="p-2 rounded-full -m-2 hover:bg-primary-highlight/10 cursor-pointer"
                      >
                        <Play className="h-4 w-4 text-primary-text/30 group-hover:text-primary-highlight transition-colors duration-200" />
                      </div>
                    </div>
                    <p className="text-sm text-primary-text/70">
                      {folder.word_count} words
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        */}

        {/* Features */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-primary-navy mb-6">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {actions.map((action) => (
              <button
                key={action.title}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`
                  relative text-left p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 
                  transform hover:-translate-y-1 ${action.color} text-white group overflow-hidden
                  ${action.disabled ? 'opacity-50 cursor-not-allowed hover:transform-none hover:shadow-lg' : ''}
                `}
              >
                {action.badge && (
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                    <span className="text-xs font-bold text-white">{action.badge}</span>
                  </div>
                )}
                <div className="flex items-center mb-4">
                  <action.icon className="h-8 w-8 mr-3 group-hover:scale-110 transition-transform duration-200 text-white" />
                  <h4 className="text-xl font-semibold text-white">{action.title}</h4>
                </div>
                <p className="text-white/90 leading-relaxed mb-4">{action.description}</p>
                <div className="flex items-center text-white/80">
                  <span className="text-sm font-medium">{action.cta}</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Learning Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-primary-bg">
            <h3 className="text-xl font-semibold text-primary-navy mb-6">Learning Distribution</h3>
            <div className="space-y-4">
              {[
                { label: 'New', count: newWords, color: 'bg-primary-highlight', percentage: totalWords > 0 ? (newWords / totalWords) * 100 : 0 },
                { label: 'Learning', count: learningWords, color: 'bg-yellow-500', percentage: totalWords > 0 ? (learningWords / totalWords) * 100 : 0 },
                { label: 'Review', count: words.filter(w => w.difficulty === 'review').length, color: 'bg-orange-500', percentage: totalWords > 0 ? (words.filter(w => w.difficulty === 'review').length / totalWords) * 100 : 0 },
                { label: 'Mastered', count: masteredWords, color: 'bg-green-500', percentage: totalWords > 0 ? (masteredWords / totalWords) * 100 : 0 },
              ].map((item) => (
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
            <h3 className="text-xl font-semibold text-primary-navy mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {totalWords > 0 ? (
                <>
                  <div className="flex items-center space-x-3 p-3 bg-primary-cream/50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-primary-text">
                      {masteredWords} words mastered
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-primary-cream/50 rounded-lg">
                    <div className="w-2 h-2 bg-primary-highlight rounded-full"></div>
                    <span className="text-sm text-primary-text">
                      {totalReviews} total reviews completed
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-primary-cream/50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-primary-text">
                      {overallAccuracy}% average accuracy
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-primary-text/30 mx-auto mb-3" />
                  <p className="text-primary-text/60">No activity yet</p>
                  <p className="text-sm text-primary-text/50">Start by adding your first word!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {totalWords === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-primary-bg">
            <BookOpen className="h-20 w-20 text-primary-text/20 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-primary-navy mb-4">Start Your Learning Journey</h3>
            <p className="text-primary-text/70 mb-8 max-w-md mx-auto">
              Add your first words to begin building your vocabulary with our intelligent spaced repetition system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setChatbotOpen(true)}
                className="bg-purple-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-600 transition-all duration-200 inline-flex items-center justify-center"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Chat with AI Assistant
              </button>
              <button
                onClick={() => onNavigate('add-word')}
                className="bg-primary-highlight text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-highlight/90 transition-all duration-200 inline-flex items-center justify-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Words Manually
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Study Options Modal */}
      <StudyOptionsModal
        isOpen={showStudyModal}
        onClose={() => setShowStudyModal(false)}
        folder={selectedFolder}
        words={words}
        onStartStudy={handleStartStudy}
      />
      <FloatingChatbot isOpen={isChatbotOpen} onClose={() => setChatbotOpen(false)} onAddWords={async () => {}} />
    </div>
  );
};

