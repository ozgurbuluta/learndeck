import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'providers/words_provider.dart';
import 'providers/user_preferences_provider.dart';
import 'screens/auth_screen.dart';
import 'screens/home_screen.dart';
import 'screens/onboarding/onboarding_screen.dart';
import 'services/notification_service.dart';
import 'services/tts_service.dart';
import 'theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase (FREE tier)
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  // Initialize notifications
  await NotificationService.initialize();

  // Initialize text-to-speech
  await TTSService.initialize();

  runApp(const ProviderScope(child: LearnDeckApp()));
}

class LearnDeckApp extends ConsumerWidget {
  const LearnDeckApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);

    return MaterialApp(
      title: 'LearnDeck',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      home: authState.when(
        data: (isLoggedIn) => isLoggedIn ? const AuthWrapper() : const AuthScreen(),
        loading: () => const Scaffold(
          backgroundColor: Color(0xFFF5F5F5),
          body: Center(
            child: CircularProgressIndicator(color: Color(0xFFFF8C00)),
          ),
        ),
        error: (_, __) => const AuthScreen(),
      ),
    );
  }
}

class AuthWrapper extends ConsumerStatefulWidget {
  const AuthWrapper({super.key});

  @override
  ConsumerState<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends ConsumerState<AuthWrapper> {
  @override
  void initState() {
    super.initState();
    // Load user preferences when authenticated
    Future.microtask(() {
      ref.read(userPreferencesProvider.notifier).loadPreferences();
    });
  }

  @override
  Widget build(BuildContext context) {
    final prefsState = ref.watch(userPreferencesProvider);

    return prefsState.when(
      data: (prefs) {
        // Check if onboarding is completed
        if (prefs == null || !prefs.onboardingCompleted) {
          return const OnboardingScreen();
        }
        return const HomeScreen();
      },
      loading: () => const Scaffold(
        backgroundColor: Color(0xFFF5F5F5),
        body: Center(
          child: CircularProgressIndicator(color: Color(0xFFFF8C00)),
        ),
      ),
      error: (_, __) => const OnboardingScreen(),
    );
  }
}
