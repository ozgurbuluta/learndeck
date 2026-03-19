import 'package:flutter_test/flutter_test.dart';
import 'package:learndeck_flutter/models/word.dart';
import 'package:learndeck_flutter/utils/study_algorithm.dart';

void main() {
  group('Study Algorithm', () {
    test('shuffleWordsForStudy returns empty list for empty input', () {
      final result = shuffleWordsForStudy([]);
      expect(result, isEmpty);
    });

    test('shuffleWordsForStudy prioritizes failed words', () {
      final words = [
        _createWord('easy', Difficulty.mastered),
        _createWord('hard', Difficulty.failed),
        _createWord('medium', Difficulty.learning),
      ];

      // Run multiple times to check priority tendency
      var failedFirstCount = 0;
      for (var i = 0; i < 10; i++) {
        final result = shuffleWordsForStudy(words);
        if (result.first.word == 'hard') failedFirstCount++;
      }

      // Failed words should appear first more often
      expect(failedFirstCount, greaterThan(2));
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
