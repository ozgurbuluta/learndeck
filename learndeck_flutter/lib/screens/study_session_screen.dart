import 'package:flutter/material.dart';
import 'package:flutter_card_swiper/flutter_card_swiper.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/word.dart';
import '../providers/words_provider.dart';
import '../utils/study_algorithm.dart';
import '../theme/app_theme.dart';

class StudySessionScreen extends ConsumerStatefulWidget {
  final List<Word>? initialWords;

  const StudySessionScreen({super.key, this.initialWords});

  @override
  ConsumerState<StudySessionScreen> createState() => _StudySessionScreenState();
}

class _StudySessionScreenState extends ConsumerState<StudySessionScreen> {
  final CardSwiperController _controller = CardSwiperController();
  List<Word> _studyWords = [];
  int _currentIndex = 0;
  int _correctCount = 0;
  int _incorrectCount = 0;
  bool _isFlipped = false;
  bool _isComplete = false;

  @override
  void initState() {
    super.initState();
    _initializeStudySession();
  }

  void _initializeStudySession() {
    final words = widget.initialWords ?? [];
    setState(() {
      _studyWords = shuffleWordsForStudy(words).take(20).toList();
      _currentIndex = 0;
      _correctCount = 0;
      _incorrectCount = 0;
      _isComplete = _studyWords.isEmpty;
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onSwipe(int previousIndex, int? currentIndex, CardSwiperDirection direction) {
    if (previousIndex >= _studyWords.length) return;

    final word = _studyWords[previousIndex];
    final wasCorrect = direction == CardSwiperDirection.right;

    ref.read(wordsProvider.notifier).updateAfterReview(word.id, wasCorrect);

    setState(() {
      if (wasCorrect) {
        _correctCount++;
      } else {
        _incorrectCount++;
      }
      _currentIndex = currentIndex ?? _studyWords.length;
      _isFlipped = false;

      if (_currentIndex >= _studyWords.length) {
        _isComplete = true;
      }
    });
  }

  void _flipCard() {
    setState(() {
      _isFlipped = !_isFlipped;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isComplete) {
      return _buildCompletionScreen();
    }

    if (_studyWords.isEmpty) {
      return _buildEmptyState();
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        leading: IconButton(
          icon: Icon(Icons.close_rounded, color: AppColors.textPrimary),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          '${_currentIndex + 1} / ${_studyWords.length}',
          style: AppTextStyles.h4,
        ),
        centerTitle: true,
      ),
      body: SafeArea(
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
                  value: _studyWords.isNotEmpty
                      ? (_currentIndex + 1) / _studyWords.length
                      : 0,
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
                  _buildScoreChip(Icons.check_circle_rounded, _correctCount, AppColors.success),
                  const SizedBox(width: AppSpacing.xl),
                  _buildScoreChip(Icons.cancel_rounded, _incorrectCount, AppColors.error),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),

            // Swipe cards
            Expanded(
              child: CardSwiper(
                controller: _controller,
                cardsCount: _studyWords.length,
                numberOfCardsDisplayed: _studyWords.length > 1 ? 2 : 1,
                backCardOffset: const Offset(0, -30),
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.xl,
                  vertical: AppSpacing.md,
                ),
                onSwipe: (prev, curr, dir) {
                  _onSwipe(prev, curr, dir);
                  return true;
                },
                cardBuilder: (context, index, percentThresholdX, percentThresholdY) {
                  return _buildFlashcard(
                    _studyWords[index],
                    index == _currentIndex,
                    percentThresholdX.toDouble() / 100,
                  );
                },
              ),
            ),

            // Swipe hints
            Padding(
              padding: const EdgeInsets.all(AppSpacing.xl),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildSwipeHint(Icons.arrow_back_rounded, 'Keep Learning', AppColors.error),
                  _buildSwipeHint(Icons.arrow_forward_rounded, 'I Know It', AppColors.success),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFlashcard(Word word, bool isTop, double swipeProgress) {
    final showCorrectOverlay = swipeProgress > 0.3;
    final showIncorrectOverlay = swipeProgress < -0.3;
    final overlayOpacity = (swipeProgress.abs() - 0.3).clamp(0.0, 0.7);

    return GestureDetector(
      onTap: _flipCard,
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 300),
        transitionBuilder: (child, animation) {
          return FadeTransition(opacity: animation, child: child);
        },
        child: Stack(
          key: ValueKey(_isFlipped && isTop),
          children: [
            Container(
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(AppRadius.xl),
                border: Border.all(color: AppColors.border),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.xxxl),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (word.article != null && !(_isFlipped && isTop))
                        Text(
                          word.article!,
                          style: AppTextStyles.bodyLarge.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      const SizedBox(height: AppSpacing.sm),
                      Text(
                        _isFlipped && isTop ? word.definition : word.word,
                        style: AppTextStyles.h1.copyWith(fontSize: 32),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: AppSpacing.xl),
                      if (!(_isFlipped && isTop))
                        Text(
                          'Tap to reveal',
                          style: AppTextStyles.label.copyWith(
                            color: AppColors.textTertiary,
                          ),
                        ),
                      if (_isFlipped && isTop)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.md,
                            vertical: AppSpacing.sm,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(AppRadius.full),
                          ),
                          child: Text(
                            word.displayWord,
                            style: AppTextStyles.body.copyWith(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),
            // Swipe overlay
            if (isTop && showCorrectOverlay)
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    color: AppColors.success.withValues(alpha: overlayOpacity),
                    borderRadius: BorderRadius.circular(AppRadius.xl),
                  ),
                  child: Center(
                    child: Icon(
                      Icons.check_circle_rounded,
                      size: 80,
                      color: Colors.white.withValues(alpha: overlayOpacity + 0.3),
                    ),
                  ),
                ),
              ),
            if (isTop && showIncorrectOverlay)
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    color: AppColors.error.withValues(alpha: overlayOpacity),
                    borderRadius: BorderRadius.circular(AppRadius.xl),
                  ),
                  child: Center(
                    child: Icon(
                      Icons.cancel_rounded,
                      size: 80,
                      color: Colors.white.withValues(alpha: overlayOpacity + 0.3),
                    ),
                  ),
                ),
              ),
          ],
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

  Widget _buildSwipeHint(IconData icon, String label, Color color) {
    return Row(
      children: [
        Icon(icon, color: color.withValues(alpha: 0.7), size: 20),
        const SizedBox(width: AppSpacing.sm),
        Text(
          label,
          style: AppTextStyles.label.copyWith(
            color: color.withValues(alpha: 0.7),
          ),
        ),
      ],
    );
  }

  Widget _buildCompletionScreen() {
    final total = _correctCount + _incorrectCount;
    final percentage = total > 0 ? (_correctCount / total * 100).round() : 0;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.xxxl),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.celebration_rounded,
                  size: 80,
                  color: AppColors.primary,
                ),
                const SizedBox(height: AppSpacing.xxxl),
                Text(
                  'Session Complete!',
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
                    _buildResultCard('To Review', _incorrectCount, AppColors.error),
                  ],
                ),
                const SizedBox(height: AppSpacing.xxxl * 2),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: const Text('Done'),
                  ),
                ),
              ],
            ),
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

  Widget _buildEmptyState() {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        leading: IconButton(
          icon: Icon(Icons.close_rounded, color: AppColors.textPrimary),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: Center(
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
              'No words to study',
              style: AppTextStyles.h3,
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              'Add some words first!',
              style: AppTextStyles.body.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
