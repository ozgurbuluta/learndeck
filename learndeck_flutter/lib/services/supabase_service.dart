import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/word.dart';
import '../models/folder.dart';

class SupabaseService {
  static SupabaseClient get client => Supabase.instance.client;

  static Future<void> initialize({
    required String url,
    required String anonKey,
  }) async {
    await Supabase.initialize(
      url: url,
      anonKey: anonKey,
    );
  }

  // Auth
  static User? get currentUser => client.auth.currentUser;
  static Stream<AuthState> get authStateChanges => client.auth.onAuthStateChange;

  static Future<AuthResponse> signInWithEmail(String email, String password) {
    return client.auth.signInWithPassword(email: email, password: password);
  }

  static Future<AuthResponse> signUpWithEmail(String email, String password) {
    return client.auth.signUp(email: email, password: password);
  }

  static Future<void> signOut() {
    return client.auth.signOut();
  }

  // Words
  static Future<List<Word>> getWords() async {
    final userId = currentUser?.id;
    if (userId == null) return [];

    final response = await client
        .from('words')
        .select()
        .eq('user_id', userId)
        .order('created_at', ascending: false);

    return (response as List).map((json) => Word.fromJson(json)).toList();
  }

  static Future<Word> createWord({
    required String word,
    required String definition,
    String? article,
  }) async {
    final userId = currentUser?.id;
    if (userId == null) throw Exception('Not authenticated');

    final response = await client.from('words').insert({
      'user_id': userId,
      'word': word,
      'definition': definition,
      'article': article,
      'difficulty': 'new',
      'review_count': 0,
      'correct_count': 0,
      'next_review': DateTime.now().toIso8601String(),
    }).select().single();

    return Word.fromJson(response);
  }

  static Future<void> updateWordAfterReview({
    required String wordId,
    required bool wasCorrect,
  }) async {
    final word = await client
        .from('words')
        .select()
        .eq('id', wordId)
        .single();

    final currentReviewCount = (word['review_count'] as int?) ?? 0;
    final currentCorrectCount = (word['correct_count'] as int?) ?? 0;
    final newReviewCount = currentReviewCount + 1;
    final newCorrectCount = wasCorrect ? currentCorrectCount + 1 : currentCorrectCount;

    // Calculate new difficulty
    final accuracy = newReviewCount > 0 ? newCorrectCount / newReviewCount : 0.0;
    String newDifficulty;
    int daysUntilNextReview;

    if (!wasCorrect) {
      newDifficulty = 'failed';
      daysUntilNextReview = 1;
    } else if (accuracy >= 0.9 && newReviewCount >= 5) {
      newDifficulty = 'mastered';
      daysUntilNextReview = 14;
    } else if (accuracy >= 0.7) {
      newDifficulty = 'review';
      daysUntilNextReview = 7;
    } else {
      newDifficulty = 'learning';
      daysUntilNextReview = 3;
    }

    await client.from('words').update({
      'review_count': newReviewCount,
      'correct_count': newCorrectCount,
      'difficulty': newDifficulty,
      'last_reviewed': DateTime.now().toIso8601String(),
      'next_review': DateTime.now()
          .add(Duration(days: daysUntilNextReview))
          .toIso8601String(),
    }).eq('id', wordId);
  }

  static Future<void> deleteWord(String wordId) {
    return client.from('words').delete().eq('id', wordId);
  }

  // Folders
  static Future<List<Folder>> getFolders() async {
    final userId = currentUser?.id;
    if (userId == null) return [];

    final response = await client
        .from('folders')
        .select()
        .eq('user_id', userId)
        .order('created_at', ascending: false);

    return (response as List).map((json) => Folder.fromJson(json)).toList();
  }

  static Future<Folder> createFolder({
    required String name,
    required String color,
  }) async {
    final userId = currentUser?.id;
    if (userId == null) throw Exception('Not authenticated');

    final response = await client.from('folders').insert({
      'user_id': userId,
      'name': name,
      'color': color,
    }).select().single();

    return Folder.fromJson(response);
  }
}
