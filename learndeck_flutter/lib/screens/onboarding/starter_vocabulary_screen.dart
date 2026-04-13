import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/default_vocabulary.dart';
import '../../models/user_preferences.dart';
import '../../providers/words_provider.dart';
import '../../providers/user_activity_provider.dart';
import '../../services/ai_service.dart';
import '../../theme/app_theme.dart';
import '../../utils/page_transitions.dart';
import '../home_screen.dart';

class StarterVocabularyScreen extends ConsumerStatefulWidget {
  final UserPreferences preferences;

  const StarterVocabularyScreen({
    super.key,
    required this.preferences,
  });

  @override
  ConsumerState<StarterVocabularyScreen> createState() =>
      _StarterVocabularyScreenState();
}

class _StarterVocabularyScreenState
    extends ConsumerState<StarterVocabularyScreen> {
  bool _isLoading = false;
  bool _isGenerating = false;
  List<ExtractedWord> _generatedWords = [];
  Set<int> _selectedIndices = {};
  String? _error;

  String get _categoryText {
    final categories = widget.preferences.categories;
    if (categories.isEmpty) return 'general topics';
    if (categories.length == 1) return categories.first;
    if (categories.length == 2) return '${categories[0]} and ${categories[1]}';
    return '${categories.take(2).join(', ')} and more';
  }

  void _loadDefaultVocabulary() {
    setState(() {
      _isGenerating = true;
      _error = null;
    });

    final language = widget.preferences.targetLanguage;
    final level = widget.preferences.level;

    if (DefaultVocabulary.hasVocabulary(language)) {
      final words = DefaultVocabulary.getWords(
        language: language,
        level: level,
      );

      setState(() {
        _generatedWords = words;
        _selectedIndices = Set.from(List.generate(words.length, (i) => i));
        _isGenerating = false;
      });
    } else {
      _generateVocabularyFromAI();
    }
  }

  Future<void> _generateVocabularyFromAI() async {
    setState(() {
      _isGenerating = true;
      _error = null;
    });

    try {
      final categories = widget.preferences.categories.take(3).join(', ');
      final prompt =
          'Generate ${widget.preferences.dailyGoal * 2} essential ${widget.preferences.targetLanguage} '
          'vocabulary words for a ${widget.preferences.level} learner. '
          'Focus on these topics: ${categories.isNotEmpty ? categories : "everyday basics"}. '
          'Include a mix of nouns, verbs, and useful phrases.';

      final response = await AIService.generateVocabulary(
        userMessage: prompt,
        userPreferences: widget.preferences,
      );

      if (response.success && response.words.isNotEmpty) {
        setState(() {
          _generatedWords = response.words;
          _selectedIndices =
              Set.from(List.generate(response.words.length, (i) => i));
          _isGenerating = false;
        });
      } else {
        setState(() {
          _error = 'Could not generate vocabulary. Please try again.';
          _isGenerating = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Something went wrong. Please try again.';
        _isGenerating = false;
      });
    }
  }

  Future<void> _saveSelectedWords() async {
    if (_selectedIndices.isEmpty) {
      _goToHome();
      return;
    }

    setState(() => _isLoading = true);

    try {
      final wordsNotifier = ref.read(wordsProvider.notifier);
      for (int i = 0; i < _generatedWords.length; i++) {
        if (_selectedIndices.contains(i)) {
          final word = _generatedWords[i];
          await wordsNotifier.addWord(
            word: word.word,
            definition: word.definition,
            article: word.article,
          );
        }
      }
      // Record activity for streak
      ref.read(userActivityProvider.notifier).recordWordAdded();
      _goToHome();
    } catch (e) {
      setState(() {
        _error = 'Failed to save words. Please try again.';
        _isLoading = false;
      });
    }
  }

  void _goToHome() {
    context.pushAndRemoveUntilScreen(const HomeScreen());
  }

  void _toggleSelection(int index) {
    setState(() {
      if (_selectedIndices.contains(index)) {
        _selectedIndices.remove(index);
      } else {
        _selectedIndices.add(index);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.xl),
          child: _generatedWords.isEmpty
              ? _buildInitialView()
              : _buildWordsView(),
        ),
      ),
    );
  }

  Widget _buildInitialView() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 100,
          height: 100,
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(
            Icons.auto_awesome_rounded,
            size: 48,
            color: AppColors.primary,
          ),
        ),
        const SizedBox(height: AppSpacing.xxl),
        Text(
          'Ready to start learning!',
          style: AppTextStyles.h2,
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: AppSpacing.md),
        Text(
          'Would you like me to generate some starter ${widget.preferences.targetLanguage} '
          'vocabulary based on your interests in $_categoryText?',
          style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(
          'Level: ${widget.preferences.levelDescription}',
          style: AppTextStyles.labelSmall.copyWith(color: AppColors.primary),
        ),
        if (_error != null) ...[
          const SizedBox(height: AppSpacing.lg),
          Text(
            _error!,
            style: AppTextStyles.bodySmall.copyWith(color: AppColors.error),
            textAlign: TextAlign.center,
          ),
        ],
        const SizedBox(height: AppSpacing.xxxl),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _isGenerating ? null : _loadDefaultVocabulary,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: AppColors.textOnPrimary,
              padding: const EdgeInsets.symmetric(vertical: AppSpacing.lg),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
            ),
            child: _isGenerating
                ? SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      color: AppColors.textOnPrimary,
                      strokeWidth: 2,
                    ),
                  )
                : const Text('Generate Starter Words'),
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        TextButton(
          onPressed: _isGenerating ? null : _goToHome,
          child: Text(
            'Skip for now',
            style: AppTextStyles.button.copyWith(color: AppColors.textSecondary),
          ),
        ),
      ],
    );
  }

  Widget _buildWordsView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Your Starter Vocabulary',
          style: AppTextStyles.h2,
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(
          'Tap to select/deselect words to add to your deck',
          style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
        ),
        const SizedBox(height: AppSpacing.md),
        Row(
          children: [
            Text(
              '${_selectedIndices.length} of ${_generatedWords.length} selected',
              style: AppTextStyles.labelSmall,
            ),
            const Spacer(),
            TextButton(
              onPressed: () {
                setState(() {
                  if (_selectedIndices.length == _generatedWords.length) {
                    _selectedIndices.clear();
                  } else {
                    _selectedIndices = Set.from(
                        List.generate(_generatedWords.length, (i) => i));
                  }
                });
              },
              child: Text(
                _selectedIndices.length == _generatedWords.length
                    ? 'Deselect all'
                    : 'Select all',
                style: AppTextStyles.button.copyWith(color: AppColors.primary),
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        Expanded(
          child: ListView.builder(
            itemCount: _generatedWords.length,
            itemBuilder: (context, index) {
              final word = _generatedWords[index];
              final isSelected = _selectedIndices.contains(index);
              return _buildWordCard(word, isSelected, () => _toggleSelection(index));
            },
          ),
        ),
        if (_error != null) ...[
          const SizedBox(height: AppSpacing.md),
          Text(
            _error!,
            style: AppTextStyles.bodySmall.copyWith(color: AppColors.error),
          ),
        ],
        const SizedBox(height: AppSpacing.lg),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _isLoading ? null : _saveSelectedWords,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: AppColors.textOnPrimary,
              padding: const EdgeInsets.symmetric(vertical: AppSpacing.lg),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
            ),
            child: _isLoading
                ? SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      color: AppColors.textOnPrimary,
                      strokeWidth: 2,
                    ),
                  )
                : Text(_selectedIndices.isEmpty
                    ? 'Continue without adding'
                    : 'Add ${_selectedIndices.length} words & Start'),
          ),
        ),
      ],
    );
  }

  Widget _buildWordCard(
      ExtractedWord word, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: AppSpacing.sm),
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary.withValues(alpha: 0.1)
              : AppColors.surface,
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    word.word,
                    style: AppTextStyles.labelLarge.copyWith(
                      color: isSelected ? AppColors.primary : AppColors.textPrimary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    word.definition,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            if (isSelected)
              Icon(Icons.check_circle, color: AppColors.primary, size: 20),
          ],
        ),
      ),
    );
  }
}
