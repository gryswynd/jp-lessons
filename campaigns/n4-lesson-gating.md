# N4 Lesson Gating

> **Status:** Planning — audit complete, no fixes applied
> **Started:** 2026-04-22
> **Parent:** spun out from `campaigns/vocab-reinforcement-audit.md`

---

## Goal

Fill in `unlocksAfter` fields for all N4 lessons. Currently only `N4.1` has a gate (to `N5.Final.Review`); lessons `N4.2`–`N4.36` have no `unlocksAfter` at all, meaning the web app has no explicit progression constraints on them. N5 has every lesson gated explicitly, so this is a parity gap.

## Audit Results

All 35 N4 lessons from `N4.2` through `N4.36` are missing `unlocksAfter`. Two classes of fix:

### Trivial fixes (18 lessons) — first-of-pair → previous pair's review

Matches the established N5 pattern (`N5.3 → N5.Review.1`, `N5.5 → N5.Review.2`, `N5.7 → N5.Review.3`, `N5.11 → N5.Review.5`, `N5.9 → N5.Review.4` after the recent fix). Each odd-numbered lesson ≥ 3 gates on the previous review:

| Lesson | `unlocksAfter` |
|---|---|
| N4.3 | N4.Review.1 |
| N4.5 | N4.Review.2 |
| N4.7 | N4.Review.3 |
| N4.9 | N4.Review.4 |
| N4.11 | N4.Review.5 |
| N4.13 | N4.Review.6 |
| N4.15 | N4.Review.7 |
| N4.17 | N4.Review.8 |
| N4.19 | N4.Review.9 |
| N4.21 | N4.Review.10 |
| N4.23 | N4.Review.11 |
| N4.25 | N4.Review.12 |
| N4.27 | N4.Review.13 |
| N4.29 | N4.Review.14 |
| N4.31 | N4.Review.15 |
| N4.33 | N4.Review.16 |
| N4.35 | N4.Review.17 |

(Note: `N4.3` is the first entry since `N4.1` already gates to `N5.Final.Review`, and `N4.2` is a second-of-pair case handled below.)

### Non-trivial fixes (17 lessons) — second-of-pair → grammar or prior lesson

Each even-numbered N4 lesson sits after its pair's first lesson, possibly with grammar modules between them. The correct gate depends on the grammar structure:

| Lesson | Candidates for `unlocksAfter` | Notes |
|---|---|---|
| N4.2 | N4.1 | No grammar between N4.1 and N4.2 |
| N4.4 | G13 | G13 unlocksAfter N4.3 |
| N4.6 | G14, G15 (latest) — check chain | Both unlock after N4.5 |
| N4.8 | G16 | G16 unlocksAfter N4.6 → would need chaining; likely N4.7 |
| N4.10 | G17 | G17 unlocksAfter N4.7 (pair 4 mid) |
| N4.12 | (none?) | No grammar between N4.11 and N4.12 |
| N4.14 | (none?) | |
| N4.16 | (none?) | |
| N4.18 | (none?) | |
| N4.20 | (none?) | |
| N4.22 | G23 | G23 unlocksAfter N4.21 |
| N4.24 | G24 | G24 unlocksAfter N4.23 |
| N4.26 | G25 | G25 unlocksAfter N4.25 |
| N4.28 | G26 | G26 unlocksAfter N4.27 |
| N4.30 | (none?) | |
| N4.32 | G28, G29 (latest) | Both unlock after N4.31 |
| N4.34 | (none?) | |
| N4.36 | (none?) | |

**Each "candidate" row needs verification by reading the actual lesson content / prerequisites** — the grammar ID column is derived from `unlocksAfter` values in the manifest's `grammar` section, but a given lesson may not actually require a grammar module even if one exists in its slot. Rows with `(none?)` need verification that no grammar sits between the two lessons in the pair.

## Approach

1. Apply the 17 trivial fixes (first-of-pair → prev review) as one commit — mechanical, no content inspection needed.
2. For the 17 non-trivial second-of-pair fixes, verify each one against the lesson's actual grammar dependencies (skim the lesson JSON for references to grammar concepts, or check the relevant `G*.json` for which lessons it references).
3. Apply the non-trivial fixes as a second commit with per-lesson justification in the message.

## Why deferred

Split out from `campaigns/vocab-reinforcement-audit.md` because:
- Large scope (35 values, 17 needing per-lesson verification) would dilute the vocab-reinforcement campaign's focus.
- Orthogonal to the vocab-reinforcement rule — the rule derives its lesson→story→review map from lesson IDs (`⌈N/2⌉`), not from `unlocksAfter` chains.
- Lower urgency than remediating orphaned vocab.
