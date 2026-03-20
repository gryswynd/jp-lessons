# Quality Gates, Reference Data & Failure Modes

> **Loaded by:** Agent 3 (QA Reviewer) and Agent 4 (Consistency Reviewer) during review passes.
> **Purpose:** Defines pass/fail criteria for QA and consistency review, file structure reference, glossary access patterns, and the complete catalog of documented failure modes.

---

## Quality Gates (Pass/Fail Criteria)

### Agent 3 (QA) — hard pass/fail

All of the following must be TRUE for a QA pass:

- [ ] Every kanji in every `jp`/passage field is in the taught-kanji set
- [ ] Every character name from the roster (see Character Name Tagging) that appears in a `jp` or passage field has the correct `char_*` ID in the `terms` array
- [ ] Every `char_*` ID used in `terms` arrays is registered in `shared/characters.json`
- [ ] (Stories) Every character name in `story.md` has a surface key in `terms.json` pointing to the correct `char_*` ID
- [ ] Every lexical token in every `jp`/passage field is tagged in the `terms` array — this includes kana-only words (copulas, conjunctions, sentence-final particles, adverbs); not just kanji-containing words
- [ ] Every kana-only word in a `jp` field that is NOT tagged in `terms` has been verified to have no glossary entry (i.e. it is truly an untaggable function word, not a tagged-but-out-of-scope one)
- [ ] Every term ID in every `terms` array exists in the glossary
- [ ] Every term ID's `surface` field matches (or inflects from) the token it tags in the `jp` field — ID existence alone is not sufficient; a surface mismatch (e.g. tagging `だ` with `g_desu` whose surface is `です`) is a hard fail
- [ ] Glossary surface sanity check: for every verb or adjective entry used, Grep the full entry and confirm the `surface` field is a valid Japanese word — correct length, no spurious inserted kana (e.g. `"送る"` not `"送くる"`), and matching verb class (godan ends in a う-column kana, ichidan ends in る). A corrupted surface silently breaks all conjugated forms of that word, teaching students a word that does not exist
- [ ] Every verb/adjective `terms` entry uses `{ "id": "...", "form": "..." }` with a valid form string
- [ ] Every `form` value in `terms` has `introducedIn` ≤ current lesson in `conjugation_rules.json` (see [Grammar Usage Prerequisite Rules](#grammar-usage-prerequisite-rules))
- [ ] Every `form: null` in lesson/review `terms` arrays verified as a genuine purpose construction: the verb must be followed by に in the `jp` text. Any `form: null` not meeting this test is a **hard fail** — the form string is missing and must be created
- [ ] No `desire_tai` form used anywhere — deprecated; hard fail if present. Use `plain_desire_tai` + `g_desu` instead
- [ ] Every な-adjective glossary entry used with `attributive_na` or `polite_adj` has BOTH `gtype: "na-adjective"` AND `verb_class: "na_adj"` — either field alone is insufficient
- [ ] No structural grammar pattern (～ている, ～てください, ～たり～たりする, ～ましょう, etc.) appears in `jp` text before its constituent form is available
- [ ] Active-window grammar reinforcement minimum counts are met (count tagged forms across conversations + readings; see [Grammar Reinforcement Requirements](#grammar-reinforcement-requirements))
- [ ] (N4+ lessons) Exactly 3 drill sections are present in order: Drill 1 Kanji Readings, Drill 2 Vocabulary, Drill 3 Grammar & Forms
- [ ] (N4+ lessons) Drill 1 items use `[漢字] の よみかたは？` format with no `terms` array
- [ ] Drill 1 MCQ items have no `terms` array; all other drills do
- [ ] Answer fields exactly match one of the choices strings
- [ ] The JSON validates (no syntax errors)
- [ ] All required fields are present for the section type
- [ ] No ID appears in terms that was not verified against the glossary file
- [ ] Early-use vocabulary written in hiragana is on the approved early-use list and the current lesson ≥ the word's "Use from" lesson (see [Early-Use Vocabulary Rules](#early-use-vocabulary-rules))
- [ ] Words with taught kanji are written in kanji, not hiragana — hiragana writing is only permitted for words on the early-use list whose kanji is not yet taught
- [ ] Partial-kanji words use the correct writing form for the lesson tier (e.g. 大すき not 大好き before N4.4)
- [ ] Glossary-surface writing-form check: for every word in jp text whose glossary `surface` contains any untaught kanji, the jp text uses the hiragana/partial-kanji `matches` form — not the full-kanji surface (hard fail: 一緒に used in jp text when いっしょに is the glossary matches form and 緒 is not yet taught)
- [ ] Unregistered kana lexical words are escalated: pure-kana lexical tokens with no glossary entry are listed in an Unregistered Word Report and returned to Agent 1 — they do not produce a standard FAIL
- [ ] (Reviews) Scramble `segments` use only taught kanji and approved vocabulary
- [ ] (Reviews) Scramble `distractors` are plausible (wrong particles, transitive/intransitive confusions, similar words)
- [ ] (Reviews) Scramble sentences with time expressions or adverbs have `alts` if the element can naturally float
- [ ] (Reviews) Every drill item (MCQ and scramble) has an `explanation` field
- [ ] (Reviews) Conversation items have `question`, `choices` (4 options), `answer`, and `explanation`
- [ ] (Compose) Every vocabPool and target ID exists in the glossary or particles.json
- [ ] (Compose) Model sentences use only taught kanji
- [ ] (Compose) Every model sentence uses a natural Japanese verb+object collocation — no invented pairings (e.g. 運動を作る fails; 運動をする passes)
- [ ] (Compose) Particles are gated — every particle ID has `introducedIn` ≤ current lesson
- [ ] (Compose) Conjugation examples are linguistically correct (especially irregular forms)
- [ ] (Compose) Conjugations use polite register only (unless lesson teaches casual speech)
- [ ] (Compose) No regular prompt uses closing language ("close", "wrap up", "conclude") when challengePrompts is non-empty
- [ ] (Compose) Challenge prompts are framed as a separate optional scenario, not a continuation of the regular narrative
- [ ] (Stories) Every in-scope particle (p_* with introducedIn ≤ lesson scope) has an entry in terms.json
- [ ] (Stories) g_desu (です) has an entry in terms.json if the story uses です
- [ ] (Stories) terms.json keys exactly match the substrings as they appear in story.md
- [ ] (Register) Lessons N5.10+ have at least 1 casual conversation (see [Register Requirements](#register-requirements-polite-vs-casual))
- [ ] (Register) Lessons before N5.10 have zero casual conversations — 100% polite register
- [ ] (Register) Casual conversations do not mix registers — no ます/です forms in casual dialogue lines, no plain forms in polite dialogue lines
- [ ] (Register) Plain forms in casual conversations have `introducedIn` ≤ current lesson
- [ ] (Register) Casual conversation `context` fields describe informal relationships (friends, family, close peers)

### Agent 4 (CR) — soft pass/fail (judgment-based)

All of the following should be TRUE for a CR pass:

- [ ] Conversations sound natural and idiomatic, not like direct grammar exercises
- [ ] **Redundancy check:** No cluster of 2+ consecutive sentences conveys the same information — each sentence adds something new. Forced vocabulary insertion almost always produces redundant clusters (three ways of introducing a character, two ways of saying someone is tired). Read scenes as sequences, not isolated sentences.
- [ ] The scenario is culturally plausible and engaging
- [ ] Grammar complexity matches the target lesson tier — every conjugation form and structural grammar pattern in `jp` text has `introducedIn` ≤ current lesson (hard fail if violated; see [Grammar Usage Validation](#agent-4--grammar-usage-validation-all-content-types))
- [ ] No particle in `jp` text has `introducedIn` (in `shared/particles.json`) later than the current lesson
- [ ] Grammar patterns that are technically available but have not been recently practiced are used sparingly and naturally (soft judgment)
- [ ] **Grammar reinforcement — active window:** All minimum counts from the Grammar Reinforcement Schedule are met for milestones in the active window (hard fail if not met and natural contexts exist)
- [ ] **Grammar reinforcement — sustained use:** No sustained-use milestone's forms are completely absent from the lesson (soft fail with explanation if absent)
- [ ] **Grammar reinforcement — verb diversity:** Verb form distribution is not >80% polite_masu/polite_mashita when other forms are available (soft fail)
- [ ] **Grammar reinforcement — structural patterns:** Key structural patterns (てください, ています, たいです, ましょう, etc.) appear where available and contextually natural; flagged if absent across 3+ consecutive lessons
- [ ] **Grammar reinforcement — warmup:** At least 1 warmup item exercises a recently-unlocked grammar pattern with prior-lesson vocabulary
- [ ] Vocabulary density is appropriate (not overcrowded, not too sparse)
- [ ] Scenarios are meaningfully different from the 2 most recent same-type files
- [ ] Character names, places, and recurring details are consistent with the series
- [ ] The content builds genuine skill progression from the previous lesson
- [ ] Distractors in drills are plausible but clearly wrong
- [ ] Reading passages are coherent narratives, not disconnected sentences
- [ ] **Register — ratio check:** Casual/polite conversation ratio matches the Register Requirements schedule for the lesson range (hard fail if a N5.10+ lesson has zero casual conversations)
- [ ] **Register — naturalness:** Casual conversations sound like real informal speech, not polite sentences with です replaced by だ. Friends use contractions, sentence-final particles, and casual connectors naturally
- [ ] **Register — context appropriateness:** No casual register in formal contexts (stores, offices with superiors, strangers). No polite register in explicitly casual contexts (close friends at home)
- [ ] **Register — command/prohibition usage:** Plain commands (～ろ/～え) and prohibition (～な) appear only in appropriate contexts (signs, sports, close friends). Not overused or forced

---

## File & Structure Reference

### Glossary Access Pattern

**Never read the glossary in full.** The files are thousands of lines and will exceed the 32k token output limit in a single response. Use these targeted queries instead:

| Goal | Grep pattern | File |
|---|---|---|
| List all vocab introduced in a lesson | `"lesson_ids": "N5.3"` | `glossary.N5.json` |
| Verify a specific vocab ID exists | `"id": "v_foo"` | `glossary.N5.json` |
| Verify a particle ID exists | `"id": "p_foo"` | `shared/particles.json` |
| Find all entries for a kanji lesson | `"lesson": "N5.3"` | `glossary.N5.json` |
| Check surface / reading / gtype of an entry | `"id": "v_foo"` with context lines | `glossary.N5.json` |
| Discover compounds for a kanji character | `"surface":` containing the character (e.g. `"surface": ".*水.*"`) | `glossary.N5.json` |

When Agent 1 needs to enumerate the full vocab list for a lesson's Content Brief, run one Grep for `"lesson_ids": "N5.X"` and one for `"lesson": "N5.X"` (kanji entries). That is sufficient — do not read the file beyond those results.

When Agent 3 needs to verify IDs in bulk, run a single Grep per unknown ID rather than reading surrounding sections.

**Compound discovery (Agent 1 scoping phase).** When a new lesson introduces kanji, Agent 1 should search the glossary for each new character to discover compound words that become available once that kanji is taught (i.e. all constituent kanji are now in the taught set). Grep for the character within `"surface"` fields. This broader search is permitted and encouraged — it does not violate the "do not read in full" rule because it is still a targeted query. Flag discovered compounds to the user as candidates for inclusion in the lesson or for addition to the glossary if they don't exist yet.

---

### Key files to read before building any content

| File | Purpose |
|---|---|
| `manifest.json` | Level/lesson index, kanji arrays per lesson, file paths |
| `data/N5/glossary.N5.json` | All N5 kanji and vocab entries with IDs |
| `data/N4/glossary.N4.json` | All N4 kanji and vocab entries with IDs |
| `shared/particles.json` | Particle and set-phrase entries (`p_*` IDs) |
| `shared/characters.json` | Character registry (`char_*` IDs) — proper names, portraits, descriptions. Read this when any lesson content features a recurring character. |
| `conjugation_rules.json` | Valid conjugation form strings |
| `counter_rules.json` | Valid counter keys and their rules |
| `Lesson Instructions.md` | Authoritative term tagging and drill authoring rules |
| `./GRAMMAR_CONTENT.md` | **Grammar lessons only** — authoritative scope for each G-lesson's grammar points, required sections, and vocabulary context. Agent 1 must read the relevant G-lesson entry before building any grammar Content Brief. Do not infer grammar scope from the lesson title alone. |

**Important — particles live in `shared/particles.json`, not the glossary.** Particle entries use the field `particle` for their surface form (not `surface`). Compound particles like `では` also live here as their own entries. When verifying a `p_*` ID, search `shared/particles.json` — not the N5/N4 glossary files. New particles or compound particles must be added to `particles.json`, not to any glossary file.

### Entry type quick reference

**Kanji entry (type: "kanji"):**
```json
{
  "id": "k_haha",
  "lesson": "N5.1",
  "type": "kanji",
  "surface": "母",
  "on": "ぼ",
  "kun": "はは",
  "reading": "はは",
  "meaning": "mother"
}
```

**Vocab entry (type: "vocab"):**
```json
{
  "id": "v_sensei",
  "surface": "先生",
  "meaning": "teacher",
  "type": "vocab",
  "gtype": "noun",
  "lesson_ids": "N5.1",
  "reading": "せんせい"
}
```

**Verb vocab entry:**
```json
{
  "id": "v_umareru",
  "surface": "生まれる",
  "meaning": "to be born",
  "type": "vocab",
  "gtype": "verb",
  "lesson_ids": "N5.1",
  "reading": "うまれる",
  "verb_class": "ichidan"
}
```

Verb classes: `godan`, `ichidan`, `irr_suru`, `irr_kuru`

Adjective gtypes: `i_adj`, `na_adj`

**na-adjective entries require TWO fields — both are mandatory:**

```json
{
  "id": "v_kirei",
  "surface": "きれい",
  "meaning": "pretty / clean",
  "type": "vocab",
  "gtype": "na-adjective",
  "verb_class": "na_adj",
  "lesson_ids": "N5.3",
  "reading": "きれい"
}
```

`gtype: "na-adjective"` controls display and classification. `verb_class: "na_adj"` is the key that activates the `attributive_na` and `polite_adj` conjugation rules. **Either field alone is insufficient.** An entry with only `gtype: "na-adjective"` (no `verb_class`) will silently fail to produce a 〜な chip. Verify both fields whenever adding or editing a な-adjective entry.

### Output file paths

| Content type | Path pattern |
|---|---|
| Lesson | `data/N5/lessons/N5.X.json` |
| Review | `data/N4/reviews/N4.Review.X.json` |
| Final Interactive Review | `data/N5/reviews/N5.Final.Review.json` / `data/N4/reviews/N4.Final.Review.json` |
| N5 Compose | `data/N5/compose/compose.N5.X.json` (one file per lesson) |
| N4 Compose | `data/N4/compose/compose.N4.X.json` (one file per lesson) |
| Story markdown | `data/N5/stories/[slug]/story.md` |
| Story terms | `data/N5/stories/[slug]/terms.json` |

After writing new files, `manifest.json` must be updated. Lessons get an entry under `data.N5.lessons` or `data.N4.lessons`. Stories get an entry under `data.N5.stories` or `data.N4.stories`. Reviews get an entry under `data.N4.reviews`. Compose files get an entry in the `compose` array: `{ "lesson": "N5.X", "file": "data/N5/compose/compose.N5.X.json" }`. Grammar lessons get an entry in the appropriate `grammar` array (under `data.N5.grammar` or `data.N4.grammar`) with `id`, `title`, `file`, `unlocksAfter`, `icon`, and `estimatedMinutes` fields — the `unlocksAfter` value must exactly match GRAMMAR_CONTENT.md.

**Grammar `unlocksAfter` must be consistent across three files.** Whenever a grammar lesson's unlock point is set or changed, update it in all three places: (1) GRAMMAR_CONTENT.md (the spec), (2) `manifest.json` (the runtime gate), and (3) the grammar lesson JSON's `meta.unlocksAfter` field (once the file is built). All three must agree — a mismatch between any two causes either a content-scope violation or a lesson that is gated at the wrong point in the app.

Story entries in `manifest.json` must include an `unlocksAfter` field set to the last lesson whose content is required by the story. This controls both the unlock gate (the student must pass that lesson before the story appears) and the story's content scope (all kanji, vocab, and grammar in the story must be available at that lesson). The story picker lists stories in `unlocksAfter` order. New stories must always have this field.

---

## Common Failure Modes

These are the most frequent errors. All agents should be alert to them.

### Agent 2 failures (caught by Agent 3)

Items retain their original numbers for backward compatibility with existing QA reports. Categories group related failures for faster scanning.

#### Kanji & scope violations

1. **Using kanji from a later lesson** — most common with compound words. Always check every character individually.
#### Term tagging & ID errors

2. **Bare string for a verb** — `"v_iku"` instead of `{ "id": "v_iku", "form": "te_form" }` when the verb is conjugated.
3. **Missing a term entirely** — a kanji word in the `jp` field with no corresponding entry in `terms`.
4. **Fabricated IDs** — writing `"v_toshokan"` without verifying it exists in the glossary.
5. **Wrong form label** — using `"past"` when the correct string is `"plain_past"` or `"polite_mashita"`.
6. **Drill 1 with terms array** — the first vocabulary drill must not have `terms`.
7. **Using a kanji entry (`k_*`) in conversation or reading `terms`** — `k_*` entries only power the kanjiGrid display and will not produce clickable spans in conversations or readings. Any word that needs to be tappable in a conversation or reading line must have a corresponding `type: "vocab"` entry (`v_*`). Family terms are the most common case: 父, 母, 兄, 姉, etc. each need both a kanji entry for the grid and a vocab entry for content tagging.
#### Structural & schema errors

8. **Incomplete vocabList** — omitting particles, set phrases, or grammar items introduced in this lesson. The vocabList must cover every glossary entry marked `lesson_ids = this lesson`, not just the headline nouns and verbs.
9. **Warmup items using new-lesson vocabulary or kanji** — warmup must reinforce prior lessons only. Any item whose `jp` field contains a new-lesson kanji, or whose `terms` reference a new-lesson vocab ID, is invalid and must be rewritten using N5.1 (or earlier) material.
9b. **Wrong warmup item count** — warmup sections must have exactly 4 items, no more and no fewer. Agent 3 must reject any warmup with fewer than 4 items as a hard fail.
10. **Too few conversations** — conversation count must match the reference template lesson (highest-numbered existing lesson of same type/level). Fewer than the template is a hard fail that Agent 3 must catch.
10b. **Missing or wrong drill structure (N4+ lessons)** — All lessons at N4 level and above must have exactly 3 drill sections: Drill 1 (Kanji Readings, no terms, `[漢字] の よみかたは？` format), Drill 2 (Vocabulary), Drill 3 (Grammar & Forms). Omitting Drill 1 is the most common failure — content from N4 onward (including future N3, N2, N1 levels) must include a dedicated kanji reading drill, not merge it into a vocabulary drill or omit it entirely.
11. **Missing standalone noun v_* entry for a newly taught kanji** — if a kanji is to be used as a standalone noun in lesson content (e.g. 水 for water, 木 for tree), verify that a `type: "vocab"` entry with a matching `lesson_ids` exists before using it in a `jp` field. If it does not exist, create it and add it to the vocabList before building the content.
12. **Missing meta.kanji array** — the lesson `meta` object must include `"kanji": [...]` listing the characters introduced in this lesson.
13. **Missing scramble alts for flexible word order** — when a scramble sentence contains a time expression (毎日, 今日, 昨日, etc.) or frequency adverb (いつも, よく, etc.) that can naturally appear sentence-initially or after the topic, an `alts` array must be provided. Omitting alts means a valid student answer is marked wrong.
14. **Missing explanation on review drill items** — every MCQ and scramble item in reviews must include an `explanation` field. This is a hard requirement; omitting it means the student gets no feedback.
15. **Missing instructions on review sections** — every review section must include an `instructions` field describing the task.
16. **Flat conversation structure in reviews** — review conversations must use the `items[]` wrapper array with per-item `title`, `context`, `lines`, `question`, `choices`, `answer`, `explanation`. Do not use the flat lesson-style conversation structure.
17. **Missing distractors on scramble items** — scramble items must include a `distractors` array with 3 plausible wrong segments (wrong particles, transitive/intransitive confusions, similar words from the same lesson range).
18. **ID surface mismatch** — tagging a word with an ID whose glossary `surface` field does not match the token being tagged. Example: tagging `だ` or `だった` with `g_desu` (which has `surface: "です"`). The ID exists and the checklist item "ID exists in glossary" passes — but the tagged entity is semantically wrong. Always look up the `surface` value of each ID and confirm it matches the actual text in the sentence.
19. **Out-of-scope word in `jp` text, absent from `terms`** — a word appears in the `jp` surface string but is never added to `terms` because it "looks like" a common particle or connector. If that word has a glossary entry with an `introducedIn` or `lesson_ids` value, it must be tagged, and its lesson must be in scope. Example: `でも` (`p_demo`, `introducedIn: "N4.14"`) used in a G1 conversation is an out-of-scope scope violation — but scope checks that only scan `terms` IDs will miss it entirely because it was never tagged at all. Scanning `jp` surface tokens, not just `terms` arrays, is required.
#### Compose-specific errors

20. **(Compose) Ungated particles** — including a particle in the `particles` array whose `introducedIn` is later than the compose file's lesson. Check every particle ID against `shared/particles.json`.
21. **(Compose) Plain forms in conjugations** — including だ, だった, or other plain-form patterns when the lesson hasn't taught casual speech. Compositions should stay in polite/formal register by default.
22. **(Compose) Incorrect irregular conjugation examples** — the most common error is showing いかったです instead of よかったです for the past of いい. All irregular forms (いい→よ stem) must be verified in every conjugation entry.
23. **(Compose) Disconnected prompts** — prompts should build one continuous composition, not jump between unrelated topics. Each prompt should extend the narrative from the previous one.
24. **(Compose) Targets using non-kanji vocabulary** — compose scoring is kanji-based. Target IDs should reference vocabulary that contains kanji so the coverage indicator works correctly.
25. **(Compose) VocabPool missing historical vocab** — each prompt's vocabPool should include relevant vocabulary from prior lessons, not just the current lesson's words. Students need connector words, common nouns, and adjectives from earlier lessons to write coherent text.
25b. **(Compose) Silent narrative frame shift** — prompts 1–N use habitual framing ("every morning they run," present tense) and then a later prompt silently shifts to specific-day past tense ("went to the bank," "something happened") without any bridging language in the prompt text. The student has no cue for the tense or frame change and the composition reads as two disconnected pieces. Fix: either commit to one frame throughout, or add an explicit bridge in the prompt at the transition (e.g. "After today's run, Rikizo had an errand…"). This is an Agent 4 consistency failure if Agent 2 submits it without flagging in the CB Checklist.
25c. **(Compose) Premature "close" wording before challengePrompts** — the last regular prompt says "Close by…", "Wrap up by…", or "Conclude by…" but `challengePrompts` is non-empty. Students who read "close" stop writing and skip the challenge prompt. Fix: use neutral forward-looking language for the last regular prompt. Challenge prompts should also be framed as a separate optional scenario — not as a continuation of the same day's events — so students understand they are a bonus, not a mandatory step.
25d. **(Compose) Unnatural model sentence collocation** — a `model` field uses a verb+object pair that does not exist in natural Japanese (e.g. `運動を作る` — you cannot "make exercise"; the correct form is `運動をする`). Because the model is the student's primary reference, it actively teaches the unnatural collocation as correct. Before finalising each model sentence, mentally verify the verb+object pair against real usage. Common safe pairings for 作る: 思い出を作る (make memories ✓), 料理を作る (cook food ✓), 計画を作る (make a plan ✓), 作品を作る (make a work ✓). When 作る is a lesson target, plan a concrete object for it at the Agent 1 scoping stage so Agent 2 doesn't reach for an unnatural pairing under pressure to use the word.
#### Character & story-specific errors

26. **Untagged character name** — a recurring character's name (e.g. りきぞ, やまかわ) appears in a `jp` field but the corresponding `char_*` ID is absent from `terms`. The name renders as plain unclickable text with no sakura pink highlight or portrait popup. Every occurrence in every conversation line and reading passage must be tagged. This is caught by Agent 3 when scanning jp surface tokens. The roster of registered character IDs is in the Character Name Tagging section and `shared/characters.json`.
27. **Invented `char_*` ID** — Agent 2 adds `char_yamakawa` to a terms array but `char_yamakawa` is not yet registered in `shared/characters.json`.
 The term modal silently fails to open. Before using any `char_*` ID, verify it exists in `shared/characters.json`. If it doesn't, add the character entry first (or flag to Agent 1 to add it before content is built).
28. **(Stories) Missing character name key in terms.json** — a character's name appears throughout `story.md` but no surface key for that name exists in `terms.json`. Add the name as a key (e.g. `"りきぞ": { "id": "char_rikizo", "form": null }`) — the story processor highlights every occurrence automatically. If the story uses two spellings (e.g. `りきぞ` and `りきぞう`), add both as separate keys pointing to the same `char_*` ID.
29. **(Stories) Missing particle/copula tags in terms.json** — particles (は, の, も, と, etc.) and g_desu (です) must be tagged in story terms.json so they are tappable, exactly as in lessons. Omitting them means function words are dead text the student cannot tap to look up. Every particle with a `p_*` entry in `shared/particles.json` whose `introducedIn` is ≤ the story's lesson scope must be included. The `"です"` key covers standalone copula occurrences; い-adjective predicative forms (e.g. `"うれしいです"`) are covered by their own longer key.
#### Grammar scope & form errors

30. **Out-of-scope conjugation form** — using a conjugation form (e.g. `te_form`, `desire_tai`, `conditional_ba`) before its `introducedIn` lesson. This is the grammar equivalent of using an untaught kanji. Example: writing ～ています in N5.3 content when `te_form` has `introducedIn: "N5.5"`. Check every `form` value in `terms` against `conjugation_rules.json`. See [Grammar Usage Prerequisite Rules](#grammar-usage-prerequisite-rules).
31. **Out-of-scope structural grammar pattern** — the `jp` surface text contains a grammar construction (～ている, ～てください, ～ましょう, ～たり～たりする, etc.) before the constituent form is available, even if the individual word tags don't explicitly use that form. The pattern in the surface text is the violation, not just the tags. Agent 2 must scan `jp` strings for these patterns, not rely only on `terms` form checking.
32. **何 tagged as k_nani or generic v_nani without pronunciation context** — 何 has two pronunciations: **なに** (`v_nani`) and **なん** (`v_nan`). Using `k_nani` (kanji entry) makes 何 non-tappable in conversations and readings. Using only `v_nani` for all contexts gives students the wrong reading when the pronunciation is actually なん. **Rules:** Use `v_nani` when 何 precedes を or が, or stands alone (e.g. 何を食べますか、何がいい). Use `v_nan` when 何 precedes です, の, counters, or words starting with d/n/t sounds (e.g. 何ですか、何の本、何人). Never use `k_nani` in conversation, reading, or drill `terms` — it is only for the kanjiGrid. Compound words like 何人, 何時, 何曜日 have their own dedicated entries (`v_nannin`, `v_nanji`, `v_nanyoubi`) and should use those instead.
33. **後 tagged as v_ushiro regardless of meaning** — 後 has two completely distinct words: **後ろ** (`v_ushiro`, うしろ, spatial "behind") and **後** (`v_ato`, あと, temporal "after/later"). Unlike 何, the written form alone disambiguates them — no context rules needed. **Rule:** Token `後ろ` (with ろ) → `v_ushiro`. Token `後` standalone (no ろ) → `v_ato`. Using `v_ushiro` for temporal 後 is semantically wrong (it displays the wrong reading and meaning to the student). Never use `k_ushiro` in conversation, reading, or drill `terms` — it is only for the kanjiGrid. For 後で ("later"), tag as `v_ato` + `p_de`. Compounds using the on-reading (午後, 後半, etc.) have their own dedicated IDs.
#### Particle disambiguation errors

34. **が tagged as p_ga regardless of role** — が after a clause-final form (ます/です/plain form) is `p_ga_but` ("but"), not `p_ga` (subject marker). See [が disambiguation](#が-ga--subject-marker-vs-clause-connector-disambiguation) for the full rule and examples.
35. **から tagged as p_kara regardless of role** — から after a verb/adjective/です is `p_kara_because` ("because"), not `p_kara` ("from"). See [から disambiguation](#から-kara--from-vs-because-disambiguation) for the full rule and examples.
36. **でも tagged as p_demo regardless of position** — sentence-initial でも is `p_demo_but` ("but/however"), not `p_demo` ("even/any~"). See [でも disambiguation](#でも-demo--evenany-vs-sentence-initial-but) for the full rule and examples.
37. **と tagged as p_to regardless of role** — と after quoted speech or thought clauses is `p_to_quote`, not `p_to` ("and/with"). See [と disambiguation](#と-to--connective-vs-quotation-disambiguation) for the full rule and examples.
#### Grammar reinforcement failures

38. **Grammar under-reinforcement (ます/ました monotony)** — all verbs in conversations and readings default to `polite_masu` or `polite_mashita` when negative forms, te-form, desire, and volitional forms are all available. This is the grammar equivalent of writing with a limited vocabulary — technically correct but failing to exercise the student's growing skillset. Example: an N5.7 lesson has 5 conversations with 20 tagged verbs, but 18 are ます/ました, zero are てください or ています despite te-form being available since N5.5. Agent 2 must consult the Grammar Reinforcement Requirements and vary verb forms intentionally.
39. **Missing structural patterns in active reinforcement window** — a lesson falls within a grammar milestone's active reinforcement window but none of the required structural patterns (てください, ています, たいです, ましょう, etc.) appear anywhere. This means the student has gone 2+ lessons since learning these patterns without encountering them in natural content. Agent 2 must include at least the minimum count of each pattern required by the reinforcement schedule.
40. **Warmup grammar stagnation** — warmup items continue using only noun-です patterns (「先生です」「大きいです」) long after polite verb forms, te-form, and other grammar have been unlocked. Warmups after N5.5 should exercise recently-unlocked grammar with prior-lesson vocabulary. Example: an N5.8 warmup should include items like 「先生は毎日学校に行きます」(polite_masu) or 「ここに名前を書いてください」(te-form request), not just 「これは本です」.
#### Early-use vocabulary & writing form errors

41. **Early-use word written in kanji before kanji is taught** — writing 私 in N5.1 content when the kanji 私 is not introduced until N4.3. Early-use words must be written in their hiragana form (わたし) until the kanji lesson. Similarly, partial-kanji words must use their partial form (大すき, not 大好き) until all constituent kanji are taught. See [Early-Use Vocabulary Rules](#early-use-vocabulary-rules).
42. **Early-use word written in hiragana after kanji is taught** — writing わたし in N4.5 content when the kanji 私 was introduced in N4.3. Once the kanji is available, the full kanji form must be used. Continuing to write hiragana after the kanji lesson is a missed learning opportunity.
43. **Using an early-use word before its "Use from" lesson** — using すき in N5.3 content when the early-use list says it is available from N5.7. The "Use from" lesson is a hard gate, not a guideline.
#### Register errors

44. **Casual conversation before N5.10** — using plain forms in conversation dialogue before G10 has been taught. All conversations in N5.1–N5.9 must use polite register exclusively. A casual conversation in N5.8 is an out-of-scope grammar violation even if the individual plain forms are mechanically available.
45. **No casual conversation after N5.10** — a lesson at N5.10 or later with zero casual conversations. The register schedule requires at least 1 casual conversation from N5.10 onward. Omitting casual conversations means students never practice plain forms in natural dialogue.
46. **Register mixing within a conversation** — a character uses ます in one line and plain form in the next without an in-story reason. Each conversation must commit to one register throughout. Example failure: line 1 says 「今日は何を食べますか。」, line 2 responds 「ラーメン食べた。」 — the first speaker is polite, the second is casual, with no contextual justification.
47. **Mechanical register swap (です→だ find-and-replace)** — writing casual conversations by taking polite sentences and replacing です with だ and ます with dictionary form, without adjusting sentence structure, particle usage, or adding natural casual markers (よ, ね, な, けど, し). Casual Japanese has its own rhythm — it is not polite Japanese with different verb endings. Example failure: 「わたしは学生だ。日本語を勉強する。」 reads like a textbook, not a friend talking. Natural casual: 「おれ、学生だよ。日本語勉強してるんだ。」
48. **Overusing commands/prohibition** — packing ～ろ/～え commands and ～な prohibition into casual conversations where they don't belong. These forms are blunt/rude and used in narrow contexts (sports, male friends joking, warning signs, urgent situations). A casual conversation between friends discussing weekend plans should not have commands. Overuse makes the student think casual = aggressive.
#### Final Interactive Review & kana-only tagging errors

49. **(Final Interactive Review) Missing sections** — a `final_interactive_review` draft that omits one or more of the 8 required sections. The most commonly dropped sections are `vocab_categories` and `kanji_bingo` because they come last and are easiest to run out of context budget for. All 8 sections are required regardless of file length. Agent 2 must check off each section type in the CB Checklist before handing off. Agent 3 must count sections and reject any draft with fewer than 8.
50. **Kana-only vocabulary systematically untagged** — question words (どう, どこ, いつ, なぜ, いくら) and kana-only adverbs (いつも, よく, まだ, もう, たいてい) are glossary-registered vocab IDs that must appear in `terms`. The most common failure is scanning `jp` text visually and only tagging kanji-containing words, leaving every kana-only lexical word invisible to the student. Treat kana-only vocab exactly the same as kanji vocab: if it has a `v_*` ID in the glossary, it must be tagged. Agent 3 must tokenize the full surface string, not just highlight-scan for kanji.
51. **い-adjective attributive vs predicate form confusion** — using `polite_adj` for an い-adjective that appears before a noun (attributive position). `polite_adj` means `〜いです` (the adjective IS the predicate). An adjective modifying a noun (長い 一日, 大きい 魚) is in attributive position and takes a **bare string**. The error typically happens when the sentence is polite overall: 「長い 一日でした」→ Agent 2 sees polite Japanese and reaches for `polite_adj`, but `長い` modifies 一日, not the sentence predicate. Same error for な-adjectives: 「大切な こと」requires `attributive_na`, not a bare string. Agent 3 must check whether the adjective precedes a noun or is sentence-final before accepting the form.
52. **desire_tai / plain_desire_tai conflation** — using `desire_tai` (which represents `〜たいです`, polite) for a casual/plain sentence that ends `〜たい` without です. Example: a casual conversation line `友だちに 送りたいから` is plain desire — the form is `plain_desire_tai`, not `desire_tai`. The test is simple: does the sentence actually end with `です`? If not, the form must be `plain_desire_tai`. This error is almost always found in casual conversations where the agent reached for the more familiar form string without reading the sentence ending.
#### Form string & desire_tai errors

53. **Purpose construction tagged as polite_masu** — the masu-stem + に construction (買いに, 食べに, 借りに) has no form string in `conjugation_rules.json`. It must be tagged `form: null`. Tagging it as `polite_masu` is wrong — that form string means the verb IS the sentence predicate in ます form (食べます), not a purpose-direction construction (食べに行く). Agent 3 must recognize masu-stem forms used with に as purpose markers and verify they are tagged `form: null`.

53b. **`form: null` used as a fallback for unknown/missing form strings** — when a plain-form verb appears as a predicate (借金がある) or in a nominalisation (借りるのは), agents fall back to `form: null` because no purpose construction is involved and the needed form string doesn't exist yet in `conjugation_rules.json`. This is wrong: `form: null` is only valid for purpose construction. The correct response is to (a) identify what form string is needed (e.g. `plain_form` for dictionary-form predicates), (b) create that entry in `conjugation_rules.json` if it does not exist, (c) use the proper form string. Agent 3 must reject any `form: null` that is not a purpose construction (verb followed immediately by に).

53c. **`desire_tai` used instead of `plain_desire_tai` + `g_desu`** — `desire_tai` is deprecated. It bundles `たいです` into the chip suffix, making `です` non-tappable as a separate chip. This was an original design error (polite vs plain was the intended distinction, but chip surface scope is the real concern). Always use `plain_desire_tai` + `g_desu` for polite 〜たいです sentences so both chips are independently tappable. Agent 3 must hard-fail any draft containing `"form": "desire_tai"`.

53d. **na-adjective glossary entry missing `verb_class: "na_adj"`** — a な-adjective entry in the glossary has `gtype: "na-adjective"` but no `verb_class: "na_adj"`, or has `gtype: "noun"` entirely. The `attributive_na` conjugation rule only fires for entries with `verb_class: "na_adj"`. Without it, 〜な chips silently fail to render — the word appears as plain text with no chip. The fix is always in the glossary entry itself, not in the content. Verify both `gtype` and `verb_class` for every な-adjective entry.
54. **Vocabulary used before glossary entry exists** — Agent 2 writes sentences using words (e.g. シャツ, 帰り, 今) and tags them with IDs without first Grep-verifying those IDs exist in the glossary. The draft then passes Agent 2's self-check ("no invented IDs" was interpreted as "no obviously fake IDs") but Agent 3 finds the IDs are missing. The correct process is: identify every content word needed for the lesson, Grep-verify each ID exists, and add any missing entries to the glossary **before** writing content that uses them. If Agent 2 discovers a missing entry mid-draft, it must stop, flag the gap in the CB Checklist, and either add the entry or restructure the sentence — never proceed with an unverified ID.
54b. **Adding glossary entries to accommodate a lesson refresh** — when rewriting an existing lesson, the agent finds that the original content uses vocabulary with no glossary entry (e.g. 公園, さん歩) and responds by creating new glossary entries to make the IDs valid. This is wrong: the absence of a glossary entry during a refresh proves the word has not been introduced in the curriculum. Adding it would be expanding the curriculum disguised as a bug fix. During refreshes, **absent glossary entry = out-of-scope = remove and replace with available vocab**. The Unregistered Word Report escalation path is for new content creation only — it does not apply to refreshes. See [Lesson Refresh / Rewrite Guidelines](#lesson-refresh--rewrite-guidelines).

54c. **Premature compound introduction via ad-hoc hybrid** — a compound word (e.g. 思い出) whose kanji are all eventually taught is introduced early by substituting hiragana for the not-yet-taught kanji (e.g. `おもい出` at N4.16 when 思 doesn't unlock until N4.30). This is a scope violation disguised as a partial-kanji entry. The partial-kanji mechanism is reserved for compounds where at least one kanji is *never* taught; for compounds where all kanji are eventually taught, the only correct action is deferral. The hybrid form teaches students a writing convention that does not exist in real Japanese and will need to be un-learned. Agent 1's compound discovery step must check whether every kanji in the compound is in the taught set — if not, defer and note the target lesson. Agent 3 must reject any new glossary entry that uses a hybrid form for a compound not on the approved partial-kanji list.
#### Grammar lesson schema & infrastructure errors

55. **(Grammar) New conjugation form has no `conjugation_rules.json` entry** — A grammar lesson teaches a new form (e.g. `potential`, `passive`, `conditional_tara`) but the form string has no top-level key in `conjugation_rules.json`. Agent 2 cannot use it in `terms` arrays (no valid form string exists), and if it guesses a string anyway it will silently fail — Agent 3's "valid key in conjugation_rules.json" check will reject it. The form must be added to `conjugation_rules.json` with complete godan, ichidan, and irregular rules, and the correct `introducedIn` field, before Agent 2 can proceed. This is an Agent 1 scoping failure: the conjugation form audit step must catch it before the brief reaches Agent 2.

55b. **(Grammar) `introducedIn` field set to wrong lesson in `conjugation_rules.json`** — A form exists in `conjugation_rules.json` but its `introducedIn` value is wrong — pointing to a later lesson than the grammar lesson that teaches it, or to an earlier lesson (making it available too soon). The downstream effect: Agent 4's Grammar Usage Validation will flag uses of the form as out-of-scope in every lesson that correctly reinforces it, OR will silently allow the form before it is taught. Agent 1 must verify `introducedIn` as part of the conjugation form audit and correct it if wrong. Agent 3 must cross-reference any form with `introducedIn` set to the current grammar lesson ID and confirm that value is accurate.

56. **(Grammar) Wrong field names on `annotatedExample` or `grammarComparison`** — these sections silently render empty when the wrong field names are used. There is no error message; the section simply shows nothing. The renderer ignores unrecognised fields. **`annotatedExample` must use `examples[]`** (array of `{context?, parts[], en, note?}` objects) — never `sentence`, `translation`, or a top-level `parts[]`. **`grammarComparison` must use `items[]`** (array of `{label, color, points[], example?}`) — never `itemA`/`itemB`. Agent 2 must verify these field names against the Grammar JSON schema in the Content Types section before submitting. Agent 3 must check that `annotatedExample` sections have an `examples` array (not a `parts` array) and that `grammarComparison` sections have an `items` array (not `itemA`/`itemB`). A section with the wrong schema is a **hard fail** equivalent to a missing required field.
56b. **(Grammar) `fillSlot` items using `sentence` instead of `before`/`after`** — the `fillSlot` renderer splits the sentence display using `item.before` and `item.after` strings. Using a `sentence` field with `___` as the blank placeholder is the wrong schema — the renderer will render `before` as undefined (empty) and ignore the rest. **Always pre-split each item into `before` (text before the blank) and `after` (text after the blank).** Example: `"sentence": "野菜___が好きです"` must become `"before": "野菜"` and `"after": "が好きです"`. This is the same class of silent-failure as wrong `annotatedExample` field names — no error, just empty/broken UI.

56c. **(Grammar) `grammarRule.pattern[]` chips using `role`/`gloss` instead of `color`/`label`** — pattern chips (the colored formula bar at the top of a grammarRule section) require `color` and `label` fields. The fields `role` and `gloss` belong to example `parts[]` only. Using `role` instead of `color` means `GRAMMAR_COLORS[undefined]` returns `undefined`, which falls back to `'#888'` grey — every chip renders grey regardless of intended color. Using `gloss` instead of `label` means `esc(chip.label)` is called on `undefined`, producing an empty string — every chip shows no text label. The rendered result is a row of identically-grey silent chips. This is a **hard fail** — it makes the entire lesson's grammar formula visually useless. Agent 2 must use `color`/`label`/`text` on every pattern chip. Agent 3 must verify that no pattern chip has a `role` or `gloss` field.

56d. **(Grammar) `meta.particles[]` using particle IDs instead of character strings** — `meta.particles` controls which terms get yellow/gold particle-focus highlighting in conversation lines. The renderer compares `span.textContent === p` for each entry `p` in the array. If the entry is `"p_noni"` (an ID string), it will never equal the actual Japanese text `"のに"` in a span — zero particles are highlighted, the yellow overlay never appears. **All `meta.particles` entries must be the actual Japanese character strings** (e.g. `["のに", "でも", "し"]`, not `["p_noni", "p_demo_but", "p_shi"]`). To find the correct character string for a particle ID, look it up in `shared/particles.json` — the `particle` field contains the character string. This failure is silent: no error, just no highlighting, making it hard to diagnose. Agent 2 must write character strings. Agent 3 must verify each `meta.particles` entry is Japanese text, not an ID.

56e. **(Grammar) `sentenceTransform` items missing `choices[]` — blank screen crash** — `renderSentenceTransform()` calls `[...item.choices].sort(...)` to build the multiple-choice UI. If `choices` is absent, this throws a TypeError (`Cannot spread non-iterable undefined`). The renderer clears the body element BEFORE rendering, so the crash leaves a completely blank screen — the user sees nothing and cannot navigate forward. Navigation button click handlers are not wrapped in try-catch, so the error propagates silently. **Every `sentenceTransform` item must have a `choices[]` array with 4 strings: the correct `answer` plus 3 plausible distractors.** Good distractors use a different connector (てから vs まえに), a wrong verb form (dictionary form instead of て-form), or a correct answer for a different transformation type. Agent 3 must verify every sentenceTransform item has a 4-element `choices` array.

56f. **(Grammar) Grammar conversation `terms[]` not tagged — no visible highlights or click behavior** — grammar lesson conversations go through the same `processText()` function as lesson content. This generates `.jp-term` (blue, clickable) and `.jp-term-name` (pink, clickable) spans. If `terms[]` is missing, sparse, or entirely empty, the Japanese text renders as plain unformatted text with no visual indication of interactivity. **Grammar `conversation` sections require full `terms[]` tagging using the same rules as lesson JSON** — every kanji-containing word, kana-only vocab word, particle, and copula must be tagged. The fact that content is in a grammar file does not exempt it from the Sentence Token Scan Protocol. Agent 2 must apply the STSP to every grammar conversation `jp` field. Agent 3 must audit grammar conversation terms exactly as it audits lesson conversation terms.

#### Tagging edge cases & rendering bugs

57. **Warmup particle omission** — systematically skipping は、が、を、の、に、で、も and other particles from warmup `terms` arrays under the false assumption that warmup items need less precision or that particles are "obvious." Warmup items require exactly the same completeness as conversation lines. A warmup sentence like 「朝、何を 食べますか。」 needs `p_wo` (を) and `p_ka` (か) just as much as a conversation line does. This is currently the single most common tagging failure across lessons N4.8–N4.10. Agent 2 must apply the STSP to every warmup jp field. Agent 3 must specifically check warmup sections during QA.

58. **Casual question without `p_ka`** — writing a casual question ending with `？` and omitting `p_ka` from `terms`. In casual spoken Japanese, the question particle is sometimes not pronounced and rising intonation is used instead — but `p_ka` must still be tagged in the written content so students can tap the sentence-final region and learn the grammatical function. Any sentence that is a question (whether polite with か or casual with ？) requires `p_ka` in `terms`. Example failure: `"jp": "映画、何時に 始まる？"` with no `p_ka` in terms. Example fix: add `"p_ka"` to the terms array.

59. **Adjacent single-char kana blocking** — when `jp` text contains two consecutive single-char kana terms that are both tagged (e.g. `ことだね` with `g_da` + `p_ne`, or `借りるのは` with `p_no` + `p_wa`), the single-char lookahead regex `(?![\\u3040-\\u30FF])` blocks the leftmost term from matching while the rightmost is still unwrapped hiragana. Fix: list the rightmost single-char kana term **first** in the `terms` array so it is wrapped in a `<span>` before the leftmost is processed. The following character then becomes `<` (not hiragana), which passes the lookahead. Examples: `ことだね` → put `p_ne` before `g_da`; `借りるのは` → put `p_wa` before `p_no`. Agent 2 must scan every `jp` string for adjacent single-char kana pairs and check their order. Agent 3 must flag any adjacent pair where the order is wrong.

60. **Corrupted glossary surface breaking all conjugations** — a glossary entry with a typo in its `surface` field (e.g. `"送くる"` instead of `"送る"`) silently breaks every conjugated form of that verb in the rendered app. The conjugation engine replaces the final kana of `surface` to produce chips like `送りたい` — but if `surface` is `送くる`, the output is `送くりたい`, which does not exist in the `jp` text and produces no chip. Students see a broken interaction and may internalise a word that does not exist. Agent 3 must Grep the full glossary entry for every verb and adjective used in a lesson, read the `surface` field, and confirm it is a valid Japanese word: correct length, no spurious inserted kana, ending in a う-column kana (godan) or る (ichidan). This check is distinct from the ID-existence check — an entry can exist with a valid ID and still have a corrupted surface.

### Agent 3 failures (caught by Agent 4)

1. **Approving unnatural dialogue** — grammatically correct but no real speaker would say it.
2. **Approving overstuffed sections** — 30 vocabulary chips, 5 conversations, 4 readings in one lesson.
3. **Missing a grammar level jump** — content using grammar structures 2–3 tiers above the lesson. Now that conjugation forms have concrete `introducedIn` fields, this should be caught by Agent 3's hard gate. But Agent 4 remains the backstop for structural patterns in `jp` text that Agent 3's form-tag check might miss (e.g. a ～ている pattern where the て and いる are tagged separately but neither tag explicitly carries a form that triggers the gate).
4. **Kanji-only token scan** — checking that kanji-containing words are tagged but not scanning the full `jp` string token by token. Kana-only words (copulas like だ/だった, conjunctions, sentence-final particles, adverbs) can be out of scope, mis-tagged, or missing from `terms` entirely and will be invisible to a visual scan that only flags visually prominent kanji characters.
5b. **Accepting wrong adjective form without checking position** — approving a `polite_adj` tag on an い-adjective that appears before a noun. Agent 3 must verify: is the adjective sentence-final (predicate)? If it precedes a noun, `polite_adj` is wrong and the tag must be a bare string. Same check for `attributive_na` on な-adjectives: required before nouns, not for predicates.
5. **Passing under-reinforced content** — approving a draft that meets all structural requirements (correct tags, valid IDs, no out-of-scope forms) but fails to use recently-unlocked grammar. Agent 3 must count tagged forms against the reinforcement schedule minimums and reject drafts that don't meet active-window targets. This is the "floor" complement to the existing "ceiling" checks.
6. **Approving register violations** — passing a N5.10+ lesson that has zero casual conversations, or a pre-N5.10 lesson that includes casual dialogue. Register requirements are structural checks equivalent to grammar reinforcement minimums — not style preferences.
7. **Not catching register mixing** — a conversation where one character speaks politely and another speaks casually (without an in-story reason) should be flagged as a structural error, not accepted as "natural variation."

### Agent 4 failures (caught by Agent 1 in next pass)

1. **Vague rewrite directives** — "make it more natural" without specific lines identified.
2. **Rejecting content for subjective reasons** — if the only issue is style preference rather than a structural problem, prefer a pass with a note over a full rewrite.
3. **Missing redundancy clusters** — assessing each sentence individually rather than reading scenes as sequences. A cluster of 2+ consecutive sentences that all convey the same fact (three ways of introducing a character, two ways of saying the location is large) is not caught by any per-sentence check. Agent 4 must scan for this pattern explicitly. The root cause is always forced vocabulary insertion by Agent 2, and the fix is a rewrite directive to Agent 1 to redesign the scene so the vocab word appears in a context that actually requires it.
4. **Not catching grammar reinforcement gaps** — approving content where recently-taught grammar is absent. The Grammar Reinforcement Audit must be performed on every draft. Agent 4 cannot rely on "it sounds natural" as justification for content that avoids using available grammar — natural content that happens to only use ます/ました is still pedagogically deficient if the student knows te-form, negatives, desire, and volitional.
5. **Approving mechanical casual dialogue** — casual conversations that read like polite conversations with です/ます find-and-replaced to だ/dictionary form. Real casual Japanese has different rhythm, particle usage, and sentence structure. Agent 4 must assess whether casual conversations sound like genuine informal speech between friends.
6. **Not flagging register ratio violations** — approving a N5.12 lesson where all 5 conversations are polite. The register schedule requires at least 1 casual conversation from N5.10. Agent 4 must check the ratio, not just the individual conversations.

### Grammar-specific cross-agent failures

These failures span multiple agents and are the most damaging because they may not be caught by any single agent's checks:

1. **Factually incorrect grammar explanation (GP-XX)** — The explanation sounds authoritative but contradicts standard Japanese. Most dangerous because students will internalize the wrong rule. Agent 3's Grammar Accuracy Gate is the primary defense. Example: claiming い-adjectives don't take です.

2. **Unauthorized grammar point substitution** — Agent 2 replaces a grammar point from the brief with a different one, usually because the replacement seems "more interesting" or "more useful." This breaks the pedagogical sequence. Agent 4's Scope Alignment Check is the primary defense. Example: replacing casual だ with なんです.

3. **Prerequisite-violating scope in GRAMMAR_CONTENT.md itself** — The spec lists a grammar point that is too advanced for the lesson's `unlocksAfter` level. This is an upstream error that all agents will faithfully propagate. Agent 1's prerequisite validation catches this before content creation begins. Example: teaching なんです in G1 when の hasn't been introduced yet.

4. **Oversimplified grammar comparison** — A `grammarComparison` section presents a nuanced distinction (like は vs が) with rules so simple they're misleading. The rules work for the examples shown but break in real usage. Agent 4's natural language check should catch this, but it requires the reviewer to mentally test the rules against cases NOT shown in the lesson.

5. **Example sentences that are grammatically correct but pedagogically wrong** — The sentence uses the grammar pattern correctly but in a context where a native speaker would never use that pattern. Example: using が in a self-introduction (わたしが先生です) without the contrastive context that would make が natural there. Agent 4 is the defense.

6. **Out-of-scope grammar usage passing all checks** — A conjugation form or structural pattern is used before its `introducedIn` lesson, but it slips through because: (a) Agent 2 doesn't check `introducedIn` on forms, (b) Agent 3 checks form strings for validity but not their `introducedIn` dates, and (c) Agent 4's "skill progression" check is too vague to catch it. This was the most common grammar-related failure before the Grammar Usage Validation was added. The defense is now distributed: Agent 2 checks `introducedIn` during authoring (CB Checklist), Agent 3 hard-gates every `form` against `conjugation_rules.json`, and Agent 4 performs a structural pattern scan of `jp` surface text. All three layers must be active.

7. **Systematic grammar under-reinforcement across lessons** — The mirror image of failure #6. Grammar forms are correctly gated (never used too early) but also never used *enough* after they're taught. The student learns te-form in G8/N5.5, but N5.6, N5.7, and N5.8 content all default to ます/ました because Agent 2 wasn't prompted to use the new forms, Agent 3 only checked for out-of-scope violations (ceiling), and Agent 4's "skill progression" check was too vague to catch the absence. The defense is now distributed: Agent 1 includes reinforcement targets in the Content Brief, Agent 2 actively varies verb forms and meets minimum counts (CB Checklist), Agent 3 counts tagged forms against the active-window minimums (hard gate), and Agent 4 performs the Grammar Reinforcement Audit checking for under-use, verb form diversity, and structural pattern presence. All four layers must be active. The [Grammar Reinforcement Requirements](#grammar-reinforcement-requirements) section defines the concrete schedule.

8. **Grammar lesson introduces a connector/particle with no glossary or particles.json entry** — When a grammar lesson teaches a new grammatical connector (e.g. ために, まえに, あとで, のに, ～たり), Agent 1 must verify that every content word in that connector has a tappable entry. Specifically:
   - If the connector contains a **lexical noun** (ため, 前, 後, etc.), check whether a `v_*` entry exists in the glossary. If not, add one before content is built. Without it, the word will be permanently dead text in every future `jp` field where it appears.
   - If the connector is a **pure grammatical particle** (ながら, から, まで, etc.), check whether a `p_*` entry exists in `shared/particles.json`. If not, add one.
   - The grammar lesson's `parts[]` sections (grammarRule, annotatedExample) are exempt — they use static display text. But the lesson's `conversation` section uses `jp + terms[]`, and all future lessons that reinforce this grammar also use `jp + terms[]`. A missing entry cannot be deferred — it cascades into every future lesson.
   - **Agent 1 responsibility:** When scoping a grammar lesson, enumerate every new connector word the lesson introduces. For each, run a targeted Grep against the glossary and `shared/particles.json`. Flag any missing entry and add it before dispatching to Agent 2.
   - **Agent 2 responsibility:** If a connector word cannot be tagged because its ID is missing, do NOT omit it from the conversation silently. Flag it in the CB Checklist under "Missing glossary/particles.json entries" and restructure the conversation to avoid the untaggable word until the entry is added.
   - **Agent 3 responsibility:** For every untagged lexical token in a grammar lesson `conversation` jp field, verify the token genuinely has no glossary entry (run a Grep). If an entry exists but was not tagged, it is a hard fail. If no entry exists, produce an Unregistered Word Report to Agent 1 — do not pass the draft.

9. **Connector noun written in kanji when kanji is not in the taught set** — Grammar connector nouns like ため (為), まえ (前 — taught N5.9), あと (後 — taught N5.9), こと (事 — taught N4.14) each have a kanji form and a hiragana form. Agent 2 must write the hiragana form unless the kanji is already in the taught set at the lesson's `unlocksAfter` level. Example: ために in a lesson unlocking after N4.10 must be written たまに (wrong) → ために (correct hiragana) since 為 is never taught. まえに in a lesson unlocking after N4.10 must be written まえに (hiragana) since 前 is N5.9 ≤ N4.10 — wait, 前 IS taught by N5.9 which predates N4.10, so 前に is correct kanji form. Agent 1 must check each connector word against the taught-kanji set at `unlocksAfter` and include the correct writing form in the Content Brief.

10. **Grammar lesson teaches a new conjugation form with no `conjugation_rules.json` entry** — When a grammar lesson formally introduces a new verb or adjective form (e.g. G13 introduces `potential`, G23 introduces `passive`, G19 introduces `tari_form` and `nagara_form`), that form must exist as a top-level key in `conjugation_rules.json` with complete rules before Agent 2 can use it. If the entry is missing:
    - Agent 2 has no valid form string to put in `terms` arrays, so any content using the new form will either use an invalid string (caught by Agent 3 as a hard fail) or silently omit tagging.
    - Every existing lesson's Grammar Usage Validation gate references `introducedIn` in `conjugation_rules.json` — a missing or wrong `introducedIn` cascades into false-positive or false-negative scope checks on all future content.
    - **Agent 1 responsibility:** The conjugation form audit (see above) catches this before Agent 2 starts. For each new form the lesson teaches, Grep `conjugation_rules.json` for the form ID. If the key is missing, add a complete entry (label, description, introducedIn, godan/ichidan/irregular rules) before dispatching. If the entry exists but `introducedIn` is wrong, correct it.
    - **Agent 2 responsibility:** If using a form string that Agent 1 has flagged as newly added, double-check the form string exactly matches the key in `conjugation_rules.json` (no typos). Flag in the CB Checklist: "New form [form_id] — entry added to conjugation_rules.json by Agent 1, verified present."
    - **Agent 3 responsibility:** For every `form` value in `terms`, verify it is a valid key in `conjugation_rules.json`. For forms whose `introducedIn` equals the current grammar lesson ID, additionally confirm the `introducedIn` is correctly set — not an earlier lesson (makes the form available too soon) and not a later lesson (makes all reinforcement content appear out of scope).

---

11. **godan_euphonic map name referenced in conjugation_rules.json but absent from GODAN_MAPS in text-processor.js** — A form definition in `conjugation_rules.json` specifies `"type": "godan_euphonic"` with `"map": "tari_form"` (or any other map name). The data-layer checks pass: the form key exists, `introducedIn` is correct. But at runtime `GODAN_MAPS[rule.map]` returns `undefined`, the if-branch in the conjugation engine is skipped, and every godan verb tagged with that form silently renders as its dictionary form — no chip transformation, no error. Agent 1 must Grep `app/shared/text-processor.js` for every `map` value used by any form in scope and confirm the key exists in `GODAN_MAPS`. Agent 3 cannot detect this failure — it is invisible to any data-layer check and must be caught before content creation begins.

12. **Compound vocab surface broken by readability spaces in jp text** — A compound entry like `v_atamagaii` (surface `"頭がいい"`) is tagged in `terms`, but the jp field writes `頭が いい` with a space between が and いい for readability. The text processor does exact substring matching; the compound never matches, no chip appears, no error is thrown. The **wrong** fix is to split the compound into constituent terms (`v_atama` + `p_ga` + `v_ii`) — that changes the semantic unit the student sees from "smart / intelligent" to "head / subject marker / good". The **correct** fix is to remove the space from the jp text so it matches the surface exactly (`頭がいい`). Rule: compound surfaces are authoritative; jp text must conform to them. Agent 3 must check every compound-surface term for contiguous match.
