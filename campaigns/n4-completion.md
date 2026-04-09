# N4 Campaign: Full Refresh & Completion

> **Status:** QA Sweep — 141 hook failures remaining
> **Started:** 2026-03-25
> **Last updated:** 2026-04-09
> **Audit baseline:** 131 files, 141 failures across 13 hooks (run `bash hooks/audit-all.sh N4` to regenerate)

---

## Goal

Complete the entire N4 level: refresh the back half of lessons (N4.21–N4.36), build missing reviews, complete all stories, finish all grammar lessons, build compose files, and QA everything.

## Current State

| Content type | Exists | Built | Hook failures |
|---|---|---|---|
| Lessons (N4.1–N4.36) | 36/36 | All refreshed | **~25 lessons have failures** (surface-match, particle-context, chip-order, register, kanji-scope, etc.) |
| Grammar (G13–G31) | 19/19 | All built | **10 grammar files have failures** (grammar-schema, kanji-scope, surface-match, particle-context, structure, writing-forms) |
| Reviews | 18 + 2 half + 1 final | All exist | **~12 reviews have failures** (structure, particle-context, surface-match, form-scope) |
| Compose | 36/36 | All built | **17 compose files have failures** (compose hook) |
| Stories | 14 | All exist | **3 stories have writing-forms failures** |
| Game days | 0 | — | Game day planning needed (separate phase) |

## Phase 1: Lesson Refresh (N4.21–N4.36)

These lessons exist but predate current quality standards (term tagging, grammar reinforcement, register requirements, etc.). Each needs a full refresh through the 4-agent pipeline.

**Batch 1: N4.21–N4.27** — COMPLETE ✓
- [x] N4.21–N4.27 — all refreshed (Apr 9)

**Batch 2: N4.28–N4.32** — COMPLETE ✓
- [x] N4.28 — refreshed (Apr 9)
- [x] N4.29 — Typhoons, Clocks, and Knowing (2026-03-25)
- [x] N4.30 — Thinking, Gathering & Answering (2026-03-26)
- [x] N4.31 — passive/causative forms (Apr 9)
- [x] N4.32 — refreshed (Apr 9)

**Batch 3: N4.33–N4.36** — COMPLETE ✓
- [x] N4.33 — refreshed (Apr 9)
- [x] N4.34 — Districts, Commuting & Prefectures (2026-03-29)
- [x] N4.35 — rewritten (2026-03-29)
- [x] N4.36 — rewritten (2026-03-30)

## Phase 2: Grammar Lessons (G21–G31) — COMPLETE ✓

All 11 missing grammar lessons have been built:

| ID | Topic | unlocksAfter | Status |
|---|---|---|---|
| G21 | Conversation Mechanics (相槌, hesitation) | N4.16 | **Built** ✓ |
| G22 | そうだ: Appearance & Hearsay | N4.18 | **Built** ✓ |
| G23 | Permissions & Prohibitions (てもいい, てはいけない, なくてもいい) | N4.21 | **Built** ✓ |
| G24 | Directional て-Form (てくる/ていく/てある) | N4.23 | **Built** ✓ |
| G25 | Obligations & Conditionals (なければ, ば, たら, なら, と) | N4.25 | **Built** ✓ |
| G26 | ように Patterns (ようにする / ようになる) | N4.27 | **Built** ✓ |
| G27 | Expressing Thoughts & Experience (と思う / たことがある) | N4.30 | **Built** ✓ |
| G28 | Passive Form | N4.31 | **Built** ✓ |
| G29 | Causative Form | N4.31 | **Built** ✓ |
| G30 | Advanced Verb Usages (てみる, ておく, てしまう, すぎる, とする) | N4.34 | **Built** ✓ |
| G31 | Advanced Adjective Patterns (くなる/になる, くする/にする) | N4.34 | **Built** ✓ |

## Phase 3: Reviews — Built, needs QA sweep

All reviews exist. N4.Review.16 rewritten for N4.31–32. Remaining hook failures across ~12 review files (structure, particle-context, surface-match, form-scope).

## Phase 4: Compose Files — Built, needs QA sweep

All 36 compose files exist. 17 have compose hook failures (likely ungated particles or non-kanji targets).

## Phase 5: Stories

Current N4 stories (14 total):
- factory-owner, field-trip-day, hashiru-asa, hirugohan-monogatari, jitensha-de-kyouto-e, kazoku-no-kisetsu, library-book, machi-no-eigakan, mori-no-shokudou *(new — N4.31–32)*, new-city, rikizo-journey, tabisaki-no-shashin, uta-to-shigoto, watashi-no-iro

### Stories needed
- [ ] Assess vocabulary coverage gaps for N4.21–N4.36 range
- [ ] Plan additional stories if needed
- [ ] Build new stories with proper terms.json and particle tagging

## Phase 6: QA All Grammar Lessons (G13–G31)

All 19 grammar files exist. 10 have hook failures (G13–G16, G18–G22, G24–G25, G27, G31).

## Phase 7: Game Day Planning

No N4 game days exist yet. Planning needed:
- [ ] Define N4 game day structure — does the "Golden Week" narrative continue, or is N4 a new arc?
- [ ] Decide scope: 36 game days (one per lesson) or condensed format?
- [ ] Create N4_GAME_ROADMAP.md if proceeding

## Remaining Work

### Phase A: QA Sweep (141 failures across 13 hooks)

All content is built. What remains is fixing hook failures — the same sweep N5 went through.

| Hook | Failures | Files affected | Pattern |
|---|---|---|---|
| surface-match | 36 | 30 lessons + 6 grammar + 6 reviews | Kanji/kana mismatches, character names, Q&A text |
| particle-context | 21 | 6 lessons + 4 grammar + 7 reviews | Missing p_ka on question sentences |
| compose | 17 | 17 compose files | Ungated particles or non-kanji targets |
| structure | 15 | 4 grammar + 1 lesson + 9 reviews + compose.N4 | Warmup count, Drill 1 terms, review structure |
| kanji-scope | 11 | 4 grammar + 7 lessons | Untaught kanji in jp text |
| chip-order | 10 | 9 lessons + 1 review | Kana pair ordering |
| writing-forms | 7 | 2 grammar + 2 lessons + 3 stories | Kanji/hiragana enforcement |
| register | 6 | 6 lessons | Missing casual conversations |
| grammar-schema | 6 | 6 grammar files (G16, G18–G22) | Invalid field names or chip colors |
| form-scope | 5 | 1 compose + 1 grammar + 3 reviews | Conjugation forms before introducedIn |
| term-ids | 5 | 5 lessons | k_* IDs outside kanjiGrid |
| suffix-match | 1 | N4.30 | Term surface is strict suffix of match |
| suru-compound | 1 | N4.17 | noun_suru with conjugation form |

**Priority order:**
1. Batch fixes — grammar-schema (6 files), structure/Drill 1 terms, compose ungated particles
2. surface-match — heaviest count, but many are systematic (same patterns as N5)
3. particle-context — mostly missing p_ka, mechanical fix
4. kanji-scope — untaught kanji in jp text
5. chip-order, register, writing-forms — smaller batches
6. Remaining edge cases (form-scope, term-ids, suffix-match, suru-compound)

### Phase B: Stories

3 stories have writing-forms failures. Also need to assess N4.21–36 vocabulary coverage.

### Phase C: Game day planning (separate — not blocking QA)
