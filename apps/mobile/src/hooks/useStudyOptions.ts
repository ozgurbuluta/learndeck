import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StudyConfig } from '../types';

const STUDY_CONFIG_KEY = 'study_config';

export const useStudyOptions = () => {
  const [lastConfig, setLastConfig] = useState<StudyConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const getStudyConfig = useCallback(async () => {
    setLoading(true);
    try {
      const jsonValue = await AsyncStorage.getItem(STUDY_CONFIG_KEY);
      const savedConfig = jsonValue != null ? JSON.parse(jsonValue) : null;
      setLastConfig(savedConfig);
    } catch (e) {
      console.error('Failed to load study config.', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveStudyConfig = async (config: StudyConfig) => {
    try {
      const jsonValue = JSON.stringify(config);
      await AsyncStorage.setItem(STUDY_CONFIG_KEY, jsonValue);
      setLastConfig(config);
    } catch (e) {
      console.error('Failed to save study config.', e);
    }
  };

  useEffect(() => {
    getStudyConfig();
  }, [getStudyConfig]);

  return { lastConfig, loading, saveStudyConfig, refetch: getStudyConfig };
}; 