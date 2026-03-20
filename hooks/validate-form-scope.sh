#!/bin/bash
# Hook: validate-form-scope.sh
# Runs on: post-edit of any content JSON
# Purpose: Validates that every conjugation form used in terms[] has
#          introducedIn <= the current lesson. Catches out-of-scope grammar.
#
# This replaces CLAUDE.md rules: Failure Mode #30 (out-of-scope conjugation),
# Grammar Usage Prerequisite Rules enforcement

set -euo pipefail

FILE="$1"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Only run on content JSON files
if [[ ! "$FILE" =~ \.(json)$ ]]; then
    exit 0
fi

# Skip non-content files
if [[ "$FILE" =~ (manifest|glossary|conjugation_rules|counter_rules|particles|characters|helper-vocab|package) ]]; then
    exit 0
fi

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

# Determine lesson scope
lesson_id = content.get('id', '') or content.get('lesson', '')
if content.get('type') == 'grammar':
    lesson_id = content.get('meta', {}).get('unlocksAfter', lesson_id)

if not lesson_id:
    sys.exit(0)

# Load conjugation rules
conj_path = os.path.join(repo_root, 'conjugation_rules.json')
if not os.path.exists(conj_path):
    sys.exit(0)

with open(conj_path) as f:
    conj_rules = json.load(f)

# Load manifest to build lesson ordering
manifest_path = os.path.join(repo_root, 'manifest.json')
if not os.path.exists(manifest_path):
    sys.exit(0)

with open(manifest_path) as f:
    manifest = json.load(f)

# Build a lesson ordering map: lesson_id -> ordinal position
lesson_order = {}
ordinal = 0
for level_key in ['N5', 'N4', 'N3', 'N2', 'N1']:
    level_data = manifest.get('data', {}).get(level_key, {})

    # Content lessons
    for lesson in level_data.get('lessons', []):
        lid = lesson.get('id', '')
        if lid:
            lesson_order[lid] = ordinal
            ordinal += 1

    # Grammar lessons (interleaved by unlocksAfter)
    for grammar in level_data.get('grammar', []):
        gid = grammar.get('id', '')
        unlocks = grammar.get('unlocksAfter', '')
        if gid:
            # Place grammar right after its unlocksAfter lesson
            if unlocks in lesson_order:
                lesson_order[gid] = lesson_order[unlocks] + 0.5
            else:
                lesson_order[gid] = ordinal
                ordinal += 1

def is_in_scope(introduced_in, target_id):
    """Check if a form's introducedIn is <= the target lesson."""
    if not introduced_in or not target_id:
        return True  # Can't determine, allow
    t_order = lesson_order.get(target_id)
    i_order = lesson_order.get(introduced_in)
    if t_order is None or i_order is None:
        return True  # Unknown lessons, allow
    return i_order <= t_order

# Find all form usages in terms arrays
errors = []

def check_forms(obj, path="root"):
    if isinstance(obj, dict):
        if 'form' in obj and 'id' in obj:
            form = obj['form']
            if form and form in conj_rules:
                introduced = conj_rules[form].get('introducedIn', '')
                if introduced and not is_in_scope(introduced, lesson_id):
                    errors.append(
                        f"  Form '{form}' (introducedIn: {introduced}) used at {path} — "
                        f"out of scope for {lesson_id}"
                    )
        for key, val in obj.items():
            check_forms(val, f"{path}.{key}")
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            check_forms(item, f"{path}[{i}]")

check_forms(content)

if errors:
    print(f"GRAMMAR SCOPE VIOLATION in {os.path.basename(file_path)}:")
    print(f"  Lesson scope: {lesson_id}")
    for err in errors[:10]:
        print(err)
    if len(errors) > 10:
        print(f"  ... and {len(errors) - 10} more errors")
    sys.exit(1)

PYEOF "$FILE"
