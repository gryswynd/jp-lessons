#!/bin/bash
# Hook: validate-term-ids.sh
# Runs on: PostToolUse (Edit|Write)
# Purpose: Validates every term ID exists in glossary/particles/characters.
# Covers: FM #4 (fabricated IDs), #5 (wrong form), #7 (k_* in conversations)

set -euo pipefail

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

[[ -z "$FILE" ]] && exit 0
[[ ! "$FILE" =~ \.(json)$ ]] && exit 0
[[ "$FILE" =~ (manifest|glossary|conjugation_rules|counter_rules|particles|characters|helper-vocab|package) ]] && exit 0

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

python3 - "$FILE" "$REPO_ROOT" << 'PYEOF'
import json, sys, os, glob

file_path = sys.argv[1]
repo_root = sys.argv[2]

try:
    with open(file_path) as f:
        content = json.load(f)
except:
    sys.exit(0)

# Build ID registries
valid_ids = set()
valid_forms = set()

for gpath in glob.glob(os.path.join(repo_root, 'data/*/glossary.*.json')):
    try:
        with open(gpath) as f:
            data_g = json.load(f); entries = data_g.get("entries", data_g) if isinstance(data_g, dict) else data_g
            for entry in (entries if isinstance(entries, list) else []):
                if 'id' in entry:
                    valid_ids.add(entry['id'])
    except:
        pass

particles_path = os.path.join(repo_root, 'shared/particles.json')
if os.path.exists(particles_path):
    try:
        with open(particles_path) as f:
            data = json.load(f)
            for entry in (data if isinstance(data, list) else data.get('particles', [])):
                if 'id' in entry:
                    valid_ids.add(entry['id'])
    except:
        pass

chars_path = os.path.join(repo_root, 'shared/characters.json')
if os.path.exists(chars_path):
    try:
        with open(chars_path) as f:
            data = json.load(f)
            for entry in (data if isinstance(data, list) else data.get('characters', [])):
                if 'id' in entry:
                    valid_ids.add(entry['id'])
    except:
        pass

valid_ids.update(['g_desu', 'g_da'])

conj_path = os.path.join(repo_root, 'conjugation_rules.json')
if os.path.exists(conj_path):
    try:
        with open(conj_path) as f:
            valid_forms = set(json.load(f).keys())
    except:
        pass

errors = []

def check_terms(terms, path, in_kanji_grid=False):
    if not isinstance(terms, list):
        return
    for i, term in enumerate(terms):
        tp = f"{path}[{i}]"
        if isinstance(term, str):
            if term.startswith(('v_', 'k_', 'p_', 'g_', 'char_')):
                if term not in valid_ids:
                    errors.append(f"  Unknown ID '{term}' at {tp}")
                if term.startswith('k_') and not in_kanji_grid:
                    errors.append(f"  k_* ID '{term}' used outside kanjiGrid at {tp} — use v_*")
        elif isinstance(term, dict):
            tid = term.get('id', '')
            form = term.get('form')
            if tid and tid.startswith(('v_', 'k_', 'p_', 'g_', 'char_')) and tid not in valid_ids:
                errors.append(f"  Unknown ID '{tid}' at {tp}")
            if form == 'desire_tai':
                errors.append(f"  DEPRECATED 'desire_tai' at {tp} — use 'plain_desire_tai' + 'g_desu'")
            if form and valid_forms and form not in valid_forms:
                errors.append(f"  Unknown form '{form}' at {tp}")

def walk(obj, path="root", in_kanji_grid=False):
    if isinstance(obj, dict):
        section_type = obj.get('type', '')
        is_kanji_grid = in_kanji_grid or section_type == 'kanjiGrid'
        if 'terms' in obj and isinstance(obj['terms'], list):
            check_terms(obj['terms'], path + '.terms', is_kanji_grid)
        for k, v in obj.items():
            walk(v, f"{path}.{k}", is_kanji_grid)
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            walk(item, f"{path}[{i}]", in_kanji_grid)

walk(content)

if errors:
    print(f"TERM ID ERRORS in {os.path.basename(file_path)}:", file=sys.stderr)
    for err in errors[:20]:
        print(err, file=sys.stderr)
    if len(errors) > 20:
        print(f"  ... and {len(errors) - 20} more", file=sys.stderr)
    sys.exit(1)
PYEOF

if [[ $? -ne 0 ]]; then exit 2; fi
