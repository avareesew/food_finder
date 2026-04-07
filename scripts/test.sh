#!/bin/bash
# test.sh — Lint + build with structured log capture
# Exit codes: 0 = success, 1 = test failure, 2 = configuration error

set -euo pipefail

# --- Configuration check (exit 2 if missing tools) ---
if ! command -v node &>/dev/null; then
  echo "ERROR: node is not installed or not in PATH" >&2
  exit 2
fi
if ! command -v npm &>/dev/null; then
  echo "ERROR: npm is not installed or not in PATH" >&2
  exit 2
fi

LOG_DIR="logs"
LOG_FILE="$LOG_DIR/test-$(date +%Y%m%d-%H%M%S).log"

export NEXT_DISABLE_TURBOPACK=1
export NEXT_TURBOPACK=0

mkdir -p "$LOG_DIR"

trap 'echo "=== Tests FAILED at $(date -u) ===" | tee -a "$LOG_FILE"; exit 1' ERR

{
  echo "=== Running lint + build at $(date -u) ==="
  echo "Node: $(node --version)  npm: $(npm --version)"
  echo ""

  echo "--- Lint ---"
  npm run lint 2>&1
  echo "=== Lint succeeded ==="
  echo ""

  echo "--- Build ---"
  npm run build 2>&1
  echo "=== Build succeeded ==="
  echo ""

  echo "=== All tests passed at $(date -u) ==="
} | tee -a "$LOG_FILE"

echo ""
echo "Log saved to: $LOG_FILE"
exit 0
