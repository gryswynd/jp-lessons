#!/bin/bash
# Hook: validate-term-ids.sh
# Runs on: post-edit of any lesson/grammar/review JSON
# Purpose: Validates that every term ID in terms[] arrays exists in the
#          glossary or particles.json. Also checks form strings against
#          conjugation_rules.json.
#
# This replaces CLAUDE.md rules: Failure Modes #4 (fabricated IDs),
# #5 (wrong form label), #7 (k_* in conversations), #53c (deprecated desire_tai)

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
import glob

repo_root = os.environ.get('REPO_ROOT', '.')
file_path = sys.argv[1] if len(sys.argv) > 1 else ''

if not file_path or not os.path.exists(file_path):
    sys.exit(0)

# Load content file
try:
    with open(file_path) as f:
        content = json.load(f)
except (json.JSONDecodeError, UnicodeDecodeError):
    sys.exit(0)

# Build ID registries
valid_ids = set()
valid_forms = set()

# Load glossaries
for gpath in glob.glob(os.path.join(repo_root, 'data/*/glossary.*.json')):
    try:
        with open(gpath) as f:
            for entry in json.load(f):
                if 'id' in entry:
                    valid_ids.add(entry['id'])
    except:
        pass

# Load particles
particles_path = os.path.join(repo_root, 'shared/particles.json')
if os.path.exists(particles_path):
    try:
        with open(particles_path) as f:
            data = json.load(f)
            items = data if isinstance(data, list) else data.get('particles', [])
            for entry in items:
                if 'id' in entry:
                    valid_ids.add(entry['id'])
    except:
        pass

# Load characters
chars_path = os.path.join(repo_root, 'shared/characters.json')
if os.path.exists(chars_path):
    try:
        with open(chars_path) as f:
            data = json.load(f)
            items = data if isinstance(data, list) else data.get('characters', [])
            for entry in items:
                if 'id' in entry:
                    valid_ids.add(entry['id'])
    except:
        pass

# Add grammar IDs
valid_ids.add('g_desu')
valid_ids.add('g_da')

# Load conjugation forms
conj_path = os.path.join(repo_root, 'conjugation_rules.json')
if os.path.exists(conj_path):
    try:
        with open(conj_path) as f:
            conj = json.load(f)
            valid_forms = set(conj.keys())
    except:
        pass

# Extract all terms from the content
errors = []

def check_terms(terms_array, path):
    if not isinstance(terms_array, list):
        return
    for i, term in enumerate(terms_array):
        term_path = f"{path}[{i}]"

        if isinstance(term, str):
            # Bare string ID
            if term.startswith(('v_', 'k_', 'p_', 'g_', 'char_')):
                if term not in valid_ids:
                    errors.append(f"  Unknown ID '{term}' at {term_path}")
                # Check for k_* in non-kanjiGrid context
                if term.startswith('k_') and 'kanjiGrid' not in path:
                    errors.append(f"  k_* ID '{term}' used outside kanjiGrid at {term_path} — use v_* instead")

        elif isinstance(term, dict):
            tid = term.get('id', '')
            form = term.get('form')

            if tid and tid.startswith(('v_', 'k_', 'p_', 'g_', 'char_')):
                if tid not in valid_ids:
                    errors.append(f"  Unknown ID '{tid}' at {term_path}")

            # Check deprecated desire_tai
            if form == 'desire_tai':
                errors.append(f"  DEPRECATED form 'desire_tai' at {term_path} — use 'plain_desire_tai' + 'g_desu'")

            # Check form validity
            if form is not None and form and valid_forms and form not in valid_forms:
                errors.append(f"  Unknown form '{form}' at {term_path}")

            # Counter format is OK
            if 'counter' in term:
                pass  # counter objects are valid

def walk(obj, path="root"):
    if isinstance(obj, dict):
        if 'terms' in obj and isinstance(obj['terms'], list):
            check_terms(obj['terms'], path + '.terms')
        for key, val in obj.items():
            walk(val, f"{path}.{key}")
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            walk(item, f"{path}[{i}]")

walk(content)

if errors:
    print(f"TERM ID VALIDATION ERRORS in {os.path.basename(file_path)}:")
    for err in errors[:20]:
        print(err)
    if len(errors) > 20:
        print(f"  ... and {len(errors) - 20} more errors")
    sys.exit(1)

PYEOF "$FILE"
