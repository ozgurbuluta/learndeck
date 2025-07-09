import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAIChatbot } from '../hooks/useAIChatbot';
import { useAuth } from '../hooks/useAuth';
import { useWords } from '../hooks/useWords';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../components/Screen';

// Basic emoji placeholders for avatars & icons
const USER_ICON = '👤';
const BOT_ICON = '🤖';

interface MessageItem {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
}

const AIChatbotScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { addWord } = useWords(user);
  const { generateFlashcards, loading: aiLoading } = useAIChatbot();

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: '1',
      type: 'assistant',
      content:
        "Hello! I'm your AI vocabulary assistant. I can help you create personalized flashcards for language learning. What language are you studying, and what specific vocabulary would you like to work on today?",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Word suggestions from the latest assistant response
  const [suggestedWords, setSuggestedWords] = useState<Array<{ word: string; definition: string }> | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, suggestedWords]);

  const addMessage = (content: string, type: 'user' | 'assistant', isTyping: boolean = false) => {
    const newMsg: MessageItem = {
      id: Date.now().toString(),
      type,
      content,
      isTyping,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const simulateTyping = async (content: string) => {
    setIsTyping(true);
    // Add typing indicator
    addMessage('', 'assistant', true);

    // Simulate small delay
    await new Promise((res) => setTimeout(res, 800 + Math.random() * 700));

    // Remove typing indicator
    setMessages((prev) => prev.filter((m) => !m.isTyping));
    addMessage(content, 'assistant');
    setIsTyping(false);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || aiLoading || isTyping) return;

    const userText = inputValue.trim();
    setInputValue('');
    addMessage(userText, 'user');

    try {
      const convo = messages.map(({ type, content }) => ({ type, content }));
      const result = await generateFlashcards(userText, convo);

      if (result.success) {
        if (result.response) {
          await simulateTyping(result.response);
        }
        if (result.words && result.words.length) {
          setSuggestedWords(result.words);
        }
      } else {
        await simulateTyping(
          result.response ||
            "I apologize, but I'm having trouble generating flashcards right now. Please try again."
        );
      }
    } catch (err) {
      console.error(err);
      await simulateTyping(
        "I apologize, I'm having trouble right now. Could you try rephrasing your request?"
      );
    }
  };

  const handleAddWords = async () => {
    if (!suggestedWords || !user) return;
    setIsAdding(true);

    try {
      await Promise.all(
        suggestedWords.map((w) => addWord({ word: w.word, definition: w.definition || '' }))
      );

      Alert.alert('Success', `${suggestedWords.length} words added to your library.`);
      setSuggestedWords(null);
      await simulateTyping(
        `Great! I've added ${suggestedWords.length} words to your library. Would you like me to help with anything else?`
      );
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to add words');
    } finally {
      setIsAdding(false);
    }
  };

  const renderMessage = ({ item }: { item: MessageItem }) => {
    const isUser = item.type === 'user';
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.messageRight : styles.messageLeft,
        ]}
      >
        <Text style={styles.avatar}>{isUser ? USER_ICON : BOT_ICON}</Text>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          {item.isTyping ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text style={styles.messageText}>{item.content}</Text>
          )}
        </View>
      </View>
    );
  };

  const closeButton = (
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <Text style={{ fontSize: 24, color: '#FCA311' }}>✕</Text>
    </TouchableOpacity>
  );

  return (
    <Screen title="AI Assistant" rightElement={closeButton}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatArea}
        />

        {suggestedWords && (
          <View style={styles.suggestionsCard}>
            <Text style={styles.suggestionTitle}>Generated Words</Text>
            <FlatList
              data={suggestedWords}
              keyExtractor={(item, idx) => idx.toString()}
              renderItem={({ item }) => (
                <View style={styles.wordItem}>
                  <Text style={styles.wordText}>{item.word}</Text>
                  {item.definition ? (
                    <Text style={styles.definitionText}>{item.definition}</Text>
                  ) : null}
                </View>
              )}
              style={{ maxHeight: 200 }}
            />
            <TouchableOpacity
              style={[styles.addButton, isAdding && { opacity: 0.7 }]}
              onPress={handleAddWords}
              disabled={isAdding}
            >
              {isAdding ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.addButtonText}>Add to Library</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setSuggestedWords(null)}
            >
              <Text style={styles.secondaryButtonText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Tell me what vocabulary you'd like to learn..."
            editable={!aiLoading && !isTyping}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={!inputValue.trim() || aiLoading || isTyping}
          >
            {aiLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendText}>➤</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  chatArea: { padding: 16, paddingBottom: 100 },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  messageLeft: { justifyContent: 'flex-start' },
  messageRight: { justifyContent: 'flex-end' },
  avatar: { fontSize: 20, marginHorizontal: 6 },
  bubble: {
    maxWidth: '75%',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  bubbleUser: { backgroundColor: '#FCA311' },
  bubbleBot: { backgroundColor: '#E5E7EB' },
  messageText: { color: '#111827' },
  inputBar: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#14213D',
    padding: 12,
    borderRadius: 24,
  },
  sendText: { color: '#fff', fontSize: 16 },
  suggestionsCard: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  wordItem: {
    marginBottom: 6,
  },
  wordText: { fontWeight: '600' },
  definitionText: { color: '#374151' },
  addButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  addButtonText: { color: '#fff', fontWeight: '600' },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  secondaryButtonText: { color: '#111827' },
});

export default AIChatbotScreen; 