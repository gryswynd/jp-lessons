# N4 Campaign: Full Refresh & Completion

> **Status:** Active — Lesson refresh through N4.30, G27 in progress
> **Started:** 2026-03-25
> **Last updated:** 2026-03-26
> **Audit:** 119 files, 205 failures across 12 hooks (mostly pre-refresh N4.1–N4.20 + unrefreshed N4.31–N4.36)

---

## Goal

Complete the entire N4 level: refresh all lessons to current standards, build missing grammar/compose/stories, QA everything, and plan game days.

## Current State

| Content type | Done | Total | Notes |
|---|---|---|---|
| Lesson refresh (N4.21–N4.36) | 10/16 | 16 | N4.21–N4.30 refreshed. N4.31–N4.36 remaining |
| Grammar (G13–G31) | 14/19 | 19 | G13–G26 exist. **G27 in progress.** G28–G31 not built |
| Compose (N4.21–N4.36) | 10/16 | 16 | compose.N4.21–N4.30 built. compose.N4.31–N4.36 missing |
| Stories | 17 | — | 4 new stories added (furima-no-hi, kenkyuu-to-sakubun, natsuyasumi-no-taiken, yuugata-no-mura) |
| Reviews | 18 numbered + 2 half + 1 final | — | Existing; need QA after content stabilizes |
| N4.1–N4.20 QA | not started | 20 | Legacy lessons — hooks show failures but not yet in scope |
| Game days | 0 | TBD | Planning phase |

### Hook status for refreshed files (N4.21–N4.30)

Hooks were run through N4.30. Remaining failures in the refreshed range:

| Hook | Failing files | Notes |
|---|---|---|
| `chip-order` | N4.22, N4.23, N4.26, N4.30 | Kana pair ordering |
| `compose` | compose.N4.21, .23, .24, .25, .27, .28 | Target vocab with no kanji |
| `kanji-scope` | N4.24, N4.27, N4.28 | Untaught kanji in jp text |
| `particle-context` | N4.24, N4.27, N4.28, N4.29 | Missing p_ka or disambiguation |
| `surface-match` | N4.21–N4.28, N4.30 | Term surfaces not matching jp text |
| `suru-compound` | N4.25, N4.28 | noun_suru with conjugation forms |
| `term-ids` | N4.25, N4.28 | Unknown term IDs |
| `register` | N4.24 | 0 casual conversations |
| `writing-forms` | N4.24 | Kana where kanji is taught |

---

## Phase 1: Lesson Refresh (N4.21–N4.36)

**Batch 1: N4.21–N4.27** (Permissions, Conditionals, ように patterns) — COMPLETE
- [x] N4.21 — permissions/prohibitions (てもいい, てはいけない)
- [x] N4.22
- [x] N4.23
- [x] N4.24
- [x] N4.25 — conditionals (たら, ば, なら, と) — major grammar milestone
- [x] N4.26
- [x] N4.27

**Batch 2: N4.28–N4.32** (Passive, Causative, Thoughts & Experience) — IN PROGRESS
- [x] N4.28
- [x] N4.29 — Typhoons, Clocks, and Knowing ✓ (lesson + compose.N4.29)
- [x] N4.30 — Thinking, Gathering & Answering ✓ (lesson + compose.N4.30)
- [ ] N4.31 — passive/causative forms introduced — major grammar milestone
- [ ] N4.32

**Batch 3: N4.33–N4.36** (Advanced patterns, Adjective change, Capstone)
- [ ] N4.33
- [ ] N4.34 — すぎる, てみる, ておく, てしまう — major grammar milestone
- [ ] N4.35
- [ ] N4.36 — final N4 lesson

## Phase 2: Grammar Lessons (G21–G31)

| ID | Topic | unlocksAfter | Status |
|---|---|---|---|
| G21 | Conversation Mechanics (相槌, hesitation) | N4.16 | **Built** |
| G22 | そうだ: Appearance & Hearsay | N4.18 | **Built** |
| G23 | Permissions & Prohibitions (てもいい, てはいけない, なくてもいい) | N4.21 | **Built** |
| G24 | Directional て-Form (てくる/ていく/てある) | N4.23 | **Built** |
| G25 | Obligations & Conditionals (なければ, ば, たら, なら, と) | N4.25 | **Built** |
| G26 | ように Patterns (ようにする / ようになる) | N4.27 | **Built** |
| G27 | Expressing Thoughts & Experience (と思う / たことがある) | N4.30 | **In progress** |
| G28 | Passive Form | N4.31 | Not built |
| G29 | Causative Form | N4.31 | Not built |
| G30 | Advanced Verb Usages (てみる, ておく, てしまう, すぎる, とする) | N4.34 | Not built |
| G31 | Advanced Adjective Patterns (くなる/になる, くする/にする) | N4.34 | Not built |

## Phase 3: Compose Files (N4.21–N4.36)

- [x] compose.N4.21–compose.N4.30 — built (10/16)
- [ ] compose.N4.31–compose.N4.36 — not built (6 remaining)

## Phase 4: Stories

17 stories exist (up from original 13):
- factory-owner, field-trip-day, furima-no-hi, hashiru-asa, hirugohan-monogatari, jitensha-de-kyouto-e, kazoku-no-kisetsu, kenkyuu-to-sakubun, library-book, machi-no-eigakan, natsuyasumi-no-taiken, new-city, rikizo-journey, tabisaki-no-shashin, uta-to-shigoto, watashi-no-iro, yuugata-no-mura

### Remaining
- [ ] Assess story coverage across N4.21–N4.36 vocabulary
- [ ] Plan additional stories if gaps exist

## Phase 5: Reviews

### Existing reviews to QA
- [ ] N4.Review.11 through N4.Review.18 — run through hooks, fix issues
- [ ] N4 Half Review 2 — verify coverage
- [ ] N4.Final.Review — may need refresh for consistency

### Potential new reviews needed
- Reviews typically cover 2-lesson ranges. With N4.21–N4.36 refreshed, verify coverage is complete.

## Phase 6: QA All Grammar Lessons (G13–G31)

Once all grammar lessons exist, run the full set through validation:
- [ ] G13–G20 (existing legacy) — run through hooks and fix issues
- [ ] G21–G26 (newly built) — verify against hooks
- [ ] G27–G31 (to be built) — should pass hooks from creation

## Phase 7: Game Day Planning

No N4 game days exist yet. Planning needed:
- [ ] Define N4 game day structure — does the "Golden Week" narrative continue, or is N4 a new arc?
- [ ] Decide scope: 36 game days (one per lesson) or condensed format?
- [ ] Create N4_GAME_ROADMAP.md if proceeding

## Priority Order

1. **G27** → in progress now
2. **N4.31–N4.36 refresh** → unlocks G28, G29, G30, G31
3. **G28–G31** → build after lesson prerequisites are refreshed
4. **compose.N4.31–N4.36** → build alongside lesson refreshes
5. **Hook QA for N4.21–N4.30** → 205 failures need fixing (many in legacy N4.1–N4.20)
6. **Stories** → assess coverage gaps
7. **Reviews QA** → after all content is stable
8. **Game day planning** → last priority for N4
