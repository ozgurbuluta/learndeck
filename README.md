# LearnDeck - AI-Powered Vocabulary Learning App

LearnDeck is a comprehensive vocabulary learning platform built with Flutter that combines spaced repetition, AI-generated content, and voice practice to help users master vocabulary in 9 languages.

## Features

### Core Learning System
- **Spaced Repetition Algorithm** - Optimized review scheduling based on difficulty and performance
- **Flashcard Study Sessions** - Interactive swipe cards (right = know it, left = keep learning)
- **Progress Tracking** - Detailed statistics, streaks, and daily goals
- **Multi-Language Support** - German, Spanish, French, Italian, Portuguese, Dutch, Japanese, Chinese, Korean

### AI-Powered Content Generation
- **Smart Vocabulary Assistant** - Generate contextual vocabulary using Claude AI
- **Document Import** - Extract vocabulary from PDFs and text files
- **Personalized Starter Words** - AI generates vocabulary based on user preferences
- **Native Language Translations** - Definitions in user's native language (11 languages supported)

### Voice Practice System
- **Text-to-Speech (TTS)** - Native pronunciation using device TTS
- **Speech Recognition (STT)** - Practice pronunciation with real-time feedback
- **5 Exercise Types**:
  - **Listen & Choose** - Hear word, select correct translation
  - **Listen & Spell** - Hear word, type what you heard
  - **Pronunciation** - Speak words, get accuracy score
  - **Shadowing** - Listen then immediately repeat
  - **AI Conversation** - Voice chat with AI on various topics
- **Adjustable Speech Settings** - Speed (Very Slow to Very Fast), volume control
- **AI Pronunciation Feedback** - Claude-powered tips for improvement

### Onboarding & Personalization
- **Language Selection** - Target language + native language
- **Use Case Selection** - Work, daily life, travel, study
- **Interest Categories** - Food, technology, nature, culture, etc.
- **Daily Goal Setting** - 5, 10, 15, or 20 words per day
- **Placement Quiz** - Language-specific assessment (German, Spanish, French)
- **Level Assignment** - Beginner, Intermediate, or Advanced

### User Engagement
- **Learning Streaks** - Track consecutive days of practice
- **Daily Reminders** - Configurable push notifications
- **Dashboard** - Personalized greeting, progress, and stats

### Authentication
- **Email/Password** - Firebase Auth
- **Google Sign-In** - OAuth integration
- **Apple Sign-In** - iOS native integration

## Tech Stack

### Frontend (Flutter)
- **Framework**: Flutter 3.9+
- **State Management**: Riverpod
- **Navigation**: go_router
- **UI**: Custom theme with AppColors, AppTextStyles, AppSpacing

### Backend
- **Database**: Firebase Firestore (free tier)
- **Authentication**: Firebase Auth
- **API**: Vercel Serverless Functions (TypeScript)
- **AI**: Claude API (Anthropic)

### Voice Services
- **TTS**: flutter_tts (device native)
- **STT**: speech_to_text (device native)
- **Audio**: just_audio

### Key Packages
```yaml
flutter_riverpod: ^2.6.1      # State management
firebase_core: ^3.8.1          # Firebase
firebase_auth: ^5.3.4          # Authentication
cloud_firestore: ^5.6.0        # Database
flutter_tts: ^4.2.0            # Text-to-speech
speech_to_text: ^7.0.0         # Speech recognition
flutter_card_swiper: ^7.0.1    # Swipe cards
flutter_local_notifications: ^18.0.1  # Push notifications
```

## Project Structure

```
learndeck/
├── api/                           # Vercel serverless functions
│   ├── ai-vocabulary.ts           # AI vocabulary generation
│   ├── process-document.ts        # Document import
│   ├── pronunciation-feedback.ts  # AI pronunciation tips
│   └── conversation.ts            # AI conversation partner
│
└── learndeck_flutter/             # Flutter app
    └── lib/
        ├── main.dart              # App entry point
        ├── firebase_options.dart  # Firebase config
        │
        ├── models/                # Data models
        │   ├── word.dart          # Vocabulary word
        │   ├── user_preferences.dart  # User settings
        │   ├── user_activity.dart # Streak tracking
        │   └── tts_settings.dart  # Voice settings
        │
        ├── providers/             # Riverpod state
        │   ├── words_provider.dart
        │   ├── user_preferences_provider.dart
        │   ├── user_activity_provider.dart
        │   ├── tts_provider.dart
        │   └── speech_provider.dart
        │
        ├── services/              # Business logic
        │   ├── firebase_service.dart
        │   ├── ai_service.dart
        │   ├── tts_service.dart
        │   ├── speech_service.dart
        │   └── notification_service.dart
        │
        ├── screens/               # UI screens
        │   ├── auth_screen.dart
        │   ├── home_screen.dart
        │   ├── dashboard_screen.dart
        │   ├── word_list_screen.dart
        │   ├── study_session_screen.dart
        │   ├── voice_practice_screen.dart
        │   ├── listening_exercise_screen.dart
        │   ├── spell_exercise_screen.dart
        │   ├── pronunciation_screen.dart
        │   ├── shadowing_screen.dart
        │   ├── conversation_screen.dart
        │   ├── ai_chat_screen.dart
        │   ├── import_screen.dart
        │   ├── profile_screen.dart
        │   └── onboarding/
        │       ├── onboarding_screen.dart
        │       ├── quiz_screen.dart
        │       └── starter_vocabulary_screen.dart
        │
        ├── widgets/               # Reusable components
        │   ├── widgets.dart       # Barrel export
        │   ├── primary_button.dart
        │   ├── difficulty_badge.dart
        │   └── ...
        │
        ├── theme/                 # App styling
        │   └── app_theme.dart
        │
        └── utils/                 # Utilities
            └── study_algorithm.dart
```

## Firebase Collections

```
users/{userId}/
├── preferences          # UserPreferences document
├── activity             # UserActivity (streaks)
└── words/{wordId}       # Vocabulary words
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai-vocabulary` | POST | Generate vocabulary with AI |
| `/api/process-document` | POST | Extract words from documents |
| `/api/pronunciation-feedback` | POST | Get AI pronunciation tips |
| `/api/conversation` | POST | AI conversation responses |

## Environment Variables

### Vercel (api/)
```
CLAUDE_API_KEY=your_anthropic_api_key
```

### Flutter (firebase_options.dart)
Firebase config is auto-generated via FlutterFire CLI.

## Getting Started

### Prerequisites
- Flutter SDK 3.9+
- Firebase project
- Vercel account (for API)
- Anthropic API key

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ozgurbuluta/learndeck.git
   cd learndeck/learndeck_flutter
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Configure Firebase**
   ```bash
   flutterfire configure
   ```

4. **Deploy API to Vercel**
   ```bash
   cd ../api
   vercel --prod
   ```

5. **Run the app**
   ```bash
   flutter run
   ```

## Documentation

- [NOTIFICATIONS.md](learndeck_flutter/NOTIFICATIONS.md) - Push notification tracking
- [CLAUDE.md](CLAUDE.md) - LLM agent development guide

## Important Constraints

- **Firebase Free Tier Only** - No paid Firebase features
- **Device TTS/STT** - Uses native device capabilities (free)
- **Claude API** - Primary AI cost (~$0.01-0.03 per session)

## Development Status

### Implemented
- Core vocabulary learning system
- Swipe-based study sessions
- AI vocabulary generation
- Document import
- Multi-language onboarding
- Placement quiz (3 languages)
- Daily goals & streaks
- Push notifications
- Complete voice practice system (5 exercises)
- AI conversation practice
- Profile & settings

### Planned (Phase 3+)
- Animated avatars with lip sync
- Premium TTS (OpenAI)
- Video avatars
- Speaking achievements
- Dark mode
- Export functionality

---

**LearnDeck** - Master vocabulary with AI-powered learning and voice practice.
