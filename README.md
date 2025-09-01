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
- **Text-to-Speech**: High-quality German pronunciation using OpenAI TTS
- **Speech Recognition**: Practice pronunciation with OpenAI Whisper STT
- **Silent Mode Support**: Audio works even when phone is muted
- **Voice Practice Modes**:
  - Sentence Practice: Generate and practice German sentences
  - Conversation Mode: Interactive dialogue in real-world scenarios

### Multi-Platform Support
- **Web Application**: Full-featured React web app
- **Mobile App**: Native iOS/Android app built with React Native and Expo
- **Cross-Platform Sync**: Shared backend with real-time synchronization

## 🛠 Tech Stack

### Frontend
- **Web**: React 18, TypeScript, Vite, Tailwind CSS
- **Mobile**: React Native, Expo SDK 53, React Navigation
- **UI Components**: Custom components with consistent design system

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

### Development Tools
- **Monorepo**: Turborepo for efficient multi-package development
- **Package Management**: pnpm with workspace support
- **Type Safety**: Full TypeScript coverage across all packages
- **Code Quality**: ESLint, Prettier, and consistent formatting

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

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Supabase account and project
- OpenAI API key
- Anthropic API key (for Claude)
- Expo CLI (for mobile development)

### Environment Setup
1. Clone the repository
```bash
git clone https://github.com/yourusername/learndeck.git
cd learndeck
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
# Copy environment template
cp env.example .env

# Configure your API keys
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_key
CLAUDE_API_KEY=your_anthropic_key
```

4. Set up Supabase
```bash
# Install Supabase CLI
npm install -g @supabase/cli

# Login and link project
supabase login
supabase link --project-ref your_project_ref

# Run migrations
supabase db push

# Deploy edge functions
supabase functions deploy ai-vocabulary-assistant
supabase functions deploy voice-tts
supabase functions deploy voice-stt
supabase functions deploy voice-talk
```

### Running the Applications

#### Web App
```bash
cd apps/web
pnpm dev
# Opens at http://localhost:5173
```

#### Mobile App
```bash
cd learndeck-mobile
npm start
# Scan QR code with Expo Go app
```

## 📊 Performance Optimizations

### Client-Side Caching
- **Audio Caching**: TTS responses cached locally for offline playback
- **Smart Prefetching**: Vocabulary data preloaded for smooth study sessions
- **Image Optimization**: Responsive images with lazy loading

### Backend Optimizations
- **Database Indexing**: Optimized queries for large vocabulary sets
- **Edge Function Caching**: API responses cached at CDN level
- **Connection Pooling**: Efficient database connection management

### Mobile Performance
- **Bundle Splitting**: Code split by feature for faster loading
- **Memory Management**: Efficient cleanup of audio resources
- **Battery Optimization**: Minimal background processing

## 🔒 Security & Privacy

### Data Protection
- **End-to-End Encryption**: All user data encrypted in transit and at rest
- **Secure Authentication**: JWT tokens with automatic refresh
- **Privacy Controls**: Granular settings for data collection and storage

### API Security
- **Rate Limiting**: Protection against abuse and excessive usage
- **Input Validation**: All user inputs sanitized and validated
- **CORS Configuration**: Proper cross-origin resource sharing setup

## 📈 Analytics & Monitoring

### User Analytics
- **Learning Progress**: Track vocabulary mastery and retention rates
- **Usage Patterns**: Understand how users interact with different features
- **Performance Metrics**: Monitor app performance and user satisfaction

### System Monitoring
- **Error Tracking**: Comprehensive error logging and alerting
- **Performance Monitoring**: Real-time performance metrics
- **Uptime Monitoring**: 99.9% availability tracking

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI**: For providing excellent TTS and STT APIs
- **Anthropic**: For Claude AI language model
- **Supabase**: For the robust backend infrastructure
- **Expo**: For simplifying mobile development
- **React Community**: For the amazing ecosystem

## 📞 Support

- **Documentation**: [docs.learndeck.app](https://docs.learndeck.app)
- **Issues**: [GitHub Issues](https://github.com/yourusername/learndeck/issues)
- **Email**: support@learndeck.app
- **Discord**: [Join our community](https://discord.gg/learndeck)

---

**LearnDeck** - Master German vocabulary with AI-powered learning and voice practice.