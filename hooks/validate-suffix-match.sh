#!/bin/bash
# Hook: validate-suffix-match.sh
# Runs on: PostToolUse (Edit|Write)
# Purpose: Catches untagged prefix chars when a term's surface is a strict suffix
#          of one of its matches[] entries.
#
# Example: p_nda has surface "んだ" but matches["なんだ"]. When jp text contains
# "なんだ", the text processor finds "んだ" first (surface match wins over the
# longer matches[] fallback), wrapping only "んだ" and leaving "な" untagged.
# Fix: add a separate term for the prefix ("な" → p_na) in the terms array.
#
# Affected particles (currently): p_nda, p_ndesu (both have な as untagged prefix).
# The hook auto-detects all such cases from particles.json so it stays current.

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

# Build map: term_id → {surface, suffix_traps}
# suffix_trap = (match_form, prefix) where surface is a strict suffix of match_form
id_suffix_traps = {}
id_surface = {}  # full surface map for prefix coverage check

def load_entries(entries):
    for entry in (entries if isinstance(entries, list) else []):
        if not isinstance(entry, dict):
            continue
        eid = entry.get('id', '')
        surface = entry.get('surface', entry.get('particle', ''))
        matches = entry.get('matches', [])
        if not eid or not surface:
            continue
        traps = []
        for m in matches:
            if isinstance(m, str) and m != surface and m.endswith(surface) and len(m) > len(surface):
                prefix = m[:-len(surface)]
                traps.append((m, prefix))
        id_surface[eid] = surface
        if traps:
            id_suffix_traps[eid] = (surface, traps)

# Load particles
particles_path = os.path.join(repo_root, 'shared/particles.json')
if os.path.exists(particles_path):
    try:
        with open(particles_path) as f:
            pdata = json.load(f)
            entries = pdata.get('particles', pdata.get('entries', [])) if isinstance(pdata, dict) else pdata
            load_entries(entries)
    except:
        pass

# Load glossaries
for gpath in glob.glob(os.path.join(repo_root, 'data/*/glossary.*.json')):
    try:
        with open(gpath) as f:
            raw = json.load(f)
            entries = raw.get('entries', raw) if isinstance(raw, dict) else raw
            load_entries(entries if isinstance(entries, list) else [])
    except:
        pass

errors = []

def get_id(ref):
    if isinstance(ref, str): return ref
    if isinstance(ref, dict): return ref.get('id', '')
    return ''

def check_line(jp, terms, path):
    if not jp or not terms:
        return
    jp_no_spaces = jp.replace(' ', '')
    term_ids = [get_id(t) for t in terms]
    for i, tid in enumerate(term_ids):
        if tid not in id_suffix_traps:
            continue
        surface, traps = id_suffix_traps[tid]
        for match_form, prefix in traps:
            if match_form in jp_no_spaces:
                # Check if any other term in the line covers the prefix
                prefix_covered = any(
                    id_surface.get(other_id, '') == prefix
                    for other_id in term_ids if other_id != tid
                )
                if not prefix_covered:
                    errors.append(
                        f"  ERROR {path}.terms[{i}]: '{tid}' surface is \"{surface}\" but jp contains "
                        f"\"{match_form}\" — \"{prefix}\" will be untagged (text processor matches "
                        f"surface \"{surface}\" first, never reaching matches[\"{match_form}\"]). "
                        f"Add a term for the prefix \"{prefix}\" before '{tid}' in terms[]."
                    )

def walk(obj, path="root"):
    if isinstance(obj, dict):
        if 'jp' in obj and 'terms' in obj:
            check_line(obj['jp'], obj['terms'], path)
        for k, v in obj.items():
            walk(v, f"{path}.{k}")
    elif isinstance(obj, list):
        for idx, item in enumerate(obj):
            walk(item, f"{path}[{idx}]")

walk(content)

if errors:
    print(f"SUFFIX-MATCH ERRORS in {os.path.basename(file_path)}:", file=sys.stderr)
    for e in errors:
        print(e, file=sys.stderr)
    sys.exit(1)
PYEOF

RC=$?
if [[ $RC -eq 1 ]]; then exit 2; fi
exit 0
