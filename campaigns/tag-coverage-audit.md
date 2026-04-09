# Campaign: Tag Coverage Audit — Fix All Untagged Japanese Text

> **Status:** COMPLETE — 199/199 files clean (100%).
> **Started:** 2026-04-07
> **Last updated:** 2026-04-09
> **Audit baseline:** 199 files, 91 failures (32 N5 + 59 N4), ~600 individual findings
> **Final:** 199/199 files clean. All N5 (68/68) and N4 (131/131) fully clean.
> **Hook:** `validate-tag-coverage.sh` — detects Japanese text in `jp` fields not covered by `terms[]`

---

## Goal

Ensure every piece of Japanese text across all live content renders as a clickable chip. The new `validate-tag-coverage.sh` hook simulates the text-processor.js matching algorithm and reports any hiragana, katakana, or kanji left unmatched after all terms are resolved and "removed" from the jp text.

## How the Hook Works

1. Resolves each term in `terms[]` to surface forms (glossary lookup, conjugation engine, counter builder)
2. Sorts surfaces longest-first, kana-before-kanji at same length (mirroring text-processor.js)
3. Simulates the text processor's wrapping: removes multi-char surfaces globally, single-char kana surfaces only where the lookahead passes (not followed by another kana)
4. Reports any remaining Japanese characters as untagged

This catches issues the other hooks miss — they verify terms match, but don't verify ALL text is covered.

## Current State

| Level | Files | Clean | Unfixable | 
|---|---|---|---|
| **N5** | 68 | **68** | 0 |
| **N4** | 131 | **131** | 0 |
| **Total** | 199 | **199** | 0 |

### Previously Unfixable Items — All Resolved

| File | Issue | Resolution |
|---|---|---|
| N5 G6 | Grammar metalanguage (どうし, ごだん, etc.) | Rewrote conversations as natural dialogues via content pipeline |
| N5.1 | さん人 counter | Removed counter sentence (三 not taught until N5.3) |
| N5.9 | お prefix in お名前 | Added `v_onamae` combined glossary entry (established pattern for お-words) |

### Top Untagged Patterns (cross-level)

| Pattern | Count | Category | Typical Fix |
|---|---|---|---|
| Character names (`やまかわ`, `りきぞ`, `すずき`, `やまもと`, `けんじ`) | ~20 | Missing `char_*` ID | Add `char_yamakawa` etc. to terms |
| Single-char particles (`は`, `に`, `の`, `を`, `が`, `で`) | ~60 | Lookahead failure or missing particle | Add spaces in jp or add missing `p_*` term |
| `ください` | ~10 | Missing vocab | Add `v_kudasai` to terms |
| `ええ` / `うん` / `はい` | ~15 | Missing interjection | Add `v_ee`, `v_un`, `v_hai` to terms |
| `また` | ~5 | Missing adverb | Add `v_mata` to terms |
| `ございます` | ~4 | Missing expression | Add `v_gozaimasu` to terms |
| `です` / `だ` / `でした` | ~40 | Missing copula in terms | Add `g_desu` / `g_da` |
| `さん` / `たち` | ~20 | Missing suffix | Add `v_san` / `v_tachi` |
| Counter terms (`三人`, `四人`, `八時半`, `三時`) | ~8 | Missing `{counter, n}` | Add counter object to terms |
| Review Q+A answers | ~50 | Old format missing answer vocab | Add `a_terms` or expand `terms[]` |
| `な` (sentence-final or attributive) | ~10 | Missing particle or form issue | Add `p_na` or fix `attributive_na` form |
| Metalanguage (`どうし`, `ごだん`, `いちだん`) | ~10 | Grammar-specific vocab | Add glossary entries or skip |
| `クラス`, `この`, `大丈夫`, `早く` | ~20 | General missing vocab | Add appropriate `v_*` terms |

### Root Causes

1. **Character names not tagged** — `char_*` IDs missing from reading/review questions
2. **Particles adjacent to kana without spaces** — single-char lookahead fails (e.g., `これはなん` → は untagged)
3. **Old review Q+A format** — `terms[]` covers question only, answer text untagged
4. **Common expressions missing** — `ください`, `ええ`, `また`, `ございます`, `はい`
5. **Copula missing from terms** — `g_desu`/`g_da` not listed despite appearing in jp text
6. **Counter terms missing** — numeric counters not in terms as `{counter, n}` objects

---

## Phase 1: N5 Content — COMPLETE (68/68 clean)

- [x] N5 Lessons (17/17 clean — N5.1 + N5.9 fixed)
- [x] N5 Grammar (6/6 clean — G6 conversations rewritten)
- [x] N5 Reviews (10/10 clean)
- [x] N5 Compose, Stories, Game, Final Review — all clean

## Phase 2: N4 Content — COMPLETE (76/76 clean)

### N4 Grammar (7/7 clean)
- [x] G13, G14, G15, G16, G19, G21, G23

### N4 Lessons (32/32 clean)
- [x] All N4 lessons clean

### N4 Reviews (19/19 clean)
- [x] All N4 reviews clean

### What was done to complete N4:
- Added glossary entries: v_kun, v_tachi (suffixes), v_kikoeru (ichidan verb), v_odoroku (godan verb)
- Added passive_te conjugation form to conjugation_rules.json
- Rewrote N4.31 による→地図を見ると (N3 grammar)
- Rewrote N4.34 大変→むずかしい (N3 vocab)
- Rewrote N4.Review.9 items to remove N3 vocab (反応/事実/ことば)
- Added v_odoroku to N4.17 vocab, v_kikoeru to N4.31 vocab, v_kun/v_tachi to N4.18 vocab

---

## Remaining Work

None — all items resolved. Campaign complete.

### Decisions Made

**お honorific prefix:** Combined glossary entries are the correct pattern. A standalone お particle is architecturally impossible (text-processor single-char lookahead `(?![\u3040-\u30FF])` always fails for prefixes). All existing お-words already use combined entries. Only `v_onamae` was missing — added to N5 glossary.

**G6 metalanguage:** Conversations completely rewritten via content pipeline (PM → CB → QA → CR). Replaced terminology discussions with natural 6-line dialogues demonstrating verb types organically.

**N5.1 counter:** Removed `さん人です` sentence (三 not taught until N5.3). Simplified to `父が います。母が います。`

---

## Workflow Per File

1. Run: `echo '{"tool_input":{"file_path":"<path>"}}' | bash hooks/validate-tag-coverage.sh`
2. For each finding, determine the fix:
   - **Missing term**: Add the appropriate ID to `terms[]` (or `a_terms[]` for answers)
   - **Lookahead failure**: Add a space in `jp` text to separate the particle from adjacent kana
   - **Missing glossary entry**: Some words may need to be added to the glossary first
   - **Counter term**: Add `{"counter": "<key>", "n": <number>}` to terms
   - **Character name**: Add `char_<name>` to terms
3. Re-run hook to confirm clean
4. Run full hook suite: `echo '{"tool_input":{"file_path":"<path>"}}' | bash hooks/validate-surface-match.sh` (etc.) to ensure no regressions

## Priority

1. **N5 lessons** (most visible to students, 17 files)
2. **N5 grammar** (6 files)
3. **N5 reviews** (9 files)
4. **N4 lessons 1–20** (refreshed content, ~20 files)
5. **N4 grammar** (7 files)
6. **N4 reviews** (19 files)
7. **N4 lessons 21–36** (pre-refresh content, ~14 files)
