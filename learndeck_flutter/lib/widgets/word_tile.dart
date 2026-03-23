import 'package:flutter/material.dart';
import '../models/word.dart';
import '../theme/app_theme.dart';
import 'difficulty_badge.dart';

class WordTile extends StatelessWidget {
  final Word word;
  final VoidCallback? onTap;
  final VoidCallback? onSpeakPressed;
  final Widget? trailing;

  const WordTile({
    super.key,
    required this.word,
    this.onTap,
    this.onSpeakPressed,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: AppSpacing.md),
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            if (onSpeakPressed != null) ...[
              GestureDetector(
                onTap: onSpeakPressed,
                child: Container(
                  padding: const EdgeInsets.all(AppSpacing.sm),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                  ),
                  child: Icon(
                    Icons.volume_up_rounded,
                    color: AppColors.primary,
                    size: 20,
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
            ],
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    word.displayWord,
                    style: AppTextStyles.bodyLarge.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    word.definition,
                    style: AppTextStyles.body.copyWith(
                      color: AppColors.textSecondary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            trailing ?? DifficultyBadge(difficulty: word.difficulty),
          ],
        ),
      ),
    );
  }
}
