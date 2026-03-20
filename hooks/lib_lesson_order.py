"""Shared lesson ordering utility for validation hooks.

Builds a total ordering where grammar lessons are interleaved
with content lessons based on their unlocksAfter field.
"""
import json, re

def build_lesson_order(manifest_path):
    """Returns dict mapping lesson/grammar/review IDs to ordinal positions."""
    with open(manifest_path) as f:
        manifest = json.load(f)

    lesson_order = {}
    ordinal = 0

    # First pass: content lessons (these define the primary ordering)
    for level_key in ['N5', 'N4', 'N3', 'N2', 'N1']:
        level_data = manifest.get('data', {}).get(level_key, {})
        for lesson in level_data.get('lessons', []):
            lid = lesson.get('id', '')
            if lid:
                lesson_order[lid] = ordinal
                ordinal += 1

    # Second pass: reviews (placed after the last lesson they cover)
    # Reviews like N5.Review.4 need ordinals so grammar can reference them
    for level_key in ['N5', 'N4', 'N3', 'N2', 'N1']:
        level_data = manifest.get('data', {}).get(level_key, {})
        for review in level_data.get('reviews', []):
            rid = review.get('id', '')
            unlocks = review.get('unlocksAfter', '')
            if rid and unlocks in lesson_order:
                lesson_order[rid] = lesson_order[unlocks] + 0.3
            elif rid:
                # Try to infer position from review number
                m = re.match(r'N\d+\.Review\.(\d+)', rid)
                if m:
                    # Place after all lessons of that level
                    level_lessons = [v for k, v in lesson_order.items()
                                   if k.startswith(level_key + '.') and not 'Review' in k]
                    if level_lessons:
                        lesson_order[rid] = max(level_lessons) + 0.3

    # Third pass: grammar lessons (right after their unlocksAfter)
    for level_key in ['N5', 'N4', 'N3', 'N2', 'N1']:
        level_data = manifest.get('data', {}).get(level_key, {})
        for grammar in level_data.get('grammar', []):
            gid = grammar.get('id', '')
            unlocks = grammar.get('unlocksAfter', '')
            if gid and unlocks in lesson_order:
                lesson_order[gid] = lesson_order[unlocks] + 0.5
            elif gid:
                # Fallback: place at end of level
                level_lessons = [v for k, v in lesson_order.items()
                               if k.startswith(level_key)]
                if level_lessons:
                    lesson_order[gid] = max(level_lessons) + 0.5

    return lesson_order

def is_in_scope(form_introduced_in, target_lesson_id, lesson_order):
    """Check if a form's introducedIn is <= the target lesson."""
    t_ord = lesson_order.get(target_lesson_id)
    i_ord = lesson_order.get(form_introduced_in)
    if t_ord is None or i_ord is None:
        return True  # Unknown, allow
    return i_ord <= t_ord
