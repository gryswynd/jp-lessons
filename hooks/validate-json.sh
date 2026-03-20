#!/bin/bash
# Hook: validate-json.sh
# Runs on: post-edit of any JSON file
# Purpose: Validates JSON syntax. Catches trailing commas, unclosed brackets,
#          and other structural errors before they propagate.
#
# This replaces CLAUDE.md CB Checklist item: "JSON is valid (no trailing commas, all brackets closed)"

set -euo pipefail

FILE="$1"

# Only run on JSON files
if [[ ! "$FILE" =~ \.(json)$ ]]; then
    exit 0
fi

if ! python3 -c "
import json, sys
try:
    with open('$FILE') as f:
        json.load(f)
except json.JSONDecodeError as e:
    print(f'JSON SYNTAX ERROR in $(basename "$FILE"):')
    print(f'  {e}')
    sys.exit(1)
"; then
    exit 1
fi
