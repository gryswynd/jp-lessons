# Quality Gates & File Reference (Part 1: Pass/Fail Criteria + Structure Reference)

> **Loaded by:** Agent 3 (QA Reviewer) and Agent 4 (Consistency Reviewer) during review passes.
> **Purpose:** Defines pass/fail criteria for QA and consistency review, file structure reference, and glossary access patterns.
> **See also:** `skills/quality-gates-failures.md` (failure mode catalog).
---

## Quality Gates (Pass/Fail Criteria)

### Agent 3 (QA) — hard pass/fail

All of the following must be TRUE for a QA pass:

- [ ] Every kanji in every `jp`/passage field is in the taught-kanji set
- [ ] Every character name from the roster (see Character Name Tagging) that appears in a `jp` or passage field has the correct `char_*` ID in the `terms` array
- [ ] Every `char_*` ID used in `terms` arrays is registered in `shared/characters.json`
- [ ] (Stories) Every character name in `story.md` has a surface key in `terms.json` pointing to the correct `char_*` ID
- [ ] Every lexical token in every `jp`/passage field is tagged in the `terms` array — this includes kana-only words (copulas, conjunctions, sentence-final particles, adverbs); not just kanji-containing words
- [ ] **(Stories) Story.md token coverage:** The STSP applies to story.md Japanese prose exactly as it does to `jp` fields. Agent 3 MUST go through the Japanese story text sentence by sentence and verify every content token is covered by a terms.json key. This is NOT covered by hooks — it requires manual inspection. For each sentence: list every content token, confirm a terms.json key exists with that exact surface. Pay special attention to: (a) common conjunctions and adverbs that look "obviously covered" but may have no glossary entry (そして, それで, それに, として, ように, やる, いや, etc.); (b) surface theft — any token whose first character is also a standalone particle key (は, が, で, に, を, も, と, の, か, や, よ, な, で) must have its own terms.json key or the particle will steal the leading character; (c) nagara-form verbs — `Vます-stem＋ながら` must have an explicit nagara_form entry or `ながら` will consume the suffix leaving the stem untagged. A missing terms.json key is a **hard fail**.
- [ ] Every kana-only word in a `jp` field that is NOT tagged in `terms` has been verified to have no glossary entry (i.e. it is truly an untaggable function word, not a tagged-but-out-of-scope one)
- [ ] Every term ID in every `terms` array exists in the glossary
- [ ] Every term ID's `surface` field matches (or inflects from) the token it tags in the `jp` field — ID existence alone is not sufficient; a surface mismatch (e.g. tagging `だ` with `g_desu` whose surface is `です`) is a hard fail
- [ ] Glossary surface sanity check: for every verb or adjective entry used, Grep the full entry and confirm the `surface` field is a valid Japanese word — correct length, no spurious inserted kana (e.g. `"送る"` not `"送くる"`), and matching verb class (godan ends in a う-column kana, ichidan ends in る). A corrupted surface silently breaks all conjugated forms of that word, teaching students a word that does not exist
- [ ] Every verb/adjective `terms` entry uses `{ "id": "...", "form": "..." }` with a valid form string
- [ ] Every `form` value in `terms` has `introducedIn` ≤ current lesson in `conjugation_rules.json` (see Grammar Usage Prerequisite Rules in `skills/grammar-rules-prerequisites.md`)
- [ ] Every `form: null` in lesson/review `terms` arrays verified as a genuine purpose construction: the verb must be followed by に in the `jp` text. Any `form: null` not meeting this test is a **hard fail** — the form string is missing and must be created
- [ ] No `desire_tai` form used anywhere — deprecated; hard fail if present. Use `plain_desire_tai` + `g_desu` instead
- [ ] Every な-adjective glossary entry used with `attributive_na` or `polite_adj` has BOTH `gtype: "na-adjective"` AND `verb_class: "na_adj"` — either field alone is insufficient
- [ ] No structural grammar pattern (～ている, ～てください, ～たり～たりする, ～ましょう, etc.) appears in `jp` text before its constituent form is available
- [ ] Active-window grammar reinforcement minimum counts are met (count tagged forms across conversations + readings; see Grammar Reinforcement Requirements in `skills/grammar-rules-reinforcement.md`)
- [ ] (N4+ lessons) Exactly 3 drill sections are present in order: Drill 1 Kanji Readings, Drill 2 Vocabulary, Drill 3 Grammar & Forms
- [ ] (N4+ lessons) Drill 1 items use `[漢字] の よみかたは？` format with no `terms` array
- [ ] Drill 1 MCQ items have no `terms` array; all other drills do
- [ ] Answer fields exactly match one of the choices strings
- [ ] The JSON validates (no syntax errors)
- [ ] All required fields are present for the section type
- [ ] No ID appears in terms that was not verified against the glossary file
- [ ] Early-use vocabulary written in hiragana is on the approved early-use list and the current lesson ≥ the word's "Use from" lesson (see Early-Use Vocabulary Rules in `skills/grammar-rules-prerequisites.md`)
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
- [ ] (Stories) **Tokenization conflict check:** After the full token coverage pass above, for any remaining untagged token (i.e. a pure-function word with no glossary entry), confirm it cannot be split incorrectly by the text processor. Specifically: any hiragana word that *starts with a character that is also a standalone particle key* (は, が, で, に, を, も, と, の, か, で, や, へ) will be misrendered — the processor will greedily match the particle, leaving the remainder as broken kana. Any such word MUST be either tagged in terms.json (if a glossary entry exists) or rewritten to avoid the conflict. Common problem cases: `はこ` (→ `は`+`こ`), `はい` (→ `は`+`い`), `ほかの` if `ほ` triggers conflict. Check every untagged hiragana word against this rule.
- [ ] (Stories) **Grammar compound patterns — particle split check:** Grammar constructions that embed standalone particles must be tagged correctly to prevent wrong splits. Critical patterns: `～てはいけない` (contains `は`) — add `いけない` → v_ikeru plain_negative; `～てもいい` (contains `も`) — ensure `いい` → v_ii is tagged; `～ないといけない` (contains `と`) — check component tagging. If these components are missing from terms.json, the pattern silently breaks.
- [ ] (Stories) **`いい` always tagged:** `いい` (v_ii, N5.1) must have an entry in terms.json for any story. Absence causes tokenization failures when preceded by は, も, or other particle keys.
- [ ] (Register) Lessons N5.10+ have at least 1 casual conversation (see Register Requirements in `skills/grammar-rules-reinforcement.md`)
- [ ] (Register) Lessons before N5.10 have zero casual conversations — 100% polite register
- [ ] (Register) Casual conversations do not mix registers — no ます/です forms in casual dialogue lines, no plain forms in polite dialogue lines
- [ ] (Register) Plain forms in casual conversations have `introducedIn` ≤ current lesson
- [ ] (Register) Casual conversation `context` fields describe informal relationships (friends, family, close peers)
- [ ] manifest.json contains an entry for this content file — Grep manifest.json for the content `id` or `dir`/`file` path and confirm the entry is present with correct `id`, `title`, `dir` or `file`, and `unlocksAfter` fields; a missing manifest entry is a hard fail (the content is invisible in the app)

### Agent 4 (CR) — soft pass/fail (judgment-based)

All of the following should be TRUE for a CR pass:

- [ ] Conversations sound natural and idiomatic, not like direct grammar exercises
- [ ] **Redundancy check:** No cluster of 2+ consecutive sentences conveys the same information — each sentence adds something new. Forced vocabulary insertion almost always produces redundant clusters (three ways of introducing a character, two ways of saying someone is tired). Read scenes as sequences, not isolated sentences.
- [ ] The scenario is culturally plausible and engaging
- [ ] Grammar complexity matches the target lesson tier — every conjugation form and structural grammar pattern in `jp` text has `introducedIn` ≤ current lesson (hard fail if violated; see Grammar Usage Validation in `skills/pipeline-reviewers.md`)
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
- [ ] **Quiz answer ambiguity:** Every MCQ/fillSlot/drill item has exactly one correct answer that is unambiguously the best choice — no alternative answer is grammatically valid and contextually appropriate. If `also_accept` is used, the primary answer must be clearly the best choice and the explanation must state why
- [ ] **Explanation/hint redundancy:** No `notes` array or `explanation` fields repeat the same rule or information in different words — each entry adds unique pedagogical value
- [ ] **Unsupported claims:** Every grammar rule or assertion in `explanation`, `notes`, and comparison `points` is paired with a concrete example sentence — no bare claims without demonstration
- [ ] **Identification heuristic soundness (grammar lessons):** Any "how to spot," "memory trick," or "quick test" in `explanation`, `notes`, or `points` is verifiably usable by a learner who does not yet know the answer — not circular reasoning (GP-11). When no reliable test exists, the content says so explicitly rather than inventing a non-working trick.

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
