import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/tts_settings.dart';
import '../services/tts_service.dart';

/// Provider for TTS settings state
final ttsSettingsProvider =
    StateNotifierProvider<TTSSettingsNotifier, TTSSettings>((ref) {
  return TTSSettingsNotifier();
});

class TTSSettingsNotifier extends StateNotifier<TTSSettings> {
  TTSSettingsNotifier() : super(const TTSSettings()) {
    _loadSettings();
  }

  /// Load settings from TTS service (SharedPreferences)
  Future<void> _loadSettings() async {
    final rate = await TTSService.getRate();
    final pitch = await TTSService.getPitch();
    final volume = await TTSService.getVolume();

    state = TTSSettings(
      speechRate: rate,
      pitch: pitch,
      volume: volume,
    );
  }

  /// Update speech rate
  Future<void> setRate(double rate) async {
    await TTSService.setRate(rate);
    state = state.copyWith(speechRate: rate);
  }

  /// Update pitch
  Future<void> setPitch(double pitch) async {
    await TTSService.setPitch(pitch);
    state = state.copyWith(pitch: pitch);
  }

  /// Update volume
  Future<void> setVolume(double volume) async {
    await TTSService.setVolume(volume);
    state = state.copyWith(volume: volume);
  }

  /// Update auto-play setting
  void setAutoPlayOnReveal(bool value) {
    state = state.copyWith(autoPlayOnReveal: value);
  }

  /// Reset to defaults
  Future<void> resetToDefaults() async {
    await TTSService.setRate(TTSService.defaultRate);
    await TTSService.setPitch(TTSService.defaultPitch);
    await TTSService.setVolume(TTSService.defaultVolume);
    state = const TTSSettings();
  }

  /// Test current settings by speaking a sample
  Future<void> testVoice(String language) async {
    final samples = {
      'German': 'Hallo, wie geht es dir?',
      'Spanish': 'Hola, como estas?',
      'French': 'Bonjour, comment allez-vous?',
      'Italian': 'Ciao, come stai?',
      'Portuguese': 'Ola, como voce esta?',
      'Dutch': 'Hallo, hoe gaat het?',
      'Japanese': 'Konnichiwa',
      'Chinese': 'Nihao',
      'Korean': 'Annyeonghaseyo',
    };

    final sampleText = samples[language] ?? 'Hello, how are you?';
    await TTSService.speak(sampleText, language: language);
  }
}
