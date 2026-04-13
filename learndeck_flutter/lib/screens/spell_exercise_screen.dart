import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/word.dart';
import '../providers/words_provider.dart';
import '../providers/user_preferences_provider.dart';
import '../providers/user_activity_provider.dart';
import '../services/tts_service.dart';
import '../theme/app_theme.dart';

/// Listen and Spell exercise - hear a word and type it
class SpellExerciseScreen extends ConsumerStatefulWidget {
  const SpellExerciseScreen({super.key});

  @override
  ConsumerState<SpellExerciseScreen> createState() => _SpellExerciseScreenState();
}

class _SpellExerciseScreenState extends ConsumerState<SpellExerciseScreen> {
  final _textController = TextEditingController();
  final _focusNode = FocusNode();
  List<Word> _exerciseWords = [];
  int _currentIndex = 0;
  int _correctCount = 0;
  int _incorrectCount = 0;
  bool _isComplete = false;
  bool _hasAnswered = false;
  bool _isCorrect = false;
  final _random = Random();

  @override
  void initState() {
    super.initState();
    Future.microtask(_initializeExercise);
  }

  void _initializeExercise() {
    final wordsState = ref.read(wordsProvider);
    wordsState.whenData((words) {
      if (words.isEmpty) return;

      final shuffled = List<Word>.from(words)..shuffle(_random);
      setState(() {
        _exerciseWords = shuffled.take(10).toList();
        _currentIndex = 0;
        _correctCount = 0;
        _incorrectCount = 0;
        _isComplete = false;
        _hasAnswered = false;
        _isCorrect = false;
        _textController.clear();
      });

      // Auto-play the first word
      Future.delayed(const Duration(milliseconds: 500), () {
        _speakCurrentWord();
        _focusNode.requestFocus();
      });
    });
  }

  Future<void> _speakCurrentWord() async {
    if (_currentIndex >= _exerciseWords.length) return;

    final prefs = ref.read(userPreferencesProvider).valueOrNull;
    final language = prefs?.targetLanguage ?? 'German';
    final word = _exerciseWords[_currentIndex];

    await TTSService.speak(word.word, language: language);
  }

  void _checkAnswer() {
    if (_hasAnswered) return;

    final currentWord = _exerciseWords[_currentIndex];
    final userInput = _textController.text.trim().toLowerCase();
    final correctAnswer = currentWord.word.toLowerCase();

    // Check for exact match or match without article
    final isCorrect = userInput == correctAnswer ||
        userInput == currentWord.displayWord.toLowerCase();

    setState(() {
      _hasAnswered = true;
      _isCorrect = isCorrect;
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
        _isCorrect = false;
        _textController.clear();
      });

      // Auto-play next word
      Future.delayed(const Duration(milliseconds: 300), () {
        _speakCurrentWord();
        _focusNode.requestFocus();
      });
    }
  }

  void _showHint() {
    final word = _exerciseWords[_currentIndex];
    final hint = _generateHint(word.word);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Hint: $hint'),
        duration: const Duration(seconds: 3),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  String _generateHint(String word) {
    if (word.length <= 2) return word[0] + '_';

    final visibleCount = (word.length / 3).ceil();
    final chars = word.split('');

    for (int i = visibleCount; i < chars.length; i++) {
      if (chars[i] != ' ') {
        chars[i] = '_';
      }
    }

    return chars.join();
  }

  @override
  void dispose() {
    _textController.dispose();
    _focusNode.dispose();
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
              ? 'Listen & Spell'
              : '${_currentIndex + 1} / ${_exerciseWords.length}',
          style: AppTextStyles.h4,
        ),
        centerTitle: true,
      ),
      body: wordsState.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (words) {
          if (words.isEmpty) {
            return _buildNoWords();
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

  Widget _buildNoWords() {
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
              'No Words Yet',
              style: AppTextStyles.h3,
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              'Add some words to your library first.',
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
            'Type what you hear',
            style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: AppSpacing.xl),

          // Play button
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              GestureDetector(
                onTap: _speakCurrentWord,
                child: Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.primary, width: 3),
                  ),
                  child: Icon(
                    Icons.volume_up_rounded,
                    size: 48,
                    color: AppColors.primary,
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.lg),
              Column(
                children: [
                  IconButton(
                    onPressed: () async {
                      final prefs = ref.read(userPreferencesProvider).valueOrNull;
                      final language = prefs?.targetLanguage ?? 'German';
                      await TTSService.speakSlow(currentWord.word, language: language);
                    },
                    icon: Icon(Icons.slow_motion_video_rounded),
                    tooltip: 'Play slowly',
                    style: IconButton.styleFrom(
                      backgroundColor: AppColors.surfaceVariant,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  if (!_hasAnswered)
                    IconButton(
                      onPressed: _showHint,
                      icon: Icon(Icons.lightbulb_outline_rounded),
                      tooltip: 'Show hint',
                      style: IconButton.styleFrom(
                        backgroundColor: AppColors.surfaceVariant,
                      ),
                    ),
                ],
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.xxl),

          // Text input
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
            child: TextField(
              controller: _textController,
              focusNode: _focusNode,
              enabled: !_hasAnswered,
              textAlign: TextAlign.center,
              style: AppTextStyles.h3,
              decoration: InputDecoration(
                hintText: 'Type the word...',
                filled: true,
                fillColor: _hasAnswered
                    ? (_isCorrect
                        ? AppColors.success.withValues(alpha: 0.1)
                        : AppColors.error.withValues(alpha: 0.1))
                    : AppColors.surface,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  borderSide: BorderSide(
                    color: _hasAnswered
                        ? (_isCorrect ? AppColors.success : AppColors.error)
                        : AppColors.border,
                    width: 2,
                  ),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  borderSide: BorderSide(color: AppColors.border, width: 2),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  borderSide: BorderSide(color: AppColors.primary, width: 2),
                ),
                disabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  borderSide: BorderSide(
                    color: _isCorrect ? AppColors.success : AppColors.error,
                    width: 2,
                  ),
                ),
              ),
              onSubmitted: (_) {
                if (!_hasAnswered) {
                  _checkAnswer();
                }
              },
            ),
          ),

          // Feedback
          if (_hasAnswered) ...[
            const SizedBox(height: AppSpacing.lg),
            if (_isCorrect)
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.check_circle_rounded, color: AppColors.success),
                  const SizedBox(width: AppSpacing.sm),
                  Text(
                    'Correct!',
                    style: AppTextStyles.bodyLarge.copyWith(
                      color: AppColors.success,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              )
            else
              Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.cancel_rounded, color: AppColors.error),
                      const SizedBox(width: AppSpacing.sm),
                      Text(
                        'Not quite',
                        style: AppTextStyles.bodyLarge.copyWith(
                          color: AppColors.error,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    'Correct: ${currentWord.displayWord}',
                    style: AppTextStyles.body.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
          ],

          const Spacer(),

          // Action button
          Padding(
            padding: const EdgeInsets.all(AppSpacing.xl),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _hasAnswered
                    ? _nextQuestion
                    : (_textController.text.isNotEmpty ? _checkAnswer : null),
                child: Text(_hasAnswered
                    ? (_currentIndex >= _exerciseWords.length - 1
                        ? 'See Results'
                        : 'Next')
                    : 'Check'),
              ),
            ),
          ),
        ],
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
                'Spelling Complete!',
                style: AppTextStyles.h1,
              ),
              const SizedBox(height: AppSpacing.xl),
              Text(
                '$percentage%',
                style: AppTextStyles.displayLarge.copyWith(
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
            style: AppTextStyles.displayMedium.copyWith(color: color),
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
