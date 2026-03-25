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
import json, sys, os, glob, re as _re_top

file_path = sys.argv[1]
repo_root = sys.argv[2]

try:
    with open(file_path) as f:
        content = json.load(f)
except:
    sys.exit(0)

# Build taught-kanji set for this file's lesson scope
taught_kanji = set()
manifest_path = os.path.join(repo_root, 'manifest.json')
lesson_id = content.get('id', '') or content.get('lesson', '')
if content.get('type') == 'grammar':
    lesson_id = content.get('meta', {}).get('unlocksAfter', lesson_id)

level_order = {'N5': 0, 'N4': 1, 'N3': 2, 'N2': 3, 'N1': 4}
level_match = _re_top.match(r'(N\d+)\.(\d+)', lesson_id or '')
if level_match and os.path.exists(manifest_path):
    target_level = level_match.group(1)
    target_num = int(level_match.group(2))
    target_order = level_order.get(target_level, 0)
    try:
        with open(manifest_path) as f:
            manifest = json.load(f)
        for lk in ['N5', 'N4', 'N3', 'N2', 'N1']:
            for lesson in manifest.get('data', {}).get(lk, {}).get('lessons', []):
                lid = lesson.get('id', '')
                lm = _re_top.match(r'(N\d+)\.(\d+)', lid)
                if not lm:
                    continue
                ll, ln = lm.group(1), int(lm.group(2))
                lo = level_order.get(ll, 0)
                if lo < target_order or (lo == target_order and ln <= target_num):
                    taught_kanji.update(lesson.get('kanji', []))
    except:
        pass

def surface_has_untaught_kanji(surface):
    """Check if a surface string contains any kanji not yet taught."""
    for c in surface:
        if '\u4e00' <= c <= '\u9fff' and c not in taught_kanji:
            return True
    return False

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
                        'reading': entry.get('reading', ''),
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

import re as _re

def is_pure_kanji(s):
    return bool(s) and all('\u4e00' <= c <= '\u9fff' for c in s)

def surface_found_in_jp(surface, matches, jp_orig, jp_clean):
    """Check if surface (or any match) appears in jp text.
    For short pure-kanji surfaces (≤2 chars), uses prefix-token matching to avoid
    substring false positives like 所 (v_tokoro) appearing inside 場所 (v_basho).
    Japanese nouns appear at the start of a whitespace- or punctuation-delimited token
    followed by a particle (場所は), so startswith() catches the noun while rejecting
    kanji that only appear embedded mid-compound.
    Splits on both spaces AND after sentence-final punctuation (。！？) to handle
    multi-sentence jp strings where periods aren't always followed by a space."""
    all_forms = [surface] + matches
    if is_pure_kanji(surface) and len(surface) <= 2:
        # Split on whitespace, then further split on sentence boundaries (after 。！？)
        rough_tokens = jp_orig.split()
        tokens = []
        for tok in rough_tokens:
            tokens.extend(t for t in _re.split(r'(?<=[。！？])', tok) if t)
        return any(tok.startswith(f) for tok in tokens for f in all_forms)
    return any(f in jp_clean for f in all_forms)

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
            # polite_adj emits surface+です as one unbroken token.
            # If jp has surface + " です" (space before です), the chip will never match.
            # Correct fix: use plain adj (bare string) + g_desu as separate terms.
            if form == 'polite_adj':
                surface = info.get('surface', '')
                if surface and (surface + 'です') not in jp and (surface + ' です') in jp:
                    errors.append(f"  {path}.terms[{i}]: '{tid}' polite_adj — jp has '{surface} です' (space-split); use bare '{tid}' + 'g_desu' instead")
            continue

        # Special cross-check: p_to_quote (surface と, 1 char — skipped below by single-char guard)
        # If jp contains って but no standalone と token, CB should use p_tte_quote instead.
        if tid == 'p_to_quote':
            jp_nospace = jp.replace(' ', '')
            has_standalone_to = any(
                t.strip('。、！？「」〜…') == 'と' for t in jp.split()
            )
            if 'って' in jp_nospace and not has_standalone_to:
                errors.append(
                    f"  {path}.terms[{i}]: 'p_to_quote' but jp has 'って' not standalone 'と' — use 'p_tte_quote' for casual quote particle"
                )

        # Skip single-char particles (too many false positives for general surface check)
        if info['gtype'] == 'particle' and len(info['surface']) <= 1:
            continue
        if tid in ('g_desu', 'g_da'):
            continue

        surface = info['surface']
        matches = info['matches']
        # If surface contains untaught kanji, fall back to reading (hiragana form)
        if surface_has_untaught_kanji(surface) and info.get('reading'):
            surface = info['reading']
            matches = []  # matches are kanji-based, not useful for reading fallback
        if not surface_found_in_jp(surface, matches, jp, jp_clean):
            errors.append(f"  {path}.terms[{i}]: '{tid}' (surface: '{info['surface']}', checked: '{surface}') not found in jp text")

def walk(obj, path="root"):
    if isinstance(obj, dict):
        if 'jp' in obj and 'terms' in obj:
            check_surface(obj['jp'], obj['terms'], path)
        # Also check Q&A question fields — these have q/a/terms but no jp key
        if 'q' in obj and 'terms' in obj:
            check_surface(obj['q'], obj['terms'], path + '.q')
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
