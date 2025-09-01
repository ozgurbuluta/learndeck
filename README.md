# LearnDeck - AI-Powered German Vocabulary Learning App

LearnDeck is a comprehensive vocabulary learning platform that combines spaced repetition, AI-generated content, and voice practice to help users master German vocabulary effectively.

## 🚀 Features

### Core Learning System
- **Spaced Repetition Algorithm**: Optimized review scheduling based on difficulty and performance
- **Flashcard Study Sessions**: Interactive cards with swipe gestures for easy review
- **Progress Tracking**: Detailed statistics and achievement system
- **Folder Organization**: Organize vocabulary by topics or difficulty levels

### AI-Powered Content Generation
- **Smart Vocabulary Assistant**: Generate contextual German vocabulary using Claude AI
- **Natural Sentence Creation**: AI creates realistic German sentences using your vocabulary
- **Conversation Practice**: Scenario-based dialogue practice (job interviews, airport, café)
- **Contextual Learning**: Words are presented in meaningful contexts

### Voice & Speech Features
- **Text-to-Speech**: German pronunciation using OpenAI TTS
- **Speech Recognition**: Practice pronunciation with OpenAI Whisper STT
- **Silent Mode Support**: Audio works even when phone is muted
- **Voice Practice Modes**:
  - Sentence Practice: Generate and practice German sentences
  - Conversation Mode: Interactive dialogue in real-world scenarios

### Multi-Platform Support
- **Web Application**: React web app
- **Mobile App**: iOS app built with React Native and Expo
- **Cross-Platform Sync**: Shared backend with real-time sync

## 🛠 Tech Stack

### Frontend
- **Web**: React 18, TypeScript, Vite, Tailwind CSS
- **Mobile**: React Native, Expo SDK 53, React Navigation

### Backend & Infrastructure
- **Database**: Supabase (PostgreSQL) with real-time subscriptions
- **Authentication**: Supabase Auth with secure session management
- **Edge Functions**: Supabase Edge Functions for AI integrations
- **File Storage**: Supabase Storage for document processing

### AI & Voice Services
- **Language Model**: Claude Sonnet 4 via Anthropic API
- **Text-to-Speech**: OpenAI TTS API with multiple voice options
- **Speech-to-Text**: OpenAI Whisper API with German language support
- **Voice Processing**: Client-side audio caching and optimization

## 📱 Mobile App Features

### Study Experience
- **Gesture-Based Learning**: Swipe right for "I know it", left for "Keep learning"
- **Visual Feedback**: Smooth animations and progress indicators
- **Stacked Card Preview**: See upcoming words while studying
- **Audio Pronunciation**: Tap speaker icons to hear German pronunciation

### Voice Practice
- **Dual Practice Modes**:
  - **Sentence Practice**: Generate sentences using your vocabulary
  - **Conversation Mode**: Role-play scenarios with AI assistant
- **Real-Time Feedback**: Immediate audio responses and corrections
- **Highlighted Vocabulary**: Your library words are highlighted in conversations

### Privacy & Settings
- **Voice Data Control**: Choose whether to cache audio locally
- **Analytics Toggle**: Control usage data collection
- **Offline Support**: Core functionality works without internet
- **Secure Storage**: All user data encrypted and securely stored

## 🏗 Architecture

### Database Schema
```sql
-- Core tables
users (id, email, created_at, updated_at)
words (id, user_id, word, definition, difficulty, next_review, review_count)
folders (id, user_id, name, created_at)
word_folders (word_id, folder_id)
study_sessions (id, user_id, session_type, words_studied, accuracy)
achievements (id, user_id, achievement_type, earned_at)
```

### API Architecture
- **RESTful Endpoints**: Standard CRUD operations via Supabase
- **Real-Time Updates**: WebSocket connections for live data sync
- **Edge Functions**: Serverless functions for AI processing
- **Rate Limiting**: Client and server-side request throttling

### Voice Processing Pipeline
```
User Speech → expo-av Recording → Base64 Encoding → 
Supabase Edge Function → OpenAI Whisper → Text Response →
AI Processing → OpenAI TTS → Audio Response → Client Playback
```
---

**LearnDeck** - Master German vocabulary with AI-powered learning and voice practice.
