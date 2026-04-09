# LearnDeck - LLM Agent Development Guide

This document provides context for AI assistants working on the LearnDeck codebase.

## Project Overview

LearnDeck is a **Flutter vocabulary learning app** with AI features. Users learn vocabulary in 9 target languages using flashcards, spaced repetition, and voice practice.

**Active codebase**: `learndeck_flutter/` (Flutter app) + `api/` (Vercel serverless)

**Legacy code** (not actively maintained): `apps/`, `learndeck-mobile/`, `supabase/`

## Critical Constraints

1. **Firebase Free Tier Only** - Never use paid Firebase features (Storage, ML, etc.)
2. **Device TTS/STT** - Use `flutter_tts` and `speech_to_text` (free, on-device)
3. **Minimal Claude API Calls** - AI is the main cost; optimize usage

## Architecture Patterns

### State Management (Riverpod)

```dart
// Provider definition
final myProvider = StateNotifierProvider<MyNotifier, AsyncValue<MyData?>>((ref) {
  return MyNotifier();
});

// Usage in widget
class MyScreen extends ConsumerWidget {
  Widget build(BuildContext context, WidgetRef ref) {
    final data = ref.watch(myProvider);
    return data.when(
      data: (d) => ...,
      loading: () => ...,
      error: (e, _) => ...,
    );
  }
}
```

### Service Classes (Static)

```dart
class MyService {
  static const String _key = 'my_key';

  static Future<void> doSomething() async {
    // Implementation
  }
}
```

### API Calls (Vercel TypeScript)

```typescript
// api/my-endpoint.ts
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  // ... CORS headers

  const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
  // ... Claude API call
}
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `lib/main.dart` | App entry, Firebase & TTS init |
| `lib/services/firebase_service.dart` | All Firestore operations |
| `lib/services/ai_service.dart` | API client for Vercel endpoints |
| `lib/providers/words_provider.dart` | Vocabulary state management |
| `lib/theme/app_theme.dart` | Colors, spacing, text styles |
| `api/ai-vocabulary.ts` | Main AI vocabulary generation |
| `tasks/todo.md` | Active task + **Suggested next priorities** (prioritized agent backlog when idle) |
| `learndeck_flutter/RELEASE_READINESS.md` | API smoke script usage + manual device checklist before release |

## Adding New Features

### New Screen
1. Create `lib/screens/new_screen.dart`
2. Extend `ConsumerWidget` or `ConsumerStatefulWidget`
3. Use `AppColors`, `AppSpacing`, `AppTextStyles` from theme
4. Add navigation from parent screen

### New API Endpoint
1. Create `api/endpoint-name.ts`
2. Add CORS headers (copy from existing endpoint)
3. Add client method in `lib/services/ai_service.dart`
4. Create response model class

### New Provider
1. Create `lib/providers/new_provider.dart`
2. Define `StateNotifier` with state type
3. Add to provider using `StateNotifierProvider`

## Common Patterns

### Firestore Document Structure
```dart
// Save
await FirebaseFirestore.instance
    .collection('users')
    .doc(userId)
    .collection('words')
    .doc(wordId)
    .set(word.toJson());

// Read
final doc = await FirebaseFirestore.instance
    .collection('users')
    .doc(userId)
    .collection('preferences')
    .get();
```

### TTS Usage
```dart
await TTSService.speak("Hello", language: "German");
await TTSService.speakSlow("Hello", language: "German");
```

### STT Usage
```dart
await ref.read(speechProvider.notifier).startListening(language: "German");
// ... user speaks
await ref.read(speechProvider.notifier).stopListening();
final text = ref.read(speechProvider).recognizedText;
```

### SharedPreferences Keys
- `notifications_enabled` - bool
- `notification_hour` - int
- `notification_minute` - int
- `tts_rate` - double
- `tts_pitch` - double
- `tts_volume` - double

## Implemented Features (as of March 2026)

### Core Learning
- Swipe-based flashcard study
- Spaced repetition algorithm
- Vocabulary CRUD (add, edit, delete)
- Progress tracking (accuracy, review count)
- Daily goals and streaks

### AI Features
- AI vocabulary generation (Claude)
- Document import (PDF, text)
- AI pronunciation feedback
- AI conversation practice

### Voice Practice
- **Listen & Choose** - Multiple choice listening
- **Listen & Spell** - Dictation exercise
- **Pronunciation** - Speech scoring (Levenshtein)
- **Shadowing** - Listen-then-repeat
- **AI Conversation** - Voice chat with AI

### Onboarding
- Language selection (9 target + 11 native)
- Use case & category selection
- Daily goal selection
- Placement quiz (German, Spanish, French)
- AI starter vocabulary

### Settings
- Push notification scheduling
- Voice settings (speed, volume)
- Reset onboarding option

## Not Yet Implemented

- Dark mode
- Export functionality
- Animated avatars
- Premium TTS (OpenAI)
- Video avatars
- Speaking achievements/badges
- Offline mode
- Multiple word lists/folders

## Agent backlog (prioritized work)

When there is no **Active Task** in [`tasks/todo.md`](tasks/todo.md), continue from the **Suggested next priorities (agent backlog)** section there (P0→P2: release readiness, API cost and reliability, tests, legacy repo hygiene, notifications polish, store distribution). That list is **engineering and release** focus; it complements the **Not Yet Implemented** feature ideas above, which are product gaps rather than the next maintenance pass.

## Supported Languages

**Target Languages** (for learning):
German, Spanish, French, Italian, Portuguese, Dutch, Japanese, Chinese, Korean

**Native Languages** (for definitions):
English, Spanish, French, German, Italian, Portuguese, Dutch, Turkish, Russian, Chinese, Japanese

## Testing Notes

- Voice features require physical device (simulator has limited support)
- Firebase Emulator can be used for local development
- Test on both iOS and Android for voice feature compatibility

## iOS Troubleshooting

### Xcode Workspace Crashes

**Symptom**: Xcode crashes or freezes when opening `Runner.xcworkspace`

**Root Cause**: Duplicate Pod folders created during interrupted builds (e.g., "Firebase 2", "abseil 3", "BoringSSL-GRPC 4")

**Fix**:
```bash
cd learndeck_flutter/ios

# Remove duplicate folders (with space + number suffix)
find Pods -maxdepth 1 -name "* 2" -type d -exec rm -rf {} \;
find Pods -maxdepth 1 -name "* 3" -type d -exec rm -rf {} \;
find Pods -maxdepth 1 -name "* 4" -type d -exec rm -rf {} \;

# Clean reinstall pods
rm -rf Pods Podfile.lock
pod install --repo-update
```

**Prevention**: Don't interrupt `pod install` or Xcode builds mid-process.

### Sandbox Not in Sync Error

**Symptom**: Build error "The sandbox is not in sync with the Podfile.lock"

**Fix**:
```bash
cd learndeck_flutter/ios
pod install
```

This syncs `Pods/Manifest.lock` with `Podfile.lock`.

### Build Database Locked Error

**Symptom**: "unable to attach DB: database is locked" error

**Root Cause**: Multiple Xcode build processes running, or stale build process

**Fix**:
```bash
# Kill stale build processes
pkill -9 xcodebuild
pkill -9 XCBuild

# Clear DerivedData for this project
rm -rf ~/Library/Developer/Xcode/DerivedData/Runner-*

# Reopen Xcode and build again
```

### Code Signing for Simulator

**Symptom**: Build fails due to code signing when targeting simulator

**Fix**: Build with signing disabled:
```bash
cd learndeck_flutter/ios
xcodebuild -workspace Runner.xcworkspace -scheme Runner \
  -destination 'generic/platform=iOS Simulator' \
  CODE_SIGN_IDENTITY="-" CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO
```

Or use Flutter:
```bash
flutter build ios --simulator --no-codesign
```

### Healthy Pods State

A clean Pods folder should have:
- ~35 items (not 90+)
- ~95MB size (not 250MB+)
- No folders with "2", "3", "4" suffixes

## Quick Commands

```bash
# Run app
cd learndeck_flutter && flutter run

# Build iOS
flutter build ios

# Build Android
flutter build apk

# Deploy API
cd api && vercel --prod

# Check for issues
flutter analyze
```

## Environment Setup

1. Flutter SDK 3.9+
2. Firebase project configured (`flutterfire configure`)
3. Vercel project with `CLAUDE_API_KEY` env var
4. Xcode (for iOS) / Android Studio (for Android)

## Code Style

- Use `const` constructors where possible
- Prefer `StatelessWidget` over `StatefulWidget` when possible
- Use `ConsumerWidget` for Riverpod access
- Follow existing file naming conventions
- Use theme constants (`AppColors`, `AppSpacing`) instead of hardcoded values
