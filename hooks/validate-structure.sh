#!/bin/bash
# Hook: validate-structure.sh
# Runs on: PostToolUse (Edit|Write)
# Purpose: Structural checks. Covers: FM #6, #9b, #10b, #12, #14-17, #33

set -euo pipefail

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

[[ -z "$FILE" ]] && exit 0
[[ ! "$FILE" =~ \.(json)$ ]] && exit 0
[[ "$FILE" =~ (manifest|glossary|conjugation_rules|counter_rules|particles|characters|helper-vocab|package) ]] && exit 0

python3 - "$FILE" << 'PYEOF'
import json, re, sys, os

file_path = sys.argv[1]

try:
    with open(file_path) as f:
        content = json.load(f)
except:
    sys.exit(0)

errors = []
content_id = content.get('id', '')
content_type = content.get('type', '')
is_grammar = content_type == 'grammar'
is_review = 'Review' in content_id or 'review' in content_id.lower()

level_match = re.match(r'(N\d+)', content_id)
level = level_match.group(1) if level_match else ''
is_n4_plus = level in ('N4', 'N3', 'N2', 'N1')

sections = content.get('sections', [])

# FM #9b: Warmup must have exactly 4 items
for i, s in enumerate(sections):
    if s.get('type') == 'warmup':
        n = len(s.get('items', []))
        if n != 4:
            errors.append(f"  warmup (sections[{i}]): {n} items, must be exactly 4")

# FM #12: meta.kanji required on lessons
if not is_grammar and not is_review and 'compose' not in content_id.lower():
    if 'kanji' not in content.get('meta', {}):
        errors.append(f"  meta.kanji: MISSING")

# FM #10b: N4+ lessons need 3 drills
if is_n4_plus and not is_grammar and not is_review:
    drills = [s for s in sections if s.get('type') == 'drills']
    if len(drills) != 3:
        errors.append(f"  Drills: {len(drills)} found, N4+ requires exactly 3")

# FM #6: Drill 1 must NOT have terms
drill_n = 0
for i, s in enumerate(sections):
    if s.get('type') == 'drills':
        drill_n += 1
        if drill_n == 1 and not is_review:
            for j, item in enumerate(s.get('items', [])):
                if 'terms' in item and item['terms']:
                    errors.append(f"  sections[{i}].items[{j}]: Drill 1 must NOT have terms")

# FM #33: answer must match choices
def check_answers(obj, path="root"):
    if isinstance(obj, dict):
        if 'answer' in obj and 'choices' in obj:
            if isinstance(obj['choices'], list) and isinstance(obj['answer'], str):
                if obj['answer'] not in obj['choices']:
                    errors.append(f"  {path}: answer doesn't match any choice")
        for k, v in obj.items():
            check_answers(v, f"{path}.{k}")
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            check_answers(item, f"{path}[{i}]")

check_answers(content)

# Conversation lines must use 'spk', not 'speaker'
for i, s in enumerate(sections):
    if s.get('type') == 'conversation':
        for j, line in enumerate(s.get('lines', [])):
            if 'speaker' in line:
                errors.append(f"  sections[{i}].lines[{j}]: uses 'speaker' — must be 'spk' (renderer reads line.spk; 'speaker' shows undefined)")
            if 'spk' not in line:
                errors.append(f"  sections[{i}].lines[{j}]: missing required 'spk' field")

# Reading passage must be an array, not a string
for i, s in enumerate(sections):
    if s.get('type') == 'reading':
        p = s.get('passage')
        if p is None:
            errors.append(f"  sections[{i}] (reading): missing 'passage' field")
        elif isinstance(p, str):
            errors.append(f"  sections[{i}] (reading): 'passage' is a string — must be an array of {{jp, en, terms}} objects")
        elif isinstance(p, list):
            for j, item in enumerate(p):
                if not isinstance(item, dict) or 'jp' not in item:
                    errors.append(f"  sections[{i}].passage[{j}]: passage item must be an object with 'jp', 'en', 'terms'")

# Review-specific checks
if is_review:
    for i, s in enumerate(sections):
        if 'instructions' not in s:
            errors.append(f"  sections[{i}]: Missing 'instructions' (required on reviews)")
        if s.get('type') == 'drills':
            for j, item in enumerate(s.get('items', [])):
                if 'explanation' not in item:
                    errors.append(f"  sections[{i}].items[{j}]: Missing 'explanation'")
                if item.get('kind') == 'scramble':
                    d = item.get('distractors', [])
                    if not isinstance(d, list) or len(d) != 3:
                        errors.append(f"  sections[{i}].items[{j}]: Scramble needs 3 distractors")
        if s.get('type') == 'conversation' and 'items' not in s and 'lines' in s:
            errors.append(f"  sections[{i}]: Review conversation needs 'items[]' wrapper")

if errors:
    print(f"STRUCTURAL ERRORS in {os.path.basename(file_path)}:", file=sys.stderr)
    for err in errors[:20]:
        print(err, file=sys.stderr)
    sys.exit(1)
PYEOF

if [[ $? -ne 0 ]]; then exit 2; fi
