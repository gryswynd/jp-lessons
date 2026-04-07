#!/bin/bash
# Hook: validate-particle-context.sh
# Runs on: PostToolUse (Edit|Write)
# Purpose: Particle disambiguation. Covers: FM #34-37, #58

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

errors = []

CLAUSE_ENDINGS_GA = re.compile(
    r'(ます|ました|ません|ませんでした|です|でした|た|だ|ない|なかった|たい|い|かった)が'
)
CLAUSE_BEFORE_KARA = re.compile(
    r'(ます|ました|ません|です|でした|た|だ|ない|なかった|たい|い|かった)から'
)

def check_line(jp, terms, path):
    if not jp or not terms:
        return

    # FM #36: Sentence-initial でも should be p_demo_but
    if jp.strip().startswith('でも'):
        for i, t in enumerate(terms):
            tid = t if isinstance(t, str) else t.get('id', '')
            if tid == 'p_demo':
                errors.append(f"  ERROR {path}.terms[{i}]: p_demo but でも is sentence-initial → use p_demo_but")

    # FM #58: Question missing p_ka — covers casual (？) and polite (か。 / か！) questions
    jp_stripped = jp.rstrip()
    if (jp_stripped.endswith('？') or jp_stripped.endswith('?') or
            jp_stripped.endswith('か。') or jp_stripped.endswith('か！')):
        has_ka = any((t if isinstance(t, str) else t.get('id', '')) == 'p_ka' for t in terms)
        if not has_ka:
            errors.append(f"  ERROR {path}: Question sentence missing p_ka in terms")

    # FM #34: が after clause-final → should be p_ga_but
    if CLAUSE_ENDINGS_GA.search(jp):
        for i, t in enumerate(terms):
            tid = t if isinstance(t, str) else t.get('id', '')
            if tid == 'p_ga':
                errors.append(f"  WARN {path}.terms[{i}]: p_ga — check if this が follows a clause-final form (if so → p_ga_but)")

    # FM #35: から after clause → should be p_kara_because
    if CLAUSE_BEFORE_KARA.search(jp):
        for i, t in enumerate(terms):
            tid = t if isinstance(t, str) else t.get('id', '')
            if tid == 'p_kara':
                errors.append(f"  WARN {path}.terms[{i}]: p_kara — check if this から follows a verb/adj/です (if so → p_kara_because)")

    # FM #35b: p_kara used after て-form → should be p_tekara (sequential 'after doing')
    # FM #35b-ext: てから/でから in jp but p_tekara missing entirely from terms[]
    jp_nospace = jp.replace(' ', '')
    if 'てから' in jp_nospace or 'でから' in jp_nospace:
        for i, t in enumerate(terms):
            tid = t if isinstance(t, str) else t.get('id', '')
            if tid == 'p_kara':
                errors.append(f"  ERROR {path}.terms[{i}]: p_kara but jp contains てから/でから → use p_tekara (sequential 'after doing', G19)")
        has_tekara = any((t if isinstance(t, str) else t.get('id', '')) == 'p_tekara' for t in terms)
        if not has_tekara:
            errors.append(f"  ERROR {path}: jp has てから/でから but p_tekara missing from terms[] — add p_tekara after the て-form (G19)")

    # FM #37: と after 」or 思う → should be p_to_quote
    if '」と' in jp or re.search(r'と(思|おも|知|し)', jp):
        for i, t in enumerate(terms):
            tid = t if isinstance(t, str) else t.get('id', '')
            if tid == 'p_to':
                errors.append(f"  WARN {path}.terms[{i}]: p_to — check if this と follows quoted speech/思う (if so → p_to_quote)")

    # FM #34b: Sentence-ending の after plain form → should be p_no_question, not p_no
    jp_nospace2 = jp.replace(' ', '')
    if re.search(r'[たるいなだ]の[？?。！!]?\s*$', jp_nospace2):
        for i, t in enumerate(terms):
            tid = t if isinstance(t, str) else t.get('id', '')
            if tid == 'p_no':
                errors.append(f"  WARN {path}.terms[{i}]: p_no — check if this の is sentence-ending question/explanation particle (if so → p_no_question)")

def walk(obj, path="root"):
    if isinstance(obj, dict):
        if 'jp' in obj and 'terms' in obj:
            check_line(obj['jp'], obj['terms'], path)
        # Also check Q&A question fields — these have q/a/terms but no jp key
        if 'q' in obj and 'terms' in obj:
            check_line(obj['q'], obj['terms'], path + '.q')
        for k, v in obj.items():
            walk(v, f"{path}.{k}")
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            walk(item, f"{path}[{i}]")

walk(content)

if errors:
    hard_errors = [e for e in errors if 'ERROR' in e]
    warns = [e for e in errors if 'WARN' in e]
    if hard_errors:
        print(f"PARTICLE ERRORS in {os.path.basename(file_path)}:", file=sys.stderr)
        for e in hard_errors:
            print(e, file=sys.stderr)
    if warns:
        print(f"PARTICLE WARNINGS in {os.path.basename(file_path)}:", file=sys.stderr)
        for w in warns[:10]:
            print(w, file=sys.stderr)
    sys.exit(1 if hard_errors else 0)
PYEOF

RC=$?
if [[ $RC -eq 1 ]]; then exit 2; fi
exit 0
