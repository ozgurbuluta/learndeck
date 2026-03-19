import 'dart:convert';
import 'package:http/http.dart' as http;

class AIService {
  // TODO: Update this to your Vercel deployment URL
  static const String _baseUrl = 'https://learndeck.vercel.app/api';

  /// Generate vocabulary words using AI based on user request
  static Future<AIVocabularyResponse> generateVocabulary({
    required String userMessage,
    List<Map<String, String>>? conversationHistory,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/ai-vocabulary'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'userMessage': userMessage,
          'conversationHistory': conversationHistory ?? [],
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
