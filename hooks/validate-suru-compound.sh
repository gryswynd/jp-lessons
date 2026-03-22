#!/bin/bash
# Hook: validate-suru-compound.sh
# Runs on: PostToolUse (Edit|Write)
# Purpose: Catches noun/noun_suru terms tagged with a verb conjugation form.
#          These must be split: plain noun tag + separate {v_suru, form}.
#          Both gtype:"noun_suru" (N4+) and gtype:"noun" (N5 suru-compound nouns)
#          trigger this check. Copula forms (copula_past, da_past, etc.) are exempt.
# Example violation: {"id": "v_benkyou", "form": "te_form"}
# Correct pattern:   "v_benkyou", {"id": "v_suru", "form": "te_form"}

set -euo pipefail

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

[[ -z "$FILE" ]] && exit 0
[[ ! "$FILE" =~ \.(json)$ ]] && exit 0
[[ "$FILE" =~ (manifest|glossary|conjugation_rules|counter_rules|particles|characters|helper-vocab|package) ]] && exit 0

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

python3 - "$FILE" "$REPO_ROOT" << 'PYEOF'
import json, sys, os, glob

file_path = sys.argv[1]
repo_root = sys.argv[2]

try:
    with open(file_path) as f:
        content = json.load(f)
except:
    sys.exit(0)

# Build id → gtype map from all glossaries
gtype_map = {}
for gpath in glob.glob(os.path.join(repo_root, 'data/*/glossary.*.json')):
    try:
        with open(gpath) as f:
            data_g = json.load(f)
            entries = data_g.get('entries', data_g) if isinstance(data_g, dict) else data_g
            for entry in (entries if isinstance(entries, list) else []):
                eid = entry.get('id', '')
                gt = entry.get('gtype', '')
                if eid and gt:
                    gtype_map[eid] = gt
    except:
        pass

# Copula forms are legitimately applied to nouns; all others are verb/adj forms
# that should never appear on a plain noun gtype.
COPULA_FORMS = {
    'copula_past', 'copula_negative', 'copula_past_negative',
    'da_past', 'da_negative', 'da_past_negative', 'polite_past_copula',
}
NOUN_GTYPES = {'noun', 'noun_suru'}

errors = []

def check_terms(terms, path):
    for i, t in enumerate(terms):
        if not isinstance(t, dict):
            continue
        tid = t.get('id', '')
        form = t.get('form')
        if not tid or not form:
            continue
        if form in COPULA_FORMS:
            continue
        gt = gtype_map.get(tid, '')
        if gt in NOUN_GTYPES:
            errors.append(
                f"  {path}[{i}]: '{tid}' ({gt}) used with verb form '{form}' — "
                f"split as plain '{tid}' + {{\"id\": \"v_suru\", \"form\": \"{form}\"}}"
            )

def walk(obj, path='root'):
    if isinstance(obj, dict):
        if 'terms' in obj and isinstance(obj['terms'], list):
            check_terms(obj['terms'], f'{path}.terms')
        for k, v in obj.items():
            walk(v, f'{path}.{k}')
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            walk(item, f'{path}[{i}]')

walk(content)

if errors:
    print(f"SURU COMPOUND ERRORS in {os.path.basename(file_path)}:", file=sys.stderr)
    for err in errors[:15]:
        print(err, file=sys.stderr)
    sys.exit(1)
PYEOF

if [[ $? -ne 0 ]]; then exit 2; fi
