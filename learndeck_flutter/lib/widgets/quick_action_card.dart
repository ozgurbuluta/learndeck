import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../theme/app_theme.dart';
import 'animated_widgets.dart';

class QuickActionCard extends StatelessWidget {
  final IconData? icon;
  final PhosphorIconData? phosphorIcon;
  final String label;
  final VoidCallback? onTap;
  final Color? iconColor;

  const QuickActionCard({
    super.key,
    this.icon,
    this.phosphorIcon,
    required this.label,
    this.onTap,
    this.iconColor,
  }) : assert(icon != null || phosphorIcon != null, 'Either icon or phosphorIcon must be provided');

  @override
  Widget build(BuildContext context) {
    return TapScaleWrapper(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.lg),
        decoration: BoxDecoration(
          color: AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
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
            const SizedBox(height: AppSpacing.sm),
            Text(
              label,
              style: AppTextStyles.labelSmall,
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
