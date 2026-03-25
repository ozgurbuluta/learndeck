import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../theme/app_theme.dart';
import '../services/firebase_service.dart';
import '../providers/user_preferences_provider.dart';
import 'onboarding/onboarding_screen.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = FirebaseService.currentUser;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Profile'),
        backgroundColor: AppColors.surface,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          children: [
            // User Avatar
            Container(
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.person_rounded,
                size: 64,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: AppSpacing.lg),

            // User Email
            Text(
              user?.email ?? 'No email',
              style: AppTextStyles.h4,
            ),
            const SizedBox(height: AppSpacing.xxxl),

            // Settings Section
            _buildSectionTitle('Settings'),
            const SizedBox(height: AppSpacing.md),

            _buildSettingsTile(
              icon: Icons.notifications_rounded,
              title: 'Notifications',
              subtitle: 'Manage notification preferences',
              onTap: () {},
            ),
            _buildSettingsTile(
              icon: Icons.language_rounded,
              title: 'Language',
              subtitle: 'German',
              onTap: () {},
            ),
            _buildSettingsTile(
              icon: Icons.dark_mode_rounded,
              title: 'Theme',
              subtitle: 'Light',
              onTap: () {},
            ),
            _buildSettingsTile(
              icon: Icons.restart_alt_rounded,
              title: 'Reset Onboarding',
              subtitle: 'Test the onboarding flow again',
              onTap: () => _resetOnboarding(context, ref),
            ),

            const SizedBox(height: AppSpacing.xxl),

            // Account Section
            _buildSectionTitle('Account'),
            const SizedBox(height: AppSpacing.md),

            _buildSettingsTile(
              icon: Icons.cloud_download_rounded,
              title: 'Export Data',
              subtitle: 'Download your vocabulary data',
              onTap: () {},
            ),
            _buildSettingsTile(
              icon: Icons.help_rounded,
              title: 'Help & Support',
              subtitle: 'Get help or send feedback',
              onTap: () {},
            ),
            _buildSettingsTile(
              icon: Icons.info_rounded,
              title: 'About',
              subtitle: 'Version 1.0.0',
              onTap: () {},
            ),

            const SizedBox(height: AppSpacing.xxxl),

            // Logout Button
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () async {
                  final confirm = await showDialog<bool>(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: const Text('Sign Out'),
                      content:
                          const Text('Are you sure you want to sign out?'),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(context, false),
                          child: const Text('Cancel'),
                        ),
                        TextButton(
                          onPressed: () => Navigator.pop(context, true),
                          child: Text(
                            'Sign Out',
                            style: TextStyle(color: AppColors.error),
                          ),
                        ),
                      ],
                    ),
                  );

                  if (confirm == true) {
                    try {
                      await FirebaseService.signOut();
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Sign out failed: $e')),
                        );
                      }
                    }
                  }
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.error,
                  side: BorderSide(color: AppColors.error),
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.lg),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.logout_rounded),
                    SizedBox(width: AppSpacing.sm),
                    Text('Sign Out'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Text(
        title,
        style: AppTextStyles.h4.copyWith(color: AppColors.textSecondary),
      ),
    );
  }

  Widget _buildSettingsTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.border),
      ),
      child: ListTile(
        onTap: onTap,
        leading: Container(
          padding: const EdgeInsets.all(AppSpacing.sm),
          decoration: BoxDecoration(
            color: AppColors.surfaceVariant,
            borderRadius: BorderRadius.circular(AppRadius.sm),
          ),
          child: Icon(icon, color: AppColors.primary, size: 20),
        ),
        title: Text(title, style: AppTextStyles.body),
        subtitle: Text(
          subtitle,
          style: AppTextStyles.bodySmall.copyWith(
            color: AppColors.textTertiary,
          ),
        ),
        trailing: Icon(
          Icons.chevron_right_rounded,
          color: AppColors.textTertiary,
        ),
      ),
    );
  }

  Future<void> _resetOnboarding(BuildContext context, WidgetRef ref) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Reset Onboarding'),
        content: const Text(
          'This will restart the onboarding flow. Your saved words will be kept.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text(
              'Reset',
              style: TextStyle(color: AppColors.primary),
            ),
          ),
        ],
      ),
    );

    if (confirm == true && context.mounted) {
      // Get current preferences and set onboarding_completed to false
      final currentPrefs = ref.read(userPreferencesProvider).valueOrNull;
      if (currentPrefs != null) {
        final resetPrefs = currentPrefs.copyWith(onboardingCompleted: false);
        await ref.read(userPreferencesProvider.notifier).updatePreferences(resetPrefs);
      }

      // Navigate to onboarding
      if (context.mounted) {
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) => const OnboardingScreen()),
          (route) => false,
        );
      }
    }
  }
}
