import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/user_preferences.dart';
import '../../providers/user_preferences_provider.dart';
import '../../theme/app_theme.dart';
import '../home_screen.dart';
import 'quiz_screen.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  // User selections
  List<String> _selectedUseCases = [];
  List<String> _selectedCategories = [];
  String _selectedLevel = '';
  bool _wantsQuiz = false;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _nextPage() {
    if (_currentPage < 3) {
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
      final result = await Navigator.push<int>(
        context,
        MaterialPageRoute(
          builder: (context) => QuizScreen(
            onComplete: (score) => Navigator.pop(context, score),
          ),
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
      targetLanguage: 'German',
      useCases: _selectedUseCases,
      categories: _selectedCategories,
      level: level,
      quizScore: quizScore,
      onboardingCompleted: true,
      createdAt: DateTime.now(),
    );

    await ref.read(userPreferencesProvider.notifier).savePreferences(prefs);

    if (mounted) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => const HomeScreen()),
        (route) => false,
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
                children: List.generate(4, (index) {
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
                  _buildUseCasePage(),
                  _buildCategoriesPage(),
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
              color: AppColors.primary.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.school_rounded,
              size: 60,
              color: AppColors.primary,
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

  Widget _buildUseCasePage() {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Why are you learning?', style: AppTextStyles.h2),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Select all that apply',
            style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: AppSpacing.xl),
          Expanded(
            child: ListView.builder(
              itemCount: UseCaseOption.options.length,
              itemBuilder: (context, index) {
                final option = UseCaseOption.options[index];
                final isSelected = _selectedUseCases.contains(option.id);
                return _buildOptionCard(
                  title: option.title,
                  description: option.description,
                  icon: _getIcon(option.icon),
                  isSelected: isSelected,
                  onTap: () {
                    setState(() {
                      if (isSelected) {
                        _selectedUseCases.remove(option.id);
                      } else {
                        _selectedUseCases.add(option.id);
                      }
                    });
                  },
                );
              },
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          _buildNavigationButtons(
            canProceed: _selectedUseCases.isNotEmpty,
          ),
        ],
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
                  icon: _getIcon(option.icon),
                  isSelected: isSelected,
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
                    child: Icon(
                      Icons.quiz_rounded,
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
                    Icon(Icons.check_circle, color: AppColors.primary),
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
            if (isSelected) Icon(Icons.check_circle, color: AppColors.primary),
          ],
        ),
      ),
    );
  }

  Widget _buildOptionCard({
    required String title,
    required String description,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
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
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
              child: Icon(icon, color: AppColors.primary),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: AppTextStyles.labelLarge),
                  Text(
                    description,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            if (isSelected) Icon(Icons.check_circle, color: AppColors.primary),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryChip({
    required String title,
    required IconData icon,
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
            Icon(
              icon,
              color: isSelected ? AppColors.primary : AppColors.textSecondary,
              size: 28,
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              title,
              style: AppTextStyles.labelSmall.copyWith(
                color: isSelected ? AppColors.primary : AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            if (isSelected)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Icon(
                  Icons.check_circle,
                  color: AppColors.primary,
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

  IconData _getIcon(String iconName) {
    switch (iconName) {
      case 'work':
        return Icons.work_rounded;
      case 'home':
        return Icons.home_rounded;
      case 'flight':
        return Icons.flight_rounded;
      case 'school':
        return Icons.school_rounded;
      case 'restaurant':
        return Icons.restaurant_rounded;
      case 'business':
        return Icons.business_center_rounded;
      case 'explore':
        return Icons.explore_rounded;
      case 'medical_services':
        return Icons.medical_services_rounded;
      case 'computer':
        return Icons.computer_rounded;
      case 'palette':
        return Icons.palette_rounded;
      case 'sports_soccer':
        return Icons.sports_soccer_rounded;
      case 'park':
        return Icons.park_rounded;
      case 'family_restroom':
        return Icons.family_restroom_rounded;
      case 'shopping_bag':
        return Icons.shopping_bag_rounded;
      case 'mood':
        return Icons.mood_rounded;
      case 'schedule':
        return Icons.schedule_rounded;
      default:
        return Icons.circle;
    }
  }
}
