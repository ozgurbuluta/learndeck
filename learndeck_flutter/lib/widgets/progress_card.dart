import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class ProgressCard extends StatelessWidget {
  final int totalWords;
  final int masteredWords;
  final int dayStreak;

  const ProgressCard({
    super.key,
    required this.totalWords,
    required this.masteredWords,
    this.dayStreak = 0,
  });

  int get masteredPercentage {
    if (totalWords == 0) return 0;
    return ((masteredWords / totalWords) * 100).round();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.xl),
      decoration: BoxDecoration(
        color: AppColors.surfaceVariant,
        borderRadius: BorderRadius.circular(AppRadius.lg),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _ProgressItem(
            value: '$totalWords',
            label: 'Total Words',
            color: AppColors.primary,
          ),
          _ProgressItem(
            value: '$dayStreak',
            label: 'Day Streak',
            color: AppColors.warning,
          ),
          _ProgressItem(
            value: '$masteredPercentage%',
            label: 'Mastered',
            color: AppColors.success,
          ),
        ],
      ),
    );
  }
}

class _ProgressItem extends StatelessWidget {
  final String value;
  final String label;
  final Color color;

  const _ProgressItem({
    required this.value,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          value,
          style: AppTextStyles.statNumber.copyWith(color: color),
        ),
        const SizedBox(height: AppSpacing.xs),
        Text(
          label,
          style: AppTextStyles.labelSmall,
        ),
      ],
    );
  }
}
