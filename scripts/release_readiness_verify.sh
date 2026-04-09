#!/usr/bin/env bash
# Release Readiness — Phase 1: API smoke tests (matches AIService base URL).
# Usage: from repo root: bash scripts/release_readiness_verify.sh
# Requires: curl, jq (optional; used for pretty summary)

set -euo pipefail

BASE="${LEARNDECK_API_BASE:-https://learndeck-six.vercel.app/api}"
FAIL=0

http_code() {
  curl -sS -o /tmp/ld_rr_body.json -w "%{http_code}" "$@"
}

check_post() {
  local name="$1" path="$2" body="$3"
  local code
  code=$(http_code -X POST "${BASE}${path}" \
    -H "Content-Type: application/json" \
    -d "$body")
  # Pass: 2xx/4xx = routing + handler reached. Fail: DNS, 404, 5xx, empty code.
  if [[ -z "$code" || "$code" == "000" || "$code" == "404" ]]; then
    echo "BAD $name  HTTP ${code:-empty}  (${BASE}${path})"
    FAIL=1
  elif [[ "$code" =~ ^5 ]]; then
    echo "BAD $name  HTTP $code (check Vercel env CLAUDE_API_KEY + logs)  (${BASE}${path})"
    FAIL=1
  else
    echo "OK  $name  HTTP $code  (${BASE}${path})"
  fi
}

echo "=== LearnDeck API smoke (BASE=$BASE) ==="

code=$(http_code -X OPTIONS "${BASE}/ai-vocabulary" -H "Origin: https://example.com")
if [[ "$code" == "200" ]]; then
  echo "OK  OPTIONS ai-vocabulary  HTTP $code"
else
  echo "BAD OPTIONS ai-vocabulary  HTTP $code"
  FAIL=1
fi

check_post "ai-vocabulary" "/ai-vocabulary" '{"userMessage":"release readiness ping"}'
check_post "conversation" "/conversation" '{"userMessage":"hi","targetLanguage":"German"}'
check_post "pronunciation-feedback" "/pronunciation-feedback" \
  '{"targetWord":"Hallo","spokenWord":"Halo","targetLanguage":"German","similarityScore":0.85}'
check_post "process-document (rich text)" "/process-document" \
  '{"content":"apple, banana, cherry — three fruits for testing extraction.","fileType":"txt"}'

if command -v jq >/dev/null 2>&1 && [[ -s /tmp/ld_rr_body.json ]]; then
  echo "--- Last response body (preview) ---"
  jq -c . /tmp/ld_rr_body.json 2>/dev/null | head -c 400 || true
  echo ""
fi

echo ""
echo "=== Phase 2: device checklist (manual) ==="
cat <<'CHECKLIST'
1. Auth: cold start → sign in / Google / Apple → reach Home or Onboarding
2. Onboarding: Profile → reset if needed → flow → Starter vocabulary generate → Home
3. Dashboard + Study: stats load → Start Study → swipe cards → stats update
4. AI Chat: ask for words → response + save if offered
5. Practice: Listen & Choose, Pronunciation (AI feedback), AI Conversation
6. Import: paste text → process → save words
7. Library: list, edit, delete word; folders if present
8. Notifications: enable + scheduled time → notification fires
CHECKLIST

exit "$FAIL"
