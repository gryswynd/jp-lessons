#!/bin/bash
# Hook: validate-grammar-schema.sh
# Purpose: Catches the silent-failure grammar schema errors where wrong field
#          names cause sections to render completely empty with no error.
#
# Validates: FM #56 (annotatedExample uses examples[], grammarComparison uses items[]),
#            FM #56b (fillSlot uses before/after not sentence),
#            FM #56c (pattern chips use color/label not role/gloss),
#            FM #56d (meta.particles uses strings not IDs),
#            FM #56e (sentenceTransform must have choices[]),
#            FM #56f (grammar conversation terms must be tagged)

set -euo pipefail

FILE="$1"

[[ "$FILE" =~ \.(json)$ ]] || exit 0
[[ "$FILE" =~ (manifest|glossary|conjugation_rules|counter_rules|particles|characters|helper-vocab|package) ]] && exit 0

python3 << 'PYEOF'
import json
import re
import sys
import os

file_path = sys.argv[1] if len(sys.argv) > 1 else ''
if not file_path or not os.path.exists(file_path):
    sys.exit(0)

try:
    with open(file_path) as f:
        content = json.load(f)
except:
    sys.exit(0)

# Only check grammar files
if content.get('type') != 'grammar':
    sys.exit(0)

errors = []

VALID_COLORS = {'topic', 'subject', 'object', 'predicate', 'connector', 'modifier', 'verb', 'adverb'}

for i, section in enumerate(content.get('sections', [])):
    stype = section.get('type', '')
    spath = f"sections[{i}] ({stype})"

    # FM #56: annotatedExample must use examples[], not sentence/parts/translation
    if stype == 'annotatedExample':
        if 'examples' not in section:
            errors.append(f"  {spath}: Missing 'examples[]' — section will render EMPTY. "
                         f"Do not use 'sentence', 'translation', or top-level 'parts'.")
        if 'sentence' in section or 'translation' in section:
            errors.append(f"  {spath}: Has 'sentence'/'translation' — wrong fields. Use 'examples[]' array.")
        if 'parts' in section and 'examples' not in section:
            errors.append(f"  {spath}: Has top-level 'parts[]' — wrong. Wrap in 'examples: [{{parts, en}}]'.")

    # FM #56: grammarComparison must use items[], not itemA/itemB
    if stype == 'grammarComparison':
        if 'items' not in section:
            errors.append(f"  {spath}: Missing 'items[]' — section will render EMPTY. "
                         f"Do not use 'itemA'/'itemB'.")
        if 'itemA' in section or 'itemB' in section:
            errors.append(f"  {spath}: Has 'itemA'/'itemB' — wrong fields. Use 'items[]' array.")

    # FM #56b: fillSlot must use before/after, not sentence with ___
    if stype == 'fillSlot':
        for j, item in enumerate(section.get('items', [])):
            if 'sentence' in item:
                errors.append(f"  {spath}.items[{j}]: Has 'sentence' field — wrong. "
                             f"Use 'before' and 'after' pre-split strings.")
            if 'before' not in item or 'after' not in item:
                errors.append(f"  {spath}.items[{j}]: Missing 'before'/'after' — "
                             f"renderer requires pre-split strings.")

    # FM #56c: grammarRule pattern chips must use color/label/text, NOT role/gloss
    if stype == 'grammarRule':
        for j, chip in enumerate(section.get('pattern', [])):
            if 'role' in chip:
                errors.append(f"  {spath}.pattern[{j}]: Has 'role' — wrong field for pattern chips. "
                             f"Use 'color' (from {VALID_COLORS}).")
            if 'gloss' in chip:
                errors.append(f"  {spath}.pattern[{j}]: Has 'gloss' — wrong field for pattern chips. "
                             f"Use 'label' (short text shown in chip).")
            if 'color' in chip and chip['color'] not in VALID_COLORS:
                errors.append(f"  {spath}.pattern[{j}]: color '{chip['color']}' not valid. "
                             f"Must be one of: {', '.join(sorted(VALID_COLORS))}")
            if 'label' not in chip:
                errors.append(f"  {spath}.pattern[{j}]: Missing 'label' — chip will show no text.")
            if 'color' not in chip:
                errors.append(f"  {spath}.pattern[{j}]: Missing 'color' — chip will render grey.")

    # FM #56e: sentenceTransform items must have choices[] with 4 strings
    if stype == 'sentenceTransform':
        for j, item in enumerate(section.get('items', [])):
            if 'choices' not in item:
                errors.append(f"  {spath}.items[{j}]: Missing 'choices[]' — CRASHES renderer "
                             f"(blank screen, TypeError on sort).")
            elif not isinstance(item['choices'], list) or len(item['choices']) != 4:
                errors.append(f"  {spath}.items[{j}]: 'choices' must have exactly 4 strings, "
                             f"got {len(item.get('choices', []))}.")

    # FM #56f: grammar conversation sections need terms[] on every line
    if stype == 'conversation':
        for j, line in enumerate(section.get('lines', [])):
            if 'jp' in line and ('terms' not in line or not line['terms']):
                errors.append(f"  {spath}.lines[{j}]: Grammar conversation line has jp but no terms[] — "
                             f"text will be unclickable (no highlights, no modals).")

# FM #56d: meta.particles must be character strings, not particle IDs
meta_particles = content.get('meta', {}).get('particles', [])
for j, p in enumerate(meta_particles):
    if isinstance(p, str) and p.startswith('p_'):
        errors.append(f"  meta.particles[{j}]: '{p}' is a particle ID — must be a Japanese character "
                     f"string (e.g. 'のに', not 'p_noni'). IDs never match span.textContent, "
                     f"so particle highlighting is silently broken.")

if errors:
    print(f"GRAMMAR SCHEMA ERRORS in {os.path.basename(file_path)}:")
    for err in errors:
        print(err)
    sys.exit(1)

PYEOF "$FILE"
