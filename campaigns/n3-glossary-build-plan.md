# N3 Glossary Build-Out Plan (N3.11 – N3.86)

## Context

The N3 kanji/vocab roadmap in `data/N3/N3-kanji-lesson-plan.md` is locked — 86 lessons totaling 348 new kanji. The glossary `data/N3/glossary.N3.json` currently has **947 entries covering N3.1–N3.55** (221 kanji + 726 vocab). Chunks 1–6a are approved; 6b–6c are pending approval. Every downstream N3 workstream depends on the glossary being the source of truth for kanji readings and vocab IDs.

The campaign file `campaigns/n3-production.md` has the full chunk progress table and grammar-adjacent vocab tracking. G32–G49 are empty stubs (title + meta + sections:[]).

**Goal:** extend `glossary.N3.json` to cover N3.11–N3.86, chunked and approval-gated.

**Remaining work:** Chunk 7 (N3.56–N3.70, ~61 kanji, ~210 entries est.) and Chunk 8 (N3.71–N3.86, ~64 kanji, ~220 entries est.). After all chunks approved, squash WIP commits into one clean commit.

## Scope

**In:**
- All kanji entries (`k_*`) for N3.11–N3.86 per the locked plan.
- Core vocab (`v_*`) that each lesson's kanji unlock, plus [FREE] compounds flagged in `N3-regroup-working.md`.
- **Grammar-adjacent vocab**: for every G32–G49 grammar stub, the dictionary-form vocab it introduces lands in the host lesson (the lesson it `unlocksAfter`). See mapping table below.
- Managed kana-gap compounds (突然, 絶対, 原因) with `matches[]`.
- N3 vocab-debt words from `campaigns/n3-production.md` (ならべる, 見つける, つける, しばらく, やっぱり, はこ, として — though として → `shared/particles.json`, not glossary).
- Pre-flight cleanup of ID collisions and stray lesson_ids.

**Out:**
- Content lessons, grammar content (G32–G49 sections[]), reviews, compose, stories, manifest, conjugation rules, campaign file refresh.
- Compound particles (as, about, regarding, etc.) — these go in `shared/particles.json` with `introducedIn = G*`, **not** in glossary.

## Scale

Baseline from N3.1–N3.10: ~4 kanji + ~10–15 vocab per lesson. Target for 4-kanji lessons: **~13 vocab**. 5-kanji lessons (N3.6/56/57/60/84): **~15–18 vocab**. 3-kanji lesson (N3.73): **~8–10 vocab**. Rough total: ~76 lessons → ~1,250 new entries → file grows 156 → ~1,400.

## ID Collision Avoidance (HIGH PRIORITY)

**Policy: every ID must be globally unique across N5 + N4 + N3 glossaries.** No reuse of `k_*` or `v_*` IDs for different kanji/words, even across levels.

### Known pre-existing collisions to fix during pre-flight

Collision check command: `grep -oE '"id": "(k|v)_[a-z0-9_]+"' data/N5/glossary.N5.json data/N4/glossary.N4.json data/N3/glossary.N3.json | awk -F'"' '{print $4}' | sort | uniq -d`

Current duplicates (confirmed):

| ID | Level A | Level B | Fix |
|---|---|---|---|
| `k_yo` | N5.13 `読` | N3.29 `予` | Rename N3 entry → `k_yo_2` |
| `k_hatsu` | N4.34 `発` | N3.3 `初` | Rename N3 entry → `k_hatsu_2` |
| `k_ka` | ? | N3 `?` | Investigate, add `_2`/`_3` suffix |
| `k_you` | ? | N3 `?` | Investigate, add `_2`/`_3` suffix |
| `v_yoku` | N5 よく | N4 よく | Same word duplicated — investigate; likely collapse one, or treat as intentional and leave. Flag for review. |
| `v_sarada` | N5/N4 | — | Same — investigate. |
| `v_dochira` | N5/N4 | — | Same — investigate. |

### New-entry collision rules

1. Before writing any new entry, grep for the candidate ID across all three glossaries.
2. On collision, append the lowest unused numeric suffix: `k_kan_2`, `v_shuu_3`, etc.
3. Do not assume N5/N4 IDs are the "original" — if N3 was there first (rare), still suffix the new entry.
4. After each chunk write: re-run the collision check. Build fails if new duplicates appear.

## Grammar → Host-Lesson Vocab Mapping

Each G32–G49 stub has `unlocksAfter` = host lesson. Vocab the grammar point needs must appear in that host lesson's vocab list (or earlier). Compound particles go to `shared/particles.json` instead.

| Grammar | Title | unlocksAfter | Vocab to glossary | Particles to particles.json |
|---|---|---|---|---|
| G32 | Relative Clauses & Noun Modification | N3.2 | — (structural only) | — |
| G33 | Nominalizers の/こと | N3.4 | こと (if not already in N5); の stays pronoun | — |
| G34 | Volitional & Intentions | N3.6 | つもり, 〜ようとする (form) | — |
| G35 | Inference (ようだ/みたいだ/らしい) | N3.10 | ようだ, みたいだ, らしい as auxiliaries | — |
| G36 | Expectation (はずだ/わけだ) | N3.14 | はず, わけ (nominals) | — |
| G37 | Aspect (ところだ/たばかり) | N3.18 | ところ, ばかり | — |
| G38 | Sentence-Ending Particles & Register | N3.22 | — | ぜ, ぞ, さ, わ, etc. |
| G39 | Adverbs of Degree | N3.26 | かなり, ずいぶん, なかなか, ほとんど, ちっとも, わりに, やや, ほぼ, ぜんぜん (kana, 然 is N3.84) | — |
| G40 | 敬語 Introduction | N3.34 | いらっしゃる, おっしゃる, 召し上がる, なさる, ございます, 伺う, 参る, 申す, 拝見する, ご覧になる | — |
| G41 | Time Clauses (間/うちに/以来/とたん) | N3.38 | うち (noun), 以来 (noun), とたん (noun) | — |
| G42 | Perspective & Relation Particles | N3.42 | — | として, について, に対して, に関して, によって |
| G43 | Causative-Passive & Advanced Voice | N3.46 | — (conjugation forms only) | — |
| G44 | Suffixes (っぽい/がち/気味/～やか) | N3.50 | 〜っぽい, 〜がち, 〜気味, 〜やか (suffix entries, `gtype: "suffix"` or treat as derivational) | — |
| G45 | Advanced Conditionals & Wishes | N3.54 | (mostly form-based; wishes may add set phrases) | — |
| G46 | Quoting & Indirect Speech | N3.58 | — | って (quotative) |
| G47 | Compound Expressions & Set Patterns | N3.64 | にとって, に違いない, わけがない (set phrases — glossary `gtype: "expression"`) | — |
| G48 | Advanced Connectors | N3.72 | しかも, それに, そのうえ, ところが, なお, むしろ | — |
| G49 | Capstone Review | N3.84 | — | — |

Each chunk's builder must cross-reference this table and add grammar-adjacent vocab to the correct host lesson.

## Entry Format (follow existing N3.1–N3.10 exactly)

**Kanji (`k_*`):** `id, lesson, type:"kanji", surface, on, kun, reading, meaning, notes`. Notes document compound examples and nuance.

**Vocab (`v_*`):** `id, surface, reading, meaning, type:"vocab", gtype, verb_class (verbs only), lesson_ids, matches[] (only for managed kana gap), notes`. Notes must cite kanji provenance inline (e.g. `"連 (N3.2) + 絡 (N3.2)"` or `"残 (N3.1) + 業 (N3.77)"`).

## Pre-flight Cleanup (same chunk or prior commit)

1. Rename `k_yo` (N3, 予) → `k_yo_2`; update any references. Same for `k_hatsu` (N3, 初) → `k_hatsu_2`. Investigate `k_ka`/`k_you` and suffix as needed.
2. Fix `v_zangyou` (残業) `lesson_ids`: currently `"N3.37"` — should be `"N3.77"` (first lesson where both 残 N3.1 and 業 N3.77 are taught).
3. Fix `v_yoyaku` (予約) notes: currently says `"約 (N3.66)"` — should be `"約 (N3.5)"`. Drop `matches[]` kana gap if both kanji available at lesson_ids.
4. Fix `v_yotei` (予定) notes: currently says `"定 (N3.16)"` — should be `"定 (N3.29)"` (same lesson as 予). Drop `matches[]` kana gap.
5. Decide and document the `lesson_ids` policy for cross-lesson compounds: "first lesson at which all constituent kanji are taught" (no gap), OR "earliest lesson the word is usable with partial-kanji via `matches[]`" (managed gap). Apply consistently.

## Managed Kana Gap Compounds

These are explicitly called out in `N3-kanji-lesson-plan.md:324`:

| Compound | Kanji locations | lesson_ids | matches[] |
|---|---|---|---|
| 突然 (とつぜん) | 突 N3.18 + 然 N3.84 | N3.18 | `["とつぜん"]` |
| 絶対 (ぜったい) | 絶 N3.15 + 対 N3.57 | N3.15 | `["ぜったい"]` |
| 原因 (げんいん) | 因 N3.19 + 原 N3.84 | N3.19 | `["原いん", "げんいん"]` |

Additional cross-lesson compounds to flag on encounter (builder decides whether to apply managed-gap treatment): 実際, 位置, 居酒屋, 責任.

## Batching — 8 Chunks, APPROVAL GATE AFTER EACH

| Chunk | Lessons | New kanji | Entries | Status |
|---|---|---|---|---|
| 1 | N3.11–N3.13 | 12 | 51 | ✅ Approved |
| 2 | N3.14–N3.20 | 28 | 140 | ✅ Approved |
| 3 | N3.21–N3.26 | 24 | 95 | ✅ Approved |
| 4a | N3.27–N3.32 | 24 | 87 | ✅ Approved |
| 4b | N3.33–N3.36 | 16 | 82 | ✅ Approved |
| 5a | N3.37–N3.40 | 16 | 77 | ✅ Approved |
| 5b | N3.41–N3.44 | 16 | 72 | ✅ Approved |
| 6a | N3.45–N3.48 | 16 | 67 | ✅ Approved |
| 6b | N3.49–N3.52 | 16 | 67+4 fixes | Pending |
| 6c | N3.53–N3.55 | 12 | 39+3 fixes | Pending |
| **7** | **N3.56–N3.70** | **61** | **~210 est.** | **Not started** |
| **8** | **N3.71–N3.86** | **64** | **~220 est.** | **Not started** |

**🛑 STOP after each chunk.** Surface the diff to the user for review. Do **not** start the next chunk until explicitly approved. Use jq to append entries (pattern: `jq --slurpfile new /tmp/entries.json '.entries += $new[0]' glossary.json > tmp && cp tmp glossary.json`).

## Per-Chunk Workflow

1. Read the chunk's rows from `N3-kanji-lesson-plan.md` + relevant `N3-regroup-working.md` [FREE] annotations.
2. For each lesson in the chunk, check the Grammar→Host-Lesson mapping table. If a grammar unlocks here, include its grammar-adjacent vocab in that lesson's entries.
3. **Check vocab-debt list** in `campaigns/n3-production.md` § "Vocab Debt from N4 Stories" — any words that become writable with this chunk's kanji are high-priority additions.
4. Draft kanji entries (source readings/meanings from Kanshudo/Jisho/Wanikani; verify against theme column).
5. **Draft vocab entries using the Exhaustive Vocab Scan (see below).** No hard vocab cap — include every common word that is writable at this lesson. Run the high-yield partner kanji list (check #3) for EVERY new kanji — do not skip this step.
6. **ID collision check**: `grep -oE '"id": "(k|v)_[a-z0-9_]+"' data/N{5,4,3}/glossary.N{5,4,3}.json | awk -F'"' '{print $4}' | sort | uniq -d` — must be empty or only pre-existing duplicates from the cleanup list.
7. Write entries by appending to `entries[]` in `data/N3/glossary.N3.json`.
8. `bash hooks/validate-json.sh data/N3/glossary.N3.json` — must pass.
9. Spot-check 5 random entries from the chunk for format correctness.
10. **WIP commit**: `WIP N3 glossary: chunk X (N3.a–N3.b) — N kanji + M vocab`.
11. **STOP and wait for approval** before proceeding to next chunk.

### Exhaustive Vocab Scan (mandatory per lesson)

Chunk 1 revealed that targeting a fixed vocab count (~13) causes common words to be silently dropped. The rescan after chunks 1–4a found 25 additional misses, mostly cross-level compounds (可愛い, 家具, 昼寝, 書類, etc.) and adjective noun forms (悲しみ, 恐れ). The following checklist must be run for **every new kanji** in the lesson:

1. **Primary verb/adj/noun form** — the main dictionary-form word the kanji lives in (守る, 盗む, etc.).
2. **Noun/stem form of verbs AND adjectives** — every verb kanji gets its noun form checked (盗む→盗み, 勝つ→勝ち, 負ける→負け). Every i-adjective gets its noun/stem form checked (悲しい→悲しみ, 恐ろしい→恐れ, 楽しい→楽しみ, 苦しい→苦しみ, 痛い→痛み). This is a common miss category.
3. **High-yield partner kanji compound scan** — for each new kanji, systematically check compounds with the following ~40 most productive N5/N4 kanji. These account for the majority of cross-level compounds. Check X+partner AND partner+X for each.

   **N5 partners (22):** 人 子 生 日 金 時 分 行 家 大 食 長 前 中 外 後 書 手 見 出 入 上
   **N4 partners (20):** 物 力 体 心 者 事 自 元 所 強 地 持 合 度 考 正 引 用 通 業

   Prioritize [FREE] annotations from `N3-regroup-working.md`, but the partner list catches compounds beyond the Key Vocabulary column. Examples of misses this would have caught: 可(new)+愛(new)→可愛い, 家(N4)+具(new)→家具, 昼(N4)+寝(new)→昼寝, 書(N5)+類(new)→書類, 体(N4)+育(new)→体育, 飲(N4)+酒(new)→飲酒, 船(new)+長(N5)→船長, 時(N5)+期(new)→時期, 引(N4)+退(new)→引退.

4. **Compound verb patterns with N5 verbs** — check 見+V, 取+V, 引+V, 出+V, 持+V, 立+V, 付+V etc. for compound verbs (見守る, 見失う, 見付ける, etc.). These are easy to overlook because neither kanji is new.
5. **大+X, 〜家, 〜者, 〜人, 〜力 suffix patterns** — productive suffixes that create high-frequency words (大失敗, 努力家, 勝者, 殺人犯, 戦力, 守備力). Include 〜力 for stat/power compounds.
6. **High-frequency words using matches[]** — if a word is very common (N3 JLPT vocab list level) and ONE kanji is taught now but the other comes later, add it with `matches[]` rather than deferring. Reserve deferral for low-frequency or specialized compounds. Policy: **common + writable-via-matches[] beats deferring to a later lesson.**
7. **Antonym/pair check** — if the lesson teaches one half of a common pair (勝/負, 失/成), ensure both halves' vocab is covered (across adjacent lessons if needed).
8. **Vocab-debt cross-reference** — before starting each chunk, check `campaigns/n3-production.md` § "Vocab Debt from N4 Stories" for any words that become writable with this chunk's kanji. These are high-priority since students have already encountered them in context.
9. **RPG/game term check** — if the new kanji or its compounds form common game stats or terms (攻撃, 防御, 必殺, 命中, etc.), include fully-writable ones. Skip matches[]-only game terms unless user approves.

After all chunks approved: `git reset --soft <base>` → single clean commit `feat(N3): extend glossary to cover N3.11–N3.86` → push to `claude/n3-lesson-planning-jZj4D`.

## Critical Rules (from CLAUDE.md)

1. Never read glossary files in full — use targeted Grep (file sizes exceed token limit).
2. Every kanji in a `surface` field must trace to the taught-kanji set for the assigned `lesson_ids` (unless `matches[]` defines a partial-kanji form).
3. `lesson_ids` = earliest lesson at which the word can be written (full or via `matches[]`).
4. `notes` must cite the lesson origin of every kanji in the surface form.
5. No conjugation-gated forms as dictionary surface — glossary is dictionary form only.
6. IDs are globally unique across N5+N4+N3 glossaries.

## Critical Files

- `data/N3/N3-kanji-lesson-plan.md` — locked kanji allocation (kanji list at line 285)
- `data/N3/N3-regroup-working.md` — [FREE] compound annotations
- `data/N3/glossary.N3.json` — format reference (N3.1–N3.10) + target file
- `data/N4/glossary.N4.json` + `data/N5/glossary.N5.json` — collision check + format reference
- `data/N3/grammar/G32.json`–`G49.json` — grammar stub meta (unlocksAfter values)
- `shared/particles.json` — where compound particles go (not glossary)
- `hooks/validate-json.sh` — JSON validation
- `campaigns/n3-production.md` — vocab-debt word list

## Verification

**After each chunk:**
- `bash hooks/validate-json.sh data/N3/glossary.N3.json` returns 0.
- `jq '.entries | length' data/N3/glossary.N3.json` shows expected growth.
- Collision check (above) clean of new duplicates.
- `jq '[.entries[] | select(.type=="kanji")] | group_by(.lesson) | map({lesson: .[0].lesson, n: length})' data/N3/glossary.N3.json` — 4/5/3 kanji per lesson matches plan.
- Spot-check 3 random vocab: every kanji in surface appears in an earlier or same-lesson kanji entry (N3/N4/N5).

**After final chunk:**
- Every kanji in `N3-kanji-lesson-plan.md` "Complete N3 Kanji List" has exactly one `k_*` entry (total 348).
- No vocab entry references a later-lesson kanji without `matches[]`.
- `hooks/validate-writing-forms.sh` passes.
- Pre-flight cleanup items resolved.
- Grammar-adjacent vocab landed in correct host lessons per mapping table.

## Explicit Deferrals

- Grammar G32–G49 section content (separate workstream, requires 4-agent pipeline).
- Content lesson files `data/N3/lessons/N3.X.json`.
- `manifest.json` N3 entries.
- `campaigns/n3-production.md` refresh (grammar-stub correction + chunk tracking).
- Conjugation rule additions for N3 forms.
