import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  ActivityIndicator,
  Modal,
  StatusBar,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useWords } from '../hooks/useWords';
import { useAchievements, achievementDetails } from '../hooks/useAchievements';
import { Screen } from '../components/Screen';

const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile(user);
  const { words } = useWords(user);
  const { achievements, loading: achievementsLoading } = useAchievements();
  
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);

  const [username, setUsername] = useState('');
  const [learningGoal, setLearningGoal] = useState(5);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setLearningGoal(profile.learning_goal || 5);
      setNotifications(profile.notifications_enabled ?? true);
    }
  }, [profile]);

  const handleUsernameSave = async () => {
    await updateProfile({ username });
    setIsEditingUsername(false);
  };

  const handleNotificationsChange = (value: boolean) => {
    setNotifications(value);
    updateProfile({ notifications_enabled: value });
  };

  const handleGoalSave = () => {
    updateProfile({ learning_goal: learningGoal });
    setIsGoalModalVisible(false);
  };

  const stats = useMemo(() => {
    const totalWords = words.length;
    const masteredWords = words.filter((w) => w.difficulty === 'mastered').length;
    const masteryRate = totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0;
    const studyStreak = profile?.study_streak || 0;
    const studyTime = profile?.total_study_time || 0;
    return { totalWords, masteredWords, masteryRate, studyStreak, studyTime };
  }, [words, profile]);

  if (profileLoading || achievementsLoading) {
    return <ActivityIndicator style={styles.center} size="large" color="#14213D" />;
  }

  return (
    <Screen title="Profile">
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.email?.[0]?.toUpperCase() ?? 'U'}</Text>
          </View>
          {isEditingUsername ? (
            <TextInput
              style={styles.usernameInput}
              value={username}
              onChangeText={setUsername}
              autoFocus
            />
          ) : (
            <Text style={styles.username}>{username || 'New User'}</Text>
          )}
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Learning Stats</Text>
          <View style={styles.statsRow}>
            <StatItem value={stats.totalWords} label="Total Words" />
            <StatItem value={stats.masteredWords} label="Mastered" />
            <StatItem value={`${stats.masteryRate}%`} label="Mastery" />
          </View>
          <View style={[styles.statsRow, { marginTop: 16 }]}>
            <StatItem value={`${stats.studyStreak}d`} label="Streak" />
            <StatItem value={`${stats.studyTime}m`} label="Time" />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            {Object.entries(achievementDetails).map(([key, details]) => {
              const earned = achievements.some(a => a.achievement_type === key);
              return (
                <AchievementItem
                  key={key}
                  title={details.title}
                  earned={earned}
                />
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Settings</Text>
          <TouchableOpacity onPress={() => setIsGoalModalVisible(true)}>
            <SettingsItem label="Daily Learning Goal">
              <Text style={styles.settingsValue}>{learningGoal} words</Text>
            </SettingsItem>
          </TouchableOpacity>
          <SettingsItem label="Enable Notifications" last>
            <Switch
              value={notifications}
              onValueChange={handleNotificationsChange}
              trackColor={{ false: '#E5E7EB', true: '#FCA311' }}
              thumbColor={'#FFFFFF'}
            />
          </SettingsItem>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
};

const AchievementItem = ({ title, earned }: { title: string, earned: boolean }) => (
  <View style={styles.achievementItem}>
    <View style={[styles.achievementIcon, !earned && styles.achievementIconDisabled]}>
      <Text style={styles.achievementIconText}>{earned ? '🏆' : '🔒'}</Text>
    </View>
    <Text style={[styles.achievementTitle, !earned && styles.achievementTitleDisabled]}>{title}</Text>
  </View>
);

const StatItem = ({ value, label }: { value: string | number; label: string }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const SettingsItem = ({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) => (
  <View style={[styles.settingsItem, last && styles.settingsItemLast]}>
    <Text style={styles.settingsLabel}>{label}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  scrollContainer: {
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FCA311',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  email: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 24,
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
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingsItemLast: {
    borderBottomWidth: 0,
  },
  settingsLabel: {
    fontSize: 16,
    color: '#374151',
  },
  settingsValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  signOutButton: {
    backgroundColor: '#FEF2F2',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 16,
  },
  usernameInput: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    borderBottomWidth: 1,
    borderColor: '#D1D5DB',
    textAlign: 'center',
    padding: 4,
    minWidth: 150,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  goalInput: {
    fontSize: 24,
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderColor: '#FCA311',
    padding: 8,
    textAlign: 'center',
    marginBottom: 24,
    minWidth: 100,
  },
  modalButton: {
    backgroundColor: '#14213D',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementItem: {
    alignItems: 'center',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementIconText: {
    fontSize: 24,
  },
  achievementIconDisabled: {
    backgroundColor: '#F3F4F6',
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
  },
  achievementTitleDisabled: {
    color: '#9CA3AF',
  },
});

export default ProfileScreen; 