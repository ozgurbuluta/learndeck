import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/word.dart';
import '../providers/words_provider.dart';
import '../providers/user_preferences_provider.dart';
import '../providers/user_activity_provider.dart';
import '../providers/speech_provider.dart';
import '../services/tts_service.dart';
import '../services/speech_service.dart';
import '../theme/app_theme.dart';

/// Pronunciation Practice - speak words and get feedback
class PronunciationScreen extends ConsumerStatefulWidget {
  const PronunciationScreen({super.key});

  @override
  ConsumerState<PronunciationScreen> createState() => _PronunciationScreenState();
}

class _PronunciationScreenState extends ConsumerState<PronunciationScreen>
    with SingleTickerProviderStateMixin {
  List<Word> _exerciseWords = [];
  int _currentIndex = 0;
  int _correctCount = 0;
  int _incorrectCount = 0;
  bool _isComplete = false;
  bool _hasAttempted = false;
  double _lastScore = 0.0;
  late AnimationController _pulseController;
  final _random = Random();

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat(reverse: true);

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
        _hasAttempted = false;
        _lastScore = 0.0;
      });
    });
  }

  Future<void> _playWord() async {
    if (_currentIndex >= _exerciseWords.length) return;

    final prefs = ref.read(userPreferencesProvider).valueOrNull;
    final language = prefs?.targetLanguage ?? 'German';
    final word = _exerciseWords[_currentIndex];

    await TTSService.speak(word.word, language: language);
  }

  Future<void> _startRecording() async {
    final prefs = ref.read(userPreferencesProvider).valueOrNull;
    final language = prefs?.targetLanguage ?? 'German';

    ref.read(speechProvider.notifier).clearText();
    await ref.read(speechProvider.notifier).startListening(language: language);
  }

  Future<void> _stopRecording() async {
    await ref.read(speechProvider.notifier).stopListening();

    // Calculate score after a short delay to ensure final result is processed
    Future.delayed(const Duration(milliseconds: 300), () {
      _evaluatePronunciation();
    });
  }

  void _evaluatePronunciation() {
    final speechState = ref.read(speechProvider);
    final currentWord = _exerciseWords[_currentIndex];

    final similarity = SpeechService.calculateSimilarity(
      currentWord.word,
      speechState.recognizedText,
    );

    final isCorrect = similarity >= 0.7;

    setState(() {
      _hasAttempted = true;
      _lastScore = similarity;
      if (isCorrect) {
        _correctCount++;
      } else {
        _incorrectCount++;
      }
    });

    // Update word statistics
    ref.read(wordsProvider.notifier).updateAfterReview(currentWord.id, isCorrect);
  }

  void _nextWord() {
    if (_currentIndex >= _exerciseWords.length - 1) {
      setState(() {
        _isComplete = true;
      });
      ref.read(userActivityProvider.notifier).recordReviewCompleted();
    } else {
      ref.read(speechProvider.notifier).clearText();
      setState(() {
        _currentIndex++;
        _hasAttempted = false;
        _lastScore = 0.0;
      });
    }
  }

  void _tryAgain() {
    ref.read(speechProvider.notifier).clearText();
    setState(() {
      _hasAttempted = false;
      _lastScore = 0.0;
      // Undo the incorrect count if they're retrying
      if (_lastScore < 0.7) {
        _incorrectCount = (_incorrectCount - 1).clamp(0, 100);
      }
    });
  }

  @override
  void dispose() {
    _pulseController.dispose();
    TTSService.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final wordsState = ref.watch(wordsProvider);
    final speechState = ref.watch(speechProvider);

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
              ? 'Pronunciation'
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
          if (!speechState.isAvailable) {
            return _buildSpeechUnavailable();
          }
          if (_isComplete) {
            return _buildCompletionScreen();
          }
          if (_exerciseWords.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }
          return _buildExercise(speechState);
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
            Icon(Icons.library_books_outlined, size: 80, color: AppColors.textTertiary),
            const SizedBox(height: AppSpacing.xl),
            Text('No Words Yet', style: AppTextStyles.h3),
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

  Widget _buildSpeechUnavailable() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xxxl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.mic_off_rounded, size: 80, color: AppColors.error),
            const SizedBox(height: AppSpacing.xl),
            Text('Microphone Unavailable', style: AppTextStyles.h3),
            const SizedBox(height: AppSpacing.sm),
            Text(
              'Please grant microphone permissions to use pronunciation practice.',
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

  Widget _buildExercise(SpeechState speechState) {
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

          // Word to pronounce
          Column(
            children: [
              Text(
                'Say this word',
                style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
              ),
              const SizedBox(height: AppSpacing.lg),
              Text(
                currentWord.displayWord,
                style: AppTextStyles.h1.copyWith(fontSize: 36),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                currentWord.definition,
                style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppSpacing.lg),
              // Listen button
              TextButton.icon(
                onPressed: _playWord,
                icon: Icon(Icons.volume_up_rounded, size: 18),
                label: const Text('Listen'),
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.primary,
                ),
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.xxl),

          // Recording button
          if (!_hasAttempted)
            GestureDetector(
              onTapDown: (_) => _startRecording(),
              onTapUp: (_) => _stopRecording(),
              onTapCancel: () => _stopRecording(),
              child: AnimatedBuilder(
                animation: _pulseController,
                builder: (context, child) {
                  final scale = speechState.isListening
                      ? 1.0 + (_pulseController.value * 0.1)
                      : 1.0;
                  return Transform.scale(
                    scale: scale,
                    child: Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        color: speechState.isListening
                            ? AppColors.error
                            : AppColors.primary,
                        shape: BoxShape.circle,
                        boxShadow: speechState.isListening
                            ? [
                                BoxShadow(
                                  color: AppColors.error.withValues(alpha: 0.4),
                                  blurRadius: 20,
                                  spreadRadius: 5,
                                )
                              ]
                            : null,
                      ),
                      child: Icon(
                        speechState.isListening
                            ? Icons.mic_rounded
                            : Icons.mic_none_rounded,
                        size: 56,
                        color: Colors.white,
                      ),
                    ),
                  );
                },
              ),
            ),

          // Listening indicator
          if (speechState.isListening)
            Padding(
              padding: const EdgeInsets.only(top: AppSpacing.lg),
              child: Column(
                children: [
                  Text(
                    'Listening...',
                    style: AppTextStyles.body.copyWith(
                      color: AppColors.error,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  if (speechState.recognizedText.isNotEmpty) ...[
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      '"${speechState.recognizedText}"',
                      style: AppTextStyles.bodyLarge.copyWith(
                        color: AppColors.textSecondary,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ],
                ],
              ),
            ),

          // Result feedback
          if (_hasAttempted) ...[
            _buildFeedback(speechState.recognizedText),
            const SizedBox(height: AppSpacing.xl),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (_lastScore < 0.7)
                  OutlinedButton.icon(
                    onPressed: _tryAgain,
                    icon: Icon(Icons.refresh_rounded, size: 18),
                    label: const Text('Try Again'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      side: BorderSide(color: AppColors.primary),
                    ),
                  ),
                if (_lastScore < 0.7)
                  const SizedBox(width: AppSpacing.md),
                ElevatedButton(
                  onPressed: _nextWord,
                  child: Text(_currentIndex >= _exerciseWords.length - 1
                      ? 'See Results'
                      : 'Next'),
                ),
              ],
            ),
          ],

          if (!_hasAttempted && !speechState.isListening)
            Padding(
              padding: const EdgeInsets.only(top: AppSpacing.lg),
              child: Text(
                'Hold to record',
                style: AppTextStyles.label.copyWith(color: AppColors.textTertiary),
              ),
            ),

          const Spacer(),
          const SizedBox(height: AppSpacing.xl),
        ],
      ),
    );
  }

  Widget _buildFeedback(String recognizedText) {
    final feedbackMessage = SpeechService.getFeedbackMessage(_lastScore);
    final colorName = SpeechService.getFeedbackColorName(_lastScore);

    Color feedbackColor;
    switch (colorName) {
      case 'success':
        feedbackColor = AppColors.success;
        break;
      case 'warning':
        feedbackColor = AppColors.warning;
        break;
      default:
        feedbackColor = AppColors.error;
    }

    final percentage = (_lastScore * 100).round();

    return Column(
      children: [
        // Score circle
        Container(
          width: 100,
          height: 100,
          decoration: BoxDecoration(
            color: feedbackColor.withValues(alpha: 0.1),
            shape: BoxShape.circle,
            border: Border.all(color: feedbackColor, width: 4),
          ),
          child: Center(
            child: Text(
              '$percentage%',
              style: AppTextStyles.statNumber.copyWith(color: feedbackColor),
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        Text(
          feedbackMessage,
          style: AppTextStyles.h4.copyWith(color: feedbackColor),
        ),
        const SizedBox(height: AppSpacing.sm),
        if (recognizedText.isNotEmpty)
          Text(
            'You said: "$recognizedText"',
            style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
          ),
      ],
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
              Text('Pronunciation Complete!', style: AppTextStyles.h1),
              const SizedBox(height: AppSpacing.xl),
              Text(
                '$percentage%',
                style: AppTextStyles.displayLarge.copyWith(
                  color: percentage >= 70 ? AppColors.success : AppColors.warning,
                ),
              ),
              Text(
                'accuracy',
                style: AppTextStyles.label.copyWith(color: AppColors.textSecondary),
              ),
              const SizedBox(height: AppSpacing.xxxl),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _buildResultCard('Correct', _correctCount, AppColors.success),
                  const SizedBox(width: AppSpacing.xl),
                  _buildResultCard('Needs Work', _incorrectCount, AppColors.error),
                ],
              ),
              const SizedBox(height: AppSpacing.xxxl * 2),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _initializeExercise,
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
            style: AppTextStyles.labelSmall.copyWith(color: color.withValues(alpha: 0.8)),
          ),
        ],
      ),
    );
  }
}
