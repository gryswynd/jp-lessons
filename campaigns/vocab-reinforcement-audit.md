# Vocab Reinforcement Audit

> **Status:** Planning — rule locked, no remediation started
> **Started:** 2026-04-21
> **Last updated:** 2026-04-21

---

## Goal

Every non-exempt vocabulary term introduced in a lesson must be reinforced in its pair-story and pair-review, so students see it in at least three authored contexts before they're expected to retain it.

The campaign has two halves:
1. **Establish the rule** — document it, write a validation hook, fix the manifest bugs that break the mapping.
2. **Close existing gaps** — audit N5 and N4, remediate every orphaned vocab term.

## The Rule

> Every non-exempt vocab term introduced in lesson N must appear in at least one tagged `jp` sentence in **all three** of:
> - Lesson N itself (conversation, reading, or warmup)
> - Story ⌈N/2⌉ (the pair-story)
> - Review ⌈N/2⌉ (the pair-review)

**Exempt classes (no reinforcement required):**
- Filler sounds / interjections (うーん, えー, さあ, へえ, etc.)
- Counter-number variants (八人, 八月, 三枚, etc. — already validated by counter hook)

**Permitted but NOT required reinforcement surfaces:**
- Dojo specials (scrambles, link-ups, game days)
- Compose files
- Grammar-lesson example sentences
- Capstone stories (see below)
- Future lessons (post-introduction)

**Capstone stories** are N-level-wide narrative finales that thematically tie together the whole level. They count as reinforcement if vocab happens to appear there, but are not required targets. Current capstones:
- N5: `rikizo-to-ookii-sakana` (Rikizo and the Big Fish)
- N4: `rikizo-journey` (りきぞの旅)
- N3: 2–4 capstones expected (TBD given N3's size)

## Lesson → Story / Review Mapping

The mapping is deterministic: **pair index `k = ⌈N/2⌉`**. Story k and Review k both cover lessons `(2k-1, 2k)`.

### N5 mapping

| Pair k | Lessons | Review | Story |
|---|---|---|---|
| 1 | N5.1, N5.2 | N5.Review.1 | my-family |
| 2 | N5.3, N5.4 | N5.Review.2 | tanjoubi-no-keeki |
| 3 | N5.5, N5.6 | N5.Review.3 | kazoku-ga-kimasu |
| 4 | N5.7, N5.8 | N5.Review.4 | restoran-to-kaimono |
| 5 | N5.9, N5.10 | N5.Review.5 | kyuujitsu-no-rikizo |
| 6 | N5.11, N5.12 | N5.Review.6 | ame-no-hi-no-gakkou |
| 7 | N5.13, N5.14 | N5.Review.7 | yonde-kaite |
| 8 | N5.15, N5.16 | N5.Review.8 | kita-minami-higashi-nishi |
| 9 | N5.17, N5.18 | N5.Review.9 | kaisha-de-no-arubaito |
| capstone | all N5 | N5.Final.Review | rikizo-to-ookii-sakana |

### N4 mapping

TBD — must be derived in Phase 1 and added here. N4 has 36 lessons = 18 pairs, plus 2 half reviews and 1 final review, plus the `rikizo-journey` capstone.

## Learning Path Context

The rule is anchored to the actual student progression:

```
Lesson 2k-1 → Grammar module(s) → Lesson 2k → Grammar module(s) → UNLOCK GATE
                                                                        ↓
                                    Review k + Story k + Dojo specials (scramble/link-up) unlock together
```

All three reinforcement surfaces (review, story, dojo specials) unlock on the same gate: *"2 lessons + their grammar modules all passed."*

## Phase 1: Establish the Rule

### 1a. Manifest `unlocksAfter` fixes — N5 COMPLETE ✓

N5 pair story/review `unlocksAfter` values corrected to fire at the end of each pair's learning path (after the pair's lessons + any pair-end grammar):

- [x] `tanjoubi-no-keeki`: N5.3 → N5.4
- [x] `restoran-to-kaimono`: N5.8 → G9 (pair-end grammar)
- [x] `N5.Review.4`: N5.8 → G9 (pair-end grammar)
- [x] `kyuujitsu-no-rikizo`: N5.10 → G11 (pair-end grammar)
- [x] `yonde-kaite`: N5.13 → N5.14
- [x] `kita-minami-higashi-nishi`: N5.15 → N5.16
- [x] `kaisha-de-no-arubaito`: N5.17 → N5.18
- [x] `rikizo-to-ookii-sakana` (capstone): N5.18 → N5.Final.Review
- [x] **Cycle fix:** `G9`: N5.Review.4 → N5.8 (old value created circular dependency once review unlocked after G9)

### 1a-bis. N4 capstone fix — DONE ✓

- [x] `rikizo-journey` (capstone): N4.33 → N4.Final.Review

### 1a-ter. N4 pair-end grammar — OPEN

N4 has 7 pairs with grammar modules that unlock at the pair's end lesson (analogous to N5's G9 @ N5.8 and G11 @ N5.10). Under the learning-path rule ("review + story unlock after all pair grammar"), these would each require 2 manifest edits:

| Pair | End-lesson | Pair-end grammar | Story | Review |
|---|---|---|---|---|
| 3 | N4.6 | G16 | hirugohan-monogatari @ N4.6 → G16 | N4.Review.3 @ N4.6 → G16 |
| 5 | N4.10 | G18, G19 (latest G19) | machi-no-eigakan @ N4.10 → G19 | N4.Review.5 @ N4.10 → G19 |
| 7 | N4.14 | G20 | uta-to-shigoto @ N4.14 → G20 | N4.Review.7 @ N4.14 → G20 |
| 8 | N4.16 | G21 | hashiru-asa @ N4.16 → G21 | N4.Review.8 @ N4.16 → G21 |
| 9 | N4.18 | G22 | jitensha-de-kyouto-e @ N4.18 → G22 | N4.Review.9 @ N4.18 → G22 |
| 15 | N4.30 | G27 | taifuu-no-omoide @ N4.30 → G27 | N4.Review.15 @ N4.30 → G27 |
| 17 | N4.34 | G30, G31 (latest G31) | new-city @ N4.34 → G31 | N4.Review.17 @ N4.34 → G31 |

**14 proposed edits, awaiting user sign-off.** The existing values aren't necessarily broken — they just let the review/story unlock before the pair's final grammar. Whether to tighten is a product decision.

### 1a-quater. Unrelated inconsistency observed

While auditing, noticed `N5.9.unlocksAfter = G9`, but most other N5 lessons that start a new pair unlock after the previous review (`N5.3 → N5.Review.1`, `N5.5 → N5.Review.2`, `N5.7 → N5.Review.3`, `N5.11 → N5.Review.5`). If the intended rule is "next pair's first lesson waits for the previous review", `N5.9` should probably be `N5.Review.4` instead of `G9`. **Out of scope for this campaign unless user confirms.**

### 1b. Validation hook

New hook: `hooks/validate-vocab-reinforcement.sh`

**Inputs:** glossary file (per level), manifest, all lesson/story/review JSONs.
**Logic:**
1. Derive the pair map (`k = ⌈N/2⌉` → lessons, story file, review file) from manifest.
2. For each non-exempt term introduced in lesson N (via lesson `meta.vocab` or glossary `introducedIn`):
   - Confirm the term ID appears in lesson N's `terms[]` for at least one jp-bearing item.
   - Confirm the term ID appears in the pair-story's `terms.json` (or `terms[]`).
   - Confirm the term ID appears in the pair-review's `terms[]`.
3. Report gaps per term with suggested reinforcement surface.

**Exemption logic:** skip terms whose glossary entry has `class: "interjection"`, `counter: true`, or tag matching filler pattern. (Finalize exemption detection in Phase 1b implementation.)

**Edge-case handling:**
- Missing downstream artifact (story or review doesn't exist yet): warn-not-fail, campaign tracks for when the artifact gets built.
- `noun_suru` + `v_suru` with same lemma: treat as one vocab item; reinforcement on either satisfies both.
- Grammar-lesson-introduced vocab: G-files don't introduce vocab for tracking purposes (grammar scope only).

- [ ] Write `hooks/validate-vocab-reinforcement.sh`
- [ ] Add to `hooks/audit-all.sh` N-level runner
- [ ] Add to `hooks/.claude-hooks.json` or equivalent for per-edit runs

## Phase 2: N5 Audit

- [ ] Run validation hook against N5
- [ ] Produce gap list grouped by lesson (pair)
- [ ] Prioritize: lesson-missing > review-missing > story-missing (lesson gaps are worst — vocab introduced and not used in its own lesson)
- [ ] Remediation per gap:
  - Prefer modifying an existing sentence (e.g., swap a synonym for the missing vocab)
  - If no natural fit, add a new sentence in the smallest possible warmup/reading slot
  - Never force vocab into unnatural contexts

## Phase 3: N4 Audit & Remediation

Same as Phase 2, scoped to N4. Must wait on N4 story `unlocksAfter` audit from Phase 1a.

## Phase 4: Docs Update

- [ ] Add rule to `CLAUDE.md` Critical Rules section (short summary)
- [ ] Expand rule in `skills/grammar-rules-reinforcement.md` (full statement, exemptions, edge cases)
- [ ] Add failure modes to `skills/quality-gates-failures.md` (new FMs for the hook's catches)

## Exit Criteria

1. `hooks/validate-vocab-reinforcement.sh` exists, runs in CI, covers N5 + N4.
2. All 4 N5 story `unlocksAfter` bugs fixed in manifest.json.
3. All N4 story `unlocksAfter` bugs fixed in manifest.json.
4. N5 hook run: 0 failures.
5. N4 hook run: 0 failures.
6. CLAUDE.md + skill files updated with the rule.

## Known Constraints

- **N3 is out of scope** for now — N3 content is still in production (`campaigns/n3-production.md`). Once N3 lesson/story/review structure stabilizes, N3 will get its own audit pass.
- **Stories are authored content** — remediation may require editing existing story prose. Keep diffs minimal and preserve narrative voice; if a gap can't be closed without unnatural prose, escalate for a structural decision (e.g., is the vocab item actually appropriate for the lesson).
- **Review files have term budgets** — reviews can't absorb unlimited new terms. If a pair introduces too many vocab items to fit naturally in one review, the review may need expansion rather than cramming.
