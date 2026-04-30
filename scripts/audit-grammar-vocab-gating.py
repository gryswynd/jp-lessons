#!/usr/bin/env python3
"""Audit: grammar lesson `targetVocab` must be properly placed and reinforced.

For each G lesson with a `targetVocab` array, we run four checks against its
unlocking N lesson and the surrounding curriculum:

1. **Declaration** — every target term must appear in the unlocking N lesson's
   `vocabList` section.
2. **Reinforcement** — every target term must appear in `terms[]` of the next
   2 N lessons after the unlocking N (the reinforcement window).
3. **Story reinforcement** — every target term must appear in any story whose
   `unlocksAfter` falls within the reinforcement window.
4. **Misplacement** — no target term should appear in any earlier N lesson's
   `vocabList` (would mean it's introduced in the wrong N).

We also keep the original "untargeted" gating checks for every term referenced
in a G lesson:

5. **Late-introduced** — term's `lesson_ids` is AFTER the gating N lesson.
6. **Undeclared introduction** — term's `lesson_ids` equals the gating N lesson
   but the term is not in that N lesson's vocabList.

The "gating N lesson" for a G is found by walking `unlocksAfter` in
`manifest.json` until the first plain `N5.X` / `N4.X` id is reached.

Writes report to `audit-grammar-vocab-gaps.md`.
Exits non-zero if any gaps are found.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "manifest.json"
GLOSSARIES = [ROOT / "data/N5/glossary.N5.json", ROOT / "data/N4/glossary.N4.json"]
PARTICLES_FILE = ROOT / "shared/particles.json"
CHARACTERS_FILE = ROOT / "shared/characters.json"
REPORT_PATH = ROOT / "audit-grammar-vocab-gaps.md"

REINFORCEMENT_WINDOW = 2  # number of N lessons after the gate

NLESSON_RE = re.compile(r"^N([45])\.(\d+)$")
LEVEL_RANK = {"N5": 0, "N4": 1}


def lesson_key(lesson_id):
    m = NLESSON_RE.match(lesson_id)
    if not m:
        return None
    return (LEVEL_RANK[f"N{m.group(1)}"], int(m.group(2)))


def earliest_lesson(lesson_ids_str, unlocks_map=None):
    """Parse a `lesson_ids` value and return (sort-key, displayed-id).

    Handles `N5.X`/`N4.X` directly, resolves `G\\d+` and review ids through
    `unlocks_map` to the gating N lesson.
    """
    if not lesson_ids_str:
        return None, None
    tokens = re.findall(r"[NG][\w.]+", str(lesson_ids_str))
    parsed = []
    for tok in tokens:
        if NLESSON_RE.match(tok):
            parsed.append((lesson_key(tok), tok))
        elif unlocks_map is not None and (tok.startswith("G") or ".Review." in tok):
            resolved = resolve_to_n_lesson(tok, unlocks_map)
            if resolved:
                parsed.append((lesson_key(resolved), tok))
    parsed = [p for p in parsed if p[0] is not None]
    if not parsed:
        return None, None
    return min(parsed, key=lambda p: p[0])


def load_manifest():
    return json.loads(MANIFEST.read_text())


def build_manifest_index(manifest):
    """Walk the manifest and collect:
    - unlocks: id -> unlocksAfter
    - files: id -> file path (for lessons/grammar)
    - story_dirs: list of (id, unlocksAfter, dir)
    """
    unlocks = {}
    files = {}
    story_dirs = []

    def walk(o):
        if isinstance(o, dict):
            if "id" in o:
                if "unlocksAfter" in o:
                    unlocks[o["id"]] = o["unlocksAfter"]
                if "file" in o:
                    files[o["id"]] = o["file"]
                if "dir" in o and "stories" in str(o["dir"]):
                    story_dirs.append((o["id"], o.get("unlocksAfter"), o["dir"]))
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for it in o:
                walk(it)

    walk(manifest)
    return unlocks, files, story_dirs


def resolve_to_n_lesson(node_id, unlocks_map, _seen=None):
    if _seen is None:
        _seen = set()
    if node_id in _seen:
        return None
    if NLESSON_RE.match(node_id):
        return node_id
    next_node = unlocks_map.get(node_id)
    if next_node is None:
        return None
    _seen.add(node_id)
    return resolve_to_n_lesson(next_node, unlocks_map, _seen)


def collect_term_ids(obj, out=None):
    """Walk a JSON tree, collecting every term id from any `terms` array (lessons/grammar)."""
    if out is None:
        out = set()
    if isinstance(obj, dict):
        terms = obj.get("terms")
        if isinstance(terms, list):
            for t in terms:
                if isinstance(t, str):
                    out.add(t)
                elif isinstance(t, dict) and isinstance(t.get("id"), str):
                    out.add(t["id"])
        for v in obj.values():
            collect_term_ids(v, out)
    elif isinstance(obj, list):
        for it in obj:
            collect_term_ids(it, out)
    return out


def collect_vocab_list_items(n_lesson_json):
    items = set()
    for section in n_lesson_json.get("sections", []) or []:
        if section.get("type") != "vocabList":
            continue
        for group in section.get("groups", []) or []:
            for it in group.get("items", []) or []:
                if isinstance(it, str):
                    items.add(it)
                elif isinstance(it, dict) and isinstance(it.get("id"), str):
                    items.add(it["id"])
    return items


def collect_story_term_ids(story_terms_json):
    """Story terms.json uses Japanese surface as keys; values hold {id, form}."""
    ids = set()
    terms = story_terms_json.get("terms", {}) if isinstance(story_terms_json, dict) else {}
    for v in terms.values():
        if isinstance(v, dict) and isinstance(v.get("id"), str):
            ids.add(v["id"])
        elif isinstance(v, list):
            for it in v:
                if isinstance(it, dict) and isinstance(it.get("id"), str):
                    ids.add(it["id"])
                elif isinstance(it, str):
                    ids.add(it)
        elif isinstance(v, str):
            ids.add(v)
    return ids


def load_lesson_ids_index():
    out = {}
    for path in GLOSSARIES:
        data = json.loads(path.read_text())
        entries = data if isinstance(data, list) else data.get("entries", [])
        for e in entries:
            tid = e.get("id")
            if tid:
                out[tid] = e.get("lesson_ids")
    if PARTICLES_FILE.exists():
        data = json.loads(PARTICLES_FILE.read_text())
        for e in data.get("particles", []):
            tid = e.get("id")
            if tid and tid not in out:
                out[tid] = e.get("introducedIn")
    return out


def load_character_ids():
    if not CHARACTERS_FILE.exists():
        return set()
    data = json.loads(CHARACTERS_FILE.read_text())
    entries = data.get("characters") if isinstance(data, dict) else data
    return {e.get("id") for e in (entries or []) if e.get("id")}


def build_n_lesson_index(files_map):
    """Build sorted list of N lesson ids and per-lesson caches (vocab + all terms)."""
    n_ids = sorted(
        [lid for lid in files_map if NLESSON_RE.match(lid)],
        key=lesson_key,
    )
    vocab_by_n = {}
    terms_by_n = {}
    for lid in n_ids:
        path = ROOT / files_map[lid]
        if not path.exists():
            continue
        data = json.loads(path.read_text())
        vocab_by_n[lid] = collect_vocab_list_items(data)
        terms_by_n[lid] = collect_term_ids(data)
    return n_ids, vocab_by_n, terms_by_n


def build_story_index(story_dirs, unlocks_map):
    """Return list of dicts: {id, gate (resolved N), terms (set of ids)}, sorted by gate."""
    out = []
    for sid, unlocks_after, dirpath in story_dirs:
        gate = None
        if unlocks_after:
            gate = resolve_to_n_lesson(unlocks_after, unlocks_map)
        terms_path = ROOT / dirpath / "terms.json"
        if not terms_path.exists():
            continue
        data = json.loads(terms_path.read_text())
        out.append({
            "id": sid,
            "gate": gate,
            "gate_key": lesson_key(gate) if gate else None,
            "terms": collect_story_term_ids(data),
            "dir": dirpath,
        })
    return out


def reinforcement_lessons(n_ids, gating_n, window=REINFORCEMENT_WINDOW):
    """Return the next `window` N lessons after gating_n in curriculum order."""
    try:
        idx = n_ids.index(gating_n)
    except ValueError:
        return []
    return n_ids[idx + 1 : idx + 1 + window]


def stories_in_window(stories, gating_key, window_end_key):
    """Stories whose gate is strictly after gating_key and at-or-before window_end_key."""
    out = []
    for s in stories:
        if s["gate_key"] is None:
            continue
        if s["gate_key"] > gating_key and s["gate_key"] <= window_end_key:
            out.append(s)
    return out


def main():
    manifest = load_manifest()
    unlocks_map, files_map, story_dirs = build_manifest_index(manifest)
    glossary_ids = load_lesson_ids_index()
    character_ids = load_character_ids()
    n_ids, vocab_by_n, terms_by_n = build_n_lesson_index(files_map)
    stories = build_story_index(story_dirs, unlocks_map)

    g_ids = sorted(
        [gid for gid in unlocks_map if gid.startswith("G") and gid[1:].isdigit()],
        key=lambda x: int(x[1:]),
    )

    sections = []
    totals = {
        "g_audited": 0,
        "g_with_gaps": 0,
        "g_with_target": 0,
        "missing_declaration": 0,
        "missing_reinforcement": 0,
        "missing_story_reinforcement": 0,
        "misplaced": 0,
        "late": 0,
        "undeclared": 0,
        "unknown": 0,
        "chars_skipped": 0,
    }
    unresolved = []

    for gid in g_ids:
        gating_n = resolve_to_n_lesson(unlocks_map[gid], unlocks_map)
        if gating_n is None:
            unresolved.append(gid)
            continue
        gating_key = lesson_key(gating_n)

        g_file = files_map.get(gid)
        if not g_file:
            continue
        g_path = ROOT / g_file
        if not g_path.exists():
            continue
        g_json = json.loads(g_path.read_text())
        terms_in_g = collect_term_ids(g_json)
        target_vocab = g_json.get("targetVocab") or []
        n_vocab = vocab_by_n.get(gating_n, set())

        reinf = reinforcement_lessons(n_ids, gating_n)
        window_end_key = lesson_key(reinf[-1]) if reinf else gating_key
        window_stories = stories_in_window(stories, gating_key, window_end_key)

        missing_decl = []
        missing_reinf = []
        missing_story = []
        misplaced = []

        for tid in target_vocab:
            if tid not in n_vocab:
                missing_decl.append(tid)
            absent_in = [n for n in reinf if tid not in terms_by_n.get(n, set())]
            if absent_in:
                missing_reinf.append((tid, absent_in))
            absent_stories = [s["id"] for s in window_stories if tid not in s["terms"]]
            if window_stories and absent_stories:
                missing_story.append((tid, absent_stories))
            for nid in n_ids:
                if nid == gating_n:
                    break
                if tid in vocab_by_n.get(nid, set()):
                    misplaced.append((tid, nid))
                    break

        # Untargeted gating checks (every term in G)
        late = []
        undeclared = []
        unknown = []
        for tid in sorted(terms_in_g):
            if tid in character_ids:
                totals["chars_skipped"] += 1
                continue
            lesson_ids_str = glossary_ids.get(tid)
            if lesson_ids_str is None:
                if tid not in glossary_ids:
                    unknown.append(tid)
                continue
            term_key, term_lesson = earliest_lesson(lesson_ids_str, unlocks_map)
            if term_key is None:
                continue
            if term_key > gating_key:
                late.append((tid, term_lesson))
            elif term_key == gating_key and tid not in n_vocab and tid not in target_vocab:
                undeclared.append(tid)

        totals["g_audited"] += 1
        if target_vocab:
            totals["g_with_target"] += 1
        any_gap = bool(missing_decl or missing_reinf or missing_story or misplaced or late or undeclared or unknown)
        if any_gap:
            totals["g_with_gaps"] += 1

        totals["missing_declaration"] += len(missing_decl)
        totals["missing_reinforcement"] += len(missing_reinf)
        totals["missing_story_reinforcement"] += len(missing_story)
        totals["misplaced"] += len(misplaced)
        totals["late"] += len(late)
        totals["undeclared"] += len(undeclared)
        totals["unknown"] += len(unknown)

        if not any_gap:
            continue

        title = g_json.get("title", "")
        lines = [
            f"## {gid} — {title}",
            "",
            f"_unlocksAfter:_ `{unlocks_map[gid]}` → gating N lesson: `{gating_n}`",
            f"_targetVocab:_ {('`' + '`, `'.join(target_vocab) + '`') if target_vocab else '_(not yet curated)_'}",
            f"_reinforcement window:_ {', '.join(f'`{n}`' for n in reinf) or '_none_'}"
            + (f" + stories: {', '.join('`' + s['id'] + '`' for s in window_stories)}" if window_stories else ""),
            f"_file:_ `{g_file}`",
            "",
        ]

        if missing_decl:
            lines.append(f"**Missing from {gating_n} vocabList — declare here ({len(missing_decl)}):**")
            for tid in missing_decl:
                lines.append(f"- `{tid}`")
            lines.append("")

        if missing_reinf:
            lines.append(f"**Missing reinforcement in next {REINFORCEMENT_WINDOW} N lessons ({len(missing_reinf)}):**")
            for tid, absent in missing_reinf:
                lines.append(f"- `{tid}` — not referenced in {', '.join(f'`{n}`' for n in absent)}")
            lines.append("")

        if missing_story:
            lines.append(f"**Missing reinforcement in window stories ({len(missing_story)}):**")
            for tid, absent in missing_story:
                lines.append(f"- `{tid}` — not referenced in story {', '.join(f'`{s}`' for s in absent)}")
            lines.append("")

        if misplaced:
            lines.append(f"**Misplaced — target term in earlier N lesson's vocabList ({len(misplaced)}):**")
            for tid, where in misplaced:
                lines.append(f"- `{tid}` is currently declared in `{where}` (should move to `{gating_n}`)")
            lines.append("")

        if late:
            lines.append(f"**Other terms in G referenced before introduction ({len(late)}):**")
            for tid, term_lesson in late:
                lines.append(f"- `{tid}` — introduced in `{term_lesson}` (after gate `{gating_n}`)")
            lines.append("")

        if undeclared:
            lines.append(f"**Other terms with `lesson_ids` = {gating_n} but not in its vocabList ({len(undeclared)}):**")
            for tid in undeclared:
                lines.append(f"- `{tid}`")
            lines.append("")

        if unknown:
            lines.append(f"**Unknown term ids — not found in any glossary or characters file ({len(unknown)}):**")
            for tid in unknown:
                lines.append(f"- `{tid}`")
            lines.append("")

        sections.extend(lines)

    header = [
        "# Grammar Vocab Gating Audit",
        "",
        f"Audited **{totals['g_audited']}** G lessons "
        f"(**{totals['g_with_target']}** have curated `targetVocab`). "
        f"Gaps in **{totals['g_with_gaps']}** lessons.",
        "",
        "## Target-vocab gaps",
        f"- Missing from unlocking N's vocabList (declaration): **{totals['missing_declaration']}**",
        f"- Missing reinforcement in next {REINFORCEMENT_WINDOW} N lessons: **{totals['missing_reinforcement']}**",
        f"- Missing reinforcement in window stories: **{totals['missing_story_reinforcement']}**",
        f"- Misplaced (target term declared in an earlier N lesson): **{totals['misplaced']}**",
        "",
        "## Other gating gaps",
        f"- Late-introduced (term's `lesson_ids` after the gate): **{totals['late']}**",
        f"- Undeclared introductions (term's `lesson_ids` = gate but not in vocabList, and not a target): **{totals['undeclared']}**",
        f"- Unknown term ids: **{totals['unknown']}**",
        f"- Character references skipped (no `lesson_ids` in `shared/characters.json`): **{totals['chars_skipped']}**",
        "",
    ]
    if unresolved:
        header.append(f"_Could not resolve gating N lesson for: {', '.join(unresolved)}_")
        header.append("")

    REPORT_PATH.write_text("\n".join(header + sections).rstrip() + "\n")
    print(
        f"Audited {totals['g_audited']} G lessons "
        f"({totals['g_with_target']} with targetVocab); "
        f"{totals['g_with_gaps']} have gaps. "
        f"decl={totals['missing_declaration']} reinf={totals['missing_reinforcement']} "
        f"story={totals['missing_story_reinforcement']} misplaced={totals['misplaced']} "
        f"late={totals['late']} undecl={totals['undeclared']} unknown={totals['unknown']}. "
        f"Report: {REPORT_PATH.relative_to(ROOT)}"
    )
    any_gap = (
        totals["missing_declaration"] + totals["missing_reinforcement"]
        + totals["missing_story_reinforcement"] + totals["misplaced"]
        + totals["late"] + totals["undeclared"] + totals["unknown"]
    )
    return 1 if any_gap else 0


if __name__ == "__main__":
    sys.exit(main())
