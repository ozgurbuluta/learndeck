class UserPreferences {
  final String? userId;
  final String targetLanguage;
  final String nativeLanguage;
  final List<String> useCases;
  final List<String> categories;
  final String level;
  final int? quizScore;
  final int dailyGoal;
  final bool onboardingCompleted;
  final DateTime? createdAt;

  UserPreferences({
    this.userId,
    this.targetLanguage = 'German',
    this.nativeLanguage = 'English',
    this.useCases = const [],
    this.categories = const [],
    this.level = 'beginner',
    this.quizScore,
    this.dailyGoal = 5,
    this.onboardingCompleted = false,
    this.createdAt,
  });

  factory UserPreferences.fromJson(Map<String, dynamic> json) {
    return UserPreferences(
      userId: json['user_id'],
      targetLanguage: json['target_language'] ?? 'German',
      nativeLanguage: json['native_language'] ?? 'English',
      useCases: List<String>.from(json['use_cases'] ?? []),
      categories: List<String>.from(json['categories'] ?? []),
      level: json['level'] ?? 'beginner',
      quizScore: json['quiz_score'],
      dailyGoal: json['daily_goal'] ?? 5,
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
      'native_language': nativeLanguage,
      'use_cases': useCases,
      'categories': categories,
      'level': level,
      'quiz_score': quizScore,
      'daily_goal': dailyGoal,
      'onboarding_completed': onboardingCompleted,
      'created_at': createdAt?.toIso8601String(),
    };
  }

  UserPreferences copyWith({
    String? userId,
    String? targetLanguage,
    String? nativeLanguage,
    List<String>? useCases,
    List<String>? categories,
    String? level,
    int? quizScore,
    int? dailyGoal,
    bool? onboardingCompleted,
    DateTime? createdAt,
  }) {
    return UserPreferences(
      userId: userId ?? this.userId,
      targetLanguage: targetLanguage ?? this.targetLanguage,
      nativeLanguage: nativeLanguage ?? this.nativeLanguage,
      useCases: useCases ?? this.useCases,
      categories: categories ?? this.categories,
      level: level ?? this.level,
      quizScore: quizScore ?? this.quizScore,
      dailyGoal: dailyGoal ?? this.dailyGoal,
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

  static List<QuizQuestion> getQuizForLanguage(String language) {
    switch (language) {
      case 'German':
        return germanQuiz;
      case 'Spanish':
        return spanishQuiz;
      case 'French':
        return frenchQuiz;
      default:
        return germanQuiz;
    }
  }

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

  static const List<QuizQuestion> spanishQuiz = [
    // Beginner questions (A1-A2)
    QuizQuestion(
      question: 'What does "Buenos días" mean?',
      options: ['Good night', 'Good morning', 'Goodbye', 'Good evening'],
      correctIndex: 1,
      difficulty: 'beginner',
    ),
    QuizQuestion(
      question: 'How do you say "please" in Spanish?',
      options: ['Gracias', 'Por favor', 'De nada', 'Hola'],
      correctIndex: 1,
      difficulty: 'beginner',
    ),
    QuizQuestion(
      question: 'What is "el gato"?',
      options: ['The dog', 'The bird', 'The cat', 'The fish'],
      correctIndex: 2,
      difficulty: 'beginner',
    ),
    QuizQuestion(
      question: '"Tengo hambre" means:',
      options: ['I am tired', 'I am hungry', 'I am happy', 'I am cold'],
      correctIndex: 1,
      difficulty: 'beginner',
    ),
    // Intermediate questions (B1-B2)
    QuizQuestion(
      question: 'Complete: "Si ___ más dinero, viajaría."',
      options: ['tengo', 'tuviera', 'tenía', 'tendré'],
      correctIndex: 1,
      difficulty: 'intermediate',
    ),
    QuizQuestion(
      question: 'What does "sin embargo" mean?',
      options: ['Always', 'However', 'Never', 'Therefore'],
      correctIndex: 1,
      difficulty: 'intermediate',
    ),
    QuizQuestion(
      question: '"He comido" is in which tense?',
      options: ['Present', 'Present Perfect', 'Simple Past', 'Future'],
      correctIndex: 1,
      difficulty: 'intermediate',
    ),
    // Advanced questions (C1-C2)
    QuizQuestion(
      question: 'What does "no obstante" mean?',
      options: ['In spite of', 'Nevertheless', 'Meanwhile', 'Therefore'],
      correctIndex: 1,
      difficulty: 'advanced',
    ),
    QuizQuestion(
      question: '"Las negociaciones fracasaron" means:',
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
      question: 'Which is the correct subjunctive form of "ir" (yo)?',
      options: ['voy', 'vaya', 'iré', 'iba'],
      correctIndex: 1,
      difficulty: 'advanced',
    ),
  ];

  static const List<QuizQuestion> frenchQuiz = [
    // Beginner questions (A1-A2)
    QuizQuestion(
      question: 'What does "Bonjour" mean?',
      options: ['Good night', 'Hello/Good day', 'Goodbye', 'Good evening'],
      correctIndex: 1,
      difficulty: 'beginner',
    ),
    QuizQuestion(
      question: 'How do you say "thank you" in French?',
      options: ['S\'il vous plaît', 'Merci', 'Bonjour', 'Au revoir'],
      correctIndex: 1,
      difficulty: 'beginner',
    ),
    QuizQuestion(
      question: 'What is "le chat"?',
      options: ['The dog', 'The bird', 'The cat', 'The fish'],
      correctIndex: 2,
      difficulty: 'beginner',
    ),
    QuizQuestion(
      question: '"J\'ai faim" means:',
      options: ['I am tired', 'I am hungry', 'I am happy', 'I am cold'],
      correctIndex: 1,
      difficulty: 'beginner',
    ),
    // Intermediate questions (B1-B2)
    QuizQuestion(
      question: 'Complete: "Si j\'___ plus d\'argent, je voyagerais."',
      options: ['ai', 'avais', 'aurai', 'aurais'],
      correctIndex: 1,
      difficulty: 'intermediate',
    ),
    QuizQuestion(
      question: 'What does "cependant" mean?',
      options: ['Always', 'However', 'Never', 'Therefore'],
      correctIndex: 1,
      difficulty: 'intermediate',
    ),
    QuizQuestion(
      question: '"J\'ai mangé" is in which tense?',
      options: ['Present', 'Passé Composé', 'Imparfait', 'Future'],
      correctIndex: 1,
      difficulty: 'intermediate',
    ),
    // Advanced questions (C1-C2)
    QuizQuestion(
      question: 'What does "néanmoins" mean?',
      options: ['In spite of', 'Nevertheless', 'Meanwhile', 'Therefore'],
      correctIndex: 1,
      difficulty: 'advanced',
    ),
    QuizQuestion(
      question: '"Les négociations ont échoué" means:',
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
      question: 'Which is the correct subjunctive form of "être" (je)?',
      options: ['suis', 'sois', 'serai', 'étais'],
      correctIndex: 1,
      difficulty: 'advanced',
    ),
  ];
}

class LanguageOption {
  final String code;
  final String name;
  final String nativeName;
  final String flag;

  const LanguageOption({
    required this.code,
    required this.name,
    required this.nativeName,
    required this.flag,
  });

  static const List<LanguageOption> targetLanguages = [
    LanguageOption(code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪'),
    LanguageOption(code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸'),
    LanguageOption(code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷'),
    LanguageOption(code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹'),
    LanguageOption(code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹'),
    LanguageOption(code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱'),
    LanguageOption(code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵'),
    LanguageOption(code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷'),
    LanguageOption(code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳'),
  ];

  static const List<LanguageOption> nativeLanguages = [
    LanguageOption(code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧'),
    LanguageOption(code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪'),
    LanguageOption(code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸'),
    LanguageOption(code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷'),
    LanguageOption(code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷'),
    LanguageOption(code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹'),
    LanguageOption(code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹'),
    LanguageOption(code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺'),
    LanguageOption(code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦'),
    LanguageOption(code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵'),
    LanguageOption(code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳'),
  ];
}

class DailyGoalOption {
  final int words;
  final String title;
  final String description;
  final String icon;

  const DailyGoalOption({
    required this.words,
    required this.title,
    required this.description,
    required this.icon,
  });

  static const List<DailyGoalOption> options = [
    DailyGoalOption(
      words: 3,
      title: 'Casual',
      description: '3 words/day • ~5 min',
      icon: 'walk',
    ),
    DailyGoalOption(
      words: 5,
      title: 'Regular',
      description: '5 words/day • ~10 min',
      icon: 'directions_run',
    ),
    DailyGoalOption(
      words: 10,
      title: 'Serious',
      description: '10 words/day • ~15 min',
      icon: 'fitness_center',
    ),
    DailyGoalOption(
      words: 20,
      title: 'Intense',
      description: '20 words/day • ~30 min',
      icon: 'local_fire_department',
    ),
  ];
}
