import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class StatCard extends StatelessWidget {
  final String label;
  final int value;
  final IconData icon;
  final Color? iconColor;
  final VoidCallback? onTap;

  const StatCard({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
    this.iconColor,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Icon(
              icon,
              color: iconColor ?? AppColors.primary,
              size: 28,
            ),
            const Spacer(),
            Text(
              '$value',
              style: AppTextStyles.statNumber,
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              label,
              style: AppTextStyles.labelSmall,
            ),
          ],
        ),
      ),
    );
  }
}
