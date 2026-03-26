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
level_prefix_match = _re_top.match(r'(N\d+)', lesson_id or '')
if level_prefix_match and os.path.exists(manifest_path):
    target_level = level_prefix_match.group(1)
    # For standard lessons (N5.X), scope to that lesson number.
    # For reviews/final/game-days (N5.Review.X etc.), include all kanji for the level.
    target_num = int(level_match.group(2)) if level_match else 9999
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
                        'reading': entry.get('reading', entry.get('surface', '')),
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

# ---------------------------------------------------------------------------
# Conjugation engine — port of text-processor.js conjugate()
# ---------------------------------------------------------------------------
GODAN_MAPS = {
    'u_to_i':    {'う':'い','く':'き','ぐ':'ぎ','す':'し','つ':'ち','ぬ':'に','ぶ':'び','む':'み','る':'り'},
    'u_to_a':    {'う':'わ','く':'か','ぐ':'が','す':'さ','つ':'た','ぬ':'な','ぶ':'ば','む':'ま','る':'ら'},
    'u_to_e':    {'う':'え','く':'け','ぐ':'げ','す':'せ','つ':'て','ぬ':'ね','ぶ':'べ','む':'め','る':'れ'},
    'u_to_o':    {'う':'お','く':'こ','ぐ':'ご','す':'そ','つ':'と','ぬ':'の','ぶ':'ぼ','む':'も','る':'ろ'},
    'ta_form':   {'う':'った','つ':'った','る':'った','む':'んだ','ぶ':'んだ','ぬ':'んだ','く':'いた','ぐ':'いだ','す':'した'},
    'te_form':   {'う':'って','つ':'って','る':'って','む':'んで','ぶ':'んで','ぬ':'んで','く':'いて','ぐ':'いで','す':'して'},
    'tari_form': {'う':'ったり','つ':'ったり','る':'ったり','む':'んだり','ぶ':'んだり','ぬ':'んだり','く':'いたり','ぐ':'いだり','す':'したり'},
    'tara_form': {'う':'ったら','つ':'ったら','る':'ったら','む':'んだら','ぶ':'んだら','ぬ':'んだら','く':'いたら','ぐ':'いだら','す':'したら'},
}

conj_rules = {}
try:
    with open(os.path.join(repo_root, 'conjugation_rules.json')) as _f:
        conj_rules = json.load(_f)
except Exception:
    pass

def _apply_rule(surface, reading, rule):
    """Apply one conjugation rule to (surface, reading). Returns (new_surface, new_reading) or (None, None)."""
    rtype = rule.get('type')
    if rtype == 'identity':
        return surface, reading
    if rtype == 'replace':
        return rule.get('surface'), rule.get('reading', rule.get('surface'))
    if rtype == 'suffix':
        rm = rule.get('remove', '')
        add = rule.get('add', '')
        s = surface[:-len(rm)] if (rm and surface.endswith(rm)) else surface
        r = reading[:-len(rm)] if (rm and reading.endswith(rm)) else reading
        return s + add, r + add
    if rtype in ('godan_change', 'godan_euphonic'):
        m = GODAN_MAPS.get(rule.get('map', ''), {})
        sl, rl = (surface[-1] if surface else ''), (reading[-1] if reading else '')
        ms, mr = m.get(sl), m.get(rl)
        if ms is None:
            return None, None
        add = rule.get('add', '')
        return surface[:-1] + ms + add, reading[:-1] + (mr or ms) + add
    return None, None

def conjugate_surface(surface, reading, verb_class, form_key):
    """Compute (expected_surface, expected_reading) for a conjugated term. Returns (None,None) if unknown."""
    if not surface or not form_key:
        return None, None
    form_def = conj_rules.get(form_key)
    if not form_def or not isinstance(form_def, dict):
        return None, None
    rules = form_def.get('rules', {})
    # Normalise verb_class labels (mirrors text-processor.js)
    vc = verb_class or ''
    if vc in ('u', 'verb'): vc = 'godan'
    if vc == 'ru': vc = 'ichidan'
    if vc == 'irr_iku' and 'irr_iku' not in rules: vc = 'godan'
    rule = rules.get(vc)
    if not rule:
        return None, None
    return _apply_rule(surface, reading or surface, rule)

errors = []

import re as _re

def is_pure_kanji(s):
    return bool(s) and all('\u4e00' <= c <= '\u9fff' for c in s)

def surface_found_in_jp(surface, matches, jp_orig, jp_clean):
    """Check if surface (or any match) appears in jp text.
    For short pure-kanji surfaces (≤2 chars), uses a negative CJK lookbehind to avoid
    false positives where a kanji appears embedded inside a longer compound
    (e.g. 所 inside 場所) while still matching when preceded by hiragana, katakana,
    punctuation, or a name (e.g. 先生 in すずき先生は, 人 in 男の人)."""
    all_forms = [surface] + matches
    if is_pure_kanji(surface) and len(surface) <= 2:
        for f in all_forms:
            if _re.search(r'(?<![\u4e00-\u9fff])' + _re.escape(f), jp_orig):
                return True
        return False
    return any(f in jp_clean for f in all_forms)

def check_surface(jp, terms, path):
    if not jp or not terms:
        return
    jp_clean = jp.replace(' ', '').replace('\u3000', '')

    for i, term in enumerate(terms):
        if isinstance(term, dict):
            tid = term.get('id', '')
            form = term.get('form')
            # form: null (JSON null → Python None) is the masu-stem purpose
            # construction — the chip engine handles matching specially; skip check
            if 'counter' in term or ('form' in term and term['form'] is None):
                continue
        elif isinstance(term, str):
            tid = term
            form = None
        else:
            continue

        if not tid or tid not in id_info:
            continue

        info = id_info[tid]

        # Conjugated-form checks
        if form is not None:
            # FM #53d: na-adj verb_class gate
            if form in ('attributive_na', 'polite_adj') and info['gtype'] in ('na-adjective', 'na_adj'):
                if info['verb_class'] != 'na_adj':
                    errors.append(f"  {path}.terms[{i}]: '{tid}' used with '{form}' but missing verb_class:'na_adj' in glossary")
            # FM #60: polite_adj space-split — chip won't match if jp has "surface です"
            if form == 'polite_adj':
                _surf = info.get('surface', '')
                if _surf and (_surf + 'です') not in jp and (_surf + ' です') in jp:
                    errors.append(f"  {path}.terms[{i}]: '{tid}' polite_adj — jp has '{_surf} です' (space-split); use bare '{tid}' + 'g_desu' instead")
            # Conjugated-surface mismatch check — catches wrong verb ID (e.g. v_deru vs v_dasu)
            # Skip when jp contains a fill-in-the-blank marker (conjugated form is in the answer field)
            _vc = info.get('verb_class', '') or info.get('gtype', '')
            _cs, _cr = conjugate_surface(info.get('surface', ''), info.get('reading', ''), _vc, form)
            if _cs is not None and '___' not in jp:
                _jp_clean = jp.replace(' ', '').replace('\u3000', '')
                if _cs not in _jp_clean and (_cr is None or _cr not in _jp_clean):
                    errors.append(f"  {path}.terms[{i}]: '{tid}' {form} → expected '{_cs}' not found in jp")
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

        # Skip surface check when jp has a blank marker — compound terms may be split across the blank
        if '___' in jp:
            continue

        surface = info['surface']
        matches = list(info['matches'])  # always keep hand-curated matches (e.g. 友だち)
        # If surface contains untaught kanji, also accept the reading as primary check
        if surface_has_untaught_kanji(surface) and info.get('reading'):
            surface = info['reading']
        # Also accept the reading as a valid match (e.g. もの for 物 in abstract contexts,
        # or できる for 出来る when author chose hiragana even though kanji is taught)
        _reading = info.get('reading', '')
        _extra = [_reading] if _reading and _reading != surface else []
        if not surface_found_in_jp(surface, matches + _extra, jp, jp_clean):
            errors.append(f"  {path}.terms[{i}]: '{tid}' (surface: '{info['surface']}', checked: '{surface}') not found in jp text")

def walk(obj, path="root"):
    if isinstance(obj, dict):
        if 'jp' in obj and 'terms' in obj:
            check_surface(obj['jp'], obj['terms'], path)
        # Q&A fields: new format splits terms (q only) and a_terms (a only)
        # Old format: terms covers combined q+a text
        if 'q' in obj and 'terms' in obj:
            if 'a_terms' in obj:
                # New format: terms covers q only, a_terms covers a only
                check_surface(obj['q'], obj['terms'], path + '.q')
                if isinstance(obj.get('a'), str) and obj.get('a_terms'):
                    check_surface(obj['a'], obj['a_terms'], path + '.a')
            else:
                # Old format (backward compat): terms covers combined q+a text
                # Also include 'answer' (fill-in-the-blank drills) so surface check covers the answer token
                qa_text = obj['q']
                if isinstance(obj.get('a'), str):
                    qa_text += ' ' + obj['a']
                if isinstance(obj.get('answer'), str):
                    qa_text += ' ' + obj['answer']
                check_surface(qa_text, obj['terms'], path + '.q')
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
