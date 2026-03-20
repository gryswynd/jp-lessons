#!/bin/bash
# Hook: validate-json.sh
# Runs on: PostToolUse (Edit|Write)
# Purpose: Validates JSON syntax after every content file edit.

set -euo pipefail

# Read hook input from stdin
INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

[[ -z "$FILE" ]] && exit 0
[[ ! "$FILE" =~ \.(json)$ ]] && exit 0

# Skip non-content files
[[ "$FILE" =~ (manifest|glossary|conjugation_rules|counter_rules|particles|characters|helper-vocab|package) ]] && exit 0

if ! python3 -c "
import json, sys
try:
    with open('$FILE') as f:
        json.load(f)
except json.JSONDecodeError as e:
    print(f'JSON SYNTAX ERROR in $FILE:', file=sys.stderr)
    print(f'  {e}', file=sys.stderr)
    sys.exit(1)
"; then
    exit 2
fi
