#!/bin/bash
# Hook: validate-tag-coverage.sh
# Runs on: PostToolUse (Edit|Write)
# Purpose: Detects Japanese text in jp fields NOT covered by any term in terms[].
#          Simulates the text-processor.js matching algorithm (longest-match-first,
#          single-char kana lookahead, surface→reading→matches fallback) and reports
#          any remaining hiragana/katakana/kanji as untagged.

set -euo pipefail

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

[[ -z "$FILE" ]] && exit 0
[[ ! "$FILE" =~ \.(json)$ ]] && exit 0
[[ "$FILE" =~ (manifest|glossary|conjugation_rules|counter_rules|particles|characters|helper-vocab|package) ]] && exit 0

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

python3 - "$FILE" "$REPO_ROOT" << 'PYEOF'
import json, sys, os, glob, re, math

file_path = sys.argv[1]
repo_root = sys.argv[2]

try:
    with open(file_path) as f:
        content = json.load(f)
except:
    sys.exit(0)

# ---------------------------------------------------------------------------
# Build ID → info map (glossaries, particles, characters)
# ---------------------------------------------------------------------------
id_info = {}
for gpath in glob.glob(os.path.join(repo_root, 'data/*/glossary.*.json')):
    try:
        with open(gpath) as f:
            data_g = json.load(f)
            entries = data_g.get("entries", data_g) if isinstance(data_g, dict) else data_g
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
                    id_info[eid] = {
                        'surface': entry.get('particle', ''),
                        'reading': '',
                        'matches': entry.get('matches', []) if isinstance(entry.get('matches'), list) else [],
                        'gtype': 'particle',
                        'verb_class': '',
                    }
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
                    id_info[eid] = {
                        'surface': entry.get('surface', ''),
                        'reading': '',
                        'matches': entry.get('matches', []) if isinstance(entry.get('matches'), list) else [],
                        'gtype': 'character',
                        'verb_class': '',
                    }
    except:
        pass

id_info['g_desu'] = {'surface': 'です', 'reading': '', 'matches': [], 'gtype': 'copula', 'verb_class': ''}
id_info['g_da'] = {'surface': 'だ', 'reading': '', 'matches': ['だった'], 'gtype': 'copula', 'verb_class': ''}

# ---------------------------------------------------------------------------
# Conjugation engine (port from validate-surface-match.sh / text-processor.js)
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
except:
    pass

def _apply_rule(surface, reading, rule):
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
        sl = surface[-1] if surface else ''
        rl = reading[-1] if reading else ''
        ms, mr = m.get(sl), m.get(rl)
        if ms is None:
            return None, None
        add = rule.get('add', '')
        return surface[:-1] + ms + add, reading[:-1] + (mr or ms) + add
    return None, None

def conjugate_surface(surface, reading, verb_class, form_key):
    if not surface or not form_key:
        return None, None
    form_def = conj_rules.get(form_key)
    if not form_def or not isinstance(form_def, dict):
        return None, None
    rules = form_def.get('rules', {})
    vc = verb_class or ''
    if vc in ('u', 'verb'): vc = 'godan'
    if vc == 'ru': vc = 'ichidan'
    if vc == 'irr_iku' and 'irr_iku' not in rules: vc = 'godan'
    rule = rules.get(vc)
    if not rule:
        return None, None
    return _apply_rule(surface, reading or surface, rule)

# ---------------------------------------------------------------------------
# Counter engine (port from text-processor.js buildCounterTerm)
# ---------------------------------------------------------------------------
counter_rules = {}
try:
    with open(os.path.join(repo_root, 'counter_rules.json')) as _f:
        counter_rules = json.load(_f)
except:
    pass

COUNTER_PLACE_ORDER = [10000, 1000, 100, 10]

def counter_build_number(n):
    if not n or n < 1 or n != int(n):
        return None
    surface = ''
    reading = ''
    override_key = None
    remaining = n
    digits = counter_rules.get('digits', {})
    places = counter_rules.get('places', {})
    for place in COUNTER_PLACE_ORDER:
        if remaining < place:
            continue
        count = remaining // place
        remaining -= count * place
        is_last = (remaining == 0)
        place_data = places.get(str(place), {})
        e_key = str(count)
        euphs = place_data.get('euphonics', {})
        if euphs and euphs.get(e_key):
            surface += (digits[e_key]['surface'] if count > 1 else '') + place_data.get('surface', '')
            reading += euphs[e_key]
        else:
            if count > 1:
                surface += digits.get(e_key, {}).get('surface', '')
                reading += digits.get(e_key, {}).get('reading', '')
            surface += place_data.get('surface', '')
            reading += place_data.get('reading', '')
            if is_last and count == 1:
                override_key = str(place)
    if remaining > 0:
        d_key = str(remaining)
        surface += digits.get(d_key, {}).get('surface', '')
        reading += digits.get(d_key, {}).get('reading', '')
        override_key = d_key
    return {'surface': surface, 'reading': reading, 'overrideKey': override_key}

def counter_base_reading(key):
    if not key:
        return None
    places = counter_rules.get('places', {})
    digits = counter_rules.get('digits', {})
    if key in places:
        return places[key].get('reading')
    if key in digits:
        return digits[key].get('reading')
    return None

def build_counter_term(counter_key, n):
    counters = counter_rules.get('counters', {})
    if not counters:
        return None
    counter = counters.get(counter_key)
    if not counter:
        return None
    n_int = int(n)
    if n_int < 1:
        return None
    # Whole-word special cases (e.g. 一人=ひとり)
    specials = counter.get('special', {})
    if specials and specials.get(str(n_int)):
        sp = specials[str(n_int)]
        return {'surface': sp['surface'], 'reading': sp['reading']}
    num = counter_build_number(n_int)
    if not num:
        return None
    o_key = num.get('overrideKey')
    num_reading = num['reading']
    # prefix_override
    if o_key and counter.get('prefix_overrides', {}).get(o_key):
        orig_base = counter_base_reading(o_key)
        if orig_base and num_reading.endswith(orig_base):
            num_reading = num_reading[:-len(orig_base)] + counter['prefix_overrides'][o_key]
    # counter_override
    counter_reading = counter['reading']
    if o_key and counter.get('counter_overrides', {}).get(o_key):
        counter_reading = counter['counter_overrides'][o_key]
    return {'surface': num['surface'] + counter['surface'], 'reading': num_reading + counter_reading}

# ---------------------------------------------------------------------------
# Resolve a single term ref to all possible surface forms the text processor
# might match. Returns list of strings (longest first = preferred).
# ---------------------------------------------------------------------------
def resolve_term_surfaces(term_ref):
    """Returns list of (surface_form, is_single_char_kana) tuples for a term ref."""
    if isinstance(term_ref, dict):
        tid = term_ref.get('id', '')
        form = term_ref.get('form')
        # Counter term
        if 'counter' in term_ref:
            ct = build_counter_term(term_ref['counter'], term_ref.get('n', 0))
            if ct:
                forms = [ct['surface']]
                if ct.get('reading') and ct['reading'] != ct['surface']:
                    forms.append(ct['reading'])
                return [(f, False) for f in forms]
            return []
        # form: null → masu_stem purpose construction
        if 'form' in term_ref and term_ref['form'] is None:
            form = 'masu_stem'
        if not tid or tid not in id_info:
            return []
        info = id_info[tid]
        if form:
            vc = info.get('verb_class', '') or info.get('gtype', '')
            cs, cr = conjugate_surface(info['surface'], info.get('reading', ''), vc, form)
            if cs:
                forms = [cs]
                if cr and cr != cs:
                    forms.append(cr)
                return [(f, len(f) == 1 and is_kana_char(f)) for f in forms]
            # Conjugation failed — fall through to base surface
        # Plain ID
        surface = info['surface']
        reading = info.get('reading', '')
        matches = info.get('matches', [])
        forms = []
        if surface:
            forms.append(surface)
        if reading and reading not in forms:
            forms.append(reading)
        for m in matches:
            if m not in forms:
                forms.append(m)
        is_single = len(surface) == 1 and is_kana_char(surface)
        return [(f, is_single) for f in forms]
    elif isinstance(term_ref, str):
        tid = term_ref
        if tid not in id_info:
            return []
        info = id_info[tid]
        surface = info['surface']
        reading = info.get('reading', '')
        matches = info.get('matches', [])
        forms = []
        if surface:
            forms.append(surface)
        if reading and reading not in forms:
            forms.append(reading)
        for m in matches:
            if m not in forms:
                forms.append(m)
        is_single = len(surface) == 1 and is_kana_char(surface)
        return [(f, is_single) for f in forms]
    return []

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def is_kana_char(c):
    """True if character is hiragana or katakana."""
    return len(c) == 1 and ('\u3040' <= c <= '\u30ff')

def has_kanji(s):
    return any('\u4e00' <= c <= '\u9fff' or '\uf900' <= c <= '\ufaff' for c in s)

def is_japanese(c):
    """True if character is hiragana, katakana, or kanji."""
    return ('\u3040' <= c <= '\u309f' or  # hiragana
            '\u30a0' <= c <= '\u30ff' or  # katakana
            '\u4e00' <= c <= '\u9fff' or  # CJK unified
            '\uf900' <= c <= '\ufaff')    # CJK compat

# Characters to strip before checking for remaining Japanese
STRIP_CHARS = set('。、！？「」（）〜…ー・～♪ 　___')
# Also strip ASCII digits and Latin chars
def is_ignorable(c):
    return (c in STRIP_CHARS or
            c == '_' or
            '0' <= c <= '9' or
            'A' <= c <= 'z' or
            c == '\u3000' or  # full-width space
            c == '\u30fc' or  # katakana prolonged sound mark (ー)
            c == '　')

# ---------------------------------------------------------------------------
# Coverage simulation — mirrors text-processor.js processText()
# ---------------------------------------------------------------------------
def check_coverage(jp, terms, path, errors):
    if not jp or not terms:
        return
    # Skip items with fill-in-the-blank markers — terms may be split across blank
    if '___' in jp:
        return

    # Strip instructional hints in full-width parentheses （...） — these contain
    # base forms as hints in sentenceTransform drills, not content to render as chips
    jp_check = re.sub(r'（[^）]*）', '', jp)

    # Resolve all terms to (surface_forms, is_single_char_kana)
    resolved = []
    for term_ref in terms:
        surfaces = resolve_term_surfaces(term_ref)
        if surfaces:
            resolved.append(surfaces)

    # Build flat list of (matched_form, is_single_char_kana) sorted like text-processor.js:
    # longest first, kana-only before kanji at same length
    flat_terms = []
    for surfaces in resolved:
        # Use first (preferred) surface for sorting, but keep fallbacks
        flat_terms.append(surfaces)

    # Sort: primary surface length desc, kana-only first at same length
    flat_terms.sort(key=lambda surfs: (-len(surfs[0][0]),
                                       0 if not has_kanji(surfs[0][0]) else 1))

    # Simulate wrapping: remove matched surfaces from working copy
    # We work on the space-stripped version (text processor operates on raw text
    # but spaces don't affect matching since split/join doesn't care about spaces)
    working = jp_check  # keep spaces — they affect single-char lookahead context

    for surfaces in flat_terms:
        matched = False
        for form, is_single in surfaces:
            if not form:
                continue
            if is_single or (len(form) == 1 and is_kana_char(form)):
                # Single-char kana: use lookahead simulation
                # Replace only when NOT followed by hiragana/katakana
                # Use a sentinel char (□) to mark "wrapped" positions
                result = []
                i = 0
                found = False
                while i < len(working):
                    if working[i] == form:
                        # Check next non-sentinel char
                        next_idx = i + 1
                        # In the real text processor, after wrapping a char it becomes
                        # <span>...</span>, so the next char is '<'. We simulate by
                        # checking if the next char is already a sentinel or is not kana.
                        if next_idx >= len(working):
                            # End of string — lookahead passes
                            result.append('□')
                            found = True
                        elif working[next_idx] == '□':
                            # Already wrapped — lookahead passes (like seeing '<')
                            result.append('□')
                            found = True
                        elif is_kana_char(working[next_idx]):
                            # Followed by kana — lookahead FAILS, keep original
                            result.append(working[i])
                        else:
                            # Followed by non-kana (kanji, punctuation, space, etc.) — passes
                            result.append('□')
                            found = True
                    else:
                        result.append(working[i])
                    i += 1
                if found:
                    working = ''.join(result)
                    matched = True
                    break
            else:
                # Multi-char: replace ALL occurrences (text-processor.js uses split/join)
                if form in working:
                    working = working.replace(form, '□' * len(form))
                    matched = True
                    break
        # If no form matched, that's OK for coverage — surface-match hook handles that

    # Check what's left: strip ignorable chars and sentinels, look for remaining Japanese
    remaining = []
    for c in working:
        if c == '□' or is_ignorable(c) or c == ' ':
            continue
        if is_japanese(c):
            remaining.append(c)

    if remaining:
        untagged = ''.join(remaining)
        # Build a more readable version showing context
        # Group consecutive untagged chars with their position in original jp
        errors.append(f"  {path}: untagged '{untagged}' in jp '{jp}'")

errors = []

def walk(obj, path="root"):
    if isinstance(obj, dict):
        if 'jp' in obj and 'terms' in obj:
            check_coverage(obj['jp'], obj['terms'], path, errors)
        # Q&A fields
        if 'q' in obj and 'terms' in obj:
            if 'a_terms' in obj:
                check_coverage(obj['q'], obj['terms'], path + '.q', errors)
                if isinstance(obj.get('a'), str) and obj.get('a_terms'):
                    check_coverage(obj['a'], obj['a_terms'], path + '.a', errors)
            else:
                qa_text = obj['q']
                if isinstance(obj.get('a'), str):
                    qa_text += ' ' + obj['a']
                if isinstance(obj.get('answer'), str):
                    qa_text += ' ' + obj['answer']
                check_coverage(qa_text, obj['terms'], path + '.q', errors)
        for k, v in obj.items():
            walk(v, f"{path}.{k}")
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            walk(item, f"{path}[{i}]")

walk(content)

if errors:
    print(f"TAG COVERAGE GAPS in {os.path.basename(file_path)} ({len(errors)} items):", file=sys.stderr)
    for err in errors:
        print(err, file=sys.stderr)
    sys.exit(1)
PYEOF

if [[ $? -ne 0 ]]; then exit 2; fi
