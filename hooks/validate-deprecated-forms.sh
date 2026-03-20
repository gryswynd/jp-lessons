#!/bin/bash
# Hook: validate-deprecated-forms.sh
# Runs on: post-edit of any content JSON
# Purpose: Catches deprecated patterns that should never appear in content.
#
# This replaces CLAUDE.md rules: Failure Mode #53c (desire_tai deprecated),
# #7 (k_* in conversations), and other mechanical anti-patterns.

set -euo pipefail

FILE="$1"

# Only run on content JSON files
if [[ ! "$FILE" =~ \.(json)$ ]]; then
    exit 0
fi

# Skip non-content files
if [[ "$FILE" =~ (manifest|glossary|conjugation_rules|counter_rules|particles|characters|helper-vocab|package) ]]; then
    exit 0
fi

ERRORS=0

# Check for deprecated desire_tai (must be plain_desire_tai + g_desu)
if grep -q '"form": "desire_tai"' "$FILE" 2>/dev/null; then
    # Make sure it's not plain_desire_tai
    if grep -P '"form":\s*"desire_tai"' "$FILE" | grep -vq 'plain_desire_tai'; then
        echo "DEPRECATED FORM in $(basename "$FILE"):"
        echo "  Found 'desire_tai' — use 'plain_desire_tai' + 'g_desu' instead"
        ERRORS=1
    fi
fi

# Check for k_* IDs outside kanjiGrid sections
# This is a rough check — the Python hook does it more precisely
if python3 -c "
import json, sys
with open('$FILE') as f:
    data = json.load(f)

def find_k_ids(obj, in_kanji_grid=False, path=''):
    issues = []
    if isinstance(obj, dict):
        is_grid = obj.get('type') == 'kanjiGrid'
        for key, val in obj.items():
            issues.extend(find_k_ids(val, in_kanji_grid or is_grid, f'{path}.{key}'))
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            issues.extend(find_k_ids(item, in_kanji_grid, f'{path}[{i}]'))
    elif isinstance(obj, str) and obj.startswith('k_') and not in_kanji_grid:
        # Check if this is inside a terms array
        if '.terms' in path:
            issues.append(f'  k_* ID \"{obj}\" in terms at {path} — use v_* instead')
    return issues

issues = find_k_ids(data)
if issues:
    print(f'K_* ID USAGE ERROR in $(basename "$FILE"):')
    for issue in issues[:5]:
        print(issue)
    sys.exit(1)
" 2>/dev/null; then
    :
else
    ERRORS=1
fi

exit $ERRORS
