import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useWords } from '../hooks/useWords';
import { Screen } from '../components/Screen';

const WordListScreen: React.FC = () => {
  const { user } = useAuth();
  const { words, loading } = useWords(user);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (words.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No words yet. Add some!</Text>
      </View>
    );
  }

  return (
    <Screen title="Library">
      <FlatList
        data={words}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.wordItem}>
            <Text style={styles.wordText}>
              {item.article ? `${item.article} ` : ''}
              {item.word}
            </Text>
            <Text style={styles.definitionText}>{item.definition}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  emptyText: {
    color: '#6B7280',
  },
  wordItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
  },
  wordText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  definitionText: {
    color: '#374151',
  },
  separator: {
    height: 12,
  },
});

export default WordListScreen; 