import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:speech_to_text/speech_recognition_result.dart';
import '../services/speech_service.dart';

/// State for speech recognition
class SpeechState {
  final bool isAvailable;
  final bool isListening;
  final String recognizedText;
  final double confidence;
  final String? error;

  const SpeechState({
    this.isAvailable = false,
    this.isListening = false,
    this.recognizedText = '',
    this.confidence = 0.0,
    this.error,
  });

  SpeechState copyWith({
    bool? isAvailable,
    bool? isListening,
    String? recognizedText,
    double? confidence,
    String? error,
  }) {
    return SpeechState(
      isAvailable: isAvailable ?? this.isAvailable,
      isListening: isListening ?? this.isListening,
      recognizedText: recognizedText ?? this.recognizedText,
      confidence: confidence ?? this.confidence,
      error: error,
    );
  }
}

/// Provider for speech recognition state
final speechProvider =
    StateNotifierProvider<SpeechNotifier, SpeechState>((ref) {
  return SpeechNotifier();
});

class SpeechNotifier extends StateNotifier<SpeechState> {
  SpeechNotifier() : super(const SpeechState()) {
    _initialize();
  }

  Future<void> _initialize() async {
    final available = await SpeechService.initialize();
    state = state.copyWith(isAvailable: available);
  }

  /// Start listening for speech
  Future<void> startListening({required String language}) async {
    if (!state.isAvailable) {
      state = state.copyWith(error: 'Speech recognition not available');
      return;
    }

    state = state.copyWith(
      isListening: true,
      recognizedText: '',
      confidence: 0.0,
      error: null,
    );

    try {
      await SpeechService.startListening(
        language: language,
        onResult: _onResult,
        onError: (error) {
          state = state.copyWith(
            isListening: false,
            error: error.errorMsg,
          );
        },
      );
    } catch (e) {
      state = state.copyWith(
        isListening: false,
        error: e.toString(),
      );
    }
  }

  void _onResult(SpeechRecognitionResult result) {
    state = state.copyWith(
      recognizedText: result.recognizedWords,
      confidence: result.confidence,
      isListening: !result.finalResult,
    );
  }

  /// Stop listening
  Future<void> stopListening() async {
    await SpeechService.stopListening();
    state = state.copyWith(isListening: false);
  }

  /// Cancel listening
  Future<void> cancelListening() async {
    await SpeechService.cancelListening();
    state = state.copyWith(
      isListening: false,
      recognizedText: '',
      confidence: 0.0,
    );
  }

  /// Clear recognized text
  void clearText() {
    state = state.copyWith(
      recognizedText: '',
      confidence: 0.0,
      error: null,
    );
  }

  /// Calculate similarity between expected and recognized text
  double calculateSimilarity(String expected) {
    return SpeechService.calculateSimilarity(expected, state.recognizedText);
  }
}
