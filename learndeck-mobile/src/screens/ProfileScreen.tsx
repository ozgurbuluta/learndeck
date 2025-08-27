import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';
import { useAuth } from '../hooks/useAuth';
import { useWords } from '../hooks/useWords';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, signOut } = useAuth();
  const { words } = useWords(user?.id);
  const insets = useSafeAreaInsets();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  const totalWords = words.length;
  const newWords = words.filter(word => word.difficulty === 'new').length;
  const learningWords = words.filter(word => word.difficulty === 'learning').length;
  const reviewWords = words.filter(word => word.difficulty === 'review').length;
  const masteredWords = words.filter(word => word.difficulty === 'mastered').length;
  const dueWords = words.filter(word => new Date(word.next_review) <= new Date()).length;
  
  // Calculate study progress
  const totalReviews = words.reduce((sum, word) => sum + word.review_count, 0);
  const correctAnswers = words.reduce((sum, word) => sum + word.correct_count, 0);
  const accuracy = totalReviews > 0 ? Math.round((correctAnswers / totalReviews) * 100) : 0;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(12, insets.top + 12) }]}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.navigate('ProfileEdit')}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.userInfo}>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.displayName}>
            {user?.user_metadata?.display_name || 'No display name set'}
          </Text>
        </View>

        <View style={styles.stats}>
          <Text style={styles.statsTitle}>Vocabulary Stats</Text>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Words</Text>
            <Text style={styles.statValue}>{totalWords}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Due for Review</Text>
            <Text style={[styles.statValue, dueWords > 0 && styles.dueStatValue]}>{dueWords}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Mastered</Text>
            <Text style={styles.statValue}>{masteredWords}</Text>
          </View>
        </View>

        <View style={styles.stats}>
          <Text style={styles.statsTitle}>Study Progress</Text>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Reviews</Text>
            <Text style={styles.statValue}>{totalReviews}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Accuracy</Text>
            <Text style={styles.statValue}>{accuracy}%</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Learning</Text>
            <Text style={styles.statValue}>{learningWords}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>In Review</Text>
            <Text style={styles.statValue}>{reviewWords}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>New Words</Text>
            <Text style={styles.statValue}>{newWords}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    backgroundColor: '#FF8C00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  userInfo: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  displayName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  userIdText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  stats: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dueStatValue: {
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 'auto',
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});