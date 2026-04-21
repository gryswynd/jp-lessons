# N3 Campaign: Vocabulary Roadmap & Content Production

> **Status:** In Progress — Glossary Build-Out
> **Started:** 2026-04-20
> **Last updated:** 2026-04-20

---

## Goal

Build the N3 level from the ground up: finalize the vocabulary roadmap, create all content lessons, grammar lessons, reviews, compose files, and stories.

## Current State

| Content type | Exists | Notes |
|---|---|---|
| Vocabulary roadmap | **Locked** | `N3-kanji-lesson-plan.md` — 86 lessons, 348 kanji |
| Glossary | **In progress** | `glossary.N3.json` — 618 entries covering N3.1–N3.36. Chunks 1–4b approved |
| Grammar (G32–G49) | 18/18 JSON files exist | **Empty stubs** (title + meta + sections:[]) — not built, contrary to previous note |
| Content lessons | 0 | No N3.X lesson files |
| Reviews | 0 | No review files |
| Compose | 0 | No compose files |
| Stories | 0 | No story files |
| Game days | 0 | No game structure |
| Manifest entries | TBD | N3 lessons not yet in manifest |

## Glossary Build-Out Progress

Chunked into 8 batches with approval gates. See plan: `~/.claude/plans/fuzzy-roaming-breeze.md`

| Chunk | Lessons | Kanji | Entries added | Status |
|---|---|---|---|---|
| Pre-flight | — | — | Fixes only | Done — ID renames (k_yo_3, k_hatsu_2, k_ka_4, k_you_2), lesson_ids fixes (v_zangyou, v_yotei, v_yoyaku) |
| 1 | N3.11–N3.13 | 12 | 51 (12k + 39v) | Approved |
| 2 | N3.14–N3.20 | 28 | 140 (28k + 112v) | Approved |
| 3 | N3.21–N3.26 | 24 | 95 (24k + 71v) | Approved |
| 4a | N3.27–N3.32 | 24* | 87 (24k + 63v) | Approved |
| 4b | N3.33–N3.36 | 16 | 82 (16k + 66v) | Approved |
| 5 | N3.37–N3.44 | 32 | ~110 est. | Not started |
| 6 | N3.45–N3.55 | 47 | ~165 est. | Not started |
| 7 | N3.56–N3.70 | 61 | ~210 est. | Not started |
| 8 | N3.71–N3.86 | 64 | ~220 est. | Not started |

*N3.29 予 (k_yo_3) already existed from pre-flight — 23 new kanji, not 24.

**Rescan fix entries (25 total):** After user caught 可愛い missing, full rescan of all chunks found 25 missed words. 18 vocab for N3 glossary + v_tairyoku in N4 glossary (体+力 both N4). + 7 RPG/game terms (必殺, 戦い, 戦力, 命中, 最強, 守備, 守備力). Matches[]-only game terms (攻撃, 回復, etc.) rejected by user. 留守 deferred to later lesson per user.

### Policies established during build-out

- **ID collisions:** Every ID globally unique across N5+N4+N3. Suffix `_2`, `_3`, `_4` on collision.
- **Hybrid surfaces (matches[]):** Default: keep hybrid to reinforce taught kanji (じゅん備, 直せつ, 責にん). Exception: full kana for set-phrase exclamations where kanji parsing isn't the goal (かんぱい).
- **lesson_ids:** Earliest lesson where the word can be written (full kanji or via matches[]).
- **Grammar-adjacent vocab:** Dictionary-form vocab from grammar points lands in the host lesson (per G→lesson mapping). Compound particles go to `shared/particles.json`.
- **Exhaustive Vocab Scan:** 7 mandatory checks per kanji (primary form, noun forms, compound scan, compound verbs, suffix patterns, matches[] for high-frequency, antonym/pair).

### Grammar → Host-Lesson Vocab Delivered

| Grammar | Host lesson | Vocab added | Status |
|---|---|---|---|
| G36 (はずだ/わけだ) | N3.14 | はず, わけ | Done (chunk 2) |
| G37 (ところだ/たばかり) | N3.18 | ところ, ばかり | Done (chunk 2) |
| G39 (Adverbs of Degree) | N3.26 | かなり, ずいぶん, なかなか, ほとんど, ちっとも, わりに, やや, ほぼ | Done (chunk 3) |
| G40 (敬語) | N3.34 | いらっしゃる, おっしゃる, めしあがる, なさる, ございます, 伺う, 参る, 申す, 拝見する, ご覧になる | Done (chunk 4b) |
| G38 (Particles) | N3.22 | → particles.json (not glossary) | Deferred |
| G41–G49 | N3.38+ | Various | Not yet |

## Vocab Debt from N4 Stories (introduce early in N3)

The following words were used as untagged story-context in `furima-no-hi` (N4.21+N4.22) because they had no glossary entries at time of writing. They are common, natural words that came up organically and should be taught **early in N3** (Phase 1 or early Phase 3):

| Word | Reading | Meaning | Notes |
|---|---|---|---|
| ならべる | ならべる | to arrange; to line up | Intransitive: ならぶ. Both forms useful. |
| 見つける | みつける | to find; to discover | Very common narrative verb. |
| つける | つける | to attach; to put on | Also means "to turn on" (light, etc.) — multiple senses. |
| しばらく | しばらく | for a while; a little while | Common time expression. |
| やっぱり | やっぱり | as expected; after all; still | Casual register; formal is やはり. |

Also flag for early N3 vocabulary:
- `はこ` (box) — used as untagged kana in furima-no-hi because not in N5/N4 glossary; tokenizes incorrectly as `は`+`こ` particle split. Add to N3 early.
- `として` (as; in the capacity of) — compound particle used in furima-no-hi, no p_* ID exists in particles.json. Add as particle or grammar point.

---

## Phase 1: Vocabulary Roadmap (BLOCKING — everything depends on this)

The N3 vocabulary roadmap determines which kanji and words go in which lesson, which determines the taught-kanji set for every piece of content.

### Tasks
- [x] Read `N3-kanji-lesson-plan.md` — **locked: 86 lessons, 348 kanji**
- [x] Read `N3-regroup-working.md` — regrouping applied, [FREE] annotations used for compound scan
- [x] Finalize lesson count — **86 lessons**
- [x] Finalize kanji allocation per lesson — **locked in N3-kanji-lesson-plan.md**
- [ ] Update `glossary.N3.json` with all entries — **in progress (N3.1–N3.32 done, N3.33–N3.86 remaining)**
- [ ] Add N3 lesson entries to `manifest.json` with kanji arrays

### Key decisions made
- [x] 86 N3 lessons (348 kanji, 4 per lesson with exceptions: 5 for N3.6/56/57/60/84, 3 for N3.73)
- [x] Lesson themes and groupings — locked in kanji plan
- [x] Grammar points paired with content lessons — G32–G49 mapped to host lessons via unlocksAfter
- [ ] unlocksAfter chain for G32–G49 — values set in stubs, need QA pass

## Phase 2: Grammar QA (G32–G49)

18 grammar lesson JSON files already exist in `data/N3/grammar/`:

| ID | Topic | File exists | QA'd |
|---|---|---|---|
| G32 | Relative Clauses & Noun Modification | Yes | No |
| G33 | Nominalizers: の and こと | Yes | No |
| G34 | Volitional Form & Intentions | Yes | No |
| G35 | Conjecture & Inference (ようだ / みたいだ / らしい) | Yes | No |
| G36 | Expectation & Reasoning (はずだ / わけだ) | Yes | No |
| G37 | Aspect & Temporal States (ところだ / たばかり) | Yes | No |
| G38 | Sentence-Ending Particles & Register | Yes | No |
| G39 | Adverbs of Degree | Yes | No |
| G40 | Honorific & Humble Speech (敬語 Introduction) | Yes | No |
| G41 | Time Clauses (間 / うちに / 以来 / とたん) | Yes | No |
| G42 | Perspective & Relation Particles | Yes | No |
| G43 | Causative-Passive & Advanced Voice | Yes | No |
| G44 | Suffixes & Word Formation (っぽい / がち / 気味 / ～やか) | Yes | No |
| G45 | Advanced Conditionals & Wishes | Yes | No |
| G46 | Quoting & Indirect Speech | Yes | No |
| G47 | Compound Expressions & Set Patterns | Yes | No |
| G48 | Advanced Connectors | Yes | No |
| G49 | N3 Grammar Capstone Review | Yes | No |

### QA tasks
- [ ] Run all 18 files through validate-grammar-schema hook
- [ ] Verify section field names (annotatedExample→examples[], etc.)
- [ ] Verify meta.particles uses strings not IDs
- [ ] Verify conversation sections have full terms[] tagging
- [ ] Verify sentenceTransform items have choices[]
- [ ] Set correct unlocksAfter values based on vocab roadmap
- [ ] Add G32–G49 to manifest.json

## Phase 3: Content Lessons

Once the vocabulary roadmap is finalized:

- [ ] Build N3.1 through N3.? (lesson count TBD)
- [ ] Each lesson goes through the full 4-agent pipeline
- [ ] Hooks enforce kanji scope, term IDs, grammar gating automatically
- [ ] New conjugation forms for N3 grammar need conjugation_rules.json entries

### N3 grammar forms that may need adding to conjugation_rules.json
- Relative clause forms (plain form + noun)
- の/こと nominalizer patterns
- Volitional + とする / と思う
- Conjecture forms (ようだ, みたいだ, らしい)
- はずだ, わけだ patterns
- ところだ, たばかり aspectual forms
- 敬語 forms (いらっしゃる, おっしゃる, etc.)
- Causative-passive compound forms
- Advanced conditional forms

## Phase 4: Supporting Content

Built after content lessons are stable:

- [ ] Reviews — plan review ranges and build
- [ ] Compose files — one per lesson, 10+ prompts each (late-level range)
- [ ] Stories — plan themes, build with proper terms.json
- [ ] Add all content to manifest.json

## Phase 5: Game Day Planning

- [ ] Decide if N3 gets game days (or if the Godot migration means building game content natively)
- [ ] If yes: create N3_GAME_ROADMAP.md
- [ ] Narrative arc for N3 (continuation of Rikizo's story?)

## Dependencies

- **Blocks on N4 completion:** Students must finish N4 before N3. N3 content assumes all N4 kanji, vocab, and grammar are mastered.
- **Blocks on vocab roadmap:** Every other phase depends on knowing which kanji/vocab go in which lesson.
- **Grammar QA can start immediately** — G32–G49 files exist and can be validated against GRAMMAR_CONTENT.md spec without waiting for the vocab roadmap.

## Priority Order

1. **Grammar QA (G32–G49)** — can start now, no blockers
2. **Vocabulary roadmap finalization** — blocks everything else
3. **Glossary + manifest setup** — enables content lesson production
4. **Content lessons** — the main production phase
5. **Compose, reviews, stories** — after lessons are stable
6. **Game planning** — last, may merge with Godot migration
