import 'package:flutter/material.dart';
import 'package:flutter_card_swiper/flutter_card_swiper.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/word.dart';
import '../providers/words_provider.dart';
import '../utils/study_algorithm.dart';

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

    // Update word in backend
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
      backgroundColor: const Color(0xFF1a1a2e),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          '${_currentIndex + 1} / ${_studyWords.length}',
          style: const TextStyle(color: Colors.white),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Progress bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: LinearProgressIndicator(
                  value: _studyWords.isNotEmpty
                      ? (_currentIndex + 1) / _studyWords.length
                      : 0,
                  backgroundColor: Colors.white24,
                  valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF6366f1)),
                  minHeight: 8,
                ),
              ),
            ),

            // Score display
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _buildScoreChip(Icons.check_circle, _correctCount, Colors.green),
                  const SizedBox(width: 20),
                  _buildScoreChip(Icons.cancel, _incorrectCount, Colors.red),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Swipe cards
            Expanded(
              child: CardSwiper(
                controller: _controller,
                cardsCount: _studyWords.length,
                numberOfCardsDisplayed: _studyWords.length > 1 ? 2 : 1,
                backCardOffset: const Offset(0, -30),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
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
              padding: const EdgeInsets.all(20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildSwipeHint(Icons.arrow_back, 'Keep Learning', Colors.red),
                  _buildSwipeHint(Icons.arrow_forward, 'I Know It', Colors.green),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFlashcard(Word word, bool isTop, double swipeProgress) {
    // Calculate overlay opacity based on swipe progress
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
                color: const Color(0xFF252542),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.3),
                    blurRadius: 15,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(30),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (word.article != null && !(_isFlipped && isTop))
                        Text(
                          word.article!,
                          style: TextStyle(
                            fontSize: 18,
                            color: Colors.white.withValues(alpha: 0.6),
                          ),
                        ),
                      const SizedBox(height: 8),
                      Text(
                        _isFlipped && isTop ? word.definition : word.word,
                        style: const TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 20),
                      if (!(_isFlipped && isTop))
                        Text(
                          'Tap to reveal',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.white.withValues(alpha: 0.5),
                          ),
                        ),
                      if (_isFlipped && isTop)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFF6366f1).withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            word.displayWord,
                            style: const TextStyle(
                              fontSize: 16,
                              color: Color(0xFF6366f1),
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
                    color: Colors.green.withValues(alpha: overlayOpacity),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Center(
                    child: Icon(
                      Icons.check_circle,
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
                    color: Colors.red.withValues(alpha: overlayOpacity),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Center(
                    child: Icon(
                      Icons.cancel,
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
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(width: 8),
          Text(
            '$count',
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.bold,
              fontSize: 16,
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
        const SizedBox(width: 8),
        Text(
          label,
          style: TextStyle(
            color: color.withValues(alpha: 0.7),
            fontSize: 14,
          ),
        ),
      ],
    );
  }

  Widget _buildCompletionScreen() {
    final total = _correctCount + _incorrectCount;
    final percentage = total > 0 ? (_correctCount / total * 100).round() : 0;

    return Scaffold(
      backgroundColor: const Color(0xFF1a1a2e),
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(30),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.celebration,
                  size: 80,
                  color: Color(0xFF6366f1),
                ),
                const SizedBox(height: 30),
                const Text(
                  'Session Complete!',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  '$percentage% accuracy',
                  style: TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.bold,
                    color: percentage >= 70 ? Colors.green : Colors.orange,
                  ),
                ),
                const SizedBox(height: 30),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _buildStatCard('Correct', _correctCount, Colors.green),
                    const SizedBox(width: 20),
                    _buildStatCard('To Review', _incorrectCount, Colors.red),
                  ],
                ),
                const SizedBox(height: 50),
                ElevatedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6366f1),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 40,
                      vertical: 16,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30),
                    ),
                  ),
                  child: const Text(
                    'Done',
                    style: TextStyle(
                      fontSize: 18,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(String label, int value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(16),
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
            style: TextStyle(
              fontSize: 14,
              color: color.withValues(alpha: 0.8),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Scaffold(
      backgroundColor: const Color(0xFF1a1a2e),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.library_books_outlined,
              size: 80,
              color: Colors.white38,
            ),
            SizedBox(height: 20),
            Text(
              'No words to study',
              style: TextStyle(
                fontSize: 20,
                color: Colors.white70,
              ),
            ),
            SizedBox(height: 10),
            Text(
              'Add some words first!',
              style: TextStyle(
                fontSize: 16,
                color: Colors.white38,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
