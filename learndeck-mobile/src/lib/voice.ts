import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import Constants from 'expo-constants';
import { Settings } from './settings';

type TTSVoice = {
  id: string;
  label: string;
};

export type STTResult = {
  text: string;
  isFinal: boolean;
};

export type SentenceGenerationResult = {
  text: string;
  fromFallback: boolean;
};

export type ConverseResult = {
  text: string;
  highlightedWords: string[];
};

const OPENAI_TTS_VOICE_DEFAULT: TTSVoice = { id: 'alloy', label: 'Alloy' };
const CACHE_DIR = FileSystem.cacheDirectory + 'voice-cache/';

function getSupabaseAuthHeaders(): Record<string, string> {
  const extra = (Constants.expoConfig?.extra as any) || {};
  const apikey = extra.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apikey) {
    headers['Authorization'] = `Bearer ${apikey}`;
    headers['apikey'] = apikey;
  }
  return headers;
}

async function ensureCacheDir(): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
    }
  } catch {}
}

function hash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  }
  return String(h >>> 0);
}

export type TTSOptions = {
  text: string;
  voice?: TTSVoice;
  language?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  useOpenAI?: boolean;
};

export class VoiceService {
  private static playingSound: any = null;
  private static requestInFlight = 0;
  private static lastRequestAt = 0;
  private static minIntervalMs = 250; // simple client-side rate limiting

  static async speak(options: TTSOptions): Promise<void> {
    const now = Date.now();
    const since = now - VoiceService.lastRequestAt;
    if (since < VoiceService.minIntervalMs) {
      await new Promise((r) => setTimeout(r, VoiceService.minIntervalMs - since));
    }
    VoiceService.lastRequestAt = Date.now();

    const { text, useOpenAI = true, voice = OPENAI_TTS_VOICE_DEFAULT } = options;
    if (!text.trim()) return;
    await ensureCacheDir();

    // Try cache
    const cacheKey = hash(`${voice.id}|${text}`);
    const fileUri = `${CACHE_DIR}${cacheKey}.mp3`;
    const cacheInfo = await FileSystem.getInfoAsync(fileUri);
    const keepCache = await Settings.getVoiceCacheRetention();
    if (cacheInfo.exists) {
      await VoiceService.playFile(fileUri);
      return;
    }

    if (useOpenAI) {
      try {
        await VoiceService.fetchOpenAITTSAndPlay(text, voice, fileUri);
        return;
      } catch (e) {
        // Fall through to native
      }
    }

    // Native fallback (default language de-DE for now)
    await new Promise<void>((resolve) => {
      Speech.speak(text, {
        language: options.language || 'de-DE',
        pitch: options.pitch,
        rate: options.rate,
        volume: options.volume,
        onDone: () => resolve(),
        onStopped: () => resolve(),
        onError: () => resolve(),
      });
    });
  }

  private static async fetchOpenAITTSAndPlay(text: string, voice: TTSVoice, destFile: string) {
    const { supabaseUrl } = (Constants.expoConfig?.extra as any) || {};
    if (!supabaseUrl) throw new Error('Missing supabaseUrl for functions proxy');

    const url = `${supabaseUrl}/functions/v1/voice-tts`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getSupabaseAuthHeaders(),
      body: JSON.stringify({ text, voice: voice.id, language: 'de-DE' }),
    });
    if (!res.ok) throw new Error(`TTS failed: ${res.status}`);

    const json = await res.json();
    const base64 = json.base64 as string;
    if (await Settings.getVoiceCacheRetention()) {
      await FileSystem.writeAsStringAsync(destFile, base64, { encoding: FileSystem.EncodingType.Base64 });
    } else {
      const tmp = `${CACHE_DIR}tmp-${Date.now()}.mp3`;
      await FileSystem.writeAsStringAsync(tmp, base64, { encoding: FileSystem.EncodingType.Base64 });
      await VoiceService.playFile(tmp);
      try { await FileSystem.deleteAsync(tmp, { idempotent: true }); } catch {}
      return;
    }
    await VoiceService.playFile(destFile);
  }

  private static async playFile(uri: string): Promise<void> {
    if (VoiceService.playingSound) {
      try { await VoiceService.playingSound.unloadAsync(); } catch {}
      VoiceService.playingSound = null;
    }
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
    } catch {}
    const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
    VoiceService.playingSound = sound;
  }

  // Basic STT session using Supabase functions -> OpenAI Whisper; fallback to react-native-voice
  static async transcribeOnce(opts?: { locale?: string; fallbackNative?: boolean }): Promise<STTResult> {
    const { supabaseUrl } = (Constants.expoConfig?.extra as any) || {};
    try {
      const recording = new Audio.Recording();
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      await new Promise((r) => setTimeout(r, 3000)); // record 3s chunk
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) throw new Error('No recording');

      const url = `${supabaseUrl}/functions/v1/voice-stt`;
      const file = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const res = await fetch(url, {
        method: 'POST',
        headers: getSupabaseAuthHeaders(),
        body: JSON.stringify({ audioBase64: file, mimeType: 'audio/m4a', locale: opts?.locale }),
      });
      if (!res.ok) throw new Error(`STT failed: ${res.status}`);
      const json = await res.json();
      return { text: json.text || '', isFinal: true };
    } catch (e) {
      // Do not try to import native voice module in Expo Go; return empty result on error
      return { text: '', isFinal: true };
    }
  }

  // Native STT fallback intentionally disabled in Expo Go environment to avoid bundling errors

  static async generateSentence(word: string): Promise<SentenceGenerationResult> {
    const { supabaseUrl } = (Constants.expoConfig?.extra as any) || {};
    console.log(`--- ClientLog: VoiceService.generateSentence initiated for word: "${word}" ---`);
    if (!supabaseUrl) {
      console.error('ClientLog: VoiceService Error: Supabase URL is not configured.');
      return { text: `Das Wort ist "${word}".`, fromFallback: true };
    }

    try {
      const headers = getSupabaseAuthHeaders();
      const body = { mode: 'sentence', word, language: 'de-DE' };
      const url = `${supabaseUrl}/functions/v1/voice-talk`;

      console.log('ClientLog: Sending to voice-talk:', url);
      console.log('ClientLog: Request headers:', JSON.stringify(headers));
      console.log('ClientLog: Request body:', JSON.stringify(body));

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      console.log(`ClientLog: Received response from voice-talk with status: ${res.status}`);
      const responseText = await res.text();
      console.log('ClientLog: Raw response body:', responseText);

      if (!res.ok) {
        console.error('ClientLog: Server returned an error, triggering fallback.');
        throw new Error(`Server returned status ${res.status}`);
      }
      
      const json = JSON.parse(responseText);
      console.log('ClientLog: Successfully parsed response.');
      return { text: json.text || `Das Wort ist "${word}".`, fromFallback: false };
    } catch (e) {
      console.error('ClientLog: Error in generateSentence, triggering fallback:', e);
      return { text: `Das Wort ist "${word}".`, fromFallback: true };
    }
  }

  static async converse(scenario: string, userText: string, userWords: string[]): Promise<ConverseResult> {
    const { supabaseUrl } = (Constants.expoConfig?.extra as any) || {};
    if (!supabaseUrl) {
      console.error('ClientLog: VoiceService.converse Error: Supabase URL is not configured.');
      throw new Error('Missing supabaseUrl');
    }

    console.log(`--- ClientLog: VoiceService.converse initiated for scenario: "${scenario}" ---`);
    const headers = getSupabaseAuthHeaders();
    const body = {
      mode: 'dialogue',
      scenario,
      message: userText || '',
      userWords: userWords.slice(0, 50),
      language: 'de-DE',
    };
    const url = `${supabaseUrl}/functions/v1/voice-talk`;

    console.log('ClientLog: Sending to voice-talk:', url);
    console.log('ClientLog: Request headers:', JSON.stringify(headers));
    console.log('ClientLog: Request body:', JSON.stringify(body));

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    console.log(`ClientLog: Received response from voice-talk with status: ${res.status}`);
    const responseText = await res.text();
    console.log('ClientLog: Raw response body:', responseText);

    if (!res.ok) throw new Error(`Server returned status ${res.status}`);
    const json = JSON.parse(responseText);
    console.log('ClientLog: Successfully parsed converse response.');
    return {
      text: json.text || 'Entschuldigung, ich habe ein Problem.',
      highlightedWords: json.highlightedWords || [],
    };
  }

  // base64 helper no longer needed (server returns base64)
}

export const defaultTTSVoices: TTSVoice[] = [
  { id: 'alloy', label: 'Alloy' },
  { id: 'verse', label: 'Verse' },
  { id: 'aria', label: 'Aria' },
];


