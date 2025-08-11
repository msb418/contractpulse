#!/usr/bin/env bash
set -e
cd "$(git rev-parse --show-toplevel)"
git add .
git commit -m "Auto commit: $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main