# N5 Campaign: Total QA & Game Days

> **Status:** Phase 1 COMPLETE — Phase 2 not started
> **Started:** 2026-03-25
> **Last updated:** 2026-03-26
> **Audit result:** 68 files, 15 hooks, **0 failures** (1,020 checks all passing)
> **Original baseline:** 154 failures → 147 failures (hook fixes) → **0 failures** (content fixes via PRs #491, #492, #494, #495)

---

## Goal

Complete the N5 level: fix all existing content issues, then build the remaining game days so N5 is a polished, playable experience.

## Current State

| Content type | Count | Status |
|---|---|---|
| Lessons | 18/18 | **CLEAN** — all 18 pass all hooks |
| Grammar (G1–G12) | 12/12 | **CLEAN** — all 12 pass all hooks |
| Reviews | 10 (9 numbered + Final) | **CLEAN** — all 10 pass all hooks |
| Compose | 18/18 | **CLEAN** — all 18 pass all hooks |
| Stories | 10 | **CLEAN** — all 10 pass all hooks |
| Game days | 1/18 (Day 1 only) | **17 game days needed** |

### Audit History

| Date | Failures | Notes |
|---|---|---|
| 2026-03-25 (initial) | 154 | Baseline audit across 12 hooks |
| 2026-03-25 (hook fixes) | 147 | polite_masu scope fix, surface-match reading fallback, CJK lookbehind fix |
| 2026-03-26 (PR #491/#492) | ~50 | `claude/n5-campaign-HLR8g` — bulk content fixes across lessons, grammar, reviews, compose |
| 2026-03-26 (PR #494) | ~10 | `claude/standardize-reading-qa-japanese-VoxTm` — reading section QA standardization |
| 2026-03-26 (PR #495) | **0** | `claude/review-n5-campaign-NjZpQ` — final sweep, all remaining issues resolved |

---

## Phase 1: Term QA Sweep (all N5 content) — COMPLETE

All 68 N5 files pass all 15 validation hooks (1,020 checks, 0 failures). Completed via PRs #491, #492, #494, #495.

### 1a. Lessons (N5.1–N5.18) — CLEAN

- [x] N5.1–N5.18 — all 18 lessons pass all hooks

### 1b. Grammar (G1–G12) — CLEAN

- [x] G1–G12 — all 12 grammar lessons pass all hooks

### 1c. Reviews (N5.Review.1–9, N5.Final.Review) — CLEAN

- [x] N5.Review.1–9 + N5.Final.Review — all 10 review files pass all hooks

### 1d. Compose (compose.N5.1–compose.N5.18) — CLEAN

- [x] compose.N5.1–compose.N5.18 — all 18 compose files pass all hooks

### 1e. Stories (10 stories) — CLEAN

- [x] All 10 story terms.json files pass all hooks

---

## Phase 2: Game Days (Day 2–Day 18)

Build the remaining 17 game days following the N5_GAME_ROADMAP.md spec.

**Key structural rules from the roadmap:**
- One game day per lesson (Day X = N5.X vocabulary/kanji)
- Days 1–4: house interior only (no outside world)
- Day 5: can leave the house (行/来/店/駅 unlocked)
- Day 9: can enter buildings (中/外 unlocked)
- Day 12: school appears (学/校 unlocked)
- Days 1–11: Golden Week vacation
- No combat in N5 — atmospheric horror only

### Game day build order
- [ ] Day 2 — first collectible item (水)
- [ ] Day 3 — money system introduced
- [ ] Day 4 — smartphone from Dad
- [ ] Day 5 — can leave the house (major milestone)
- [ ] Day 6
- [ ] Day 7
- [ ] Day 8
- [ ] Day 9 — can enter buildings (major milestone)
- [ ] Day 10 — 休み unlocks, Golden Week formalized
- [ ] Day 11
- [ ] Day 12 — school appears (major milestone)
- [ ] Day 13
- [ ] Day 14
- [ ] Day 15
- [ ] Day 16
- [ ] Day 17
- [ ] Day 18

## Open Questions

- [ ] Game day JSON schema — does GAME_SYSTEMS.md define the format, or do we need to design it from Day 1's structure?
- [ ] Art assets — which game days need new backgrounds/sprites? (Coordinate with RikizoArtPipeline.md)
- [ ] How much narrative scripting per day vs. free exploration?
