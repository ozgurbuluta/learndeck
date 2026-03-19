enum Difficulty { newWord, learning, review, mastered, failed }

class Word {
  final String id;
  final String userId;
  final String word;
  final String definition;
  final String? article;
  final DateTime createdAt;
  final DateTime? lastReviewed;
  final int reviewCount;
  final int correctCount;
  final Difficulty difficulty;
  final DateTime nextReview;

  Word({
    required this.id,
    required this.userId,
    required this.word,
    required this.definition,
    this.article,
    required this.createdAt,
    this.lastReviewed,
    required this.reviewCount,
    required this.correctCount,
    required this.difficulty,
    required this.nextReview,
  });

  factory Word.fromJson(Map<String, dynamic> json) {
    return Word(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      word: json['word'] as String,
      definition: json['definition'] as String,
      article: json['article'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      lastReviewed: json['last_reviewed'] != null
          ? DateTime.parse(json['last_reviewed'] as String)
          : null,
      reviewCount: json['review_count'] as int? ?? 0,
      correctCount: json['correct_count'] as int? ?? 0,
      difficulty: _parseDifficulty(json['difficulty'] as String? ?? 'new'),
      nextReview: DateTime.parse(
          json['next_review'] as String? ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'word': word,
      'definition': definition,
      'article': article,
      'created_at': createdAt.toIso8601String(),
      'last_reviewed': lastReviewed?.toIso8601String(),
      'review_count': reviewCount,
      'correct_count': correctCount,
      'difficulty': _difficultyToString(difficulty),
      'next_review': nextReview.toIso8601String(),
    };
  }

  Word copyWith({
    String? id,
    String? userId,
    String? word,
    String? definition,
    String? article,
    DateTime? createdAt,
    DateTime? lastReviewed,
    int? reviewCount,
    int? correctCount,
    Difficulty? difficulty,
    DateTime? nextReview,
  }) {
    return Word(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      word: word ?? this.word,
      definition: definition ?? this.definition,
      article: article ?? this.article,
      createdAt: createdAt ?? this.createdAt,
      lastReviewed: lastReviewed ?? this.lastReviewed,
      reviewCount: reviewCount ?? this.reviewCount,
      correctCount: correctCount ?? this.correctCount,
      difficulty: difficulty ?? this.difficulty,
      nextReview: nextReview ?? this.nextReview,
    );
  }

  static Difficulty _parseDifficulty(String value) {
    switch (value) {
      case 'new':
        return Difficulty.newWord;
      case 'learning':
        return Difficulty.learning;
      case 'review':
        return Difficulty.review;
      case 'mastered':
        return Difficulty.mastered;
      case 'failed':
        return Difficulty.failed;
      default:
        return Difficulty.newWord;
    }
  }

  static String _difficultyToString(Difficulty difficulty) {
    switch (difficulty) {
      case Difficulty.newWord:
        return 'new';
      case Difficulty.learning:
        return 'learning';
      case Difficulty.review:
        return 'review';
      case Difficulty.mastered:
        return 'mastered';
      case Difficulty.failed:
        return 'failed';
    }
  }

  double get accuracy =>
      reviewCount > 0 ? correctCount / reviewCount : 0.0;

  String get displayWord =>
      article != null ? '$article $word' : word;
}
