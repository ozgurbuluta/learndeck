import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/word.dart';
import '../services/firebase_service.dart';

final wordsProvider = StateNotifierProvider<WordsNotifier, AsyncValue<List<Word>>>((ref) {
  return WordsNotifier();
});

class WordsNotifier extends StateNotifier<AsyncValue<List<Word>>> {
  WordsNotifier() : super(const AsyncValue.loading());

  Future<void> loadWords() async {
    state = const AsyncValue.loading();
    try {
      final words = await FirebaseService.getWords();
      state = AsyncValue.data(words);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> addWord({
    required String word,
    required String definition,
    String? article,
  }) async {
    try {
      final newWord = await FirebaseService.createWord(
        word: word,
        definition: definition,
        article: article,
      );
      state.whenData((words) {
        state = AsyncValue.data([newWord, ...words]);
      });
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> updateAfterReview(String wordId, bool wasCorrect) async {
    await FirebaseService.updateWordAfterReview(
      wordId: wordId,
      wasCorrect: wasCorrect,
    );
    // Reload to get updated data
    await loadWords();
  }

  Future<void> deleteWord(String wordId) async {
    await FirebaseService.deleteWord(wordId);
    state.whenData((words) {
      state = AsyncValue.data(words.where((w) => w.id != wordId).toList());
    });
  }
}

final authStateProvider = StreamProvider<bool>((ref) {
  return FirebaseService.authStateChanges.map((user) => user != null);
});
