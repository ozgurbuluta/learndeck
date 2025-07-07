import React, { useState } from 'react';
import { Plus, ArrowLeft, Save, Folder, X, Brain, Upload, Sparkles } from 'lucide-react';
import { Word } from '@shared/types';
import { useFolders } from '../hooks/useFolders';
import { useAuth } from '../hooks/useAuth';
import { useAchievements } from '../hooks/useAchievements';

interface AddWordProps {
  onAddWord: (word: Omit<Word, 'id' | 'user_id' | 'created_at' | 'last_reviewed' | 'review_count' | 'correct_count' | 'difficulty' | 'next_review' | 'folders'>, folderIds: string[]) => Promise<void>;
  onNavigate: (view: string) => void;
  currentView?: string;
}

export const AddWord: React.FC<AddWordProps> = ({ onAddWord, onNavigate, currentView: _currentView }) => {
  const { user } = useAuth();
  const { folders, addFolder } = useFolders(user);
  const { checkAchievements } = useAchievements();
  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState('');
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#fca311');

  const folderColors = [
    '#fca311', '#14213d', '#2a9d8f', '#e76f51', '#f4a261',
    '#e9c46a', '#264653', '#2a9d8f', '#e76f51', '#f4a261'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !definition.trim() || !user) return;

    setIsSubmitting(true);
    try {
      await onAddWord({
        word: word.trim(),
        definition: definition.trim(),
      }, selectedFolderIds);

      // Check for new achievements after adding a word
      await checkAchievements();

      // Reset form
      setWord('');
      setDefinition('');
      setSelectedFolderIds([]);
    } catch (error) {
      console.error('Error adding word:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNewFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const newFolder = await addFolder({
        name: newFolderName.trim(),
        color: newFolderColor,
      });

      if (newFolder) {
        setSelectedFolderIds(prev => [...prev, newFolder.id]);
      }

      setNewFolderName('');
      setNewFolderColor('#fca311');
      setShowNewFolderInput(false);
    } catch (error) {
      console.error('Error adding folder:', error);
    }
  };

  const toggleFolderSelection = (folderId: string) => {
    setSelectedFolderIds(prev => 
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const removeFolderSelection = (folderId: string) => {
    setSelectedFolderIds(prev => prev.filter(id => id !== folderId));
  };

  return (
    <div className="min-h-screen bg-primary-bg">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center text-primary-text hover:text-primary-highlight transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-primary-navy mb-2">Add New Words</h1>
          <p className="text-primary-text">Expand your vocabulary by adding new words manually or using AI to extract them from documents.</p>
        </div>

        {/* Method Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* AI Import Option */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-white/20 rounded-lg mr-4">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">AI Import</h2>
                  <p className="text-purple-100">Let AI do the work</p>
                </div>
              </div>
              
              <p className="text-purple-100 mb-6 leading-relaxed">
                Upload documents (PDF, CSV, TXT) and our AI will automatically extract vocabulary words 
                and create flashcards with definitions. Perfect for importing from articles, textbooks, or any text content.
              </p>
              
              <div className="flex items-center mb-6 space-x-4">
                <div className="flex items-center text-purple-100">
                  <Upload className="h-4 w-4 mr-2" />
                  <span className="text-sm">Multiple formats</span>
                </div>
                <div className="flex items-center text-purple-100">
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span className="text-sm">AI-powered</span>
                </div>
              </div>
              
              <button
                onClick={() => onNavigate('import-words')}
                className="w-full bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-purple-50 transition-all duration-200 flex items-center justify-center shadow-lg"
              >
                <Brain className="h-5 w-5 mr-2" />
                Start AI Import
              </button>
            </div>
          </div>

          {/* Manual Entry Option */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-bg relative">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-primary-highlight/10 rounded-lg mr-4">
                <Plus className="h-8 w-8 text-primary-highlight" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary-navy">Manual Entry</h2>
                <p className="text-primary-text/70">Add words one by one</p>
              </div>
            </div>
            
            <p className="text-primary-text mb-6 leading-relaxed">
              Manually add individual words with custom definitions. Perfect for specific vocabulary, 
              personal notes, or when you want full control over your word collection.
            </p>
            
            <div className="flex items-center mb-6 space-x-4">
              <div className="flex items-center text-primary-text/70">
                <Save className="h-4 w-4 mr-2" />
                <span className="text-sm">Custom definitions</span>
              </div>
              <div className="flex items-center text-primary-text/70">
                <Folder className="h-4 w-4 mr-2" />
                <span className="text-sm">Organize folders</span>
              </div>
            </div>
            
            <button
              onClick={() => document.getElementById('manual-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full bg-primary-highlight text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-highlight/90 transition-all duration-200 flex items-center justify-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Manually
            </button>
          </div>
        </div>

        {/* Manual Entry Form */}
        <div id="manual-form" className="bg-white rounded-xl shadow-lg p-8 border border-primary-bg">
          <h2 className="text-xl font-semibold text-primary-navy mb-6 flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Manual Word Entry
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="word" className="block text-sm font-medium text-primary-text mb-2">
                Word
              </label>
              <input
                type="text"
                id="word"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                className="w-full px-4 py-3 border border-primary-bg rounded-lg focus:ring-2 focus:ring-primary-highlight focus:border-primary-highlight transition-colors duration-200 bg-primary-cream/30 text-primary-text placeholder-primary-text/50"
                placeholder="Enter the word..."
                required
              />
            </div>

            <div>
              <label htmlFor="definition" className="block text-sm font-medium text-primary-text mb-2">
                Definition
              </label>
              <textarea
                id="definition"
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-primary-bg rounded-lg focus:ring-2 focus:ring-primary-highlight focus:border-primary-highlight transition-colors duration-200 resize-none bg-primary-cream/30 text-primary-text placeholder-primary-text/50"
                placeholder="Enter the definition..."
                required
              />
            </div>

            {/* Folder Selection */}
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Folders (Optional)
              </label>
              
              {/* Selected Folders */}
              {selectedFolderIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedFolderIds.map(folderId => {
                    const folder = folders.find(f => f.id === folderId);
                    if (!folder) return null;
                    
                    return (
                      <span
                        key={folderId}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: folder.color }}
                      >
                        {folder.name}
                        <button
                          type="button"
                          onClick={() => removeFolderSelection(folderId)}
                          className="ml-2 hover:bg-white/20 rounded-full p-0.5 transition-colors duration-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Folder Selection Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                {folders.map(folder => (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => toggleFolderSelection(folder.id)}
                    className={`
                      flex items-center p-3 rounded-lg border-2 transition-all duration-200 text-left
                      ${selectedFolderIds.includes(folder.id)
                        ? 'border-primary-highlight bg-primary-highlight/10'
                        : 'border-primary-bg hover:border-primary-highlight/50 bg-primary-cream/30'
                      }
                    `}
                  >
                    <div
                      className="w-4 h-4 rounded-full mr-2 flex-shrink-0"
                      style={{ backgroundColor: folder.color }}
                    />
                    <span className="text-sm font-medium text-primary-text truncate">
                      {folder.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Add New Folder */}
              {!showNewFolderInput ? (
                <button
                  type="button"
                  onClick={() => setShowNewFolderInput(true)}
                  className="flex items-center text-primary-highlight hover:text-primary-highlight/80 transition-colors duration-200 text-sm font-medium"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add New Folder
                </button>
              ) : (
                <div className="bg-primary-cream/50 rounded-lg p-4 space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Folder name..."
                      className="flex-1 px-3 py-2 border border-primary-bg rounded-lg focus:ring-2 focus:ring-primary-highlight focus:border-primary-highlight transition-colors duration-200 bg-white text-primary-text text-sm"
                    />
                    <div className="flex gap-1">
                      {folderColors.slice(0, 5).map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewFolderColor(color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                            newFolderColor === color ? 'border-primary-text scale-110' : 'border-white'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddNewFolder}
                      disabled={!newFolderName.trim()}
                      className="px-3 py-1 bg-primary-highlight text-white rounded text-sm font-medium hover:bg-primary-highlight/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewFolderInput(false);
                        setNewFolderName('');
                        setNewFolderColor('#fca311');
                      }}
                      className="px-3 py-1 text-primary-text hover:text-primary-highlight transition-colors duration-200 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={!word.trim() || !definition.trim() || isSubmitting}
                className="flex-1 bg-primary-highlight text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-highlight/90 focus:outline-none focus:ring-2 focus:ring-primary-highlight disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Add Word
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="px-6 py-3 border border-primary-bg text-primary-text rounded-lg font-medium hover:bg-primary-cream/50 focus:outline-none focus:ring-2 focus:ring-primary-highlight transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};