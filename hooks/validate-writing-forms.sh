#!/bin/bash
# Hook: validate-writing-forms.sh
# Runs on: PostToolUse (Edit|Write)
# Purpose: Early-use and partial-kanji writing form rules. Covers: FM #41-43
#          General kanji-form check: noun/na-adj vocab should use kanji form
#          when all kanji in the surface are in the taught set.

set -euo pipefail

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

[[ -z "$FILE" ]] && exit 0
[[ ! "$FILE" =~ \.(json)$ ]] && exit 0
[[ "$FILE" =~ (manifest|glossary|conjugation_rules|counter_rules|particles|characters|helper-vocab|package) ]] && exit 0

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

python3 - "$FILE" "$REPO_ROOT" << 'PYEOF'
import json, re, sys, os, glob

file_path = sys.argv[1]
repo_root = sys.argv[2]

try:
    with open(file_path) as f:
        content = json.load(f)
except:
    sys.exit(0)

lesson_id = content.get('id', '') or content.get('lesson', '')
if content.get('type') == 'grammar':
    lesson_id = content.get('meta', {}).get('unlocksAfter', lesson_id)
is_story_terms = bool(content.get('storyFile') and isinstance(content.get('terms'), dict))
if not lesson_id and not is_story_terms:
    sys.exit(0)

manifest_path = os.path.join(repo_root, 'manifest.json')
if not os.path.exists(manifest_path):
    sys.exit(0)

with open(manifest_path) as f:
    manifest = json.load(f)

lesson_order = {}
ordinal = 0
for lk in ['N5', 'N4', 'N3', 'N2', 'N1']:
    for l in manifest.get('data', {}).get(lk, {}).get('lessons', []):
        if l.get('id'):
            lesson_order[l['id']] = ordinal
            ordinal += 1
    for g in manifest.get('data', {}).get(lk, {}).get('grammar', []):
        if g.get('id'):
            lesson_order[g['id']] = lesson_order.get(g.get('unlocksAfter', ''), ordinal) + 0.5

def at_or_after(check, target):
    c, t = lesson_order.get(check), lesson_order.get(target)
    return t >= c if c is not None and t is not None else True

# Early-use: (kanji, hiragana, use_from, kanji_available_or_None)
EARLY_USE = [
    ('私', 'わたし', 'N5.1', 'N4.3'),
    ('家族', 'かぞく', 'N5.1', 'N4.7'),
    ('好き', 'すき', 'N5.7', 'N4.4'),
    ('次', 'つぎ', 'N5.4', None),
    ('事', 'こと', 'N5.9', 'N4.14'),
    ('昨日', 'きのう', 'N5.4', None),
]

PARTIAL = [
    ('大好き', '大すき', 'N5.7', 'N4.4'),
    ('朝ご飯', '朝ごはん', 'N4.3', 'N4.6'),
    ('晩ご飯', '晩ごはん', 'N4.3', 'N4.6'),
]

errors = []

def extract_jp(obj, path="root"):
    texts = []
    if isinstance(obj, dict):
        for k in ('jp', 'passage', 'model', 'titleJp'):
            if k in obj and isinstance(obj[k], str):
                texts.append((f"{path}.{k}", obj[k]))
        for k, v in obj.items():
            texts.extend(extract_jp(v, f"{path}.{k}"))
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            texts.extend(extract_jp(item, f"{path}[{i}]"))
    return texts

# ---- Build taught_kanji set for the current lesson ----
level_order_val = {'N5': 0, 'N4': 1, 'N3': 2, 'N2': 3, 'N1': 4}
taught_kanji = set()
if lesson_id:
    lm = re.match(r'(N\d+)\.(\d+)', lesson_id)
    if lm:
        tl, tn = lm.group(1), int(lm.group(2))
        to = level_order_val.get(tl, 0)
        for lk in ['N5', 'N4', 'N3', 'N2', 'N1']:
            for l in manifest.get('data', {}).get(lk, {}).get('lessons', []):
                llm = re.match(r'(N\d+)\.(\d+)', l.get('id', ''))
                if llm:
                    ll, ln = llm.group(1), int(llm.group(2))
                    lo = level_order_val.get(ll, 0)
                    if lo < to or (lo == to and ln <= tn):
                        taught_kanji.update(l.get('kanji', []))

for path, jp in extract_jp(content):
    jp_clean = jp.replace(' ', '').replace('\u3000', '')

    for kanji, hira, use_from, kanji_avail in EARLY_USE:
        if (hira in jp_clean or kanji in jp_clean) and not at_or_after(use_from, lesson_id):
            errors.append(f"  {path}: '{hira}'/'{kanji}' not available until {use_from}")
            continue
        if kanji in jp_clean and kanji_avail and not at_or_after(kanji_avail, lesson_id):
            errors.append(f"  {path}: '{kanji}' in kanji but not taught until {kanji_avail} — write as '{hira}'")

    for full, partial, avail, full_avail in PARTIAL:
        if full in jp_clean and full_avail and not at_or_after(full_avail, lesson_id):
            errors.append(f"  {path}: '{full}' — kanji not taught until {full_avail}, write as '{partial}'")

# ---- General kanji-form check ----
# For noun/na-adj vocab: if the hiragana reading appears in jp text as a whole-token
# suffix (handles embedded name+title like すずきせんせい) and the kanji surface does
# not appear, AND all kanji in the surface are taught → flag as wrong form.
# Uses suffix matching to avoid false positives from readings that are prefixes
# of longer words (e.g. "きょう" inside "きょうしつ").
NOUN_LIKE_GTYPES = {'noun', 'noun_suru', 'na-adjective', 'na_adj', 'adjective_na', 'pronoun'}
STRIP_PUNCT = re.compile(r'[。、！？「」…・〜ー…（）【】『』]')

kanji_vocab = []
if taught_kanji:
    for gpath in glob.glob(os.path.join(repo_root, 'data/*/glossary.*.json')):
        try:
            with open(gpath) as f:
                data_g = json.load(f)
                entries = data_g.get('entries', data_g) if isinstance(data_g, dict) else data_g
                for entry in (entries if isinstance(entries, list) else []):
                    if entry.get('type') != 'vocab':
                        continue
                    if entry.get('gtype') not in NOUN_LIKE_GTYPES:
                        continue
                    surface = entry.get('surface', '')
                    reading = entry.get('reading', '')
                    if not surface or not reading or surface == reading:
                        continue
                    kanji_chars = [c for c in surface if '\u4e00' <= c <= '\u9fff']
                    # Minimum 3-char reading: 2-char readings like した/まえ/うえ cause
                    # false positives (した matches past-tense ました endings etc.)
                    if not kanji_chars or len(reading) < 3:
                        continue
                    kanji_vocab.append((surface, reading, kanji_chars))
        except:
            pass

if kanji_vocab:
    for path, jp in extract_jp(content):
        jp_clean = jp.replace(' ', '').replace('\u3000', '')
        for surface, reading, kanji_chars in kanji_vocab:
            # Check if reading appears as a suffix of any space-delimited token
            matched_token = None
            for token in jp.split(' '):
                clean_tok = STRIP_PUNCT.sub('', token)
                if clean_tok.endswith(reading) and len(clean_tok) >= len(reading):
                    matched_token = clean_tok
                    break
            if not matched_token:
                continue
            if surface in jp_clean:
                continue  # kanji form is present
            if not all(k in taught_kanji for k in kanji_chars):
                continue  # not all kanji taught yet
            errors.append(
                f"  {path}: '{reading}' (in '{matched_token}') should be '{surface}' — all kanji taught"
            )

# ---- story terms.json: matches-form check ----
# If a term key is in a glossary entry's `matches` array (valid pre-kanji form)
# but all kanji in the entry's surface are now taught, the term key must use
# the surface form instead. This catches e.g. "日ようび" after 曜 is taught.
if is_story_terms:
    story_dir = os.path.dirname(os.path.abspath(file_path))
    story_unlock = None
    for level_key in ['N5', 'N4', 'N3', 'N2', 'N1']:
        for story_entry in manifest.get('data', {}).get(level_key, {}).get('stories', []):
            entry_dir = os.path.normpath(os.path.join(repo_root, story_entry.get('dir', '')))
            if entry_dir == os.path.normpath(story_dir):
                story_unlock = story_entry.get('unlocksAfter')
                break
        if story_unlock:
            break

    if story_unlock:
        unlock_ord = lesson_order.get(story_unlock, 0)
        taught_kanji = set()
        for level_key in ['N5', 'N4', 'N3', 'N2', 'N1']:
            for l in manifest.get('data', {}).get(level_key, {}).get('lessons', []):
                if l.get('id') and lesson_order.get(l['id'], 9999) <= unlock_ord:
                    for k in l.get('kanji', []):
                        taught_kanji.add(k)

        gloss = {}
        for level_key in ['N5', 'N4', 'N3']:
            gpath = os.path.join(repo_root, 'data', level_key, f'glossary.{level_key}.json')
            if os.path.exists(gpath):
                try:
                    with open(gpath) as gf:
                        raw = json.load(gf)
                        entries = raw.get('entries', raw) if isinstance(raw, dict) else raw
                        for entry in entries:
                            if isinstance(entry, dict) and entry.get('id'):
                                gloss[entry['id']] = entry
                except Exception:
                    pass

        for term_key, term_val in content.get('terms', {}).items():
            if not isinstance(term_val, dict):
                continue
            term_id = term_val.get('id', '')
            g_entry = gloss.get(term_id)
            if not g_entry:
                continue
            surface = g_entry.get('surface', '')
            matches = g_entry.get('matches', [])
            if not matches or term_key not in matches:
                continue
            kanji_in_surface = [c for c in surface if '\u4e00' <= c <= '\u9fff']
            if not kanji_in_surface:
                continue
            untaught = [k for k in kanji_in_surface if k not in taught_kanji]
            if untaught:
                continue
            errors.append(
                f'  terms["{term_key}"] (id: {term_id}): 曜 and all kanji in '
                f'"{surface}" are taught by {story_unlock} — use "{surface}" not "{term_key}"'
            )

if errors:
    print(f"WRITING FORM ERRORS in {os.path.basename(file_path)}:", file=sys.stderr)
    for err in errors[:10]:
        print(err, file=sys.stderr)
    sys.exit(1)

PYEOF

if [[ $? -ne 0 ]]; then exit 2; fi
