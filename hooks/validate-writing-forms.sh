#!/bin/bash
# Hook: validate-writing-forms.sh
# Purpose: Enforces the early-use and partial-kanji writing rules.
#          Catches words written in kanji too early or in hiragana too late.
#
# Validates: FM #41 (early-use word kanji before taught),
#            FM #42 (early-use word hiragana after taught),
#            FM #43 (early-use word before "Use from" lesson)

set -euo pipefail

FILE="$1"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

[[ "$FILE" =~ \.(json)$ ]] || exit 0
[[ "$FILE" =~ (manifest|glossary|conjugation_rules|counter_rules|particles|characters|helper-vocab|package) ]] && exit 0

python3 << 'PYEOF'
import json
import re
import sys
import os

repo_root = os.environ.get('REPO_ROOT', '.')
file_path = sys.argv[1] if len(sys.argv) > 1 else ''
if not file_path or not os.path.exists(file_path):
    sys.exit(0)

try:
    with open(file_path) as f:
        content = json.load(f)
except:
    sys.exit(0)

# Determine lesson ID and build ordering
lesson_id = content.get('id', '') or content.get('lesson', '')
if content.get('type') == 'grammar':
    lesson_id = content.get('meta', {}).get('unlocksAfter', lesson_id)

if not lesson_id:
    sys.exit(0)

# Load manifest for lesson ordering
manifest_path = os.path.join(repo_root, 'manifest.json')
if not os.path.exists(manifest_path):
    sys.exit(0)

with open(manifest_path) as f:
    manifest = json.load(f)

lesson_order = {}
ordinal = 0
for level_key in ['N5', 'N4', 'N3', 'N2', 'N1']:
    level_data = manifest.get('data', {}).get(level_key, {})
    for lesson in level_data.get('lessons', []):
        lid = lesson.get('id', '')
        if lid:
            lesson_order[lid] = ordinal
            ordinal += 1
    for grammar in level_data.get('grammar', []):
        gid = grammar.get('id', '')
        unlocks = grammar.get('unlocksAfter', '')
        if gid:
            lesson_order[gid] = lesson_order.get(unlocks, ordinal) + 0.5

def is_at_or_after(check_lesson, target_lesson):
    c = lesson_order.get(check_lesson)
    t = lesson_order.get(target_lesson)
    if c is None or t is None:
        return True  # Unknown, allow
    return t >= c

# Early-use vocabulary rules
# Format: (kanji_form, hiragana_form, use_from, kanji_available)
EARLY_USE = [
    ('私', 'わたし', 'N5.1', 'N4.3'),
    ('何', 'なに', 'N5.1', 'N5.2'),   # v_nani
    ('何', 'なん', 'N5.1', 'N5.2'),   # v_nan
    ('家族', 'かぞく', 'N5.1', 'N4.7'),
    ('好き', 'すき', 'N5.7', 'N4.4'),
    ('次', 'つぎ', 'N5.4', None),     # Never taught
    ('事', 'こと', 'N5.9', 'N4.14'),
    ('昨日', 'きのう', 'N5.4', None), # Never taught
    ('名前', '名まえ', 'N5.1', 'N5.9'),  # Partial: 名 is N5.1, 前 is N5.9
]

# Partial-kanji vocabulary
PARTIAL_KANJI = [
    ('大好き', '大すき', 'N5.7', 'N4.4'),
    ('朝ご飯', '朝ごはん', 'N4.3', 'N4.6'),
    ('晩ご飯', '晩ごはん', 'N4.3', 'N4.6'),
    ('週末', '週まつ', 'N5.4', None),  # 末 never taught
]

# Add day-of-week partial kanji
for day_kanji, day_hira in [
    ('日曜日', '日ようび'), ('月曜日', '月ようび'), ('火曜日', '火ようび'),
    ('水曜日', '水ようび'), ('木曜日', '木ようび'), ('金曜日', '金ようび'),
    ('土曜日', '土ようび'), ('何曜日', '何よう日')
]:
    PARTIAL_KANJI.append((day_kanji, day_hira, 'N5.2', 'N4.14'))

errors = []

def extract_jp_texts(obj, path="root"):
    texts = []
    if isinstance(obj, dict):
        for key in ('jp', 'passage', 'model', 'titleJp'):
            if key in obj and isinstance(obj[key], str):
                texts.append((f"{path}.{key}", obj[key]))
        for key, val in obj.items():
            texts.extend(extract_jp_texts(val, f"{path}.{key}"))
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            texts.extend(extract_jp_texts(item, f"{path}[{i}]"))
    return texts

jp_texts = extract_jp_texts(content)

for path, jp in jp_texts:
    jp_clean = jp.replace(' ', '').replace('　', '')

    # Check early-use words
    for kanji_form, hira_form, use_from, kanji_available in EARLY_USE:
        # FM #43: word used before its "Use from" lesson
        if (hira_form in jp_clean or kanji_form in jp_clean):
            if not is_at_or_after(use_from, lesson_id):
                errors.append(
                    f"  {path}: '{hira_form}'/'{kanji_form}' used but not available until {use_from}. "
                    f"Current lesson: {lesson_id}"
                )
                continue

        # FM #41: kanji form used before kanji is taught
        if kanji_form in jp_clean and kanji_available:
            if not is_at_or_after(kanji_available, lesson_id):
                errors.append(
                    f"  {path}: '{kanji_form}' written in kanji but kanji not taught until {kanji_available}. "
                    f"Write as '{hira_form}' instead. Current lesson: {lesson_id}"
                )

        # FM #42: hiragana form used after kanji is taught
        if hira_form in jp_clean and kanji_available:
            if is_at_or_after(kanji_available, lesson_id):
                # Only flag if the kanji form is NOT also present (avoid false positives)
                if kanji_form not in jp_clean:
                    errors.append(
                        f"  WARNING: {path}: '{hira_form}' written in hiragana but kanji '{kanji_form}' "
                        f"was taught at {kanji_available}. Consider using kanji form."
                    )

    # Check partial-kanji words
    for full_kanji, partial_form, available_from, full_available in PARTIAL_KANJI:
        if full_kanji in jp_clean and full_available:
            if not is_at_or_after(full_available, lesson_id):
                errors.append(
                    f"  {path}: '{full_kanji}' uses kanji not taught until {full_available}. "
                    f"Write as '{partial_form}' instead. Current lesson: {lesson_id}"
                )

if errors:
    real_errors = [e for e in errors if 'WARNING:' not in e]
    warnings = [e for e in errors if 'WARNING:' in e]

    if real_errors:
        print(f"WRITING FORM ERRORS in {os.path.basename(file_path)}:")
        for err in real_errors[:10]:
            print(err)
    if warnings:
        print(f"WRITING FORM WARNINGS in {os.path.basename(file_path)}:")
        for w in warnings[:5]:
            print(w)

    sys.exit(1 if real_errors else 0)

PYEOF "$FILE"
