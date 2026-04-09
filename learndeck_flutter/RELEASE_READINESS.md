# Release readiness verification

This matches the **Release Readiness Verification** plan: Phase 1 is automated; Phase 2 is manual on a **physical device** (recommended for voice and notifications).

## Phase 1 — API smoke tests (automated)

From the **repository root**:

```bash
bash scripts/release_readiness_verify.sh
```

Optional: point at another deployment:

```bash
LEARNDECK_API_BASE=https://your-deployment.vercel.app/api bash scripts/release_readiness_verify.sh
```

The script must match the app’s base URL in [`lib/services/ai_service.dart`](lib/services/ai_service.dart) (`_baseUrl`).

**Last automated run (CI / local):** all four routes returned **HTTP 200** on production (`learndeck-six.vercel.app`) with minimal valid JSON bodies.

Also run before a release:

```bash
cd learndeck_flutter && flutter test && dart analyze lib
```

## Phase 2 — Device checklist (manual)

| Step | What to do in the app | Pass criteria |
|------|------------------------|---------------|
| 1 Auth | Cold start → email sign-in/up; try Google / Apple if enabled | Reach **Onboarding** or **Home** (tabs), no crash |
| 2 Onboarding | **Profile** → **Reset Onboarding** → complete flow → **Starter vocabulary** (generate) | Reach **Home**; starter step hits `/api/ai-vocabulary` |
| 3 Study | **Dashboard** → **Start Study Session** (or Study Options) → swipe cards → finish | Cards move; stats update on dashboard |
| 4 AI Chat | **AI Chat** tab or dashboard shortcut → e.g. “Give me 5 words about food” | Reply + optional save |
| 5 Voice | **Practice** → Listen & Choose, **Pronunciation** (AI feedback), **AI Conversation** | Audio + STT; no permanent “Could not get response” |
| 6 Import | **Dashboard** → **Import** → paste text → process | Words listed; save works |
| 7 Library | **Library** tab → edit / delete a word; folders if you use them | Firestore updates stick |
| 8 Notifications | **Profile** → **Daily Reminder** on, set time, grant OS permission | Fires at scheduled time (wait or test next minute) |

**UI mapping notes**

- Study entry: dashboard uses **“Start Study Session”** and **Study Options** (new / due / all), not a literal “Start Study” label.
- Reset flow: **Profile** → **Reset Onboarding** ([`profile_screen.dart`](lib/screens/profile_screen.dart)).

## Phase 3 — If something fails

1. **API / “Failed to connect”** — Vercel **Production** env `CLAUDE_API_KEY`, deployment logs, and `_baseUrl` host.
2. **Auth / empty data** — Firebase project matches [`lib/firebase_options.dart`](lib/firebase_options.dart); Auth + Firestore rules.
3. **Voice** — Real device; microphone permission; see **iOS Troubleshooting** in [`../LLM_AGENT_BRIEFING.md`](../LLM_AGENT_BRIEFING.md).
