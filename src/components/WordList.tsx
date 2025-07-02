import React, { useState } from 'react';
import { ArrowLeft, Search, Edit2, Trash2, Plus, Folder, Filter, X, Check, Square, CheckSquare, Save, Calendar } from 'lucide-react';
import { Word } from '../types';
import { useFolders } from '../hooks/useFolders';
import { useAuth } from '../hooks/useAuth';

interface WordListProps {
  words: Word[];
  onNavigate: (view: string) => void;
  onDeleteWord: (id: string) => void;
  onUpdateWord?: (word: Word) => Promise<void>;
  currentView?: string;
}

export const WordList: React.FC<WordListProps> = ({ words, onNavigate, onDeleteWord, onUpdateWord, currentView: _currentView }) => {
  const { user } = useAuth();
  const { folders, assignWordToFolders, addFolder } = useFolders(user);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showFolderFilter, setShowFolderFilter] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
  
  // Bulk selection and editing states
  const [selectedWordIds, setSelectedWordIds] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showBulkFolderEdit, setShowBulkFolderEdit] = useState(false);
  const [bulkSelectedFolderIds, setBulkSelectedFolderIds] = useState<string[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  // Individual word editing states
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [editingFolderIds, setEditingFolderIds] = useState<string[]>([]);
  const [isUpdatingWord, setIsUpdatingWord] = useState(false);

  // Word content editing states
  const [editingWordContent, setEditingWordContent] = useState<{[key: string]: {word: string, definition: string}}>({});
  const [savingWordContent, setSavingWordContent] = useState<{[key: string]: boolean}>({});

  // New folder creation states for bulk editing
  const [showBulkNewFolderInput, setShowBulkNewFolderInput] = useState(false);
  const [bulkNewFolderName, setBulkNewFolderName] = useState('');
  const [bulkNewFolderColor, setBulkNewFolderColor] = useState('#fca311');
  const [isBulkAddingFolder, setIsBulkAddingFolder] = useState(false);

  // New folder creation states for individual editing
  const [showIndividualNewFolderInput, setShowIndividualNewFolderInput] = useState(false);
  const [individualNewFolderName, setIndividualNewFolderName] = useState('');
  const [individualNewFolderColor, setIndividualNewFolderColor] = useState('#fca311');
  const [isIndividualAddingFolder, setIsIndividualAddingFolder] = useState(false);

  const folderColors = [
    '#fca311', '#14213d', '#2a9d8f', '#e76f51', '#f4a261',
    '#e9c46a', '#264653', '#2a9d8f', '#e76f51', '#f4a261'
  ];

  const filteredWords = words.filter(word => {
    const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         word.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || word.difficulty === filterDifficulty;
    
    let matchesFolder = true;
    if (selectedFolderId === 'unfoldered') {
      matchesFolder = !word.folders || word.folders.length === 0;
    } else if (selectedFolderId) {
      matchesFolder = !!word.folders && word.folders.some(folder => folder.id === selectedFolderId);
    }
    
    return matchesSearch && matchesDifficulty && matchesFolder;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'alphabetical':
        return a.word.toLowerCase().localeCompare(b.word.toLowerCase());
      default:
        return 0;
    }
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'new': return 'bg-primary-highlight/20 text-primary-highlight';
      case 'learning': return 'bg-yellow-100 text-yellow-800';
      case 'review': return 'bg-orange-100 text-orange-800';
      case 'mastered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedFolder = selectedFolderId ? folders.find(f => f.id === selectedFolderId) : null;
  const unfolderedWordsCount = words.filter(word => !word.folders || word.folders.length === 0).length;

  // Word content editing functions
  const startEditingWordContent = (word: Word) => {
    setEditingWordContent(prev => ({
      ...prev,
      [word.id]: {
        word: word.word,
        definition: word.definition
      }
    }));
  };

  const cancelEditingWordContent = (wordId: string) => {
    setEditingWordContent(prev => {
      const newState = { ...prev };
      delete newState[wordId];
      return newState;
    });
  };

  const saveWordContent = async (word: Word) => {
    if (!onUpdateWord || !editingWordContent[word.id]) return;

    setSavingWordContent(prev => ({ ...prev, [word.id]: true }));
    
    try {
      const updatedWord: Word = {
        ...word,
        word: editingWordContent[word.id].word.trim(),
        definition: editingWordContent[word.id].definition.trim(),
      };

      await onUpdateWord(updatedWord);
      
      // Clear editing state
      setEditingWordContent(prev => {
        const newState = { ...prev };
        delete newState[word.id];
        return newState;
      });
    } catch (error) {
      console.error('Error updating word content:', error);
    } finally {
      setSavingWordContent(prev => ({ ...prev, [word.id]: false }));
    }
  };

  // Bulk selection functions
  const toggleWordSelection = (wordId: string) => {
    setSelectedWordIds(prev => 
      prev.includes(wordId)
        ? prev.filter(id => id !== wordId)
        : [...prev, wordId]
    );
  };

  const selectAllWords = () => {
    setSelectedWordIds(filteredWords.map(word => word.id));
  };

  const deselectAllWords = () => {
    setSelectedWordIds([]);
  };

  const toggleSelectAll = () => {
    if (selectedWordIds.length === filteredWords.length) {
      deselectAllWords();
    } else {
      selectAllWords();
    }
  };

  // Bulk folder creation
  const handleBulkAddNewFolder = async () => {
    if (!bulkNewFolderName.trim()) return;

    setIsBulkAddingFolder(true);
    try {
      const newFolder = await addFolder({
        name: bulkNewFolderName.trim(),
        color: bulkNewFolderColor,
      });

      if (newFolder) {
        setBulkSelectedFolderIds(prev => [...prev, newFolder.id]);
      }

      setBulkNewFolderName('');
      setBulkNewFolderColor('#fca311');
      setShowBulkNewFolderInput(false);
    } catch (error) {
      console.error('Error adding folder:', error);
    } finally {
      setIsBulkAddingFolder(false);
    }
  };

  // Individual folder creation
  const handleIndividualAddNewFolder = async () => {
    if (!individualNewFolderName.trim()) return;

    setIsIndividualAddingFolder(true);
    try {
      const newFolder = await addFolder({
        name: individualNewFolderName.trim(),
        color: individualNewFolderColor,
      });

      if (newFolder) {
        setEditingFolderIds(prev => [...prev, newFolder.id]);
      }

      setIndividualNewFolderName('');
      setIndividualNewFolderColor('#fca311');
      setShowIndividualNewFolderInput(false);
    } catch (error) {
      console.error('Error adding folder:', error);
    } finally {
      setIsIndividualAddingFolder(false);
    }
  };

  // Bulk folder assignment
  const handleBulkFolderUpdate = async () => {
    if (selectedWordIds.length === 0) return;

    setIsBulkUpdating(true);
    try {
      await Promise.all(
        selectedWordIds.map(wordId => 
          assignWordToFolders(wordId, bulkSelectedFolderIds)
        )
      );
      
      // Refresh the page to show updated folder assignments
      window.location.reload();
    } catch (error) {
      console.error('Error updating word folders:', error);
    } finally {
      setIsBulkUpdating(false);
      setShowBulkFolderEdit(false);
      setSelectedWordIds([]);
      setBulkSelectedFolderIds([]);
      setIsEditMode(false);
    }
  };

  // Individual word editing
  const startEditingWord = (word: Word) => {
    setEditingWordId(word.id);
    setEditingFolderIds(word.folders?.map(f => f.id) || []);
  };

  const cancelEditingWord = () => {
    setEditingWordId(null);
    setEditingFolderIds([]);
    setShowIndividualNewFolderInput(false);
    setIndividualNewFolderName('');
    setIndividualNewFolderColor('#fca311');
  };

  const saveWordFolders = async (wordId: string) => {
    setIsUpdatingWord(true);
    try {
      await assignWordToFolders(wordId, editingFolderIds);
      // Refresh the page to show updated folder assignments
      window.location.reload();
    } catch (error) {
      console.error('Error updating word folders:', error);
    } finally {
      setIsUpdatingWord(false);
      setEditingWordId(null);
      setEditingFolderIds([]);
    }
  };

  const toggleEditingFolder = (folderId: string) => {
    setEditingFolderIds(prev => 
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const toggleBulkFolder = (folderId: string) => {
    setBulkSelectedFolderIds(prev => 
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

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
          
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-primary-navy">Library</h1>
              {selectedFolder && (
                <p className="text-primary-text mt-1">
                  Showing words in <span className="font-medium" style={{ color: selectedFolder.color }}>{selectedFolder.name}</span>
                </p>
              )}
              {selectedFolderId === 'unfoldered' && (
                <p className="text-primary-text mt-1">Showing words not in any folder</p>
              )}
            </div>
            <div className="flex gap-2">
              {!isEditMode ? (
                <>
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="flex items-center bg-primary-navy text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-navy/90 transition-all duration-200"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Words
                  </button>
                  <button
                    onClick={() => onNavigate('add-word')}
                    className="flex items-center bg-primary-highlight text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-highlight/90 transition-all duration-200"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Word
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsEditMode(false);
                    setSelectedWordIds([]);
                    setEditingWordId(null);
                    setEditingWordContent({});
                    setShowBulkFolderEdit(false);
                    setShowBulkNewFolderInput(false);
                    setShowIndividualNewFolderInput(false);
                  }}
                  className="flex items-center bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-all duration-200"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {isEditMode && (
            <div className="bg-white rounded-lg shadow-lg p-4 mb-6 border border-primary-bg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center text-primary-text hover:text-primary-highlight transition-colors duration-200"
                  >
                    {selectedWordIds.length === filteredWords.length && filteredWords.length > 0 ? (
                      <CheckSquare className="h-5 w-5 mr-2" />
                    ) : (
                      <Square className="h-5 w-5 mr-2" />
                    )}
                    {selectedWordIds.length === filteredWords.length && filteredWords.length > 0 ? 'Deselect All' : 'Select All'}
                  </button>
                  
                  {selectedWordIds.length > 0 && (
                    <span className="text-sm text-primary-text">
                      {selectedWordIds.length} word{selectedWordIds.length !== 1 ? 's' : ''} selected
                    </span>
                  )}
                </div>

                {selectedWordIds.length > 0 && (
                  <button
                    onClick={() => setShowBulkFolderEdit(true)}
                    className="flex items-center bg-primary-highlight text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-highlight/90 transition-all duration-200"
                  >
                    <Folder className="h-4 w-4 mr-2" />
                    Assign to Folders
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-text/50 h-5 w-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search words or definitions..."
                className="w-full pl-10 pr-4 py-2 border border-primary-bg rounded-lg focus:ring-2 focus:ring-primary-highlight focus:border-primary-highlight transition-colors duration-200 bg-primary-cream/30 text-primary-text placeholder-primary-text/50"
              />
            </div>
            
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-4 py-2 border border-primary-bg rounded-lg focus:ring-2 focus:ring-primary-highlight focus:border-primary-highlight transition-colors duration-200 bg-primary-cream/30 text-primary-text"
            >
              <option value="all">All Difficulties</option>
              <option value="new">New</option>
              <option value="learning">Learning</option>
              <option value="review">Review</option>
              <option value="mastered">Mastered</option>
            </select>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'alphabetical')}
              className="px-4 py-2 border border-primary-bg rounded-lg focus:ring-2 focus:ring-primary-highlight focus:border-primary-highlight transition-colors duration-200 bg-primary-cream/30 text-primary-text"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">A-Z</option>
            </select>

            {/* Folder Filter */}
            <div className="relative">
              <button
                onClick={() => setShowFolderFilter(!showFolderFilter)}
                className={`flex items-center px-4 py-2 border border-primary-bg rounded-lg focus:ring-2 focus:ring-primary-highlight focus:border-primary-highlight transition-colors duration-200 bg-primary-cream/30 text-primary-text ${
                  selectedFolderId ? 'bg-primary-highlight/10 border-primary-highlight' : ''
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                {selectedFolder ? selectedFolder.name : selectedFolderId === 'unfoldered' ? 'Unfoldered' : 'All Folders'}
                {selectedFolderId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFolderId(null);
                    }}
                    className="ml-2 hover:bg-primary-highlight/20 rounded-full p-0.5 transition-colors duration-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </button>

              {showFolderFilter && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-primary-bg z-10 max-h-64 overflow-y-auto">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setSelectedFolderId(null);
                        setShowFolderFilter(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${
                        !selectedFolderId ? 'bg-primary-highlight/10 text-primary-highlight' : 'hover:bg-primary-cream/50'
                      }`}
                    >
                      All Folders
                    </button>
                    
                    {unfolderedWordsCount > 0 && (
                      <button
                        onClick={() => {
                          setSelectedFolderId('unfoldered');
                          setShowFolderFilter(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 flex items-center ${
                          selectedFolderId === 'unfoldered' ? 'bg-primary-highlight/10 text-primary-highlight' : 'hover:bg-primary-cream/50'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full mr-2 bg-gray-300" />
                        Unfoldered ({unfolderedWordsCount})
                      </button>
                    )}
                    
                    {folders.map(folder => {
                      const folderWordCount = words.filter(word => 
                        word.folders && word.folders.some(f => f.id === folder.id)
                      ).length;
                      
                      return (
                        <button
                          key={folder.id}
                          onClick={() => {
                            setSelectedFolderId(folder.id);
                            setShowFolderFilter(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 flex items-center ${
                            selectedFolderId === folder.id ? 'bg-primary-highlight/10 text-primary-highlight' : 'hover:bg-primary-cream/50'
                          }`}
                        >
                          <div
                            className="w-4 h-4 rounded-full mr-2"
                            style={{ backgroundColor: folder.color }}
                          />
                          {folder.name} ({folderWordCount})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {filteredWords.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-primary-text/40 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-primary-navy mb-2">No words found</h3>
            <p className="text-primary-text mb-6">
              {words.length === 0 
                ? "Start building your vocabulary by adding your first word!"
                : "Try adjusting your search or filter criteria."
              }
            </p>
            {words.length === 0 && (
              <button
                onClick={() => onNavigate('add-word')}
                className="bg-primary-highlight text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-highlight/90 transition-all duration-200"
              >
                Add Your First Word
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWords.map((word) => (
              <div key={word.id} className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border ${
                isEditMode && selectedWordIds.includes(word.id) 
                  ? 'border-primary-highlight ring-2 ring-primary-highlight/20' 
                  : 'border-primary-bg'
              }`}>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {isEditMode && (
                          <button
                            onClick={() => toggleWordSelection(word.id)}
                            className="text-primary-text hover:text-primary-highlight transition-colors duration-200"
                          >
                            {selectedWordIds.includes(word.id) ? (
                              <CheckSquare className="h-5 w-5 text-primary-highlight" />
                            ) : (
                              <Square className="h-5 w-5" />
                            )}
                          </button>
                        )}
                        
                        {/* Editable Word Title */}
                        {editingWordContent[word.id] ? (
                          <input
                            type="text"
                            value={editingWordContent[word.id].word}
                            onChange={(e) => setEditingWordContent(prev => ({
                              ...prev,
                              [word.id]: { ...prev[word.id], word: e.target.value }
                            }))}
                            className="text-xl font-semibold text-primary-navy bg-transparent border-b-2 border-primary-highlight focus:outline-none flex-1"
                            autoFocus
                          />
                        ) : (
                          <h3 
                            className="text-xl font-semibold text-primary-navy cursor-pointer hover:text-primary-highlight transition-colors duration-200 flex-1"
                            onClick={() => isEditMode && !selectedWordIds.includes(word.id) && startEditingWordContent(word)}
                          >
                            {word.article && <span className="text-primary-highlight mr-2">{word.article}</span>}
                            {word.word}
                          </h3>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(word.difficulty)}`}>
                          {word.difficulty.charAt(0).toUpperCase() + word.difficulty.slice(1)}
                        </span>
                        <span className="text-xs text-primary-text/50 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {word.created_at.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      {editingWordContent[word.id] ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => saveWordContent(word)}
                            disabled={savingWordContent[word.id]}
                            className="text-green-500 hover:text-green-600 transition-colors duration-200 p-1"
                          >
                            {savingWordContent[word.id] ? (
                              <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => cancelEditingWordContent(word.id)}
                            className="text-gray-500 hover:text-gray-600 transition-colors duration-200 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          {isEditMode && !selectedWordIds.includes(word.id) && (
                            <button
                              onClick={() => startEditingWord(word)}
                              className="text-primary-text/40 hover:text-primary-highlight transition-colors duration-200 p-1"
                              title="Edit folders"
                            >
                              <Folder className="h-4 w-4" />
                            </button>
                          )}
                          {!isEditMode && (
                            <button
                              onClick={() => onDeleteWord(word.id)}
                              className="text-primary-text/40 hover:text-red-500 transition-colors duration-200 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Editable Definition */}
                  {editingWordContent[word.id] ? (
                    <textarea
                      value={editingWordContent[word.id].definition}
                      onChange={(e) => setEditingWordContent(prev => ({
                        ...prev,
                        [word.id]: { ...prev[word.id], definition: e.target.value }
                      }))}
                      className="w-full text-primary-text leading-relaxed mb-4 bg-transparent border-2 border-primary-highlight rounded-lg p-2 focus:outline-none resize-none"
                      rows={3}
                    />
                  ) : (
                    <p 
                      className="text-primary-text leading-relaxed mb-4 cursor-pointer hover:bg-primary-cream/30 rounded p-1 transition-colors duration-200"
                      onClick={() => isEditMode && !selectedWordIds.includes(word.id) && startEditingWordContent(word)}
                    >
                      {word.definition}
                    </p>
                  )}
                  
                  {/* Folder Labels or Editing Interface */}
                  {editingWordId === word.id ? (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-primary-text mb-2">Assign to folders:</p>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {folders.map(folder => (
                          <button
                            key={folder.id}
                            onClick={() => toggleEditingFolder(folder.id)}
                            className={`flex items-center p-2 rounded-lg border transition-all duration-200 text-left ${
                              editingFolderIds.includes(folder.id)
                                ? 'border-primary-highlight bg-primary-highlight/10'
                                : 'border-primary-bg hover:border-primary-highlight/50 bg-primary-cream/30'
                            }`}
                          >
                            <div
                              className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                              style={{ backgroundColor: folder.color }}
                            />
                            <span className="text-xs font-medium text-primary-text truncate">
                              {folder.name}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Add New Folder for Individual Editing */}
                      {!showIndividualNewFolderInput ? (
                        <button
                          onClick={() => setShowIndividualNewFolderInput(true)}
                          className="flex items-center text-primary-highlight hover:text-primary-highlight/80 transition-colors duration-200 text-sm font-medium mb-3"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add New Folder
                        </button>
                      ) : (
                        <div className="bg-primary-cream/50 rounded-lg p-3 space-y-3 mb-3">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={individualNewFolderName}
                              onChange={(e) => setIndividualNewFolderName(e.target.value)}
                              placeholder="Folder name..."
                              className="flex-1 px-3 py-2 border border-primary-bg rounded-lg focus:ring-2 focus:ring-primary-highlight focus:border-primary-highlight transition-colors duration-200 bg-white text-primary-text text-sm"
                            />
                            <div className="flex gap-1">
                              {folderColors.slice(0, 5).map(color => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => setIndividualNewFolderColor(color)}
                                  className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                                    individualNewFolderColor === color ? 'border-primary-text scale-110' : 'border-white'
                                  }`}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleIndividualAddNewFolder}
                              disabled={!individualNewFolderName.trim() || isIndividualAddingFolder}
                              className="px-3 py-1 bg-primary-highlight text-white rounded text-sm font-medium hover:bg-primary-highlight/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
                            >
                              {isIndividualAddingFolder ? (
                                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1" />
                              ) : (
                                <Plus className="h-3 w-3 mr-1" />
                              )}
                              Add
                            </button>
                            <button
                              onClick={() => {
                                setShowIndividualNewFolderInput(false);
                                setIndividualNewFolderName('');
                                setIndividualNewFolderColor('#fca311');
                              }}
                              className="px-3 py-1 text-primary-text hover:text-primary-highlight transition-colors duration-200 text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => saveWordFolders(word.id)}
                          disabled={isUpdatingWord}
                          className="flex items-center px-3 py-1 bg-green-500 text-white rounded text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-all duration-200"
                        >
                          {isUpdatingWord ? (
                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1" />
                          ) : (
                            <Check className="h-3 w-3 mr-1" />
                          )}
                          Save
                        </button>
                        <button
                          onClick={cancelEditingWord}
                          className="px-3 py-1 text-primary-text hover:text-primary-highlight transition-colors duration-200 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    word.folders && word.folders.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {word.folders.map(folder => (
                          <span
                            key={folder.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: folder.color }}
                          >
                            <Folder className="h-3 w-3 mr-1" />
                            {folder.name}
                          </span>
                        ))}
                      </div>
                    )
                  )}
                  
                  <div className="text-sm text-primary-text/70 space-y-1">
                    <div className="flex justify-between">
                      <span>Reviews:</span>
                      <span>{word.review_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accuracy:</span>
                      <span>
                        {word.review_count > 0 
                          ? `${Math.round((word.correct_count / word.review_count) * 100)}%`
                          : 'N/A'
                        }
                      </span>
                    </div>
                    {word.last_reviewed && (
                      <div className="flex justify-between">
                        <span>Last Review:</span>
                        <span>{word.last_reviewed.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bulk Folder Assignment Modal */}
        {showBulkFolderEdit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-primary-navy mb-4">
                  Add {selectedWordIds.length} word{selectedWordIds.length !== 1 ? 's' : ''} to folders
                </h3>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {folders.map(folder => (
                    <button
                      key={folder.id}
                      onClick={() => toggleBulkFolder(folder.id)}
                      className={`flex items-center p-3 rounded-lg border transition-all duration-200 text-left ${
                        bulkSelectedFolderIds.includes(folder.id)
                          ? 'border-primary-highlight bg-primary-highlight/10'
                          : 'border-primary-bg hover:border-primary-highlight/50 bg-primary-cream/30'
                      }`}
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

                {/* Add New Folder for Bulk Editing */}
                {!showBulkNewFolderInput ? (
                  <button
                    onClick={() => setShowBulkNewFolderInput(true)}
                    className="flex items-center text-primary-highlight hover:text-primary-highlight/80 transition-colors duration-200 text-sm font-medium mb-4"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add New Folder
                  </button>
                ) : (
                  <div className="bg-primary-cream/50 rounded-lg p-4 space-y-3 mb-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={bulkNewFolderName}
                        onChange={(e) => setBulkNewFolderName(e.target.value)}
                        placeholder="Folder name..."
                        className="flex-1 px-3 py-2 border border-primary-bg rounded-lg focus:ring-2 focus:ring-primary-highlight focus:border-primary-highlight transition-colors duration-200 bg-white text-primary-text text-sm"
                      />
                      <div className="flex gap-1">
                        {folderColors.slice(0, 5).map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setBulkNewFolderColor(color)}
                            className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                              bulkNewFolderColor === color ? 'border-primary-text scale-110' : 'border-white'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleBulkAddNewFolder}
                        disabled={!bulkNewFolderName.trim() || isBulkAddingFolder}
                        className="px-3 py-1 bg-primary-highlight text-white rounded text-sm font-medium hover:bg-primary-highlight/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
                      >
                        {isBulkAddingFolder ? (
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1" />
                        ) : (
                          <Plus className="h-3 w-3 mr-1" />
                        )}
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowBulkNewFolderInput(false);
                          setBulkNewFolderName('');
                          setBulkNewFolderColor('#fca311');
                        }}
                        className="px-3 py-1 text-primary-text hover:text-primary-highlight transition-colors duration-200 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleBulkFolderUpdate}
                    disabled={isBulkUpdating}
                    className="flex-1 bg-primary-highlight text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-highlight/90 disabled:opacity-50 transition-all duration-200 flex items-center justify-center"
                  >
                    {isBulkUpdating ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Add Words
                  </button>
                  <button
                    onClick={() => {
                      setShowBulkFolderEdit(false);
                      setBulkSelectedFolderIds([]);
                      setShowBulkNewFolderInput(false);
                      setBulkNewFolderName('');
                      setBulkNewFolderColor('#fca311');
                    }}
                    className="px-4 py-2 border border-primary-bg text-primary-text rounded-lg font-medium hover:bg-primary-cream/50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Click outside to close folder filter */}
        {showFolderFilter && (
          <div
            className="fixed inset-0 z-5"
            onClick={() => setShowFolderFilter(false)}
          />
        )}
      </main>
    </div>
  );
};