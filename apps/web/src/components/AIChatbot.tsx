import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot, User, Loader2, Check, X, Plus, Sparkles, MessageCircle, Brain } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useFolders } from '../hooks/useFolders';
import { useAIChatbot } from '../hooks/useAIChatbot';

interface AIChatbotProps {
  onNavigate: (view: string) => void;
  onAddWords?: (words: Array<{ word: string; definition: string }>, folderIds: string[]) => Promise<void>;
  currentView?: string;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  category?: string;
}

interface GeneratedWord {
  word: string;
  definition: string;
}

interface WordSuggestion {
  words: GeneratedWord[];
  suggestedFolderName?: string;
  language?: string;
  level?: string;
  category?: string;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({ onNavigate, onAddWords, currentView: _currentView }) => {
  void _currentView;
  const { user } = useAuth();
  const { folders, addFolder } = useFolders(user);
  const { generateFlashcards, loading: aiLoading } = useAIChatbot();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your AI vocabulary assistant. I can help you create personalized flashcards for language learning. What language are you studying, and what specific vocabulary would you like to work on today?",
      timestamp: new Date(),
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<WordSuggestion | null>(null);
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const [showFolderSelection, setShowFolderSelection] = useState(false);
  const [isAddingWords, setIsAddingWords] = useState(false);
  
  // Word preview and selection states
  const [showAllWords, setShowAllWords] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedWordIndices, setSelectedWordIndices] = useState<Set<number>>(new Set());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (content: string, type: 'user' | 'assistant') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateTyping = async (content: string) => {
    setIsTyping(true);
    
    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages(prev => [...prev, typingMessage]);

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Remove typing indicator and add actual message
    setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
    addMessage(content, 'assistant');
    setIsTyping(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || aiLoading || isTyping) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    addMessage(userMessage, 'user');

    try {
      // Map local message format to the format expected by the hook
      const conversationForAPI = messages.map(({ type, content }) => ({ type, content }));

      // Generate flashcards using AI
      const result = await generateFlashcards(userMessage, conversationForAPI);
      
      if (result.success) {
        // Display the conversational part of the response
        if (result.response) {
          await simulateTyping(result.response);
        }
  
        // If there are words, display them as a suggestion card
        if (result.words && result.words.length > 0) {
          setCurrentSuggestion({
            words: result.words,
            suggestedFolderName: result.suggestedFolderName,
            language: result.language,
            level: result.level,
            category: result.category,
          });
          // Reset word preview and selection states
          setShowAllWords(false);
          setIsSelectMode(false);
          setSelectedWordIndices(new Set());
        }
      } else {
        // Handle the case where the function call itself failed or returned success: false
        console.error('Error generating flashcards:', result.error);
        await simulateTyping(
          result.response || "I apologize, but I'm having trouble generating flashcards right now. Please try again."
        );
      }

    } catch (error) {
      console.error('Error generating flashcards:', error);
      await simulateTyping(
        "I apologize, but I'm having trouble generating flashcards right now. Could you try rephrasing your request? For example, tell me what language you're studying and what specific vocabulary you need help with."
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleApproveWords = () => {
    if (!currentSuggestion) return;
    setShowFolderSelection(true);
  };

  const toggleWordSelection = (index: number) => {
    setSelectedWordIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (!currentSuggestion) return;
    const totalWords = currentSuggestion.words.length;
    if (selectedWordIndices.size === totalWords) {
      setSelectedWordIndices(new Set());
    } else {
      setSelectedWordIndices(new Set(Array.from({ length: totalWords }, (_, i) => i)));
    }
  };

  const enterSelectMode = () => {
    setIsSelectMode(true);
    if (currentSuggestion) {
      setSelectedWordIndices(new Set(Array.from({ length: currentSuggestion.words.length }, (_, i) => i)));
    }
  };

  const exitSelectMode = () => {
    setIsSelectMode(false);
    setSelectedWordIndices(new Set());
  };

  const handleRejectWords = async () => {
    setCurrentSuggestion(null);
    await simulateTyping(
      "No problem! Let me know what changes you'd like or if you want to try a different approach. I can:\n\n• Generate words for a different topic\n• Adjust the difficulty level\n• Create more or fewer words\n• Focus on specific word types (nouns, verbs, etc.)\n\nWhat would you prefer?"
    );
  };

  const handleAddToLibrary = async () => {
    if (!currentSuggestion || !onAddWords) return;

    setIsAddingWords(true);
    try {
      // If in select mode, only add selected words
      const wordsToAdd = isSelectMode 
        ? currentSuggestion.words.filter((_, index) => selectedWordIndices.has(index))
        : currentSuggestion.words;
      
      if (wordsToAdd.length === 0) {
        await simulateTyping(
          "Please select at least one word to add to your library."
        );
        setIsAddingWords(false);
        return;
      }

      await onAddWords(wordsToAdd, selectedFolderIds);
      
      setCurrentSuggestion(null);
      setSelectedFolderIds([]);
      setShowFolderSelection(false);
      setIsSelectMode(false);
      setSelectedWordIndices(new Set());
      setShowAllWords(false);
      
      await simulateTyping(
        `Perfect! I've added ${wordsToAdd.length} word${wordsToAdd.length !== 1 ? 's' : ''} to your library. You can now study them using spaced repetition. Would you like me to help you create more vocabulary for a different topic?`
      );
    } catch (error) {
      console.error('Error adding words:', error);
      await simulateTyping(
        "I'm sorry, there was an error adding the words to your library. Please try again or contact support if the issue persists."
      );
    } finally {
      setIsAddingWords(false);
    }
  };

  const toggleFolderSelection = (folderId: string) => {
    setSelectedFolderIds(prev => 
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const createNewFolder = async () => {
    if (!currentSuggestion?.suggestedFolderName) return;

    try {
      const newFolder = await addFolder({
        name: currentSuggestion.suggestedFolderName,
        color: '#fca311',
      });

      if (newFolder) {
        setSelectedFolderIds([newFolder.id]);
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    }
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
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-highlight rounded-full mb-4">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-primary-navy mb-2">AI Vocabulary Assistant</h1>
            <p className="text-primary-text max-w-2xl mx-auto">
              Chat with AI to create personalized flashcards. Tell me what language you're studying and what vocabulary you need!
            </p>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-xl shadow-lg border border-primary-bg overflow-hidden">
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-[80%] ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' 
                      ? 'bg-primary-highlight' 
                      : 'bg-primary-navy'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  
                  <div className={`rounded-lg px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-primary-highlight text-white'
                      : 'bg-primary-cream/50 text-primary-text'
                  }`}>
                    {message.isTyping ? (
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary-text/50 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary-text/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-primary-text/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Word Suggestions */}
          {currentSuggestion && (
            <div className="border-t border-primary-bg p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-primary-navy flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-primary-highlight" />
                    Generated Flashcards ({currentSuggestion.words.length} words)
                    {isSelectMode && (
                      <span className="ml-2 text-sm text-primary-highlight">
                        ({selectedWordIndices.size} selected)
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-2">
                    {currentSuggestion.words.length > 4 && !showAllWords && (
                      <button
                        onClick={() => setShowAllWords(true)}
                        className="text-sm text-primary-highlight hover:text-primary-highlight/80 transition-colors duration-200 px-3 py-1 border border-primary-highlight rounded-md"
                      >
                        See More
                      </button>
                    )}
                    {!isSelectMode ? (
                      <button
                        onClick={enterSelectMode}
                        className="text-sm text-primary-highlight hover:text-primary-highlight/80 transition-colors duration-200 px-3 py-1 border border-primary-highlight rounded-md"
                      >
                        Select Words
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleSelectAll}
                          className="text-sm text-primary-highlight hover:text-primary-highlight/80 transition-colors duration-200"
                        >
                          {selectedWordIndices.size === currentSuggestion.words.length ? 'Deselect All' : 'Select All'}
                        </button>
                        <button
                          onClick={exitSelectMode}
                          className="text-sm text-primary-text hover:text-primary-highlight transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {currentSuggestion.language && (
                  <p className="text-sm text-primary-text/70 mb-4">
                    {currentSuggestion.language} • {currentSuggestion.level} • {currentSuggestion.category}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 max-h-64 overflow-y-auto">
                {currentSuggestion.words.map((word, index) => {
                  // Only show this word if we're showing all words, or if it's in the first 4
                  if (!showAllWords && index >= 4) return null;
                  
                  return (
                    <div 
                      key={index} 
                      className={`rounded-lg p-3 border transition-all duration-200 ${
                        isSelectMode
                          ? selectedWordIndices.has(index)
                            ? 'bg-primary-highlight/10 border-primary-highlight cursor-pointer'
                            : 'bg-primary-cream/30 border-primary-bg cursor-pointer hover:border-primary-highlight/50'
                          : 'bg-primary-cream/30 border-primary-bg'
                      }`}
                      onClick={isSelectMode ? () => toggleWordSelection(index) : undefined}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-primary-navy mb-1">
                            {word.word || (word as any).sentence}
                          </h4>
                          {word.definition && <p className="text-sm text-primary-text">{word.definition}</p>}
                        </div>
                        {isSelectMode && (
                          <div className="ml-3 flex-shrink-0">
                            <input
                              type="checkbox"
                              checked={selectedWordIndices.has(index)}
                              onChange={() => toggleWordSelection(index)}
                              className="w-4 h-4 text-primary-highlight bg-gray-100 border-gray-300 rounded focus:ring-primary-highlight focus:ring-2"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {!showFolderSelection ? (
                <div className="flex gap-3">
                  <button
                    onClick={handleApproveWords}
                    disabled={isSelectMode && selectedWordIndices.size === 0}
                    className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                  >
                    <Check className="h-5 w-5 mr-2" />
                    {isSelectMode 
                      ? selectedWordIndices.size === 0 
                        ? 'Select Words to Add'
                        : selectedWordIndices.size === 1
                        ? 'Add Selected Word'
                        : `Add ${selectedWordIndices.size} Selected Words`
                      : 'Add All Words'
                    }
                  </button>
                  <button
                    onClick={handleRejectWords}
                    className="px-6 py-3 border border-primary-bg text-primary-text rounded-lg font-medium hover:bg-primary-cream/50 transition-colors duration-200 flex items-center justify-center"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-medium text-primary-navy">Choose folders (optional):</h4>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {folders.map(folder => (
                      <button
                        key={folder.id}
                        onClick={() => toggleFolderSelection(folder.id)}
                        className={`flex items-center p-3 rounded-lg border transition-all duration-200 text-left ${
                          selectedFolderIds.includes(folder.id)
                            ? 'border-primary-highlight bg-primary-highlight/10'
                            : 'border-primary-bg hover:border-primary-highlight/50 bg-primary-cream/30'
                        }`}
                      >
                        <div
                          className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                          style={{ backgroundColor: folder.color }}
                        />
                        <span className="text-sm font-medium text-primary-text truncate">
                          {folder.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  {currentSuggestion.suggestedFolderName && (
                    <button
                      onClick={createNewFolder}
                      className="flex items-center text-primary-highlight hover:text-primary-highlight/80 transition-colors duration-200 text-sm font-medium"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Create "{currentSuggestion.suggestedFolderName}" folder
                    </button>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleAddToLibrary}
                      disabled={isAddingWords || (isSelectMode && selectedWordIndices.size === 0)}
                      className="flex-1 bg-primary-highlight text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-highlight/90 disabled:opacity-50 transition-all duration-200 flex items-center justify-center"
                    >
                      {isAddingWords ? (
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      ) : (
                        <Plus className="h-5 w-5 mr-2" />
                      )}
                      {isSelectMode 
                        ? selectedWordIndices.size === 0 
                          ? 'Select Words to Add'
                          : selectedWordIndices.size === 1
                          ? 'Add Selected Word'
                          : `Add ${selectedWordIndices.size} Selected Words`
                        : 'Add All Words'
                      }
                    </button>
                    <button
                      onClick={() => setShowFolderSelection(false)}
                      className="px-6 py-3 border border-primary-bg text-primary-text rounded-lg font-medium hover:bg-primary-cream/50 transition-colors duration-200"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-primary-bg p-4">
            <div className="flex space-x-3">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tell me what vocabulary you'd like to learn..."
                disabled={aiLoading || isTyping}
                className="flex-1 px-4 py-3 border border-primary-bg rounded-lg focus:ring-2 focus:ring-primary-highlight focus:border-primary-highlight transition-colors duration-200 bg-primary-cream/30 text-primary-text placeholder-primary-text/50 disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || aiLoading || isTyping}
                className="bg-primary-highlight text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-highlight/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {aiLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Examples */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-primary-bg">
          <h3 className="text-lg font-semibold text-primary-navy mb-4 flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Example Requests
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-primary-cream/30 rounded-lg p-4">
              <h4 className="font-medium text-primary-navy mb-2">Language Learning</h4>
              <p className="text-sm text-primary-text/70 mb-2">"I'm learning German at B2 level and need daily life vocabulary"</p>
              <p className="text-sm text-primary-text/70">"Help me with Spanish business terms for intermediate level"</p>
            </div>
            <div className="bg-primary-cream/30 rounded-lg p-4">
              <h4 className="font-medium text-primary-navy mb-2">Specific Topics</h4>
              <p className="text-sm text-primary-text/70 mb-2">"Create French cooking vocabulary for beginners"</p>
              <p className="text-sm text-primary-text/70">"I need Italian travel phrases for my trip"</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};