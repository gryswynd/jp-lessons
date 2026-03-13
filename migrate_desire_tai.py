#!/usr/bin/env python3
"""
Migrate desire_tai → plain_desire_tai across all content files.

Rules:
- Story terms.json (path contains 'stories' and filename is 'terms.json'):
    terms is a DICT of { surface: { id, form } } — rename form only, no g_desu insert.
- grammarForms metadata arrays: rename the string, no g_desu insert.
- All other terms ARRAYS (lessons, reviews, grammar conversations):
    rename form AND insert "g_desu" after the converted object if not already present.
"""

import json
import glob
import os
import sys

def is_story_file(path):
    return 'stories' in path and os.path.basename(path) == 'terms.json'

def process_terms_list(terms):
    """Convert terms array: rename desire_tai, insert g_desu after if missing."""
    new_terms = []
    i = 0
    while i < len(terms):
        item = terms[i]
        if isinstance(item, dict) and item.get('form') == 'desire_tai':
            new_item = dict(item)
            new_item['form'] = 'plain_desire_tai'
            new_terms.append(new_item)
            # Insert g_desu after unless already present
            next_item = terms[i + 1] if i + 1 < len(terms) else None
            already_has = (
                next_item == 'g_desu' or
                (isinstance(next_item, dict) and next_item.get('id') == 'g_desu')
            )
            if not already_has:
                new_terms.append('g_desu')
        else:
            new_terms.append(item)
        i += 1
    return new_terms

def transform(obj, story_file):
    """Recursively walk and transform the JSON object."""
    if isinstance(obj, dict):
        result = {}
        for k, v in obj.items():
            if k == 'grammarForms' and isinstance(v, list):
                # Metadata string array — rename only
                result[k] = ['plain_desire_tai' if x == 'desire_tai' else x for x in v]
            elif k == 'form' and v == 'desire_tai':
                # In story terms dict values (or any nested form field)
                result[k] = 'plain_desire_tai'
            elif k == 'terms' and isinstance(v, list) and not story_file:
                # Lesson/review/grammar terms array — rename + insert g_desu
                result[k] = process_terms_list(v)
            elif k == 'terms' and isinstance(v, list) and story_file:
                # Should not happen (story terms is a dict), but safe fallback
                result[k] = [transform(item, story_file) for item in v]
            else:
                result[k] = transform(v, story_file)
        return result
    elif isinstance(obj, list):
        return [transform(item, story_file) for item in obj]
    else:
        return obj

def migrate_file(path):
    text = open(path, encoding='utf-8').read()
    if '"desire_tai"' not in text:
        return 0

    data = json.loads(text)
    story = is_story_file(path)
    new_data = transform(data, story)

    # Count changes
    old_count = text.count('"desire_tai"')

    new_text = json.dumps(new_data, ensure_ascii=False, indent=2)
    # Ensure trailing newline matches original
    if text.endswith('\n'):
        new_text += '\n'

    open(path, 'w', encoding='utf-8').write(new_text)
    return old_count

def main():
    files = sorted(glob.glob('/home/user/jp-lessons/data/**/*.json', recursive=True))
    total_files = 0
    total_changes = 0

    for path in files:
        n = migrate_file(path)
        if n > 0:
            rel = path.replace('/home/user/jp-lessons/', '')
            story_marker = ' [story]' if is_story_file(path) else ''
            print(f'  {n:3d} changes  {rel}{story_marker}')
            total_files += 1
            total_changes += n

    print(f'\nTotal: {total_changes} desire_tai converted across {total_files} files')

    # Verify none remain
    remaining = []
    for path in files:
        text = open(path, encoding='utf-8').read()
        if '"desire_tai"' in text:
            remaining.append(path.replace('/home/user/jp-lessons/', ''))
    if remaining:
        print(f'\nWARNING — desire_tai still present in:')
        for r in remaining:
            print(f'  {r}')
    else:
        print('Verification: no remaining "desire_tai" occurrences.')

if __name__ == '__main__':
    main()
