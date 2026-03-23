import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class PrimaryButton extends StatelessWidget {
  final String label;
  final String? subtitle;
  final IconData? icon;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool fullWidth;

  const PrimaryButton({
    super.key,
    required this.label,
    this.subtitle,
    this.icon,
    this.onPressed,
    this.isLoading = false,
    this.fullWidth = true,
  });

  @override
  Widget build(BuildContext context) {
    final button = ElevatedButton(
      onPressed: isLoading ? null : onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.textOnPrimary,
        disabledBackgroundColor: AppColors.textTertiary,
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.xl,
          vertical: AppSpacing.lg,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        elevation: 0,
      ),
      child: isLoading
          ? const SizedBox(
              height: 24,
              width: 24,
              child: CircularProgressIndicator(
                color: AppColors.textOnPrimary,
                strokeWidth: 2,
              ),
            )
          : Row(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: fullWidth ? MainAxisSize.max : MainAxisSize.min,
              children: [
                if (icon != null) ...[
                  Icon(icon, size: 24),
                  const SizedBox(width: AppSpacing.md),
                ],
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      label,
                      style: AppTextStyles.button,
                    ),
                    if (subtitle != null) ...[
                      const SizedBox(height: AppSpacing.xs),
                      Text(
                        subtitle!,
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.textOnPrimary.withValues(alpha: 0.8),
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
    );

    return fullWidth ? SizedBox(width: double.infinity, child: button) : button;
  }
}

class SecondaryButton extends StatelessWidget {
  final String label;
  final IconData? icon;
  final VoidCallback? onPressed;
  final bool fullWidth;

  const SecondaryButton({
    super.key,
    required this.label,
    this.icon,
    this.onPressed,
    this.fullWidth = true,
  });

  @override
  Widget build(BuildContext context) {
    final button = OutlinedButton(
      onPressed: onPressed,
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.primary,
        side: const BorderSide(color: AppColors.primary, width: 2),
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.xl,
          vertical: AppSpacing.lg,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: fullWidth ? MainAxisSize.max : MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 24),
            const SizedBox(width: AppSpacing.md),
          ],
          Text(
            label,
            style: AppTextStyles.button.copyWith(color: AppColors.primary),
          ),
        ],
      ),
    );

    return fullWidth ? SizedBox(width: double.infinity, child: button) : button;
  }
}
