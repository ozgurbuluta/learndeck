import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../theme/app_theme.dart';
import '../providers/words_provider.dart';
import '../utils/page_transitions.dart';
import 'listening_exercise_screen.dart';
import 'spell_exercise_screen.dart';
import 'pronunciation_screen.dart';
import 'shadowing_screen.dart';
import 'conversation_screen.dart';

class VoicePracticeScreen extends ConsumerWidget {
  const VoicePracticeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final wordsState = ref.watch(wordsProvider);
    final wordCount = wordsState.valueOrNull?.length ?? 0;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Voice Practice'),
        backgroundColor: AppColors.surface,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Text(
              'Train Your Ears',
              style: AppTextStyles.h2,
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              'Practice listening and speaking to improve your pronunciation and comprehension.',
              style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
            ),
            const SizedBox(height: AppSpacing.xxl),

            // Listening Section
            Text(
              'Listening',
              style: AppTextStyles.h4.copyWith(color: AppColors.textSecondary),
            ),
            const SizedBox(height: AppSpacing.md),

            // Listen & Choose
            _buildExerciseCard(
              context,
              icon: Icons.hearing_rounded,
              title: 'Listen & Choose',
              description: 'Hear a word and pick the correct translation',
              wordCount: wordCount,
              minWords: 4,
              onTap: () => context.pushScreen(const ListeningExerciseScreen()),
            ),

            // Listen & Spell
            _buildExerciseCard(
              context,
              icon: Icons.keyboard_rounded,
              title: 'Listen & Spell',
              description: 'Hear a word and type what you heard',
              wordCount: wordCount,
              minWords: 1,
              onTap: () => context.pushScreen(const SpellExerciseScreen()),
            ),

            const SizedBox(height: AppSpacing.xxl),

            // Speaking Section
            Text(
              'Speaking',
              style: AppTextStyles.h4.copyWith(color: AppColors.textSecondary),
            ),
            const SizedBox(height: AppSpacing.md),

            // Pronunciation Practice
            _buildExerciseCard(
              context,
              icon: Icons.mic_rounded,
              title: 'Pronunciation',
              description: 'Speak words and get feedback on your pronunciation',
              wordCount: wordCount,
              minWords: 1,
              onTap: () => context.pushScreen(const PronunciationScreen()),
            ),

            // Shadowing
            _buildExerciseCard(
              context,
              icon: Icons.record_voice_over_rounded,
              title: 'Shadowing',
              description: 'Listen and repeat immediately after',
              wordCount: wordCount,
              minWords: 1,
              onTap: () => context.pushScreen(const ShadowingScreen()),
            ),

            const SizedBox(height: AppSpacing.xxl),

            // Conversation Section
            Text(
              'Conversation',
              style: AppTextStyles.h4.copyWith(color: AppColors.textSecondary),
            ),
            const SizedBox(height: AppSpacing.md),

            // AI Conversation
            _buildExerciseCard(
              context,
              icon: Icons.chat_rounded,
              title: 'AI Conversation',
              description: 'Practice speaking with an AI partner',
              wordCount: wordCount,
              minWords: 0,
              onTap: () => context.pushScreen(const ConversationScreen()),
            ),

            const SizedBox(height: AppSpacing.xxl),

            // Tips Section
            Container(
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(AppRadius.lg),
                border: Border.all(
                  color: AppColors.primary.withValues(alpha: 0.3),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.lightbulb_outline_rounded,
                    color: AppColors.primary,
                    size: 24,
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Pro Tip',
                          style: AppTextStyles.bodySmall.copyWith(
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.xs),
                        Text(
                          'Use headphones for the best listening experience. Adjust voice speed in Profile > Voice Settings.',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildExerciseCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String description,
    required int wordCount,
    required int minWords,
    bool comingSoon = false,
    required VoidCallback onTap,
  }) {
    final isEnabled = !comingSoon && wordCount >= minWords;

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.border),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: isEnabled ? onTap : null,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: isEnabled
                        ? AppColors.primary.withValues(alpha: 0.1)
                        : AppColors.surfaceVariant,
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                  child: Icon(
                    icon,
                    size: 28,
                    color: isEnabled ? AppColors.primary : AppColors.textTertiary,
                  ),
                ),
                const SizedBox(width: AppSpacing.lg),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            title,
                            style: AppTextStyles.bodyLarge.copyWith(
                              fontWeight: FontWeight.w600,
                              color: isEnabled
                                  ? AppColors.textPrimary
                                  : AppColors.textTertiary,
                            ),
                          ),
                          if (comingSoon) ...[
                            const SizedBox(width: AppSpacing.sm),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppSpacing.sm,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.warning.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(AppRadius.sm),
                              ),
                              child: Text(
                                'Soon',
                                style: AppTextStyles.labelSmall.copyWith(
                                  color: AppColors.warning,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      Text(
                        description,
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                      if (!comingSoon && wordCount < minWords) ...[
                        const SizedBox(height: AppSpacing.xs),
                        Text(
                          'Need at least $minWords words',
                          style: AppTextStyles.labelSmall.copyWith(
                            color: AppColors.warning,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                if (isEnabled)
                  Icon(
                    Icons.chevron_right_rounded,
                    color: AppColors.textTertiary,
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
