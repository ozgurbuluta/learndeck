import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Folder as FolderType, StudyConfig } from '@shared/types';

interface StudyOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  folders: FolderType[];
  onStartStudy: (config: StudyConfig) => void;
}

const studyOptions: { title: string; type: StudyConfig['studyType']; color: string }[] = [
  { title: 'All Words', type: 'all', color: '#3B82F6' },
  { title: 'Due for Review', type: 'review', color: '#F59E0B' },
  { title: 'New Words', type: 'new', color: '#10B981' },
  { title: 'Mastered', type: 'mastered', color: '#8B5CF6' },
];

export const StudyOptionsModal: React.FC<StudyOptionsModalProps> = ({
  visible,
  onClose,
  folders,
  onStartStudy,
}) => {
  const handleSelect = (
    studyType: StudyConfig['studyType'],
    folderId: string | null = null,
    folderName: string = 'All Words'
  ) => {
    onStartStudy({
      studyType,
      folderId,
      folderName,
      wordCount: 0,
    });
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Choose a Study Mode</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>Done</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.grid}>
            {studyOptions.map((opt) => (
              <TouchableOpacity
                key={opt.type}
                style={[styles.card, { backgroundColor: opt.color }]}
                onPress={() => handleSelect(opt.type, null, opt.title)}
              >
                <Text style={styles.cardText}>{opt.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {folders.filter(f => f.word_count && f.word_count > 0).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Folders</Text>
              {folders.filter(f => f.word_count && f.word_count > 0).map((folder) => (
                <TouchableOpacity
                  key={folder.id}
                  style={styles.folderButton}
                  onPress={() => handleSelect('all' as StudyConfig['studyType'], folder.id, folder.name)}
                >
                  <View style={[styles.folderColor, { backgroundColor: folder.color || '#6B7280' }]} />
                  <Text style={styles.folderText}>{folder.name}</Text>
                  <Text style={styles.folderCount}>{folder.word_count}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: 50,
  },
  scrollContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    fontSize: 16,
    color: '#FCA311',
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    height: 120,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'flex-end',
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  folderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  folderColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  folderText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#111827',
  },
  folderCount: {
    marginLeft: 'auto',
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
}); 