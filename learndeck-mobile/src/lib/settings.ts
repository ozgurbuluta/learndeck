import * as SecureStore from 'expo-secure-store';

const KEY_ANALYTICS = 'settings.analyticsEnabled';
const KEY_VOICE_CACHE = 'settings.voiceCacheRetention';

export const Settings = {
  async getAnalyticsEnabled(): Promise<boolean> {
    const v = await SecureStore.getItemAsync(KEY_ANALYTICS);
    return v === null ? true : v === '1';
  },
  async setAnalyticsEnabled(val: boolean): Promise<void> {
    await SecureStore.setItemAsync(KEY_ANALYTICS, val ? '1' : '0');
  },
  async getVoiceCacheRetention(): Promise<boolean> {
    const v = await SecureStore.getItemAsync(KEY_VOICE_CACHE);
    return v === '1';
  },
  async setVoiceCacheRetention(val: boolean): Promise<void> {
    await SecureStore.setItemAsync(KEY_VOICE_CACHE, val ? '1' : '0');
  },
};


