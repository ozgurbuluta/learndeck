# Claude Code Instructions

## Project

LearnDeck - AI-powered vocabulary learning app built with Flutter.

## Quick Context

- **Active codebase**: `learndeck_flutter/` (Flutter) + `api/` (Vercel)
- **Legacy code** (ignore): `apps/`, `learndeck-mobile/`, `supabase/`
- **Detailed docs**: See `LLM_AGENT_BRIEFING.md` for full project context

## Critical Rules

1. **Firebase Free Tier Only** - Never use paid Firebase features
2. **Use Device TTS/STT** - `flutter_tts` and `speech_to_text` packages (free)
3. **Minimize Claude API calls** - AI is the main cost

## Code Style

- Use Riverpod for state management
- Static service classes (not instances)
- Use theme constants: `AppColors`, `AppSpacing`, `AppTextStyles`
- Prefer `ConsumerWidget` over `StatefulWidget` when possible

## Key Commands

```bash
cd learndeck_flutter && flutter run    # Run app
cd api && vercel --prod                # Deploy API
```

## Documentation

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `LLM_AGENT_BRIEFING.md` | Detailed development guide |
| `learndeck_flutter/README.md` | Flutter implementation details |
| `learndeck_flutter/NOTIFICATIONS.md` | Push notification tracking |
