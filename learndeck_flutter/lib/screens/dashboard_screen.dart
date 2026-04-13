import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/word.dart';
import '../models/folder.dart';
import '../providers/words_provider.dart';
import '../providers/folders_provider.dart';
import '../providers/user_preferences_provider.dart';
import '../providers/user_activity_provider.dart';
import '../services/firebase_service.dart';
import '../theme/app_theme.dart';
import '../widgets/widgets.dart';
import 'study_session_screen.dart';
import 'import_screen.dart';
import 'ai_chat_screen.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  String? _selectedFolderId;
  Set<String> _folderWordIds = {};
  bool _loadingFolderWords = false;

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(wordsProvider.notifier).loadWords();
      ref.read(foldersProvider.notifier).loadFolders();
      ref.read(userActivityProvider.notifier).loadActivity();
    });
  }

  Future<void> _loadFolderWords(String? folderId) async {
    if (folderId == null) {
      setState(() {
        _folderWordIds = {};
        _loadingFolderWords = false;
      });
      return;
    }

    setState(() => _loadingFolderWords = true);
    try {
      final wordIds = await FirebaseService.getWordsInFolder(folderId);
      setState(() {
        _folderWordIds = wordIds.toSet();
        _loadingFolderWords = false;
      });
    } catch (e) {
      setState(() => _loadingFolderWords = false);
    }
  }

  List<Word> _getFilteredWords(List<Word> allWords) {
    if (_selectedFolderId == null) return allWords;
    return allWords.where((w) => _folderWordIds.contains(w.id)).toList();
  }

  @override
  Widget build(BuildContext context) {
    final wordsAsync = ref.watch(wordsProvider);
    final foldersAsync = ref.watch(foldersProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: wordsAsync.when(
          loading: () => Center(
            child: CircularProgressIndicator(color: AppColors.primary),
          ),
          error: (error, _) => _buildErrorState(error),
          data: (allWords) {
            final folders = foldersAsync.valueOrNull ?? [];
            final words = _getFilteredWords(allWords);
            return _buildDashboardContent(allWords, words, folders);
          },
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

  Widget _buildDashboardContent(List<Word> allWords, List<Word> words, List<Folder> folders) {
    final stats = _calculateStats(words);
    final dueWords = words.where((w) =>
      DateTime.now().isAfter(w.nextReview) ||
      (w.difficulty == Difficulty.newWord)
    ).length;
    final userPrefs = ref.watch(userPreferencesProvider).valueOrNull;
    final dailyGoal = userPrefs?.dailyGoal ?? 5;
    final todayWords = _countTodayWords(allWords);

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Personalized Header
          Container(
            padding: const EdgeInsets.all(AppSpacing.xl),
            color: AppColors.surface,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(_getGreeting(), style: AppTextStyles.h1),
                        const SizedBox(height: AppSpacing.xs),
                        if (userPrefs != null)
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: AppSpacing.sm,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(AppRadius.sm),
                                ),
                                child: Text(
                                  userPrefs.targetLanguage,
                                  style: AppTextStyles.labelSmall.copyWith(
                                    color: AppColors.primary,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                              const SizedBox(width: AppSpacing.sm),
                              Text(
                                userPrefs.levelDescription,
                                style: AppTextStyles.bodySmall.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          )
                        else
                          Text(
                            'Ready to learn some vocabulary?',
                            style: AppTextStyles.bodyLarge.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.lg),
                // Daily Goal Progress
                _buildDailyGoalProgress(todayWords, dailyGoal),
              ],
            ),
          ),

          // Folder Selector
          if (folders.isNotEmpty && allWords.isNotEmpty)
            _buildSection(
              title: 'Select Folder',
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildFolderChip(null, 'All Words', folders),
                    ...folders.map((f) => _buildFolderChip(f.id, f.name, folders)),
                  ],
                ),
              ),
            ),

          // Quick Study Section
          _buildSection(
            title: 'Quick Study',
            child: allWords.isEmpty
                ? _buildEmptyState()
                : _loadingFolderWords
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(AppSpacing.xl),
                          child: CircularProgressIndicator(color: AppColors.primary),
                        ),
                      )
                    : PrimaryButton(
                        label: 'Start Study Session',
                        subtitle: '$dueWords word${dueWords != 1 ? 's' : ''} ready to review',
                        icon: Icons.play_arrow_rounded,
                        onPressed: words.isEmpty
                            ? null
                            : () {
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
              child: _buildProgressSection(stats),
            ),

          // Quick Actions
          _buildSection(
            title: 'Quick Actions',
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: QuickActionCard(
                        icon: Icons.auto_awesome_rounded,
                        label: 'AI Assistant',
                        iconColor: AppColors.primary,
                        onTap: () => Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => const AIChatScreen()),
                        ),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: QuickActionCard(
                        icon: Icons.add_circle_outline_rounded,
                        label: 'Add Word',
                        onTap: () => _showAddWordDialog(),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),
                Row(
                  children: [
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
                        icon: Icons.folder_rounded,
                        label: 'Folders',
                        iconColor: AppColors.accent,
                        onTap: () => _showFoldersDialog(),
                      ),
                    ),
                  ],
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

  Widget _buildFolderChip(String? folderId, String label, List<Folder> folders) {
    final isSelected = _selectedFolderId == folderId;
    return Padding(
      padding: const EdgeInsets.only(right: AppSpacing.sm),
      child: GestureDetector(
        onTap: () {
          setState(() => _selectedFolderId = folderId);
          _loadFolderWords(folderId);
        },
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

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning!';
    if (hour < 17) return 'Good afternoon!';
    return 'Good evening!';
  }

  int _countTodayWords(List<Word> words) {
    final today = DateTime.now();
    return words.where((w) =>
      w.createdAt.year == today.year &&
      w.createdAt.month == today.month &&
      w.createdAt.day == today.day
    ).length;
  }

  Widget _buildProgressSection(Map<String, int> stats) {
    final activityAsync = ref.watch(userActivityProvider);
    final activity = activityAsync.valueOrNull;
    final currentStreak = activity?.effectiveStreak ?? 0;
    final longestStreak = activity?.longestStreak ?? 0;

    return Column(
      children: [
        // Streak display
        Container(
          padding: const EdgeInsets.all(AppSpacing.lg),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                AppColors.primary.withValues(alpha: 0.1),
                AppColors.primary.withValues(alpha: 0.05),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
                child: Icon(
                  Icons.local_fire_department_rounded,
                  color: currentStreak > 0 ? AppColors.primary : AppColors.textTertiary,
                  size: 32,
                ),
              ),
              const SizedBox(width: AppSpacing.lg),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '$currentStreak day${currentStreak != 1 ? 's' : ''} streak',
                      style: AppTextStyles.h3.copyWith(
                        color: AppColors.primary,
                      ),
                    ),
                    Text(
                      currentStreak > 0
                          ? 'Keep it up! Longest: $longestStreak days'
                          : 'Start learning to build your streak!',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              if (currentStreak >= 7)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: AppSpacing.xs,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.success,
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.emoji_events_rounded,
                        color: AppColors.textOnPrimary,
                        size: 14,
                      ),
                      const SizedBox(width: AppSpacing.xs),
                      Text(
                        'Hot!',
                        style: AppTextStyles.labelSmall.copyWith(
                          color: AppColors.textOnPrimary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        // Progress card
        ProgressCard(
          totalWords: stats['total']!,
          masteredWords: stats['mastered']!,
          dayStreak: currentStreak,
        ),
      ],
    );
  }

  Widget _buildDailyGoalProgress(int todayWords, int dailyGoal) {
    final progress = (todayWords / dailyGoal).clamp(0.0, 1.0);
    final isComplete = todayWords >= dailyGoal;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: isComplete
            ? AppColors.success.withValues(alpha: 0.1)
            : AppColors.surfaceVariant,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(
          color: isComplete ? AppColors.success : AppColors.border,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(
                    isComplete ? Icons.check_circle : Icons.local_fire_department_rounded,
                    color: isComplete ? AppColors.success : AppColors.primary,
                    size: 20,
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Text(
                    'Daily Goal',
                    style: AppTextStyles.labelLarge,
                  ),
                ],
              ),
              Text(
                '$todayWords / $dailyGoal words',
                style: AppTextStyles.labelSmall.copyWith(
                  color: isComplete ? AppColors.success : AppColors.textSecondary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.sm),
            child: LinearProgressIndicator(
              value: progress,
              backgroundColor: AppColors.border,
              valueColor: AlwaysStoppedAnimation<Color>(
                isComplete ? AppColors.success : AppColors.primary,
              ),
              minHeight: 8,
            ),
          ),
          if (isComplete) ...[
            const SizedBox(height: AppSpacing.sm),
            Text(
              'Goal complete! Great job!',
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.success,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ],
      ),
    );
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
        const SnackBar(content: Text('No words available for this study type')),
      );
      return;
    }

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => StudySessionScreen(initialWords: filteredWords),
      ),
    );
  }

  void _showFoldersDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.5,
        minChildSize: 0.3,
        maxChildSize: 0.9,
        expand: false,
        builder: (context, scrollController) => Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(AppSpacing.xl),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Manage Folders', style: AppTextStyles.h3),
                  IconButton(
                    icon: Icon(Icons.add_rounded, color: AppColors.primary),
                    onPressed: () {
                      Navigator.pop(context);
                      _showCreateFolderDialog();
                    },
                  ),
                ],
              ),
            ),
            Expanded(
              child: Consumer(
                builder: (context, ref, _) {
                  final foldersAsync = ref.watch(foldersProvider);
                  return foldersAsync.when(
                    loading: () => Center(
                      child: CircularProgressIndicator(color: AppColors.primary),
                    ),
                    error: (e, _) => Center(
                      child: Text('Error: $e'),
                    ),
                    data: (folders) {
                      if (folders.isEmpty) {
                        return Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.folder_outlined,
                                size: 48,
                                color: AppColors.textTertiary,
                              ),
                              const SizedBox(height: AppSpacing.md),
                              Text('No folders yet', style: AppTextStyles.h4),
                              const SizedBox(height: AppSpacing.sm),
                              Text(
                                'Create folders to organize your words',
                                style: AppTextStyles.body.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        );
                      }
                      return ListView.builder(
                        controller: scrollController,
                        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
                        itemCount: folders.length,
                        itemBuilder: (context, index) {
                          final folder = folders[index];
                          return Container(
                            margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                            decoration: BoxDecoration(
                              color: AppColors.surfaceVariant,
                              borderRadius: BorderRadius.circular(AppRadius.md),
                            ),
                            child: ListTile(
                              leading: Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(
                                  color: Color(int.parse(folder.color.replaceFirst('#', '0xFF'))),
                                  borderRadius: BorderRadius.circular(AppRadius.sm),
                                ),
                                child: Icon(
                                  Icons.folder_rounded,
                                  color: AppColors.textOnPrimary,
                                ),
                              ),
                              title: Text(folder.name, style: AppTextStyles.body),
                              trailing: IconButton(
                                icon: Icon(Icons.delete_outline, color: AppColors.error),
                                onPressed: () {
                                  ref.read(foldersProvider.notifier).deleteFolder(folder.id);
                                },
                              ),
                            ),
                          );
                        },
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showCreateFolderDialog() {
    final nameController = TextEditingController();
    String selectedColor = '#FF8C00';
    final colors = ['#FF8C00', '#6366F1', '#22C55E', '#EF4444', '#8B5CF6', '#3B82F6'];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Padding(
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
              Text('Create Folder', style: AppTextStyles.h3),
              const SizedBox(height: AppSpacing.xl),
              TextField(
                controller: nameController,
                decoration: const InputDecoration(hintText: 'Folder name'),
                autofocus: true,
              ),
              const SizedBox(height: AppSpacing.lg),
              Text('Color', style: AppTextStyles.label),
              const SizedBox(height: AppSpacing.sm),
              Wrap(
                spacing: AppSpacing.sm,
                children: colors.map((color) {
                  final isSelected = selectedColor == color;
                  return GestureDetector(
                    onTap: () => setModalState(() => selectedColor = color),
                    child: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: Color(int.parse(color.replaceFirst('#', '0xFF'))),
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                        border: isSelected
                            ? Border.all(color: AppColors.textPrimary, width: 3)
                            : null,
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: AppSpacing.xl),
              PrimaryButton(
                label: 'Create Folder',
                onPressed: () async {
                  if (nameController.text.isNotEmpty) {
                    await ref.read(foldersProvider.notifier).createFolder(
                          name: nameController.text,
                          color: selectedColor,
                        );
                    if (context.mounted) Navigator.pop(context);
                  }
                },
              ),
              const SizedBox(height: AppSpacing.xl),
            ],
          ),
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
                  // Record activity for streak
                  ref.read(userActivityProvider.notifier).recordWordAdded();
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
