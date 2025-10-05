# 同步 main → 远程
# 同步 main → dev
# 同步 main → web


#!/usr/bin/env bash
# sync-branches.sh
# One-click: push local main to origin, then sync dev & web from main.
# Safe by default; asks before forcing.
# Usage:
#   bash sync-branches.sh            # interactive, safest
#   bash sync-branches.sh -y         # auto-confirm
#   bash sync-branches.sh -y --force # auto-confirm + force-with-lease if needed
#
# Requirements: git

set -euo pipefail

AUTO_CONFIRM=0
MAY_FORCE=0

for arg in "$@"; do
  case "$arg" in
    -y|--yes) AUTO_CONFIRM=1 ;;
    --force) MAY_FORCE=1 ;;
    *) echo "Unknown option: $arg"; exit 2 ;;
  esac
done

say() { printf "\033[1;36m[SYNC]\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m[WARN]\033[0m %s\n" "$*"; }
err() { printf "\033[1;31m[ERR]\033[0m %s\n" "$*" >&2; }
ok() { printf "\033[1;32m[OK]\033[0m %s\n" "$*"; }

confirm() {
  if [[ $AUTO_CONFIRM -eq 1 ]]; then
    return 0
  fi
  read -p "$1 [type YES to continue] " ans
  [[ "$ans" == "YES" ]]
}

# --- preflight checks ---
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { err "Not a git repository."; exit 1; }

if ! git remote get-url origin >/dev/null 2>&1; then
  err "No 'origin' remote configured. Add it first: git remote add origin <url>"
  exit 1
fi

# check working tree clean
if ! git diff --quiet || ! git diff --cached --quiet; then
  warn "You have uncommitted changes."
  if ! confirm "Commit/stash first if needed. Continue anyway?"; then
    err "Aborted."
    exit 1
  fi
fi

say "Fetching latest from origin..."
git fetch origin --prune

# helper: ensure branch exists locally, else create from main
ensure_branch() {
  local BR="$1"
  if git show-ref --verify --quiet "refs/heads/$BR"; then
    return 0
  fi
  say "Creating local branch '$BR' from main..."
  git branch "$BR" main
}

push_branch() {
  local BR="$1"
  say "Pushing '$BR' to origin..."
  if ! git push -u origin "$BR"; then
    warn "Normal push for '$BR' was rejected (likely non-fast-forward)."
    if [[ $MAY_FORCE -eq 1 ]]; then
      warn "Attempting --force-with-lease for '$BR'..."
      git push -u origin "$BR" --force-with-lease
    else
      warn "Re-run with --force to allow a safe force push of '$BR'."
      return 1
    fi
  fi
  ok "Pushed '$BR'."
}

# --- 1) push main ---
say "Switching to main..."
git checkout main

# set upstream if missing
if ! git rev-parse --abbrev-ref --symbolic-full-name "@{u}" >/dev/null 2>&1; then
  warn "main has no upstream. It will be set on first push."
fi

say "Syncing local main with origin/main (rebase fast-forward if any)..."
if git ls-remote --exit-code --heads origin main >/dev/null 2>&1; then
  # only pull if remote exists
  git pull --rebase origin main || true
fi

if ! push_branch "main"; then
  err "Failed to push 'main'. Use --force if you intend to overwrite remote (with safety)."
  exit 1
fi

# --- 2) sync dev from main ---
ensure_branch "dev"
say "Switching to dev and merging main..."
git checkout dev
# fast-forward if possible, else merge with message
if git merge --ff-only main 2>/dev/null; then
  :
else
  git merge --no-ff -m "chore(sync): sync from main" main
fi
push_branch "dev" || { err "Failed to push 'dev'."; exit 1; }

# --- 3) sync web from main ---
ensure_branch "web"
say "Switching to web and merging main..."
git checkout web
if git merge --ff-only main 2>/dev/null; then
  :
else
  git merge --no-ff -m "chore(sync): sync from main" main
fi
push_branch "web" || { err "Failed to push 'web'."; exit 1; }

# --- done ---
say "Switching back to dev for next development..."
git checkout dev
ok "All done. main/dev/web are now synced with local main and pushed."

# --- Open preview and production sites ---
say "Opening preview (GitHub Pages) and production (Vercel) sites..."

URL_PREVIEW="https://MMing1999.github.io/zmh.life/"
URL_PROD="https://zmh.life/"

open_url() {
  local url="$1"
  if command -v open >/dev/null; then
    open "$url"            # macOS
  elif command -v xdg-open >/dev/null; then
    xdg-open "$url"        # Linux
  elif command -v start >/dev/null; then
    start "$url"           # Windows Git Bash
  else
    echo "Please open manually: $url"
  fi
}

open_url "$URL_PREVIEW"
open_url "$URL_PROD"

ok "✅ Sites opened in browser (Preview + Production)."