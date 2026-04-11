# Lessons Learned

This file captures patterns and corrections to prevent repeated mistakes.

---

## Project-Specific Lessons

### Firebase
- **Always use free tier** - No Storage, ML Kit, or paid features
- Check `FirebaseService` for existing patterns before adding new methods

### Flutter/Dart
- Use `ConsumerWidget` for Riverpod, not `StatefulWidget` + `Consumer`
- Theme values: `AppColors.primary`, not hardcoded colors
- Spacing: `AppSpacing.lg`, not `16.0`

### macOS / Xcode Environment
- **Never clone or work on this project under `~/Documents/` or `~/Desktop/`** — iCloud Desktop & Documents sync creates duplicate folders during builds that crash Xcode
- Recommended path: `~/Developer/learndeck`
- If Xcode hangs or builds fail with duplicate Pod folders, the first question is "is this in an iCloud-synced directory?"

### API Development
- Always add CORS headers to Vercel endpoints
- Copy pattern from existing endpoint (ai-vocabulary.ts)
- Handle JSON extraction from markdown code blocks

---

## General Patterns

### Documentation
- Keep CLAUDE.md concise - detailed docs go in LLM_AGENT_BRIEFING.md
- Update docs after feature completion, not during

### Git Workflow
- Commit after each logical step, not in batches
- Push frequently for clear history
- Use conventional commits: `feat:`, `fix:`, `docs:`

---

## Corrections Log

_Add entries here when the user corrects a mistake_

| Date | Mistake | Lesson | Rule Added |
|------|---------|--------|------------|
| 2026-03-26 | Named detailed guide as CLAUDE.md | CLAUDE.md is for concise instructions, detailed docs go elsewhere | Keep CLAUDE.md short |
| 2026-04-11 | Spent a day treating iCloud duplicate Pod symptoms (deleting duplicates, symlinks) instead of identifying iCloud sync as root cause | When builds produce mysterious duplicate files on macOS, check if the project is under `~/Documents/` or `~/Desktop/` (iCloud-synced). Fix the root cause (move project), not the symptom | Always clone to `~/Developer/` or another non-iCloud path |
| 2026-04-11 | Tried `.nosync` symlink hack for Pods which broke Xcode xcconfig resolution | Don't use symlinks in the Xcode/CocoaPods build tree — Xcode's build system doesn't reliably follow them for config files | Move the whole project out of iCloud instead of hacking individual directories |

---

## Review Checklist

Before marking any task complete:
- [ ] Code compiles without errors
- [ ] Tested on device/simulator (if UI)
- [ ] No console warnings/errors
- [ ] Git committed and pushed
- [ ] Documentation updated if needed
