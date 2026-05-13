#!/bin/bash
# Hook: validate-story-tokenization.sh
# Runs on: PostToolUse (Edit|Write)
# Purpose: Catches prefix-collision tokenization bugs in story files (FM #61).
#
# The story renderer tokenizes story.md using longest-surface-first matching
# against the surface→{id,form} dict from terms.json. Two classes of bug:
#
# CLASS A — Fake compound in terms.json:
#   A surface S is registered that equals surface A + surface B (both also in
#   the dict with different IDs). E.g. "はいい": "v_ii" when "は" (p_wa) and
#   "いい" (v_ii) are both registered — the compound swallows the は particle.
#   Fix: remove the compound entry, add a space in story.md.
#
# CLASS B — Prefix collision in story text:
#   Two surfaces S1 (short) and S2 (long, starts with S1, different id) are
#   both in the dict. S2 appears in story text at a position where the char
#   immediately AFTER S2 equals the first char of S2's tail (S2[len(S1):]).
#   This means S2 has "stolen" that tail-char from the next intended term.
#   E.g. "はい" (p_hai) + "い" follows → was really "は" (p_wa) + "いい" (v_ii).
#   Fix: add a space in story.md between the short surface and what follows.

set -euo pipefail

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

[[ -z "$FILE" ]] && exit 0
[[ ! "$FILE" =~ (story\.md|terms\.json)$ ]] && exit 0

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

python3 - "$FILE" "$REPO_ROOT" << 'PYEOF'
import json, sys, os, re, glob

file_path = sys.argv[1]
repo_root = sys.argv[2]

# Load all glossary IDs — a compound whose ID exists in a glossary is a real
# vocabulary item, not an accidental concatenation.
glossary_ids = set()
for gpath in glob.glob(os.path.join(repo_root, 'data/*/glossary.*.json')):
    try:
        with open(gpath) as f:
            data_g = json.load(f)
            entries = data_g.get('entries', data_g) if isinstance(data_g, dict) else data_g
            if isinstance(entries, list):
                for e in entries:
                    if isinstance(e, dict) and 'id' in e:
                        glossary_ids.add(e['id'])
    except Exception:
        pass

# Particle/grammar IDs from shared data files (particles.json, characters.json, etc.)
for pattern in ['data/shared/*.json', 'shared/*.json']:
    for spath in glob.glob(os.path.join(repo_root, pattern)):
        try:
            with open(spath) as f:
                data_s = json.load(f)
                if isinstance(data_s, dict):
                    # Try common list keys: entries, particles, characters
                    for key in ('entries', 'particles', 'characters'):
                        items = data_s.get(key)
                        if isinstance(items, list):
                            for e in items:
                                if isinstance(e, dict) and 'id' in e:
                                    glossary_ids.add(e['id'])
        except Exception:
            pass

story_dir = os.path.dirname(file_path)
terms_path = os.path.join(story_dir, 'terms.json')
story_path = os.path.join(story_dir, 'story.md')

if not os.path.exists(terms_path) or not os.path.exists(story_path):
    sys.exit(0)

try:
    with open(terms_path) as f:
        data = json.load(f)
    terms_raw = data.get('terms', data) if isinstance(data, dict) else {}
except Exception:
    sys.exit(0)

def get_id(val):
    if isinstance(val, str): return val
    if isinstance(val, dict): return val.get('id', '')
    return ''

surface_to_id = {}
for surface, val in terms_raw.items():
    tid = get_id(val)
    if surface and tid:
        surface_to_id[surface] = tid

# Read Japanese section of story (before English Translation heading)
try:
    with open(story_path) as f:
        raw = f.read()
except Exception:
    sys.exit(0)

jp_lines = []
for line in raw.split('\n'):
    if re.match(r'###\s+English Translation', line):
        break
    jp_lines.append(line)

errors = []
story_name = os.path.basename(story_dir)

# ── CLASS A: Fake compound surface ──────────────────────────────────────────
# A surface S whose id matches no "atomic" word but equals surface A + surface B
# (both in dict with the SAME id as S or a related id). More broadly: S is a
# concatenation of two surfaces A and B that are BOTH in the dict independently.
all_surfaces = list(surface_to_id.keys())
for s in all_surfaces:
    if len(s) < 2:
        continue
    sid = surface_to_id[s]
    # Skip compounds whose ID is a real glossary/particle entry — these are
    # legitimate vocabulary items (e.g. 北東 = v_hokutou, でも = p_demo_but),
    # not accidental concatenations of shorter surfaces.
    if sid in glossary_ids:
        continue
    # Try every split point
    for split in range(1, len(s)):
        a, b = s[:split], s[split:]
        if a in surface_to_id and b in surface_to_id:
            aid, bid = surface_to_id[a], surface_to_id[b]
            if aid != sid and bid != sid:
                # s is a concatenation of two independently-registered surfaces
                errors.append(
                    f"  ERROR terms.json: fake compound surface '{s}' ({sid}) "
                    f"= '{a}' ({aid}) + '{b}' ({bid}). "
                    f"Remove '{s}' from terms.json and add a space in story.md."
                )
                break  # one report per surface is enough

# ── CLASS B: Prefix collision in story text ──────────────────────────────────
# For each pair (S1, S2) where S2.startswith(S1), len(S2)>len(S1), different ids:
# Search story text for S2 followed immediately by the first char of S2's tail
# (S2[len(S1):][0]). That means S2 stole that char from the next intended term.
for s1, id1 in surface_to_id.items():
    for s2, id2 in surface_to_id.items():
        if s2 == s1 or not s2.startswith(s1) or id1 == id2:
            continue
        tail = s2[len(s1):]  # chars S2 grabs beyond S1
        if not tail:
            continue
        tail_first = tail[0]
        # Search story lines for S2 followed immediately by tail_first
        pattern = re.escape(s2) + re.escape(tail_first)
        for line_num, line in enumerate(jp_lines, 1):
            if re.search(pattern, line):
                errors.append(
                    f"  ERROR story.md line {line_num}: prefix-collision — "
                    f"'{s2}' ({id2}) will match before '{s1}' ({id1}) and its "
                    f"tail '{tail}' overlaps the next intended term "
                    f"(char after '{s2}' = '{tail_first}' = tail[0]). "
                    f"Add a space in story.md after '{s1}'."
                )

# ── CLASS C: Full coverage — untagged Japanese tokens ───────────────────────
# Simulate the text-processor's longest-match scan on story text.
# Any Japanese character that remains unmatched after all terms.json keys
# are applied is an untagged token — it will render as plain text with no chip.
#
# Algorithm mirrors text-processor.js:
#   1. Sort all surfaces longest-first.
#   2. Multi-char surfaces: replace ALL occurrences with sentinel.
#   3. Single-char kana surfaces: replace only when NOT followed by kana
#      (single-char lookahead rule).
#   4. Flag any remaining hiragana / katakana / kanji in story text.

def is_kana(c):
    return '぀' <= c <= 'ヿ'

def is_japanese_char(c):
    return ('぀' <= c <= 'ゟ' or
            '゠' <= c <= 'ヿ' or
            '一' <= c <= '鿿' or
            '豈' <= c <= '﫿')

PUNCT = set('。、！？「」『』（）〜…・～♪ 　\n\r\t')

def simulate_coverage(text, surface_map):
    """
    Left-to-right longest-match simulation — mirrors text-processor.js.

    At each position, the longest surface that starts there wins.
    Single-char kana (particles) always count as covered if the key EXISTS in
    surface_map — their actual lookahead rule only affects rendering aesthetics,
    not whether the character is taggable. What matters for coverage is whether
    a terms.json key CAN cover the character.
    """
    # Sort all surfaces longest-first (ties: kana-only before kanji, mirrors processor)
    sorted_surfaces = sorted(
        surface_map.keys(),
        key=lambda s: (-len(s), 0 if not any('一' <= c <= '鿿' for c in s) else 1)
    )
    single_char_kana = set(s for s in surface_map if len(s) == 1 and is_kana(s))

    unmatched_spans = []
    i = 0
    n = len(text)

    while i < n:
        c = text[i]

        # Skip punctuation, spaces, non-Japanese
        if not is_japanese_char(c) or c in PUNCT:
            i += 1
            continue

        # Try to match the longest surface starting at position i
        matched_len = 0
        for surface in sorted_surfaces:
            slen = len(surface)
            if text[i:i+slen] == surface:
                matched_len = slen
                break  # longest-first, so first match is best

        if matched_len > 0:
            i += matched_len
        elif is_kana(c) and c in single_char_kana:
            # Single-char kana exists in terms.json — will render correctly in context
            i += 1
        else:
            # Genuinely unmatched
            unmatched_spans.append((i, c))
            i += 1

    # Group consecutive unmatched positions into spans with context
    grouped = []
    j = 0
    while j < len(unmatched_spans):
        pos, ch = unmatched_spans[j]
        chars = [ch]
        while j + 1 < len(unmatched_spans) and unmatched_spans[j+1][0] == pos + len(chars):
            chars.append(unmatched_spans[j+1][1])
            j += 1
        span = ''.join(chars)
        ctx_start = max(0, pos - 8)
        ctx_end = min(n, pos + len(span) + 8)
        context = text[ctx_start:ctx_end].replace('\n', '↵')
        grouped.append((span, context))
        j += 1
    return grouped

# Build surface map (surface → id)
coverage_surface_map = {s: tid for s, tid in surface_to_id.items() if s}

# Extract Japanese story lines (stop before English Translation)
jp_text_lines = []
in_jp_section = False
for line in jp_lines:
    # Skip markdown headings and horizontal rules and English lines
    stripped = line.strip()
    if stripped.startswith('#') or stripped == '---' or stripped == '':
        continue
    if stripped.startswith('**') and not any(is_japanese_char(c) for c in stripped):
        continue  # English-only bold lines (The End, etc.)
    jp_text_lines.append(line)

jp_story_text = '\n'.join(jp_text_lines)

unmatched = simulate_coverage(jp_story_text, coverage_surface_map)

for span, context in unmatched:
    errors.append(
        f"  CLASS C — untagged token '{span}' in: …{context}…\n"
        f"    → Add a terms.json key for '{span}' (or compound containing it)"
    )

if errors:
    # Deduplicate
    seen = set()
    unique = []
    for e in errors:
        if e not in seen:
            seen.add(e)
            unique.append(e)
    print(f"STORY TOKENIZATION ERRORS in {story_name}:", file=sys.stderr)
    for e in unique:
        print(e, file=sys.stderr)
    sys.exit(1)

PYEOF

RC=$?
if [[ $RC -eq 1 ]]; then exit 2; fi
exit 0
