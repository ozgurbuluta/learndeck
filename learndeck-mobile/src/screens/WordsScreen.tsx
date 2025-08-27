import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NavigationProp, RouteProp } from '@react-navigation/native';
import type { RootStackParamList, TabParamList } from '../types/navigation';
import { useAuth } from '../hooks/useAuth';
import { useWords } from '../hooks/useWords';
// Removed custom import feature for mobile
import { useFolders } from '../hooks/useFolders';
import { Word } from '../types/database';

export const WordsScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<TabParamList, 'Words'>>();
  const { user } = useAuth();
  const { words, loading, addWord, deleteWord, refetch } = useWords(user?.id);
  const { folders } = useFolders(user?.id);
  // Custom import removed
  
  const [showAddModal, setShowAddModal] = useState(false);
  // Custom import removed
  const [newWord, setNewWord] = useState('');
  const [newDefinition, setNewDefinition] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom import states
  // Custom import removed
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);

  // Handle navigation params
  useEffect(() => {
    if (route.params?.openAddModal) {
      setShowAddModal(true);
    }
  }, [route.params]);

  const handleAddWord = async () => {
    if (!newWord.trim() || !newDefinition.trim()) {
      Alert.alert('Error', 'Please fill in both word and definition');
      return;
    }

    setIsAdding(true);
    const { error } = await addWord(newWord, newDefinition, selectedFolderIds);
    setIsAdding(false);

    if (error) {
      Alert.alert('Error', error);
    } else {
      setNewWord('');
      setNewDefinition('');
      setShowAddModal(false);
      setSelectedFolderIds([]);
    }
  };

  const handleDeleteWord = (word: Word) => {
    Alert.alert(
      'Delete Word',
      `Are you sure you want to delete "${word.word}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteWord(word.id),
        },
      ]
    );
  };

  // Custom import removed

  // Custom import removed

  // Custom import removed

  // Custom import removed

  const renderWord = ({ item }: { item: Word }) => (
    <View style={styles.wordItem}>
      <View style={styles.wordContent}>
        <Text style={styles.wordText}>{item.word}</Text>
        <Text style={styles.definitionText}>{item.definition}</Text>
        <Text style={styles.difficultyText}>
          Difficulty: {item.difficulty} • Reviews: {item.review_count}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteWord(item)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const handleStartStudy = (studyType: 'all' | 'due' | 'new' = 'due') => {
    if (words.length === 0) {
      Alert.alert('No Words', 'Add some words first to start studying!');
      return;
    }
    
    navigation.navigate('StudySession', { studyType });
  };

  const dueWordsCount = words.filter(word => 
    new Date(word.next_review) <= new Date()
  ).length;

  const newWordsCount = words.filter(word => word.difficulty === 'new').length;

  // Filter words based on search query
  const filteredWords = words.filter(word => 
    word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    word.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addButtonText}>Add Word</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      {words.length > 0 && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search words..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      )}

      {words.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No words yet</Text>
          <Text style={styles.emptySubtitle}>
            Add your first word to start building your vocabulary
          </Text>
        </View>
      ) : (
        <>
          {/* Study Options */}
          <View style={styles.studySection}>
            <Text style={styles.studySectionTitle}>Study</Text>
            <View style={styles.studyOptions}>
              <TouchableOpacity
                style={[styles.studyCard, styles.primaryStudyCard]}
                onPress={() => handleStartStudy('due')}
              >
                <Text style={[styles.studyCardNumber, styles.primaryStudyCardText]}>{dueWordsCount}</Text>
                <Text style={[styles.studyCardLabel, styles.primaryStudyCardText]}>Due for Review</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.studyCard}
                onPress={() => handleStartStudy('new')}
              >
                <Text style={styles.studyCardNumber}>{newWordsCount}</Text>
                <Text style={styles.studyCardLabel}>New Words</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.studyCard}
                onPress={() => handleStartStudy('all')}
              >
                <Text style={styles.studyCardNumber}>{words.length}</Text>
                <Text style={styles.studyCardLabel}>All Words</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Words List */}
          <FlatList
            data={filteredWords}
            keyExtractor={(item) => item.id}
            renderItem={renderWord}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              searchQuery ? (
                <View style={styles.emptySearchState}>
                  <Text style={styles.emptyTitle}>No words found</Text>
                  <Text style={styles.emptySubtitle}>
                    Try searching for a different word or definition
                  </Text>
                </View>
              ) : null
            }
          />
        </>
      )}

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add New Word</Text>
            <TouchableOpacity onPress={handleAddWord} disabled={isAdding}>
              {isAdding ? (
                <ActivityIndicator size="small" color="#FF8C00" />
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Word"
              value={newWord}
              onChangeText={setNewWord}
              autoCapitalize="words"
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Definition"
              value={newDefinition}
              onChangeText={setNewDefinition}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {folders.length > 0 && (
              <View>
                <Text style={styles.inputLabel}>Add to Folders (optional)</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {folders.map((f) => {
                    const selected = selectedFolderIds.includes(f.id);
                    return (
                      <TouchableOpacity
                        key={f.id}
                        onPress={() => setSelectedFolderIds(prev => selected ? prev.filter(id => id !== f.id) : [...prev, f.id])}
                        style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: selected ? '#FF8C00' : '#e1e1e1', backgroundColor: selected ? '#FF8C00' : '#f8f9fa', marginTop: 8 }}
                      >
                        <Text style={{ color: selected ? '#fff' : '#333', fontSize: 12 }}>{f.name}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Custom Import removed */}

      {/* Preview removed */}
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
  addButton: {
    backgroundColor: '#FF8C00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  emptySearchState: {
    alignItems: 'center',
    padding: 40,
  },
  studySection: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  studySectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  studyOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  studyCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  primaryStudyCard: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
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
  primaryStudyCardText: {
    color: '#fff',
  },
  listContainer: {
    padding: 20,
  },
  wordItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  wordContent: {
    flex: 1,
  },
  wordText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  definitionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  difficultyText: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 12,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 16,
  },
  saveText: {
    color: '#FF8C00',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    padding: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  customImportButton: {
    backgroundColor: '#34C759',
  },
  documentInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  documentInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  documentName: {
    fontSize: 16,
    color: '#007AFF',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputHint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  disabledText: {
    color: '#999',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  previewWordItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  previewWordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewWordText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  previewDefinitionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyPreview: {
    alignItems: 'center',
    padding: 40,
  },
});