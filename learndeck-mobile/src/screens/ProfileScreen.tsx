import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useWords } from '../hooks/useWords';

export const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const { words } = useWords(user?.id);

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.userInfo}>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.userIdText}>User ID: {user?.id}</Text>
        </View>

        <View style={styles.stats}>
          <Text style={styles.statsTitle}>Vocabulary Stats</Text>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Words</Text>
            <Text style={styles.statValue}>{totalWords}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>New Words</Text>
            <Text style={styles.statValue}>{newWords}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Learning</Text>
            <Text style={styles.statValue}>{learningWords}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Review</Text>
            <Text style={styles.statValue}>{reviewWords}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Mastered</Text>
            <Text style={styles.statValue}>{masteredWords}</Text>
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