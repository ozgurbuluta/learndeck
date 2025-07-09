import React from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView } from 'react-native';

interface ScreenProps {
  title: string;
  children: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Screen: React.FC<ScreenProps> = ({ title, children, rightElement }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>{title}</Text>
        {rightElement}
      </View>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
}); 