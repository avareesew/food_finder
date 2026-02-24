#!/bin/bash

set -euo pipefail

LOG_DIR="logs"
LOG_FILE="$LOG_DIR/test-$(date +%Y%m%d-%H%M%S).log"

export NEXT_DISABLE_TURBOPACK=1
export NEXT_TURBOPACK=0

mkdir -p "$LOG_DIR"

trap 'echo "=== Tests failed at $(date -u) ===" | tee -a "$LOG_FILE"' ERR

{
  echo "=== Running lint + build at $(date -u) ==="
  npm run lint
  echo "=== Lint succeeded ==="
  npm run build -- --webpack
  echo "=== Build succeeded ==="
  echo "=== Tests completed successfully at $(date -u) ==="
} | tee -a "$LOG_FILE"
