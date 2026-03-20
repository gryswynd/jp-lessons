#!/bin/bash
# Hook: validate-kanji-scope.sh
# Runs on: PostToolUse (Edit|Write)
# Purpose: Validates all kanji in jp fields are in the taught-kanji set.
# Covers: FM #1 (untaught kanji)

set -euo pipefail

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

[[ -z "$FILE" ]] && exit 0
[[ ! "$FILE" =~ \.(json)$ ]] && exit 0
[[ "$FILE" =~ (manifest|glossary|conjugation_rules|counter_rules|particles|characters|helper-vocab|package) ]] && exit 0

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MANIFEST="$REPO_ROOT/manifest.json"
[[ ! -f "$MANIFEST" ]] && exit 0

python3 - "$FILE" "$MANIFEST" << 'PYEOF'
import json, re, sys, os

file_path = sys.argv[1]
manifest_path = sys.argv[2]

try:
    with open(file_path) as f:
        content = json.load(f)
    with open(manifest_path) as f:
        manifest = json.load(f)
except:
    sys.exit(0)

# Determine lesson scope
lesson_id = content.get('id', '') or content.get('lesson', '')
if content.get('type') == 'grammar':
    lesson_id = content.get('meta', {}).get('unlocksAfter', lesson_id)
if not lesson_id:
    sys.exit(0)

level_match = re.match(r'(N\d+)\.(\d+)', lesson_id)
if not level_match:
    sys.exit(0)

target_level = level_match.group(1)
target_num = int(level_match.group(2))
level_order = {'N5': 0, 'N4': 1, 'N3': 2, 'N2': 3, 'N1': 4}
target_order = level_order.get(target_level, 0)

# Build taught-kanji set
taught_kanji = set()
for level_key in ['N5', 'N4', 'N3', 'N2', 'N1']:
    for lesson in manifest.get('data', {}).get(level_key, {}).get('lessons', []):
        lid = lesson.get('id', '')
        lmatch = re.match(r'(N\d+)\.(\d+)', lid)
        if not lmatch:
            continue
        llevel, lnum = lmatch.group(1), int(lmatch.group(2))
        lesson_order_val = level_order.get(llevel, 0)
        if lesson_order_val < target_order or (lesson_order_val == target_order and lnum <= target_num):
            taught_kanji.update(lesson.get('kanji', []))

# Extract CJK from jp/passage/q/a/answer fields
cjk_pattern = re.compile(r'[\u4e00-\u9fff]')

def extract_texts(obj, path=""):
    texts = []
    if isinstance(obj, dict):
        for key, val in obj.items():
            if key in ('jp', 'passage', 'q', 'a', 'answer', 'model', 'titleJp') and isinstance(val, str):
                texts.append((f"{path}.{key}", val))
            else:
                texts.extend(extract_texts(val, f"{path}.{key}"))
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            texts.extend(extract_texts(item, f"{path}[{i}]"))
    return texts

violations = []
for field_path, text in extract_texts(content):
    for char in cjk_pattern.findall(text):
        if char not in taught_kanji:
            violations.append((char, field_path, text[:60]))

if violations:
    print(f"KANJI SCOPE VIOLATION in {os.path.basename(file_path)}:", file=sys.stderr)
    print(f"  Lesson scope: {lesson_id} ({len(taught_kanji)} kanji taught)", file=sys.stderr)
    for char, path, ctx in violations[:10]:
        print(f"  ✗ '{char}' at {path}: {ctx}...", file=sys.stderr)
    if len(violations) > 10:
        print(f"  ... and {len(violations) - 10} more", file=sys.stderr)
    sys.exit(1)
PYEOF

if [[ $? -ne 0 ]]; then exit 2; fi
