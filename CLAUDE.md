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

---

## Workflow Rules

### 1. Plan Node Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests - then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

---

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

---

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards

---

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
| `tasks/todo.md` | Current task plan and progress |
| `tasks/lessons.md` | Lessons learned from corrections |
