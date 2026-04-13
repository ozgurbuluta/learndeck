import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../theme/app_theme.dart';
import '../services/firebase_service.dart';
import '../services/notification_service.dart';
import '../providers/user_preferences_provider.dart';
import '../providers/tts_provider.dart';
import '../models/tts_settings.dart';
import '../utils/page_transitions.dart';
import '../widgets/widgets.dart';
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

            _NotificationTile(),
            const _VoiceSettingsTile(),
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
                  final confirm = await AppConfirmDialog.show(
                    context: context,
                    title: 'Sign Out',
                    message: 'Are you sure you want to sign out?',
                    confirmLabel: 'Sign Out',
                    confirmColor: AppColors.error,
                  );

                  if (confirm) {
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
    final confirm = await AppConfirmDialog.show(
      context: context,
      title: 'Reset Onboarding',
      message: 'This will restart the onboarding flow. Your saved words will be kept.',
      confirmLabel: 'Reset',
    );

    if (confirm && context.mounted) {
      // Get current preferences and set onboarding_completed to false
      final currentPrefs = ref.read(userPreferencesProvider).valueOrNull;
      if (currentPrefs != null) {
        final resetPrefs = currentPrefs.copyWith(onboardingCompleted: false);
        await ref.read(userPreferencesProvider.notifier).updatePreferences(resetPrefs);
      }

      // Navigate to onboarding
      if (context.mounted) {
        context.pushAndRemoveUntilScreen(const OnboardingScreen());
      }
    }
  }
}

class _NotificationTile extends StatefulWidget {
  @override
  State<_NotificationTile> createState() => _NotificationTileState();
}

class _NotificationTileState extends State<_NotificationTile> {
  bool _enabled = false;
  int _hour = 9;
  int _minute = 0;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final enabled = await NotificationService.areNotificationsEnabled();
    final time = await NotificationService.getScheduledTime();
    setState(() {
      _enabled = enabled;
      if (time != null) {
        _hour = time.hour;
        _minute = time.minute;
      }
      _loading = false;
    });
  }

  Future<void> _toggleNotifications(bool value) async {
    if (value) {
      final granted = await NotificationService.requestPermission();
      if (granted) {
        await NotificationService.scheduleDailyReminder(
          hour: _hour,
          minute: _minute,
        );
        setState(() => _enabled = true);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Please enable notifications in system settings'),
            ),
          );
        }
      }
    } else {
      await NotificationService.cancelAll();
      setState(() => _enabled = false);
    }
  }

  Future<void> _showTimePicker() async {
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay(hour: _hour, minute: _minute),
    );

    if (time != null) {
      setState(() {
        _hour = time.hour;
        _minute = time.minute;
      });

      if (_enabled) {
        await NotificationService.scheduleDailyReminder(
          hour: _hour,
          minute: _minute,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Container(
        margin: const EdgeInsets.only(bottom: AppSpacing.sm),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(color: AppColors.border),
        ),
        child: ListTile(
          leading: Container(
            padding: const EdgeInsets.all(AppSpacing.sm),
            decoration: BoxDecoration(
              color: AppColors.surfaceVariant,
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
            child: Icon(Icons.notifications_rounded, color: AppColors.primary, size: 20),
          ),
          title: Text('Notifications', style: AppTextStyles.body),
          subtitle: Text(
            'Loading...',
            style: AppTextStyles.bodySmall.copyWith(color: AppColors.textTertiary),
          ),
        ),
      );
    }

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          ListTile(
            leading: Container(
              padding: const EdgeInsets.all(AppSpacing.sm),
              decoration: BoxDecoration(
                color: AppColors.surfaceVariant,
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
              child: Icon(Icons.notifications_rounded, color: AppColors.primary, size: 20),
            ),
            title: Text('Daily Reminder', style: AppTextStyles.body),
            subtitle: Text(
              _enabled
                  ? 'Reminder at ${NotificationService.formatTime(_hour, _minute)}'
                  : 'Off',
              style: AppTextStyles.bodySmall.copyWith(color: AppColors.textTertiary),
            ),
            trailing: Switch(
              value: _enabled,
              onChanged: _toggleNotifications,
              activeTrackColor: AppColors.primary.withValues(alpha: 0.5),
              activeThumbColor: AppColors.primary,
            ),
          ),
          if (_enabled)
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.xl + 40,
                0,
                AppSpacing.lg,
                AppSpacing.md,
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.schedule_rounded,
                    size: 16,
                    color: AppColors.textTertiary,
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Text(
                    'Reminder time',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const Spacer(),
                  TextButton(
                    onPressed: _showTimePicker,
                    child: Text(
                      NotificationService.formatTime(_hour, _minute),
                      style: AppTextStyles.button.copyWith(color: AppColors.primary),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _VoiceSettingsTile extends ConsumerStatefulWidget {
  const _VoiceSettingsTile();

  @override
  ConsumerState<_VoiceSettingsTile> createState() => _VoiceSettingsTileState();
}

class _VoiceSettingsTileState extends ConsumerState<_VoiceSettingsTile> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final ttsSettings = ref.watch(ttsSettingsProvider);
    final prefs = ref.watch(userPreferencesProvider).valueOrNull;
    final language = prefs?.targetLanguage ?? 'German';

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          ListTile(
            onTap: () => setState(() => _expanded = !_expanded),
            leading: Container(
              padding: const EdgeInsets.all(AppSpacing.sm),
              decoration: BoxDecoration(
                color: AppColors.surfaceVariant,
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
              child: Icon(Icons.volume_up_rounded, color: AppColors.primary, size: 20),
            ),
            title: Text('Voice Settings', style: AppTextStyles.body),
            subtitle: Text(
              'Speed: ${ttsSettings.rateDisplayName}',
              style: AppTextStyles.bodySmall.copyWith(color: AppColors.textTertiary),
            ),
            trailing: Icon(
              _expanded ? Icons.expand_less_rounded : Icons.expand_more_rounded,
              color: AppColors.textTertiary,
            ),
          ),
          if (_expanded)
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                0,
                AppSpacing.lg,
                AppSpacing.lg,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Speech Rate
                  Text(
                    'Speech Speed',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _buildRateSelector(ttsSettings),
                  const SizedBox(height: AppSpacing.lg),

                  // Volume
                  Row(
                    children: [
                      Icon(Icons.volume_down_rounded, size: 18, color: AppColors.textTertiary),
                      Expanded(
                        child: Slider(
                          value: ttsSettings.volume,
                          min: 0.0,
                          max: 1.0,
                          activeColor: AppColors.primary,
                          inactiveColor: AppColors.border,
                          onChanged: (value) {
                            ref.read(ttsSettingsProvider.notifier).setVolume(value);
                          },
                        ),
                      ),
                      Icon(Icons.volume_up_rounded, size: 18, color: AppColors.textTertiary),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),

                  // Test button
                  Center(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        ref.read(ttsSettingsProvider.notifier).testVoice(language);
                      },
                      icon: const Icon(Icons.play_arrow_rounded, size: 18),
                      label: Text('Test Voice ($language)'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.primary,
                        side: BorderSide(color: AppColors.primary),
                      ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildRateSelector(TTSSettings settings) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: TTSSettings.presetRates.entries.map((entry) {
          final isSelected = (settings.speechRate - entry.value).abs() < 0.1;
          return Padding(
            padding: const EdgeInsets.only(right: AppSpacing.sm),
            child: ChoiceChip(
              label: Text(entry.key),
              selected: isSelected,
              onSelected: (selected) {
                if (selected) {
                  ref.read(ttsSettingsProvider.notifier).setRate(entry.value);
                }
              },
              selectedColor: AppColors.primary.withValues(alpha: 0.2),
              labelStyle: TextStyle(
                color: isSelected ? AppColors.primary : AppColors.textSecondary,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                fontSize: 12,
              ),
              side: BorderSide(
                color: isSelected ? AppColors.primary : AppColors.border,
              ),
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
            ),
          );
        }).toList(),
      ),
    );
  }
}
