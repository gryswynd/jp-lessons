#!/bin/bash
# Hook: rebuild-vocab-examples.sh
# Runs on: PostToolUse (Edit|Write)
# Purpose: Refresh vocab flashcard example sentences in glossaries after any
# lesson-file edit. Keeps data/N*/glossary.N*.json in sync with the lessons
# they source examples from.

set -euo pipefail

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

[[ -z "$FILE" ]] && exit 0

# Only rebuild when a lesson JSON changed.
if [[ ! "$FILE" =~ /data/N[0-9]/lessons/.*\.json$ ]]; then
  exit 0
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Run silently; surface errors (but don't block the edit).
if ! node "$REPO_ROOT/scripts/build-vocab-examples.js" >/dev/null 2>&1; then
  echo "rebuild-vocab-examples: generator failed (lesson edit kept; glossaries may be stale)" >&2
  exit 0
fi
