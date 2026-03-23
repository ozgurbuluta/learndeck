import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/word.dart';
import '../providers/words_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/widgets.dart';
import 'study_session_screen.dart';
import 'import_screen.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(wordsProvider.notifier).loadWords());
  }

  @override
  Widget build(BuildContext context) {
    final wordsAsync = ref.watch(wordsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: wordsAsync.when(
          loading: () => Center(
            child: CircularProgressIndicator(color: AppColors.primary),
          ),
          error: (error, _) => _buildErrorState(error),
          data: (words) => _buildDashboardContent(words),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.primary,
        onPressed: () => _showAddWordDialog(),
        child: Icon(Icons.add, color: AppColors.textOnPrimary),
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
            Text('Error loading words', style: AppTextStyles.h3),
            const SizedBox(height: AppSpacing.sm),
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.surfaceVariant,
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
              child: SelectableText(
                error.toString(),
                style: AppTextStyles.bodySmall,
                textAlign: TextAlign.center,
              ),
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

  Widget _buildDashboardContent(List<Word> words) {
    final stats = _calculateStats(words);
    final dueWords = words.where((w) =>
      DateTime.now().isAfter(w.nextReview) ||
      (w.difficulty == Difficulty.newWord)
    ).length;

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(AppSpacing.xl),
            color: AppColors.surface,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Hello!', style: AppTextStyles.h1),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  'Ready to learn some vocabulary?',
                  style: AppTextStyles.bodyLarge.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),

          // Quick Study Section
          _buildSection(
            title: 'Quick Study',
            child: words.isEmpty
                ? _buildEmptyState()
                : PrimaryButton(
                    label: 'Start Study Session',
                    subtitle: '$dueWords word${dueWords != 1 ? 's' : ''} ready to review',
                    icon: Icons.play_arrow_rounded,
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => StudySessionScreen(initialWords: words),
                        ),
                      );
                    },
                  ),
          ),

          // Study Options
          if (words.isNotEmpty)
            _buildSection(
              title: 'Study Options',
              child: GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: AppSpacing.md,
                crossAxisSpacing: AppSpacing.md,
                childAspectRatio: 1.4,
                children: [
                  StatCard(
                    label: 'New Words',
                    value: stats['new']!,
                    icon: Icons.fiber_new_rounded,
                    iconColor: AppColors.difficultyNew,
                    onTap: () => _startStudySession(words, 'new'),
                  ),
                  StatCard(
                    label: 'Due for Review',
                    value: dueWords,
                    icon: Icons.schedule_rounded,
                    iconColor: AppColors.warning,
                    onTap: () => _startStudySession(words, 'due'),
                  ),
                  StatCard(
                    label: 'All Words',
                    value: stats['total']!,
                    icon: Icons.library_books_rounded,
                    iconColor: AppColors.primary,
                    onTap: () => _startStudySession(words, 'all'),
                  ),
                  StatCard(
                    label: 'Mastered',
                    value: stats['mastered']!,
                    icon: Icons.star_rounded,
                    iconColor: AppColors.difficultyMastered,
                  ),
                ],
              ),
            ),

          // Progress Overview
          if (words.isNotEmpty)
            _buildSection(
              title: 'Your Progress',
              child: ProgressCard(
                totalWords: stats['total']!,
                masteredWords: stats['mastered']!,
                dayStreak: 0,
              ),
            ),

          // Quick Actions
          _buildSection(
            title: 'Quick Actions',
            child: Row(
              children: [
                Expanded(
                  child: QuickActionCard(
                    icon: Icons.add_circle_outline_rounded,
                    label: 'Add Word',
                    onTap: () => _showAddWordDialog(),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: QuickActionCard(
                    icon: Icons.upload_file_rounded,
                    label: 'Import',
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const ImportScreen()),
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: QuickActionCard(
                    icon: Icons.auto_awesome_rounded,
                    label: 'AI Assistant',
                    iconColor: AppColors.accent,
                    onTap: () {
                      // Navigate to AI Chat tab (index 3)
                      // This will be handled by the parent HomeScreen
                    },
                  ),
                ),
              ],
            ),
          ),

          // Recent Words
          if (words.isNotEmpty)
            _buildSection(
              title: 'Recent Words',
              child: Column(
                children: words
                    .take(5)
                    .map((word) => WordTile(word: word))
                    .toList(),
              ),
            ),

          const SizedBox(height: AppSpacing.xxxl),
        ],
      ),
    );
  }

  Widget _buildSection({required String title, required Widget child}) {
    return Container(
      margin: const EdgeInsets.only(top: AppSpacing.lg),
      padding: const EdgeInsets.all(AppSpacing.xl),
      color: AppColors.surface,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionHeader(title: title),
          child,
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.xxxl),
      decoration: BoxDecoration(
        color: AppColors.surfaceVariant,
        borderRadius: BorderRadius.circular(AppRadius.lg),
      ),
      child: Column(
        children: [
          Icon(
            Icons.add_circle_outline_rounded,
            size: 48,
            color: AppColors.textTertiary,
          ),
          const SizedBox(height: AppSpacing.md),
          Text('No words yet', style: AppTextStyles.h4),
          const SizedBox(height: AppSpacing.xs),
          Text(
            'Add your first word to start learning',
            style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: AppSpacing.xl),
          PrimaryButton(
            label: 'Add Your First Word',
            fullWidth: false,
            onPressed: () => _showAddWordDialog(),
          ),
        ],
      ),
    );
  }

  Map<String, int> _calculateStats(List<Word> words) {
    return {
      'total': words.length,
      'new': words.where((w) => w.difficulty == Difficulty.newWord).length,
      'mastered': words.where((w) => w.difficulty == Difficulty.mastered).length,
      'learning': words.where((w) =>
          w.difficulty == Difficulty.learning ||
          w.difficulty == Difficulty.newWord).length,
      'review': words.where((w) =>
          w.difficulty == Difficulty.review ||
          w.difficulty == Difficulty.failed).length,
    };
  }

  void _startStudySession(List<Word> words, String type) {
    List<Word> filteredWords;
    switch (type) {
      case 'new':
        filteredWords = words.where((w) => w.difficulty == Difficulty.newWord).toList();
        break;
      case 'due':
        filteredWords = words.where((w) =>
          DateTime.now().isAfter(w.nextReview) ||
          w.difficulty == Difficulty.newWord
        ).toList();
        break;
      default:
        filteredWords = words;
    }

    if (filteredWords.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('No words available for this study type')),
      );
      return;
    }

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => StudySessionScreen(initialWords: filteredWords),
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
              decoration: const InputDecoration(
                hintText: 'Article (der/die/das)',
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            TextField(
              controller: wordController,
              decoration: const InputDecoration(
                hintText: 'Word',
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            TextField(
              controller: definitionController,
              decoration: const InputDecoration(
                hintText: 'Definition',
              ),
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
}
