"""Shared utility for validation hooks that need to scan
hand-written manual:true examples on glossary entries.

Auto-generated examples (no `manual` field) are already validated
indirectly via their source lesson, so we only check examples where
`example.manual === true`.

Each yielded entry uses the earliest lesson in `entry.lesson_ids` as
the scope cap (most restrictive).
"""
import re


def is_glossary_path(file_path):
    """Returns True if file_path is a glossary file."""
    return bool(file_path) and 'glossary' in file_path


def first_lesson(lesson_ids):
    """Pick the earliest lesson from a comma/space-separated lesson_ids string.

    Returns None if no parseable lesson found.
    """
    if not lesson_ids:
        return None
    parts = [p for p in re.split(r'[,;\s]+', lesson_ids.strip()) if p]
    if not parts:
        return None

    def keyize(p):
        m = re.match(r'^(N\d+)\.(\d+)', p)
        if m:
            return (int(m.group(1)[1:]), int(m.group(2)))
        # Grammar lessons sort after their unlocksAfter; fall through to high
        return (99, 99)

    return sorted(parts, key=keyize)[0]


def iter_manual_examples(content):
    """Yield (idx, entry, example, lesson_id) for each glossary entry that
    has a hand-written manual:true example with a parseable lesson_ids.
    """
    if not isinstance(content, dict):
        return
    entries = content.get('entries', [])
    if not isinstance(entries, list):
        return
    for i, entry in enumerate(entries):
        if not isinstance(entry, dict):
            continue
        example = entry.get('example')
        if not isinstance(example, dict):
            continue
        if not example.get('manual'):
            continue
        lesson_id = first_lesson(entry.get('lesson_ids', ''))
        if not lesson_id:
            continue
        yield (i, entry, example, lesson_id)
