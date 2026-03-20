#!/bin/bash
# Hook: validate-kanji-scope.sh
# Runs on: post-edit of any lesson/grammar/review/compose JSON
# Purpose: Extracts all CJK characters from jp/passage fields and validates
#          each one exists in the taught-kanji set from manifest.json.
#
# This replaces CLAUDE.md rules: Kanji Prerequisite Rules, Failure Mode #1
# Environment enforces what instructions cannot.

set -euo pipefail

FILE="$1"
MANIFEST="$(dirname "$0")/../manifest.json"

# Only run on lesson content JSON files
if [[ ! "$FILE" =~ \.(json)$ ]]; then
    exit 0
fi

# Skip non-content files
if [[ "$FILE" =~ (manifest|glossary|conjugation_rules|counter_rules|particles|characters|helper-vocab) ]]; then
    exit 0
fi

if [[ ! -f "$MANIFEST" ]]; then
    echo "ERROR: manifest.json not found at $MANIFEST"
    exit 1
fi

# Extract the lesson ID from the file to determine scope
LESSON_ID=$(python3 -c "
import json, sys
with open('$FILE') as f:
    data = json.load(f)
# Try various fields that indicate lesson scope
lid = data.get('id', '') or data.get('lesson', '') or ''
# For grammar, use unlocksAfter from meta
if data.get('type') == 'grammar':
    lid = data.get('meta', {}).get('unlocksAfter', lid)
print(lid)
" 2>/dev/null || echo "")

if [[ -z "$LESSON_ID" ]]; then
    # Can't determine scope, skip validation
    exit 0
fi

# Build taught-kanji set and validate
python3 << 'PYEOF'
import json
import re
import sys
import os

file_path = sys.argv[1] if len(sys.argv) > 1 else os.environ.get('FILE', '')
manifest_path = sys.argv[2] if len(sys.argv) > 2 else os.environ.get('MANIFEST', '')

if not file_path or not manifest_path:
    sys.exit(0)

with open(manifest_path) as f:
    manifest = json.load(f)

with open(file_path) as f:
    content = json.load(f)

# Determine lesson scope
lesson_id = content.get('id', '') or content.get('lesson', '')
if content.get('type') == 'grammar':
    lesson_id = content.get('meta', {}).get('unlocksAfter', lesson_id)

if not lesson_id:
    sys.exit(0)

# Parse level and number from lesson_id (e.g. "N5.7", "N4.Review.3")
level_match = re.match(r'(N\d+)\.(\d+)', lesson_id)
if not level_match:
    sys.exit(0)

target_level = level_match.group(1)
target_num = int(level_match.group(2))

# Build taught-kanji set
taught_kanji = set()

# Collect all lessons from manifest
for level_key in ['N5', 'N4', 'N3', 'N2', 'N1']:
    level_data = manifest.get('data', {}).get(level_key, {})
    lessons = level_data.get('lessons', [])

    for lesson in lessons:
        lid = lesson.get('id', '')
        lmatch = re.match(r'(N\d+)\.(\d+)', lid)
        if not lmatch:
            continue

        llevel = lmatch.group(1)
        lnum = int(lmatch.group(2))

        # Include if: lower level than target, OR same level and <= target number
        level_order = {'N5': 0, 'N4': 1, 'N3': 2, 'N2': 3, 'N1': 4}
        target_order = level_order.get(target_level, 0)
        lesson_order = level_order.get(llevel, 0)

        if lesson_order < target_order:
            taught_kanji.update(lesson.get('kanji', []))
        elif lesson_order == target_order and lnum <= target_num:
            taught_kanji.update(lesson.get('kanji', []))

# Extract all CJK characters from jp/passage/q/a/answer fields
cjk_pattern = re.compile(r'[\u4e00-\u9fff]')

def extract_text_fields(obj, path=""):
    """Recursively extract all jp, passage, q, a, answer string values."""
    texts = []
    if isinstance(obj, dict):
        for key, val in obj.items():
            if key in ('jp', 'passage', 'q', 'a', 'answer', 'model', 'titleJp') and isinstance(val, str):
                texts.append((f"{path}.{key}", val))
            else:
                texts.extend(extract_text_fields(val, f"{path}.{key}"))
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            texts.extend(extract_text_fields(item, f"{path}[{i}]"))
    return texts

text_fields = extract_text_fields(content)
violations = []

for field_path, text in text_fields:
    for char in cjk_pattern.findall(text):
        if char not in taught_kanji:
            violations.append((char, field_path, text[:60]))

if violations:
    print(f"KANJI SCOPE VIOLATION in {os.path.basename(file_path)}:")
    print(f"  Lesson scope: {lesson_id} ({len(taught_kanji)} kanji taught)")
    for char, path, context in violations[:10]:
        print(f"  ✗ '{char}' at {path}: {context}...")
    if len(violations) > 10:
        print(f"  ... and {len(violations) - 10} more violations")
    sys.exit(1)

PYEOF "$FILE" "$MANIFEST"
