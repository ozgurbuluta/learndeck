import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { useWords } from '../hooks/useWords';

export const DashboardScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { words, loading } = useWords(user?.id);

  const handleStartStudy = (studyType: 'all' | 'due' | 'new' = 'due') => {
    navigation.navigate('StudySession' as never, { studyType } as never);
  };

  const handleAddWord = () => {
    navigation.navigate('Home' as never, { 
      screen: 'Words',
      params: { openAddModal: true }
    } as never);
  };

  // Calculate stats
  const totalWords = words.length;
  const newWords = words.filter(word => word.difficulty === 'new').length;
  const dueWords = words.filter(word => 
    new Date(word.next_review) <= new Date() || 
    (word.difficulty === 'new' && !word.last_reviewed)
  ).length;
  const masteredWords = words.filter(word => word.difficulty === 'mastered').length;
  const studyStreak = 0; // TODO: implement streak calculation

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello! 👋</Text>
        <Text style={styles.subtitle}>Ready to learn some vocabulary?</Text>
      </View>

      {/* Quick Study Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Study</Text>
        {totalWords === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No words yet</Text>
            <Text style={styles.emptySubtitle}>Add your first word to start learning</Text>
            <TouchableOpacity style={styles.addWordButton} onPress={handleAddWord}>
              <Text style={styles.addWordButtonText}>Add Your First Word</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.primaryStudyButton}
            onPress={() => handleStartStudy('due')}
          >
            <Text style={styles.primaryStudyButtonText}>Start Study Session</Text>
            <Text style={styles.primaryStudyButtonSubtext}>
              {dueWords} word{dueWords !== 1 ? 's' : ''} ready to review
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Study Options */}
      {totalWords > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Study Options</Text>
          <View style={styles.studyGrid}>
            <TouchableOpacity
              style={styles.studyCard}
              onPress={() => handleStartStudy('new')}
            >
              <Text style={styles.studyCardNumber}>{newWords}</Text>
              <Text style={styles.studyCardLabel}>New Words</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.studyCard}
              onPress={() => handleStartStudy('due')}
            >
              <Text style={styles.studyCardNumber}>{dueWords}</Text>
              <Text style={styles.studyCardLabel}>Due for Review</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.studyCard}
              onPress={() => handleStartStudy('all')}
            >
              <Text style={styles.studyCardNumber}>{totalWords}</Text>
              <Text style={styles.studyCardLabel}>All Words</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.studyCard}>
              <Text style={styles.studyCardNumber}>{masteredWords}</Text>
              <Text style={styles.studyCardLabel}>Mastered</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Progress Overview */}
      {totalWords > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressItem}>
              <Text style={styles.progressNumber}>{totalWords}</Text>
              <Text style={styles.progressLabel}>Total Words</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressNumber}>{studyStreak}</Text>
              <Text style={styles.progressLabel}>Day Streak</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressNumber}>
                {totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0}%
              </Text>
              <Text style={styles.progressLabel}>Mastered</Text>
            </View>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleAddWord}
          >
            <Text style={styles.actionButtonText}>➕</Text>
            <Text style={styles.actionButtonLabel}>Add Word</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Home' as never, { screen: 'Words' } as never)}
          >
            <Text style={styles.actionButtonText}>📚</Text>
            <Text style={styles.actionButtonLabel}>Browse Words</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Home' as never, { screen: 'Profile' } as never)}
          >
            <Text style={styles.actionButtonText}>👤</Text>
            <Text style={styles.actionButtonLabel}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  addWordButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addWordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryStudyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  primaryStudyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  primaryStudyButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  studyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  studyCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  studyCardNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  studyCardLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  progressCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
  },
  progressItem: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  actionButtonText: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionButtonLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
});