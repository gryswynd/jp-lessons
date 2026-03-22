#!/bin/bash
# Hook: validate-surface-match.sh
# Runs on: PostToolUse (Edit|Write)
# Purpose: Catches vocab showing wrong thing. Covers: FM #18, #53d, #60

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

# Build ID → surface map
id_info = {}
for gpath in glob.glob(os.path.join(repo_root, 'data/*/glossary.*.json')):
    try:
        with open(gpath) as f:
            data_g = json.load(f); entries = data_g.get("entries", data_g) if isinstance(data_g, dict) else data_g
            for entry in (entries if isinstance(entries, list) else []):
                eid = entry.get('id', '')
                if eid:
                    id_info[eid] = {
                        'surface': entry.get('surface', ''),
                        'matches': entry.get('matches', []) if isinstance(entry.get('matches'), list) else [],
                        'gtype': entry.get('gtype', ''),
                        'verb_class': entry.get('verb_class', ''),
                    }
    except:
        pass

particles_path = os.path.join(repo_root, 'shared/particles.json')
if os.path.exists(particles_path):
    try:
        with open(particles_path) as f:
            for entry in json.load(f).get('particles', []):
                eid = entry.get('id', '')
                if eid:
                    id_info[eid] = {'surface': entry.get('particle', ''), 'matches': entry.get('matches', []), 'gtype': 'particle', 'verb_class': ''}
    except:
        pass

chars_path = os.path.join(repo_root, 'shared/characters.json')
if os.path.exists(chars_path):
    try:
        with open(chars_path) as f:
            data = json.load(f)
            for entry in (data if isinstance(data, list) else data.get('characters', [])):
                eid = entry.get('id', '')
                if eid:
                    id_info[eid] = {'surface': entry.get('surface', ''), 'matches': entry.get('matches', []), 'gtype': 'character', 'verb_class': ''}
    except:
        pass

id_info['g_desu'] = {'surface': 'です', 'matches': [], 'gtype': 'copula', 'verb_class': ''}
id_info['g_da'] = {'surface': 'だ', 'matches': ['だった'], 'gtype': 'copula', 'verb_class': ''}

errors = []

def check_surface(jp, terms, path):
    if not jp or not terms:
        return
    jp_clean = jp.replace(' ', '').replace('\u3000', '')

    for i, term in enumerate(terms):
        if isinstance(term, dict):
            tid = term.get('id', '')
            form = term.get('form')
            if 'counter' in term:
                continue
        elif isinstance(term, str):
            tid = term
            form = None
        else:
            continue

        if not tid or tid not in id_info:
            continue

        info = id_info[tid]

        # Skip conjugated forms (surface changes)
        if form is not None:
            # But check na-adj verb_class (FM #53d)
            if form in ('attributive_na', 'polite_adj') and info['gtype'] in ('na-adjective', 'na_adj'):
                if info['verb_class'] != 'na_adj':
                    errors.append(f"  {path}.terms[{i}]: '{tid}' used with '{form}' but missing verb_class:'na_adj' in glossary")
            continue

        # Skip single-char particles (too many false positives)
        if info['gtype'] == 'particle' and len(info['surface']) <= 1:
            continue
        if tid in ('g_desu', 'g_da'):
            continue

        all_forms = [info['surface']] + info['matches']
        if not any(f in jp_clean for f in all_forms):
            errors.append(f"  {path}.terms[{i}]: '{tid}' (surface: '{info['surface']}') not found in jp text")

def walk(obj, path="root"):
    if isinstance(obj, dict):
        if 'jp' in obj and 'terms' in obj:
            check_surface(obj['jp'], obj['terms'], path)
        for k, v in obj.items():
            walk(v, f"{path}.{k}")
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            walk(item, f"{path}[{i}]")

walk(content)

if errors:
    print(f"SURFACE MATCH ISSUES in {os.path.basename(file_path)}:", file=sys.stderr)
    for err in errors[:15]:
        print(err, file=sys.stderr)
    sys.exit(1)
PYEOF

if [[ $? -ne 0 ]]; then exit 2; fi
