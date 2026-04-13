# Current Tasks

## Active Task: UI Quality Improvement Initiative

### Objective
Systematically improve mobile app UI quality across all screens and functionality, working in phases with commits after each phase.

### Phase Overview
1. **Phase 1: Design Token Consistency** ← CURRENT
2. Phase 2: Typography & Text Overflow Handling
3. Phase 3: Component Standardization (Dialogs, Forms)
4. Phase 4: Navigation & Transitions
5. Phase 5: Micro-interactions & Polish

---

### Phase 1: Design Token Consistency ✅ COMPLETE

**Goal:** Replace all hardcoded spacing, colors, and radius values with AppSpacing/AppColors/AppRadius constants.

- [x] Audit all screens for hardcoded values
- [x] Add new text styles to AppTheme (displayLarge, displayMedium, displaySmall, navLabel)
- [x] Fix DashboardScreen - hardcoded padding/spacing (lines 541, 555)
- [x] Fix HomeScreen - inline TextStyle (line 96 → navLabel)
- [x] Fix StudySessionScreen - inline TextStyle (lines 411, 463 → displayLarge/Medium)
- [x] Fix ProfileScreen - inline TextStyle (lines 122, 228, 417 → button.copyWith)
- [x] Fix OnboardingScreen - hardcoded top:4 padding (lines 340, 822 → AppSpacing.xs)
- [x] Fix AIChatScreen - hardcoded right:4 (line 344 → AppSpacing.xs)
- [x] Fix ListeningExerciseScreen - inline TextStyle (lines 441, 504 → displayLarge/Medium)
- [x] Fix PronunciationScreen - inline TextStyle (lines 469, 541, 598 → displayLarge/Medium/statNumber)
- [x] Fix ShadowingScreen - inline TextStyle (lines 518, 615, 672 → displaySmall/Large/Medium)
- [x] Fix SpellExerciseScreen - inline TextStyle (lines 501, 564 → displayLarge/Medium)
- [x] Fix StarterVocabularyScreen - inline TextStyle (lines 242, 285 → button.copyWith)
- [x] Fix WordListScreen - inline TextStyle (line 464 → button.copyWith)
- [x] Commit and push Phase 1

### Verification
- [x] `flutter analyze` passes with no new issues (3 pre-existing info-level only)
- [ ] App builds and runs without errors
- [ ] Visual inspection confirms no regressions

---

---

## Suggested next priorities (agent backlog)

*Last updated: 2026-04-01. Use this when there is no active task above. Aligns with `LLM_AGENT_BRIEFING.md`: Firebase free tier, device TTS/STT, minimize Claude/API cost. Active codebase: `learndeck_flutter/` + `api/`.*

### P0 — Release readiness

- [ ] End-to-end pass on a physical device: auth, onboarding, study, voice, notifications; fix crashes and blockers (use [`learndeck_flutter/RELEASE_READINESS.md`](learndeck_flutter/RELEASE_READINESS.md))
- [x] Confirm production parity: Vercel API reachable + `CLAUDE_API_KEY` effective — automated via `scripts/release_readiness_verify.sh` (2026-04-09); Firebase still verify in app against [`learndeck_flutter/lib/firebase_options.dart`](learndeck_flutter/lib/firebase_options.dart)

### P0 — Cost and reliability

- [ ] Audit Claude/API usage: caching, batching, rate limits, error UX; keep costs predictable as usage grows

### P1 — Quality

- [ ] Add or extend automated tests for highest-risk areas (providers, spaced repetition, AI client response parsing)

### P1 — Repository hygiene

- [ ] Decide fate of legacy trees (`apps/`, `learndeck-mobile/`, `supabase/`)—archive, document as frozen, or deprioritize in workflows; keep effort on `learndeck_flutter/` + `api/`

### P2 — Notifications polish

- [ ] Review `learndeck_flutter/NOTIFICATIONS.md`: edge cases, copy, permission UX, alignment with streaks and goals

### P2 — Store distribution

- [ ] If shipping to stores: EAS / App Store / Play checklist (signing, privacy strings, analytics if applicable)

---

## Task Template

When starting a new task, copy this template:

```markdown
## Task: [Task Name]

### Objective
[What we're trying to achieve]

### Plan
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

### Progress
[Updates as work progresses]

### Verification
- [ ] Tests pass
- [ ] Manually tested
- [ ] Code reviewed

### Review
[Summary of what was done and any lessons learned]
```

---

## Completed Tasks

### Release Readiness Verification (2026-04-09)

- [x] Phase 1: `scripts/release_readiness_verify.sh` — OPTIONS + POST smoke for all four `/api/*` routes (default base matches [`AIService`](learndeck_flutter/lib/services/ai_service.dart))
- [x] Phase 2: Manual steps captured in [`learndeck_flutter/RELEASE_READINESS.md`](learndeck_flutter/RELEASE_READINESS.md) with UI mapping (e.g. **Start Study Session**, **Reset Onboarding**)
- [x] Phase 3: Repaired flaky study-algorithm test; `flutter test` green

**Review**: Production API smoke returned HTTP 200 for `ai-vocabulary`, `conversation`, `pronunciation-feedback`, and `process-document` (rich text body). `dart analyze lib` reports 6 info-level lints only. Complete P0 device pass remains a human step.

### Voice Practice Implementation (2026-03-26)
- [x] Phase 1: TTS & Listening (6 steps)
- [x] Phase 2: Speech Recognition (6 steps)
- [x] Documentation updates

**Review**: Implemented complete voice practice system with 5 exercise types. All commits pushed incrementally for clear git history.
