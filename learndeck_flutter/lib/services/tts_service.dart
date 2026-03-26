import 'package:flutter_tts/flutter_tts.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Text-to-Speech service for vocabulary pronunciation
class TTSService {
  static final FlutterTts _tts = FlutterTts();
  static bool _initialized = false;

  // SharedPreferences keys
  static const String _rateKey = 'tts_rate';
  static const String _pitchKey = 'tts_pitch';
  static const String _volumeKey = 'tts_volume';

  // Language to TTS locale mapping
  static const Map<String, String> _languageLocales = {
    'German': 'de-DE',
    'Spanish': 'es-ES',
    'French': 'fr-FR',
    'Italian': 'it-IT',
    'Portuguese': 'pt-PT',
    'Dutch': 'nl-NL',
    'Japanese': 'ja-JP',
    'Chinese': 'zh-CN',
    'Korean': 'ko-KR',
    'English': 'en-US',
  };

  // Default settings
  static const double defaultRate = 0.5; // 0.0 - 1.0 (0.5 is normal)
  static const double defaultPitch = 1.0; // 0.5 - 2.0
  static const double defaultVolume = 1.0; // 0.0 - 1.0

  /// Initialize the TTS service
  static Future<void> initialize() async {
    if (_initialized) return;

    // Load saved settings
    final prefs = await SharedPreferences.getInstance();
    final rate = prefs.getDouble(_rateKey) ?? defaultRate;
    final pitch = prefs.getDouble(_pitchKey) ?? defaultPitch;
    final volume = prefs.getDouble(_volumeKey) ?? defaultVolume;

    await _tts.setSpeechRate(rate);
    await _tts.setPitch(pitch);
    await _tts.setVolume(volume);

    _initialized = true;
  }

  /// Speak text in the specified language
  static Future<void> speak(String text, {String? language}) async {
    await initialize();

    if (language != null) {
      final locale = _languageLocales[language] ?? 'en-US';
      await _tts.setLanguage(locale);
    }

    await _tts.speak(text);
  }

  /// Speak text slowly (for learners)
  static Future<void> speakSlow(String text, {String? language}) async {
    await initialize();

    if (language != null) {
      final locale = _languageLocales[language] ?? 'en-US';
      await _tts.setLanguage(locale);
    }

    // Temporarily reduce rate for slow speech
    final prefs = await SharedPreferences.getInstance();
    final normalRate = prefs.getDouble(_rateKey) ?? defaultRate;

    await _tts.setSpeechRate(normalRate * 0.6); // 60% of normal speed
    await _tts.speak(text);

    // Restore normal rate after a delay
    Future.delayed(const Duration(seconds: 3), () async {
      await _tts.setSpeechRate(normalRate);
    });
  }

  /// Stop any current speech
  static Future<void> stop() async {
    await _tts.stop();
  }

  /// Check if TTS is currently speaking
  static Future<bool> get isSpeaking async {
    // FlutterTts doesn't have a direct isSpeaking check on all platforms
    // This is a workaround - returns false by default
    return false;
  }

  /// Get available languages on this device
  static Future<List<String>> getAvailableLanguages() async {
    await initialize();
    final languages = await _tts.getLanguages;
    return List<String>.from(languages ?? []);
  }

  /// Check if a specific language is available
  static Future<bool> isLanguageAvailable(String language) async {
    final locale = _languageLocales[language];
    if (locale == null) return false;

    final available = await getAvailableLanguages();
    return available.any((l) => l.toLowerCase().contains(locale.split('-')[0].toLowerCase()));
  }

  /// Set speech rate (0.0 - 1.0)
  static Future<void> setRate(double rate) async {
    await initialize();
    final clampedRate = rate.clamp(0.0, 1.0);
    await _tts.setSpeechRate(clampedRate);

    final prefs = await SharedPreferences.getInstance();
    await prefs.setDouble(_rateKey, clampedRate);
  }

  /// Set pitch (0.5 - 2.0)
  static Future<void> setPitch(double pitch) async {
    await initialize();
    final clampedPitch = pitch.clamp(0.5, 2.0);
    await _tts.setPitch(clampedPitch);

    final prefs = await SharedPreferences.getInstance();
    await prefs.setDouble(_pitchKey, clampedPitch);
  }

  /// Set volume (0.0 - 1.0)
  static Future<void> setVolume(double volume) async {
    await initialize();
    final clampedVolume = volume.clamp(0.0, 1.0);
    await _tts.setVolume(clampedVolume);

    final prefs = await SharedPreferences.getInstance();
    await prefs.setDouble(_volumeKey, clampedVolume);
  }

  /// Get current rate
  static Future<double> getRate() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getDouble(_rateKey) ?? defaultRate;
  }

  /// Get current pitch
  static Future<double> getPitch() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getDouble(_pitchKey) ?? defaultPitch;
  }

  /// Get current volume
  static Future<double> getVolume() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getDouble(_volumeKey) ?? defaultVolume;
  }

  /// Get locale code for a language
  static String? getLocaleForLanguage(String language) {
    return _languageLocales[language];
  }

  /// Get display name for speech rate
  static String getRateDisplayName(double rate) {
    if (rate < 0.35) return 'Very Slow';
    if (rate < 0.45) return 'Slow';
    if (rate < 0.55) return 'Normal';
    if (rate < 0.7) return 'Fast';
    return 'Very Fast';
  }

  /// Preset rates for easy selection
  static const Map<String, double> presetRates = {
    'Very Slow': 0.25,
    'Slow': 0.4,
    'Normal': 0.5,
    'Fast': 0.65,
    'Very Fast': 0.8,
  };
}
