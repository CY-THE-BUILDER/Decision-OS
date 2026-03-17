#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${API_BASE_URL:-}" ]]; then
  echo "API_BASE_URL is required"
  exit 1
fi

if [[ -z "${WEB_BASE_URL:-}" ]]; then
  echo "WEB_BASE_URL is required"
  exit 1
fi

echo "Checking API health..."
curl -fsSL "${API_BASE_URL}/health"
echo

echo "Checking web Today page..."
curl -fsSI "${WEB_BASE_URL}/today" | head -n 1

echo "Smoke test passed."
