import 'package:flutter_test/flutter_test.dart';
import 'package:learndeck_flutter/models/word.dart';
import 'package:learndeck_flutter/utils/study_algorithm.dart';

void main() {
  group('Study Algorithm', () {
    test('shuffleWordsForStudy returns empty list for empty input', () {
      final result = shuffleWordsForStudy([]);
      expect(result, isEmpty);
    });

    test('shuffleWordsForStudy preserves all words (order may shuffle)', () {
      final words = [
        _createWord('easy', Difficulty.mastered),
        _createWord('hard', Difficulty.failed),
        _createWord('medium', Difficulty.learning),
      ];

      final result = shuffleWordsForStudy(words);
      expect(result.length, words.length);
      expect(
        result.map((w) => w.word).toSet(),
        words.map((w) => w.word).toSet(),
      );
    });

    test(
        'shuffleWordsForStudy leads with high-priority bucket when interleaving',
        () {
      // With >5 words, _interleaveGroups runs; highIndex==0 always pulls from high.
      final words = <Word>[
        _createWord('failed', Difficulty.failed),
        for (var i = 0; i < 8; i++)
          _createMasteredLowPriority('m$i'),
      ];

      for (var i = 0; i < 15; i++) {
        final result = shuffleWordsForStudy(words);
        expect(result.first.word, 'failed');
      }
    });
  });
}

Word _createWord(String word, Difficulty difficulty) {
  return Word(
    id: word,
    userId: 'test',
    word: word,
    definition: 'test definition',
    createdAt: DateTime.now(),
    reviewCount: 5,
    correctCount: difficulty == Difficulty.failed ? 1 : 4,
    difficulty: difficulty,
    nextReview: DateTime.now().subtract(const Duration(days: 1)),
  );
}

/// Mastered, not overdue — lands in low bucket for shuffleWordsForStudy.
Word _createMasteredLowPriority(String word) {
  final now = DateTime.now();
  return Word(
    id: word,
    userId: 'test',
    word: word,
    definition: 'test definition',
    createdAt: now,
    lastReviewed: now,
    reviewCount: 10,
    correctCount: 9,
    difficulty: Difficulty.mastered,
    nextReview: now.add(const Duration(days: 7)),
  );
}
