import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { useStudySession } from '../hooks/useStudySession';

interface RouteParams {
  studyType?: 'all' | 'due' | 'new';
  folderId?: string | null;
}

export const StudySessionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { studyType = 'due', folderId = null } = (route.params as RouteParams) || {};
  const { user, loading: authLoading } = useAuth();
  const {
    currentWord,
    isFlipped,
    sessionStats,
    loading,
    isLastWord,
    progress,
    startStudySession,
    submitAnswer,
    flipCard,
    resetSession,
    completeSession,
  } = useStudySession(user?.id, folderId ?? null);

  useEffect(() => {
    if (user?.id) {
      initializeSession();
    }
  }, [user?.id]);

  const initializeSession = async () => {
    const result = await startStudySession(studyType);
    if (!result.success) {
      Alert.alert(
        'No Words to Study',
        result.message || 'No words available for study',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  const handleFlip = () => {
    flipCard();
  };

  const handleAnswer = async (correct: boolean) => {
    await submitAnswer(correct);
    
    if (isLastWord) {
      await completeSession();
      Alert.alert(
        'Study Session Complete!',
        `Great job! You got ${sessionStats.correct + (correct ? 1 : 0)} out of ${sessionStats.total} correct.`,
        [
          { text: 'Study Again', onPress: initializeSession },
          { text: 'Finish', onPress: () => navigation.goBack() },
        ]
      );
    }
  };

  const handleExit = () => {
    Alert.alert(
      'Exit Study Session',
      'Are you sure you want to exit? Your progress will be saved.',
      [
        { text: 'Continue Studying', style: 'cancel' },
        { text: 'Exit', onPress: async () => { await completeSession(); navigation.goBack(); } },
      ]
    );
  };

  if (authLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8C00" />
        <Text style={styles.loadingText}>
          {authLoading ? 'Loading...' : 'Starting study session...'}
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>Authentication required</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentWord) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>No words to study</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
          <Text style={styles.exitText}>Exit</Text>
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {sessionStats.correct + sessionStats.incorrect + 1} / {sessionStats.total}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>
        
        <View style={styles.stats}>
          <Text style={styles.statsText}>✓ {sessionStats.correct}</Text>
          <Text style={styles.statsText}>✗ {sessionStats.incorrect}</Text>
        </View>
      </View>

      {/* Flashcard */}
      <View style={styles.cardContainer}>
        <TouchableOpacity onPress={handleFlip} style={styles.cardTouchable}>
          <View style={styles.card}>
            {!isFlipped ? (
              // Front - Word
              <View style={styles.cardFace}>
                <Text style={styles.cardWord}>{currentWord.word}</Text>
                <Text style={styles.tapHint}>Tap to reveal definition</Text>
              </View>
            ) : (
              // Back - Definition
              <View style={styles.cardFace}>
                <Text style={styles.cardDefinition}>{currentWord.definition}</Text>
                <Text style={styles.tapHint}>Tap to see word again</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Action Buttons - Always visible */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.keepLearningButton]}
          onPress={() => handleAnswer(false)}
        >
          <Text style={styles.actionButtonText}>Keep learning!</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.knowItButton]}
          onPress={() => handleAnswer(true)}
        >
          <Text style={styles.actionButtonText}>I know it!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  exitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  exitText: {
    color: '#FF8C00',
    fontSize: 16,
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e1e1e1',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF8C00',
    borderRadius: 2,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cardTouchable: {
    width: '100%',
    maxWidth: 350,
    aspectRatio: 1.2,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardFace: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  cardWord: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 32,
  },
  cardDefinition: {
    fontSize: 22,
    color: '#000',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 32,
  },
  tapHint: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  keepLearningButton: {
    backgroundColor: '#DC3545',
  },
  knowItButton: {
    backgroundColor: '#34C759',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#FF8C00',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});