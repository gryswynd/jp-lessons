#!/bin/bash
# Hook: validate-form-scope.sh
# Runs on: PostToolUse (Edit|Write)
# Purpose: Validates conjugation forms are in scope. Covers: FM #30

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

conj_path = os.path.join(repo_root, 'conjugation_rules.json')
manifest_path = os.path.join(repo_root, 'manifest.json')
if not os.path.exists(conj_path) or not os.path.exists(manifest_path):
    sys.exit(0)

with open(conj_path) as f:
    conj_rules = json.load(f)
with open(manifest_path) as f:
    manifest = json.load(f)

# Build lesson ordering
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

errors = []

def check_forms(obj, path="root"):
    if isinstance(obj, dict):
        if 'form' in obj and 'id' in obj:
            form = obj['form']
            if form and form in conj_rules:
                introduced = conj_rules[form].get('introducedIn', '')
                if introduced:
                    t_ord = lesson_order.get(lesson_id)
                    i_ord = lesson_order.get(introduced)
                    if t_ord is not None and i_ord is not None and i_ord > t_ord:
                        errors.append(f"  '{form}' (introducedIn: {introduced}) at {path} — out of scope for {lesson_id}")
        for k, v in obj.items():
            check_forms(v, f"{path}.{k}")
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            check_forms(item, f"{path}[{i}]")

check_forms(content)

if errors:
    print(f"GRAMMAR SCOPE VIOLATION in {os.path.basename(file_path)}:", file=sys.stderr)
    for err in errors[:10]:
        print(err, file=sys.stderr)
    sys.exit(1)
PYEOF

if [[ $? -ne 0 ]]; then exit 2; fi
