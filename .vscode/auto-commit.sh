#!/usr/bin/env bash
set -e

# Throttle window in seconds (10 seconds)
MIN_INTERVAL=10
STATE_FILE=".vscode/.last-auto-commit"

cd "$(git rev-parse --show-toplevel)"

now_ts=$(date +%s)
last_ts=0
if [ -f "$STATE_FILE" ]; then
  last_ts=$(cat "$STATE_FILE" 2>/dev/null || echo 0)
fi

elapsed=$(( now_ts - last_ts ))
if [ "$elapsed" -lt "$MIN_INTERVAL" ]; then
  # Too soon — skip auto-commit silently
  exit 0
fi

git add .
git commit -m "Auto commit: $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main

# record timestamp
echo "$now_ts" > "$STATE_FILE"