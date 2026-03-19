import 'dart:math';
import '../models/word.dart';

/// Smart study algorithm that randomizes words while optimizing for learning effectiveness.
/// Uses spaced repetition principles and prioritizes words that need more practice.
List<Word> shuffleWordsForStudy(List<Word> words) {
  if (words.isEmpty) return words;

  final List<Word> high = [];
  final List<Word> medium = [];
  final List<Word> low = [];

  final now = DateTime.now();

  for (final word in words) {
    final daysSinceLastReview = word.lastReviewed != null
        ? now.difference(word.lastReviewed!).inDays
        : 0;

    final isOverdue = word.nextReview.isBefore(now);
    final hasLowAccuracy = word.reviewCount > 0 && word.accuracy < 0.6;

    if (hasLowAccuracy ||
        (isOverdue && daysSinceLastReview > 2) ||
        word.difficulty == Difficulty.failed) {
      high.add(word);
    } else if (word.difficulty == Difficulty.learning ||
        (isOverdue && daysSinceLastReview <= 2)) {
      medium.add(word);
    } else {
      low.add(word);
    }
  }

  final shuffledHigh = _shuffleArray(high);
  final shuffledMedium = _shuffleArray(medium);
  final shuffledLow = _shuffleArray(low);

  return _interleaveGroups(shuffledHigh, shuffledMedium, shuffledLow);
}

List<Word> _shuffleArray(List<Word> array) {
  final shuffled = List<Word>.from(array);
  final random = Random();
  for (var i = shuffled.length - 1; i > 0; i--) {
    final j = random.nextInt(i + 1);
    final temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  return shuffled;
}

List<Word> _interleaveGroups(
    List<Word> high, List<Word> medium, List<Word> low) {
  final result = <Word>[];
  final totalWords = high.length + medium.length + low.length;

  if (totalWords <= 5) {
    return _shuffleArray([...high, ...medium, ...low]);
  }

  var highIndex = 0;
  var mediumIndex = 0;
  var lowIndex = 0;
  final random = Random();

  for (var i = 0; i < totalWords; i++) {
    final position = i / totalWords;

    if (highIndex < high.length &&
        ((position < 0.7 && random.nextDouble() < 0.4) ||
            highIndex == 0 ||
            (mediumIndex >= medium.length && lowIndex >= low.length))) {
      result.add(high[highIndex++]);
    } else if (mediumIndex < medium.length &&
        (random.nextDouble() < 0.5 ||
            (highIndex >= high.length && lowIndex >= low.length))) {
      result.add(medium[mediumIndex++]);
    } else if (lowIndex < low.length) {
      result.add(low[lowIndex++]);
    } else if (highIndex < high.length) {
      result.add(high[highIndex++]);
    } else if (mediumIndex < medium.length) {
      result.add(medium[mediumIndex++]);
    }
  }

  return result;
}

/// Randomizes words within their difficulty groups, preserving difficulty order.
List<Word> randomizeWithinDifficulty(List<Word> words) {
  final groupedByDifficulty = <Difficulty, List<Word>>{};

  for (final word in words) {
    groupedByDifficulty.putIfAbsent(word.difficulty, () => []).add(word);
  }

  for (final difficulty in groupedByDifficulty.keys) {
    groupedByDifficulty[difficulty] =
        _shuffleArray(groupedByDifficulty[difficulty]!);
  }

  final difficulties = [
    Difficulty.failed,
    Difficulty.learning,
    Difficulty.newWord,
    Difficulty.review,
    Difficulty.mastered,
  ];

  return difficulties
      .expand((diff) => groupedByDifficulty[diff] ?? <Word>[])
      .toList();
}
