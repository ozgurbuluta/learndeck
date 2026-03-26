import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/word.dart';
import '../providers/words_provider.dart';
import '../providers/user_preferences_provider.dart';
import '../providers/user_activity_provider.dart';
import '../services/tts_service.dart';
import '../theme/app_theme.dart';

/// Listen and Choose exercise - hear a word and pick the correct translation
class ListeningExerciseScreen extends ConsumerStatefulWidget {
  const ListeningExerciseScreen({super.key});

  @override
  ConsumerState<ListeningExerciseScreen> createState() =>
      _ListeningExerciseScreenState();
}

class _ListeningExerciseScreenState
    extends ConsumerState<ListeningExerciseScreen> {
  List<Word> _exerciseWords = [];
  int _currentIndex = 0;
  int _correctCount = 0;
  int _incorrectCount = 0;
  bool _isComplete = false;
  bool _hasAnswered = false;
  int? _selectedAnswer;
  List<String> _currentOptions = [];
  final _random = Random();

  @override
  void initState() {
    super.initState();
    Future.microtask(_initializeExercise);
  }

  void _initializeExercise() {
    final wordsState = ref.read(wordsProvider);
    wordsState.whenData((words) {
      if (words.length < 4) {
        // Need at least 4 words for the exercise
        return;
      }

      final shuffled = List<Word>.from(words)..shuffle(_random);
      setState(() {
        _exerciseWords = shuffled.take(10).toList();
        _currentIndex = 0;
        _correctCount = 0;
        _incorrectCount = 0;
        _isComplete = false;
        _hasAnswered = false;
        _selectedAnswer = null;
        _generateOptions();
      });

      // Auto-play the first word
      Future.delayed(const Duration(milliseconds: 500), _speakCurrentWord);
    });
  }

  void _generateOptions() {
    if (_currentIndex >= _exerciseWords.length) return;

    final currentWord = _exerciseWords[_currentIndex];
    final allWords = ref.read(wordsProvider).valueOrNull ?? [];

    // Get 3 wrong answers
    final wrongAnswers = allWords
        .where((w) => w.id != currentWord.id)
        .map((w) => w.definition)
        .toList()
      ..shuffle(_random);

    final options = [
      currentWord.definition,
      ...wrongAnswers.take(3),
    ]..shuffle(_random);

    setState(() {
      _currentOptions = options;
    });
  }

  Future<void> _speakCurrentWord() async {
    if (_currentIndex >= _exerciseWords.length) return;

    final prefs = ref.read(userPreferencesProvider).valueOrNull;
    final language = prefs?.targetLanguage ?? 'German';
    final word = _exerciseWords[_currentIndex];

    await TTSService.speak(word.word, language: language);
  }

  void _selectAnswer(int index) {
    if (_hasAnswered) return;

    final currentWord = _exerciseWords[_currentIndex];
    final isCorrect = _currentOptions[index] == currentWord.definition;

    setState(() {
      _selectedAnswer = index;
      _hasAnswered = true;
      if (isCorrect) {
        _correctCount++;
      } else {
        _incorrectCount++;
      }
    });

    // Update word statistics
    ref.read(wordsProvider.notifier).updateAfterReview(currentWord.id, isCorrect);
  }

  void _nextQuestion() {
    if (_currentIndex >= _exerciseWords.length - 1) {
      setState(() {
        _isComplete = true;
      });
      // Record activity for streak
      ref.read(userActivityProvider.notifier).recordReviewCompleted();
    } else {
      setState(() {
        _currentIndex++;
        _hasAnswered = false;
        _selectedAnswer = null;
        _generateOptions();
      });

      // Auto-play next word
      Future.delayed(const Duration(milliseconds: 300), _speakCurrentWord);
    }
  }

  @override
  void dispose() {
    TTSService.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final wordsState = ref.watch(wordsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        leading: IconButton(
          icon: Icon(Icons.close_rounded, color: AppColors.textPrimary),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          _exerciseWords.isEmpty
              ? 'Listen & Choose'
              : '${_currentIndex + 1} / ${_exerciseWords.length}',
          style: AppTextStyles.h4,
        ),
        centerTitle: true,
      ),
      body: wordsState.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (words) {
          if (words.length < 4) {
            return _buildNotEnoughWords();
          }
          if (_isComplete) {
            return _buildCompletionScreen();
          }
          if (_exerciseWords.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }
          return _buildExercise();
        },
      ),
    );
  }

  Widget _buildNotEnoughWords() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xxxl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.library_books_outlined,
              size: 80,
              color: AppColors.textTertiary,
            ),
            const SizedBox(height: AppSpacing.xl),
            Text(
              'Need More Words',
              style: AppTextStyles.h3,
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              'Add at least 4 words to your library to start listening exercises.',
              style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.xl),
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Go Back'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildExercise() {
    final currentWord = _exerciseWords[_currentIndex];

    return SafeArea(
      child: Column(
        children: [
          // Progress bar
          Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.xl,
              vertical: AppSpacing.md,
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(AppRadius.sm),
              child: LinearProgressIndicator(
                value: (_currentIndex + 1) / _exerciseWords.length,
                backgroundColor: AppColors.border,
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                minHeight: 8,
              ),
            ),
          ),

          // Score display
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildScoreChip(
                    Icons.check_circle_rounded, _correctCount, AppColors.success),
                const SizedBox(width: AppSpacing.xl),
                _buildScoreChip(
                    Icons.cancel_rounded, _incorrectCount, AppColors.error),
              ],
            ),
          ),

          const Spacer(),

          // Listen prompt
          Text(
            'Listen and choose the correct meaning',
            style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: AppSpacing.xl),

          // Play button
          GestureDetector(
            onTap: _speakCurrentWord,
            child: Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.primary, width: 3),
              ),
              child: Icon(
                Icons.volume_up_rounded,
                size: 56,
                color: AppColors.primary,
              ),
            ),
          ),

          const SizedBox(height: AppSpacing.md),

          // Slow play button
          TextButton.icon(
            onPressed: () async {
              final prefs = ref.read(userPreferencesProvider).valueOrNull;
              final language = prefs?.targetLanguage ?? 'German';
              await TTSService.speakSlow(currentWord.word, language: language);
            },
            icon: Icon(Icons.slow_motion_video_rounded, size: 18),
            label: const Text('Play slowly'),
            style: TextButton.styleFrom(
              foregroundColor: AppColors.textSecondary,
            ),
          ),

          const SizedBox(height: AppSpacing.xxl),

          // Answer options
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
            child: Column(
              children: _currentOptions.asMap().entries.map((entry) {
                final index = entry.key;
                final option = entry.value;
                return _buildOptionButton(index, option, currentWord.definition);
              }).toList(),
            ),
          ),

          const Spacer(),

          // Next button (shown after answering)
          if (_hasAnswered)
            Padding(
              padding: const EdgeInsets.all(AppSpacing.xl),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _nextQuestion,
                  child: Text(_currentIndex >= _exerciseWords.length - 1
                      ? 'See Results'
                      : 'Next'),
                ),
              ),
            )
          else
            const SizedBox(height: 80), // Placeholder for button height
        ],
      ),
    );
  }

  Widget _buildOptionButton(int index, String option, String correctAnswer) {
    final isSelected = _selectedAnswer == index;
    final isCorrect = option == correctAnswer;
    final showResult = _hasAnswered;

    Color backgroundColor = AppColors.surface;
    Color borderColor = AppColors.border;
    Color textColor = AppColors.textPrimary;

    if (showResult) {
      if (isCorrect) {
        backgroundColor = AppColors.success.withValues(alpha: 0.1);
        borderColor = AppColors.success;
        textColor = AppColors.success;
      } else if (isSelected && !isCorrect) {
        backgroundColor = AppColors.error.withValues(alpha: 0.1);
        borderColor = AppColors.error;
        textColor = AppColors.error;
      }
    } else if (isSelected) {
      backgroundColor = AppColors.primary.withValues(alpha: 0.1);
      borderColor = AppColors.primary;
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: GestureDetector(
        onTap: () => _selectAnswer(index),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(AppSpacing.lg),
          decoration: BoxDecoration(
            color: backgroundColor,
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(color: borderColor, width: 2),
          ),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  option,
                  style: AppTextStyles.body.copyWith(color: textColor),
                ),
              ),
              if (showResult && isCorrect)
                Icon(Icons.check_circle_rounded, color: AppColors.success),
              if (showResult && isSelected && !isCorrect)
                Icon(Icons.cancel_rounded, color: AppColors.error),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildScoreChip(IconData icon, int count, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(AppRadius.full),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(width: AppSpacing.sm),
          Text(
            '$count',
            style: AppTextStyles.bodyLarge.copyWith(
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCompletionScreen() {
    final total = _correctCount + _incorrectCount;
    final percentage = total > 0 ? (_correctCount / total * 100).round() : 0;

    return SafeArea(
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.xxxl),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                percentage >= 70
                    ? Icons.celebration_rounded
                    : Icons.sentiment_satisfied_rounded,
                size: 80,
                color: AppColors.primary,
              ),
              const SizedBox(height: AppSpacing.xxxl),
              Text(
                'Listening Complete!',
                style: AppTextStyles.h1,
              ),
              const SizedBox(height: AppSpacing.xl),
              Text(
                '$percentage%',
                style: TextStyle(
                  fontSize: 64,
                  fontWeight: FontWeight.bold,
                  color: percentage >= 70 ? AppColors.success : AppColors.warning,
                ),
              ),
              Text(
                'accuracy',
                style: AppTextStyles.label.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: AppSpacing.xxxl),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _buildResultCard('Correct', _correctCount, AppColors.success),
                  const SizedBox(width: AppSpacing.xl),
                  _buildResultCard('Wrong', _incorrectCount, AppColors.error),
                ],
              ),
              const SizedBox(height: AppSpacing.xxxl * 2),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    setState(() {
                      _initializeExercise();
                    });
                  },
                  child: const Text('Practice Again'),
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Done'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildResultCard(String label, int value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.xxl,
        vertical: AppSpacing.lg,
      ),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        children: [
          Text(
            '$value',
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          Text(
            label,
            style: AppTextStyles.labelSmall.copyWith(
              color: color.withValues(alpha: 0.8),
            ),
          ),
        ],
      ),
    );
  }
}
