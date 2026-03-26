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
sys.path.insert(0, os.path.dirname(os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else '.')))

file_path = sys.argv[1]
repo_root = sys.argv[2]

try:
    with open(file_path) as f:
        content = json.load(f)
except:
    sys.exit(0)

content_id = content.get('id', '') or content.get('lesson', '')
lesson_id = content_id
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

# Load particle scope gates
particles_path = os.path.join(repo_root, 'shared', 'particles.json')
particle_scope = {}
if os.path.exists(particles_path):
    with open(particles_path) as f:
        pdata = json.load(f)
    for p in pdata.get('particles', []):
        if p.get('introducedIn'):
            particle_scope[p['id']] = p['introducedIn']

# Use shared lesson ordering
sys.path.insert(0, os.path.join(repo_root, 'hooks'))
from lib_lesson_order import build_lesson_order
lesson_order = build_lesson_order(manifest_path)

# For grammar files, also get the file's own order so self-introduced forms
# (used in the same lesson that introduces them) are not flagged as out of scope.
file_order = lesson_order.get(content_id)
scope_ceiling = max(lesson_order.get(lesson_id) or 0, file_order or 0)

errors = []

def check_forms(obj, path="root"):
    if isinstance(obj, dict):
        if 'form' in obj and 'id' in obj:
            form = obj['form']
            if form and form in conj_rules:
                introduced = conj_rules[form].get('introducedIn', '')
                if introduced:
                    i_ord = lesson_order.get(introduced)
                    if i_ord is not None and i_ord > scope_ceiling:
                        errors.append(f"  '{form}' (introducedIn: {introduced}) at {path} — out of scope for {lesson_id}")
        for k, v in obj.items():
            check_forms(v, f"{path}.{k}")
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            if isinstance(item, str) and item in particle_scope:
                introduced = particle_scope[item]
                i_ord = lesson_order.get(introduced)
                if i_ord is not None and i_ord > scope_ceiling:
                    errors.append(f"  particle '{item}' (introducedIn: {introduced}) at {path}[{i}] — out of scope for {lesson_id}")
            else:
                check_forms(item, f"{path}[{i}]")

check_forms(content)

if errors:
    print(f"GRAMMAR SCOPE VIOLATION in {os.path.basename(file_path)}:", file=sys.stderr)
    for err in errors[:10]:
        print(err, file=sys.stderr)
    sys.exit(1)
PYEOF

if [[ $? -ne 0 ]]; then exit 2; fi
