import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/user_preferences.dart';

class AIService {
  static const String _baseUrl = 'https://learndeck-six.vercel.app/api';

  /// Generate vocabulary words using AI based on user request
  static Future<AIVocabularyResponse> generateVocabulary({
    required String userMessage,
    List<Map<String, String>>? conversationHistory,
    UserPreferences? userPreferences,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/ai-vocabulary'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'userMessage': userMessage,
          'conversationHistory': conversationHistory ?? [],
          if (userPreferences != null) 'userPreferences': {
            'targetLanguage': userPreferences.targetLanguage,
            'nativeLanguage': userPreferences.nativeLanguage,
            'level': userPreferences.level,
            'useCases': userPreferences.useCases,
            'categories': userPreferences.categories,
          },
        }),
      );

      if (response.statusCode != 200) {
        throw Exception('API error: ${response.statusCode}');
      }

      final data = jsonDecode(response.body);
      return AIVocabularyResponse.fromJson(data);
    } catch (e) {
      return AIVocabularyResponse(
        success: false,
        response: 'Failed to connect to AI service. Please try again.',
        words: [],
      );
    }
  }

  /// Get AI-powered pronunciation feedback
  static Future<PronunciationFeedback> getPronunciationFeedback({
    required String targetWord,
    required String spokenWord,
    required String targetLanguage,
    String? nativeLanguage,
    required double similarityScore,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/pronunciation-feedback'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'targetWord': targetWord,
          'spokenWord': spokenWord,
          'targetLanguage': targetLanguage,
          'nativeLanguage': nativeLanguage ?? 'English',
          'similarityScore': similarityScore,
        }),
      );

      if (response.statusCode != 200) {
        throw Exception('API error: ${response.statusCode}');
      }

      final data = jsonDecode(response.body);
      return PronunciationFeedback.fromJson(data);
    } catch (e) {
      return PronunciationFeedback(
        success: false,
        feedback: 'Could not get feedback. Please try again.',
        tip: '',
        encouragement: 'Keep practicing!',
      );
    }
  }

  /// Extract vocabulary from a document (PDF text, CSV, etc.)
  static Future<DocumentProcessResponse> processDocument({
    required String content,
    required String fileType,
    List<String>? existingWords,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/process-document'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'content': content,
          'fileType': fileType,
          'existingWords': existingWords ?? [],
        }),
      );

      if (response.statusCode != 200) {
        final error = jsonDecode(response.body);
        throw Exception(error['error'] ?? 'Unknown error');
      }

      final data = jsonDecode(response.body);
      return DocumentProcessResponse.fromJson(data);
    } catch (e) {
      return DocumentProcessResponse(
        success: false,
        error: e.toString(),
        words: [],
      );
    }
  }
}

class AIVocabularyResponse {
  final bool success;
  final String response;
  final List<ExtractedWord> words;

  AIVocabularyResponse({
    required this.success,
    required this.response,
    required this.words,
  });

  factory AIVocabularyResponse.fromJson(Map<String, dynamic> json) {
    return AIVocabularyResponse(
      success: json['success'] ?? false,
      response: json['response'] ?? '',
      words: (json['words'] as List<dynamic>?)
              ?.map((w) => ExtractedWord.fromJson(w))
              .toList() ??
          [],
    );
  }
}

class DocumentProcessResponse {
  final bool success;
  final String? error;
  final List<ExtractedWord> words;

  DocumentProcessResponse({
    required this.success,
    this.error,
    required this.words,
  });

  factory DocumentProcessResponse.fromJson(Map<String, dynamic> json) {
    return DocumentProcessResponse(
      success: json['success'] ?? false,
      error: json['error'],
      words: (json['words'] as List<dynamic>?)
              ?.map((w) => ExtractedWord.fromJson(w))
              .toList() ??
          [],
    );
  }
}

class ExtractedWord {
  final String word;
  final String definition;
  final String? article;

  ExtractedWord({
    required this.word,
    required this.definition,
    this.article,
  });

  factory ExtractedWord.fromJson(Map<String, dynamic> json) {
    return ExtractedWord(
      word: json['word'] ?? '',
      definition: json['definition'] ?? '',
      article: json['article'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'word': word,
      'definition': definition,
      if (article != null) 'article': article,
    };
  }
}

class PronunciationFeedback {
  final bool success;
  final String feedback;
  final String tip;
  final String encouragement;

  PronunciationFeedback({
    required this.success,
    required this.feedback,
    required this.tip,
    required this.encouragement,
  });

  factory PronunciationFeedback.fromJson(Map<String, dynamic> json) {
    return PronunciationFeedback(
      success: json['success'] ?? false,
      feedback: json['feedback'] ?? '',
      tip: json['tip'] ?? '',
      encouragement: json['encouragement'] ?? 'Keep practicing!',
    );
  }
}
