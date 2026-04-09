# LearnDeck Flutter App

The Flutter implementation of LearnDeck - a vocabulary learning app with AI and voice features.

## Quick Start

```bash
# Install dependencies
flutter pub get

# Release readiness (API smoke + see device checklist)
# From repo root: bash scripts/release_readiness_verify.sh
# Details: RELEASE_READINESS.md

# Run on device/simulator
flutter run

# Build for iOS
flutter build ios

# Build for Android
flutter build apk
```

## Architecture Overview

### State Management (Riverpod)

All state is managed through Riverpod providers in `lib/providers/`:

| Provider | Purpose |
|----------|---------|
| `wordsProvider` | Vocabulary list and CRUD operations |
| `authStateProvider` | Firebase authentication state |
| `userPreferencesProvider` | User settings and onboarding data |
| `userActivityProvider` | Streaks and learning activity |
| `ttsSettingsProvider` | Text-to-speech configuration |
| `speechProvider` | Speech recognition state |

### Services

Static service classes in `lib/services/`:

| Service | Purpose |
|---------|---------|
| `FirebaseService` | Firestore & Auth operations |
| `AIService` | API calls to Vercel backend |
| `TTSService` | Text-to-speech wrapper |
| `SpeechService` | Speech-to-text wrapper |
| `NotificationService` | Local push notifications |

### Models

Data classes in `lib/models/`:

| Model | Description |
|-------|-------------|
| `Word` | Vocabulary item with difficulty, review tracking |
| `UserPreferences` | Target language, native language, level, goals |
| `UserActivity` | Streaks, word counts, last activity |
| `TTSSettings` | Speech rate, pitch, volume |

## Screen Flow

```
AuthScreen
    │
    ▼ (authenticated)
AuthWrapper
    │
    ├── OnboardingScreen (if not completed)
    │       │
    │       ├── Language Selection
    │       ├── Use Cases
    │       ├── Categories
    │       ├── Daily Goal
    │       └── Quiz → Level Assignment
    │               │
    │               ▼
    │       StarterVocabularyScreen
    │
    └── HomeScreen (if onboarding completed)
            │
            ├── DashboardScreen (tab)
            │       └── Study Session, Voice Practice
            │
            ├── WordListScreen (tab)
            │       └── Add, Edit, Delete words
            │
            ├── AIChatScreen (tab)
            │       └── Generate vocabulary with AI
            │
            └── ProfileScreen (tab)
                    └── Settings, Notifications, Voice Settings
```

## Voice Practice Flow

```
VoicePracticeScreen (Hub)
    │
    ├── ListeningExerciseScreen (Listen & Choose)
    │       └── Hear word → Select translation → Score
    │
    ├── SpellExerciseScreen (Listen & Spell)
    │       └── Hear word → Type word → Check → Score
    │
    ├── PronunciationScreen
    │       └── See word → Hold to record → Accuracy score
    │
    ├── ShadowingScreen
    │       └── Listen → Auto-record → Compare → Score
    │
    └── ConversationScreen
            └── Topic selection → Voice chat with AI
```

## Key Features Implementation

### Spaced Repetition

`lib/utils/study_algorithm.dart` handles:
- Difficulty progression: new → learning → review → mastered
- Next review date calculation
- Word shuffling for study sessions

### Streak Tracking

`FirebaseService.recordActivity()` tracks:
- Daily activity detection
- Consecutive day counting
- Longest streak preservation

### Multi-Language TTS

`TTSService` maps languages to device locales:
```dart
const Map<String, String> _languageLocales = {
  'German': 'de-DE',
  'Spanish': 'es-ES',
  'French': 'fr-FR',
  'Italian': 'it-IT',
  'Portuguese': 'pt-PT',
  'Dutch': 'nl-NL',
  'Japanese': 'ja-JP',
  'Chinese': 'zh-CN',
  'Korean': 'ko-KR',
};
```

### Pronunciation Scoring

`SpeechService.calculateSimilarity()` uses Levenshtein distance:
- 95%+ = Perfect
- 85%+ = Excellent
- 70%+ = Good (passing)
- 50%+ = Almost there
- Below = Keep practicing

## Theme System

`lib/theme/app_theme.dart` provides:

```dart
// Colors
AppColors.primary        // Orange accent
AppColors.background     // Light gray
AppColors.surface        // White
AppColors.textPrimary    // Dark text
AppColors.success        // Green
AppColors.error          // Red
AppColors.warning        // Yellow

// Spacing
AppSpacing.xs  = 4
AppSpacing.sm  = 8
AppSpacing.md  = 12
AppSpacing.lg  = 16
AppSpacing.xl  = 20
AppSpacing.xxl = 24
AppSpacing.xxxl = 32

// Border Radius
AppRadius.sm   = 8
AppRadius.md   = 12
AppRadius.lg   = 16
AppRadius.xl   = 20
AppRadius.full = 100
```

## API Integration

### AI Vocabulary Generation

```dart
final response = await AIService.generateVocabulary(
  userMessage: "Give me 5 food words",
  userPreferences: prefs,
);
// Returns: AIVocabularyResponse with words list
```

### Pronunciation Feedback

```dart
final feedback = await AIService.getPronunciationFeedback(
  targetWord: "Guten Tag",
  spokenWord: "Guten Tak",
  targetLanguage: "German",
  similarityScore: 0.85,
);
// Returns: PronunciationFeedback with tips
```

### AI Conversation

```dart
final response = await AIService.getConversationResponse(
  userMessage: "Hallo, wie geht es dir?",
  targetLanguage: "German",
  conversationHistory: history,
);
// Returns: ConversationResponse with response + translation
```

## Firebase Structure

### Collections

```
users/
└── {userId}/
    ├── preferences (document)
    │   ├── target_language: "German"
    │   ├── native_language: "English"
    │   ├── level: "beginner"
    │   ├── daily_goal: 10
    │   ├── use_cases: ["work", "travel"]
    │   ├── categories: ["food", "technology"]
    │   ├── quiz_score: 3
    │   └── onboarding_completed: true
    │
    ├── activity (document)
    │   ├── current_streak: 5
    │   ├── longest_streak: 12
    │   ├── last_activity_date: Timestamp
    │   └── total_words_learned: 150
    │
    └── words/
        └── {wordId} (documents)
            ├── word: "Hund"
            ├── definition: "dog"
            ├── article: "der"
            ├── difficulty: "learning"
            ├── review_count: 3
            ├── correct_count: 2
            └── next_review: Timestamp
```

## Adding New Features

### New Screen
1. Create `lib/screens/my_screen.dart`
2. Add navigation in `home_screen.dart` or relevant parent
3. Use `ConsumerWidget` or `ConsumerStatefulWidget` for Riverpod

### New Provider
1. Create `lib/providers/my_provider.dart`
2. Define StateNotifier and provider
3. Access via `ref.watch()` or `ref.read()`

### New API Endpoint
1. Create `api/my-endpoint.ts` (Vercel)
2. Add method to `AIService`
3. Create response model in `ai_service.dart`

### New Exercise
1. Create screen in `lib/screens/`
2. Add card in `voice_practice_screen.dart`
3. Import and link navigation

## Testing

```bash
# Run all tests
flutter test

# Run with coverage
flutter test --coverage
```

## Build Configuration

### iOS
- Requires microphone permission in `Info.plist`
- Speech recognition permission
- Notification permission

### Android
- Microphone permission in `AndroidManifest.xml`
- Record audio permission
- Notification permission (Android 13+)

## Dependencies

See `pubspec.yaml` for full list. Key dependencies:
- `flutter_riverpod` - State management
- `firebase_*` - Backend services
- `flutter_tts` - Text-to-speech
- `speech_to_text` - Speech recognition
- `flutter_card_swiper` - Study cards
- `flutter_local_notifications` - Push notifications

## Contributing

1. Check existing code patterns in similar files
2. Follow the static service class pattern
3. Use Riverpod for state management
4. Match the theme system (AppColors, AppSpacing)
5. Test on both iOS and Android
