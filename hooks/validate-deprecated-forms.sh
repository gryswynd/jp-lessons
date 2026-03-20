#!/bin/bash
# Hook: validate-deprecated-forms.sh
# Runs on: PostToolUse (Edit|Write)
# Purpose: Catches deprecated patterns. Covers: FM #53c, #7

set -euo pipefail

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

[[ -z "$FILE" ]] && exit 0
[[ ! "$FILE" =~ \.(json)$ ]] && exit 0
[[ "$FILE" =~ (manifest|glossary|conjugation_rules|counter_rules|particles|characters|helper-vocab|package) ]] && exit 0

# Check for deprecated desire_tai (not plain_desire_tai)
if grep -P '"form":\s*"desire_tai"' "$FILE" 2>/dev/null | grep -vq 'plain_desire_tai'; then
    echo "DEPRECATED: 'desire_tai' found in $(basename "$FILE") — use 'plain_desire_tai' + 'g_desu'" >&2
    exit 2
fi

exit 0
