# Current Tasks

## Active Task: UI Quality Improvement Initiative

### Objective
Systematically improve mobile app UI quality across all screens and functionality, working in phases with commits after each phase.

### Phase Overview
1. **Phase 1: Design Token Consistency** ← CURRENT
2. **Phase 2: Typography & Text Overflow Handling** ← CURRENT

---

### Phase 2: Typography & Text Overflow Handling ✅ COMPLETE

**Goal:** Ensure all user-generated content has proper text overflow handling and typography uses AppTextStyles consistently.

- [x] Add badge text styles to AppTextStyles (badge, badgeSmall)
- [x] Fix DifficultyBadge - use badge/badgeSmall styles
- [x] Fix WordTile - add maxLines/overflow to word text
- [x] Fix StatCard - add maxLines/overflow to label
- [x] Fix QuickActionCard - add maxLines/overflow to label  
- [x] Fix SectionHeader - add Flexible wrapper + overflow handling
- [x] Fix ProgressCard - add overflow handling to _ProgressItem labels
- [x] Fix StudySessionScreen flashcard - use displayMedium + add overflow
- [x] Fix WordListScreen word tile - add overflow handling
- [x] Fix AIChatScreen word chips - add Flexible + overflow
- [x] Fix PronunciationScreen - use displayMedium + add overflow
- [x] Fix ShadowingScreen - use displayMedium + add overflow
- [x] Fix AuthScreen - use displayMedium for app title
- [x] Fix StarterVocabularyScreen - add overflow handling
- [x] Fix ImportScreen - add overflow handling
- [x] Fix ListeningExerciseScreen option buttons - add overflow
- [x] Commit and push Phase 2

**Verification:** flutter analyze passes (6 pre-existing info-level only)
3. **Phase 3: Component Standardization (Dialogs, Forms)** ← CURRENT

---

### Phase 3: Component Standardization (Dialogs, Forms) ✅ COMPLETE

**Goal:** Standardize dialog and form patterns across the app for consistent UX.

- [x] Create DragHandle widget for bottom sheets
- [x] Create BottomSheetHeader widget with drag handle + title
- [x] Create AppConfirmDialog for standardized confirmation dialogs
- [x] Update dashboard_screen.dart bottom sheets (3 dialogs)
- [x] Update word_list_screen.dart bottom sheets (2 dialogs) + delete confirmation
- [x] Update profile_screen.dart dialogs (sign out, reset onboarding)
- [x] Add proper labels to form TextFields (labelText + hintText)
- [x] Add autofocus to primary input fields
- [x] Commit and push Phase 3

**Note:** quiz_screen.dart results sheet intentionally kept different (non-dismissible results display)

**Verification:** flutter analyze passes (6 pre-existing info-level only)
4. **Phase 4: Navigation & Transitions** ← CURRENT

---

### Phase 4: Navigation & Transitions ✅ COMPLETE

**Goal:** Improve navigation experience with smoother transitions and better visual feedback.

- [x] Create custom page route with fade+slide transition (AppPageRoute in page_transitions.dart)
- [x] Enhance bottom nav with scale animation on icons (AnimatedNavIcon)
- [x] Add tab switch animation using AnimatedSwitcher (home_screen.dart)
- [x] Update all Navigator.push calls to use custom route (pushScreen, pushAndRemoveUntilScreen)
- [x] Commit and push Phase 4

**Verification:** flutter analyze passes (6 pre-existing info-level only)
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
- [x] Committed and pushed to main (c80649a)

**Note:** Visual testing recommended before starting Phase 2

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
