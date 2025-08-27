import type { ExpoConfig } from 'expo/config';
import fs from 'fs';
import path from 'path';

// Best-effort load of local env during dev; works even if dotfiles are avoided
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const dotenv = require('dotenv');
  const cwd = __dirname;
  const candidates = [
    path.join(cwd, 'env.local'), // preferred local file (committed optional)
    path.join(cwd, '.env'), // standard
    path.join(cwd, '..', '.env'), // repo root fallback
  ];
  const found = candidates.find((p) => {
    try { return fs.existsSync(p); } catch { return false; }
  });
  if (found) {
    dotenv.config({ path: found });
  } else {
    dotenv.config();
  }
} catch (_) {
  // dotenv not installed; Expo CLI may still load EXPO_PUBLIC_* vars automatically
}

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const config: ExpoConfig = {
  name: 'LearnDeck',
  slug: 'learndeck',
  version: '1.1.3',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'online.learndeck',
    buildNumber: '5',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'online.learndeck',
    versionCode: 5,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  extra: {
    eas: {
      projectId: '1974c6f8-e38c-40af-8a29-dc95e4ec0bb6',
    },
    // Supabase config sourced from env/Secrets; no hardcoded values
    supabaseUrl: SUPABASE_URL,
    supabaseAnonKey: SUPABASE_ANON_KEY,
  },
  owner: 'ozgurbulut',
  plugins: ['expo-secure-store'],
};

export default config;


