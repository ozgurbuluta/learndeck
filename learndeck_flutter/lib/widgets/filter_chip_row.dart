import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class FilterChipRow<T> extends StatelessWidget {
  final List<T> items;
  final T? selectedItem;
  final String Function(T item) labelBuilder;
  final void Function(T? item) onSelected;
  final String allLabel;

  const FilterChipRow({
    super.key,
    required this.items,
    required this.selectedItem,
    required this.labelBuilder,
    required this.onSelected,
    this.allLabel = 'All',
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _FilterChipItem(
            label: allLabel,
            isSelected: selectedItem == null,
            onTap: () => onSelected(null),
          ),
          const SizedBox(width: AppSpacing.sm),
          ...items.map((item) => Padding(
            padding: const EdgeInsets.only(right: AppSpacing.sm),
            child: _FilterChipItem(
              label: labelBuilder(item),
              isSelected: selectedItem == item,
              onTap: () => onSelected(item),
            ),
          )),
        ],
      ),
    );
  }
}

class _FilterChipItem extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _FilterChipItem({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm,
        ),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(AppRadius.full),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
          ),
        ),
        child: Text(
          label,
          style: AppTextStyles.labelSmall.copyWith(
            color: isSelected ? AppColors.textOnPrimary : AppColors.textPrimary,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
          ),
        ),
      ),
    );
  }
}
