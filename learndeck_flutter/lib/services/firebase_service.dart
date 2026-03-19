import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/word.dart';
import '../models/folder.dart';

class FirebaseService {
  static final FirebaseAuth _auth = FirebaseAuth.instance;
  static final FirebaseFirestore _db = FirebaseFirestore.instance;

  // Auth
  static User? get currentUser => _auth.currentUser;
  static Stream<User?> get authStateChanges => _auth.authStateChanges();

  static Future<UserCredential> signInWithEmail(String email, String password) {
    return _auth.signInWithEmailAndPassword(email: email, password: password);
  }

  static Future<UserCredential> signUpWithEmail(String email, String password) {
    return _auth.createUserWithEmailAndPassword(email: email, password: password);
  }

  static Future<void> signOut() {
    return _auth.signOut();
  }

  // Words Collection
  static CollectionReference<Map<String, dynamic>> get _wordsCollection =>
      _db.collection('words');

  static Future<List<Word>> getWords() async {
    final userId = currentUser?.uid;
    if (userId == null) return [];

    final snapshot = await _wordsCollection
        .where('user_id', isEqualTo: userId)
        .orderBy('created_at', descending: true)
        .get();

    return snapshot.docs.map((doc) {
      final data = doc.data();
      data['id'] = doc.id;
      return Word.fromJson(data);
    }).toList();
  }

  static Future<Word> createWord({
    required String word,
    required String definition,
    String? article,
  }) async {
    final userId = currentUser?.uid;
    if (userId == null) throw Exception('Not authenticated');

    final now = DateTime.now();
    final docRef = await _wordsCollection.add({
      'user_id': userId,
      'word': word,
      'definition': definition,
      'article': article,
      'difficulty': 'new',
      'review_count': 0,
      'correct_count': 0,
      'created_at': now.toIso8601String(),
      'next_review': now.toIso8601String(),
      'last_reviewed': null,
    });

    return Word(
      id: docRef.id,
      userId: userId,
      word: word,
      definition: definition,
      article: article,
      createdAt: now,
      reviewCount: 0,
      correctCount: 0,
      difficulty: Difficulty.newWord,
      nextReview: now,
    );
  }

  static Future<void> updateWordAfterReview({
    required String wordId,
    required bool wasCorrect,
  }) async {
    final doc = await _wordsCollection.doc(wordId).get();
    if (!doc.exists) return;

    final data = doc.data()!;
    final currentReviewCount = (data['review_count'] as int?) ?? 0;
    final currentCorrectCount = (data['correct_count'] as int?) ?? 0;
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

    await _wordsCollection.doc(wordId).update({
      'review_count': newReviewCount,
      'correct_count': newCorrectCount,
      'difficulty': newDifficulty,
      'last_reviewed': DateTime.now().toIso8601String(),
      'next_review': DateTime.now()
          .add(Duration(days: daysUntilNextReview))
          .toIso8601String(),
    });
  }

  static Future<void> deleteWord(String wordId) {
    return _wordsCollection.doc(wordId).delete();
  }

  // Folders Collection
  static CollectionReference<Map<String, dynamic>> get _foldersCollection =>
      _db.collection('folders');

  static Future<List<Folder>> getFolders() async {
    final userId = currentUser?.uid;
    if (userId == null) return [];

    final snapshot = await _foldersCollection
        .where('user_id', isEqualTo: userId)
        .orderBy('created_at', descending: true)
        .get();

    return snapshot.docs.map((doc) {
      final data = doc.data();
      data['id'] = doc.id;
      return Folder.fromJson(data);
    }).toList();
  }

  static Future<Folder> createFolder({
    required String name,
    required String color,
  }) async {
    final userId = currentUser?.uid;
    if (userId == null) throw Exception('Not authenticated');

    final now = DateTime.now();
    final docRef = await _foldersCollection.add({
      'user_id': userId,
      'name': name,
      'color': color,
      'created_at': now.toIso8601String(),
      'updated_at': now.toIso8601String(),
    });

    return Folder(
      id: docRef.id,
      userId: userId,
      name: name,
      color: color,
      createdAt: now,
      updatedAt: now,
    );
  }
}
