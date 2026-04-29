# N3 Campaign: Vocabulary Roadmap & Content Production

> **Status:** In Progress — Glossary Build-Out (Full-Coverage Rescan phase)
> **Started:** 2026-04-20
> **Last updated:** 2026-04-29 (rescan N3.45 complete)

---

## Session Continuation — Glossary Build-Out

**For the next session:** Read this campaign file + the plan at `campaigns/n3-glossary-build-plan.md`. The plan contains the full Exhaustive Vocab Scan protocol (updated 2026-04-22), Grammar→Host-Lesson mapping, ID collision rules, managed kana-gap policies, per-chunk workflow, and the full-coverage rescan tracking table.

### Where we are
- **Glossary covers N3.1–N3.55** (1198 entries as of 2026-04-29)
- **Full-Coverage Rescan: N3.1–N3.54 complete (54/55)** — N3.55 remaining
- **After rescan:** continue with chunks 7–8 (N3.56–N3.86) using full-coverage protocol from the start

### Full-coverage rescan progress (N3.1–N3.55)
| Status | Lessons | Count |
|---|---|---|
| ✅ Rescanned | N3.1–N3.54 | 54 |
| Remaining | N3.55 | 1 |

**Notable fixes / relocations from rescan so far:**
- v_zangyou (残業): N3.77 → N3.1 (業 is N4.36, not N3.77)
- v_kiki (危機): N3.9 → N3.61 (機 had a false note claiming N4.25, but 機 is N3.61)
- v_moushikomu / v_moushikomi (申し込む/申し込み): N3.37 → N3.58 (申 taught at N3.58)
- v_nedan (値段): N3.41 → N3.61 (段 taught at N3.61, removes need for matches)
- G34 つもり, G35 ようだ/みたいだ/らしい, G37 ばかり: all added (were missing from Grammar→Host table delivery)
- N5/N4 maintenance promotions to kanji surface (with kana matches):
  v_dare (誰), v_kun (君), v_yoi (良い), v_hoshii (欲しい), v_isogashii (忙しい)
- N5/N4 note updates (kanji-introduction reached): v_issho (緒→N3.4), v_shuumatsu (末→N3.4)
- G40 keigo policy fix at N3.34: entries whose kanji are not on N3 plan now use kana surface with kanji in matches[] (v_ukagau, v_mousu, v_haikensuru, v_gorannninaru)
- N3.16 rebalanced: dropped 5 narrow/formal existing (初期, 最小, 最強, 未知, 未だ) to make room for 5 high-freq adds (最新, 最悪, 最終, 期末, 同期)
- Permanent matches[] for words whose partner kanji never lands on N3 plan:
  - 成功 (matches:["成こう"]) — 功 not on plan
  - 馬鹿 (matches:["馬か","ばか"]) — 鹿 not on plan
  - 実際 (matches:["じっ際","じっさい"]) — 際 not on plan (managed gap)
  - 位置 (matches:["い置"]) — 位 not on plan (managed gap)
- Deletions (deferred to N1 — partner kanji is N1-level):
  - v_rieki (利益) — 益 N1
  - v_kachi_2 (価値) — 価 N1
  - v_fukushi (福祉) — 祉 N1
  - v_touhyou (投票) — 票 N1 (deleted at N3.47 rescan)
  - v_taiho (逮捕) — 逮 N1 (deleted at N3.47 rescan)
  - v_kangei (歓迎) — 歓 N1 (deleted at N3.54 rescan)
- Deletions (deferred to N2 — partner kanji is N2-level):
  - v_kyousou (競争) — 競 N2 (deleted at N3.45 rescan; will be re-added at N2)
  - v_yubiwa (指輪) — 輪 N2 (deleted at N3.48 rescan)
  - v_shien (支援) — 援 N2 (deleted at N3.48 rescan)
  - v_shidou (指導) — 導 N2 (deleted at N3.48 rescan)
  - v_tanken (探検) — 検 not on N3 plan (deleted at N3.48 rescan)
  - v_kiroku (記録) — 録 N2 (deleted at N3.51 rescan)
  - v_dentou (伝統) — 統 N2 (deleted at N3.52 rescan)
  - v_ketsuron (結論) — 結 N2 (deleted at N3.53 rescan)
- 〜的 productive suffix entry deferred to N2/N1 (most foundational compounds need 般/基/個/具/効 not on N3 plan)
- G44 example note: 忘れっぽい flagged as canonical っぽい example for G44 lesson (not added to glossary because っぽい not introduced until N3.50)

### Known issues (fixed)
- ~~`v_shiharai` (支払い, N3.48) — missing `matches: ["支はらい"]`~~ Fixed 2026-04-22
- ~~`v_shiji` (指示, N3.48) — missing `matches: ["指じ"]`~~ Fixed 2026-04-22
- gtype inconsistency (pre-existing): `i_adj` vs `i-adj`, `na_adj` vs `na-adj` vs `na-adjective`, `verb` vs `godan/ichidan` — defer to separate cleanup

### Grammar-adjacent vocab remaining
- G46 (Quoting) → N3.58: って (quotative) → particles.json
- G47 (Set Patterns) → N3.64: にとって, に違いない, わけがない (expressions)
- G48 (Advanced Connectors) → N3.72: しかも, それに, そのうえ, ところが, なお, むしろ
- G49 (Capstone) → N3.84: none

### Grammar example-vocab suggestions (from rescan)
- G44 (Suffixes, N3.50) — use 忘れっぽい (わすれっぽい, forgetful) as a canonical っぽい example. Rejected from N3.1 glossary rescan because っぽい isn't introduced until G44; should appear here as a featured example sentence.

### Key rules (quick reference)
1. Never read glossary files in full — use targeted Grep/jq
2. Every ID globally unique across N5+N4+N3 — suffix `_2`, `_3` on collision
3. lesson_ids = earliest lesson where word is writable (full kanji or via matches[])
4. Run **Full-Coverage** Exhaustive Vocab Scan per kanji — all 104 N5 + 182 N4 + all prior N3 kanji (plan has the full 10-point checklist + complete kanji lists)
5. **Per-lesson approval** — present each lesson's additions individually, user approves/removes/adds
6. Collision check after every batch: `grep -oE '"id": "(k|v)_[a-z0-9_]+"' data/N{5,4,3}/glossary.N{5,4,3}.json | awk -F'"' '{print $4}' | sort | uniq -d`
7. Validate after every batch: `bash hooks/validate-json.sh data/N3/glossary.N3.json`

---

## Goal

Build the N3 level from the ground up: finalize the vocabulary roadmap, create all content lessons, grammar lessons, reviews, compose files, and stories.

## Current State

| Content type | Exists | Notes |
|---|---|---|
| Vocabulary roadmap | **Locked** | `N3-kanji-lesson-plan.md` — 86 lessons, 348 kanji |
| Glossary | **In progress** | `glossary.N3.json` — 970 entries covering N3.1–N3.55. Full-coverage rescan of N3.1–N3.55 required before chunks 7–8 |
| Grammar (G32–G49) | 18/18 JSON files exist | **Empty stubs** (title + meta + sections:[]) — not built, contrary to previous note |
| Content lessons | 0 | No N3.X lesson files |
| Reviews | 0 | No review files |
| Compose | 0 | No compose files |
| Stories | 0 | No story files |
| Game days | 0 | No game structure |
| Manifest entries | TBD | N3 lessons not yet in manifest |

## Glossary Build-Out Progress

Chunked into 8 batches with approval gates. See plan: `campaigns/n3-glossary-build-plan.md`

| Chunk | Lessons | Kanji | Entries added | Status |
|---|---|---|---|---|
| Pre-flight | — | — | Fixes only | Done — ID renames (k_yo_3, k_hatsu_2, k_ka_4, k_you_2), lesson_ids fixes (v_zangyou, v_yotei, v_yoyaku) |
| 1 | N3.11–N3.13 | 12 | 51 (12k + 39v) | Approved |
| 2 | N3.14–N3.20 | 28 | 140 (28k + 112v) | Approved |
| 3 | N3.21–N3.26 | 24 | 95 (24k + 71v) | Approved |
| 4a | N3.27–N3.32 | 24* | 87 (24k + 63v) | Approved |
| 4b | N3.33–N3.36 | 16 | 82 (16k + 66v) | Approved |
| 5a | N3.37–N3.40 | 16 | 77 (16k + 61v) | Approved |
| 5b | N3.41–N3.44 | 16 | 72+9 rescan (16k + 65v) | Approved + partial rescan |
| 6a | N3.45–N3.48 | 16 | 67 (16k + 51v) | Approved (needs full rescan) |
| 6b | N3.49–N3.52 | 16 | 67+8 rescan (16k + 59v) | Pending approval + partial rescan |
| 6c | N3.53–N3.55 | 12 | 39+7 rescan (12k + 34v) | Pending approval + partial rescan |
| 7 | N3.56–N3.70 | 61 | ~210 est. | Not started |
| 8 | N3.71–N3.86 | 64 | ~220 est. | Not started |

*N3.29 予 (k_yo_3) already existed from pre-flight — 23 new kanji, not 24.

**Rescan fix entries (25 total, rounds 1-2):** After user caught 可愛い missing, full rescan of all chunks found 25 missed words. 18 vocab for N3 glossary + v_tairyoku in N4 glossary (体+力 both N4). + 7 RPG/game terms (必殺, 戦い, 戦力, 命中, 最強, 守備, 守備力). Matches[]-only game terms (攻撃, 回復, etc.) rejected by user. 留守 deferred to later lesson per user.

**Rescan round 3 (24 entries, 2026-04-22):** User identified N3.55 was too light (missing 観察力, 警備員). Partial rescan of chunks 5b/6b/6c with 42-partner shortlist found 24 more entries (9+8+7). Also applied 2 matches[] fixes (v_shiharai, v_shiji). User then identified root cause: the 42-partner shortlist only covers 15% of the N5+N4 kanji set. **Full-coverage rescan of ALL N3 lessons (N3.1–N3.55) required** using the complete 286-kanji N5+N4 set. See plan file for updated protocol and per-lesson tracking table.

**6a candidates (NOT YET APPLIED — superseded by full rescan):** A partial scan of 6a (N3.45–N3.48) found 23 candidates. High-priority ones include: 支配 (しはい, control), 投稿 (とうこう, posting), 抱負 (ほうふ, ambition), 抜群 (ばつぐん, outstanding), 折り紙 (おりがみ, origami), 探偵 (たんてい, detective), 指名 (しめい, nomination). These will be re-evaluated during the full-coverage rescan — do not apply from this list.

### Policies established during build-out

- **ID collisions:** Every ID globally unique across N5+N4+N3. Suffix `_2`, `_3`, `_4` on collision.
- **Hybrid surfaces (matches[]):** Default: keep hybrid to reinforce taught kanji (じゅん備, 直せつ, 責にん). Exception: full kana for set-phrase exclamations where kanji parsing isn't the goal (かんぱい).
- **lesson_ids:** Earliest lesson where the word can be written (full kanji or via matches[]).
- **Grammar-adjacent vocab:** Dictionary-form vocab from grammar points lands in the host lesson (per G→lesson mapping). Compound particles go to `shared/particles.json`.
- **Exhaustive Vocab Scan (UPDATED 2026-04-22):** 10 mandatory checks per kanji using **full** N5 (104) + N4 (182) + prior N3 kanji sets. Original 42-partner shortlist retired — missed too many common compounds (表紙, 伝説, 議員, 警備員, 王国, etc.). Per-lesson approval required. See plan file for complete kanji lists and protocol.

### Grammar → Host-Lesson Vocab Delivered

| Grammar | Host lesson | Vocab added | Status |
|---|---|---|---|
| G36 (はずだ/わけだ) | N3.14 | はず, わけ | Done (chunk 2) |
| G37 (ところだ/たばかり) | N3.18 | ところ, ばかり | Done (chunk 2 had ところ only; ばかり added in rescan) |
| G34 (Volitional & Intentions) | N3.6 | つもり | Done (rescan) — added during N3.6 full-coverage rescan |
| G35 (Inference) | N3.10 | ようだ, みたいだ, らしい | Done (rescan) — added during N3.10 full-coverage rescan |
| G39 (Adverbs of Degree) | N3.26 | かなり, ずいぶん, なかなか, ほとんど, ちっとも, わりに, やや, ほぼ | Done (chunk 3) |
| G40 (敬語) | N3.34 | いらっしゃる, おっしゃる, めしあがる, なさる, ございます, 伺う, 参る, 申す, 拝見する, ご覧になる | Done (chunk 4b) |
| G38 (Particles) | N3.22 | → particles.json (not glossary) | Deferred |
| G41 (Time Clauses) | N3.38 | うち, 以来, とたん | Done (chunk 5a) |
| G42 (Perspective Particles) | N3.42 | → particles.json (not glossary) | Deferred |
| G43 (Causative-Passive) | N3.46 | — (conjugation forms only) | N/A |
| G44 (Suffixes) | N3.50 | っぽい, がち, 気味, やか | Done (chunk 6b) |
| G45 (Advanced Conditionals) | N3.54 | — (form-based, no standalone vocab) | N/A |
| G46–G49 | N3.58+ | Various | Not yet |

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
- [ ] Update `glossary.N3.json` with all entries — **in progress (N3.1–N3.55 done, N3.56–N3.86 remaining)**
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
