class UserPreferences {
  final String? userId;
  final String targetLanguage;
  final List<String> useCases;
  final List<String> categories;
  final String level;
  final int? quizScore;
  final bool onboardingCompleted;
  final DateTime? createdAt;

  UserPreferences({
    this.userId,
    this.targetLanguage = 'German',
    this.useCases = const [],
    this.categories = const [],
    this.level = 'beginner',
    this.quizScore,
    this.onboardingCompleted = false,
    this.createdAt,
  });

  factory UserPreferences.fromJson(Map<String, dynamic> json) {
    return UserPreferences(
      userId: json['user_id'],
      targetLanguage: json['target_language'] ?? 'German',
      useCases: List<String>.from(json['use_cases'] ?? []),
      categories: List<String>.from(json['categories'] ?? []),
      level: json['level'] ?? 'beginner',
      quizScore: json['quiz_score'],
      onboardingCompleted: json['onboarding_completed'] ?? false,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'target_language': targetLanguage,
      'use_cases': useCases,
      'categories': categories,
      'level': level,
      'quiz_score': quizScore,
      'onboarding_completed': onboardingCompleted,
      'created_at': createdAt?.toIso8601String(),
    };
  }

  UserPreferences copyWith({
    String? userId,
    String? targetLanguage,
    List<String>? useCases,
    List<String>? categories,
    String? level,
    int? quizScore,
    bool? onboardingCompleted,
    DateTime? createdAt,
  }) {
    return UserPreferences(
      userId: userId ?? this.userId,
      targetLanguage: targetLanguage ?? this.targetLanguage,
      useCases: useCases ?? this.useCases,
      categories: categories ?? this.categories,
      level: level ?? this.level,
      quizScore: quizScore ?? this.quizScore,
      onboardingCompleted: onboardingCompleted ?? this.onboardingCompleted,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  String get levelDescription {
    switch (level) {
      case 'beginner':
        return 'Beginner (A1-A2)';
      case 'intermediate':
        return 'Intermediate (B1-B2)';
      case 'advanced':
        return 'Advanced (C1-C2)';
      default:
        return 'Beginner (A1-A2)';
    }
  }
}

class UseCaseOption {
  final String id;
  final String title;
  final String description;
  final String icon;

  const UseCaseOption({
    required this.id,
    required this.title,
    required this.description,
    required this.icon,
  });

  static const List<UseCaseOption> options = [
    UseCaseOption(
      id: 'work',
      title: 'Work & Career',
      description: 'Business meetings, emails, presentations',
      icon: 'work',
    ),
    UseCaseOption(
      id: 'daily',
      title: 'Daily Life',
      description: 'Shopping, restaurants, social situations',
      icon: 'home',
    ),
    UseCaseOption(
      id: 'travel',
      title: 'Travel',
      description: 'Navigation, hotels, transportation',
      icon: 'flight',
    ),
    UseCaseOption(
      id: 'study',
      title: 'Academic Study',
      description: 'Exams, university, formal language',
      icon: 'school',
    ),
  ];
}

class CategoryOption {
  final String id;
  final String title;
  final String icon;

  const CategoryOption({
    required this.id,
    required this.title,
    required this.icon,
  });

  static const List<CategoryOption> options = [
    CategoryOption(id: 'food', title: 'Food & Dining', icon: 'restaurant'),
    CategoryOption(id: 'business', title: 'Business', icon: 'business'),
    CategoryOption(id: 'travel', title: 'Travel', icon: 'explore'),
    CategoryOption(id: 'health', title: 'Health', icon: 'medical_services'),
    CategoryOption(id: 'technology', title: 'Technology', icon: 'computer'),
    CategoryOption(id: 'culture', title: 'Culture & Arts', icon: 'palette'),
    CategoryOption(id: 'sports', title: 'Sports', icon: 'sports_soccer'),
    CategoryOption(id: 'nature', title: 'Nature', icon: 'park'),
    CategoryOption(id: 'family', title: 'Family & Home', icon: 'family_restroom'),
    CategoryOption(id: 'shopping', title: 'Shopping', icon: 'shopping_bag'),
    CategoryOption(id: 'emotions', title: 'Emotions', icon: 'mood'),
    CategoryOption(id: 'numbers', title: 'Numbers & Time', icon: 'schedule'),
  ];
}

class QuizQuestion {
  final String question;
  final List<String> options;
  final int correctIndex;
  final String difficulty; // beginner, intermediate, advanced

  const QuizQuestion({
    required this.question,
    required this.options,
    required this.correctIndex,
    required this.difficulty,
  });

  static const List<QuizQuestion> germanQuiz = [
    // Beginner questions (A1-A2)
    QuizQuestion(
      question: 'What does "Guten Tag" mean?',
      options: ['Good night', 'Good day', 'Goodbye', 'Good morning'],
      correctIndex: 1,
      difficulty: 'beginner',
    ),
    QuizQuestion(
      question: 'How do you say "thank you" in German?',
      options: ['Bitte', 'Danke', 'Hallo', 'Tschüss'],
      correctIndex: 1,
      difficulty: 'beginner',
    ),
    QuizQuestion(
      question: 'What is "der Apfel"?',
      options: ['The orange', 'The banana', 'The apple', 'The grape'],
      correctIndex: 2,
      difficulty: 'beginner',
    ),
    QuizQuestion(
      question: '"Ich bin müde" means:',
      options: ['I am hungry', 'I am tired', 'I am happy', 'I am thirsty'],
      correctIndex: 1,
      difficulty: 'beginner',
    ),
    // Intermediate questions (B1-B2)
    QuizQuestion(
      question: 'Complete: "Wenn ich Zeit ___, würde ich reisen."',
      options: ['habe', 'hätte', 'hatte', 'haben'],
      correctIndex: 1,
      difficulty: 'intermediate',
    ),
    QuizQuestion(
      question: 'What does "allerdings" mean?',
      options: ['Always', 'However', 'Never', 'Sometimes'],
      correctIndex: 1,
      difficulty: 'intermediate',
    ),
    QuizQuestion(
      question: '"Er hat das Buch gelesen" is in which tense?',
      options: ['Present', 'Past Perfect', 'Simple Past', 'Future'],
      correctIndex: 1,
      difficulty: 'intermediate',
    ),
    // Advanced questions (C1-C2)
    QuizQuestion(
      question: 'What does "infolgedessen" mean?',
      options: ['In spite of', 'Consequently', 'Meanwhile', 'Nevertheless'],
      correctIndex: 1,
      difficulty: 'advanced',
    ),
    QuizQuestion(
      question: '"Die Verhandlungen scheiterten" means:',
      options: [
        'The negotiations succeeded',
        'The negotiations failed',
        'The negotiations continued',
        'The negotiations started'
      ],
      correctIndex: 1,
      difficulty: 'advanced',
    ),
    QuizQuestion(
      question: 'Which is the correct Konjunktiv II form of "sein"?',
      options: ['sei', 'wäre', 'würde sein', 'ist'],
      correctIndex: 1,
      difficulty: 'advanced',
    ),
  ];
}
