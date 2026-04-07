#!/bin/bash
# test-slack-ingest.sh — Test the Slack ingestion pipeline against local dev server
# Exit codes: 0 = success, 1 = ingest failure, 2 = configuration error
#
# Usage:
#   bash scripts/test-slack-ingest.sh
#
# Requires: local dev server running on port 3000
#           CRON_SECRET set in .env.local (or dev mode which skips auth)

set -euo pipefail

LOG_DIR="logs"
LOG_FILE="$LOG_DIR/slack-ingest-$(date +%Y%m%d-%H%M%S).log"
BASE_URL="${BASE_URL:-http://localhost:3000}"
CRON_SECRET="${CRON_SECRET:-}"

mkdir -p "$LOG_DIR"

echo "=== Slack Ingest Test at $(date -u) ===" | tee "$LOG_FILE"
echo "Target: $BASE_URL/api/cron/slack-ingest" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Check if dev server is running
if ! curl -s --max-time 5 "$BASE_URL" >/dev/null 2>&1; then
  echo "ERROR: Dev server not reachable at $BASE_URL" | tee -a "$LOG_FILE"
  echo "Start it with: npm run dev" | tee -a "$LOG_FILE"
  exit 2
fi

# Build the URL with secret if provided
if [ -n "$CRON_SECRET" ]; then
  URL="$BASE_URL/api/cron/slack-ingest?secret=$CRON_SECRET"
else
  URL="$BASE_URL/api/cron/slack-ingest"
fi

echo "--- Calling Slack ingest endpoint ---" | tee -a "$LOG_FILE"
RESPONSE=$(curl -s -w "\n%{http_code}" "$URL" 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

echo "HTTP Status: $HTTP_CODE" | tee -a "$LOG_FILE"
echo "Response:" | tee -a "$LOG_FILE"
echo "$BODY" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Check for success
if [ "$HTTP_CODE" != "200" ]; then
  echo "=== FAILED: HTTP $HTTP_CODE ===" | tee -a "$LOG_FILE"
  echo "Log saved to: $LOG_FILE"
  exit 1
fi

# Check for "ok": true in response
if echo "$BODY" | grep -q '"ok":true'; then
  echo "=== SUCCESS: Slack ingest completed ===" | tee -a "$LOG_FILE"
elif echo "$BODY" | grep -q '"disabled":true'; then
  echo "=== INFO: Slack ingest disabled (no workspaces configured) ===" | tee -a "$LOG_FILE"
else
  echo "=== WARNING: Unexpected response format ===" | tee -a "$LOG_FILE"
fi

echo ""
echo "Log saved to: $LOG_FILE"
exit 0
