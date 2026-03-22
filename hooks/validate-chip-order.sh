#!/bin/bash
# Hook: validate-chip-order.sh
# Runs on: PostToolUse (Edit|Write)
# Purpose: Catches single-char chip ordering bugs (FM #59).
#
# The text processor uses a negative lookahead (?![hiragana]) for single-char
# surfaces. If two consecutive single-char terms share a jp text token with no
# space between them (e.g. 私にも, ことだね, 町には), the leftmost term is
# blocked from matching while the rightmost is still unwrapped hiragana.
# Fix: the rightmost single-char term must appear FIRST in the terms array so
# it wraps first, turning the following character from hiragana into '<', which
# lets the lookahead pass for the term to its left.
#
# This hook builds a surface map from the glossaries, then for each jp+terms
# pair checks whether any two adjacent single-char terms share a token in the
# jp text and whether the rightmost one appears first in the terms array.

set -euo pipefail

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

[[ -z "$FILE" ]] && exit 0
[[ ! "$FILE" =~ \.(json)$ ]] && exit 0
[[ "$FILE" =~ (manifest|glossary|conjugation_rules|counter_rules|particles|characters|helper-vocab|package) ]] && exit 0

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

python3 - "$FILE" "$REPO_ROOT" << 'PYEOF'
import json, sys, os, glob, re

file_path = sys.argv[1]
repo_root = sys.argv[2]

try:
    with open(file_path) as f:
        content = json.load(f)
except:
    sys.exit(0)

# Build ID → surface map from all glossaries and particles.json
id_surface = {}

for gpath in glob.glob(os.path.join(repo_root, 'data/*/glossary.*.json')):
    try:
        with open(gpath) as f:
            raw = json.load(f)
            entries = raw.get('entries', raw) if isinstance(raw, dict) else raw
            for entry in (entries if isinstance(entries, list) else []):
                eid = entry.get('id', '')
                surf = entry.get('surface', '')
                if eid and surf:
                    id_surface[eid] = surf
    except:
        pass

particles_path = os.path.join(repo_root, 'shared/particles.json')
if os.path.exists(particles_path):
    try:
        with open(particles_path) as f:
            pdata = json.load(f)
            entries = pdata.get('particles', pdata.get('entries', [])) if isinstance(pdata, dict) else pdata
            for entry in (entries if isinstance(entries, list) else []):
                eid = entry.get('id', '')
                surf = entry.get('particle', entry.get('surface', ''))
                if eid and surf:
                    id_surface[eid] = surf
    except:
        pass

characters_path = os.path.join(repo_root, 'shared/characters.json')
if os.path.exists(characters_path):
    try:
        with open(characters_path) as f:
            cdata = json.load(f)
            entries = cdata.get('entries', cdata) if isinstance(cdata, dict) else cdata
            for entry in (entries if isinstance(entries, list) else []):
                eid = entry.get('id', '')
                surf = entry.get('surface', entry.get('name', ''))
                if eid and surf:
                    id_surface[eid] = surf
    except:
        pass

errors = []

def get_id(ref):
    if isinstance(ref, str):
        return ref
    if isinstance(ref, dict):
        return ref.get('id', '')
    return ''

def check_line(jp, terms, path):
    if not jp or not terms:
        return

    # Build list of (index_in_terms, term_id, surface) for resolvable terms
    resolved = []
    for i, ref in enumerate(terms):
        tid = get_id(ref)
        if not tid:
            continue
        surf = id_surface.get(tid, '')
        if surf:
            resolved.append((i, tid, surf))

    # For each adjacent pair of resolved terms, check if they share a jp token
    # (i.e. both surfaces appear consecutively in the same space-delimited token)
    # and if both are single-char, verify the rightmost one is listed first.
    KANJI_RE = re.compile(r'[\u4E00-\u9FFF\uF900-\uFAFF]')

    for pair_idx in range(len(resolved) - 1):
        i_a, tid_a, surf_a = resolved[pair_idx]
        i_b, tid_b, surf_b = resolved[pair_idx + 1]

        # Only care about single-char surfaces
        if len(surf_a) != 1 or len(surf_b) != 1:
            continue

        # The text processor sorts kana terms BEFORE kanji terms of the same
        # length, so a kana+kanji or kanji+kana pair is handled automatically
        # by the sort. Only kana+kana pairs (both purely hiragana/katakana)
        # have a stable-sort ordering issue where array order matters.
        a_is_kana = not KANJI_RE.search(surf_a)
        b_is_kana = not KANJI_RE.search(surf_b)
        if not (a_is_kana and b_is_kana):
            continue

        # Check if surf_a + surf_b appear consecutively (no space) in any jp token
        combined = surf_a + surf_b
        tokens = jp.split()
        in_same_token = any(combined in tok for tok in tokens)
        if not in_same_token:
            continue

        # surf_a is listed first in terms[] but surf_b is to the RIGHT in the
        # jp token, so surf_b must appear FIRST in the terms array for the
        # lookahead to work correctly.
        errors.append(
            f"  ERROR {path}: single-char chip order bug — "
            f"'{surf_b}' ({tid_b}) must come before '{surf_a}' ({tid_a}) in terms[] "
            f"because '{combined}' shares a jp token with no space (FM #59). "
            f"Swap their positions in the terms array."
        )

def walk(obj, path="root"):
    if isinstance(obj, dict):
        if 'jp' in obj and 'terms' in obj:
            check_line(obj['jp'], obj['terms'], path)
        for k, v in obj.items():
            walk(v, f"{path}.{k}")
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            walk(item, f"{path}[{i}]")

walk(content)

if errors:
    print(f"CHIP ORDER ERRORS in {os.path.basename(file_path)}:", file=sys.stderr)
    for e in errors:
        print(e, file=sys.stderr)
    sys.exit(1)
PYEOF

RC=$?
if [[ $RC -eq 1 ]]; then exit 2; fi
exit 0
