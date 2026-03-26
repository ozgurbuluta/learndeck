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

/// Shadowing Exercise - listen and immediately repeat
class ShadowingScreen extends ConsumerStatefulWidget {
  const ShadowingScreen({super.key});

  @override
  ConsumerState<ShadowingScreen> createState() => _ShadowingScreenState();
}

class _ShadowingScreenState extends ConsumerState<ShadowingScreen> {
  List<Word> _exerciseWords = [];
  int _currentIndex = 0;
  int _correctCount = 0;
  int _incorrectCount = 0;
  bool _isComplete = false;
  ShadowingPhase _phase = ShadowingPhase.ready;
  double _lastScore = 0.0;
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
        _phase = ShadowingPhase.ready;
        _lastScore = 0.0;
      });
    });
  }

  Future<void> _startShadowing() async {
    setState(() {
      _phase = ShadowingPhase.listening;
    });

    // Play the word
    final prefs = ref.read(userPreferencesProvider).valueOrNull;
    final language = prefs?.targetLanguage ?? 'German';
    final word = _exerciseWords[_currentIndex];

    await TTSService.speak(word.word, language: language);

    // Wait a bit then start recording
    await Future.delayed(const Duration(milliseconds: 800));

    if (mounted) {
      setState(() {
        _phase = ShadowingPhase.speaking;
      });

      ref.read(speechProvider.notifier).clearText();
      await ref.read(speechProvider.notifier).startListening(language: language);

      // Auto-stop after 3 seconds
      Future.delayed(const Duration(seconds: 3), () {
        if (_phase == ShadowingPhase.speaking) {
          _finishRecording();
        }
      });
    }
  }

  Future<void> _finishRecording() async {
    await ref.read(speechProvider.notifier).stopListening();

    // Calculate score
    await Future.delayed(const Duration(milliseconds: 300));

    final speechState = ref.read(speechProvider);
    final currentWord = _exerciseWords[_currentIndex];

    final similarity = SpeechService.calculateSimilarity(
      currentWord.word,
      speechState.recognizedText,
    );

    final isCorrect = similarity >= 0.7;

    setState(() {
      _phase = ShadowingPhase.feedback;
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
        _phase = ShadowingPhase.ready;
        _lastScore = 0.0;
      });
    }
  }

  void _tryAgain() {
    ref.read(speechProvider.notifier).clearText();
    setState(() {
      _phase = ShadowingPhase.ready;
      // Undo the incorrect count
      if (_lastScore < 0.7) {
        _incorrectCount = (_incorrectCount - 1).clamp(0, 100);
      }
    });
  }

  @override
  void dispose() {
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
              ? 'Shadowing'
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
              'Please grant microphone permissions.',
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

          // Phase indicator
          _buildPhaseIndicator(),

          const SizedBox(height: AppSpacing.xl),

          // Word display
          Container(
            padding: const EdgeInsets.all(AppSpacing.xxl),
            margin: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(AppRadius.xl),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                Text(
                  currentWord.displayWord,
                  style: AppTextStyles.h1.copyWith(fontSize: 32),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  currentWord.definition,
                  style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),

          const SizedBox(height: AppSpacing.xxl),

          // Phase-specific content
          if (_phase == ShadowingPhase.ready)
            _buildReadyPhase()
          else if (_phase == ShadowingPhase.listening)
            _buildListeningPhase()
          else if (_phase == ShadowingPhase.speaking)
            _buildSpeakingPhase(speechState)
          else if (_phase == ShadowingPhase.feedback)
            _buildFeedbackPhase(speechState),

          const Spacer(),
          const SizedBox(height: AppSpacing.xl),
        ],
      ),
    );
  }

  Widget _buildPhaseIndicator() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _buildPhaseStep(1, 'Listen', _phase.index >= ShadowingPhase.listening.index),
        _buildPhaseConnector(_phase.index >= ShadowingPhase.speaking.index),
        _buildPhaseStep(2, 'Repeat', _phase.index >= ShadowingPhase.speaking.index),
        _buildPhaseConnector(_phase.index >= ShadowingPhase.feedback.index),
        _buildPhaseStep(3, 'Check', _phase.index >= ShadowingPhase.feedback.index),
      ],
    );
  }

  Widget _buildPhaseStep(int number, String label, bool isActive) {
    return Column(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: isActive ? AppColors.primary : AppColors.surfaceVariant,
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              '$number',
              style: TextStyle(
                color: isActive ? Colors.white : AppColors.textTertiary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.xs),
        Text(
          label,
          style: AppTextStyles.labelSmall.copyWith(
            color: isActive ? AppColors.primary : AppColors.textTertiary,
          ),
        ),
      ],
    );
  }

  Widget _buildPhaseConnector(bool isActive) {
    return Container(
      width: 40,
      height: 2,
      margin: const EdgeInsets.only(bottom: AppSpacing.lg),
      color: isActive ? AppColors.primary : AppColors.border,
    );
  }

  Widget _buildReadyPhase() {
    return Column(
      children: [
        Text(
          'Tap to start shadowing',
          style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
        ),
        const SizedBox(height: AppSpacing.lg),
        ElevatedButton.icon(
          onPressed: _startShadowing,
          icon: const Icon(Icons.play_arrow_rounded),
          label: const Text('Start'),
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.xxl,
              vertical: AppSpacing.lg,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildListeningPhase() {
    return Column(
      children: [
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(
            Icons.volume_up_rounded,
            size: 40,
            color: AppColors.primary,
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        Text(
          'Listening...',
          style: AppTextStyles.bodyLarge.copyWith(
            color: AppColors.primary,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _buildSpeakingPhase(SpeechState speechState) {
    return Column(
      children: [
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: AppColors.error,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: AppColors.error.withValues(alpha: 0.4),
                blurRadius: 20,
                spreadRadius: 5,
              )
            ],
          ),
          child: const Icon(
            Icons.mic_rounded,
            size: 40,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        Text(
          'Now repeat!',
          style: AppTextStyles.bodyLarge.copyWith(
            color: AppColors.error,
            fontWeight: FontWeight.w600,
          ),
        ),
        if (speechState.recognizedText.isNotEmpty) ...[
          const SizedBox(height: AppSpacing.sm),
          Text(
            '"${speechState.recognizedText}"',
            style: AppTextStyles.body.copyWith(
              color: AppColors.textSecondary,
              fontStyle: FontStyle.italic,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildFeedbackPhase(SpeechState speechState) {
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
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: feedbackColor.withValues(alpha: 0.1),
            shape: BoxShape.circle,
            border: Border.all(color: feedbackColor, width: 3),
          ),
          child: Center(
            child: Text(
              '$percentage%',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: feedbackColor,
              ),
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        Text(
          feedbackMessage,
          style: AppTextStyles.h4.copyWith(color: feedbackColor),
        ),
        if (speechState.recognizedText.isNotEmpty) ...[
          const SizedBox(height: AppSpacing.sm),
          Text(
            'You said: "${speechState.recognizedText}"',
            style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
          ),
        ],
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
              Text('Shadowing Complete!', style: AppTextStyles.h1),
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
            style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: color),
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

enum ShadowingPhase {
  ready,
  listening,
  speaking,
  feedback,
}
