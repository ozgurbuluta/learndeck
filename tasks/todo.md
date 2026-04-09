# Current Tasks

## Active Task

_No active task_

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
