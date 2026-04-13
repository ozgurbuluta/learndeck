import 'package:flutter/material.dart';
import '../models/word.dart';
import '../theme/app_theme.dart';

class DifficultyBadge extends StatelessWidget {
  final Difficulty difficulty;
  final bool compact;

  const DifficultyBadge({
    super.key,
    required this.difficulty,
    this.compact = false,
  });

  Color get _color {
    switch (difficulty) {
      case Difficulty.newWord:
        return AppColors.difficultyNew;
      case Difficulty.learning:
        return AppColors.difficultyLearning;
      case Difficulty.review:
        return AppColors.difficultyReview;
      case Difficulty.mastered:
        return AppColors.difficultyMastered;
      case Difficulty.failed:
        return AppColors.difficultyFailed;
    }
  }

  String get _label {
    switch (difficulty) {
      case Difficulty.newWord:
        return 'New';
      case Difficulty.learning:
        return 'Learning';
      case Difficulty.review:
        return 'Review';
      case Difficulty.mastered:
        return 'Mastered';
      case Difficulty.failed:
        return 'Failed';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: compact ? AppSpacing.sm : AppSpacing.md,
        vertical: compact ? AppSpacing.xs : AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: _color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(AppRadius.full),
      ),
      child: Text(
        _label,
        style: (compact ? AppTextStyles.badgeSmall : AppTextStyles.badge).copyWith(
          color: _color,
        ),
      ),
    );
  }
}
