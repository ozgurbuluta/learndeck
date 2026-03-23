import 'package:flutter/material.dart';
import '../../models/user_preferences.dart';
import '../../theme/app_theme.dart';

class QuizScreen extends StatefulWidget {
  final Function(int score) onComplete;

  const QuizScreen({super.key, required this.onComplete});

  @override
  State<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> {
  int _currentQuestion = 0;
  int _score = 0;
  int? _selectedAnswer;
  bool _answered = false;

  final List<QuizQuestion> _questions = QuizQuestion.germanQuiz;

  void _selectAnswer(int index) {
    if (_answered) return;

    setState(() {
      _selectedAnswer = index;
      _answered = true;
      if (index == _questions[_currentQuestion].correctIndex) {
        _score++;
      }
    });

    // Auto-advance after delay
    Future.delayed(const Duration(milliseconds: 800), () {
      if (_currentQuestion < _questions.length - 1) {
        setState(() {
          _currentQuestion++;
          _selectedAnswer = null;
          _answered = false;
        });
      } else {
        _showResults();
      }
    });
  }

  void _showResults() {
    showModalBottomSheet(
      context: context,
      isDismissible: false,
      enableDrag: false,
      backgroundColor: Colors.transparent,
      builder: (context) => _buildResultsSheet(),
    );
  }

  Widget _buildResultsSheet() {
    String level;
    String levelTitle;
    String levelDescription;
    Color levelColor;

    if (_score >= 8) {
      level = 'advanced';
      levelTitle = 'Advanced (C1-C2)';
      levelDescription =
          'Impressive! You have a strong command of German. We\'ll challenge you with complex vocabulary.';
      levelColor = Colors.purple;
    } else if (_score >= 5) {
      level = 'intermediate';
      levelTitle = 'Intermediate (B1-B2)';
      levelDescription =
          'Great job! You have solid foundations. We\'ll help you expand your conversational skills.';
      levelColor = Colors.blue;
    } else {
      level = 'beginner';
      levelTitle = 'Beginner (A1-A2)';
      levelDescription =
          'Good start! We\'ll build your vocabulary from the ground up with essential words and phrases.';
      levelColor = Colors.green;
    }

    return Container(
      padding: const EdgeInsets.all(AppSpacing.xl),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: const BorderRadius.vertical(
          top: Radius.circular(AppRadius.xl),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              color: levelColor.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                '$_score/${_questions.length}',
                style: AppTextStyles.h1.copyWith(color: levelColor),
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          Text(
            'Your Level: $levelTitle',
            style: AppTextStyles.h2,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            levelDescription,
            style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.xxl),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                Navigator.pop(context); // Close bottom sheet
                widget.onComplete(_score);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: AppColors.textOnPrimary,
                padding: const EdgeInsets.symmetric(vertical: AppSpacing.lg),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
              ),
              child: const Text('Continue'),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final question = _questions[_currentQuestion];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        title: Text('Question ${_currentQuestion + 1}/${_questions.length}'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.xl),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Progress bar
              LinearProgressIndicator(
                value: (_currentQuestion + 1) / _questions.length,
                backgroundColor: AppColors.border,
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                borderRadius: BorderRadius.circular(2),
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                'Level: ${question.difficulty.toUpperCase()}',
                style: AppTextStyles.labelSmall.copyWith(
                  color: AppColors.textTertiary,
                ),
              ),

              const SizedBox(height: AppSpacing.xxl),

              // Question
              Text(
                question.question,
                style: AppTextStyles.h2,
              ),

              const SizedBox(height: AppSpacing.xxl),

              // Options
              ...List.generate(question.options.length, (index) {
                final isSelected = _selectedAnswer == index;
                final isCorrect = index == question.correctIndex;
                final showResult = _answered;

                Color backgroundColor = AppColors.surface;
                Color borderColor = AppColors.border;

                if (showResult) {
                  if (isCorrect) {
                    backgroundColor = Colors.green.withValues(alpha: 0.1);
                    borderColor = Colors.green;
                  } else if (isSelected && !isCorrect) {
                    backgroundColor = Colors.red.withValues(alpha: 0.1);
                    borderColor = Colors.red;
                  }
                } else if (isSelected) {
                  backgroundColor = AppColors.primary.withValues(alpha: 0.1);
                  borderColor = AppColors.primary;
                }

                return GestureDetector(
                  onTap: () => _selectAnswer(index),
                  child: Container(
                    width: double.infinity,
                    margin: const EdgeInsets.only(bottom: AppSpacing.md),
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    decoration: BoxDecoration(
                      color: backgroundColor,
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      border: Border.all(color: borderColor, width: 1.5),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: borderColor.withValues(alpha: 0.2),
                            shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: Text(
                              String.fromCharCode(65 + index), // A, B, C, D
                              style: AppTextStyles.labelLarge.copyWith(
                                color: borderColor,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: AppSpacing.md),
                        Expanded(
                          child: Text(
                            question.options[index],
                            style: AppTextStyles.body,
                          ),
                        ),
                        if (showResult && isCorrect)
                          const Icon(Icons.check_circle, color: Colors.green),
                        if (showResult && isSelected && !isCorrect)
                          const Icon(Icons.cancel, color: Colors.red),
                      ],
                    ),
                  ),
                );
              }),

              const Spacer(),

              // Score indicator
              Center(
                child: Text(
                  'Score: $_score/${_currentQuestion + (_answered ? 1 : 0)}',
                  style: AppTextStyles.labelLarge.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
