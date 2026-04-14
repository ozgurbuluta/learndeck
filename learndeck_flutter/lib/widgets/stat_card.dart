import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../theme/app_theme.dart';
import 'animated_widgets.dart';

class StatCard extends StatelessWidget {
  final String label;
  final int value;
  final IconData? icon;
  final PhosphorIconData? phosphorIcon;
  final Color? iconColor;
  final VoidCallback? onTap;
  final bool animateValue;

  const StatCard({
    super.key,
    required this.label,
    required this.value,
    this.icon,
    this.phosphorIcon,
    this.iconColor,
    this.onTap,
    this.animateValue = true,
  }) : assert(icon != null || phosphorIcon != null, 'Either icon or phosphorIcon must be provided');

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
          if (phosphorIcon != null)
            PhosphorIcon(
              phosphorIcon!,
              color: iconColor ?? AppColors.primary,
              size: 28,
            )
          else
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
