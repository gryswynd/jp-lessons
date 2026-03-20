#!/bin/bash
# Hook: validate-compose.sh
# Purpose: Catches compose-specific errors that break the composition experience.
#
# Validates: FM #20 (ungated particles), FM #24 (non-kanji targets),
#            FM #25c (close wording before challengePrompts)

set -euo pipefail

FILE="$1"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

[[ "$FILE" =~ \.(json)$ ]] || exit 0
[[ ! "$FILE" =~ compose ]] && exit 0

python3 << 'PYEOF'
import json
import re
import sys
import os

repo_root = os.environ.get('REPO_ROOT', '.')
file_path = sys.argv[1] if len(sys.argv) > 1 else ''
if not file_path or not os.path.exists(file_path):
    sys.exit(0)

try:
    with open(file_path) as f:
        content = json.load(f)
except:
    sys.exit(0)

# Must be a compose file
if 'prompts' not in content:
    sys.exit(0)

errors = []
lesson_id = content.get('lesson', '')

# Load manifest for lesson ordering
manifest_path = os.path.join(repo_root, 'manifest.json')
lesson_order = {}
if os.path.exists(manifest_path):
    with open(manifest_path) as f:
        manifest = json.load(f)
    ordinal = 0
    for level_key in ['N5', 'N4', 'N3', 'N2', 'N1']:
        level_data = manifest.get('data', {}).get(level_key, {})
        for lesson in level_data.get('lessons', []):
            lid = lesson.get('id', '')
            if lid:
                lesson_order[lid] = ordinal
                ordinal += 1
        for grammar in level_data.get('grammar', []):
            gid = grammar.get('id', '')
            unlocks = grammar.get('unlocksAfter', '')
            if gid:
                lesson_order[gid] = lesson_order.get(unlocks, ordinal) + 0.5

# FM #20: Check particles are gated
particles_path = os.path.join(repo_root, 'shared/particles.json')
if os.path.exists(particles_path):
    with open(particles_path) as f:
        pdata = json.load(f)
    particle_introduced = {}
    for p in pdata.get('particles', []):
        particle_introduced[p['id']] = p.get('introducedIn', '')

    for pid in content.get('particles', []):
        if pid in particle_introduced:
            intro = particle_introduced[pid]
            if intro and lesson_id:
                p_ord = lesson_order.get(intro)
                l_ord = lesson_order.get(lesson_id)
                if p_ord is not None and l_ord is not None and p_ord > l_ord:
                    errors.append(
                        f"  particles: '{pid}' (introducedIn: {intro}) is out of scope "
                        f"for lesson {lesson_id}."
                    )

# FM #24: Targets should use kanji-containing vocabulary
cjk_pattern = re.compile(r'[\u4e00-\u9fff]')

# Load glossary to check surfaces
id_surface = {}
import glob
for gpath in glob.glob(os.path.join(repo_root, 'data/*/glossary.*.json')):
    try:
        with open(gpath) as f:
            for entry in json.load(f):
                eid = entry.get('id', '')
                surface = entry.get('surface', '')
                if eid:
                    id_surface[eid] = surface
    except:
        pass

for i, prompt in enumerate(content.get('prompts', [])):
    for j, target in enumerate(prompt.get('targets', [])):
        tid = target.get('id', '')
        if tid and tid in id_surface:
            surface = id_surface[tid]
            if not cjk_pattern.search(surface):
                errors.append(
                    f"  prompts[{i}].targets[{j}]: '{tid}' (surface: '{surface}') "
                    f"contains no kanji — compose scoring is kanji-based. "
                    f"Use kanji-containing vocabulary for targets."
                )

# FM #25c: Regular prompts can't use "close"/"wrap up"/"conclude" if challengePrompts non-empty
challenge_prompts = content.get('challengePrompts', [])
if challenge_prompts:
    close_words = re.compile(r'\b(close|wrap up|conclude|finish|end)\b', re.IGNORECASE)
    prompts = content.get('prompts', [])
    for i, prompt in enumerate(prompts):
        prompt_text = prompt.get('prompt', '')
        if close_words.search(prompt_text):
            errors.append(
                f"  prompts[{i}]: Uses closing language ('{close_words.search(prompt_text).group()}') "
                f"but challengePrompts is non-empty. Students will think the composition is over. "
                f"Use forward-looking or neutral language."
            )

if errors:
    print(f"COMPOSE VALIDATION ERRORS in {os.path.basename(file_path)}:")
    for err in errors:
        print(err)
    sys.exit(1)

PYEOF "$FILE"
