import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user_activity.dart';
import '../services/firebase_service.dart';

final userActivityProvider =
    StateNotifierProvider<UserActivityNotifier, AsyncValue<UserActivity?>>((ref) {
  return UserActivityNotifier();
});

class UserActivityNotifier extends StateNotifier<AsyncValue<UserActivity?>> {
  UserActivityNotifier() : super(const AsyncValue.loading());

  Future<void> loadActivity() async {
    state = const AsyncValue.loading();
    try {
      final data = await FirebaseService.getUserActivity();
      if (data != null) {
        state = AsyncValue.data(UserActivity.fromJson(data));
      } else {
        state = const AsyncValue.data(null);
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> recordWordAdded() async {
    try {
      await FirebaseService.recordActivity(wordAdded: true);
      await loadActivity(); // Refresh state
    } catch (e) {
      // Silently fail - don't disrupt user experience
    }
  }

  Future<void> recordReviewCompleted() async {
    try {
      await FirebaseService.recordActivity(reviewCompleted: true);
      await loadActivity(); // Refresh state
    } catch (e) {
      // Silently fail
    }
  }
}
