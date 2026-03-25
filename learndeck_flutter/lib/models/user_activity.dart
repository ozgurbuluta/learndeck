class UserActivity {
  final String? userId;
  final DateTime? lastActivityDate;
  final int currentStreak;
  final int longestStreak;
  final int totalWordsLearned;
  final int totalReviewSessions;
  final DateTime? createdAt;

  UserActivity({
    this.userId,
    this.lastActivityDate,
    this.currentStreak = 0,
    this.longestStreak = 0,
    this.totalWordsLearned = 0,
    this.totalReviewSessions = 0,
    this.createdAt,
  });

  factory UserActivity.fromJson(Map<String, dynamic> json) {
    return UserActivity(
      userId: json['user_id'],
      lastActivityDate: json['last_activity_date'] != null
          ? DateTime.parse(json['last_activity_date'])
          : null,
      currentStreak: json['current_streak'] ?? 0,
      longestStreak: json['longest_streak'] ?? 0,
      totalWordsLearned: json['total_words_learned'] ?? 0,
      totalReviewSessions: json['total_review_sessions'] ?? 0,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'last_activity_date': lastActivityDate?.toIso8601String(),
      'current_streak': currentStreak,
      'longest_streak': longestStreak,
      'total_words_learned': totalWordsLearned,
      'total_review_sessions': totalReviewSessions,
      'created_at': createdAt?.toIso8601String(),
    };
  }

  UserActivity copyWith({
    String? userId,
    DateTime? lastActivityDate,
    int? currentStreak,
    int? longestStreak,
    int? totalWordsLearned,
    int? totalReviewSessions,
    DateTime? createdAt,
  }) {
    return UserActivity(
      userId: userId ?? this.userId,
      lastActivityDate: lastActivityDate ?? this.lastActivityDate,
      currentStreak: currentStreak ?? this.currentStreak,
      longestStreak: longestStreak ?? this.longestStreak,
      totalWordsLearned: totalWordsLearned ?? this.totalWordsLearned,
      totalReviewSessions: totalReviewSessions ?? this.totalReviewSessions,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  /// Check if the user was active today
  bool get wasActiveToday {
    if (lastActivityDate == null) return false;
    final now = DateTime.now();
    return lastActivityDate!.year == now.year &&
        lastActivityDate!.month == now.month &&
        lastActivityDate!.day == now.day;
  }

  /// Check if the user was active yesterday (streak is still valid)
  bool get wasActiveYesterday {
    if (lastActivityDate == null) return false;
    final yesterday = DateTime.now().subtract(const Duration(days: 1));
    return lastActivityDate!.year == yesterday.year &&
        lastActivityDate!.month == yesterday.month &&
        lastActivityDate!.day == yesterday.day;
  }

  /// Calculate the effective current streak (accounting for missed days)
  int get effectiveStreak {
    if (wasActiveToday || wasActiveYesterday) {
      return currentStreak;
    }
    return 0; // Streak broken
  }
}
