import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Target, Clock, Trophy, Zap, Settings, Edit3, Save, X, Calendar, BookOpen, TrendingUp } from 'lucide-react';
import { Word } from '@shared/types';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';
import { useAchievements, achievementDetails } from '../hooks/useAchievements';
import { AchievementNotification } from './AchievementNotification';

interface ProfileProps {
  words: Word[];
  onNavigate: (view: string) => void;
  currentView?: string;
}

export const Profile: React.FC<ProfileProps> = ({ words, onNavigate, currentView: _currentView }) => {
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useProfile(user);
  const { achievements, newAchievements, checkAchievements, markAchievementsSeen } = useAchievements();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    bio: '',
    learning_goal: 5,
    preferred_difficulty: 'new' as Word['difficulty'],
    notifications_enabled: true,
  });

  // Check for new achievements when profile or words change
  useEffect(() => {
    if (profile && words.length > 0) {
      checkAchievements();
    }
  }, [profile, words, checkAchievements]);

  // Log achievement progress when achievements change
  useEffect(() => {
    if (profile && achievements.length >= 0) {
      console.log('=== ACHIEVEMENT PROGRESS ===');
      // Define achievementsList locally to avoid dependency issues
      const achievementsList = [
        {
          title: 'First Word',
          description: 'Added your first word to the collection',
          earned: achievements.some(a => a.achievement_type === 'first_word'),
          progress: `${words.length} words added`,
          target: 1
        },
        {
          title: 'Study Time: 2 Hours',
          description: 'Spent 2 hours studying in total',
          earned: achievements.some(a => a.achievement_type === 'study_time_120' || a.achievement_type === 'dedicated_learner_60'),
          progress: `${profile.total_study_time} minutes studied`,
          target: 120
        },
        {
          title: 'Word Master',
          description: 'Mastered 10 words',
          earned: achievements.some(a => a.achievement_type === 'word_master_10'),
          progress: `${words.filter(w => w.difficulty === 'mastered').length} words mastered`,
          target: 10
        },
        {
          title: 'Study Streak',
          description: 'Studied for 7 consecutive days',
          earned: achievements.some(a => a.achievement_type === 'study_streak_7'),
          progress: `${profile.study_streak} day streak`,
          target: 7
        },
        {
          title: 'Word Collection',
          description: 'Added 50 words to your collection',
          earned: achievements.some(a => a.achievement_type === 'word_collection_50'),
          progress: `${words.length} words added`,
          target: 50
        },
        {
          title: 'Review Champion',
          description: 'Completed 100 word reviews',
          earned: achievements.some(a => a.achievement_type === 'review_champion_100'),
          progress: `${words.reduce((sum, word) => sum + word.review_count, 0)} reviews completed`,
          target: 100
        }
      ];
      
      achievementsList.forEach(achievement => {
        console.log(`${achievement.title}: ${achievement.progress} (${achievement.earned ? 'EARNED' : 'Not earned'})`);
      });
      console.log('=============================');
    }
  }, [achievements, profile, words]);

  useEffect(() => {
    if (profile) {
      setEditForm({
        username: profile.username || '',
        bio: profile.bio || '',
        learning_goal: profile.learning_goal,
        preferred_difficulty: profile.preferred_difficulty,
        notifications_enabled: profile.notifications_enabled,
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile(editForm);
      setIsEditing(false);
      // Check for new achievements after profile update
      checkAchievements();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditForm({
        username: profile.username || '',
        bio: profile.bio || '',
        learning_goal: profile.learning_goal,
        preferred_difficulty: profile.preferred_difficulty,
        notifications_enabled: profile.notifications_enabled,
      });
    }
    setIsEditing(false);
  };

  // Handle achievement notification close
  const handleAchievementClose = () => {
    markAchievementsSeen();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-bg">
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary-highlight border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-primary-bg">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <User className="h-16 w-16 text-primary-text/40 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-primary-navy mb-2">Profile Not Found</h2>
            <p className="text-primary-text mb-6">Unable to load your profile information.</p>
            <button
              onClick={() => onNavigate('dashboard')}
              className="bg-primary-highlight text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-highlight/90 transition-all duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats from words
  const totalWords = words.length;
  const masteredWords = words.filter(w => w.difficulty === 'mastered').length;
  const totalReviews = words.reduce((sum, word) => sum + word.review_count, 0);
  const totalCorrect = words.reduce((sum, word) => sum + word.correct_count, 0);
  const overallAccuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;
  const studyTimeHours = Math.floor(profile.total_study_time / 60);
  const studyTimeMinutes = profile.total_study_time % 60;

  const memberSince = profile.created_at.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Create trackable achievement list with progress logging
  const achievementsList = [
    {
      title: 'First Word',
      description: 'Added your first word to the collection',
      earned: achievements.some(a => a.achievement_type === 'first_word'),
      icon: BookOpen,
      color: 'bg-blue-500',
      progress: `${totalWords} words added`,
      target: 1
    },
    {
      title: 'Study Time: 2 Hours',
      description: 'Spent 2 hours studying in total',
      earned: achievements.some(a => a.achievement_type === 'study_time_120' || a.achievement_type === 'dedicated_learner_60'),
      icon: Clock,
      color: 'bg-purple-500',
      progress: `${profile.total_study_time} minutes studied`,
      target: 120
    },
    {
      title: 'Word Master',
      description: 'Mastered 10 words',
      earned: achievements.some(a => a.achievement_type === 'word_master_10'),
      icon: Trophy,
      color: 'bg-green-500',
      progress: `${masteredWords} words mastered`,
      target: 10
    },
    {
      title: 'Study Streak',
      description: 'Studied for 7 consecutive days',
      earned: achievements.some(a => a.achievement_type === 'study_streak_7'),
      icon: Zap,
      color: 'bg-yellow-500',
      progress: `${profile.study_streak} day streak`,
      target: 7
    },
    {
      title: 'Word Collection',
      description: 'Added 50 words to your collection',
      earned: achievements.some(a => a.achievement_type === 'word_collection_50'),
      icon: BookOpen,
      color: 'bg-blue-600',
      progress: `${totalWords} words added`,
      target: 50
    },
    {
      title: 'Review Champion',
      description: 'Completed 100 word reviews',
      earned: achievements.some(a => a.achievement_type === 'review_champion_100'),
      icon: Target,
      color: 'bg-green-600',
      progress: `${totalReviews} reviews completed`,
      target: 100
    }
  ];


  // Show earned achievements first
  const sortedAchievements = [...achievementsList].sort((a, b) => {
    if (a.earned && !b.earned) return -1;
    if (!a.earned && b.earned) return 1;
    return 0;
  });

  const INITIAL_ACHIEVEMENT_COUNT = 6;
  const displayedAchievements = showAllAchievements 
    ? sortedAchievements 
    : sortedAchievements.slice(0, INITIAL_ACHIEVEMENT_COUNT);

  const earnedCount = achievementsList.filter(a => a.earned).length;
  const totalCount = achievementsList.length;

  return (
    <div className="min-h-screen bg-primary-bg">
      {/* Achievement Notifications */}
      {newAchievements.map((achievement) => (
        <AchievementNotification
          key={achievement.id}
          achievement={achievement}
          onClose={handleAchievementClose}
        />
      ))}

      {/* Sticky Profile Header */}
      <div className="sticky top-0 z-40 bg-primary-bg border-b border-primary-bg/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center text-primary-text hover:text-primary-highlight transition-colors duration-200 mr-6"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-primary-navy">My Profile</h1>
            </div>
            
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center bg-primary-highlight text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-highlight/90 transition-all duration-200 shadow-lg"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-all duration-200 shadow-lg"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-all duration-200 shadow-lg"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-primary-bg mb-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-primary-highlight rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-12 w-12 text-white" />
                </div>
                
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Username"
                      className="w-full px-3 py-2 border border-primary-bg rounded-lg focus:ring-2 focus:ring-primary-highlight focus:border-primary-highlight transition-colors duration-200 bg-primary-cream/30 text-primary-text"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-primary-navy">
                      @{profile.username || profile.email.split('@')[0]}
                    </h2>
                  </>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center text-primary-text/80">
                  <Mail className="h-4 w-4 mr-3" />
                  {profile.email}
                </div>
                <div className="flex items-center text-primary-text/80">
                  <Calendar className="h-4 w-4 mr-3" />
                  Member since {memberSince}
                </div>
              </div>

              {isEditing ? (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-primary-text mb-2">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className="w-full px-3 py-2 border border-primary-bg rounded-lg focus:ring-2 focus:ring-primary-highlight focus:border-primary-highlight transition-colors duration-200 resize-none bg-primary-cream/30 text-primary-text placeholder-primary-text/50"
                  />
                </div>
              ) : (
                profile.bio && (
                  <div className="mt-6 pt-6 border-t border-primary-bg">
                    <p className="text-primary-text leading-relaxed">{profile.bio}</p>
                  </div>
                )
              )}
            </div>

            {/* Learning Preferences */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-primary-bg">
              <h3 className="text-lg font-semibold text-primary-navy mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Learning Preferences
              </h3>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-text mb-2">Daily Goal</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={editForm.learning_goal}
                      onChange={(e) => setEditForm(prev => ({ ...prev, learning_goal: parseInt(e.target.value) || 5 }))}
                      className="w-full px-3 py-2 border border-primary-bg rounded-lg focus:ring-2 focus:ring-primary-highlight focus:border-primary-highlight transition-colors duration-200 bg-primary-cream/30 text-primary-text"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-primary-text mb-2">Preferred Difficulty</label>
                    <select
                      value={editForm.preferred_difficulty}
                      onChange={(e) => setEditForm(prev => ({ ...prev, preferred_difficulty: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-primary-bg rounded-lg focus:ring-2 focus:ring-primary-highlight focus:border-primary-highlight transition-colors duration-200 bg-primary-cream/30 text-primary-text"
                    >
                      <option value="new">New</option>
                      <option value="learning">Learning</option>
                      <option value="review">Review</option>
                      <option value="mastered">Mastered</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notifications"
                      checked={editForm.notifications_enabled}
                      onChange={(e) => setEditForm(prev => ({ ...prev, notifications_enabled: e.target.checked }))}
                      className="mr-3"
                    />
                    <label htmlFor="notifications" className="text-sm text-primary-text">
                      Enable email notifications
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-primary-text/80">Daily Goal:</span>
                    <span className="font-medium text-primary-text">{profile.learning_goal} words</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-text/80">Preferred Level:</span>
                    <span className="font-medium text-primary-text capitalize">{profile.preferred_difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-text/80">Notifications:</span>
                    <span className="font-medium text-primary-text">
                      {profile.notifications_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats and Achievements */}
          <div className="lg:col-span-2 space-y-6">
            {/* Learning Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-primary-bg">
              <h3 className="text-xl font-semibold text-primary-navy mb-6 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Learning Statistics
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <StatCard
                  title="Total Words"
                  value={totalWords}
                  icon={BookOpen}
                  color="bg-primary-navy"
                />
                <StatCard
                  title="Words Mastered"
                  value={masteredWords}
                  icon={Trophy}
                  color="bg-green-500"
                />
                <StatCard
                  title="Study Streak"
                  value={`${profile.study_streak} days`}
                  icon={Zap}
                  color="bg-yellow-500"
                />
                <StatCard
                  title="Accuracy"
                  value={`${overallAccuracy}%`}
                  icon={Target}
                  color="bg-primary-highlight"
                />
              </div>

              <div className="mt-6 pt-6 border-t border-primary-bg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary-text">{totalReviews}</p>
                    <p className="text-sm text-primary-text/70">Total Reviews</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary-text">
                      {studyTimeHours}h {studyTimeMinutes}m
                    </p>
                    <p className="text-sm text-primary-text/70">Study Time</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary-text">
                      {totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0}%
                    </p>
                    <p className="text-sm text-primary-text/70">Mastery Rate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-primary-bg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-primary-navy flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Achievements
                </h3>
              </div>
              
              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-primary-text/70 mb-2">
                  <span>Progress</span>
                  <span>{Math.round((earnedCount / totalCount) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-highlight h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(earnedCount / totalCount) * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Achievements grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedAchievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                      achievement.earned
                        ? 'border-green-200 bg-green-50 shadow-sm'
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <div className={`p-2 rounded-lg ${achievement.color} mr-3 ${
                        achievement.earned ? '' : 'opacity-50'
                      }`}>
                        <achievement.icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-primary-text text-sm">{achievement.title}</h4>
                      </div>
                      {achievement.earned && (
                        <div className="ml-2">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Trophy className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-primary-text/70 leading-relaxed">{achievement.description}</p>
                  </div>
                ))}
              </div>

              {/* Show More Button */}
              {totalCount > INITIAL_ACHIEVEMENT_COUNT && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowAllAchievements(!showAllAchievements)}
                    className="bg-primary-highlight text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-highlight/90 transition-all duration-200"
                  >
                    {showAllAchievements ? 'Show Less' : `Show More (${totalCount - INITIAL_ACHIEVEMENT_COUNT} more)`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
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
  <div className="text-center">
    <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <p className="text-2xl font-bold text-primary-text">{value}</p>
    <p className="text-sm text-primary-text/70">{title}</p>
  </div>
);