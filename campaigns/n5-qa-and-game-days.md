# N5 Campaign: Total QA & Game Days

> **Status:** Ready to start
> **Started:** —
> **Last updated:** 2026-03-20

---

## Goal

Complete the N5 level: fix all existing content issues, then build the remaining game days so N5 is a polished, playable experience.

## Current State

| Content type | Count | Status |
|---|---|---|
| Lessons | 18/18 | Complete — need QA pass |
| Grammar (G1–G12) | 12/12 | Complete — need QA pass |
| Reviews | 10 (9 numbered + Final) | Complete — need QA pass |
| Compose | 18/18 | Complete — need QA pass |
| Stories | 10 | Complete — need QA pass |
| Game days | 1/18 (Day 1 only) | **17 game days needed** |

## Phase 1: Term QA Sweep (all N5 content)

Run every existing N5 file through the validation hooks and fix what they catch. Priority order:

### 1a. Lessons (N5.1–N5.18)
- [ ] N5.1 — known issues: k_* IDs, polite_masu before N5.5, missing p_ka
- [ ] N5.2
- [ ] N5.3
- [ ] N5.4
- [ ] N5.5
- [ ] N5.6
- [ ] N5.7
- [ ] N5.8
- [ ] N5.9
- [ ] N5.10 — known issues: k_* IDs, 0 casual conversations
- [ ] N5.11
- [ ] N5.12
- [ ] N5.13
- [ ] N5.14
- [ ] N5.15
- [ ] N5.16
- [ ] N5.17
- [ ] N5.18

### 1b. Grammar (G1–G12)
- [ ] G1 — known issues: invalid color 'particle', missing p_ka, Drill 1 has terms
- [ ] G2
- [ ] G3
- [ ] G4
- [ ] G5
- [ ] G6
- [ ] G7
- [ ] G8
- [ ] G9
- [ ] G10
- [ ] G11
- [ ] G12

### 1c. Reviews (N5.Review.1–9, N5.Final.Review)
- [ ] N5.Review.1 through N5.Review.9
- [ ] N5.Final.Review

### 1d. Compose (compose.N5.1–compose.N5.18)
- [ ] All 18 compose files — run through hooks, fix particle gating and target issues

### 1e. Stories (10 stories)
- [ ] All 10 story terms.json files — verify particle/copula tagging

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
