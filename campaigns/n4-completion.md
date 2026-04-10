# N4 Campaign: Full Refresh & Completion

> **Status:** QA Sweep — 90 real failures remaining (down from 141; 51 were hook false positives, now fixed)
> **Started:** 2026-03-25
> **Last updated:** 2026-04-10
> **Audit baseline:** 131 files, 90 failures across 11 hooks (run `bash hooks/audit-all.sh N4` to regenerate)

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

### Phase A: QA Sweep (90 real failures across 11 hooks)

All content is built. Hook false positives fixed (35 eliminated Apr 10). What remains is real content fixes.

| Hook | Failures | Pattern |
|---|---|---|
| particle-context | 5 | p_kara→p_tekara, p_demo→p_demo_but |
| compose | 17 | "Close/wrap up" wording before challengePrompts, non-kanji targets |
| structure | 15 | Drill 1 terms, missing review instructions, contracted forms |
| surface-match | 11 | p_to_quote→p_tte_quote (って not と), 2 missing surfaces |
| kanji-scope | 11 | Untaught kanji in jp text |
| chip-order | 10 | Kana pair ordering in terms[] |
| grammar-schema | 6 | meta.particles as IDs not strings, missing pattern labels |
| writing-forms | 5 | Hiragana forms when kanji taught (あした→明日, できる→出来る) |
| term-ids | 5 | k_* IDs outside kanjiGrid, unknown forms/IDs |
| form-scope | 3 | Particles used before introducedIn lesson |
| suffix-match | 1 | p_nda surface "んだ" leaving "な" untagged in "なんだ" |
| suru-compound | 1 | noun_suru with conjugation form |
| ~~register~~ | ~~0~~ | ~~Fixed — hook regex broadened (Apr 10)~~ |

**Hook fixes applied (Apr 10):**
- surface-match: skip char_* names in spk field; fix kanji fallback to check both reading AND original surface; relax CJK lookbehind for compounds not in glossary (e.g. 何色, 鳥肉料理)
- register: broaden casual speech regex (added だった, たよ/たね, るよ/るね, plain desire たい, volitional)
- writing-forms: skip ようか suffix matches (volitional, not 八日)
- form-scope: fallback scope for review files with non-standard IDs
- particle-context: only require p_ka when text actually contains か (not for ？-only questions, English MCQs, or casual は？ quiz questions)

**Priority order:**
1. Batch fixes — grammar-schema (6 files), structure (Drill 1 terms + missing instructions), compose wording
2. particle-context — mostly missing p_ka, mechanical fix
3. surface-match — all p_to_quote→p_tte_quote, mechanical fix
4. kanji-scope — untaught kanji in jp text
5. chip-order, writing-forms, term-ids — smaller batches
6. Remaining edge cases (form-scope, suffix-match, suru-compound)

### Phase B: Stories

3 stories have writing-forms failures (できる→出来る, ところ→所). Also need to assess N4.21–36 vocabulary coverage.

### Phase C: Game day planning (separate — not blocking QA)
