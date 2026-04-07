#!/bin/bash
# scan-secrets.sh — Scan tracked files and git history for likely committed secrets
# Exit codes: 0 = no matches found, 1 = potential secret found, 2 = configuration error

set -euo pipefail

if ! command -v git &>/dev/null; then
  echo "ERROR: git is not installed or not in PATH" >&2
  exit 2
fi

LOG_DIR="logs"
LOG_FILE="$LOG_DIR/secrets-$(date +%Y%m%d-%H%M%S).log"
SECRET_REGEX='(sk-[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{35}|-----BEGIN [A-Z ]*PRIVATE KEY-----|GOCSPX-[A-Za-z0-9_-]{20,}|1//[0-9A-Za-z_-]{20,})'

mkdir -p "$LOG_DIR"

CURRENT_MATCHES=$(git grep -nE "$SECRET_REGEX" -- . ':(exclude)env.example' ':(exclude)package-lock.json' || true)
HISTORY_MATCHES=$(git rev-list --all | while read -r rev; do
  git grep -nE "$SECRET_REGEX" "$rev" -- . ':(exclude)env.example' ':(exclude)package-lock.json' || true
done | sort -u)

{
  echo "=== Secret Scan at $(date -u) ==="
  echo "Scanning tracked files and git history for likely credential patterns."
  echo "Allowlist: documented placeholders in env.example, plus package-lock.json."
  echo ""

  echo "--- Current tracked files ---"
  if [ -n "$CURRENT_MATCHES" ]; then
    echo "$CURRENT_MATCHES"
  else
    echo "No matches found."
  fi
  echo ""

  echo "--- Git history ---"
  if [ -n "$HISTORY_MATCHES" ]; then
    echo "$HISTORY_MATCHES"
  else
    echo "No matches found."
  fi
} | tee "$LOG_FILE"

if [ -n "$CURRENT_MATCHES" ] || [ -n "$HISTORY_MATCHES" ]; then
  echo ""
  echo "=== POTENTIAL SECRETS FOUND ===" | tee -a "$LOG_FILE"
  echo "Log saved to: $LOG_FILE"
  exit 1
fi

echo ""
echo "=== No potential secrets found ===" | tee -a "$LOG_FILE"
echo "Log saved to: $LOG_FILE"
exit 0
