#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

cleanup() {
  trap - INT TERM EXIT
  if [[ -n "${api_pid:-}" ]]; then
    kill "$api_pid" 2>/dev/null || true
  fi
  if [[ -n "${web_pid:-}" ]]; then
    kill "$web_pid" 2>/dev/null || true
  fi
}

trap cleanup INT TERM EXIT

echo "Starting Plant-Man API on http://localhost:5074"
dotnet watch --project plant-manager run &
api_pid=$!

echo "Starting Plant-Man web app on http://localhost:5173"
npm --prefix plant-manager-web run dev -- --host 0.0.0.0 &
web_pid=$!

wait -n "$api_pid" "$web_pid"
exit_code=$?
cleanup
exit "$exit_code"
