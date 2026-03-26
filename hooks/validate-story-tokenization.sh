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
import json, sys, os, re

file_path = sys.argv[1]
repo_root = sys.argv[2]

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
