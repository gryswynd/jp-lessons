#!/bin/bash
# Hook: validate-quiz-answers.sh
# Runs on: PostToolUse (Edit|Write)
# Purpose: Catches nonsensical quiz answers. Covers: FM #8 (partial)
# - Punctuation-only answers in fillSlot/MCQ items
# - Answer text duplicated at start of `after` field in fillSlot items

set -euo pipefail

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

[[ -z "$FILE" ]] && exit 0
[[ ! "$FILE" =~ \.(json)$ ]] && exit 0
[[ "$FILE" =~ (manifest|glossary|conjugation_rules|counter_rules|particles|characters|helper-vocab|package) ]] && exit 0

python3 - "$FILE" << 'PYEOF'
import json, sys, re

file_path = sys.argv[1]

try:
    with open(file_path) as f:
        content = json.load(f)
except:
    sys.exit(0)

if content.get('type') != 'grammar':
    sys.exit(0)

errors = []
PUNCT_ONLY = re.compile(r'^[\s、。！？,.\-—…～]+$')

for i, section in enumerate(content.get('sections', [])):
    stype = section.get('type', '')
    items = section.get('items', [])

    if stype not in ('fillSlot', 'drills'):
        continue

    for j, item in enumerate(items):
        answer = item.get('answer', '')
        after = item.get('after', '')
        kind = item.get('kind', stype)
        loc = f"sections[{i}].items[{j}] ({kind})"

        # Check 1: Punctuation-only answer
        if isinstance(answer, str) and PUNCT_ONLY.match(answer):
            errors.append(f"  {loc}: Answer is pure punctuation '{answer}' — quiz should test grammar, not punctuation")

        # Check 2: Answer duplicated at start of after field (fillSlot only)
        if stype == 'fillSlot' and isinstance(answer, str) and isinstance(after, str):
            if answer and after.startswith(answer):
                errors.append(f"  {loc}: Answer '{answer}' already appears at start of 'after' field '{after[:20]}...' — would create duplicate text")

if errors:
    print("QUIZ ANSWER VALIDATION FAILED in " + file_path + ":")
    print("\n".join(errors))
    sys.exit(1)

sys.exit(0)
PYEOF
