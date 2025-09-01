import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VoiceService } from '../lib/voice';
import { useWords } from '../hooks/useWords';
import { useAuth } from '../hooks/useAuth';

export const PracticeScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { words } = useWords(user?.id);
  const [mode, setMode] = useState<'sentence' | 'conversation' | null>(null);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [currentSentence, setCurrentSentence] = useState('');
  
  // Conversation mode states
  const [scenario, setScenario] = useState<string | null>(null);
  const [assistantText, setAssistantText] = useState('');
  const [highlighted, setHighlighted] = useState<string[]>([]);

  const generate = async () => {
    try {
      setLoading(true);
      const word = words[Math.floor(Math.random() * Math.max(1, words.length))]?.word || 'hello';
      const result = await VoiceService.generateSentence(word);
      setCurrentSentence(result.text);
      await VoiceService.speak({ text: result.text, language: 'de-DE' });
      if (result.fromFallback) {
        Alert.alert('Offline sentence', 'Using a local sentence because the server was unavailable.');
      }
    } catch (error) {
      const fallback = `Das Wort ist "Fehler".`;
      setCurrentSentence(fallback);
      await VoiceService.speak({ text: fallback, language: 'de-DE' });
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const speakBack = async () => {
    setRecording(true);
    const r = await VoiceService.transcribeOnce({ locale: 'de-DE' });
    setRecording(false);
    if (!r.text) {
      Alert.alert("Didn't catch that", "Could you please try speaking again?");
    }
  };

  const startScenario = async (s: string) => {
    setScenario(s);
    await converse(); // Start with an initial greeting from the assistant
  };

  const converse = async (userText?: string) => {
    try {
      setLoading(true);
      const result = await VoiceService.converse(scenario!, userText || '', words.map(w => w.word));
      setAssistantText(result.text);
      setHighlighted(result.highlightedWords);
      await VoiceService.speak({ text: result.text, language: 'de-DE' });
    } catch (e) {
      setAssistantText('Sorry, I ran into an error. Please try again.');
      await VoiceService.speak({ text: 'Sorry, I ran into an error. Please try again.', language: 'en-US' });
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    setRecording(true);
    const result = await VoiceService.transcribeOnce({ locale: 'de-DE' });
    setRecording(false);
    await converse(result.text);
  };

  // Mode selection screen
  if (!mode) {
    return (
      <View style={[styles.container, { paddingTop: Math.max(12, insets.top + 12) }]}>
        <Text style={styles.title}>Voice Practice</Text>
        <Text style={styles.subtitle}>Choose your practice mode</Text>
        <View style={styles.modeRow}>
          <TouchableOpacity style={styles.modeCard} onPress={() => setMode('sentence')}>
            <Ionicons name="book" size={32} color="#FF8C00" />
            <Text style={styles.modeTitle}>Sentence Practice</Text>
            <Text style={styles.modeDesc}>Generate sentences using your vocabulary words</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modeCard} onPress={() => setMode('conversation')}>
            <Ionicons name="chatbubbles" size={32} color="#FF8C00" />
            <Text style={styles.modeTitle}>Conversation</Text>
            <Text style={styles.modeDesc}>Practice real conversations in different scenarios</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Sentence practice mode
  if (mode === 'sentence') {
    return (
      <View style={[styles.container, { paddingTop: Math.max(12, insets.top + 12) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => setMode(null)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Sentence Practice</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.card}>
          <Text style={styles.sentence}>{currentSentence || 'Press Generate to start'}</Text>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.btn} onPress={generate}>
            {loading ? <ActivityIndicator color="#fff" /> : <Ionicons name="play" size={18} color="#fff" />}
            <Text style={styles.btnText}>Generate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnAlt, recording && styles.btnAltActive]} onPress={speakBack}>
            {recording ? <ActivityIndicator color="#FF8C00" /> : <Ionicons name="mic" size={18} color="#FF8C00" />}
            <Text style={styles.btnAltText}>{recording ? 'Listening…' : 'Speak'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Conversation mode - scenario selection
  if (mode === 'conversation' && !scenario) {
    return (
      <View style={[styles.container, { paddingTop: Math.max(12, insets.top + 12) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => setMode(null)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Pick a scenario</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.scenarioRow}>
          <TouchableOpacity style={styles.option} onPress={() => startScenario('Job interview')}>
            <Text style={styles.optionText}>Job interview</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={() => startScenario('At the airport')}>
            <Text style={styles.optionText}>Airport</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={() => startScenario('At a cafe')}>
            <Text style={styles.optionText}>Cafe</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Conversation mode - active conversation
  return (
    <View style={[styles.container, { paddingTop: Math.max(12, insets.top + 12) }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => { setScenario(null); setAssistantText(''); }} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{scenario}</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.bubble}> 
        <Text style={styles.bubbleText}>{assistantText}</Text>
        {!!highlighted.length && (
          <Text style={styles.highlightText}>Highlighted: {highlighted.join(', ')}</Text>
        )}
      </View>
      <TouchableOpacity onPress={handleReply} style={[styles.micButton, recording && styles.micButtonActive]}>
        {loading || recording ? <ActivityIndicator color="#fff" /> : <Ionicons name="mic" color="#fff" size={20} />}
        <Text style={styles.micText}>{recording ? 'Listening…' : 'Speak'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16, paddingTop: 60 },
  title: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20, textAlign: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  backBtn: { padding: 8 },
  placeholder: { width: 40 },
  
  // Mode selection
  modeRow: { flexDirection: 'column', gap: 16 },
  modeCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#e1e1e1', alignItems: 'center' },
  modeTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginTop: 8, marginBottom: 4 },
  modeDesc: { fontSize: 14, color: '#666', textAlign: 'center' },
  
  // Sentence practice
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e1e1e1', minHeight: 120, justifyContent: 'center' },
  sentence: { fontSize: 18, color: '#333' },
  row: { flexDirection: 'row', gap: 12, marginTop: 16 },
  btn: { flexDirection: 'row', gap: 8, backgroundColor: '#FF8C00', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
  btnAlt: { flexDirection: 'row', gap: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#FF8C00', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center' },
  btnAltActive: { backgroundColor: '#FFF4EA' },
  btnAltText: { color: '#FF8C00', fontWeight: '600' },
  
  // Conversation mode
  scenarioRow: { flexDirection: 'row', gap: 8 },
  option: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e1e1e1' },
  optionText: { color: '#333', fontWeight: '600', textAlign: 'center' },
  bubble: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e1e1e1', marginBottom: 20 },
  bubbleText: { fontSize: 16, color: '#333' },
  highlightText: { marginTop: 8, fontSize: 12, color: '#007AFF' },
  micButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FF8C00', paddingVertical: 14, borderRadius: 10 },
  micButtonActive: { backgroundColor: '#E57700' },
  micText: { color: '#fff', fontWeight: '600' },
});


