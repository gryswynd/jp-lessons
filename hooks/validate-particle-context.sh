#!/bin/bash
# Hook: validate-particle-context.sh
# Purpose: Catches particle disambiguation errors — the #1 source of
#          "vocab showing something different than what was written."
#
# Validates: FM #34 (が p_ga vs p_ga_but), FM #35 (から p_kara vs p_kara_because),
#            FM #36 (でも p_demo vs p_demo_but), FM #37 (と p_to vs p_to_quote),
#            FM #58 (casual question missing p_ka)
#
# These are the disambiguation rules that agents forget most often.

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

errors = []

# Clause-final patterns that precede が/から meaning "but"/"because"
CLAUSE_ENDINGS = re.compile(
    r'(ます|ました|ません|ませんでした|です|でした|'
    r'[うくすつぬふむるぐずづぶぷ]|'  # dictionary form endings
    r'た|だ|ない|なかった|たい|'
    r'い|かった)が'  # i-adj endings before が
)

CLAUSE_BEFORE_KARA = re.compile(
    r'(ます|ました|ません|です|でした|'
    r'た|だ|ない|なかった|たい|'
    r'い|かった)から'
)

def check_line(jp, terms, path):
    if not jp or not terms:
        return

    # --- FM #34: が disambiguation ---
    # If が appears after a clause-final form, it should be p_ga_but not p_ga
    if CLAUSE_ENDINGS.search(jp):
        # Check if p_ga is used when p_ga_but should be
        for i, term in enumerate(terms):
            tid = term if isinstance(term, str) else term.get('id', '')
            if tid == 'p_ga':
                # This MIGHT be wrong — flag for review
                # Only flag if the jp text has clause-final+が pattern
                errors.append(
                    f"  WARNING: p_ga used at {path}.terms[{i}] — check if this が follows "
                    f"a clause-final form (ます/です/plain). If so, use p_ga_but instead.\n"
                    f"    jp: {jp[:80]}"
                )

    # --- FM #35: から disambiguation ---
    if CLAUSE_BEFORE_KARA.search(jp):
        for i, term in enumerate(terms):
            tid = term if isinstance(term, str) else term.get('id', '')
            if tid == 'p_kara':
                errors.append(
                    f"  WARNING: p_kara used at {path}.terms[{i}] — check if this から follows "
                    f"a verb/adjective/です. If so, use p_kara_because instead.\n"
                    f"    jp: {jp[:80]}"
                )

    # --- FM #36: でも disambiguation ---
    # Sentence-initial でも should be p_demo_but
    if jp.strip().startswith('でも'):
        for i, term in enumerate(terms):
            tid = term if isinstance(term, str) else term.get('id', '')
            if tid == 'p_demo':
                errors.append(
                    f"  ERROR: p_demo at {path}.terms[{i}] but でも is sentence-initial → use p_demo_but.\n"
                    f"    jp: {jp[:80]}"
                )

    # --- FM #37: と disambiguation ---
    # と after 」or after plain-form clause with 思/知 should be p_to_quote
    if '」と' in jp or re.search(r'と(思|おも|知|し)', jp):
        for i, term in enumerate(terms):
            tid = term if isinstance(term, str) else term.get('id', '')
            if tid == 'p_to':
                errors.append(
                    f"  WARNING: p_to at {path}.terms[{i}] — check if this と follows quoted speech "
                    f"or 思う/知る. If so, use p_to_quote instead.\n"
                    f"    jp: {jp[:80]}"
                )

    # --- FM #58: Casual question without p_ka ---
    if jp.rstrip().endswith('？') or jp.rstrip().endswith('?'):
        has_ka = any(
            (t if isinstance(t, str) else t.get('id', '')) == 'p_ka'
            for t in terms
        )
        if not has_ka:
            errors.append(
                f"  ERROR: Question sentence missing p_ka at {path}.\n"
                f"    jp: {jp[:80]}"
            )

def walk(obj, path="root"):
    if isinstance(obj, dict):
        if 'jp' in obj and 'terms' in obj:
            check_line(obj['jp'], obj['terms'], path)
        for key, val in obj.items():
            walk(val, f"{path}.{key}")
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            walk(item, f"{path}[{i}]")

walk(content)

if errors:
    print(f"PARTICLE DISAMBIGUATION ISSUES in {os.path.basename(file_path)}:")
    for err in errors[:15]:
        print(err)
    if len(errors) > 15:
        print(f"  ... and {len(errors) - 15} more issues")
    # Use exit 1 for ERRORs, exit 0 for WARNINGs only
    has_errors = any('ERROR:' in e for e in errors)
    sys.exit(1 if has_errors else 0)

PYEOF "$FILE"
