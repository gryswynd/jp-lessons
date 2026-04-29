#!/usr/bin/env python3
"""Audit: every term referenced in a G lesson must be gated by the unlocking N lesson.

Two gap types are flagged for each G lesson:

1. Late-introduced — term's `lesson_ids` is AFTER the G's resolved gating N lesson.
2. Undeclared introduction — term's `lesson_ids` EQUALS the gating N lesson but the
   term is missing from that N lesson's `vocabList` sections.

The "gating N lesson" is found by walking `unlocksAfter` in `manifest.json` until
the first plain `N5.X` / `N4.X` id is reached (skipping G* and N*.Review.* nodes).

Writes report to `audit-grammar-vocab-gaps.md` and prints a summary line.
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

NLESSON_RE = re.compile(r"^N([45])\.(\d+)$")
LEVEL_RANK = {"N5": 0, "N4": 1}


def lesson_key(lesson_id):
    """Sortable key for an N lesson id like 'N5.10' -> (0, 10). Returns None if invalid."""
    m = NLESSON_RE.match(lesson_id)
    if not m:
        return None
    return (LEVEL_RANK[f"N{m.group(1)}"], int(m.group(2)))


def earliest_lesson(lesson_ids_str, unlocks_map=None):
    """Parse a `lesson_ids` value and return the earliest (sort-key, displayed-id) pair.

    Handles three token shapes:
    - `N5.X` / `N4.X` — used directly.
    - `G\\d+` or `N[45].Review.\\d+` — resolved through `unlocks_map` to the
      gating N lesson (so a term tagged `lesson_ids: "G14"` is treated as
      introduced in G14's gating N lesson, e.g. N4.5).
    - Anything else — ignored.

    The displayed id is the original token; the sort key comes from the
    resolved N lesson.
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


def build_unlocks_map(manifest):
    unlocks = {}
    files = {}

    def walk(o):
        if isinstance(o, dict):
            if "id" in o:
                if "unlocksAfter" in o:
                    unlocks[o["id"]] = o["unlocksAfter"]
                if "file" in o:
                    files[o["id"]] = o["file"]
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for it in o:
                walk(it)

    walk(manifest)
    return unlocks, files


def resolve_to_n_lesson(node_id, unlocks_map, _seen=None):
    """Walk unlocksAfter chain until reaching a plain N5.X or N4.X id."""
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
    """Walk a JSON tree, collecting every term id from any `terms` array."""
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
    """Return the set of term ids declared in any `vocabList` section."""
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


def load_lesson_ids_index():
    """Merge term -> introduction-lesson-string from glossaries (`lesson_ids`)
    and shared/particles.json (`introducedIn`).
    """
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


def main():
    manifest = load_manifest()
    unlocks_map, files_map = build_unlocks_map(manifest)
    glossary_ids = load_lesson_ids_index()
    character_ids = load_character_ids()

    g_ids = sorted(
        [gid for gid in unlocks_map if gid.startswith("G") and gid[1:].isdigit()],
        key=lambda x: int(x[1:]),
    )

    report_lines = []
    total_gaps = 0
    total_late = 0
    total_undeclared = 0
    total_unknown = 0
    chars_skipped = 0
    g_with_gaps = 0
    g_audited = 0
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

        # vocabList of the gating N lesson
        n_file = files_map.get(gating_n)
        n_vocab = set()
        if n_file:
            n_path = ROOT / n_file
            if n_path.exists():
                n_vocab = collect_vocab_list_items(json.loads(n_path.read_text()))

        late = []
        undeclared = []
        unknown = []
        for tid in sorted(terms_in_g):
            if tid in character_ids:
                chars_skipped += 1
                continue
            lesson_ids_str = glossary_ids.get(tid)
            if lesson_ids_str is None:
                # Not in glossary and not a character
                if tid not in glossary_ids:
                    unknown.append(tid)
                continue
            term_key, term_lesson = earliest_lesson(lesson_ids_str, unlocks_map)
            if term_key is None:
                continue
            if term_key > gating_key:
                late.append((tid, term_lesson))
            elif term_key == gating_key and tid not in n_vocab:
                undeclared.append(tid)

        g_audited += 1
        if late or undeclared or unknown:
            g_with_gaps += 1
            total_late += len(late)
            total_undeclared += len(undeclared)
            total_unknown += len(unknown)
            total_gaps += len(late) + len(undeclared) + len(unknown)

            title = g_json.get("title", "")
            report_lines.append(f"## {gid} — {title}")
            report_lines.append("")
            report_lines.append(f"_unlocksAfter:_ `{unlocks_map[gid]}` → resolved gating N lesson: `{gating_n}`")
            report_lines.append(f"_file:_ `{g_file}`")
            report_lines.append("")

            if late:
                report_lines.append(f"**Late-introduced ({len(late)}):**")
                for tid, term_lesson in late:
                    report_lines.append(f"- `{tid}` — introduced in `{term_lesson}` (after gate `{gating_n}`)")
                report_lines.append("")

            if undeclared:
                report_lines.append(f"**Undeclared in {gating_n} vocabList ({len(undeclared)}):**")
                for tid in undeclared:
                    report_lines.append(f"- `{tid}`")
                report_lines.append("")

            if unknown:
                report_lines.append(f"**Unknown term ids — not found in any glossary or characters file ({len(unknown)}):**")
                for tid in unknown:
                    report_lines.append(f"- `{tid}`")
                report_lines.append("")

    header = [
        "# Grammar Vocab Gating Audit",
        "",
        f"Audited **{g_audited}** G lessons. Gaps in **{g_with_gaps}** lessons.",
        "",
        f"- Late-introduced terms: **{total_late}**",
        f"- Undeclared introductions: **{total_undeclared}**",
        f"- Unknown term ids: **{total_unknown}**",
        f"- Character references skipped (no `lesson_ids` in `shared/characters.json`): **{chars_skipped}**",
        "",
    ]
    if unresolved:
        header.append(f"_Could not resolve gating N lesson for: {', '.join(unresolved)}_")
        header.append("")

    REPORT_PATH.write_text("\n".join(header + report_lines).rstrip() + "\n")
    print(
        f"Audited {g_audited} G lessons; {g_with_gaps} have gaps "
        f"({total_late} late, {total_undeclared} undeclared, {total_unknown} unknown). "
        f"Report: {REPORT_PATH.relative_to(ROOT)}"
    )
    return 1 if total_gaps else 0


if __name__ == "__main__":
    sys.exit(main())
