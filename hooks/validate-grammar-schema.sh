#!/bin/bash
# Hook: validate-grammar-schema.sh
# Runs on: PostToolUse (Edit|Write)
# Purpose: Catches silent grammar render failures. Covers: FM #56-56f

set -euo pipefail

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

[[ -z "$FILE" ]] && exit 0
[[ ! "$FILE" =~ \.(json)$ ]] && exit 0
[[ "$FILE" =~ (manifest|glossary|conjugation_rules|counter_rules|particles|characters|helper-vocab|package) ]] && exit 0

python3 - "$FILE" << 'PYEOF'
import json, sys, os

file_path = sys.argv[1]

try:
    with open(file_path) as f:
        content = json.load(f)
except:
    sys.exit(0)

if content.get('type') != 'grammar':
    sys.exit(0)

errors = []
VALID_COLORS = {'topic', 'subject', 'object', 'predicate', 'connector', 'modifier', 'verb', 'adverb'}

for i, section in enumerate(content.get('sections', [])):
    stype = section.get('type', '')
    sp = f"sections[{i}] ({stype})"

    if stype == 'annotatedExample':
        if 'examples' not in section:
            errors.append(f"  {sp}: Missing 'examples[]' — renders EMPTY")
        if 'sentence' in section or 'translation' in section:
            errors.append(f"  {sp}: Wrong fields 'sentence'/'translation' — use 'examples[]'")

    if stype == 'grammarComparison':
        if 'items' not in section:
            errors.append(f"  {sp}: Missing 'items[]' — renders EMPTY")
        if 'itemA' in section or 'itemB' in section:
            errors.append(f"  {sp}: Wrong fields 'itemA'/'itemB' — use 'items[]'")

    if stype == 'fillSlot':
        for j, item in enumerate(section.get('items', [])):
            if 'sentence' in item:
                errors.append(f"  {sp}.items[{j}]: Has 'sentence' — use 'before'/'after'")
            if 'before' not in item or 'after' not in item:
                errors.append(f"  {sp}.items[{j}]: Missing 'before'/'after'")

    if stype == 'grammarRule':
        for j, chip in enumerate(section.get('pattern', [])):
            if 'role' in chip:
                errors.append(f"  {sp}.pattern[{j}]: 'role' is wrong — use 'color'")
            if 'gloss' in chip:
                errors.append(f"  {sp}.pattern[{j}]: 'gloss' is wrong — use 'label'")
            if 'color' not in chip:
                errors.append(f"  {sp}.pattern[{j}]: Missing 'color' — chip renders grey")
            elif chip['color'] not in VALID_COLORS:
                errors.append(f"  {sp}.pattern[{j}]: Invalid color '{chip['color']}'")
            if 'label' not in chip:
                errors.append(f"  {sp}.pattern[{j}]: Missing 'label' — chip shows no text")

    if stype == 'sentenceTransform':
        for j, item in enumerate(section.get('items', [])):
            if 'choices' not in item:
                errors.append(f"  {sp}.items[{j}]: Missing 'choices[]' — CRASHES renderer (blank screen)")
            elif not isinstance(item['choices'], list) or len(item['choices']) != 4:
                errors.append(f"  {sp}.items[{j}]: 'choices' must have 4 items")

    if stype == 'conversation':
        for j, line in enumerate(section.get('lines', [])):
            if 'jp' in line and ('terms' not in line or not line['terms']):
                errors.append(f"  {sp}.lines[{j}]: No terms[] — text unclickable")

# meta.particles must be strings not IDs
for j, p in enumerate(content.get('meta', {}).get('particles', [])):
    if isinstance(p, str) and p.startswith('p_'):
        errors.append(f"  meta.particles[{j}]: '{p}' is an ID — must be Japanese string")

if errors:
    print(f"GRAMMAR SCHEMA ERRORS in {os.path.basename(file_path)}:", file=sys.stderr)
    for err in errors:
        print(err, file=sys.stderr)
    sys.exit(1)
PYEOF

if [[ $? -ne 0 ]]; then exit 2; fi
