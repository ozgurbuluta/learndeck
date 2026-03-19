import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'services/supabase_service.dart';
import 'providers/words_provider.dart';
import 'screens/auth_screen.dart';
import 'screens/dashboard_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Supabase
  // TODO: Replace with your Supabase credentials
  await SupabaseService.initialize(
    url: const String.fromEnvironment(
      'SUPABASE_URL',
      defaultValue: 'YOUR_SUPABASE_URL',
    ),
    anonKey: const String.fromEnvironment(
      'SUPABASE_ANON_KEY',
      defaultValue: 'YOUR_SUPABASE_ANON_KEY',
    ),
  );

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
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6366f1),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFF1a1a2e),
      ),
      home: authState.when(
        data: (isLoggedIn) => isLoggedIn ? const DashboardScreen() : const AuthScreen(),
        loading: () => const Scaffold(
          backgroundColor: Color(0xFF1a1a2e),
          body: Center(
            child: CircularProgressIndicator(color: Color(0xFF6366f1)),
          ),
        ),
        error: (_, __) => const AuthScreen(),
      ),
    );
  }
}
