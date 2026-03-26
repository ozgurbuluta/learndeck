import 'package:speech_to_text/speech_to_text.dart';
import 'package:speech_to_text/speech_recognition_result.dart';
import 'package:speech_to_text/speech_recognition_error.dart';

/// Speech-to-Text service for pronunciation practice
class SpeechService {
  static final SpeechToText _speech = SpeechToText();
  static bool _initialized = false;
  static bool _isListening = false;

  // Language to STT locale mapping
  static const Map<String, String> _languageLocales = {
    'German': 'de_DE',
    'Spanish': 'es_ES',
    'French': 'fr_FR',
    'Italian': 'it_IT',
    'Portuguese': 'pt_PT',
    'Dutch': 'nl_NL',
    'Japanese': 'ja_JP',
    'Chinese': 'zh_CN',
    'Korean': 'ko_KR',
    'English': 'en_US',
  };

  /// Initialize the speech recognition service
  static Future<bool> initialize() async {
    if (_initialized) return true;

    try {
      _initialized = await _speech.initialize(
        onStatus: _onStatus,
        onError: _onError,
      );
      return _initialized;
    } catch (e) {
      return false;
    }
  }

  static void _onStatus(String status) {
    _isListening = status == 'listening';
  }

  static void _onError(SpeechRecognitionError error) {
    _isListening = false;
  }

  /// Check if speech recognition is available
  static Future<bool> isAvailable() async {
    if (!_initialized) {
      await initialize();
    }
    return _initialized;
  }

  /// Check if currently listening
  static bool get isListening => _isListening;

  /// Start listening for speech in the specified language
  static Future<void> startListening({
    required String language,
    required Function(SpeechRecognitionResult) onResult,
    Function(SpeechRecognitionError)? onError,
    Duration? listenFor,
    Duration? pauseFor,
  }) async {
    if (!_initialized) {
      final available = await initialize();
      if (!available) {
        throw Exception('Speech recognition not available');
      }
    }

    final localeId = _languageLocales[language] ?? 'en_US';

    await _speech.listen(
      onResult: onResult,
      localeId: localeId,
      listenFor: listenFor ?? const Duration(seconds: 30),
      pauseFor: pauseFor ?? const Duration(seconds: 3),
      partialResults: true,
      cancelOnError: false,
      listenMode: ListenMode.confirmation,
    );

    _isListening = true;
  }

  /// Stop listening
  static Future<void> stopListening() async {
    await _speech.stop();
    _isListening = false;
  }

  /// Cancel listening
  static Future<void> cancelListening() async {
    await _speech.cancel();
    _isListening = false;
  }

  /// Get available locales on this device
  static Future<List<LocaleName>> getAvailableLocales() async {
    if (!_initialized) {
      await initialize();
    }
    return await _speech.locales();
  }

  /// Check if a specific language is available
  static Future<bool> isLanguageAvailable(String language) async {
    final localeId = _languageLocales[language];
    if (localeId == null) return false;

    final locales = await getAvailableLocales();
    return locales.any((l) =>
        l.localeId.toLowerCase().contains(localeId.split('_')[0].toLowerCase()));
  }

  /// Get locale ID for a language
  static String? getLocaleForLanguage(String language) {
    return _languageLocales[language];
  }

  /// Calculate similarity between two strings (0.0 - 1.0)
  static double calculateSimilarity(String expected, String actual) {
    if (expected.isEmpty && actual.isEmpty) return 1.0;
    if (expected.isEmpty || actual.isEmpty) return 0.0;

    final expectedLower = expected.toLowerCase().trim();
    final actualLower = actual.toLowerCase().trim();

    if (expectedLower == actualLower) return 1.0;

    // Use Levenshtein distance
    final distance = _levenshteinDistance(expectedLower, actualLower);
    final maxLength =
        expectedLower.length > actualLower.length ? expectedLower.length : actualLower.length;

    return 1.0 - (distance / maxLength);
  }

  /// Calculate Levenshtein distance between two strings
  static int _levenshteinDistance(String s1, String s2) {
    if (s1 == s2) return 0;
    if (s1.isEmpty) return s2.length;
    if (s2.isEmpty) return s1.length;

    List<int> v0 = List<int>.generate(s2.length + 1, (i) => i);
    List<int> v1 = List<int>.filled(s2.length + 1, 0);

    for (int i = 0; i < s1.length; i++) {
      v1[0] = i + 1;

      for (int j = 0; j < s2.length; j++) {
        final cost = s1[i] == s2[j] ? 0 : 1;
        v1[j + 1] = [v1[j] + 1, v0[j + 1] + 1, v0[j] + cost].reduce((a, b) => a < b ? a : b);
      }

      final temp = v0;
      v0 = v1;
      v1 = temp;
    }

    return v0[s2.length];
  }

  /// Get feedback message based on similarity score
  static String getFeedbackMessage(double similarity) {
    if (similarity >= 0.95) return 'Perfect!';
    if (similarity >= 0.85) return 'Excellent!';
    if (similarity >= 0.70) return 'Good job!';
    if (similarity >= 0.50) return 'Almost there!';
    if (similarity >= 0.30) return 'Keep practicing';
    return 'Try again';
  }

  /// Get feedback color based on similarity score
  static String getFeedbackColorName(double similarity) {
    if (similarity >= 0.70) return 'success';
    if (similarity >= 0.50) return 'warning';
    return 'error';
  }
}
