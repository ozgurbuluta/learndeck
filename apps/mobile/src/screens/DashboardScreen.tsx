import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { useAuth } from '../hooks/useAuth';
import { useWords } from '../hooks/useWords';
import { useFolders } from '../hooks/useFolders';
import { useStudyOptions } from '../hooks/useStudyOptions';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import ScreenContainer from '../components/ScreenContainer';
import { StudyOptionsModal } from '../components/StudyOptionsModal';
import { StudyConfig } from '../types';
import { Screen } from '../components/Screen';

const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const { words, loading: wordsLoading, refetch: refetchWords } = useWords(user);
  const { folders, loading: foldersLoading } = useFolders(user);
  const { lastConfig, saveStudyConfig } = useStudyOptions();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  // Refresh words when the dashboard regains focus (e.g., after adding words)
  useEffect(() => {
    if (isFocused) {
      refetchWords();
    }
  }, [isFocused]);

  const [modalVisible, setModalVisible] = useState(false);

  const stats = useMemo(() => {
    const total = words.length;
    const mastered = words.filter((w) => w.difficulty === 'mastered').length;
    const due = words.filter(
      (w) => new Date(w.next_review) <= new Date() || w.last_reviewed === null
    ).length;
    return { total, mastered, due };
  }, [words]);

  const handleStartStudy = (config: StudyConfig) => {
    saveStudyConfig(config);
    setModalVisible(false);
    navigation.navigate('StudySession', { studyConfig: config });
  };

  const handleQuickStudy = () => {
    const config = lastConfig ?? {
      studyType: 'review',
      folderId: null,
      folderName: 'Due for Review',
      wordCount: 0,
    };
    handleStartStudy(config);
  };

  const loading = wordsLoading || foldersLoading;

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const StatCard = ({ title, value, subtext, icon }: any) => (
    <View style={styles.statCard}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {icon}
        <Text style={styles.statCardTitle}>{title}</Text>
      </View>
      <Text style={styles.statCardValue}>{value}</Text>
      <Text style={styles.statCardSubtext}>{subtext}</Text>
    </View>
  );

  const ActionButton = ({ title, icon, screen }: any) => (
    <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate(screen)}>
      {icon}
      <Text style={styles.actionButtonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <Screen title="Dashboard">
      <StudyOptionsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        folders={folders}
        onStartStudy={handleStartStudy}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ready to Study?</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleQuickStudy}>
            <Text style={styles.primaryButtonText}>
              Quick Study {lastConfig ? `(${lastConfig.folderName})` : '(Due Words)'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryButton, { marginTop: 12 }]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.secondaryButtonText}>More Study Options</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Progress</Text>
          <View style={styles.statsRow}>
            <StatCard
              title="Total Words"
              value={stats.total}
              subtext="in your library"
              icon={<BookOpen color="#14213D" size={20} />}
            />
            <StatCard
              title="Words to Review"
              value={stats.due}
              subtext="items due"
              icon={<Text style={{ fontSize: 20, color: "#FCA311" }}>⏰</Text>}
            />
            <StatCard
              title="Words Mastered"
              value={stats.mastered}
              subtext="of your vocabulary"
              icon={<Text style={{ fontSize: 20, color: "#16A34A" }}>🏆</Text>}
            />
          </View>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Library</Text>
          <ActionButton
            title="View Word List"
            screen="WordList"
            icon={<Text style={{ fontSize: 24, color: "#3B82F6" }}>📋</Text>}
          />
          <ActionButton
            title="Add a New Word"
            screen="AddWord"
            icon={<Text style={{ fontSize: 24, color: "#16A34A" }}>➕</Text>}
          />
          <ActionButton
            title="AI Assistant"
            screen="AIChatbot"
            icon={<Text style={{ fontSize: 24, color: "#FCA311" }}>🤖</Text>}
          />
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F3F4F6',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '32%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  statCardTitle: {
    fontSize: 12,
    color: '#374151',
    marginLeft: 8,
    flexShrink: 1,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
  },
  statCardSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: '#14213D',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 16,
  },
  secondaryButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1F2937',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DashboardScreen; 