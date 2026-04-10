#!/bin/bash
# Hook: validate-register.sh
# Runs on: PostToolUse (Edit|Write)
# Purpose: Polite/casual register enforcement. Covers: FM #44-46

set -euo pipefail

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

[[ -z "$FILE" ]] && exit 0
[[ ! "$FILE" =~ \.(json)$ ]] && exit 0
[[ "$FILE" =~ (manifest|glossary|conjugation_rules|counter_rules|particles|characters|helper-vocab|package) ]] && exit 0

python3 - "$FILE" << 'PYEOF'
import json, re, sys, os

file_path = sys.argv[1]

try:
    with open(file_path) as f:
        content = json.load(f)
except:
    sys.exit(0)

# Only check lessons
if content.get('type') in ('grammar',):
    sys.exit(0)
content_id = content.get('id', '')
if 'compose' in content_id.lower():
    sys.exit(0)

m = re.match(r'N(\d+)\.(\d+)', content_id)
if not m:
    sys.exit(0)

level_num, lesson_num = int(m.group(1)), int(m.group(2))
casual_available = (level_num == 5 and lesson_num >= 10) or level_num < 5

POLITE = re.compile(r'(ます|ました|ません|ませんでした|です|でした|ましょう|ください)')
# Casual markers: plain copula, plain past copula, plain negative, explanatory,
# plain past + sentence particles (but not polite ました+particle),
# dictionary form + sentence particles, casual conjecture, casual question
PLAIN = re.compile(
    r'(だ[。、？！\s]|だね|だよ|だな[。、？\s]|だった|だろう|だけど'
    r'|ない[。、？！\s]|なかった|んだ'
    r'|(?<!まし)たよ|(?<!まし)たね|(?<!まし)たの[。、？！\s]|(?<!まし)た[。？！](?![\s]*で)'
    r'|るよ[。、？！\s]|るね[。、？！\s]|るの[。？]'
    r'|じゃない|かな[。、？\s]'
    r'|(?<!です)たい[。、？！\s]|たいよ|たいから|たいけど'
    r'|(?<!ましょ)うよ[。、？！\s]|(?<!ましょ)おうか[。、？！\s])'
)

errors = []
conversations = [s for s in content.get('sections', []) if s.get('type') == 'conversation']
casual_count = 0

for i, conv in enumerate(conversations):
    lines = conv.get('lines', [])
    if not lines:
        continue
    polite_n = sum(1 for l in lines if POLITE.search(l.get('jp', '')))
    plain_n = sum(1 for l in lines if PLAIN.search(l.get('jp', '')))

    if plain_n > polite_n:
        casual_count += 1

    if not casual_available and plain_n > polite_n:
        errors.append(f"  Conv {i+1} ('{conv.get('title', '')}'): casual forms before N5.10 — must be 100% polite")

if casual_available and casual_count == 0 and len(conversations) >= 2:
    errors.append(f"  {content_id}: {len(conversations)} conversations, 0 casual — N5.10+ requires ≥1")

if errors:
    print(f"REGISTER ERRORS in {os.path.basename(file_path)}:", file=sys.stderr)
    for err in errors:
        print(err, file=sys.stderr)
    sys.exit(1)
PYEOF

if [[ $? -ne 0 ]]; then exit 2; fi
