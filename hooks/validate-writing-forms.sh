#!/bin/bash
# Hook: validate-writing-forms.sh
# Runs on: PostToolUse (Edit|Write)
# Purpose: Early-use and partial-kanji writing form rules. Covers: FM #41-43

set -euo pipefail

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

[[ -z "$FILE" ]] && exit 0
[[ ! "$FILE" =~ \.(json)$ ]] && exit 0
[[ "$FILE" =~ (manifest|glossary|conjugation_rules|counter_rules|particles|characters|helper-vocab|package) ]] && exit 0

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

python3 - "$FILE" "$REPO_ROOT" << 'PYEOF'
import json, re, sys, os

file_path = sys.argv[1]
repo_root = sys.argv[2]

try:
    with open(file_path) as f:
        content = json.load(f)
except:
    sys.exit(0)

lesson_id = content.get('id', '') or content.get('lesson', '')
if content.get('type') == 'grammar':
    lesson_id = content.get('meta', {}).get('unlocksAfter', lesson_id)
if not lesson_id:
    sys.exit(0)

manifest_path = os.path.join(repo_root, 'manifest.json')
if not os.path.exists(manifest_path):
    sys.exit(0)

with open(manifest_path) as f:
    manifest = json.load(f)

lesson_order = {}
ordinal = 0
for lk in ['N5', 'N4', 'N3', 'N2', 'N1']:
    for l in manifest.get('data', {}).get(lk, {}).get('lessons', []):
        if l.get('id'):
            lesson_order[l['id']] = ordinal
            ordinal += 1
    for g in manifest.get('data', {}).get(lk, {}).get('grammar', []):
        if g.get('id'):
            lesson_order[g['id']] = lesson_order.get(g.get('unlocksAfter', ''), ordinal) + 0.5

def at_or_after(check, target):
    c, t = lesson_order.get(check), lesson_order.get(target)
    return t >= c if c is not None and t is not None else True

# Early-use: (kanji, hiragana, use_from, kanji_available_or_None)
EARLY_USE = [
    ('私', 'わたし', 'N5.1', 'N4.3'),
    ('家族', 'かぞく', 'N5.1', 'N4.7'),
    ('好き', 'すき', 'N5.7', 'N4.4'),
    ('次', 'つぎ', 'N5.4', None),
    ('事', 'こと', 'N5.9', 'N4.14'),
    ('昨日', 'きのう', 'N5.4', None),
]

PARTIAL = [
    ('大好き', '大すき', 'N5.7', 'N4.4'),
    ('朝ご飯', '朝ごはん', 'N4.3', 'N4.6'),
    ('晩ご飯', '晩ごはん', 'N4.3', 'N4.6'),
]

errors = []

def extract_jp(obj, path="root"):
    texts = []
    if isinstance(obj, dict):
        for k in ('jp', 'passage', 'model', 'titleJp'):
            if k in obj and isinstance(obj[k], str):
                texts.append((f"{path}.{k}", obj[k]))
        for k, v in obj.items():
            texts.extend(extract_jp(v, f"{path}.{k}"))
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            texts.extend(extract_jp(item, f"{path}[{i}]"))
    return texts

for path, jp in extract_jp(content):
    jp_clean = jp.replace(' ', '').replace('\u3000', '')

    for kanji, hira, use_from, kanji_avail in EARLY_USE:
        if (hira in jp_clean or kanji in jp_clean) and not at_or_after(use_from, lesson_id):
            errors.append(f"  {path}: '{hira}'/'{kanji}' not available until {use_from}")
            continue
        if kanji in jp_clean and kanji_avail and not at_or_after(kanji_avail, lesson_id):
            errors.append(f"  {path}: '{kanji}' in kanji but not taught until {kanji_avail} — write as '{hira}'")

    for full, partial, avail, full_avail in PARTIAL:
        if full in jp_clean and full_avail and not at_or_after(full_avail, lesson_id):
            errors.append(f"  {path}: '{full}' — kanji not taught until {full_avail}, write as '{partial}'")

if errors:
    print(f"WRITING FORM ERRORS in {os.path.basename(file_path)}:", file=sys.stderr)
    for err in errors[:10]:
        print(err, file=sys.stderr)
    sys.exit(1)

PYEOF

if [[ $? -ne 0 ]]; then exit 2; fi
