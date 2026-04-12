import '../services/ai_service.dart';

/// Default vocabulary lists for each supported language and level.
/// These are used to instantly provide starter words without AI calls.
class DefaultVocabulary {
  /// Returns default words for the given language and level.
  /// [language] should be 'German', 'French', or 'English'
  /// [level] should be 'beginner', 'intermediate', or 'advanced'
  static List<ExtractedWord> getWords({
    required String language,
    required String level,
    int? limit,
  }) {
    final words = _vocabularyMap[language]?[level] ?? [];
    if (limit != null && limit < words.length) {
      return words.take(limit).toList();
    }
    return words;
  }

  /// Check if default vocabulary is available for a language
  static bool hasVocabulary(String language) {
    return _vocabularyMap.containsKey(language);
  }

  static const Map<String, Map<String, List<ExtractedWord>>> _vocabularyMap = {
    'German': _germanVocabulary,
    'French': _frenchVocabulary,
    'English': _englishVocabulary,
  };

  // ==========================================================================
  // GERMAN VOCABULARY
  // ==========================================================================

  static const Map<String, List<ExtractedWord>> _germanVocabulary = {
    'beginner': _germanBeginner,
    'intermediate': _germanIntermediate,
    'advanced': _germanAdvanced,
  };

  static const List<ExtractedWord> _germanBeginner = [
    ExtractedWord(word: 'Hallo', definition: 'Hello'),
    ExtractedWord(word: 'Tschüss', definition: 'Goodbye (informal)'),
    ExtractedWord(word: 'Danke', definition: 'Thank you'),
    ExtractedWord(word: 'Bitte', definition: 'Please / You\'re welcome'),
    ExtractedWord(word: 'Ja', definition: 'Yes'),
    ExtractedWord(word: 'Nein', definition: 'No'),
    ExtractedWord(word: 'das Wasser', definition: 'Water', article: 'das'),
    ExtractedWord(word: 'das Brot', definition: 'Bread', article: 'das'),
    ExtractedWord(word: 'der Apfel', definition: 'Apple', article: 'der'),
    ExtractedWord(word: 'die Milch', definition: 'Milk', article: 'die'),
    ExtractedWord(word: 'gut', definition: 'Good'),
    ExtractedWord(word: 'schlecht', definition: 'Bad'),
    ExtractedWord(word: 'groß', definition: 'Big / Tall'),
    ExtractedWord(word: 'klein', definition: 'Small / Short'),
    ExtractedWord(word: 'heute', definition: 'Today'),
    ExtractedWord(word: 'morgen', definition: 'Tomorrow'),
    ExtractedWord(word: 'essen', definition: 'To eat'),
    ExtractedWord(word: 'trinken', definition: 'To drink'),
    ExtractedWord(word: 'gehen', definition: 'To go / To walk'),
    ExtractedWord(word: 'kommen', definition: 'To come'),
  ];

  static const List<ExtractedWord> _germanIntermediate = [
    ExtractedWord(word: 'die Erfahrung', definition: 'Experience', article: 'die'),
    ExtractedWord(word: 'die Entwicklung', definition: 'Development', article: 'die'),
    ExtractedWord(word: 'die Entscheidung', definition: 'Decision', article: 'die'),
    ExtractedWord(word: 'die Möglichkeit', definition: 'Possibility', article: 'die'),
    ExtractedWord(word: 'die Verantwortung', definition: 'Responsibility', article: 'die'),
    ExtractedWord(word: 'der Zusammenhang', definition: 'Connection / Context', article: 'der'),
    ExtractedWord(word: 'der Vorschlag', definition: 'Suggestion / Proposal', article: 'der'),
    ExtractedWord(word: 'das Verhältnis', definition: 'Relationship / Ratio', article: 'das'),
    ExtractedWord(word: 'eigentlich', definition: 'Actually / Really'),
    ExtractedWord(word: 'allerdings', definition: 'However / Though'),
    ExtractedWord(word: 'trotzdem', definition: 'Nevertheless'),
    ExtractedWord(word: 'deshalb', definition: 'Therefore'),
    ExtractedWord(word: 'beeinflussen', definition: 'To influence'),
    ExtractedWord(word: 'berücksichtigen', definition: 'To consider / Take into account'),
    ExtractedWord(word: 'erreichen', definition: 'To achieve / To reach'),
    ExtractedWord(word: 'verbessern', definition: 'To improve'),
    ExtractedWord(word: 'unterstützen', definition: 'To support'),
    ExtractedWord(word: 'vergleichen', definition: 'To compare'),
    ExtractedWord(word: 'beschäftigen', definition: 'To occupy / To employ'),
    ExtractedWord(word: 'voraussichtlich', definition: 'Presumably / Expected'),
  ];

  static const List<ExtractedWord> _germanAdvanced = [
    ExtractedWord(word: 'die Auseinandersetzung', definition: 'Confrontation / Debate', article: 'die'),
    ExtractedWord(word: 'die Begeisterung', definition: 'Enthusiasm', article: 'die'),
    ExtractedWord(word: 'die Gegebenheit', definition: 'Circumstance / Given fact', article: 'die'),
    ExtractedWord(word: 'die Gewissheit', definition: 'Certainty', article: 'die'),
    ExtractedWord(word: 'die Nachhaltigkeit', definition: 'Sustainability', article: 'die'),
    ExtractedWord(word: 'der Sachverhalt', definition: 'State of affairs / Facts', article: 'der'),
    ExtractedWord(word: 'das Fingerspitzengefühl', definition: 'Tact / Sensitivity', article: 'das'),
    ExtractedWord(word: 'infolgedessen', definition: 'Consequently'),
    ExtractedWord(word: 'nichtsdestotrotz', definition: 'Nonetheless'),
    ExtractedWord(word: 'gewissermaßen', definition: 'To a certain extent'),
    ExtractedWord(word: 'bedauerlicherweise', definition: 'Regrettably'),
    ExtractedWord(word: 'beabsichtigen', definition: 'To intend'),
    ExtractedWord(word: 'hervorheben', definition: 'To emphasize / Highlight'),
    ExtractedWord(word: 'beanspruchen', definition: 'To claim / To demand'),
    ExtractedWord(word: 'bewerkstelligen', definition: 'To accomplish / Manage'),
    ExtractedWord(word: 'erörtern', definition: 'To discuss / Deliberate'),
    ExtractedWord(word: 'vereinbaren', definition: 'To agree upon / Arrange'),
    ExtractedWord(word: 'einräumen', definition: 'To concede / Admit'),
    ExtractedWord(word: 'ausgeprägt', definition: 'Pronounced / Distinct'),
    ExtractedWord(word: 'zweckdienlich', definition: 'Expedient / Useful'),
  ];

  // ==========================================================================
  // FRENCH VOCABULARY
  // ==========================================================================

  static const Map<String, List<ExtractedWord>> _frenchVocabulary = {
    'beginner': _frenchBeginner,
    'intermediate': _frenchIntermediate,
    'advanced': _frenchAdvanced,
  };

  static const List<ExtractedWord> _frenchBeginner = [
    ExtractedWord(word: 'bonjour', definition: 'Hello / Good day'),
    ExtractedWord(word: 'au revoir', definition: 'Goodbye'),
    ExtractedWord(word: 'merci', definition: 'Thank you'),
    ExtractedWord(word: 's\'il vous plaît', definition: 'Please (formal)'),
    ExtractedWord(word: 'oui', definition: 'Yes'),
    ExtractedWord(word: 'non', definition: 'No'),
    ExtractedWord(word: 'l\'eau', definition: 'Water', article: 'l\''),
    ExtractedWord(word: 'le pain', definition: 'Bread', article: 'le'),
    ExtractedWord(word: 'la pomme', definition: 'Apple', article: 'la'),
    ExtractedWord(word: 'le lait', definition: 'Milk', article: 'le'),
    ExtractedWord(word: 'bon', definition: 'Good'),
    ExtractedWord(word: 'mauvais', definition: 'Bad'),
    ExtractedWord(word: 'grand', definition: 'Big / Tall'),
    ExtractedWord(word: 'petit', definition: 'Small / Short'),
    ExtractedWord(word: 'aujourd\'hui', definition: 'Today'),
    ExtractedWord(word: 'demain', definition: 'Tomorrow'),
    ExtractedWord(word: 'manger', definition: 'To eat'),
    ExtractedWord(word: 'boire', definition: 'To drink'),
    ExtractedWord(word: 'aller', definition: 'To go'),
    ExtractedWord(word: 'venir', definition: 'To come'),
  ];

  static const List<ExtractedWord> _frenchIntermediate = [
    ExtractedWord(word: 'l\'expérience', definition: 'Experience', article: 'l\''),
    ExtractedWord(word: 'le développement', definition: 'Development', article: 'le'),
    ExtractedWord(word: 'la décision', definition: 'Decision', article: 'la'),
    ExtractedWord(word: 'la possibilité', definition: 'Possibility', article: 'la'),
    ExtractedWord(word: 'la responsabilité', definition: 'Responsibility', article: 'la'),
    ExtractedWord(word: 'le rapport', definition: 'Relationship / Report', article: 'le'),
    ExtractedWord(word: 'la suggestion', definition: 'Suggestion', article: 'la'),
    ExtractedWord(word: 'le comportement', definition: 'Behavior', article: 'le'),
    ExtractedWord(word: 'en fait', definition: 'Actually / In fact'),
    ExtractedWord(word: 'cependant', definition: 'However'),
    ExtractedWord(word: 'néanmoins', definition: 'Nevertheless'),
    ExtractedWord(word: 'donc', definition: 'Therefore'),
    ExtractedWord(word: 'influencer', definition: 'To influence'),
    ExtractedWord(word: 'considérer', definition: 'To consider'),
    ExtractedWord(word: 'atteindre', definition: 'To achieve / Reach'),
    ExtractedWord(word: 'améliorer', definition: 'To improve'),
    ExtractedWord(word: 'soutenir', definition: 'To support'),
    ExtractedWord(word: 'comparer', definition: 'To compare'),
    ExtractedWord(word: 's\'occuper de', definition: 'To deal with / Handle'),
    ExtractedWord(word: 'probablement', definition: 'Probably'),
  ];

  static const List<ExtractedWord> _frenchAdvanced = [
    ExtractedWord(word: 'la confrontation', definition: 'Confrontation', article: 'la'),
    ExtractedWord(word: 'l\'enthousiasme', definition: 'Enthusiasm', article: 'l\''),
    ExtractedWord(word: 'la circonstance', definition: 'Circumstance', article: 'la'),
    ExtractedWord(word: 'la certitude', definition: 'Certainty', article: 'la'),
    ExtractedWord(word: 'la durabilité', definition: 'Sustainability', article: 'la'),
    ExtractedWord(word: 'l\'état des lieux', definition: 'State of affairs', article: 'l\''),
    ExtractedWord(word: 'le doigté', definition: 'Tact / Finesse', article: 'le'),
    ExtractedWord(word: 'par conséquent', definition: 'Consequently'),
    ExtractedWord(word: 'toutefois', definition: 'However / Yet'),
    ExtractedWord(word: 'dans une certaine mesure', definition: 'To a certain extent'),
    ExtractedWord(word: 'malheureusement', definition: 'Unfortunately'),
    ExtractedWord(word: 'avoir l\'intention de', definition: 'To intend'),
    ExtractedWord(word: 'mettre en évidence', definition: 'To highlight'),
    ExtractedWord(word: 'revendiquer', definition: 'To claim'),
    ExtractedWord(word: 'accomplir', definition: 'To accomplish'),
    ExtractedWord(word: 'examiner', definition: 'To examine / Discuss'),
    ExtractedWord(word: 'convenir', definition: 'To agree / Be suitable'),
    ExtractedWord(word: 'admettre', definition: 'To admit'),
    ExtractedWord(word: 'prononcé', definition: 'Pronounced / Distinct'),
    ExtractedWord(word: 'approprié', definition: 'Appropriate / Suitable'),
  ];

  // ==========================================================================
  // ENGLISH VOCABULARY (for non-native English speakers learning English)
  // ==========================================================================

  static const Map<String, List<ExtractedWord>> _englishVocabulary = {
    'beginner': _englishBeginner,
    'intermediate': _englishIntermediate,
    'advanced': _englishAdvanced,
  };

  static const List<ExtractedWord> _englishBeginner = [
    ExtractedWord(word: 'hello', definition: 'A greeting used when meeting someone'),
    ExtractedWord(word: 'goodbye', definition: 'A farewell expression'),
    ExtractedWord(word: 'please', definition: 'A polite word used when asking'),
    ExtractedWord(word: 'thank you', definition: 'Expression of gratitude'),
    ExtractedWord(word: 'yes', definition: 'Affirmative response'),
    ExtractedWord(word: 'no', definition: 'Negative response'),
    ExtractedWord(word: 'water', definition: 'Clear liquid essential for life'),
    ExtractedWord(word: 'bread', definition: 'Baked food made from flour'),
    ExtractedWord(word: 'apple', definition: 'A round fruit, often red or green'),
    ExtractedWord(word: 'milk', definition: 'White liquid from cows'),
    ExtractedWord(word: 'good', definition: 'Of high quality; positive'),
    ExtractedWord(word: 'bad', definition: 'Of poor quality; negative'),
    ExtractedWord(word: 'big', definition: 'Large in size'),
    ExtractedWord(word: 'small', definition: 'Little in size'),
    ExtractedWord(word: 'today', definition: 'This current day'),
    ExtractedWord(word: 'tomorrow', definition: 'The day after today'),
    ExtractedWord(word: 'eat', definition: 'To consume food'),
    ExtractedWord(word: 'drink', definition: 'To consume liquid'),
    ExtractedWord(word: 'go', definition: 'To move or travel'),
    ExtractedWord(word: 'come', definition: 'To move toward'),
  ];

  static const List<ExtractedWord> _englishIntermediate = [
    ExtractedWord(word: 'experience', definition: 'Knowledge gained through doing something'),
    ExtractedWord(word: 'development', definition: 'Process of growth or advancement'),
    ExtractedWord(word: 'decision', definition: 'A choice made after consideration'),
    ExtractedWord(word: 'opportunity', definition: 'A favorable chance or occasion'),
    ExtractedWord(word: 'responsibility', definition: 'Duty to deal with something'),
    ExtractedWord(word: 'relationship', definition: 'Connection between people or things'),
    ExtractedWord(word: 'suggestion', definition: 'An idea proposed for consideration'),
    ExtractedWord(word: 'behavior', definition: 'The way someone acts'),
    ExtractedWord(word: 'actually', definition: 'In fact; really'),
    ExtractedWord(word: 'however', definition: 'But; nevertheless'),
    ExtractedWord(word: 'therefore', definition: 'For that reason; consequently'),
    ExtractedWord(word: 'although', definition: 'Despite the fact that'),
    ExtractedWord(word: 'influence', definition: 'To have an effect on'),
    ExtractedWord(word: 'consider', definition: 'To think carefully about'),
    ExtractedWord(word: 'achieve', definition: 'To accomplish or reach'),
    ExtractedWord(word: 'improve', definition: 'To make better'),
    ExtractedWord(word: 'support', definition: 'To help or encourage'),
    ExtractedWord(word: 'compare', definition: 'To examine similarities and differences'),
    ExtractedWord(word: 'require', definition: 'To need or demand'),
    ExtractedWord(word: 'probably', definition: 'Most likely'),
  ];

  static const List<ExtractedWord> _englishAdvanced = [
    ExtractedWord(word: 'confrontation', definition: 'A hostile meeting or argument'),
    ExtractedWord(word: 'enthusiasm', definition: 'Intense enjoyment or interest'),
    ExtractedWord(word: 'circumstance', definition: 'A condition or fact affecting a situation'),
    ExtractedWord(word: 'certainty', definition: 'The state of being completely sure'),
    ExtractedWord(word: 'sustainability', definition: 'Ability to maintain at a steady level'),
    ExtractedWord(word: 'comprehensive', definition: 'Including all elements; thorough'),
    ExtractedWord(word: 'nuance', definition: 'Subtle difference in meaning'),
    ExtractedWord(word: 'consequently', definition: 'As a result; therefore'),
    ExtractedWord(word: 'nonetheless', definition: 'In spite of that; nevertheless'),
    ExtractedWord(word: 'albeit', definition: 'Although; even though'),
    ExtractedWord(word: 'regrettably', definition: 'Unfortunately; with regret'),
    ExtractedWord(word: 'intend', definition: 'To have as a plan or purpose'),
    ExtractedWord(word: 'emphasize', definition: 'To give special importance to'),
    ExtractedWord(word: 'assert', definition: 'To state firmly and confidently'),
    ExtractedWord(word: 'accomplish', definition: 'To achieve or complete successfully'),
    ExtractedWord(word: 'deliberate', definition: 'To think about carefully'),
    ExtractedWord(word: 'concede', definition: 'To admit something is true'),
    ExtractedWord(word: 'acknowledge', definition: 'To accept or recognize'),
    ExtractedWord(word: 'profound', definition: 'Very deep or intense'),
    ExtractedWord(word: 'expedient', definition: 'Convenient and practical'),
  ];
}
