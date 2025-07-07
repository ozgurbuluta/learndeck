import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Minimize2, Maximize2, Bot, User, Loader2, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useFolders } from '../hooks/useFolders';
import { useAIChatbot } from '../hooks/useAIChatbot';

interface FloatingChatbotProps {
  onAddWords?: (words: Array<{ word: string; definition: string }>, folderIds: string[]) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
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

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({ onAddWords, isOpen: externalIsOpen, onClose }) => {
  const { user } = useAuth();
  const { folders, addFolder } = useFolders(user);
  const { generateFlashcards, loading: aiLoading } = useAIChatbot();
  
  const [isOpen, setIsOpen] = useState(externalIsOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<WordSuggestion | null>(null);
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const [showFolderSelection, setShowFolderSelection] = useState(false);
  const [isAddingWords, setIsAddingWords] = useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#fca311');
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI vocabulary assistant. I can help you create personalized flashcards. What language are you studying?",
      timestamp: new Date(),
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsOpen(externalIsOpen);
  }, [externalIsOpen]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

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
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));

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
      const result = await generateFlashcards(userMessage, messages);
      
      if (result.success && result.words && result.words.length > 0) {
        setCurrentSuggestion({
          words: result.words,
          suggestedFolderName: result.suggestedFolderName,
          language: result.language,
          level: result.level,
          category: result.category,
        });

        await simulateTyping(
          `Great! I've generated ${result.words.length} ${result.language || 'vocabulary'} words for ${result.category || 'your study needs'}${result.level ? ` at ${result.level} level` : ''}. Check them out below!`
        );
      } else if (result.response) {
        await simulateTyping(result.response);
      } else {
        await simulateTyping(
          "I understand you'd like help with vocabulary. Could you tell me more about what language you're studying and what topic you'd like to focus on?"
        );
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      await simulateTyping(
        "I'm having trouble right now. Could you try rephrasing your request? For example, 'I'm learning Spanish and need travel vocabulary.'"
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

  const handleRejectWords = async () => {
    setCurrentSuggestion(null);
    await simulateTyping(
      "No problem! Let me know what changes you'd like or try a different request. I can adjust the difficulty, topic, or create words for a different language."
    );
  };

  const handleAddToLibrary = async () => {
    if (!currentSuggestion || !onAddWords) return;

    setIsAddingWords(true);
    try {
      await onAddWords(currentSuggestion.words, selectedFolderIds);
      
      setCurrentSuggestion(null);
      setSelectedFolderIds([]);
      setShowFolderSelection(false);
      
      await simulateTyping(
        `Perfect! I've added ${currentSuggestion.words.length} words to your library. You can now study them using spaced repetition. Need more vocabulary?`
      );
    } catch (error) {
      console.error('Error adding words:', error);
      await simulateTyping(
        "Sorry, there was an error adding the words. Please try again."
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
    if (!newFolderName.trim()) return;

    try {
      const newFolder = await addFolder({
        name: newFolderName.trim(),
        color: newFolderColor,
      });

      if (newFolder) {
        setSelectedFolderIds([newFolder.id]);
      }

      setNewFolderName('');
      setNewFolderColor('#fca311');
      setShowNewFolderInput(false);
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary-highlight text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 hover:scale-110"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 w-96 bg-white rounded-xl shadow-2xl border border-primary-bg z-50 transition-all duration-300 ${
          isMinimized ? 'h-14' : 'h-[500px]'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-primary-bg bg-primary-navy text-white rounded-t-xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-highlight rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Assistant</h3>
                <p className="text-xs opacity-80">Vocabulary Helper</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/10 rounded transition-colors duration-200"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-white/10 rounded transition-colors duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-[85%] ${
                      message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === 'user' 
                          ? 'bg-primary-highlight' 
                          : 'bg-primary-navy'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="h-3 w-3 text-white" />
                        ) : (
                          <Bot className="h-3 w-3 text-white" />
                        )}
                      </div>
                      
                      <div className={`rounded-lg px-3 py-2 text-sm ${
                        message.type === 'user'
                          ? 'bg-primary-highlight text-white'
                          : 'bg-primary-cream/50 text-primary-text'
                      }`}>
                        {message.isTyping ? (
                          <div className="flex items-center space-x-1">
                            <div className="flex space-x-1">
                              <div className="w-1 h-1 bg-primary-text/50 rounded-full animate-bounce"></div>
                              <div className="w-1 h-1 bg-primary-text/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-1 h-1 bg-primary-text/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Word Suggestions */}
                {currentSuggestion && (
                  <div className="bg-primary-cream/30 rounded-lg p-3 border border-primary-bg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-primary-highlight" />
                      <span className="text-sm font-semibold text-primary-navy">
                        {currentSuggestion.words.length} Words Generated
                      </span>
                    </div>
                    
                    <div className="max-h-32 overflow-y-auto space-y-1 mb-3">
                      {currentSuggestion.words.slice(0, 5).map((word, index) => (
                        <div key={index} className="text-xs bg-white rounded p-2">
                          <span className="font-medium text-primary-navy">{word.word}</span>
                          <span className="text-primary-text/70 ml-2">- {word.definition.slice(0, 50)}...</span>
                        </div>
                      ))}
                      {currentSuggestion.words.length > 5 && (
                        <div className="text-xs text-primary-text/70 text-center">
                          +{currentSuggestion.words.length - 5} more words...
                        </div>
                      )}
                    </div>

                    {!showFolderSelection ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleApproveWords}
                          className="flex-1 bg-green-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-600 transition-colors duration-200"
                        >
                          Add to Library
                        </button>
                        <button
                          onClick={handleRejectWords}
                          className="px-3 py-1 border border-primary-bg text-primary-text rounded text-xs font-medium hover:bg-primary-cream/50 transition-colors duration-200"
                        >
                          Try Again
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-primary-navy">Choose folders (optional):</p>
                        
                        <div className="max-h-20 overflow-y-auto space-y-1">
                          {folders.slice(0, 4).map(folder => (
                            <button
                              key={folder.id}
                              onClick={() => toggleFolderSelection(folder.id)}
                              className={`w-full flex items-center p-2 rounded text-left text-xs transition-colors duration-200 ${
                                selectedFolderIds.includes(folder.id)
                                  ? 'bg-primary-highlight/10 border border-primary-highlight'
                                  : 'bg-white border border-primary-bg hover:bg-primary-cream/50'
                              }`}
                            >
                              <div
                                className="w-2 h-2 rounded-full mr-2"
                                style={{ backgroundColor: folder.color }}
                              />
                              <span className="truncate">{folder.name}</span>
                            </button>
                          ))}
                        </div>

                        {currentSuggestion.suggestedFolderName && !showNewFolderInput && (
                          <button
                            onClick={() => setShowNewFolderInput(true)}
                            className="text-xs text-primary-highlight hover:text-primary-highlight/80 transition-colors duration-200"
                          >
                            + Create "{currentSuggestion.suggestedFolderName}" folder
                          </button>
                        )}

                        {showNewFolderInput && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={newFolderName}
                              onChange={(e) => setNewFolderName(e.target.value)}
                              placeholder="Folder name..."
                              className="w-full px-2 py-1 border border-primary-bg rounded text-xs"
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={createNewFolder}
                                disabled={!newFolderName.trim()}
                                className="px-2 py-1 bg-primary-highlight text-white rounded text-xs hover:bg-primary-highlight/90 disabled:opacity-50"
                              >
                                Create
                              </button>
                              <button
                                onClick={() => setShowNewFolderInput(false)}
                                className="px-2 py-1 text-primary-text hover:text-primary-highlight text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={handleAddToLibrary}
                            disabled={isAddingWords}
                            className="flex-1 bg-primary-highlight text-white px-3 py-1 rounded text-xs font-medium hover:bg-primary-highlight/90 disabled:opacity-50 transition-colors duration-200 flex items-center justify-center"
                          >
                            {isAddingWords ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <Plus className="h-3 w-3 mr-1" />
                            )}
                            Add Words
                          </button>
                          <button
                            onClick={() => setShowFolderSelection(false)}
                            className="px-3 py-1 border border-primary-bg text-primary-text rounded text-xs font-medium hover:bg-primary-cream/50 transition-colors duration-200"
                          >
                            Back
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-primary-bg">
                <div className="flex space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask for vocabulary help..."
                    disabled={aiLoading || isTyping}
                    className="flex-1 px-3 py-2 border border-primary-bg rounded-lg focus:ring-1 focus:ring-primary-highlight focus:border-primary-highlight transition-colors duration-200 text-sm disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || aiLoading || isTyping}
                    className="bg-primary-highlight text-white px-3 py-2 rounded-lg hover:bg-primary-highlight/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                  >
                    {aiLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};