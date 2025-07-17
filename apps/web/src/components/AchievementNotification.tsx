import React, { useEffect } from 'react';
import { BookOpen, Clock, Trophy, Zap, X } from 'lucide-react';
import { Achievement, achievementDetails } from '../hooks/useAchievements';

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

const iconMap = {
  BookOpen,
  Clock,
  Trophy,
  Zap
};

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onClose
}) => {
  // Auto-close after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const details = achievementDetails[achievement.achievement_type];
  // Fallback to Trophy if icon not found in map
  const Icon = iconMap[details.icon as keyof typeof iconMap] || Trophy;

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg border border-primary-bg overflow-hidden animate-slide-up">
      <div className="relative">
        {/* Achievement Banner */}
        <div className={`${details.color} h-2`} />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-primary-text/50 hover:text-primary-text transition-colors duration-200"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start">
            <div className={`${details.color} p-2 rounded-lg mr-3`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-primary-navy">
                Achievement Unlocked!
              </h4>
              <p className="text-sm font-medium text-primary-text mt-1">
                {details.title}
              </p>
              <p className="text-xs text-primary-text/70 mt-1">
                {details.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 