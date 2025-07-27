import React, { useState } from 'react';
import { BookOpen, LogOut, User, ChevronDown, Play, Clock, Folder, Brain } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useStudySessions } from '../hooks/useStudySessions';
import { useFolders } from '../hooks/useFolders';
import { StudyOptionsModal } from './StudyOptionsModal';
import { Word } from '@shared/types';

interface HeaderProps {
  onNavigate: (view: string) => void;
  currentView?: string;
  words?: Word[];
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentView = 'dashboard', words = [] }) => {
  const { user, signOut } = useAuth();
  const { recentStudyOptions, startStudySession } = useStudySessions(user);
  const { folders } = useFolders(user);
  const [showStudyDropdown, setShowStudyDropdown] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<any>(null);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleQuickStudy = () => {
    setSelectedFolder(null);
    setShowStudyModal(true);
    setShowStudyDropdown(false);
  };

  const handleFolderStudy = (folder: any) => {
    setSelectedFolder(folder);
    setShowStudyModal(true);
    setShowStudyDropdown(false);
  };

  const handleRecentStudyOption = (option: any) => {
    setSelectedFolder(option.folder || null);
    setShowStudyModal(true);
    setShowStudyDropdown(false);
  };

  const handleStartStudy = async (folderId: string | null, studyType: any) => {
    const session = await startStudySession(folderId, studyType);
    if (session) {
      setShowStudyModal(false);
      onNavigate('study');
    }
  };

  const getNavItemClasses = (view: string) => {
    const isActive = currentView === view;
    return `
      relative px-3 py-2 rounded-lg font-medium transition-all duration-200
      ${isActive 
        ? 'text-primary-highlight bg-primary-highlight/10 shadow-sm' 
        : 'text-primary-text hover:text-primary-highlight hover:bg-primary-cream/50'
      }
      ${isActive ? 'after:absolute after:bottom-0 after:left-1/2 after:transform after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary-highlight after:rounded-full' : ''}
    `;
  };

  const studyTypeLabels = {
    all: 'All Words',
    new: 'New Words',
    review: 'Review',
    learning: 'Learning',
    mastered: 'Mastered',
    failed: 'Difficult Words'
  };

  return (
    <>
      <header className="bg-white border-b border-primary-bg shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Brand */}
            <div className="flex items-center">
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center hover:opacity-80 transition-opacity duration-200"
              >
                <BookOpen className="h-8 w-8 text-primary-highlight mr-2" />
                <span className="text-xl font-bold text-primary-navy">LearnDeck</span>
              </button>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => onNavigate('dashboard')}
                className={getNavItemClasses('dashboard')}
              >
                Dashboard
              </button>
              <button
                onClick={() => onNavigate('add-word')}
                className={getNavItemClasses('add-word')}
              >
                Add Words
              </button>
              
              {/* Study Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowStudyDropdown(!showStudyDropdown)}
                  className={`${getNavItemClasses('study')} flex items-center`}
                >
                  Study
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>

                {showStudyDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-primary-bg z-50 max-h-96 overflow-y-auto">
                    <div className="p-4">
                      {/* Quick Study */}
                      <div className="mb-4">
                        <button
                          onClick={handleQuickStudy}
                          className="w-full flex items-center p-3 rounded-lg bg-primary-highlight text-white hover:bg-primary-highlight/90 transition-all duration-200"
                        >
                          <Play className="h-5 w-5 mr-3" />
                          <div className="text-left">
                            <div className="font-medium">Quick Study</div>
                            <div className="text-sm opacity-90">Study all due words</div>
                          </div>
                        </button>
                      </div>

                      {/* Recent Study Options */}
                      {recentStudyOptions.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-primary-text/70 mb-2 flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Recent Sessions
                          </h4>
                          <div className="space-y-1">
                            {recentStudyOptions.slice(0, 4).map(option => (
                              <button
                                key={`${option.folder_id}-${option.study_type}`}
                                onClick={() => handleRecentStudyOption(option)}
                                className="w-full flex items-center p-2 rounded-lg hover:bg-primary-cream/50 transition-colors duration-200 text-left"
                              >
                                <div className="flex items-center flex-1">
                                  {option.folder && (
                                    <div
                                      className="w-3 h-3 rounded-full mr-2"
                                      style={{ backgroundColor: option.folder.color }}
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-primary-navy truncate">
                                      {option.folder ? option.folder.name : 'All Words'}
                                    </div>
                                    <div className="text-xs text-primary-text/70">
                                      {studyTypeLabels[option.study_type]} • Used {option.use_count} times
                                    </div>
                                  </div>
                                </div>
                                <Play className="h-4 w-4 text-primary-text/30" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Study by Folder */}
                      <div>
                        <h4 className="text-sm font-medium text-primary-text/70 mb-2 flex items-center">
                          <Folder className="h-4 w-4 mr-1" />
                          Study by Folder
                        </h4>
                        <div className="space-y-1">
                          {/* All Words */}
                          <button
                            onClick={() => handleFolderStudy(null)}
                            className="w-full flex items-center p-2 rounded-lg hover:bg-primary-cream/50 transition-colors duration-200 text-left"
                          >
                            <div className="w-3 h-3 rounded-full bg-primary-navy mr-2" />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-primary-navy">All Words</div>
                              <div className="text-xs text-primary-text/70">Study entire collection</div>
                            </div>
                            <Play className="h-4 w-4 text-primary-text/30" />
                          </button>

                          {/* Individual Folders */}
                          {folders.slice(0, 5).map(folder => (
                            <button
                              key={folder.id}
                              onClick={() => handleFolderStudy(folder)}
                              className="w-full flex items-center p-2 rounded-lg hover:bg-primary-cream/50 transition-colors duration-200 text-left"
                            >
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: folder.color }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-primary-navy truncate">
                                  {folder.name}
                                </div>
                                <div className="text-xs text-primary-text/70">
                                  Study this folder
                                </div>
                              </div>
                              <Play className="h-4 w-4 text-primary-text/30" />
                            </button>
                          ))}

                          {folders.length > 5 && (
                            <button
                              onClick={() => {
                                onNavigate('dashboard');
                                setShowStudyDropdown(false);
                              }}
                              className="w-full text-center p-2 text-sm text-primary-highlight hover:text-primary-highlight/80 transition-colors duration-200"
                            >
                              View all folders...
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Custom Study Options */}
                      <div className="mt-4 pt-4 border-t border-primary-bg">
                        <button
                          onClick={() => {
                            setSelectedFolder(null);
                            setShowStudyModal(true);
                            setShowStudyDropdown(false);
                          }}
                          className="w-full flex items-center p-2 rounded-lg hover:bg-primary-cream/50 transition-colors duration-200 text-left"
                        >
                          <Brain className="h-4 w-4 mr-2 text-primary-highlight" />
                          <div className="text-sm font-medium text-primary-navy">
                            More Study Options...
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => onNavigate('progress')}
                className={getNavItemClasses('progress')}
              >
                Progress
              </button>
              <button
                onClick={() => onNavigate('word-list')}
                className={getNavItemClasses('word-list')}
              >
                Library
              </button>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate('profile')}
                className={`hidden sm:flex items-center space-x-3 rounded-lg px-3 py-2 transition-all duration-200 ${
                  currentView === 'profile'
                    ? 'bg-primary-highlight/10 text-primary-highlight'
                    : 'hover:bg-primary-cream/50 text-primary-text hover:text-primary-highlight'
                }`}
              >
                <div className="text-right">
                  <p className="text-sm font-medium">{user?.email?.split('@')[0]}</p>
                  <p className="text-xs opacity-70">View Profile</p>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
                  currentView === 'profile' ? 'bg-primary-highlight' : 'bg-primary-highlight'
                }`}>
                  <User className="h-4 w-4 text-white" />
                </div>
              </button>
              
              <button
                onClick={handleSignOut}
                className="p-2 text-primary-text/60 hover:text-primary-highlight hover:bg-primary-cream/50 rounded-lg transition-all duration-200 group"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              </button>
            </div>
          </div>
        </div>

        {/* Click outside to close dropdown */}
        {showStudyDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowStudyDropdown(false)}
          />
        )}
      </header>

      {/* Study Options Modal */}
      <StudyOptionsModal
        isOpen={showStudyModal}
        onClose={() => setShowStudyModal(false)}
        folder={selectedFolder}
        words={words}
        onStartStudy={handleStartStudy}
      />
    </>
  );
};