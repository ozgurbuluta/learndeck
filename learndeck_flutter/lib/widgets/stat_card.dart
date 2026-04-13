import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import 'animated_widgets.dart';

class StatCard extends StatelessWidget {
  final String label;
  final int value;
  final IconData icon;
  final Color? iconColor;
  final VoidCallback? onTap;
  final bool animateValue;

  const StatCard({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
    this.iconColor,
    this.onTap,
    this.animateValue = true,
  });

  @override
  Widget build(BuildContext context) {
    final content = Container(
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
          animateValue
              ? AnimatedCount(
                  value: value,
                  style: AppTextStyles.statNumber,
                )
              : Text(
                  '$value',
                  style: AppTextStyles.statNumber,
                ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            label,
            style: AppTextStyles.labelSmall,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );

    if (onTap != null) {
      return TapScaleWrapper(
        onTap: onTap,
        child: content,
      );
    }
    return content;
  }
}
