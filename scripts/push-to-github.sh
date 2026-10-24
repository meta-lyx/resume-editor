#!/bin/bash
set -e

cd "$(dirname "$0")/.."

echo "==> Loading SSH key..."
eval "$(ssh-agent -s)" >/dev/null
ssh-add ~/.ssh/id_ed25519 2>/dev/null || {
  echo "Could not load ~/.ssh/id_ed25519 — run: ssh-add ~/.ssh/id_ed25519"
  exit 1
}

echo "==> Testing GitHub SSH..."
if ! ssh -o BatchMode=yes -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
  echo ""
  echo "SSH key is NOT on your GitHub account yet."
  echo "1. Open: https://github.com/settings/ssh/new"
  echo "2. Title: MacBook"
  echo "3. Paste this ENTIRE line:"
  echo ""
  cat ~/.ssh/id_ed25519.pub
  echo ""
  echo "4. Click 'Add SSH key', then run this script again."
  exit 1
fi

git remote set-url origin git@github.com:meta-lyx/resume-editor.git

echo "==> Pushing to origin/main..."
git push origin main

echo ""
echo "Done! Check deploy: https://github.com/meta-lyx/resume-editor/actions"
