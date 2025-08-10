import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { useAIChatbot } from '../hooks/useAIChatbot';
import { useWords } from '../hooks/useWords';

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

export const ChatbotScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { addWords } = useWords(user?.id);
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
  const [isAddingWords, setIsAddingWords] = useState(false);
  
  // Word preview and selection states
  const [showAllWords, setShowAllWords] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedWordIndices, setSelectedWordIndices] = useState<Set<number>>(new Set());

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
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

    // Prepare conversation history
    const conversationHistory = messages.map(msg => ({
      type: msg.type,
      content: msg.content,
    }));

    try {
      const result = await generateFlashcards(userMessage, conversationHistory);

      if (result.success && result.words && result.words.length > 0) {
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

        const wordCount = result.words.length;
        const folderInfo = result.suggestedFolderName ? ` in a folder called "${result.suggestedFolderName}"` : '';
        const responseMessage = result.response || 
          `Great! I've generated ${wordCount} vocabulary word${wordCount !== 1 ? 's' : ''} for you${folderInfo}. Review them below and tap "Add to Library" when you're ready!`;

        await simulateTyping(responseMessage);
      } else {
        const responseMessage = result.response || 
          "I couldn't generate vocabulary words from that request. Could you be more specific? For example: 'Generate 10 Spanish food vocabulary words' or 'Create beginner French travel phrases'.";
        await simulateTyping(responseMessage);
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      await simulateTyping("I'm having trouble right now. Could you try again in a moment?");
    }
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

  const handleAddWords = async () => {
    if (!currentSuggestion || !user) return;

    // If in select mode, only add selected words
    const selectedWords = isSelectMode 
      ? currentSuggestion.words.filter((_, index) => selectedWordIndices.has(index))
      : currentSuggestion.words;
    
    if (selectedWords.length === 0) {
      Alert.alert('No Words Selected', 'Please select at least one word to add to your library.');
      return;
    }

    setIsAddingWords(true);
    try {
      // Add words to user's library
      const now = new Date();
      const nextReview = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      const wordsToAdd = selectedWords.map(word => ({
        word: word.word,
        definition: word.definition,
        difficulty: 'new' as const,
        next_review: nextReview.toISOString(),
        last_reviewed: null,
        review_count: 0,
        correct_count: 0,
        created_at: now.toISOString(),
        user_id: user.id,
      }));

      await addWords(wordsToAdd);
      
      Alert.alert(
        'Success!',
        `Added ${selectedWords.length} word${selectedWords.length !== 1 ? 's' : ''} to your library.`,
        [{ text: 'OK' }]
      );

      setCurrentSuggestion(null);
      setIsSelectMode(false);
      setSelectedWordIndices(new Set());
      setShowAllWords(false);
      
      await simulateTyping(`Perfect! I've added ${selectedWords.length} word${selectedWords.length !== 1 ? 's' : ''} to your library. You can start studying them right away. Is there anything else I can help you with?`);
    } catch (error) {
      console.error('Error adding words:', error);
      Alert.alert('Error', 'Failed to add words to your library. Please try again.');
    } finally {
      setIsAddingWords(false);
    }
  };

  const renderMessage = (message: Message) => {
    if (message.isTyping) {
      return (
        <View key={message.id} style={[styles.messageContainer, styles.assistantMessage]}>
          <View style={styles.messageContent}>
            <View style={styles.typingIndicator}>
              <Text style={styles.typingText}>AI is typing</Text>
              <ActivityIndicator size="small" color="#666" style={styles.typingSpinner} />
            </View>
          </View>
        </View>
      );
    }

    const isUser = message.type === 'user';
    return (
      <View key={message.id} style={[styles.messageContainer, isUser ? styles.userMessage : styles.assistantMessage]}>
        <View style={[styles.messageContent, isUser ? styles.userMessageContent : styles.assistantMessageContent]}>
          <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.assistantMessageText]}>
            {message.content}
          </Text>
        </View>
      </View>
    );
  };

  const renderWordSuggestion = () => {
    if (!currentSuggestion) return null;

    const wordsToShow = showAllWords ? currentSuggestion.words : currentSuggestion.words.slice(0, 4);

    return (
      <View style={styles.suggestionContainer}>
        <View style={styles.suggestionHeader}>
          <View style={styles.suggestionTitleContainer}>
            <Text style={styles.suggestionTitle}>
              Generated Vocabulary ({currentSuggestion.words.length} words)
            </Text>
            {isSelectMode && (
              <Text style={styles.selectionCount}>
                ({selectedWordIndices.size} selected)
              </Text>
            )}
          </View>
          <View style={styles.actionButtons}>
            {currentSuggestion.words.length > 4 && !showAllWords && (
              <TouchableOpacity
                style={styles.seeMoreButton}
                onPress={() => setShowAllWords(true)}
              >
                <Text style={styles.seeMoreText}>See More</Text>
              </TouchableOpacity>
            )}
            {!isSelectMode ? (
              <TouchableOpacity
                style={styles.selectButton}
                onPress={enterSelectMode}
              >
                <Text style={styles.selectText}>Select</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.selectModeButtons}>
                <TouchableOpacity onPress={toggleSelectAll}>
                  <Text style={styles.selectAllText}>
                    {selectedWordIndices.size === currentSuggestion.words.length ? 'Deselect All' : 'Select All'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={exitSelectMode}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {currentSuggestion.suggestedFolderName && (
          <Text style={styles.suggestionSubtitle}>Folder: {currentSuggestion.suggestedFolderName}</Text>
        )}
        
        <ScrollView style={styles.wordsContainer} nestedScrollEnabled>
          {currentSuggestion.words.map((word, index) => {
            // Only show this word if we're showing all words, or if it's in the first 4
            if (!showAllWords && index >= 4) return null;
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.wordCard,
                  isSelectMode && selectedWordIndices.has(index) && styles.selectedWordCard,
                  isSelectMode && styles.selectableWordCard
                ]}
                onPress={isSelectMode ? () => toggleWordSelection(index) : undefined}
                activeOpacity={isSelectMode ? 0.7 : 1}
              >
                <View style={styles.wordCardContent}>
                  <View style={styles.wordInfo}>
                    <Text style={styles.wordText}>{word.word}</Text>
                    <Text style={styles.definitionText}>{word.definition}</Text>
                  </View>
                  {isSelectMode && (
                    <View style={styles.checkboxContainer}>
                      <Ionicons
                        name={selectedWordIndices.has(index) ? "checkbox" : "square-outline"}
                        size={24}
                        color={selectedWordIndices.has(index) ? "#007AFF" : "#ccc"}
                      />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.addButton, 
            (isAddingWords || (isSelectMode && selectedWordIndices.size === 0)) && styles.addButtonDisabled
          ]}
          onPress={handleAddWords}
          disabled={isAddingWords || (isSelectMode && selectedWordIndices.size === 0)}
        >
          {isAddingWords ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>
                {isSelectMode 
                  ? selectedWordIndices.size === 0 
                    ? 'Select Words to Add'
                    : selectedWordIndices.size === 1
                    ? 'Add Selected Word'
                    : `Add ${selectedWordIndices.size} Selected Words`
                  : 'Add All Words'
                }
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Vocabulary Assistant</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(renderMessage)}
        {renderWordSuggestion()}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="Ask for vocabulary words..."
          placeholderTextColor="#999"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputValue.trim() || aiLoading || isTyping) && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!inputValue.trim() || aiLoading || isTyping}
        >
          {aiLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  assistantMessage: {
    alignItems: 'flex-start',
  },
  messageContent: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userMessageContent: {
    backgroundColor: '#FF8C00',
  },
  assistantMessageContent: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  assistantMessageText: {
    color: '#333',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  typingSpinner: {
    marginLeft: 8,
  },
  suggestionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  suggestionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  wordsContainer: {
    maxHeight: 200,
    marginBottom: 16,
  },
  wordCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  wordText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  definitionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonDisabled: {
    opacity: 0.7,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#f8f9fa',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  suggestionHeader: {
    marginBottom: 12,
  },
  suggestionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectionCount: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  seeMoreButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  seeMoreText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  selectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  selectText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  selectModeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  selectAllText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  cancelText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  wordCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordInfo: {
    flex: 1,
  },
  checkboxContainer: {
    marginLeft: 12,
  },
  selectableWordCard: {
    borderWidth: 2,
    borderColor: '#e1e1e1',
  },
  selectedWordCard: {
    backgroundColor: '#e7f3ff',
    borderColor: '#007AFF',
  },
});