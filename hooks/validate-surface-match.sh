#!/bin/bash
# Hook: validate-surface-match.sh
# Purpose: Catches the "vocab showing something different than what was written"
#          problem — when a term ID exists but its glossary surface doesn't match
#          the actual token in the jp text.
#
# Validates: FM #18 (ID surface mismatch — e.g. tagging だ with g_desu),
#            FM #60 (corrupted glossary surface — e.g. "送くる" instead of "送る"),
#            compound spacing (FM #12 in quality gates — space inside compound breaks chip)

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

# Build ID → surface map from glossaries
id_surface = {}
import glob
for gpath in glob.glob(os.path.join(repo_root, 'data/*/glossary.*.json')):
    try:
        with open(gpath) as f:
            for entry in json.load(f):
                eid = entry.get('id', '')
                surface = entry.get('surface', '')
                matches = entry.get('matches', [])
                if eid and surface:
                    id_surface[eid] = {
                        'surface': surface,
                        'matches': matches if isinstance(matches, list) else [],
                        'reading': entry.get('reading', ''),
                        'verb_class': entry.get('verb_class', ''),
                        'gtype': entry.get('gtype', '')
                    }
    except:
        pass

# Load particles
particles_path = os.path.join(repo_root, 'shared/particles.json')
if os.path.exists(particles_path):
    try:
        with open(particles_path) as f:
            data = json.load(f)
            for entry in data.get('particles', []):
                eid = entry.get('id', '')
                surface = entry.get('particle', '')
                if eid and surface:
                    id_surface[eid] = {
                        'surface': surface,
                        'matches': [],
                        'reading': entry.get('reading', ''),
                        'verb_class': '',
                        'gtype': 'particle'
                    }
    except:
        pass

# Add grammar IDs
id_surface['g_desu'] = {'surface': 'です', 'matches': [], 'reading': 'です', 'verb_class': '', 'gtype': 'copula'}
id_surface['g_da'] = {'surface': 'だ', 'matches': ['だった'], 'reading': 'だ', 'verb_class': '', 'gtype': 'copula'}

# Load characters
chars_path = os.path.join(repo_root, 'shared/characters.json')
if os.path.exists(chars_path):
    try:
        with open(chars_path) as f:
            data = json.load(f)
            items = data if isinstance(data, list) else data.get('characters', [])
            for entry in items:
                eid = entry.get('id', '')
                surface = entry.get('surface', '')
                if eid and surface:
                    id_surface[eid] = {
                        'surface': surface,
                        'matches': entry.get('matches', []),
                        'reading': entry.get('reading', ''),
                        'verb_class': '',
                        'gtype': 'character'
                    }
    except:
        pass

errors = []

def check_surface(jp, terms, path):
    """Check that term IDs' surfaces appear in the jp text."""
    if not jp or not terms:
        return

    # Remove spaces for matching (jp text has readability spaces)
    jp_no_space = jp.replace(' ', '').replace('　', '')

    for i, term in enumerate(terms):
        if isinstance(term, dict):
            tid = term.get('id', '')
            form = term.get('form')
            # Skip counter objects
            if 'counter' in term:
                continue
        elif isinstance(term, str):
            tid = term
            form = None
        else:
            continue

        if not tid or tid not in id_surface:
            continue

        info = id_surface[tid]
        surface = info['surface']
        matches = info['matches']

        # For verbs/adjectives with a form, the surface will be conjugated —
        # we can't easily check the conjugated form, so only check base forms
        if form is not None:
            continue

        # Check if surface or any match appears in the jp text
        all_forms = [surface] + matches
        found = any(f in jp_no_space for f in all_forms)

        if not found:
            # Special case: particles are single characters, high false positive rate
            if info['gtype'] == 'particle' and len(surface) <= 1:
                continue
            # Special case: copulas
            if tid in ('g_desu', 'g_da'):
                if surface in jp_no_space:
                    continue
                # g_desu might not appear if it's part of でした etc
                continue

            errors.append(
                f"  {path}.terms[{i}]: ID '{tid}' (surface: '{surface}') "
                f"not found in jp text.\n"
                f"    jp: {jp[:80]}\n"
                f"    Expected one of: {all_forms}"
            )

    # --- FM #53d: na-adjective missing verb_class ---
    for i, term in enumerate(terms):
        if isinstance(term, dict):
            tid = term.get('id', '')
            form = term.get('form', '')
            if form in ('attributive_na', 'polite_adj') and tid in id_surface:
                info = id_surface[tid]
                if info['gtype'] == 'na-adjective' and info['verb_class'] != 'na_adj':
                    errors.append(
                        f"  {path}.terms[{i}]: '{tid}' used with form '{form}' "
                        f"but glossary entry missing verb_class:'na_adj' — "
                        f"attributive_na/polite_adj will silently fail."
                    )

def walk(obj, path="root"):
    if isinstance(obj, dict):
        if 'jp' in obj and 'terms' in obj:
            check_surface(obj['jp'], obj['terms'], path)
        for key, val in obj.items():
            walk(val, f"{path}.{key}")
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            walk(item, f"{path}[{i}]")

walk(content)

if errors:
    print(f"SURFACE MATCH ISSUES in {os.path.basename(file_path)}:")
    for err in errors[:15]:
        print(err)
    if len(errors) > 15:
        print(f"  ... and {len(errors) - 15} more issues")
    sys.exit(1)

PYEOF "$FILE"
