import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// A drag handle indicator for bottom sheets
class DragHandle extends StatelessWidget {
  const DragHandle({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        width: 32,
        height: 4,
        margin: const EdgeInsets.only(bottom: AppSpacing.md),
        decoration: BoxDecoration(
          color: AppColors.border,
          borderRadius: BorderRadius.circular(AppRadius.full),
        ),
      ),
    );
  }
}

/// A standardized header for bottom sheets with drag handle and title
class BottomSheetHeader extends StatelessWidget {
  final String title;
  final Widget? trailing;

  const BottomSheetHeader({
    super.key,
    required this.title,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const DragHandle(),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                title,
                style: AppTextStyles.h3,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            if (trailing != null) ...[
              const SizedBox(width: AppSpacing.sm),
              trailing!,
            ],
          ],
        ),
        const SizedBox(height: AppSpacing.lg),
      ],
    );
  }
}

/// A standardized confirmation dialog
class AppConfirmDialog extends StatelessWidget {
  final String title;
  final String message;
  final String cancelLabel;
  final String confirmLabel;
  final Color? confirmColor;
  final VoidCallback? onConfirm;

  const AppConfirmDialog({
    super.key,
    required this.title,
    required this.message,
    this.cancelLabel = 'Cancel',
    this.confirmLabel = 'Confirm',
    this.confirmColor,
    this.onConfirm,
  });

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(title, style: AppTextStyles.h4),
      content: Text(message, style: AppTextStyles.body),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.lg),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context, false),
          child: Text(
            cancelLabel,
            style: AppTextStyles.button.copyWith(color: AppColors.textSecondary),
          ),
        ),
        TextButton(
          onPressed: () {
            onConfirm?.call();
            Navigator.pop(context, true);
          },
          child: Text(
            confirmLabel,
            style: AppTextStyles.button.copyWith(
              color: confirmColor ?? AppColors.primary,
            ),
          ),
        ),
      ],
    );
  }

  /// Show the dialog and return true if confirmed
  static Future<bool> show({
    required BuildContext context,
    required String title,
    required String message,
    String cancelLabel = 'Cancel',
    String confirmLabel = 'Confirm',
    Color? confirmColor,
  }) async {
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AppConfirmDialog(
        title: title,
        message: message,
        cancelLabel: cancelLabel,
        confirmLabel: confirmLabel,
        confirmColor: confirmColor,
      ),
    );
    return result ?? false;
  }
}
