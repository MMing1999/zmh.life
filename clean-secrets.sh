# 仅修改文件并 amend，不自动推送（推荐先看效果）
#bash clean-secrets.sh

# 查看将会命中的敏感行（不改动）
#bash clean-secrets.sh --dry-run

# 修改+amend 后直接推送到 origin/main（使用 --force-with-lease）
#bash clean-secrets.sh --push

# 改目标分支名（默认 main）
#bash clean-secrets.sh --branch main --push





#!/usr/bin/env bash
# clean-secrets.sh
# Purpose: Remove hardcoded Notion API tokens from the working tree AND the latest commit,
#          switch code to use environment variables, and push safely.
#
# Usage:
#   bash clean-secrets.sh                # amend last commit, NO push
#   bash clean-secrets.sh --push         # amend + push origin main (force-with-lease)
#   bash clean-secrets.sh --branch main  # change target branch (default: main)
#   bash clean-secrets.sh --dry-run      # only print matches
#
set -euo pipefail

BRANCH="main"
DO_PUSH=0
DRY_RUN=0

for i in "$@"; do
  case "$i" in
    --push) DO_PUSH=1 ;;
    --branch) shift; BRANCH="${1:-main}" ;;
    --dry-run) DRY_RUN=1 ;;
    *) ;;
  esac
done

say() { printf "\033[1;36m[CLEAN]\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m[WARN]\033[0m %s\n" "$*"; }
err() { printf "\033[1;31m[ERR]\033[0m %s\n" "$*" >&2; }

is_macos() { [[ "$OSTYPE" == darwin* ]]; }
inplace_sed() {
  if is_macos; then sed -i '' -E "$1" "$2"; else sed -i -E "$1" "$2"; fi
}
append_if_missing() { local l="$1" f="$2"; grep -qxF "$l" "$f" 2>/dev/null || echo "$l" >> "$f"; }
ensure_file() { local f="$1" c="$2"; [[ -f "$f" ]] || printf "%s\n" "$c" > "$f"; }

# --- checks ---
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { err "Not a git repository."; exit 1; }

CUR="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$CUR" != "$BRANCH" ]]; then warn "You are on '$CUR' (target '$BRANCH')."; fi

TARGETS=(
  "PROJECT_NOTES.md"
  "postEditor/scripts/fetch-notion-data-real.js"
  "postEditor/scripts/fetch-notion-data.js"
  "src/_data/notion.js"
)

say "Scanning target files..."
FOUND=()
for f in "${TARGETS[@]}"; do [[ -f "$f" ]] && FOUND+=("$f"); done
if [[ ${#FOUND[@]} -eq 0 ]]; then warn "No target files found."; fi

if [[ $DRY_RUN -eq 1 ]]; then
  say "Dry run: showing matches"
  for f in "${FOUND[@]}"; do
    echo ">>> $f"
    grep -nE 'NOTION_API_TOKEN|Bearer[[:space:]]+[A-Za-z0-9_\-\.]+' "$f" || true
  done
  exit 0
fi

fix_js() {
  local file="$1"
  [[ -f "$file" ]] || return 0

  # add dotenv import if missing
  if ! grep -qE "dotenv/config|require\(['\"]dotenv['\"]\)" "$file"; then
    tmp="$(mktemp)"
    { echo "import 'dotenv/config';"; cat "$file"; } > "$tmp"
    mv "$tmp" "$file"
  fi

  # replace hardcoded token assignment -> env
  inplace_sed 's/^(const|let|var)[[:space:]]+NOTION_API_TOKEN[[:space:]]*=[[:space:]]*["'\''][^"'\''"]+["'\''];/const NOTION_API_TOKEN = process.env.NOTION_API_TOKEN;/' "$file" || true

  # replace Authorization: "Bearer xxxx" -> template using env
  inplace_sed 's/("Authorization"[[:space:]]*:[[:space:]]*")Bearer[^"]*(")/\1`Bearer ${NOTION_API_TOKEN}`\2/' "$file" || true
  inplace_sed 's/("Authorization"[[:space:]]*:[[:space:]]*)["'\'']Bearer[^"'\'']*["'\'']/\1`Bearer ${NOTION_API_TOKEN}`/' "$file" || true

  # add guard if missing
  if ! grep -q "Missing NOTION_API_TOKEN" "$file"; then
    printf "\nif (!process.env.NOTION_API_TOKEN) { throw new Error('Missing NOTION_API_TOKEN (check .env.local / CI / Vercel).'); }\n" >> "$file"
  fi
}

for f in "postEditor/scripts/fetch-notion-data-real.js" "postEditor/scripts/fetch-notion-data.js" "src/_data/notion.js"; do
  [[ -f "$f" ]] && fix_js "$f"
done

if [[ -f "PROJECT_NOTES.md" ]]; then
  inplace_sed 's/(NOTION_API_TOKEN[[:space:]]*=[[:space:]]*).*/\1<REDACTED>/' "PROJECT_NOTES.md" || true
fi

append_if_missing ".env" ".gitignore"
append_if_missing ".env.*" ".gitignore"
append_if_missing "!.env.example" ".gitignore"
ensure_file ".env.example" "NOTION_API_TOKEN=\nNOTION_DATABASE_ID=\n"

git add -A

if git diff --cached --quiet; then
  warn "No staged changes."
else
  if git rev-parse HEAD >/dev/null 2>&1; then
    say "Amending last commit..."
    git commit --amend --no-edit
  else
    git commit -m "chore(security): use env for Notion token; redact docs"
  fi
fi

if [[ $DO_PUSH -eq 1 ]]; then
  say "Pushing origin/$BRANCH with --force-with-lease ..."
  git push -u origin "$BRANCH" --force-with-lease
else
  say "Review then push with: git push -u origin $BRANCH --force-with-lease"
fi
