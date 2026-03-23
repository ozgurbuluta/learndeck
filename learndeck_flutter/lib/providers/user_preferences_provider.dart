import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user_preferences.dart';
import '../services/firebase_service.dart';

final userPreferencesProvider =
    StateNotifierProvider<UserPreferencesNotifier, AsyncValue<UserPreferences?>>(
        (ref) {
  return UserPreferencesNotifier();
});

class UserPreferencesNotifier
    extends StateNotifier<AsyncValue<UserPreferences?>> {
  UserPreferencesNotifier() : super(const AsyncValue.loading());

  Future<void> loadPreferences() async {
    state = const AsyncValue.loading();
    try {
      final prefs = await FirebaseService.getUserPreferences();
      state = AsyncValue.data(prefs);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> savePreferences(UserPreferences prefs) async {
    try {
      await FirebaseService.saveUserPreferences(prefs);
      state = AsyncValue.data(prefs);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> updatePreferences(UserPreferences prefs) async {
    try {
      await FirebaseService.updateUserPreferences(prefs);
      state = AsyncValue.data(prefs);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  bool get hasCompletedOnboarding {
    return state.whenOrNull(data: (prefs) => prefs?.onboardingCompleted) ?? false;
  }
}
