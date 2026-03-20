#!/bin/bash
# Hook: validate-register.sh
# Purpose: Enforces polite/casual register rules by lesson range.
#          Before N5.10: 100% polite. After N5.10: must have casual conversations.
#
# Validates: FM #44 (casual before N5.10), FM #45 (no casual after N5.10),
#            FM #46 (register mixing within conversation)

set -euo pipefail

FILE="$1"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

[[ "$FILE" =~ \.(json)$ ]] || exit 0
[[ "$FILE" =~ (manifest|glossary|conjugation_rules|counter_rules|particles|characters|helper-vocab|package) ]] && exit 0

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

# Only check lesson files (not grammar, compose, story)
content_type = content.get('type', '')
if content_type in ('grammar',):
    sys.exit(0)

content_id = content.get('id', '')
# Skip compose files
if 'compose' in content_id.lower():
    sys.exit(0)

# Determine lesson number
level_match = re.match(r'N(\d+)\.(\d+)', content_id)
if not level_match:
    sys.exit(0)

level_num = int(level_match.group(1))
lesson_num = int(level_match.group(2))

# N5.10 = casual starts. Before that, 100% polite.
casual_available = (level_num == 5 and lesson_num >= 10) or level_num < 5  # N4+ is after N5

# Polite form indicators
POLITE_PATTERNS = re.compile(r'(ます|ました|ません|ませんでした|です|でした|ましょう|ください)')
# Plain form indicators in sentence-final position
PLAIN_PATTERNS = re.compile(r'(だ[。、？]|だね|だよ|ない[。、？]|なかった|[うくすつぬふむるぐずづぶぷ][。？]|った[。、？]|んだ)')

errors = []

sections = content.get('sections', [])
conversations = [s for s in sections if s.get('type') == 'conversation']

casual_count = 0
for i, conv in enumerate(conversations):
    title = conv.get('title', '')
    context = conv.get('context', '')
    lines = conv.get('lines', [])

    if not lines:
        continue

    # Detect register per line
    polite_lines = 0
    plain_lines = 0

    for line in lines:
        jp = line.get('jp', '')
        if POLITE_PATTERNS.search(jp):
            polite_lines += 1
        if PLAIN_PATTERNS.search(jp):
            plain_lines += 1

    is_casual = plain_lines > polite_lines
    is_mixed = polite_lines > 0 and plain_lines > 0

    if is_casual:
        casual_count += 1

    # FM #44: Casual before N5.10
    if not casual_available and is_casual:
        errors.append(
            f"  Conversation {i+1} ('{title}'): Uses casual/plain forms but lesson is {content_id} "
            f"(before N5.10). All conversations must be 100% polite."
        )

    # FM #46: Register mixing
    if is_mixed and not is_casual:
        # Only flag if it looks like accidental mixing (some plain in a mostly polite conv)
        if plain_lines >= 2:
            errors.append(
                f"  WARNING: Conversation {i+1} ('{title}'): Mixes polite ({polite_lines} lines) "
                f"and plain ({plain_lines} lines) forms. Each conversation should commit to one register."
            )

# FM #45: No casual after N5.10
if casual_available and casual_count == 0 and len(conversations) >= 2:
    errors.append(
        f"  Register gap: Lesson {content_id} has {len(conversations)} conversations but "
        f"zero casual. N5.10+ lessons require at least 1 casual conversation."
    )

if errors:
    real_errors = [e for e in errors if 'WARNING:' not in e]
    warnings = [e for e in errors if 'WARNING:' in e]

    if real_errors:
        print(f"REGISTER ERRORS in {os.path.basename(file_path)}:")
        for err in real_errors:
            print(err)
    if warnings:
        print(f"REGISTER WARNINGS in {os.path.basename(file_path)}:")
        for w in warnings:
            print(w)

    sys.exit(1 if real_errors else 0)

PYEOF "$FILE"
