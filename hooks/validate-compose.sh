#!/bin/bash
# Hook: validate-compose.sh
# Runs on: PostToolUse (Edit|Write)
# Purpose: Compose-specific validation. Covers: FM #20, #24, #25c

set -euo pipefail

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

[[ -z "$FILE" ]] && exit 0
[[ ! "$FILE" =~ \.(json)$ ]] && exit 0
[[ ! "$FILE" =~ compose ]] && exit 0

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

if 'prompts' not in content:
    sys.exit(0)

errors = []
lesson_id = content.get('lesson', '')

# Load manifest for ordering
manifest_path = os.path.join(repo_root, 'manifest.json')
lesson_order = {}
if os.path.exists(manifest_path):
    with open(manifest_path) as f:
        manifest = json.load(f)
    ordinal = 0
    for lk in ['N5', 'N4', 'N3', 'N2', 'N1']:
        ld = manifest.get('data', {}).get(lk, {})
        for l in ld.get('lessons', []):
            if l.get('id'):
                lesson_order[l['id']] = ordinal
                ordinal += 1
        for g in ld.get('grammar', []):
            if g.get('id'):
                lesson_order[g['id']] = lesson_order.get(g.get('unlocksAfter', ''), ordinal) + 0.5

# FM #20: Check particles are gated
particles_path = os.path.join(repo_root, 'shared/particles.json')
if os.path.exists(particles_path):
    with open(particles_path) as f:
        pdata = json.load(f)
    for p in pdata.get('particles', []):
        pid = p['id']
        intro = p.get('introducedIn', '')
        if pid in content.get('particles', []) and intro and lesson_id:
            p_ord = lesson_order.get(intro)
            l_ord = lesson_order.get(lesson_id)
            if p_ord is not None and l_ord is not None and p_ord > l_ord:
                errors.append(f"  particles: '{pid}' (introducedIn: {intro}) out of scope for {lesson_id}")

# FM #24: Targets should have kanji
cjk = re.compile(r'[\u4e00-\u9fff]')
id_surface = {}
for gpath in glob.glob(os.path.join(repo_root, 'data/*/glossary.*.json')):
    try:
        with open(gpath) as f:
            data_g = json.load(f); entries = data_g.get("entries", data_g) if isinstance(data_g, dict) else data_g
            for entry in (entries if isinstance(entries, list) else []):
                if entry.get('id'):
                    id_surface[entry['id']] = entry.get('surface', '')
    except:
        pass

for i, prompt in enumerate(content.get('prompts', [])):
    for j, target in enumerate(prompt.get('targets', [])):
        tid = target.get('id', '')
        if tid in id_surface and not cjk.search(id_surface[tid]):
            errors.append(f"  prompts[{i}].targets[{j}]: '{tid}' has no kanji — scoring is kanji-based")

# FM #25c: No closing language if challengePrompts non-empty
if content.get('challengePrompts'):
    close_re = re.compile(r'\b(close|wrap up|conclude|finish|end)\b', re.I)
    for i, prompt in enumerate(content.get('prompts', [])):
        text = prompt.get('prompt', '')
        m = close_re.search(text)
        if m:
            errors.append(f"  prompts[{i}]: Uses '{m.group()}' but challengePrompts exists")

if errors:
    print(f"COMPOSE ERRORS in {os.path.basename(file_path)}:", file=sys.stderr)
    for err in errors:
        print(err, file=sys.stderr)
    sys.exit(1)
PYEOF

if [[ $? -ne 0 ]]; then exit 2; fi
