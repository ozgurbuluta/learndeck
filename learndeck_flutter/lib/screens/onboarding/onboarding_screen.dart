import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../models/user_preferences.dart';
import '../../providers/user_preferences_provider.dart';
import '../../theme/app_theme.dart';
import '../../utils/page_transitions.dart';
import 'quiz_screen.dart';
import 'starter_vocabulary_screen.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  // User selections
  String _selectedTargetLanguage = '';
  String _selectedNativeLanguage = 'English'; // Default to English
  List<String> _selectedUseCases = [];
  List<String> _selectedCategories = [];
  int _selectedDailyGoal = 5;
  String _selectedLevel = '';
  bool _wantsQuiz = false;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _nextPage() {
    if (_currentPage < 4) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void _previousPage() {
    if (_currentPage > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  Future<void> _completeOnboarding() async {
    if (_wantsQuiz) {
      // Navigate to quiz
      final result = await context.pushScreen<int>(
        QuizScreen(
          targetLanguage: _selectedTargetLanguage,
          onComplete: (score) => Navigator.pop(context, score),
        ),
      );

      if (result != null) {
        // Determine level based on quiz score
        String level;
        if (result >= 8) {
          level = 'advanced';
        } else if (result >= 5) {
          level = 'intermediate';
        } else {
          level = 'beginner';
        }

        await _savePreferences(level, result);
      }
    } else {
      await _savePreferences(_selectedLevel, null);
    }
  }

  Future<void> _savePreferences(String level, int? quizScore) async {
    final prefs = UserPreferences(
      targetLanguage: _selectedTargetLanguage,
      nativeLanguage: _selectedNativeLanguage,
      useCases: _selectedUseCases,
      categories: _selectedCategories,
      dailyGoal: _selectedDailyGoal,
      level: level,
      quizScore: quizScore,
      onboardingCompleted: true,
      createdAt: DateTime.now(),
    );

    await ref.read(userPreferencesProvider.notifier).savePreferences(prefs);

    if (mounted) {
      context.pushAndRemoveUntilScreen(
        StarterVocabularyScreen(preferences: prefs),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Progress indicator
            Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Row(
                children: List.generate(5, (index) {
                  return Expanded(
                    child: Container(
                      height: 4,
                      margin: const EdgeInsets.symmetric(horizontal: 2),
                      decoration: BoxDecoration(
                        color: index <= _currentPage
                            ? AppColors.primary
                            : AppColors.border,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  );
                }),
              ),
            ),

            // Pages
            Expanded(
              child: PageView(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                onPageChanged: (page) {
                  setState(() => _currentPage = page);
                },
                children: [
                  _buildWelcomePage(),
                  _buildLanguagePage(),
                  _buildCategoriesPage(),
                  _buildGoalPage(),
                  _buildLevelPage(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWelcomePage() {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              gradient: AppGradients.primaryGradient,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.3),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: const Center(
              child: PhosphorIcon(
                PhosphorIconsDuotone.graduationCap,
                size: 60,
                color: Colors.white,
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.xxl),
          Text(
            'Welcome to LearnDeck!',
            style: AppTextStyles.h1,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            'Let\'s personalize your learning experience. We\'ll ask a few questions to tailor vocabulary to your needs.',
            style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
            textAlign: TextAlign.center,
          ),
          const Spacer(),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _nextPage,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: AppColors.textOnPrimary,
                padding: const EdgeInsets.symmetric(vertical: AppSpacing.lg),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
              ),
              child: const Text('Get Started'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLanguagePage() {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('I want to learn', style: AppTextStyles.h2),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Select the language you want to learn',
            style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: AppSpacing.xxl),

          // Target language grid (3x3)
          Expanded(
            child: GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: AppSpacing.md,
                mainAxisSpacing: AppSpacing.md,
                childAspectRatio: 0.85,
              ),
              itemCount: LanguageOption.targetLanguages.length,
              itemBuilder: (context, index) {
                final lang = LanguageOption.targetLanguages[index];
                final isSelected = _selectedTargetLanguage == lang.name;
                return _buildLanguageGridCard(
                  language: lang,
                  isSelected: isSelected,
                  onTap: () {
                    setState(() {
                      _selectedTargetLanguage = lang.name;
                    });
                  },
                );
              },
            ),
          ),

          const SizedBox(height: AppSpacing.lg),
          _buildNavigationButtons(
            canProceed: _selectedTargetLanguage.isNotEmpty,
          ),
        ],
      ),
    );
  }

  Widget _buildLanguageGridCard({
    required LanguageOption language,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
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
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              language.flag,
              style: const TextStyle(fontSize: 36),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              language.name,
              style: AppTextStyles.labelSmall.copyWith(
                color: isSelected ? AppColors.primary : AppColors.textPrimary,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
              ),
              textAlign: TextAlign.center,
            ),
            Text(
              language.nativeName,
              style: AppTextStyles.labelSmall.copyWith(
                color: AppColors.textTertiary,
                fontSize: 10,
              ),
              textAlign: TextAlign.center,
            ),
            if (isSelected)
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.xs),
                child: Icon(
                  PhosphorIcons.checkCircle(PhosphorIconsStyle.fill),
                  color: AppColors.primary,
                  size: 16,
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoriesPage() {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('What interests you?', style: AppTextStyles.h2),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Pick at least 3 topics',
            style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: AppSpacing.xl),
          Expanded(
            child: GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: AppSpacing.md,
                mainAxisSpacing: AppSpacing.md,
                childAspectRatio: 0.9,
              ),
              itemCount: CategoryOption.options.length,
              itemBuilder: (context, index) {
                final option = CategoryOption.options[index];
                final isSelected = _selectedCategories.contains(option.id);
                return _buildCategoryChip(
                  title: option.title,
                  icon: _getPhosphorIcon(option.icon),
                  isSelected: isSelected,
                  accentColor: _getCategoryColor(index),
                  onTap: () {
                    setState(() {
                      if (isSelected) {
                        _selectedCategories.remove(option.id);
                      } else {
                        _selectedCategories.add(option.id);
                      }
                    });
                  },
                );
              },
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          _buildNavigationButtons(
            canProceed: _selectedCategories.length >= 3,
          ),
        ],
      ),
    );
  }

  Widget _buildGoalPage() {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Set your daily goal', style: AppTextStyles.h2),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'How many words do you want to learn each day?',
            style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: AppSpacing.xxl),
          Expanded(
            child: ListView.builder(
              itemCount: DailyGoalOption.options.length,
              itemBuilder: (context, index) {
                final option = DailyGoalOption.options[index];
                final isSelected = _selectedDailyGoal == option.words;
                return _buildGoalOption(
                  option: option,
                  isSelected: isSelected,
                  onTap: () {
                    setState(() {
                      _selectedDailyGoal = option.words;
                    });
                  },
                );
              },
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          _buildNavigationButtons(canProceed: true),
        ],
      ),
    );
  }

  Widget _buildGoalOption({
    required DailyGoalOption option,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    final accentColor = _getGoalColor(option.words);
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: AppSpacing.md),
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: isSelected
              ? accentColor.withValues(alpha: 0.1)
              : AppColors.surface,
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(
            color: isSelected ? accentColor : AppColors.border,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: accentColor.withValues(alpha: 0.15),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: isSelected
                    ? accentColor.withValues(alpha: 0.2)
                    : AppColors.surfaceVariant,
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
              child: PhosphorIcon(
                _getGoalIcon(option.icon),
                color: isSelected ? accentColor : AppColors.textSecondary,
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(option.title, style: AppTextStyles.labelLarge),
                  Text(
                    option.description,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            if (isSelected)
              PhosphorIcon(
                PhosphorIcons.checkCircle(PhosphorIconsStyle.fill),
                color: accentColor,
              ),
          ],
        ),
      ),
    );
  }

  PhosphorIconData _getGoalIcon(String iconName) {
    switch (iconName) {
      case 'walk':
        return PhosphorIcons.personSimpleWalk(PhosphorIconsStyle.duotone);
      case 'directions_run':
        return PhosphorIcons.personSimpleRun(PhosphorIconsStyle.duotone);
      case 'fitness_center':
        return PhosphorIcons.barbell(PhosphorIconsStyle.duotone);
      case 'local_fire_department':
        return PhosphorIcons.flame(PhosphorIconsStyle.duotone);
      default:
        return PhosphorIcons.star(PhosphorIconsStyle.duotone);
    }
  }

  Color _getGoalColor(int words) {
    switch (words) {
      case 3:
        return AppColors.teal;
      case 5:
        return AppColors.accent;
      case 10:
        return AppColors.primary;
      case 15:
        return AppColors.coral;
      default:
        return AppColors.primary;
    }
  }

  Widget _buildLevelPage() {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('What\'s your level?', style: AppTextStyles.h2),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Choose your current proficiency or take a quick quiz',
            style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: AppSpacing.xl),

          // Level options
          _buildLevelOption(
            title: 'Beginner',
            subtitle: 'A1-A2: Basic phrases and vocabulary',
            level: 'beginner',
          ),
          _buildLevelOption(
            title: 'Intermediate',
            subtitle: 'B1-B2: Everyday conversations',
            level: 'intermediate',
          ),
          _buildLevelOption(
            title: 'Advanced',
            subtitle: 'C1-C2: Complex topics and nuance',
            level: 'advanced',
          ),

          const SizedBox(height: AppSpacing.xl),

          // Divider
          Row(
            children: [
              const Expanded(child: Divider()),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                child: Text(
                  'OR',
                  style: AppTextStyles.labelSmall.copyWith(
                    color: AppColors.textTertiary,
                  ),
                ),
              ),
              const Expanded(child: Divider()),
            ],
          ),

          const SizedBox(height: AppSpacing.xl),

          // Quiz option
          GestureDetector(
            onTap: () {
              setState(() {
                _wantsQuiz = !_wantsQuiz;
                if (_wantsQuiz) _selectedLevel = '';
              });
            },
            child: Container(
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: BoxDecoration(
                color: _wantsQuiz
                    ? AppColors.primary.withValues(alpha: 0.1)
                    : AppColors.surface,
                borderRadius: BorderRadius.circular(AppRadius.md),
                border: Border.all(
                  color: _wantsQuiz ? AppColors.primary : AppColors.border,
                  width: _wantsQuiz ? 2 : 1,
                ),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                    ),
                    child: PhosphorIcon(
                      PhosphorIcons.exam(PhosphorIconsStyle.duotone),
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Take a Quick Quiz',
                          style: AppTextStyles.labelLarge,
                        ),
                        Text(
                          '10 questions to find your level',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (_wantsQuiz)
                    Icon(PhosphorIcons.checkCircle(PhosphorIconsStyle.fill), color: AppColors.primary),
                ],
              ),
            ),
          ),

          const Spacer(),
          _buildNavigationButtons(
            canProceed: _selectedLevel.isNotEmpty || _wantsQuiz,
            isLastPage: true,
          ),
        ],
      ),
    );
  }

  Widget _buildLevelOption({
    required String title,
    required String subtitle,
    required String level,
  }) {
    final isSelected = _selectedLevel == level;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedLevel = level;
          _wantsQuiz = false;
        });
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: AppSpacing.md),
        padding: const EdgeInsets.all(AppSpacing.lg),
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
                  Text(title, style: AppTextStyles.labelLarge),
                  Text(
                    subtitle,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            if (isSelected) Icon(PhosphorIcons.checkCircle(PhosphorIconsStyle.fill), color: AppColors.primary),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryChip({
    required String title,
    required PhosphorIconData icon,
    required bool isSelected,
    required VoidCallback onTap,
    required Color accentColor,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          color: isSelected
              ? accentColor.withValues(alpha: 0.15)
              : AppColors.surface,
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(
            color: isSelected ? accentColor : AppColors.border,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: accentColor.withValues(alpha: 0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            PhosphorIcon(
              icon,
              color: isSelected ? accentColor : AppColors.textSecondary,
              size: 28,
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              title,
              style: AppTextStyles.labelSmall.copyWith(
                color: isSelected ? accentColor : AppColors.textSecondary,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            if (isSelected)
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.xs),
                child: PhosphorIcon(
                  PhosphorIcons.checkCircle(PhosphorIconsStyle.fill),
                  color: accentColor,
                  size: 16,
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildNavigationButtons({
    required bool canProceed,
    bool isLastPage = false,
  }) {
    return Row(
      children: [
        if (_currentPage > 0)
          Expanded(
            child: OutlinedButton(
              onPressed: _previousPage,
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: AppSpacing.lg),
                side: BorderSide(color: AppColors.border),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
              ),
              child: const Text('Back'),
            ),
          ),
        if (_currentPage > 0) const SizedBox(width: AppSpacing.md),
        Expanded(
          flex: _currentPage > 0 ? 2 : 1,
          child: ElevatedButton(
            onPressed: canProceed
                ? (isLastPage ? _completeOnboarding : _nextPage)
                : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: AppColors.textOnPrimary,
              disabledBackgroundColor: AppColors.border,
              padding: const EdgeInsets.symmetric(vertical: AppSpacing.lg),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
            ),
            child: Text(isLastPage
                ? (_wantsQuiz ? 'Start Quiz' : 'Complete')
                : 'Continue'),
          ),
        ),
      ],
    );
  }

  PhosphorIconData _getPhosphorIcon(String iconName) {
    switch (iconName) {
      case 'work':
        return PhosphorIcons.briefcase(PhosphorIconsStyle.duotone);
      case 'home':
        return PhosphorIcons.house(PhosphorIconsStyle.duotone);
      case 'flight':
        return PhosphorIcons.airplane(PhosphorIconsStyle.duotone);
      case 'school':
        return PhosphorIcons.graduationCap(PhosphorIconsStyle.duotone);
      case 'restaurant':
        return PhosphorIcons.forkKnife(PhosphorIconsStyle.duotone);
      case 'business':
        return PhosphorIcons.buildings(PhosphorIconsStyle.duotone);
      case 'explore':
        return PhosphorIcons.compass(PhosphorIconsStyle.duotone);
      case 'medical_services':
        return PhosphorIcons.firstAidKit(PhosphorIconsStyle.duotone);
      case 'computer':
        return PhosphorIcons.laptop(PhosphorIconsStyle.duotone);
      case 'palette':
        return PhosphorIcons.palette(PhosphorIconsStyle.duotone);
      case 'sports_soccer':
        return PhosphorIcons.soccerBall(PhosphorIconsStyle.duotone);
      case 'park':
        return PhosphorIcons.tree(PhosphorIconsStyle.duotone);
      case 'family_restroom':
        return PhosphorIcons.users(PhosphorIconsStyle.duotone);
      case 'shopping_bag':
        return PhosphorIcons.shoppingBag(PhosphorIconsStyle.duotone);
      case 'mood':
        return PhosphorIcons.smiley(PhosphorIconsStyle.duotone);
      case 'schedule':
        return PhosphorIcons.clock(PhosphorIconsStyle.duotone);
      default:
        return PhosphorIcons.star(PhosphorIconsStyle.duotone);
    }
  }

  // Category colors for playful UI
  Color _getCategoryColor(int index) {
    final colors = [
      AppColors.primary,
      AppColors.accent,
      AppColors.coral,
      AppColors.teal,
      AppColors.pink,
      AppColors.cyan,
      AppColors.lime,
      AppColors.amber,
      AppColors.violet,
    ];
    return colors[index % colors.length];
  }
}
