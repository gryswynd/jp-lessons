#!/bin/bash
# Hook: validate-structure.sh
# Purpose: Catches structural errors that silently degrade content quality.
#
# Validates: FM #9b (warmup count must be 4), FM #10b (N4+ needs 3 drills),
#            FM #6 (Drill 1 must not have terms), FM #12 (meta.kanji required),
#            FM #14 (review drill items need explanation), FM #15 (review sections need instructions),
#            FM #17 (scramble needs 3 distractors), FM #33 (answer must match choices)

set -euo pipefail

FILE="$1"

[[ "$FILE" =~ \.(json)$ ]] || exit 0
[[ "$FILE" =~ (manifest|glossary|conjugation_rules|counter_rules|particles|characters|helper-vocab|package) ]] && exit 0

python3 << 'PYEOF'
import json
import re
import sys
import os

file_path = sys.argv[1] if len(sys.argv) > 1 else ''
if not file_path or not os.path.exists(file_path):
    sys.exit(0)

try:
    with open(file_path) as f:
        content = json.load(f)
except:
    sys.exit(0)

errors = []
content_type = content.get('type', '')
content_id = content.get('id', '')
is_grammar = content_type == 'grammar'
is_review = 'Review' in content_id or 'review' in content_id.lower()

# Determine level
level_match = re.match(r'(N\d+)', content_id)
level = level_match.group(1) if level_match else ''
is_n4_plus = level in ('N4', 'N3', 'N2', 'N1')

sections = content.get('sections', [])

# --- FM #9b: Warmup must have exactly 4 items ---
for i, s in enumerate(sections):
    if s.get('type') == 'warmup':
        item_count = len(s.get('items', []))
        if item_count != 4:
            errors.append(f"  sections[{i}] warmup: has {item_count} items, must have exactly 4.")

# --- FM #12: meta.kanji required on lessons ---
if not is_grammar and not is_review and 'compose' not in content_id.lower():
    meta = content.get('meta', {})
    if 'kanji' not in meta:
        errors.append(f"  meta.kanji: MISSING — lesson meta must include kanji array.")

# --- FM #10b: N4+ lessons need exactly 3 drill sections ---
if is_n4_plus and not is_grammar and not is_review:
    drill_sections = [s for s in sections if s.get('type') == 'drills']
    if len(drill_sections) != 3:
        errors.append(f"  Drill structure: found {len(drill_sections)} drill sections, "
                     f"N4+ lessons require exactly 3 (Kanji Readings, Vocabulary, Grammar & Forms).")

# --- FM #6: Drill 1 items must NOT have terms ---
drill_count = 0
for i, s in enumerate(sections):
    if s.get('type') == 'drills':
        drill_count += 1
        if drill_count == 1 and not is_review:
            # First drill = kanji readings = no terms
            for j, item in enumerate(s.get('items', [])):
                if 'terms' in item and item['terms']:
                    errors.append(f"  sections[{i}].items[{j}]: Drill 1 (Kanji Readings) "
                                 f"must NOT have terms array.")

# --- FM #33: answer must match one of the choices ---
def check_answer_choices(obj, path="root"):
    if isinstance(obj, dict):
        if 'answer' in obj and 'choices' in obj:
            answer = obj['answer']
            choices = obj['choices']
            if isinstance(choices, list) and isinstance(answer, str):
                if answer not in choices:
                    errors.append(f"  {path}: answer '{answer[:40]}' does not match any choice.")
        for key, val in obj.items():
            check_answer_choices(val, f"{path}.{key}")
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            check_answer_choices(item, f"{path}[{i}]")

check_answer_choices(content)

# --- Review-specific checks ---
if is_review:
    for i, s in enumerate(sections):
        # FM #15: review sections need instructions
        if 'instructions' not in s:
            errors.append(f"  sections[{i}] ({s.get('type', '?')}): Missing 'instructions' field "
                         f"(required on all review sections).")

        # FM #14: review drill items need explanation
        if s.get('type') == 'drills':
            for j, item in enumerate(s.get('items', [])):
                if 'explanation' not in item:
                    errors.append(f"  sections[{i}].items[{j}]: Missing 'explanation' field "
                                 f"(required on all review drill items).")

        # FM #17: scramble items need exactly 3 distractors
        if s.get('type') == 'drills':
            for j, item in enumerate(s.get('items', [])):
                if item.get('kind') == 'scramble':
                    distractors = item.get('distractors', [])
                    if not isinstance(distractors, list) or len(distractors) != 3:
                        errors.append(f"  sections[{i}].items[{j}]: Scramble needs exactly 3 distractors, "
                                     f"got {len(distractors) if isinstance(distractors, list) else 0}.")
                    if 'segments' not in item:
                        errors.append(f"  sections[{i}].items[{j}]: Scramble missing 'segments' array.")

        # FM #16: review conversations must use items[] wrapper
        if s.get('type') == 'conversation':
            if 'items' not in s and 'lines' in s:
                errors.append(f"  sections[{i}]: Review conversation uses flat 'lines[]' structure — "
                             f"must use 'items[]' wrapper with per-item question/choices/answer.")

if errors:
    print(f"STRUCTURAL ERRORS in {os.path.basename(file_path)}:")
    for err in errors[:20]:
        print(err)
    if len(errors) > 20:
        print(f"  ... and {len(errors) - 20} more errors")
    sys.exit(1)

PYEOF "$FILE"
