#!/bin/bash
# Hook: validate-manifest-slugs.sh
# Runs on: PostToolUse (Edit|Write)
# Purpose: Ensures every custom story entry in manifest.json has its `id`
#          matching the final path segment of its `dir`. Catches the case where
#          a story title is renamed but the slug (directory name + manifest id)
#          is not updated to match.
#
# Rule enforced: for each entry in manifest.data.custom.stories[],
#   basename(entry.dir) must equal entry.id

set -euo pipefail

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

[[ -z "$FILE" ]] && exit 0
[[ ! "$FILE" =~ manifest\.json$ ]] && exit 0

python3 - "$FILE" << 'PYEOF'
import json, sys, os

manifest_path = sys.argv[1]

try:
    with open(manifest_path) as f:
        manifest = json.load(f)
except (json.JSONDecodeError, FileNotFoundError):
    sys.exit(0)  # JSON errors are caught by validate-json.sh

custom = manifest.get("data", {}).get("custom", {})
stories = custom.get("stories", [])

errors = []
for story in stories:
    story_id = story.get("id", "")
    story_dir = story.get("dir", "")
    dir_slug = os.path.basename(story_dir.rstrip("/"))
    if story_id != dir_slug:
        errors.append(
            f'  id "{story_id}" does not match dir basename "{dir_slug}"\n'
            f'  Fix: rename both the directory and the manifest id/dir to match the final titleJp romanization'
        )

if errors:
    print("MANIFEST SLUG MISMATCH in custom stories:", file=sys.stderr)
    for e in errors:
        print(e, file=sys.stderr)
    sys.exit(2)
PYEOF
