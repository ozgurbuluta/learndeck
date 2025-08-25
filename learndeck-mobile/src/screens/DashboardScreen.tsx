import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';
import { useAuth } from '../hooks/useAuth';
import { useWords } from '../hooks/useWords';
import { useFolders } from '../hooks/useFolders';
import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';

export const DashboardScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { words, loading } = useWords(user?.id);
  const { folders } = useFolders(user?.id);
  const [recent, setRecent] = React.useState<Array<{ id: string; folder_id: string | null; folder_name?: string; study_type: string; last_used_at: string }>>([]);
  const [selectedFolderId, setSelectedFolderId] = React.useState<string | null>(null);
  const [folderWordIds, setFolderWordIds] = React.useState<Set<string>>(new Set());
  const [folderLoading, setFolderLoading] = React.useState(false);

  const handleStartStudy = (studyType: 'all' | 'due' | 'new' = 'due', folderId: string | null = null) => {
    navigation.navigate('StudySession', { studyType, folderId });
  };

  const handleAddWord = () => {
    navigation.navigate('Home', { 
      screen: 'Words',
      params: { openAddModal: true }
    });
  };

  React.useEffect(() => {
    const fetchRecent = async () => {
      if (!user) { setRecent([]); return; }
      const { data, error } = await supabase
        .from('recent_study_options')
        .select('id, folder_id, study_type, last_used_at, folders(name)')
        .eq('user_id', user.id)
        .order('last_used_at', { ascending: false })
        .limit(6);
      if (!error && data) {
        const rec = data.map((r: any) => ({
          id: r.id,
          folder_id: r.folder_id,
          study_type: r.study_type,
          last_used_at: r.last_used_at,
          folder_name: r.folders?.name || 'All Words',
        }));
        setRecent(rec);
      }
    };
    fetchRecent();
  }, [user?.id]);

  // Fetch word IDs for selected folder to compute counts
  React.useEffect(() => {
    const fetchFolderWordIds = async () => {
      if (!user || !selectedFolderId) { setFolderWordIds(new Set()); return; }
      setFolderLoading(true);
      const { data, error } = await supabase
        .from('word_folders')
        .select('word_id')
        .eq('folder_id', selectedFolderId);
      if (!error && data) {
        setFolderWordIds(new Set(data.map((x: any) => x.word_id)));
      } else {
        setFolderWordIds(new Set());
      }
      setFolderLoading(false);
    };
    fetchFolderWordIds();
  }, [user?.id, selectedFolderId]);

  // Calculate stats
  const overallWordsCount = words.length;
  const visibleWords = selectedFolderId ? words.filter(w => folderWordIds.has(w.id)) : words;
  const totalWords = visibleWords.length;
  const newWords = visibleWords.filter(word => word.difficulty === 'new').length;
  const dueWords = visibleWords.filter(word => 
    new Date(word.next_review) <= new Date() || 
    (word.difficulty === 'new' && !word.last_reviewed)
  ).length;
  const masteredWords = visibleWords.filter(word => word.difficulty === 'mastered').length;
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

      {/* Folder Selector (moved to top) */}
      {folders.length > 0 && overallWordsCount > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Folder</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            <TouchableOpacity
              onPress={() => setSelectedFolderId(null)}
              style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: selectedFolderId ? '#e1e1e1' : '#FF8C00', backgroundColor: selectedFolderId ? '#f8f9fa' : '#FF8C00' }}
            >
              <Text style={{ color: selectedFolderId ? '#333' : '#fff', fontSize: 12 }}>All Words</Text>
            </TouchableOpacity>
            {folders.map((f) => {
              const selected = selectedFolderId === f.id;
              return (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => setSelectedFolderId(f.id)}
                  style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: selected ? '#FF8C00' : '#e1e1e1', backgroundColor: selected ? '#FF8C00' : '#f8f9fa' }}
                >
                  <Text style={{ color: selected ? '#fff' : '#333', fontSize: 12 }}>{f.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Quick Study Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Study</Text>
        {overallWordsCount === 0 ? (
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
            onPress={() => handleStartStudy('due', selectedFolderId)}
          >
            <Text style={styles.primaryStudyButtonText}>Start Study Session</Text>
            <Text style={styles.primaryStudyButtonSubtext}>
              {dueWords} word{dueWords !== 1 ? 's' : ''} ready to review
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Study Options */}
      {overallWordsCount > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Study Options</Text>
          {/* Recent section intentionally omitted on mobile */}
          <View style={styles.studyGrid}>
            <TouchableOpacity
              style={styles.studyCard}
              onPress={() => handleStartStudy('new', selectedFolderId)}
            >
              <Text style={styles.studyCardNumber}>{newWords}</Text>
              <Text style={styles.studyCardLabel}>New Words</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.studyCard}
              onPress={() => handleStartStudy('due', selectedFolderId)}
            >
              <Text style={styles.studyCardNumber}>{dueWords}</Text>
              <Text style={styles.studyCardLabel}>Due for Review</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.studyCard}
              onPress={() => handleStartStudy('all', selectedFolderId)}
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
            onPress={() => navigation.navigate('Home', { screen: 'Words' })}
          >
            <Text style={styles.actionButtonText}>📚</Text>
            <Text style={styles.actionButtonLabel}>Browse Words</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Home', { screen: 'Profile' })}
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
    backgroundColor: '#FF8C00',
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
    backgroundColor: '#FF8C00',
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
    color: '#FF8C00',
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