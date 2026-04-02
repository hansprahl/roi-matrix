#!/usr/bin/env bash
set -euo pipefail

GITHUB_USER="hansprahl"
REPO_NAME="return-on-integrity-matrix"
REMOTE_URL="https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git"

if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "Error: GITHUB_TOKEN environment variable is not set." >&2
  echo "Set it in Replit Secrets before running this script." >&2
  exit 1
fi

if git remote get-url github &>/dev/null; then
  git remote set-url github "$REMOTE_URL"
else
  git remote add github "$REMOTE_URL"
fi

echo "Pushing master -> main on https://github.com/${GITHUB_USER}/${REPO_NAME} ..."
git push github master:main

echo "Done. View your code at: https://github.com/${GITHUB_USER}/${REPO_NAME}"
