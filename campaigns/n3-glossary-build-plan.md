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

## Batching — Original Chunks + Full Rescan

### Original chunk status

| Chunk | Lessons | New kanji | Entries | Status |
|---|---|---|---|---|
| 1 | N3.11–N3.13 | 12 | 51 | ✅ Approved (needs rescan) |
| 2 | N3.14–N3.20 | 28 | 140 | ✅ Approved (needs rescan) |
| 3 | N3.21–N3.26 | 24 | 95 | ✅ Approved (needs rescan) |
| 4a | N3.27–N3.32 | 24 | 87 | ✅ Approved (needs rescan) |
| 4b | N3.33–N3.36 | 16 | 82 | ✅ Approved (needs rescan) |
| 5a | N3.37–N3.40 | 16 | 77 | ✅ Approved (needs rescan) |
| 5b | N3.41–N3.44 | 16 | 72+9 rescan | ✅ Approved + partial rescan applied |
| 6a | N3.45–N3.48 | 16 | 67 | ✅ Approved (needs rescan) |
| 6b | N3.49–N3.52 | 16 | 67+8 rescan | Pending approval (partial rescan applied) |
| 6c | N3.53–N3.55 | 12 | 39+7 rescan | Pending approval (partial rescan applied) |
| **7** | **N3.56–N3.70** | **61** | **~210 est.** | **Not started** |
| **8** | **N3.71–N3.86** | **64** | **~220 est.** | **Not started** |

### Full-Coverage Rescan (N3.1–N3.55)

**⚠️ Required before continuing to chunks 7–8.** The original scan used a 42-kanji shortlist instead of the full 286 N5+N4 kanji set. All existing lessons must be rescanned with full coverage.

**Process:** Present each lesson individually. User approves/removes/adds per lesson.

| Lesson | Kanji | Rescan status |
|---|---|---|
| N3.1 | 忘覚念残 | ✅ Rescanned (5 new + v_zangyou relocated from N3.77) |
| N3.2 | 連達違絡 | ✅ Rescanned (5 new) |
| N3.3 | 昔昨初次 | ✅ Rescanned (8 new) |
| N3.4 | 慣続緒末 | ✅ Rescanned (6 new + 2 N5 notes updated) |
| N3.5 | 束歳暮約 | ✅ Rescanned (4 new) |
| N3.6 | 彼君娘祖誰 | ✅ Rescanned (3 new + G34 つもり + N4 v_kun & N5 v_dare maintained) |
| N3.7 | 全部内側 | ✅ Rescanned (9 new) |
| N3.8 | 必要可限 | ✅ Rescanned (5 new) |
| N3.9 | 命亡危険 | ✅ Rescanned (4 new + 危機 relocated to N3.61) |
| N3.10 | 法戦選参 | ✅ Rescanned (9 new incl. G35 auxiliaries) |
| N3.11 | 守盗殺犯 | ✅ Rescanned (2 new) |
| N3.12 | 勝努成得 | ✅ Rescanned (2 new incl. 成功 matches) |
| N3.13 | 失敗負害 | ✅ Rescanned (3 new) |
| N3.14 | 由米酒杯 | ✅ Rescanned (5 new) |
| N3.15 | 絶船良破 | ✅ Rescanned (4 new + N5 v_yoi maintained) |
| N3.16 | 期更最未 | ✅ Rescanned (+5 adds / −5 cuts — rebalanced to 21 entries) |
| N3.17 | 加助備完 | ✅ Rescanned (1 new: 加害) |
| N3.18 | 実存在突 | ✅ Rescanned (4 new incl. G37 ばかり catch-up) |
| N3.19 | 例候件因 | ✅ Rescanned (1 new: 物件) |
| N3.20 | 処置積直 | ✅ Rescanned (5 new — 位置 managed gap applied) |
| N3.21 | 頼願許呼 | Not started |
| N3.22 | 師徒優偉 | Not started |
| N3.23 | 育能才笑 | Not started |
| N3.24 | 他似偶類 | Not started |
| N3.25 | 的求責欠 | Not started |
| N3.26 | 両付到刻 | Not started |
| N3.27 | 追逃退返 | Not started |
| N3.28 | 寝具箱 | Not started |
| N3.29 | 予断決定 | Not started |
| N3.30 | 怒悲恐怖 | Not started |
| N3.31 | 喜幸愛夢 | Not started |
| N3.32 | 情感想恥 | Not started |
| N3.33 | 望欲忙息 | Not started |
| N3.34 | 困迷疑苦 | Not started |
| N3.35 | 増変化現 | Not started |
| N3.36 | 眠疲痛靴 | Not started |
| N3.37 | 込過遅速 | Not started |
| N3.38 | 登落越降 | Not started |
| N3.39 | 遊途路散 | Not started |
| N3.40 | 熱煙冷消 | Not started |
| N3.41 | 利収値取 | Partial (9 added, needs full rescan) |
| N3.42 | 老若美皆 | Partial (2 added, needs full rescan) |
| N3.43 | 王神福信 | Partial (5 added, needs full rescan) |
| N3.44 | 猫馬鳴飛 | Partial (2 added, needs full rescan) |
| N3.45 | 争戻倒規 | Not started |
| N3.46 | 打折抜押 | Not started |
| N3.47 | 投抱捕掛 | Not started |
| N3.48 | 指探支放 | Not started |
| N3.49 | 吸吹払閉 | Partial (2 added, needs full rescan) |
| N3.50 | 確認調示 | Not started |
| N3.51 | 記表解観 | Partial (2 added, needs full rescan) |
| N3.52 | 伝告報誤 | Partial (4 added, needs full rescan) |
| N3.53 | 談論議識 | Partial (3 added, needs full rescan) |
| N3.54 | 礼訪招迎 | Not started |
| N3.55 | 警察罪判 | Partial (4 added, needs full rescan) |

**After rescan complete:** Continue with chunks 7–8 using the full-coverage protocol from the start.

**🛑 STOP after each lesson.** Present additions to user for approval. Do **not** proceed to next lesson until explicitly approved. Use jq to append entries.

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

### Exhaustive Vocab Scan — Full Coverage Protocol (mandatory per lesson)

**⚠️ UPDATED 2026-04-22:** The original 42-partner shortlist missed common compounds (表紙, 伝説, 議員, 警備員, 王国, etc.). The scan now uses the **complete** N5 + N4 kanji sets (104 + 182 = 286 kanji) plus all prior N3 kanji. Every lesson from N3.1–N3.86 must be scanned against this full set.

The following checklist must be run for **every new kanji** in the lesson:

1. **Primary verb/adj/noun form** — the main dictionary-form word the kanji lives in (守る, 盗む, etc.).
2. **Noun/stem form of verbs AND adjectives** — every verb kanji gets its noun form checked (盗む→盗み, 勝つ→勝ち, 負ける→負け). Every i-adjective gets its noun/stem form checked (悲しい→悲しみ, 恐ろしい→恐れ, 楽しい→楽しみ, 苦しい→苦しみ, 痛い→痛み). This is a common miss category.
3. **Full partner kanji compound scan** — for each new kanji, check compounds with **ALL** N5 and N4 kanji, plus all N3 kanji taught up to and including this lesson. Check X+partner AND partner+X for each.

   **Full N5 kanji (104):**
   父母人子名女男先友生日火今金木水何土月毎千二八一五九三六七十万円百四時年半週分行家来店駅川車道山小飲大食新古買長高安前中外後天気電休雨花魚空語国学本校話言書手読間多白少東北南西左右下上会出入口午社足聞目見耳立

   **Full N4 kanji (182):**
   働借帰着切起送使作歩近乗遠明朝晩私赤青色黒好茶物菜野料理肉牛味昼暗同鳥飯姉兄妹族弟親秋暑冬春夏寒町元去住所別始画館英終映真自界旅写世頭顔体心首有楽軽声音低歌員事急仕早曜病医院薬者死動銀走犬去運回京田転都海勉力光風強弱地題問説質図服屋夜洋売品持貸意字紙漢太短重進験教試室文注研究悪方考正合度待夕林池門村知台以計集答思特代堂開森引習市用場広工建発県通区洗民主止便不業産

   **N3 kanji:** All kanji from N3.1 through the current lesson (grows as lessons are built). Extract via: `jq -r '[.entries[] | select(.type=="kanji") | .surface] | join("")' data/N3/glossary.N3.json`

4. **Compound verb patterns with N5 verbs** — check 見+V, 取+V, 引+V, 出+V, 持+V, 立+V, 付+V etc. for compound verbs (見守る, 見失う, 見付ける, etc.). These are easy to overlook because neither kanji is new.
5. **Suffix patterns: 大+X, 〜家, 〜者, 〜人, 〜力, 〜員, 〜的, 〜中, 〜会** — productive suffixes that create high-frequency words (大失敗, 努力家, 勝者, 殺人犯, 戦力, 警備員, 美的, 議会). Check all applicable suffixes.
6. **High-frequency words using matches[]** — if a word is very common (N3 JLPT vocab list level) and ONE kanji is taught now but the other comes later, add it with `matches[]` rather than deferring. Reserve deferral for low-frequency or specialized compounds. Policy: **common + writable-via-matches[] beats deferring to a later lesson.**
7. **Antonym/pair check** — if the lesson teaches one half of a common pair (勝/負, 失/成), ensure both halves' vocab is covered (across adjacent lessons if needed).
8. **Vocab-debt cross-reference** — before starting each chunk, check `campaigns/n3-production.md` § "Vocab Debt from N4 Stories" for any words that become writable with this chunk's kanji. These are high-priority since students have already encountered them in context.
9. **RPG/game term check** — if the new kanji or its compounds form common game stats or terms (攻撃, 防御, 必殺, 命中, etc.), include fully-writable ones. Skip matches[]-only game terms unless user approves.
10. **Commonality sourcing** — do NOT rate words as "common" or "very common" based on subjective judgment. Cross-reference against JLPT N3 vocabulary lists and word frequency data. When presenting candidates to the user, cite the basis (e.g., "JLPT N3 list", "top-5000 frequency", "core vocabulary for this kanji").

### Approval Protocol

Each lesson's additions are presented individually for user approval. The user may:
- Approve all additions for a lesson
- Remove specific entries they consider too uncommon
- Request additional entries the scan missed
- Flag entries for deferral to a later lesson

No batch approvals — every lesson gets individual review.

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
