import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/word.dart';
import '../providers/words_provider.dart';
import '../providers/user_preferences_provider.dart';
import '../services/tts_service.dart';
import '../theme/app_theme.dart';
import '../widgets/widgets.dart';

class WordListScreen extends ConsumerStatefulWidget {
  const WordListScreen({super.key});

  @override
  ConsumerState<WordListScreen> createState() => _WordListScreenState();
}

class _WordListScreenState extends ConsumerState<WordListScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';
  Difficulty? _filterDifficulty;

  @override
  void initState() {
    super.initState();
    // Load words when screen opens
    Future.microtask(() => ref.read(wordsProvider.notifier).loadWords());
  }

  @override
  void dispose() {
    _searchController.dispose();
    TTSService.stop();
    super.dispose();
  }

  Future<void> _speak(String text) async {
    final prefs = ref.read(userPreferencesProvider).valueOrNull;
    final language = prefs?.targetLanguage ?? 'German';
    await TTSService.speak(text, language: language);
  }

  List<Word> _filterWords(List<Word> words) {
    return words.where((word) {
      final matchesSearch = _searchQuery.isEmpty ||
          word.word.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          word.definition.toLowerCase().contains(_searchQuery.toLowerCase());

      final matchesFilter = _filterDifficulty == null ||
          word.difficulty == _filterDifficulty;

      return matchesSearch && matchesFilter;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final wordsAsync = ref.watch(wordsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Library'),
        backgroundColor: AppColors.surface,
        actions: [
          IconButton(
            icon: Icon(Icons.add_rounded, color: AppColors.primary),
            onPressed: () => _showAddWordDialog(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search and filters
          Container(
            color: AppColors.surface,
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg,
              0,
              AppSpacing.lg,
              AppSpacing.lg,
            ),
            child: Column(
              children: [
                // Search bar
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search words...',
                    prefixIcon: Icon(Icons.search, color: AppColors.textTertiary),
                    suffixIcon: _searchQuery.isNotEmpty
                        ? IconButton(
                            icon: Icon(Icons.clear, color: AppColors.textTertiary),
                            onPressed: () {
                              _searchController.clear();
                              setState(() => _searchQuery = '');
                            },
                          )
                        : null,
                  ),
                  onChanged: (value) => setState(() => _searchQuery = value),
                ),
                const SizedBox(height: AppSpacing.md),

                // Filter chips
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildFilterChip(null, 'All'),
                      const SizedBox(width: AppSpacing.sm),
                      _buildFilterChip(Difficulty.newWord, 'New'),
                      const SizedBox(width: AppSpacing.sm),
                      _buildFilterChip(Difficulty.learning, 'Learning'),
                      const SizedBox(width: AppSpacing.sm),
                      _buildFilterChip(Difficulty.review, 'Review'),
                      const SizedBox(width: AppSpacing.sm),
                      _buildFilterChip(Difficulty.mastered, 'Mastered'),
                      const SizedBox(width: AppSpacing.sm),
                      _buildFilterChip(Difficulty.failed, 'Failed'),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Word list
          Expanded(
            child: wordsAsync.when(
              loading: () => Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              ),
              error: (e, _) => _buildErrorState(e),
              data: (words) {
                final filtered = _filterWords(words);
                if (filtered.isEmpty) {
                  return _buildEmptyState();
                }
                return ListView.builder(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  itemCount: filtered.length,
                  itemBuilder: (context, index) => _buildWordTile(filtered[index]),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.primary,
        onPressed: () => _showAddWordDialog(),
        child: Icon(Icons.add, color: AppColors.textOnPrimary),
      ),
    );
  }

  Widget _buildFilterChip(Difficulty? value, String label) {
    final isSelected = _filterDifficulty == value;
    return GestureDetector(
      onTap: () => setState(() => _filterDifficulty = value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm,
        ),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(AppRadius.full),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
          ),
        ),
        child: Text(
          label,
          style: AppTextStyles.labelSmall.copyWith(
            color: isSelected ? AppColors.textOnPrimary : AppColors.textPrimary,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Widget _buildWordTile(Word word) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ListTile(
            contentPadding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg,
              vertical: AppSpacing.sm,
            ),
            title: Text(
              word.displayWord,
              style: AppTextStyles.bodyLarge.copyWith(fontWeight: FontWeight.w600),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: AppSpacing.xs),
                Text(
                  word.definition,
                  style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
                ),
                const SizedBox(height: AppSpacing.sm),
                Row(
                  children: [
                    DifficultyBadge(difficulty: word.difficulty, compact: true),
                    const SizedBox(width: AppSpacing.sm),
                    Text(
                      '${(word.accuracy * 100).toInt()}% accuracy',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.textTertiary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  icon: Icon(Icons.volume_up_rounded, color: AppColors.primary),
                  onPressed: () => _speak(word.word),
                  tooltip: 'Listen',
                ),
                IconButton(
                  icon: Icon(Icons.edit_rounded, color: AppColors.textSecondary),
                  onPressed: () => _showEditWordDialog(word),
                  tooltip: 'Edit',
                ),
                IconButton(
                  icon: Icon(Icons.delete_outline_rounded, color: AppColors.error),
                  onPressed: () => _confirmDelete(word),
                  tooltip: 'Delete',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xxxl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              _searchQuery.isNotEmpty ? Icons.search_off_rounded : Icons.library_books_rounded,
              size: 60,
              color: AppColors.textTertiary,
            ),
            const SizedBox(height: AppSpacing.lg),
            Text(
              _searchQuery.isNotEmpty ? 'No matching words' : 'No words yet',
              style: AppTextStyles.h4,
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              _searchQuery.isNotEmpty
                  ? 'Try a different search term'
                  : 'Add your first word to start learning',
              style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
              textAlign: TextAlign.center,
            ),
            if (_searchQuery.isEmpty) ...[
              const SizedBox(height: AppSpacing.xl),
              PrimaryButton(
                label: 'Add Your First Word',
                fullWidth: false,
                onPressed: () => _showAddWordDialog(),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState(Object error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, color: AppColors.error, size: 60),
            const SizedBox(height: AppSpacing.lg),
            Text('Error loading words', style: AppTextStyles.h4),
            const SizedBox(height: AppSpacing.sm),
            Text(
              error.toString(),
              style: AppTextStyles.bodySmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.lg),
            ElevatedButton(
              onPressed: () => ref.read(wordsProvider.notifier).loadWords(),
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddWordDialog() {
    final wordController = TextEditingController();
    final definitionController = TextEditingController();
    final articleController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          left: AppSpacing.xl,
          right: AppSpacing.xl,
          top: AppSpacing.xl,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Add New Word', style: AppTextStyles.h3),
            const SizedBox(height: AppSpacing.xl),
            TextField(
              controller: articleController,
              decoration: const InputDecoration(hintText: 'Article (der/die/das)'),
            ),
            const SizedBox(height: AppSpacing.md),
            TextField(
              controller: wordController,
              decoration: const InputDecoration(hintText: 'Word'),
            ),
            const SizedBox(height: AppSpacing.md),
            TextField(
              controller: definitionController,
              decoration: const InputDecoration(hintText: 'Definition'),
            ),
            const SizedBox(height: AppSpacing.xl),
            PrimaryButton(
              label: 'Add Word',
              onPressed: () async {
                if (wordController.text.isNotEmpty &&
                    definitionController.text.isNotEmpty) {
                  await ref.read(wordsProvider.notifier).addWord(
                        word: wordController.text,
                        definition: definitionController.text,
                        article: articleController.text.isNotEmpty
                            ? articleController.text
                            : null,
                      );
                  if (context.mounted) Navigator.pop(context);
                }
              },
            ),
            const SizedBox(height: AppSpacing.xl),
          ],
        ),
      ),
    );
  }

  void _showEditWordDialog(Word word) {
    final wordController = TextEditingController(text: word.word);
    final definitionController = TextEditingController(text: word.definition);
    final articleController = TextEditingController(text: word.article ?? '');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          left: AppSpacing.xl,
          right: AppSpacing.xl,
          top: AppSpacing.xl,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Edit Word', style: AppTextStyles.h3),
            const SizedBox(height: AppSpacing.xl),
            TextField(
              controller: articleController,
              decoration: const InputDecoration(hintText: 'Article (der/die/das)'),
            ),
            const SizedBox(height: AppSpacing.md),
            TextField(
              controller: wordController,
              decoration: const InputDecoration(hintText: 'Word'),
            ),
            const SizedBox(height: AppSpacing.md),
            TextField(
              controller: definitionController,
              decoration: const InputDecoration(hintText: 'Definition'),
            ),
            const SizedBox(height: AppSpacing.xl),
            PrimaryButton(
              label: 'Save Changes',
              onPressed: () async {
                if (wordController.text.isNotEmpty &&
                    definitionController.text.isNotEmpty) {
                  await ref.read(wordsProvider.notifier).updateWord(
                        word.copyWith(
                          word: wordController.text,
                          definition: definitionController.text,
                          article: articleController.text.isNotEmpty
                              ? articleController.text
                              : null,
                        ),
                      );
                  if (context.mounted) Navigator.pop(context);
                }
              },
            ),
            const SizedBox(height: AppSpacing.xl),
          ],
        ),
      ),
    );
  }

  void _confirmDelete(Word word) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Word'),
        content: Text('Delete "${word.word}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              ref.read(wordsProvider.notifier).deleteWord(word.id);
              Navigator.pop(context);
            },
            child: Text('Delete', style: AppTextStyles.button.copyWith(color: AppColors.error)),
          ),
        ],
      ),
    );
  }
}
