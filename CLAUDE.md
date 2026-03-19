> **⚠️ SCOPE: LESSON & LEARNING CONTENT ONLY.** This file (`CLAUDE.md`) governs all educational content creation: lessons, reviews, compose prompts, stories, glossary entries, and any JSON/MD learning content. It does **NOT** govern visual art asset generation. For all art assets (sprites, portraits, backgrounds, tilesets, UI elements, enemy concepts, anything involving the Gemini image API), follow `RikizoArtPipeline.md` and its companion files (`PaperBanana.md`, `gemini-3-image-api-guide.md`). **Never mix these two systems.** The 4-agent pipeline below (PM → CB → QA → CR) is exclusively for educational content. The 5-agent art pipeline (Retriever → Planner → Stylist → Visualizer → Critic) in `RikizoArtPipeline.md` is exclusively for art assets. If a task involves both (e.g. "create Day 3 with all its assets and lesson content"), treat them as two separate subtasks, each governed by its own document.

# Content Creation Workflow — Multi-Agent Pipeline

This file governs how Claude Code creates all lesson content for this repository. When a user asks for any content to be created or updated, Claude Code **must** follow the multi-agent pipeline defined here. Do not skip agents, do not merge roles, and do not deliver output that has not passed all quality gates.

---

## Table of Contents

1. [Pipeline Overview](#pipeline-overview)
2. [Agent Roles & Responsibilities](#agent-roles--responsibilities)
3. [The Handoff Protocol](#the-handoff-protocol)
4. [Content Types & Their Rules](#content-types--their-rules)
5. [Term Tagging Reference](#term-tagging-reference)
6. [Character Name Tagging](#character-name-tagging)
7. [Kanji Prerequisite Rules](#kanji-prerequisite-rules)
8. [Approved Vocabulary Rules](#approved-vocabulary-rules)
9. [Lesson Refresh / Rewrite Guidelines](#lesson-refresh--rewrite-guidelines)
10. [Early-Use Vocabulary Rules](#early-use-vocabulary-rules)
11. [Grammar Usage Prerequisite Rules](#grammar-usage-prerequisite-rules)
12. [Grammar Reinforcement Requirements](#grammar-reinforcement-requirements)
13. [Register Requirements (Polite vs Casual)](#register-requirements-polite-vs-casual)
14. [Quality Gates (Pass/Fail Criteria)](#quality-gates-passfail-criteria)
15. [File & Structure Reference](#file--structure-reference)
16. [Common Failure Modes](#common-failure-modes)

---

## Pipeline Overview

Content creation always runs through **four sequential agents**. Each agent has a single, well-defined job. No content may skip a stage.

**Agents 2, 3, and 4 run as genuinely independent subprocesses** spawned via the `Agent` tool. Each subagent receives only what is explicitly passed in its prompt — it has no access to the main conversation history, the previous agent's reasoning, or any context beyond its assigned inputs. Agent 1 runs in the main context and acts as coordinator throughout.

This independence is not cosmetic. It prevents the authorial bias that occurs when the same context writes and then reviews content. Agent 3 in particular approaches the draft cold, with no memory of having written any of it — which is the prerequisite for reliable mechanical checks like the kanji scope audit.

```
User Request
     │
     ▼
┌─────────────────────────────────────────────┐
│  AGENT 1: Project Manager  [main context]   │ ◄──── Receives rewrite requests from Agent 4
│  Scopes, plans, spawns subagents            │
└────────────┬────────────────────────────────┘
             │ Spawns Agent 2 via Agent tool
             │ (passes: Content Brief + file paths)
             ▼
┌─────────────────────────────────────────────┐
│  AGENT 2: Content Builder  [subagent]       │ ◄──── Re-spawned with QA failure report
│  Writes the actual JSON/MD                  │
└────────────┬────────────────────────────────┘
             │ Returns draft to Agent 1
             ▼
┌─────────────────────────────────────────────┐
│  AGENT 3: QA Reviewer      [subagent]       │
│  Vocab, tagging, structure                  │──── FAIL → Agent 1 re-spawns Agent 2
└────────────┬────────────────────────────────┘
             │ Returns QA-PASS to Agent 1
             ▼
┌─────────────────────────────────────────────┐
│  AGENT 4: Consistency Check [subagent]      │
│  Natural language, scope,                   │──── FAIL → Agent 1 updates brief, re-spawns Agent 2
│  skill progression                          │
└────────────┬────────────────────────────────┘
             │ Returns approval to Agent 1
             ▼
        Agent 1 writes to repo
```

---

## Agent Roles & Responsibilities

---

### AGENT 1 — Project Manager (PM)

**Trigger:** User request for content creation or update.

**Responsibilities:**
- Read the user's request and identify: content type, target lesson(s), level (N5/N4), and any special focus.
- Read `manifest.json` to understand what already exists and where new content fits.
- **Do not read the glossary in full.** The glossary files are large and will exceed output token limits. Instead use targeted Grep queries: search by `lesson_ids` to enumerate vocab for the target lesson, and search by `"id": "v_foo"` to verify individual IDs. See [Glossary Access Pattern](#glossary-access-pattern) below.
- Build a **Content Brief** (see format below) and pass it to Agent 2.
- If Agent 4 returns a rewrite note, analyse the feedback, update the brief, and re-dispatch to Agent 2. Log what changed.
- If Agent 3 returns an Unregistered Word Report (not a FAIL), present the word list to the user using the escalation format. For each word the user approves, add the entry to the correct glossary file before re-dispatching to Agent 2. For each word the user rejects, instruct Agent 2 to remove or replace it. Log all additions and rejections in the Rewrite Notes field.
- Final: write the approved file to the correct path and update `manifest.json` if required.
- **Reference template rule.** Before building the Content Brief, identify the highest-numbered existing lesson file of the same content type and level (e.g. for a new N5 lesson, find the highest N5.X.json that exists). Use that file as the structural template — its section counts, conversation count, vocabulary density, and tone represent the current standard. Include it in the Dependencies field of the Content Brief. Earlier lessons may use outdated structures; always defer to the latest. If the curriculum spans multiple levels (e.g. N5 and N4 both exist), the highest-numbered lesson across the highest level is the most authoritative template.
- **Compound discovery.** When scoping vocabulary for a new lesson, search the glossary for compounds that can be formed from the taught-kanji set. For each newly introduced kanji character, Grep for that character in the glossary's `"surface"` fields to discover existing compound words whose constituent kanji are all now taught. Flag any such compounds to the user as candidates for inclusion. This step ensures the lesson maximises use of newly-unlocked vocabulary. **If a compound is found where one or more kanji are not yet in the taught set, do not introduce it at this lesson — not even as a partial-kanji hybrid.** Note it in the Content Brief under "Deferred compounds" with the lesson ID where the last required kanji unlocks. At that later lesson, re-surface it as a candidate. The only exception is a compound where some constituent kanji are *never* introduced in any lesson (e.g. 週末 where 末 is never taught) — these are legitimate permanent-hybrid candidates and may be introduced when their taught kanji first unlocks, with an entry on the approved partial-kanji list.
- **Scope review gate.** Before dispatching to Agent 2, audit the proposed vocabulary list for cohesion. Ask: do these items naturally belong together in one lesson? If a cluster of time-expression words (e.g. 今朝/今晩/先月) or compound vocab is only partially introduced, either include the full cluster or defer all of it to a later lesson. Never split a natural vocabulary group across lessons unless there is a clear pedagogical reason. Note any deferred items in the Content Brief's Rewrite Notes field.
- **Grammar lesson scoping (GRAMMAR_CONTENT.md required).** For any grammar lesson (G1–G49), Agent 1 must read the relevant entry in `GRAMMAR_CONTENT.md` before building the Content Brief. The "What to teach" and "Recommended sections" fields in that entry define the locked scope. Do **not** infer grammar points from the lesson title or general knowledge — the spec is the only authoritative source. Missing a grammar point from the spec (as happened with でしょう in G9 and てください/なさい in G8) is a scope failure that all four agents will propagate unchecked.
- **Grammar scope lock.** For grammar lessons, the Content Brief's "Grammar points" list is a **locked scope**. Agent 2 may not add, remove, or substitute grammar points. If Agent 2 encounters a problem building content for a listed grammar point (e.g., the available vocabulary cannot support good examples), Agent 2 must flag this in the CB Checklist and return to Agent 1 for a scope adjustment — not silently swap in a different grammar point. Agent 1 documents any scope changes in the "Rewrite notes" field before redispatching.
- **Grammar conjugation form audit.** For any grammar lesson, Agent 1 must enumerate every **new conjugation form** the lesson teaches (e.g. G19 teaches `tari_form` and `nagara_form`; G13 teaches `potential`; G23 teaches `passive`). For each form, Grep `conjugation_rules.json` to verify: (a) the form ID exists as a top-level key, and (b) its `introducedIn` field matches this grammar lesson's ID or its `unlocksAfter` content lesson. If a form entry is missing entirely, it must be added to `conjugation_rules.json` — including the correct godan, ichidan, and irregular rules — before Agent 2 can use that form string in any `terms` array. If `introducedIn` is wrong (e.g. set to a later or earlier lesson), correct it. List the verified form IDs in the Content Brief under "New conjugation forms". Without this step, Agent 2 will use form strings that either don't exist (causing a silent render failure) or have the wrong prerequisite gate (causing content to appear out of scope in all future checks).
- **Grammar connector entry audit.** For any grammar lesson, Agent 1 must enumerate every new **connector word** the lesson introduces (e.g. ために → ため, まえに → 前, あとで → 後, のに, ながら, ～たり). For each connector, Grep `glossary.N4.json`, `glossary.N5.json`, and `shared/particles.json` to verify a tappable `v_*` or `p_*` ID exists. If an entry is missing, add it to the correct file before dispatching to Agent 2 — never defer this to a later pipeline stage. Also determine the correct writing form for each connector noun: check whether its kanji is in the taught-kanji set at `unlocksAfter`; include both the ID and the correct writing form in the Content Brief so Agent 2 knows what to write in `jp` fields.
- **Grammar prerequisite validation.** Before finalizing the Content Brief, Agent 1 must verify that every grammar point listed can be taught given the `unlocksAfter` lesson. Ask: "Has the student been exposed to the concepts needed to understand this grammar point?" If not, defer the point to a later grammar lesson and note the deferral in the brief. Consult the prerequisite table in Agent 4's Grammar Scope Enforcement section.
- **Conjugation form pre-check.** Before dispatching to Agent 2, verify that every form string the lesson will need exists in `conjugation_rules.json`. This includes copula forms (でした, だった, じゃない), plain forms, and any new pattern introduced by the lesson's grammar focus. If a form is absent, create it in `conjugation_rules.json` before Agent 2 begins — just as a missing glossary entry must be created before content can reference it. Never allow Agent 2 to use `form: null` as a substitute for a missing form string.
- **godan_euphonic engine map check.** For every form in `conjugation_rules.json` that uses `"type": "godan_euphonic"` with a `"map"` key (e.g. `"map": "tari_form"`, `"map": "tara_form"`), Grep `app/shared/text-processor.js` for that map name inside `GODAN_MAPS`. If the key is absent, the conjugation silently fails at runtime — godan verbs stay in dictionary form in the chip with no error. Add the missing map entry to `GODAN_MAPS` before dispatching to Agent 2. The map values follow the same euphonic pattern as `ta_form` but with the appropriate suffix (たり/だり for tari_form; たら/だら for tara_form). This check applies to all lessons using tari_form, tara_form, or any future godan_euphonic map.
- **Grammar reinforcement planning.** Before finalizing the Content Brief, Agent 1 must consult the [Grammar Reinforcement Requirements](#grammar-reinforcement-requirements) schedule and identify: (a) which grammar milestones are in their **active reinforcement window** for this lesson, and (b) which milestones are in **sustained use**. List the specific reinforcement targets in the Content Brief. Plan at least 1 warmup item that exercises the most recently unlocked grammar using prior-lesson vocabulary. If the lesson's theme naturally supports certain grammar patterns (e.g. a travel theme supports ～たいです for desires, ～てください for requests), note these opportunities in the brief.
- **Register planning.** Before finalizing the Content Brief, Agent 1 must consult the [Register Requirements](#register-requirements-polite-vs-casual) schedule and determine how many casual conversations the lesson needs. For N5.10+ lessons, plan which conversations will be casual by assigning informal contexts (friends, family, close peers). For lessons before N5.10, confirm register = 100% polite. Include the register plan in the Content Brief.

**Spawning Agents 2, 3, and 4 via the Agent tool:**

Agent 1 spawns each downstream agent as an independent subprocess. Each agent receives only what is explicitly included in its prompt — it cannot read the main conversation history.

**What to include in the Agent 2 prompt:**
- The complete Content Brief
- Paths to any dependency files listed in the brief (reference template, prior lesson files) — Agent 2 must read these itself via its tools
- The instruction: *"You are Agent 2 (Content Builder). Read CLAUDE.md for your full responsibilities. Build the draft JSON according to the Content Brief above, then return the complete draft and your CB Checklist."*
- If this is a revision pass: include the QA Failure Report from Agent 3 and instruct Agent 2 to fix every listed issue

**What to include in the Agent 3 prompt:**
- The complete Content Brief (including the taught-kanji set Agent 1 computed)
- The full draft JSON returned by Agent 2
- The instruction: *"You are Agent 3 (QA Reviewer). Read CLAUDE.md for your full responsibilities. Your first task is the mechanical kanji scope audit described in your Responsibilities section — complete that before any other check. Return a QA-PASS stamp or a QA Failure Report."*

**What to include in the Agent 4 prompt:**
- The complete Content Brief
- The QA-approved draft JSON
- Paths to the 1–2 most recent same-type lesson files for comparison (Agent 4 must read these itself)
- The instruction: *"You are Agent 4 (Consistency Reviewer). Read CLAUDE.md for your full responsibilities. Return either a CR approval or a Consistency Note with a rewrite directive."*

**Handling returns:**
- Agent 2 returns a draft → Agent 1 spawns Agent 3 with it
- Agent 3 returns FAIL → Agent 1 re-spawns Agent 2 with the failure report
- Agent 3 returns ESCALATE (unregistered words) → Agent 1 presents words to user, then re-spawns Agent 2
- Agent 3 returns PASS → Agent 1 spawns Agent 4 with the approved draft
- Agent 4 returns FAIL → Agent 1 updates the Content Brief and re-spawns Agent 2
- Agent 4 returns PASS → Agent 1 writes the file to the repo and updates `manifest.json`

**Content Brief format (internal working document):**

```
CONTENT BRIEF
═════════════
Type:          [lesson | review | compose | story]
Target ID:     [e.g. N5.2, N4.Review.11]
Level:         [N5 | N4]
Lesson scope:  [list of lesson IDs whose vocab is permitted]
New kanji:     [list only if type=lesson — characters to introduce]
Taught kanji:  [full set from manifest.json up to and including this lesson]
Focus/theme:   [e.g. "Directions and position words used in daily navigation"]
Required vocab IDs: [explicit IDs that MUST appear, e.g. compose targets]
Sections to build:  [e.g. warmup, kanjiGrid, vocabList, conversation×2, reading×2, drills×3]
Dependencies:  [list any existing lesson files to read for context]
Reference template: [path to highest-numbered existing file of same type/level — this is the structural standard]
New conjugation forms: [grammar lessons only — list each new form ID; confirm each exists in conjugation_rules.json with correct introducedIn; add missing entries before dispatching]
New connector entries:  [grammar lessons only — list each new connector word; confirm v_*/p_* ID exists in glossary/particles.json; add missing entries before dispatching; note correct kanji/hiragana writing form at this lesson's unlocksAfter tier]
Grammar reinforcement:
  Active window: [milestones in active window — e.g. "Te/ta patterns (N5.5): ≥1 てください, ≥1 ています"]
  Sustained use: [milestones in sustained use — e.g. "Polite verbs (N5.5): all four forms should appear"]
  Warmup plan:   [which grammar pattern(s) to exercise in warmup items]
  Theme opportunities: [grammar patterns that fit the lesson theme naturally]
Register plan:
  Casual conversations: [0 if before N5.10; 1–3 depending on lesson range — see Register Requirements]
  Casual contexts: [e.g. "Conv 3: two friends at a cafe", "Conv 5: siblings at home"]
  Register focus: [which casual patterns to prioritize — e.g. "plain negative, けど connector, だ copula"]
Rewrite notes: [empty on first pass; filled by Agent 4 feedback]
```

---

### AGENT 2 — Content Builder (CB)

**Trigger:** Spawned by Agent 1 via the Agent tool. Receives a Content Brief and file paths. Has no access to Agent 1's conversation history or reasoning — only what was explicitly included in the spawn prompt.

**Responsibilities:**
- **Do not read the glossary in full.** Use targeted Grep queries only (see [Glossary Access Pattern](#glossary-access-pattern)). Reading the full file will exceed the 32k output token limit.
- Read any existing lesson or review JSON files listed in `Dependencies`.
- Write all JSON/MD content strictly according to the schemas defined in [Content Types & Their Rules](#content-types--their-rules).
- Every Japanese surface form that is used in `jp` fields, passages, or conversation lines **must** either be tagged in the `terms` array of that item, or be fully hiragana/katakana with no kanji content (pure kana items for basic particles/common function words may be untagged when they are not in the glossary).
- Do **not** invent vocabulary. Use only IDs that exist in the glossary.
- Do **not** use kanji that have not been introduced by the current lesson or earlier. See [Kanji Prerequisite Rules](#kanji-prerequisite-rules).
- Do **not** use conjugation forms whose `introducedIn` lesson (in `conjugation_rules.json`) is later than the current lesson. For example, `te_form` has `introducedIn: "N5.5"` — a lesson targeting N5.3 must not contain any て-form usage. If a sentence requires a form that is not yet available, restructure the sentence to use only available forms. See [Grammar Usage Prerequisite Rules](#grammar-usage-prerequisite-rules).
- When a verb or adjective appears in a conjugated form, tag it with the correct `form` string. See [Term Tagging Reference](#term-tagging-reference).
- **Use recently unlocked grammar actively.** Consult the Content Brief's "Grammar reinforcement" targets. Meet the minimum usage counts for forms in their active reinforcement window. Vary verb forms across conversations — do not default every verb to ます/ました when negative, te-form, and other unlocked forms would be natural. If a minimum count cannot be met without forcing awkward sentences, flag this in the CB Checklist and explain why.
- Output the draft as a single JSON (or MD + JSON pair for stories) in a clearly labelled code block.
- Attach a **CB Checklist** at the end of the output (see below).
- **Apply the Sentence Token Scan Protocol to every jp/passage field before submitting.** See the protocol definition immediately below. This step is not optional and is not skipped for warmup items, drills, or reading questions.

---

### Sentence Token Scan Protocol

**Definition:** The Sentence Token Scan Protocol (STSP) is a mandatory left-to-right audit of every `jp` or `passage` string. It must be applied to **every** jp field in every section — conversations, readings, warmup items, drills, and reading questions — without exception. This includes **reviews** (conversation lines, reading passages, question answers, scramble segments) and the **conversation and reading sections of Final Interactive Reviews** (game days). It does **not** apply to grammar-specific sections that use `parts[]` with `text`/`role`/`gloss` fields (`grammarRule`, `annotatedExample`, `grammarTable`, `grammarComparison`, `conjugationDrill`, `patternMatch`, `sentenceTransform`, `fillSlot`) — those are covered by the Grammar Accuracy Audit instead. However, **grammar `conversation` and `drills` sections DO require STSP** — they use `jp` + `terms[]` tagging identical to lesson content and must be audited the same way.

**Procedure (apply to each `jp` string individually):**

1. Read the Japanese sentence from left to right, mentally segmenting it into tokens: nouns, verbs, adjectives, adverbs, particles, conjunctions, copulas, sentence-final markers.
2. For each token, ask: **"Is this tagged in the `terms` array?"**
3. If the token is a particle or sentence-final marker, check `shared/particles.json` for its `p_*` ID — even if it "looks obvious." The following must always be tagged when present:
   - Mid-sentence particles: は (`p_wa`), が (`p_ga`/`p_ga_but`), を (`p_wo`), の (`p_no`), に (`p_ni`), で (`p_de`), も (`p_mo`), と (`p_to`/`p_to_quote`), へ (`p_he`), や (`p_ya`), より (`p_yori`), から (`p_kara`/`p_kara_because`), まで (`p_made`), けど (`p_kedo`)
   - Sentence-final particles: か (`p_ka`) — **required even in casual questions where the particle is written as ？ without explicit か**; ね (`p_ne`); よ (`p_yo`)
   - Copulas: です (`g_desu`), だ (`g_da`)
4. If the token is a lexical word (noun, verb, adjective, adverb — including kana-only words like `どこ`, `いつも`, `もう`, `まだ`), verify its ID in the glossary and add it to `terms`. **Search all ID prefixes — `v_*`, `p_*`, and `g_*` — not just `v_*`.** Set-phrases and interjections (e.g. はい, えっ, ただいま) are registered under `p_*` IDs in the glossary even though they are not particles; searching only for `v_*` will miss them. When a kana-only token is not found under `v_*`, re-run the lookup for `p_*` and `g_*` before concluding it is unregistered.
5. If any token has no glossary/particles.json entry, list it in the "Unregistered words" section of the CB Checklist for Agent 3 to escalate.

**Warmup items are NOT exempt.** Warmup `jp` fields require exactly the same completeness as conversation lines. A warmup sentence like 「朝、何を食べますか。」needs `p_wo` and `p_ka` just as much as a conversation line does.

**The STSP applies to rewrites and refreshes too.** When rewriting existing content, every jp/passage field in the original — even those being carried forward unchanged — must be put through the STSP. Treat every original jp field as unaudited; the previous version may predate current tagging standards.

---

**CB Checklist (Agent 2 self-check before passing to Agent 3):**

```
CB CHECKLIST
════════════
[ ] Verified all needed vocab IDs via targeted Grep queries (not full glossary read)
[ ] Every character name in jp fields has the correct char_* ID in its terms array (see Character Name Tagging)
[ ] No char_* ID is used that is not registered in shared/characters.json
[ ] Every kanji used is in the taught-kanji set
[ ] For every word with a `matches` field in the glossary: verified the jp text uses the correct writing form for the current lesson tier — if any kanji in the glossary `surface` is untaught, the hiragana/partial-kanji form from `matches` was used instead (e.g. いっしょに not 一緒に, だいじょうぶ not 大丈夫, until their kanji are taught)
[ ] For every compound vocab entry whose `surface` contains an internal particle or spans multiple morphemes (e.g. `v_atamagaii` surface `"頭がいい"`): verified the jp text writes the compound WITHOUT any spaces between its components — the jp substring must match the `surface` field character-for-character. A readability space inserted anywhere inside the compound (e.g. `頭が いい`) breaks the text-processor substring match silently: no chip appears, no error is thrown. The compound surface is authoritative; the jp text must conform to it, not the other way around. Never split the compound into its constituent terms to work around a spacing mismatch — that changes the semantic unit the student sees (e.g. "head / subject / good" instead of "smart / intelligent").
[ ] Every content word in every jp/passage field has a corresponding terms entry
[ ] Every pure-kana lexical word (interjections, casual words, expressions not in particles.json) has a verified glossary entry — any that do not are listed in the CB Checklist under "Unregistered words" for Agent 3 to escalate. Search **all ID prefixes** (`v_*`, `p_*`, `g_*`) — set-phrases like はい (`p_hai`) are registered under `p_*` in the glossary, not `v_*`; searching only `v_*` will silently miss them
[ ] Question words and kana-only adverbs explicitly checked: for every jp field, scan for どう, どこ, どれ, どちら, いつ, なぜ, いくら, いくつ, いつも, もう, まだ, よく, たいてい, ぜんぜん, and any similar kana-only vocab — these have registered IDs and must appear in terms even though they look like plain kana
[ ] SENTENCE TOKEN SCAN completed for every jp/passage field: scanned left to right, token by token, using the Sentence Token Scan Protocol defined above — particles, sentence-final markers, and lexical words all verified
[ ] Particles tagged in warmup items: warmup jp fields have exactly the same particle completeness as conversations (は, が, を, の, に, で, も, と, etc. are all tagged where present)
[ ] Sentence-final か tagged as p_ka in every question sentence — applies to polite and casual questions equally; a sentence ending with ？ in casual speech still requires p_ka in terms
[ ] Adjacent single-char kana terms ordered correctly: wherever two single-char kana particles/copulas appear consecutively in jp text (e.g. だね, のは, かな, よね), the rightmost one is listed FIRST in the terms array — so it is wrapped in a <span> before the leftmost is processed, allowing the single-char lookahead regex to pass. Example: jp="ことだね" → put p_ne before g_da; jp="借りるのは" → put p_wa before p_no
[ ] For every い-adjective in jp text: verify position — bare string if attributive (precedes a noun); { "id": "...", "form": "polite_adj" } only if predicate (sentence-final before です/でした). Never use polite_adj for an attributive adjective.
[ ] For every な-adjective in jp text: { "form": "attributive_na" } if it precedes a noun (大切な こと); { "form": "polite_adj" } if sentence-final predicate (大切です)
[ ] For every desire expression (〜たい): ALWAYS use plain_desire_tai + g_desu (two chips) — desire_tai is deprecated. plain_desire_tai alone when the sentence is plain/casual (〜たい、〜たいから、〜たいよ)
[ ] For every verb in purpose-construction masu-stem + に (e.g. 買いに, 食べに, 借りに): use { "form": null } — this is the ONLY valid use of form: null on verbs in lesson content
[ ] Every { "form": null } verified as a genuine purpose construction: the verb is followed immediately by に in the jp text. Any form: null not meeting this test is a hard fail
[ ] If a needed form string does not exist in conjugation_rules.json: flag to Agent 1 to create the entry — never substitute form: null
[ ] Every form string used in terms verified to exist in conjugation_rules.json before use
[ ] For every な-adjective glossary entry used: verified the entry has BOTH gtype: "na-adjective" AND verb_class: "na_adj" — either field alone is insufficient for attributive_na to work
[ ] Verbs/adjectives use { "id": "...", "form": "..." } objects, never bare strings
[ ] No invented IDs — every ID was verified against the glossary or particles.json
[ ] Every vocab word used in jp text was Grep-verified to exist in the glossary BEFORE being written into the content — if a word lacks a glossary entry, it must be added (or flagged to Agent 1) before proceeding, never used speculatively
[ ] Conversation/reading terms use v_* vocab entries, NOT k_* kanji entries
[ ] が after a clause-final form (ます/です/plain form) is tagged p_ga_but, not p_ga (see disambiguation rules)
[ ] から after a verb/adjective/です is tagged p_kara_because, not p_kara (see disambiguation rules)
[ ] けど is tagged p_kedo (not untagged)
[ ] Sentence-initial でも is tagged p_demo_but, not p_demo (see disambiguation rules)
[ ] と after a closing 」or after a plain-form clause with 思う/知る is tagged p_to_quote, not p_to (N5.13+)
[ ] VocabList covers every glossary+particles.json entry with lesson_ids = this lesson
[ ] Counter references use { "counter": "...", "n": N } format
[ ] (N4+ lessons) Exactly 3 drill sections present: Drill 1 Kanji Readings (no terms), Drill 2 Vocabulary, Drill 3 Grammar & Forms
[ ] (N4+ lessons) Drill 1 items use `[漢字] の よみかたは？` format with 4 reading choices and NO terms array
[ ] Drill 1 (vocab MCQ) has NO terms array on items
[ ] Drill 2+ fill-in-the-blank / particle / conjugation items DO have terms arrays
[ ] Answer fields in reading questions match the passage text exactly
[ ] JSON is valid (no trailing commas, all brackets closed)
[ ] Warmup section has exactly 4 items
[ ] Warmup items use ONLY vocab from lessons prior to this one (lesson_ids < current lesson)
[ ] Lesson matches the reference template's conversation count (see Reference Template Rule)
[ ] meta.kanji array is present and matches the kanji list in manifest.json
[ ] Every kanji introduced this lesson that functions as a standalone noun has a v_* vocab entry, not only a k_* kanji entry
[ ] Every conjugation form used in jp/passage fields has introducedIn ≤ current lesson (checked against conjugation_rules.json)
[ ] Every structural grammar pattern in jp/passage fields (e.g. ～ている, ～てください, ～たり～たりする) is available at the current lesson tier
[ ] Active-window grammar reinforcement minimums are met (see Grammar Reinforcement Requirements)
[ ] Sustained-use grammar forms are not completely absent — at least 1 instance of each milestone's forms appears
[ ] Verb forms are varied across conversations (not all ます/ました — negatives, te-form, etc. are used where natural)
[ ] At least 1 warmup item exercises the most recently unlocked grammar pattern with prior-lesson vocabulary
[ ] Structural patterns (てください, ています, たいです, ましょう, etc.) appear where the lesson theme naturally supports them
[ ] (N5.10+) Casual conversation count matches the Register Requirements schedule
[ ] (N5.10+) Casual conversations use plain forms only — no ます/です in casual dialogue lines
[ ] (N5.10+) Casual conversation contexts justify informal register (friends, family, close peers)
[ ] (N5.10+) No register mixing within a single conversation — all lines use same register
[ ] (Pre-N5.10) No casual register appears — all conversations are 100% polite
[ ] (Reviews) Scramble items have segments, distractors (3 items), and explanation
[ ] (Reviews) Scramble sentences with floatable time expressions or adverbs include an alts array
[ ] (Reviews) Every review section has an instructions field
[ ] (Reviews) Conversation items include title, context, lines, question, choices, answer, explanation
[ ] (Reviews) Every MCQ and scramble drill item has an explanation field
[ ] (Compose) Every vocabPool ID exists in the glossary or particles.json
[ ] (Compose) Targets use only kanji-containing vocabulary (coverage is kanji-based)
[ ] (Compose) Model sentences use only taught kanji and approved vocabulary
[ ] (Compose) Particles array only includes particles with introducedIn ≤ current lesson
[ ] (Compose) Conjugation examples use vocabulary from the lesson
[ ] (Compose) Conjugations stay in polite/formal register (no plain forms unless lesson teaches casual)
[ ] (Compose) Conjugation irregular forms are correct (e.g. いい→よかったです, not いかったです)
[ ] (Compose) Prompts build one cohesive composition, not disconnected topics
[ ] (Compose) Narrative frame is consistent — either fully habitual (present-tense routine), fully specific-day (past-tense event), or a blend with explicit bridging text in the prompt at the transition point; no silent frame shift between consecutive prompts
[ ] (Compose) No regular prompt uses "close", "wrap up", "conclude", or "finish" wording when challengePrompts is non-empty
[ ] (Compose) Every model sentence uses natural Japanese collocations — every verb+object combination verified as real Japanese usage (e.g. 思い出を作る ✓, 運動を作る ✗)
[ ] (Compose) Challenge prompts are framed as a separate scenario from the regular arc ("during a different run…", "on another occasion…")
[ ] (Compose) Prompt count matches level guidelines (2-3 early N5, scaling to 7-10 late N4)
[ ] (Stories) Every particle with a p_* entry in particles.json with introducedIn ≤ lesson scope is tagged in terms.json
[ ] (Stories) g_desu (です) is tagged in terms.json when the story uses です
[ ] (Stories) terms.json keys match exactly how each word appears in story.md (including kana-only spellings of words with untaught kanji)
[ ] (Stories) No particle or copula occurrence is left untagged / unclickable
[ ] (Grammar) Every grammar-specific section uses the correct field names — annotatedExample uses `examples[]` not `parts[]`; grammarComparison uses `items[]` not `itemA`/`itemB` — verified against the Grammar JSON schema in Content Types
[ ] (Grammar) Every new conjugation form this lesson teaches has a verified entry in conjugation_rules.json — Grep-confirmed the form ID exists as a top-level key, its introducedIn value matches this lesson, and godan/ichidan/irregular rules are defined; if missing, flagged to Agent 1 before any terms array uses that form string
[ ] (Grammar) Every new connector word introduced by this lesson has a tappable glossary or particles.json entry — for each connector (e.g. ために, まえに, あとで, のに), Grep-verified that a v_* or p_* ID exists; if missing, flagged to Agent 1 BEFORE writing conversation content that uses it
[ ] (Grammar) Connector nouns written in correct form for the lesson tier — ため always hiragana (為 never taught); 前/後/事 etc. in hiragana if their kanji is not in the taught set at unlocksAfter, in kanji if it is
[ ] (Grammar) Every `grammarRule.pattern[]` chip uses `label`, `color`, and `text` fields — NOT `role`/`gloss` (those belong to example `parts[]` only). Missing `color` → chip renders grey. Missing `label` → chip shows no text. Verify each chip in every pattern array.
[ ] (Grammar) Every `meta.particles[]` entry is a **character string** (e.g. `"のに"`, `"から"`) — NOT a particle ID (e.g. `"p_noni"`, `"p_kara"`). IDs never match `span.textContent` of Japanese text, so particle highlighting is silently broken when IDs are used.
[ ] (Grammar) Every `sentenceTransform` item has a `choices[]` array with 4 strings (correct answer + 3 plausible distractors). Missing `choices` crashes the renderer and leaves the entire screen blank.
[ ] (Grammar) Conversation `jp` fields are tagged via `terms[]` using the same rules as lesson content (every lexical token, particle, and copula must be tagged). Terms generate tappable `.jp-term` spans; without tags, the text is unclickable (no visual highlight, no modal).
[ ] (Grammar) `meta.grammarForms[]` lists the conjugation form strings this lesson introduces or exercises — used to power the unlock display on lesson completion.
```

---

### AGENT 3 — QA Reviewer (QA)

**Trigger:** Spawned by Agent 1 via the Agent tool. Receives the draft JSON and the Content Brief. Has no access to Agent 2's reasoning or the prior conversation — it approaches the draft cold, with no memory of having written any of it.

**Responsibilities:**
- **FIRST: Mechanical kanji scope audit.** Before any other check, perform this mandatory step:
  1. Read `manifest.json`.
  2. Compute the taught-kanji set: collect the `kanji` arrays from all N5 lessons + all lessons in the current level at or below the target lesson number. Flatten to a single character set.
  3. Extract every CJK character (Unicode range U+4E00–U+9FFF) from every `jp`, `passage`, `q`, `a`, and `answer` field in the draft.
  4. For each extracted character: if it is not in the taught-kanji set, it is an **immediate hard fail**. Record the character, the lesson it is introduced in (search `manifest.json`), the field it appeared in, and the full sentence.
  5. Report all kanji violations in the QA Failure Report before checking anything else.
  This check must use `manifest.json` as the sole source of truth. Do not rely on memory or glossary lookup to determine whether a kanji has been taught.
- Perform a systematic line-by-line audit. Do **not** skim.
- **Apply the Sentence Token Scan Protocol (STSP) to every `jp` or passage field.** Read each sentence left to right, token by token. For every token (noun, verb, adjective, adverb, particle, conjunction, copula, sentence-final particle), verify it is either (a) tagged in `terms` with a matching ID, or (b) a permissible untagged pure-kana function word that has **no glossary entry**. Kana-only connectors and particles (e.g. でも, だから, だって, よ, ね, か) must be verified against `shared/particles.json` for their `introducedIn` lesson — do **not** assume they are permissible just because they are written in kana. The STSP applies equally to warmup items, reading questions, and drills — no section is exempt. During rewrites and refreshes, apply the STSP to every jp field including those carried forward from the original; no field gets a "previously passing" exemption.
- For every `terms` entry: verify the ID exists in the glossary (cross-reference the glossary file). Then verify the **surface form** of that glossary entry matches (or inflects from) the actual token in the `jp` field. A surface mismatch — e.g. tagging `だ` with `g_desu` whose glossary surface is `です` — is a **hard fail** even if the ID exists.
- For every verb/adjective term entry: verify the `form` string is a valid key in `conjugation_rules.json`.
- Verify all kanji in `jp` fields appear in the taught-kanji set (from `manifest.json`).
- **Compound surface spacing check.** For every `terms` entry whose glossary `surface` contains an internal particle or spans multiple morphemes (identifiable by a particle like が/の/を embedded in the middle of the surface string — e.g. `v_atamagaii` surface `"頭がいい"`), verify the jp text contains that surface as a **contiguous substring with no inserted spaces**. A space anywhere inside the compound (e.g. `頭が いい` vs surface `頭がいい`) breaks the text-processor match silently — no chip appears, no error is thrown. This is a **hard fail**: instruct Agent 2 to remove the space from the jp text. Do not accept a split into constituent terms as the fix — that changes the semantic unit.
- **Glossary-surface writing-form check.** For every word used in `jp` text, look up its glossary entry and check whether its `surface` field contains any kanji that are **not** in the taught-kanji set. If so, the word must appear in the hiragana/partial-kanji form from its `matches` field — never in the full-kanji `surface` form. This check catches cases like 一緒に (surface) written in jp text when the glossary's `matches` form is いっしょに and 緒 is not yet taught, or 大丈夫 written when だいじょうぶ is the required form. Grep the glossary for the word's ID, read both `surface` and `matches`, then verify the jp text uses the form consistent with the current taught-kanji set. Any mismatch is a **hard fail**.
- **New glossary entry kanji gate.** For any glossary entry created during this content-creation cycle (i.e. an entry that did not exist before Agent 1 began scoping), verify: (a) every kanji in the `surface` field is in the taught-kanji set at `lesson_ids`; (b) if the surface contains an untaught kanji, the entry must be on the approved partial-kanji list in CLAUDE.md (permanent-hybrid case) — not an ad-hoc hybrid invented to work around a deferred compound. A new entry whose surface contains a kanji not taught until a later lesson, and which is not on the partial-kanji list, is a **hard fail**: flag it to Agent 1 with the lesson where the last required kanji unlocks.
- **Unregistered kana lexical word check.** For every pure-kana token in `jp` text that is a lexical word (not a particle or copula — use judgement: interjections like うん, confirmations like そう, casual words like だよ/だね count as lexical), verify it has an entry in `glossary.N5.json` or `glossary.N4.json`. If it does not, do **not** issue a standard FAIL — instead, produce an **Unregistered Word Report** (see below) and return it to Agent 1. Agent 1 presents the list to the user and asks whether to add each word to the glossary. This is not a content error by Agent 2 — it is a gap between natural conversational Japanese and the current glossary coverage.
- Verify the JSON schema matches the content type schema exactly (no extra/missing required fields).
- Verify answer fields match the correct answer choices.
- Verify drill distractors are plausible (wrong but not absurd; drawn from same lesson vocab where possible).

**QA Decision:**

- **PASS:** Attach a QA-PASS stamp and forward to Agent 4.
- **FAIL:** Produce an annotated failure report (see format below) and return to Agent 2. Agent 2 must fix every listed issue and resubmit; Agent 3 performs a full re-audit.
- **ESCALATE (unregistered words):** If the only issues are unregistered kana lexical words — no structural failures, no untaught kanji, no bad IDs — produce an Unregistered Word Report and return to Agent 1 rather than Agent 2. Agent 1 presents the words to the user for a glossary decision, then re-dispatches to Agent 2 with the result. If there are both structural failures AND unregistered words, report both but send back to Agent 2 for the structural fixes first; unregistered words are escalated in a separate pass once the draft is structurally clean.

**QA Failure Report format:**

```
QA FAILURE REPORT
═════════════════
Draft: [content ID]
Pass number: [1st | 2nd | ...]

ISSUES:
Line/Section | Issue Type          | Detail
─────────────┼─────────────────────┼───────────────────────────────────────
[conv line 3]│ Missing term tag     │ "学校" used but not tagged; expected id: v_gakkou
[drill 2 q1] │ Unknown ID           │ "v_futur" not found in glossary
[reading p2] │ Untaught kanji       │ "駅" not introduced until N5.4; current lesson is N5.3
[drill 3 q2] │ Wrong form           │ 飲みます should be { "id": "v_nomu", "form": "polite_masu" } not bare string
[json]       │ Schema error         │ Missing required field "context" on conversation section

Total issues: N
Status: FAIL — return to Agent 2
```

**Unregistered Word Report format** (used when escalating to Agent 1 for user decision):

```
UNREGISTERED WORD REPORT
════════════════════════
Draft: [content ID]

The following pure-kana lexical words appear in the draft but have no glossary entry.
These are not errors by Agent 2 — they represent natural Japanese that is not yet in the
glossary. Agent 1 must present this list to the user and ask whether to add each word.

Word  | First appears in          | Suggested entry
──────┼───────────────────────────┼────────────────────────────────────────────────────
うん  │ [conv 4 line 2]           │ v_un, surface "うん", gtype "interjection", lesson_ids "N5.10", meaning "yeah / uh-huh (casual affirmative)"
[word]│ [location]                │ [suggested id, surface, gtype, lesson_ids, meaning]

Status: ESCALATE — return to Agent 1 for user decision before re-dispatching to Agent 2
```

**Agent 1 user escalation format** (when presenting an Unregistered Word Report to the user):

```
GLOSSARY GAP FOUND
══════════════════
Agent 2 used the following natural Japanese words that are not yet in the glossary.
Please confirm whether to add them, and whether the suggested lesson_ids is correct.

Word  | Suggested entry                               | Add?
──────┼───────────────────────────────────────────────┼──────
うん  │ v_un / interjection / "yeah, uh-huh" / N5.10 │ [yes/no/modify]

For each "yes": Agent 1 will add the entry to the glossary before Agent 2 finalises the draft.
For each "no": Agent 2 must remove the word from the jp text or replace it with a registered alternative.
```

### Agent 3 — Grammar Accuracy Gate (grammar lessons only)

When the draft has `"type": "grammar"`, Agent 3 must perform an additional **Grammar Accuracy Audit** before issuing a pass. This audit checks linguistic correctness — something the structural checks cannot catch.

**Procedure:**

1. For every `grammarRule` section, read the `explanation` and `notes` fields and verify each claim is linguistically accurate. Apply the **Grammar Known-Pitfalls Checklist** (see below). Any claim that contradicts standard Japanese grammar pedagogy is a **hard blocker** — same severity as an untaught kanji.

2. For every `grammarTable` section, verify that every conjugated form in every cell is correct. Cross-reference against `conjugation_rules.json` where applicable. Pay special attention to irregular forms (する, くる, いい/よい).

3. For every `grammarComparison` section, verify that both items' `points` accurately describe the grammar difference. The most common error is oversimplifying は vs が or に vs で to the point of being misleading.

4. For every example sentence across all grammar-specific sections (`grammarRule`, `annotatedExample`, `grammarTable`, `grammarComparison`), verify the sentence is grammatically correct Japanese — not just structurally valid JSON.

**Grammar Known-Pitfalls Checklist:**

Agent 3 must specifically check for these known error patterns. If any are found, it is an automatic FAIL:

| Pitfall ID | Wrong Claim | Correct Rule |
|---|---|---|
| GP-01 | "い-adjectives do not take です" or "do NOT add です after an い-adjective" | い-adjectives DO take です in polite speech. やさしいです is correct and standard. What is wrong is やさしいだ — い-adjectives do NOT take だ in plain speech. |
| GP-02 | "は marks the subject" | は marks the TOPIC, not the subject. が marks the subject. These are different grammatical concepts. |
| GP-03 | "が is for emphasis" (stated without nuance) | が marks the subject and introduces NEW information. "Emphasis" is a side effect, not the core function. The explanation must mention new-information marking. |
| GP-04 | "に and へ are interchangeable" (stated without qualification) | に and へ overlap for destinations of motion verbs, but に has many other uses (time, existence location, indirect object) that へ cannot cover. へ emphasizes direction/orientation. |
| GP-05 | Passive and potential are "the same form" (without specifying verb type) | They are identical ONLY for ichidan (RU) verbs. Godan (U) verbs have distinct passive (あ-column + れる) and potential (え-column + る) forms. |
| GP-06 | "ない is a verb" or "ない is an auxiliary verb" | ない conjugates as an い-adjective (なかった, なくて, なければ). It is an auxiliary adjective. |
| GP-07 | "でも means 'but'" (stated without distinguishing from けど/が) | でも is a sentence-STARTING conjunction ('but/however'). けど and が are clause-ENDING conjunctions that connect within a sentence. These are structurally different. |
| GP-08 | Conditional forms presented as freely interchangeable | と (automatic/natural result), ば (general/hypothetical), たら (temporal/sequential), なら (contextual/hearsay) each have distinct usage constraints. Never present them as synonyms. |
| GP-09 | "を marks the object" (without mentioning movement-through usage) | を also marks the space traversed with movement verbs: 公園を歩く (walk through the park). This is a distinct usage from direct object marking. For N5 grammar, mentioning both is required. |
| GP-10 | Treating じゃ as "slang" or "incorrect" | じゃ is a standard spoken contraction of では. It is grammatically correct and appropriate in most non-formal-written contexts. |

**Maintaining this checklist:** When a new grammar error is discovered during content review (by any agent or by the user), add it to this table with a new GP-XX ID. This is a living document.

**QA Failure Report — grammar accuracy issues use this format:**

```
Line/Section | Issue Type            | Detail
─────────────┼───────────────────────┼──────────────────────────────────────
[rule sec 2] │ Grammar accuracy (GP-01) │ Note claims い-adj don't take です; must state they DO take です in polite, do NOT take だ in plain
[table sec 3]│ Incorrect conjugation │ Cell shows いかった for past of いい; correct form is よかった
```

---

### AGENT 4 — Consistency Reviewer (CR)

**Trigger:** Spawned by Agent 1 via the Agent tool. Receives the QA-approved draft and the Content Brief. Has no access to Agent 3's reasoning or the prior conversation.

**Responsibilities:**
- **Use the latest content as the reference standard.** Read the highest-numbered existing lesson file of the same content type and level — this represents the current structural standard. Optionally read one additional earlier file for comparison. When conventions differ between older and newer files, the newest file always takes precedence.
- Assess: **Natural language quality** — do conversations sound like real Japanese, not textbook recitations? Are the situations culturally plausible?
- Assess: **Redundancy** — read each scene as a sequence, not sentence by sentence. Flag any cluster of 2+ consecutive sentences that convey essentially the same information through different grammar. This pattern is the primary symptom of forced vocabulary insertion: Agent 2 added sentences not because the story needed them, but to check off a required vocab ID. Each sentence must add new information or advance the scene — restating the same fact in different words is a hard fail regardless of whether each sentence is individually grammatical. Example: "やまかわさんもいます。こちらはやまかわさんです。名前はやまかわです。" — three consecutive sentences that all communicate "this person is Yamakawa." Any one of them is fine; all three together is a redundancy fail.
- Assess: **Skill progression** — does difficulty increase appropriately from the previous lesson? Are new grammar points used naturally rather than force-fed? Are conjugation forms and grammar patterns appropriate for the lesson tier? See [Agent 4 — Grammar Usage Validation](#agent-4--grammar-usage-validation-all-content-types).
- Assess: **Vocabulary density** — are too few or too many new vocab items packed into a single section?
- Assess: **Consistency** — character names, setting details, and vocabulary choices consistent with the rest of the series?
- Assess: **Scenario variety** — does this prompt/story/review cover scenarios not already covered by recent content?

**CR Decision:**

- **PASS:** Confirm approval and return the file to Agent 1 for writing.
- **FAIL:** Produce a Consistency Note and return to Agent 1 with a rewrite directive. Agent 1 updates the Content Brief and redispatches to Agent 2; the full pipeline restarts from Agent 2.

**CR Consistency Note format:**

```
CONSISTENCY NOTE
════════════════
Draft: [content ID]
Pass number: [1st | 2nd | ...]

ISSUES:
Category           | Detail
───────────────────┼───────────────────────────────────────────────────────
Natural language   | Conv line 4: nobody says 「わたしは行きますです」— drop です
Skill progression  | Reading passage introduces conditional ～たら which is N4 grammar
Vocabulary density | Section "vocabList" lists 28 items; cap is ~18 per section
Scenario variety   | Very similar to N5.4 lesson scenario (shopping at a station store)
Consistency        | Teacher named "やまもと先生" in N5.1; called "やまかわ先生" here
Rewrite directive  | [plain English instruction to Agent 1 describing the required change]

Total issues: N
Status: FAIL — return to Agent 1 for rewrite
```
### Agent 4 — Grammar Scope Enforcement (grammar lessons only)

When the draft has `"type": "grammar"`, Agent 4 must perform a **Scope Alignment Check** in addition to its standard consistency review.

**Procedure:**

1. **Brief-to-content alignment.** For every `grammarRule` section in the draft, verify that the grammar point it teaches appears in the Content Brief's "Grammar points" field. If a `grammarRule` teaches something NOT listed in the brief, it is a **hard fail** with a rewrite directive. The Content Builder does not have authority to substitute grammar points — only the Project Manager can change scope.

2. **Prerequisite concept check.** For each grammar point taught, assess whether students at the `unlocksAfter` level have been exposed to the prerequisite concepts. Apply this decision framework:

   | Grammar concept | Prerequisite concepts needed |
   |---|---|
   | Casual copula だ | Understanding of です (polite copula) — OK after N5.1 |
   | なんです / のです (explanatory) | Familiarity with の nominalizer, exposure to casual speech patterns — needs at minimum G1 (copula) + G2 (の particle) complete |
   | て-form usages (ている, てください) | て-form construction — needs G8 or equivalent |
   | Conditional forms (ば, たら, と, なら) | Plain form conjugation — needs G10 |
   | Passive / causative | Plain negative formation (あ-column shift) — needs G10 |
   | Potential form | Verb type identification — needs G6 |

   If a grammar point is taught before its prerequisites are available, flag it as a scope violation.

3. **Density check.** Count the `grammarRule` sections. Grammar lessons should have **2–5 grammarRule sections** depending on complexity. More than 5 indicates the lesson is trying to cover too much — recommend splitting. Fewer than 2 suggests the lesson may be too thin or that teaching content is hiding in non-rule sections where it's less effective.

4. **Section substitution detection.** Compare the draft's section list against the GRAMMAR_CONTENT.md spec for this lesson ID. If a section listed in the spec was replaced with a different section type or a different grammar point, flag it explicitly. Example:

   ```
   SCOPE ALERT: Spec calls for grammarRule on "casual copula だ" (section 4 in spec).
   Draft has grammarRule on "なんです nominalization" instead.
   This is a substitution — the Content Builder replaced a scoped grammar point with an unscoped one.
   → FAIL: Return to Agent 1 to restore original scope or formally revise the brief.
   ```

5. **Cross-lesson overlap check.** Read the two nearest grammar lessons (by ID number) if they exist. Verify that the current lesson does not substantially duplicate a grammar point already taught in an adjacent lesson. Minor overlap for reinforcement is acceptable; a full `grammarRule` section teaching the same pattern as an adjacent lesson is not.

**CR Consistency Note — scope issues use this category:**

```
Category            | Detail
────────────────────┼──────────────────────────────────────────────────────
Scope violation     | grammarRule "rule_nominalization" teaches なんです; not in Content Brief; prerequisite G3 (の) not yet available
Prerequisite gap    | Conditional ～たら requires plain form knowledge (G10); current lesson unlocks after N5.5
Section substitution| Spec section 4 (casual だ) replaced by nominalization rule — unauthorized scope change
Density             | 7 grammarRule sections; recommend splitting into two lessons
```

### Agent 4 — Grammar Usage Validation (all content types)

For **every** draft — not just grammar lessons — Agent 4 must perform a **Grammar Usage Validation** to verify that the grammar patterns used in Japanese sentences are appropriate for the lesson's position in the curriculum. This check complements kanji and vocabulary prerequisite enforcement with an equivalent gate for grammar.

**Why this matters:** Kanji and vocabulary have hard prerequisite checks (Agent 3 catches untaught kanji, fabricated IDs, out-of-scope vocab). But grammar patterns — conjugation forms, structural patterns like ～ている or ～てください, and particles — have historically relied on Agent 4's vague "skill progression" assessment. This section makes that check concrete and systematic.

**Procedure:**

1. **Conjugation form audit.** For every `terms` entry that uses a `form` field, look up that form in `conjugation_rules.json` and check its `introducedIn` value. If the form's `introducedIn` lesson is later than the current lesson, it is an out-of-scope grammar violation. Use this reference table for quick checks:

   | Form | `introducedIn` | Available from |
   |---|---|---|
   | `polite_adj` | N5.1 | N5.1+ |
   | `attributive_na` | N5.11 | N5.11+ |
   | `polite_masu`, `polite_mashita`, `polite_negative`, `polite_past_negative` | N5.5 | N5.5+ |
   | `te_form`, `polite_negative_te` | N5.5 | N5.5+ |
   | `plain_past` | N5.5 | N5.5+ |
   | `desire_tai_negative`, `polite_desire_tai_negative`, `polite_volitional_mashou` | N5.8 | N5.8+ |
   | `plain_volitional`, `plain_form` | G9 | N5.9+ |
   | `plain_negative`, `plain_past_negative` | N5.9 | N5.9+ |
   | `polite_past_adj`, `adverbial`, `desire_tai_past` | N5.10 | N5.10+ |
   | `plain_past_adj`, `plain_desire_tai`, `plain_appearance_sou`, `plain_desire_tai_past` | G9 | N5.9+ |
   | `appearance_sou` | N5.11 | N5.11+ |
   | `potential`, `polite_potential`, `potential_negative`, `plain_potential_negative`, `polite_potential_past`, `plain_potential_past` | N4.3 | N4.3+ |
   | `tari_form`, `nagara_form` | N4.10 | N4.10+ |
   | `sugiru_form`, `polite_sugiru_form`, `sugiru_past`, `polite_sugiru_past` | G25 | N4.34+ |
   | `conditional_ba` | G22 | N4.25+ |
   | `conditional_tara` | N4.25 | N4.25+ |
   | `passive`, `polite_passive`, `polite_passive_past`, `plain_passive_past`, `causative`, `polite_causative`, `polite_causative_past`, `plain_causative_past`, `causative_passive`, `polite_causative_passive` | N4.31 | N4.31+ |

2. **Structural grammar pattern scan.** Beyond tagged conjugation forms, scan the `jp` surface text for structural grammar patterns that imply knowledge of specific forms even when the individual verb tags might look in-scope. Common patterns to flag:

   | Pattern in `jp` text | Requires | Example violation |
   |---|---|---|
   | ～ている / ～ています | `te_form` (N5.5+) | Using ～ています in N5.3 content |
   | ～てください | `te_form` (N5.5+) | Using ～てください in N5.4 content |
   | ～たり～たりする | `tari_form` (N4.10+) | Using ～たりします in N4.8 content |
   | ～ながら | `nagara_form` (N4.10+) | Using ～ながら in N4.5 content |
   | ～たら | `conditional_tara` (N4.25+) | Using ～たら in N4.20 content |
   | ～ば / ～ければ | `conditional_ba` (G22 / N4.25+) | Using ～ば in N4.20 content |
   | ～すぎる | `sugiru_form` (G25 / N4.34+) | Using ～すぎます in N4.3 content |
   | ～られる (passive) | `passive` (N4.31+) | Using ～られます in N4.25 content |
   | ～させる (causative) | `causative` (N4.31+) | Using ～させます in N4.25 content |
   | ～たいです | `plain_desire_tai` + `g_desu` (N5.8+) | Using ～たいです in N5.6 content |
   | ～ましょう | `polite_volitional_mashou` (N5.8+) | Using ～ましょう in N5.6 content |
   | ～ない / ～なかった (plain neg) | `plain_negative` (N5.9+) | Using ～ない in N5.7 content |
   | ～そうです (appearance) | `appearance_sou` (N5.11+) | Using ～そうです in N5.9 content |

3. **Particle scope verification.** For all content types (not just compose), verify that particles used in `jp` text are within scope. Cross-reference each particle against `shared/particles.json`'s `introducedIn` field. This extends Agent 3's tagging check — Agent 3 verifies tagged particles have valid IDs; Agent 4 verifies that the grammar patterns those particles enable are age-appropriate for the lesson.

4. **Severity classification.**
   - **Hard fail:** A conjugation form with `introducedIn` later than the current lesson is used in a tagged `terms` entry. This is a concrete, verifiable violation equivalent to an untaught kanji.
   - **Hard fail:** A structural grammar pattern (from the table above) appears in `jp` text before the form is available.
   - **Soft fail (judgment):** A grammar pattern is technically available (the form's `introducedIn` ≤ current lesson) but has not been practiced or emphasized yet and appears complex for the lesson tier. Flag as a skill-progression concern, not a hard block.

**CR Consistency Note — grammar usage issues use this category:**

```
Category            | Detail
────────────────────┼──────────────────────────────────────────────────────
Grammar usage       | Conv line 3 uses te_form (introducedIn: N5.5) but lesson is N5.3 — out of scope
Grammar usage       | Reading passage contains ～たいです pattern (plain_desire_tai, N5.8+) in N5.6 content
Grammar usage       | jp text uses ～ている progressive but te_form not available until N5.5
Particle scope      | Particle でも (p_demo, introducedIn: N4.14) used in N4.10 conversation — out of scope
```

### Agent 4 — Grammar Reinforcement Audit (all content types)

For **every** draft, Agent 4 must perform a **Grammar Reinforcement Audit** to verify that recently-taught grammar forms are being actively used. This is the complement to the Grammar Usage Validation — that check catches **over-reach** (using forms too early); this check catches **under-use** (not using forms that should be practiced).

**Why this matters:** Without this check, content can pass all other QA gates while using only the most basic grammar (ます, ました, です) even when the student has learned te-form, desire expressions, volitional, negatives, and more. This creates a plateau where students learn rules in grammar lessons but never see them in practice.

**Procedure:**

1. **Identify the reinforcement context.** Read the Content Brief's "Grammar reinforcement" field. Identify which milestones are in the active window and which are in sustained use for this lesson.

2. **Count active-window forms.** For each milestone in the active reinforcement window, count the occurrences of its required patterns across all conversation and reading sections (excluding drills). Compare against the minimum counts in the [Grammar Reinforcement Schedule](#grammar-milestones-and-reinforcement-schedule).

   - **Hard fail:** An active-window minimum count is not met AND there are conversations/readings where the form could have been used naturally. Example: N5.7 lesson has 5 conversations and 2 readings, all verbs are in ます or ました, zero てください or ています — despite te-form being in the active window.
   - **Soft fail:** The count falls short by 1, and the lesson's theme makes it genuinely difficult to use the form naturally. Flag with a specific suggestion for where the form could be inserted.

3. **Check sustained-use forms.** For each milestone in sustained use, verify at least 1 instance of the milestone's forms appears somewhere in the lesson content (conversations + readings). Complete absence is a **soft fail** unless the lesson's theme genuinely has no natural context.

4. **Verb form diversity check.** Count the distribution of verb forms across all conversation and reading sections. If >80% of tagged verb forms are `polite_masu` or `polite_mashita` (excluding the introduction lesson N5.5 itself), flag as a diversity concern. The lesson should use the full range of available forms — negatives, te-form, desire, volitional — not default to affirmative present/past.

5. **Warmup reinforcement check.** Verify that at least 1 warmup item exercises a recently-unlocked grammar pattern (from the most recent active-window milestone) using prior-lesson vocabulary. Warmups that only use noun-です patterns after N5.5 are a missed reinforcement opportunity.

6. **Structural pattern presence.** For lessons after N5.5, verify the following structural patterns appear at least once (where the lesson is past their availability point):

   **Conjugation-based patterns:**
   - N5.6+: Is there a てください somewhere? Is there a て-connector (AてB) somewhere?
   - N5.9+: Is there a ています somewhere? Is there a たいです somewhere? Is there a ましょう somewhere?
   - N5.10+: Is there a ない/なかった somewhere?
   - N4.11+: Is there a たり pattern somewhere?
   - N4.21+: Is there a てもいい or てはいけない somewhere?

   **Non-conjugation patterns (particle-based):**
   - N4.6+: Is there a より comparison or いちばん superlative somewhere?
   - N4.15+: Is there a だけ or しか somewhere?
   - N4.11+: Is there a ので somewhere?

   These are not rigid per-lesson requirements but cumulative expectations. If 3 consecutive lessons all lack てください despite being past N5.5, that is a pattern worth flagging. The same applies to non-conjugation patterns: if 3+ consecutive lessons after N4.5 never use comparison despite the theme supporting it (food, travel, preferences), that is a reinforcement gap.

   **Note on G8/G9 boundary:** てください and て-connector are G8 patterns (reinforce from N5.6+). ています, たいです, and ましょう are G9 patterns (reinforce from N5.9+ only). Do not flag the absence of ています in N5.6–N5.8 content — ている is not formally taught until G9.

**CR Consistency Note — reinforcement issues use this category:**

```
Category              | Detail
──────────────────────┼──────────────────────────────────────────────────────
Grammar reinforcement | Te/ta patterns in active window (N5.6): 0 てください instances across 5 conversations — need ≥1
Grammar reinforcement | Verb form distribution: 89% ます/ました, only 11% other forms — needs more variety
Grammar reinforcement | Sustained use: no polite_negative (ません) instance in entire lesson — add 1 natural negative context
Grammar reinforcement | Warmup uses only noun-です patterns; should exercise te-form with prior vocab
Grammar reinforcement | No ましょう in 3 consecutive lessons (N5.10-N5.12) despite availability since N5.8
Grammar reinforcement | No より/comparison in N4.7-N4.9 despite G15 teaching comparison at N4.5 — themes support preferences
Rewrite directive     | Add a てください request in conv 2 or 3; replace 1 ます sentence in reading with ています progressive
```

---

## The Handoff Protocol

Each handoff **must** include:

1. The current draft (JSON/MD in a code block)
2. The originating Content Brief
3. The previous agent's output document (checklist, QA report, or consistency note)
4. A one-line summary: `Passing to Agent N — [reason]`

Never silently forward content without the accompanying documents. If an agent discovers an issue outside its own scope, it must still forward the document but add a note flagging the out-of-scope issue for the receiving agent to handle.

---

## Content Types & Their Rules

---

### Lesson JSON (`data/N5/lessons/N5.X.json`, `data/N4/lessons/N4.X.json`)

**Top-level required fields:**

```json
{
  "contentVersion": "1.0.0",
  "id": "N5.X",
  "title": "...",
  "meta": {
    "level": "...",
    "lesson_number": N,
    "focus": "...",
    "estimated_minutes": N
  },
  "newKanji": [...],
  "sections": [...]
}
```

**Section types and their required fields:**

| Section type | Required fields |
|---|---|
| `warmup` | `type`, `title`, `instructions`, `items[]` (each: `jp`, `en`, `terms`) |
| `kanjiGrid` | `type`, `title`, `items[]` (each: `kanji`, `on`, `kun`, `meaning`, `terms`) |
| `vocabList` | `type`, `title`, `groups[]` (each: `label`, `items[]` of IDs) |
| `conversation` | `type`, `title`, `context`, `lines[]` (each: `spk`, `jp`, `en`, `terms`) |
| `reading` | `type`, `title`, `passage[]` (each: `jp`, `en`, `terms`), `questions[]` (each: `q`, `a`, `terms`) |
| `drills` | `type`, `title`, `instructions`, `items[]` (each: `kind`, `q`, `choices[]`, `answer`, `terms`\*) |

\*`terms` is **omitted** on Drill 1 (vocabulary MCQ where the tested word is self-evident). All other drill types **must** include `terms`.

**Section order convention:** warmup → kanjiGrid → vocabList → conversation(s) → reading(s) → drills

**Warmup rule.** Warmup sections must contain **exactly 4 items**. All items must use **only** vocabulary and kanji from lessons already completed (lesson_ids strictly less than the current lesson). The purpose of the warmup is to activate prior knowledge, not preview new content. Any item that requires the student to read a new kanji or use a new vocabulary word from the current lesson is invalid.

**Conversation count.** Match the conversation count of the reference template lesson (the highest-numbered existing lesson of the same level and type). If no template exists yet, default to at least 4 conversations. Fewer conversations than the template is a CB failure regardless of how rich the reading sections are.

**Conversation register.** From N5.10 onward, at least 1 conversation per lesson must use casual register (plain forms). See [Register Requirements](#register-requirements-polite-vs-casual) for the full schedule and rules. Casual conversations must have a `context` that justifies informal speech and must not mix registers with polite conversations. Before N5.10, all conversations must be 100% polite.

**Standalone kanji nouns.** When a lesson introduces kanji that are commonly used as standalone nouns (e.g. 水 = water, 木 = tree, 火 = fire, 月 = moon, 日 = sun, 土 = soil, 金 = gold), a dedicated `v_*` vocab entry (type: vocab, gtype: noun) must exist for that standalone use in addition to the `k_*` kanji entry. The `k_*` entry only powers the kanjiGrid display; the `v_*` entry is required for the word to be tappable in conversations and readings.

**meta.kanji required.** The `meta` object must include a `"kanji"` array listing the characters introduced in this lesson, matching the kanji array in `manifest.json` for the same lesson ID.

**VocabList completeness.** The vocabList must cover **every** glossary entry (across `glossary.N5.json`, `glossary.N4.json`, and `shared/particles.json`) whose `lesson_ids` equals the current lesson. This includes nouns, verbs, adjectives, adverbs, pronouns, particles, set phrases, and grammar items — not just the main content words. Agent 1 must enumerate the full target ID list from the glossary files as part of the Content Brief so Agent 2 can verify completeness in the CB Checklist. Agent 3 must confirm every such entry is present in a vocabList group.

**Drill types:** `mcq` and `scramble`. For MCQ: choices array must have exactly 4 options; the `answer` string must exactly match one of the `choices` strings. For scramble: see [Scramble Drill Items](#scramble-drill-items) in the Review section — scramble drills appear in reviews only, not in lessons.

**Three-drill structure (N4 and beyond).** Every lesson at N4 level and above (N4, N3, N2, N1) must contain exactly **3 drill sections** in the following order:

| Drill | Focus | Title convention | Terms on items |
|---|---|---|---|
| Drill 1 | **Kanji Readings** — show the lesson's kanji word in `[brackets]`, ask for the correct reading | `"Drill 1: Kanji Readings"` | **None** — Drill 1 items never have a `terms` array |
| Drill 2 | **Vocabulary** — show a word (with reading) and ask for its meaning, or fill-in-the-blank meaning | `"Drill 2: Vocabulary"` | Required on all items |
| Drill 3 | **Grammar & Forms** — conjugation choice, particle selection, or contextual grammar | `"Drill 3: Grammar & Forms"` | Required on all items |

Drill 1 items use the format: `"[漢字の言葉] の よみかたは？"` with 4 reading choices. Use vocabulary introduced in the current lesson. Distractors should be plausible readings (similar kana patterns or readings from other lesson words — not random kana). Exactly 4 items per Drill 1. This structure mirrors N5.1–N5.9 (which also follow Kanji Readings → Vocabulary → Grammar) and is consistent with the polished N4.33–N4.36 lessons. It applies equally to all future levels.

**N5 drill structure.** N5.1–N5.9 follow the same 3-drill pattern (Kanji Readings → Vocabulary → Sentence Building). N5.10–N5.18 lessons shift to a different 3-section structure driven by the grammar milestone being reinforced — the grammar topic replaces the kanji reading drill as the primary focus. See the reference template for the exact pattern.

---

### Grammar JSON (`data/N5/grammar/G1.json` … `data/N4/grammar/G31.json`)

Grammar lesson files use `"type": "grammar"` at the top level and are rendered by `Grammar.js`. Each section type has a specific field schema — **using the wrong field names causes the section to render empty without throwing an error.** Agent 2 must use the exact field names below.

**Top-level required fields:**

```json
{
  "contentVersion": "1.0.0",
  "id": "G1",
  "type": "grammar",
  "title": "...",
  "meta": {
    "level": "N5",
    "unlocksAfter": "N5.X",
    "focus": "...",
    "estimatedMinutes": N,
    "particles": ["p_foo"],
    "grammarForms": ["te_form"],
    "icon": "🔤"
  },
  "sections": [...]
}
```

**Grammar section types and their required fields:**

| Section type | Required fields | Notes |
|---|---|---|
| `grammarIntro` | `type`, `title`, `icon`, `summary`, `whyItMatters`, `youWillLearn[]` | Always the first section. |
| `grammarRule` | `type`, `id`, `pattern[]`, `meaning`, `explanation`, `notes[]`, `examples[]` | Core teaching unit. Each `example` has `parts[]`, `en`, `breakdown`. Each `part` has `text`, `role`, `gloss`. **Pattern chips** (the colored formula at the top) use a DIFFERENT schema: each chip requires `label` (short uppercase descriptor shown small at top of chip), `color` (must be a valid GRAMMAR_COLORS key — see valid values below), and `text` (larger text shown in chip body). **Never use `role`/`gloss` on pattern chips** — those fields are for example `parts[]` only. Missing `label` → empty chip text. Wrong/missing `color` → grey chip. |
| `grammarTable` | `type`, `title`, `description`, `tableType`, `headers[]`, `rows[]` | Each row has `label`, `cells[]`, `meaning`. Optional `notes[]`. |
| `grammarComparison` | `type`, `title`, `items[]`, optional `tip` | **`items[]` — NOT `itemA`/`itemB`.** Each item: `label`, `color`, `points[]`, optional `example`. |
| `annotatedExample` | `type`, `title`, `examples[]` | **`examples[]` — NOT `sentence`/`parts[]`.** Each example: `parts[]`, `en`, optional `context`, optional `note`. Each `part`: `text`, `role`, `gloss`. |
| `conjugationDrill` | `type`, `title`, `instructions`, `items[]` | Each item: `verb`, `type`, `reading`, `targetForm`, `answer`, `answerReading`, `hint`, `choices[]`. |
| `patternMatch` | `type`, `title`, `instructions`, `items[]` | Each item: `sentence`, `answer` (bool), `explanation`. |
| `sentenceTransform` | `type`, `title`, `instructions`, `items[]` | Each item: `given`, `givenReading`, `targetLabel`, `answer`, `answerReading`, `hint`, **`choices[]`** (required — 4 strings; the renderer crashes and leaves the screen blank if `choices` is missing). |
| `fillSlot` | `type`, `title`, `instructions`, `items[]` | Each item: `before`, `after`, `translation`, `choices[]`, `answer`, `explanation`. **Never use `sentence` with a `___` placeholder** — the renderer requires pre-split `before`/`after` strings. |
| `conversation` | `type`, `title`, `context`, `lines[]` | Same as lesson conversations. Each line: `spk`, `jp`, `en`, `terms[]`. |
| `drills` | `type`, `title`, `instructions`, `items[]` | Same as lesson drills. Every item **must** have `explanation`. |

**Critical schema rules — the two most common silent-failure mistakes:**

**`annotatedExample` — must use `examples[]`:**
```json
{
  "type": "annotatedExample",
  "title": "...",
  "examples": [
    {
      "context": "Optional label shown above the sentence card",
      "parts": [
        { "text": "電車は", "role": "topic", "gloss": "train (topic: は)" },
        { "text": "長かったです。", "role": "predicate", "gloss": "was long (長い → 長かったです)" }
      ],
      "en": "The train was long.",
      "note": "Optional explanation shown below the card."
    }
  ]
}
```

**Never use** `"sentence"`, `"translation"`, or a top-level `"parts"` array — those fields are ignored by the renderer and the section will appear empty.

**`grammarComparison` — must use `items[]`:**
```json
{
  "type": "grammarComparison",
  "title": "...",
  "items": [
    {
      "label": "あげる",
      "color": "verb",
      "points": ["The speaker is the GIVER", "Direction: outward"],
      "example": {
        "parts": [
          { "text": "わたしは", "role": "topic", "gloss": "I (topic: は)" },
          { "text": "あげた。", "role": "predicate", "gloss": "gave (plain past)" }
        ],
        "en": "I gave it."
      }
    },
    {
      "label": "くれる",
      "color": "modifier",
      "points": ["The speaker is the RECEIVER", "Direction: inward"],
      "example": { "parts": [...], "en": "..." }
    }
  ],
  "tip": "Optional tip shown at the bottom of the comparison card."
}
```

**Never use** `"itemA"` / `"itemB"` — those fields are ignored and the section will appear empty.

**Valid `color` values for `grammarComparison` items and `grammarRule` pattern chips:** `"topic"`, `"subject"`, `"object"`, `"predicate"`, `"connector"`, `"modifier"`, `"verb"`, `"adverb"`.

**Valid `role` values for `parts` in annotated examples and comparisons:** `"topic"`, `"subject"`, `"object"`, `"predicate"`, `"connector"`, `"modifier"`, `"adverb"`, `"time"`.

---

### Review JSON (`data/N4/reviews/N4.Review.X.json`)

**Top-level required fields:**

```json
{
  "contentVersion": "1.0.0",
  "id": "N4.Review.X",
  "title": "...",
  "meta": {
    "phase": 4,
    "type": "assessment",
    "focus": "Review of Kanji, Vocabulary, and Grammar from Lessons X–Y.",
    "kanji": ["漢", "字", "..."]
  },
  "sections": [...]
}
```

**meta fields:**

| Field | Required | Description |
|---|---|---|
| `phase` | Yes | Integer (currently always `4`). |
| `type` | Yes | `"assessment"` for numbered reviews. |
| `focus` | Yes | Human-readable description of the review scope. |
| `kanji` | Yes | Array of all kanji characters covered by this review's lesson range. |

**Review section types:**

| Section type | Required fields | Notes |
|---|---|---|
| `conversation` | `type`, `title`, `instructions`, `items[]` | Each item is an independent conversation with a comprehension question (see below). |
| `drills` (scramble) | `type`, `title`, `instructions`, `items[]` | Sentence-ordering drills. See [Scramble Drill Items](#scramble-drill-items). |
| `drills` (mcq) | `type`, `title`, `instructions`, `items[]` | Same as lesson drills. All items must have `terms` except vocab-recognition MCQ (kind=`mcq` where the q is just the kanji and choices are meanings). |
| `reading` | `type`, `title`, `passage[]`, `questions[]` | Same structure as lesson reading. `questions` must have `choices[]` and `explanation` in addition to `q`, `a`, `terms`. |

Every review section **must** include an `instructions` field describing the task for the student.

**Review conversation item structure:**

Unlike lesson conversations, review conversations wrap each conversation inside an `items[]` array. Each item is a self-contained conversation followed by a comprehension question:

```json
{
  "title": "Conversation 1",
  "context": "Description of the scenario",
  "lines": [
    { "spk": "A", "jp": "...", "terms": [...] },
    { "spk": "B", "jp": "...", "terms": [...] }
  ],
  "question": "English comprehension question?",
  "choices": ["...", "...", "...", "..."],
  "answer": "...",
  "explanation": "..."
}
```

Note: review conversation lines do **not** include `en` translations — students must comprehend the Japanese using the tappable term chips only. The `title` field (e.g. "Conversation 1") is required on each item.

**`explanation` field on all drill items.** Every MCQ and scramble item in reviews **must** include an `explanation` field. This is displayed to the student after they answer (whether correct or wrong) and should explain the grammar point, reading, or vocabulary being tested.

**Standard review section pattern (reference template).** The latest reviews follow this 6-section structure:

| Part | Section type | Content |
|---|---|---|
| Part 1 | `conversation` | 3 conversation items with comprehension questions |
| Part 2 | `drills` (scramble) | 5 scramble items with distractors |
| Part 3 | `reading` | 1 reading passage with 3 questions |
| Part 4 | `drills` (mcq) | 6–8 Kanji Reading items |
| Part 5 | `drills` (mcq) | 4 Context & Vocabulary items |
| Part 6 | `drills` (mcq) | 4 Grammar Check items |

When building a new review, use the highest-numbered existing review as the structural template (same as the reference template rule for lessons).

Reviews cover multiple lessons. Vocabulary drawn from any lesson in the reviewed range is permitted.

---

### Large Comprehensive Review (`data/N4/reviews/N4 Half Review.json`, etc.)

Large half-level and full-level reviews are a distinct format from the standard numbered reviews above. They serve as **final closeout assessments** that systematically sweep every lesson in the covered range, one lesson at a time.

**When to use this format:** When creating a review that spans 15 or more lessons and is intended as a terminal assessment for a major phase of the curriculum (e.g. "N4 Half Review" covering N4.1–N4.18, or an "N4 Full Review" covering all 36 N4 lessons).

**Top-level required fields:**

```json
{
  "contentVersion": "1.0.0",
  "id": "N4.Review.Master",
  "title": "N4 Complete Phase 4 Review",
  "meta": {
    "phase": 4,
    "type": "comprehensive_review",
    "focus": "Final check of all N4.1 - N4.18 Kanji, Vocabulary, and Grammar.",
    "kanji": ["帰","作","使",  "...all kanji covered..."]
  },
  "sections": [...]
}
```

Note: `type` is `"comprehensive_review"` (not `"assessment"`). The `meta.kanji` array must list every kanji character introduced across the entire scope.

**Structure — lesson-by-lesson format:**

| Part | Section type | Content |
|---|---|---|
| Conversation group 1 | `conversation` | 5 conversation items, one per lesson (lessons 1–5) |
| Conversation group 2 | `conversation` | 5 conversation items, one per lesson (lessons 6–10) |
| Conversation group 3 | `conversation` | 5 conversation items, one per lesson (lessons 11–15) |
| Conversation group N | `conversation` | 3–5 items for remaining lessons |
| Drill N+1 through Drill N+18 | `drills` | One drill section per lesson, each with 2 MCQ + 1 scramble |

**Conversation grouping:** Group lessons in batches of 5. The final group may have fewer if the total lesson count is not a multiple of 5. Each conversation item must have:
- `title`: "Lesson N4.X: [Theme]"
- `context`: "Focus: [key vocabulary themes]"
- `lines`: 4 lines (2 exchanges, A→B→A→B)
- `question`, `choices` (4 options), `answer`, `explanation`

Conversation lines in this format **do not include `en` translations** — the standard review rule applies.

**Drill section per lesson:** Each lesson gets exactly one `drills` section titled "Drill N: [Theme] (N4.N)". The standard per-lesson drill contains:
- 2 MCQ items (kanji reading drills — show the kanji in brackets, ask for the reading)
- 1 scramble item (simple 3–5 segment sentence using that lesson's vocabulary)

All drill items must have `explanation`. Scramble items must have `distractors` (exactly 3) and no `terms`, `answer`, or `choices`.

**Kanji scope rule:** The comprehensive review covers all kanji from all lessons in scope. When verifying kanji, compute the full taught set = all N5 kanji + all N4 kanji up to the highest lesson in scope.

**meta.kanji completeness:** The `meta.kanji` array must include every character from every lesson in the scope range. Deduplicate characters that appear in multiple lessons (e.g. 去 introduced in both N4.9 and N4.16 — list only once).

**Building a new large review:** When the user asks to create or expand a half-level or full-level review:
1. Agent 1 reads manifest.json to enumerate all lessons in scope and their kanji arrays.
2. Agent 1 computes the union kanji set and identifies the theme/focus of each lesson.
3. Agent 2 writes one conversation item per lesson and one drill section per lesson.
4. Agent 3 performs the standard QA checks plus verifies every lesson is represented.
5. Agent 4 checks naturalness and lesson variety — each conversation must represent its lesson's distinct theme.

---

### Final Interactive Review (`data/N5/reviews/N5.Final.Review.json`, `data/N4/reviews/N4.Final.Review.json`)

Final interactive reviews are game-style terminal assessments covering an entire level. They use `"type": "final_interactive_review"` and must contain **exactly 8 sections in the order listed below**. The reference template is the existing file for the other level (e.g. when building the N5 Final Review, read `N4.Final.Review.json` as the structural template).

**Top-level required fields:**

```json
{
  "contentVersion": "1.0.0",
  "id": "N5.Final.Review",
  "title": "りきぞ N5ファイナル — N5 Final Review",
  "meta": {
    "phase": 5,
    "type": "final_interactive_review",
    "focus": "Fun, game-based final assessment covering all N5 kanji, vocabulary, and grammar from lessons N5.1–N5.18.",
    "kanji": ["...all kanji for the level..."],
    "estimatedMinutes": 45
  },
  "sections": [...]
}
```

**The 8 required sections — all must be present, in this order:**

| # | Section type | Description |
|---|---|---|
| 1 | `speed_round` | 15 fast-fire Q&A items testing kanji readings, vocab meanings, and grammar forms |
| 2 | `conversation` | 4 mini-scenes following Rikizo through a day; each scene has `lines[]` and a comprehension `question` |
| 3 | `grammar_roulette` | 5 grammar categories (e.g. particles, verb forms, adjectives) each with 3 MCQ items |
| 4 | `scramble_relay` | 6 sentence-building legs; each has `segments[]`, `distractors[]` (3 items), and `explanation` |
| 5 | `detective_reading` | A short reading passage split into `clues[]`, followed by 3 comprehension questions |
| 6 | `match_pairs` | 8–16 kanji–meaning flip-card pairs; each pair has `kanji` and `meaning` |
| 7 | `vocab_categories` | 3 rounds × 3 themed groups × 4 vocabulary words; words are kanji-containing N-level vocab |
| 8 | `kanji_bingo` | A kanji pool (≥40 entries) for bingo card generation; each entry has `kanji`, `reading`, `meaning`; `bingoTarget: 3` |

**`vocab_categories` structure:**

```json
{
  "type": "vocab_categories",
  "title": "🧩 Vocab Categories",
  "emoji": "🧩",
  "instructions": "Sort the vocabulary into the correct categories...",
  "rounds": [
    {
      "groups": [
        { "label": "👨‍👩‍👧 Family & People", "words": ["先生", "母", "父", "友"] },
        { "label": "⏰ Time & Calendar",    "words": ["毎日", "今日", "今年", "毎週"] },
        { "label": "🚃 Transport",          "words": ["電車", "駅", "道", "車"] }
      ]
    }
  ]
}
```

Rules: 3 rounds, 3 groups per round, 4 words per group (36 words total). No word may appear in more than one group. All words must use only taught kanji for the level.

**`kanji_bingo` structure:**

```json
{
  "type": "kanji_bingo",
  "title": "🎰 Kanji Bingo — Grand Finale!",
  "emoji": "🎰",
  "instructions": "A 5×5 bingo grid with random kanji...",
  "bingoTarget": 3,
  "kanjiPool": [
    { "kanji": "人", "reading": "ひと", "meaning": "person" }
  ]
}
```

Rules: pool size ≥ 40 entries; spread evenly across all lessons in the level; `reading` is the primary kun-reading (verb forms like "たべる" are acceptable for verb kanji); `bingoTarget: 3`.

**Agent responsibilities for final interactive reviews:**

| Agent | Responsibility |
|---|---|
| **Agent 1** | Read the other level's Final Review as the reference template. Explicitly list all 8 section types in the Content Brief. Note the `vocab_categories` theme plan (which 9 groups, 36 words) and the `kanji_bingo` pool strategy (lessons to draw from). |
| **Agent 2** | Build all 8 sections. Check off each section type in the CB Checklist. Do not omit any section even if the brief seems to allow it. |
| **Agent 3** | Verify all 8 section types are present in the correct order. A missing section is a **hard fail** regardless of how complete the other sections are. Count `vocab_categories` rounds (must be 3), groups per round (must be 3), words per group (must be 4). Count `kanji_bingo` pool size (must be ≥ 40). |
| **Agent 4** | Confirm the 8-section count and order. Verify `vocab_categories` word groupings are thematically coherent. Verify `kanji_bingo` pool covers all lessons in the level, not just the early ones. |

---

### Scramble Drill Items

Scramble drills present the student with word chips that must be tapped in the correct order to build a Japanese sentence. They appear as `kind: "scramble"` items inside a `drills` section.

**Required fields:**

```json
{
  "kind": "scramble",
  "q": "English translation of the target sentence",
  "segments": ["word1", "は", "word2", "を", "word3"],
  "distractors": ["wrong1", "wrong2", "wrong3"],
  "alts": [
    ["word2", "word1", "は", "を", "word3"]
  ],
  "explanation": "Grammar explanation of why this order is correct"
}
```

| Field | Required | Description |
|---|---|---|
| `kind` | Yes | Always `"scramble"`. |
| `q` | Yes | English sentence the student must construct in Japanese. |
| `segments` | Yes | Array of Japanese word/particle segments in the primary correct order. |
| `distractors` | Yes | Array of plausible wrong segments mixed into the chip pool. Should include wrong particles, similar-sounding words, or transitive/intransitive confusions. |
| `alts` | No | Array of arrays — each inner array is an alternative valid ordering of the same `segments`. See [Alternative Word Orders](#alternative-word-orders). |
| `explanation` | Yes | Explains the grammar point, particle usage, or word choice. |

Scramble items do **not** have a `terms` array, `choices`, or `answer` field. The correct answer is the `segments` array joined in order. Distractors must have exactly 3 items.

**HTML in explanations.** Explanation fields on all drill items (MCQ and scramble) and reading/conversation questions may use `<b>` tags for emphasis — typically to highlight readings or key words. Example: `"洗車 (car wash) is read as <b>sensha</b>."`

**Scoring.** Each question (MCQ, scramble, reading, conversation) is worth 1 point toward `maxScore`. Scramble items award a **bonus point** for a correct first attempt (2 points total), making it possible for the overall score to exceed 100%. This rewards students who can construct the sentence correctly without trial and error.

#### Alternative Word Orders

Japanese word order is flexible, especially for time expressions and adverbs. When a scramble sentence contains an element that can naturally occupy more than one position, add an `alts` array so both orderings are accepted as correct.

**When to add alts:**

- **Time expressions** (毎日, 今日, 昨日, 明日, 先週, 来週, 毎朝, 毎晩, いつも, etc.) can typically appear either sentence-initially or after the topic marker (は). If the primary `segments` place the time expression after は, add an alt with it sentence-initial, and vice versa.
- **Frequency adverbs** (よく, 時々, たいてい, etc.) can sometimes float similarly.
- Do **not** add alts for minor stylistic variations that aren't genuinely natural — each alt must be something a native speaker would actually say.

**Example:**

```json
{
  "segments": ["国民", "は", "毎日", "車", "を", "洗います"],
  "alts": [
    ["毎日", "国民", "は", "車", "を", "洗います"]
  ]
}
```

Both「国民は毎日車を洗います」and「毎日国民は車を洗います」are natural and correct.

**Agent 2 responsibility:** When writing scramble items, check whether the sentence contains a floatable element. If so, include the `alts` array. Note this in the CB Checklist.

**Agent 3 responsibility:** For every scramble item, verify that if a time expression or adverb is present, the author has considered whether an alt is needed. Flag missing alts as a QA issue.

---

### Compose JSON (`data/N5/compose/compose.N5.X.json`, `data/N4/compose/compose.N4.X.json`)

Each lesson has its own compose file. The file contains a sequence of English prompts that guide the student through building one cohesive composition.

**Top-level required fields:**

```json
{
  "contentVersion": "1.0.0",
  "id": "compose.N5.X",
  "lesson": "N5.X",
  "level": "N5",
  "title": "English Title",
  "titleJp": "Japanese Title (kana/taught kanji only)",
  "emoji": "...",
  "theme": "English description of the composition topic",
  "prompts": [...],
  "challengePrompts": [],
  "particles": [...],
  "conjugations": [...]
}
```

**Prompt structure (each entry in `prompts[]`):**

```json
{
  "prompt": "English prompt guiding what to write next...",
  "targets": [
    { "id": "GLOSSARY_ID", "count": 1 }
  ],
  "model": "Model Japanese sentence (toggleable by student)",
  "vocabPool": ["GLOSSARY_ID", ...]
}
```

**challengePrompts:** Same structure as `prompts`. Used for N4+ to add optional harder prompts. Empty array `[]` for early N5 lessons.

**particles:** Array of particle/grammar IDs gated to what the student has learned. Only include particles whose `introducedIn` lesson (from `shared/particles.json`) is ≤ the current lesson. Include `g_desu` for the copula. Example: `["p_wa", "p_ga", "p_wo", "p_no", "p_ka", "p_yo", "p_ne", "p_dewa", "p_ja", "g_desu"]`

**conjugations:** Array of rich conjugation pattern objects showing practical patterns the student can use. Each object has:

```json
{
  "pattern": "[noun] + です",
  "meaning": "is / am / are (polite)",
  "examples": ["せんせいです", "ともだちです"]
}
```

Rules:
- **One file per lesson.** Each compose file targets exactly one lesson. The `lesson` field identifies it.
- **Progressive prompts.** Prompts build sequentially — the student writes one continuous composition, advancing through prompts one at a time via a "Next Prompt" button. Start with ~2 prompts for early N5, scaling to ~10 by late N4.
- **Composition continuity.** All prompts in a file should build one coherent text, not disconnected sentences. Each prompt adds to what came before.
- **Narrative frame coherence.** Before writing the first prompt, decide on a single narrative frame: (a) **habitual** — recurring events in present tense ("every morning they run"), (b) **specific-day** — a particular event in past tense ("today they went to the bank"), or (c) **blend** — habitual setup followed by a specific-day arc. If using a blend, define the exact transition point and write explicit bridging language into the prompt text at that transition (e.g. "After today's run…", "That lucky encounter made Rikizo think back…"). Never shift tense or frame silently between consecutive prompts.
- **Challenge prompt boundary.** `challengePrompts` are optional bonus tasks appearing after all regular prompts complete. Never use "close", "wrap up", "conclude", or "finish" wording in any regular prompt when `challengePrompts` is non-empty — those phrases mislead students into thinking the composition is over. The final regular prompt should use forward-looking or neutral language (e.g. "Inspired by today's events…", "Express what…"). Challenge prompts should be explicitly framed as a separate scenario, not a continuation of the regular arc (e.g. "During a different morning run…", "On another occasion…").
- **Per-prompt vocab pools.** Each prompt has its own `vocabPool` — a curated subset of lesson vocabulary relevant to that prompt. Include historical vocab (from prior lessons) that fits the theme, not just new-lesson words.
- **Targets.** Vocabulary the student **must** use to unlock the next prompt. Each `id` must exist in the glossary. `count` is how many times it must appear (usually 1). Target only kanji-containing vocabulary — coverage scoring is kanji-based. The engine automatically adds the invariant kanji root of each verb target to the match set (e.g. `v_hashiru` surface `走る` → also matches `走`), so any conjugated form (`走ります`, `走った`, `走っています`) satisfies the target without a manual `matches` override. Only add an explicit `t.matches` array when the automatic root is insufficient — for example, when a suru compound's activity noun should independently satisfy the target.
- **Model sentences.** Each prompt includes a `model` showing one valid composition. The UI lets students toggle this on/off. Models must use only taught kanji and approved vocabulary. **Verify every verb+object collocation is natural Japanese** — the most common error is pairing an abstract noun with 作る when the combination does not exist in natural speech (e.g. `運動を作る` does not exist; use `運動をする`). Safe 作る pairings: 思い出を作る, 料理を作る, 計画を作る, 作品を作る. When the target verb is 作る, plan a concrete or culturally appropriate object for it at the scoping stage.
- **Conjugation patterns.** Include the full polite paradigm relevant to the lesson's grammar level. Use examples drawn from the lesson's own vocabulary. Include irregular forms (e.g. いい→よかったです). Stay in formal/polite register — omit plain forms (だ, だった) unless the lesson specifically teaches casual speech.
- **Particle gating.** Only include particles the student has been formally introduced to. Check `introducedIn` in `shared/particles.json`.
- **Kanji rule.** All Japanese text in `model`, `titleJp`, and conjugation `examples` must use only taught kanji. Use hiragana for words whose kanji hasn't been introduced yet.
- **Prompt count by level.** The composition system starts with exactly **2 prompts** at N5.1 and N5.2, then scales gradually to **10 prompts** by the final N4 lessons. Use this schedule as the target count when authoring a new compose file:

  | Lesson range | Prompts |
  |---|---|
  | N5.1 – N5.2 | 2 |
  | N5.3 – N5.5 | 3 |
  | N5.6 – N5.9 | 4 |
  | N5.10 – N5.13 | 5 |
  | N5.14 – N5.18 | 6 |
  | N4.1 – N4.9 | 7 |
  | N4.10 – N4.18 | 8 |
  | N4.19 – N4.27 | 9 |
  | N4.28 – N4.36 | 10 |

  **N5.1 and N5.2 must have exactly 2 prompts.** Do not add a third prompt to these lessons under any circumstances.

---

### Story Files (`data/N5/stories/[slug]/story.md` + `terms.json`)

**Lesson scope.** Each story entry in `manifest.json` has an `unlocksAfter` field (e.g. `"unlocksAfter": "N5.8"` or `"unlocksAfter": "N4.19"`). This field defines the story's **lesson scope**: the kanji, vocabulary, conjugation forms, and grammar patterns available to the story are exactly those that are available at that lesson. Before starting work on any story, read its `unlocksAfter` value from `manifest.json` and treat it the same way as the `lesson` field on a regular content file — it gates all kanji, vocab, and grammar decisions. The story picker also orders stories by this value, so it must accurately reflect the story's actual content ceiling.

**story.md:** Standard Markdown. Japanese text uses only taught kanji and vocab. No term tags in the raw markdown — term highlighting is applied by `terms.json`.

**terms.json required fields:**

```json
{
  "contentVersion": "1.0.0",
  "storyFile": "story.md",
  "title": "Japanese title",
  "englishTitle": "English title",
  "terms": {
    "SURFACE_FORM_AS_IT_APPEARS_IN_TEXT": {
      "id": "GLOSSARY_ID",
      "form": "CONJUGATION_FORM_OR_NULL"
    }
  }
}
```

- Keys in `terms` must match exactly how the word appears in the markdown text (including conjugated forms like「行きました」).
- `form` is `null` for dictionary/base forms; uses the same form strings as lesson content for conjugated forms.
- Every meaningful vocabulary word in the story must have an entry. This includes **particles and the copula** (です / g_desu) — they must be tagged so they are tappable, exactly as they are in lessons and reviews.
- **Particle tagging rule for stories.** Every particle that has a `p_*` entry in `shared/particles.json` with `introducedIn` ≤ the story's lesson scope must be tagged. Use the particle character(s) as the key (e.g. `"は"`, `"の"`, `"も"`, `"と"`). The system will highlight every occurrence of that key in the story text.
- **g_desu tagging.** Tag `です` with `{ "id": "g_desu", "form": null }`. Note: when an い-adjective predicative form (e.g. `"うれしいです"`) is already a separate key, the frontend's longest-match logic will take precedence for that occurrence; standalone `です` following a noun or な-adjective will be matched by the `"です"` key.
- Pure hiragana function words that have **no** glossary or particles.json entry (e.g. sentence-internal conjunctions with no `p_*` ID) may be omitted.

---

## Term Tagging Reference

### The fundamental rule

> **Nouns, adverbs, particles, question words** → bare string: `"v_foo"` or `"k_foo"`
>
> **Verbs and い/な adjectives** → object with form: `{ "id": "v_foo", "form": "te_form" }`

Use the form that matches the **surface text** of the specific sentence. If the same verb appears in two sentences in different forms, tag each with its own form.

### Valid form strings (from `conjugation_rules.json`)

| Form string | Meaning |
|---|---|
| `polite_masu` | ～ます |
| `polite_mashita` | ～ました |
| `polite_negative` | ～ません |
| `polite_past_negative` | ～ませんでした |
| `polite_adj` | adjective + です |
| `attributive_na` | na-adjective + な (before a noun, e.g. きれいな花) |
| `polite_past_adj` | adjective past + です (polite: かったです / でした) |
| `plain_past_adj` | adjective past plain (かった / だった — casual speech) |
| `plain_past` | ～た / ～だった |
| `plain_negative` | ～ない |
| `plain_past_negative` | ～なかった |
| `te_form` | ～て / ～で |
| `potential` | ～られる / ～える (plain potential — can do) |
| `polite_potential` | ～られます / ～えます (polite potential — can do) |
| `potential_negative` | ～られません / ～えません (polite potential negative — cannot do) |
| `plain_potential_negative` | ～られない / ～えない (plain potential negative — casual "can't do") |
| `polite_potential_past` | ～られました / ～えました (polite past potential — was able to do) |
| `plain_potential_past` | ～られた / ～えた (plain past potential — casual "could do") |
| `adverbial` | ～く / ～に |
| `plain_desire_tai` | ～たい (plain desire — casual speech and subordinate clauses; for polite ～たいです, use `plain_desire_tai` + `g_desu`) |
| `desire_tai_negative` | ～たくない (plain negative desire — I don't want to) |
| `polite_desire_tai_negative` | ～たくないです (polite negative desire — I don't want to) |
| `desire_tai_past` | ～たかったです (polite past desire — I wanted to) |
| `plain_desire_tai_past` | ～たかった (plain past desire — casual "I wanted to") |
| `appearance_sou` | ～そうです (polite appearance) |
| `plain_appearance_sou` | ～そうだ (plain appearance — casual speech) |
| `polite_volitional_mashou` | ～ましょう |
| `plain_volitional` | ～おう / ～よう (plain "let's" / intention) |
| `plain_form` | verb in dictionary/base form — plain present affirmative predicate and nominalisations (のは/のが) |
| `conditional_ba` | ～ば / ～ければ |
| `tari_form` | ～たり (listing representative actions: ～たり～たりする) |
| `polite_negative_te` | ～ないで (negative te-form: "without doing"; ないでください = "please don't") |
| `sugiru_form` | ～すぎる (plain excessive degree — too much / excessively) |
| `polite_sugiru_form` | ～すぎます (polite excessive degree — too much / excessively) |
| `nagara_form` | ～ながら (while doing — simultaneous actions) |
| `conditional_tara` | ～たら / ～だったら (if / when — completed-action conditional) |
| `passive` | ～られる / ～れる (plain passive — being acted upon) |
| `polite_passive` | ～られます / ～れます (polite passive) |
| `polite_passive_past` | ～られました / ～れました (polite past passive) |
| `plain_passive_past` | ～られた / ～れた (plain past passive — for stories/casual) |
| `causative` | ～させる / ～せる (plain causative — making/letting someone do) |
| `polite_causative` | ～させます / ～せます (polite causative) |
| `polite_causative_past` | ～させました / ～せました (polite past causative) |
| `plain_causative_past` | ～させた / ～せた (plain past causative — for stories/casual) |
| `causative_passive` | ～させられる / ～せられる (plain causative-passive — "being made to do") |
| `polite_causative_passive` | ～させられます / ～せられます (polite causative-passive — "being made to do") |
| `polite_potential_negative` | ～られません / ～えません (polite potential negative — properly-named alias for `potential_negative`) |
| `sugiru_past` | ～すぎた (plain past excessive — "was too much") |
| `polite_sugiru_past` | ～すぎました (polite past excessive — "was too much") |

**Unlock schedule.** Each form is available from the grammar lesson that formally teaches it. The `introducedIn` field in `conjugation_rules.json` records this, using grammar lesson IDs (e.g. `"G6"`) or content lesson IDs (e.g. `"N5.1"`). All forms have this field. Similarly, particles in `shared/particles.json` carry an `introducedIn` field using lesson or grammar IDs.

**Note on `potential_negative` naming.** Despite the name, `potential_negative` produces the **polite** negative potential form (～られません / ～えません). Use `plain_potential_negative` for the plain/casual form (～られない / ～えない). This asymmetry is a legacy naming issue — do not rename to avoid breaking existing content.

**Godan euphonic note.** `tari_form` and `conditional_tara` use `godan_euphonic` map types (`"map": "tari_form"` and `"map": "tara_form"`) that parallel `ta_form` but produce たり/だり and たら/だら endings respectively. Both maps are defined in `GODAN_MAPS` in `app/shared/text-processor.js`. All ichidan, irregular, and adjective rules are fully defined in data. If a future form adds a new `godan_euphonic` map name, that name must be added to `GODAN_MAPS` — see the Agent 1 godan_euphonic engine map check above.

### い-adjective form selection — attributive vs predicate

い-adjectives have two distinct syntactic positions that require different tagging:

| Position | Example | Form | Tag |
|---|---|---|---|
| **Attributive** — modifies a noun (〜い + noun) | 長い 一日、大きい 魚、小さい 声 | dictionary form | bare string: `"v_nagai"` |
| **Predicate** — sentence-final before です/でした | 一日が 長いです、魚が 大きいです | adjective + です | `{ "id": "v_nagai", "form": "polite_adj" }` |

**The critical distinction:** `polite_adj` means the adjective IS the predicate of a sentence ending `〜いです`. It does **not** mean "used politely." An い-adjective that precedes a noun is in attributive position and takes a **bare string** regardless of the surrounding sentence's register.

**Common error:** Seeing 「長い 一日でした」and tagging `長い` as `polite_adj` because the sentence is polite. Wrong — `長い` here modifies 一日 (attributive), so it is a bare string. The copula でした carries the polite register, not the adjective.

**Quick test:** "Is this adjective the main predicate before a です/でした?" → `polite_adj`. "Does it appear before a noun?" → bare string.

な-adjectives follow the same pattern with a dedicated form string:
- **Attributive** (before a noun): `{ "id": "v_taisetsu", "form": "attributive_na" }` — e.g. 大切な こと、きれいな 花
- **Predicate** (sentence-final): `{ "id": "v_taisetsu", "form": "polite_adj" }` — e.g. 大切です、きれいです

### Purpose construction (masu-stem + に)

The masu-stem + に construction expresses purpose ("in order to ~"). Examples: 買いに、食べに、借りに、送りに. There is **no form string** for this construction in `conjugation_rules.json` — it is a grammatical construction, not a conjugated form. Tag purpose verbs with `form: null`:

```json
{ "id": "v_kau", "form": null }
```

Do not use `polite_masu` (which implies the verb is the sentence predicate in ます form) or `te_form` (which implies a て-connector or request). The `form: null` tag makes the verb chip tappable with its dictionary-form gloss, which is correct for this construction.

**`form: null` is only valid for purpose construction and story `terms.json` keys.** For all other verbs, a form string is required. If a plain dictionary-form verb appears as a predicate or in a nominalisation (のは/のが), use `plain_form`. If the required form string does not exist in `conjugation_rules.json`, flag it to Agent 1 to create the entry — never fall back to `form: null` as a substitute.

### desire_tai — deprecated; always use plain_desire_tai + g_desu

**`desire_tai` is deprecated.** Do not use it. It was designed with `たいです` as the chip suffix, making it a single monolithic chip — the `です` is not separately tappable. This conflicts with the architecture principle that `g_desu` should always be independently tappable.

**Always use `plain_desire_tai` + `g_desu` for polite 〜たいです sentences:**

```json
{ "jp": "日本に 行きたいです。", "terms": [
  "v_nihon",
  "p_ni",
  { "id": "v_iku", "form": "plain_desire_tai" },
  "g_desu"
]}
```

The `plain_desire_tai` chip surface covers `行きたい`; the `g_desu` chip separately covers `です`. Both are independently tappable.

| Sentence ending | Form | Chip pattern |
|---|---|---|
| 〜たいです (polite) | `plain_desire_tai` + `g_desu` | two tappable chips |
| 〜たい (plain/casual, subordinate clause) | `plain_desire_tai` alone | one chip |
| 〜たいですか (polite question) | `plain_desire_tai` + `g_desu` + `p_ka` | three chips |

The same two-chip principle applies to other `たい` family forms in polite speech. `desire_tai_negative` (〜たくない) and `desire_tai_past` (〜たかった) are **plain** forms — they do not contain です. For polite sentences, pair them with `g_desu`: `desire_tai_negative` + `g_desu` for 〜たくないです, `desire_tai_past` + `g_desu` for 〜たかったです. In casual speech, they stand alone without `g_desu`. Note: `polite_desire_tai_negative` (〜たくないです) exists as a convenience form that bundles です, but `desire_tai_negative` + `g_desu` is preferred for consistency with the two-chip pattern.

### 何 (nani/nan) pronunciation tagging

何 has two distinct pronunciations that require different vocab IDs:

| Context | Pronunciation | Tag | Examples |
|---|---|---|---|
| Before を or が | なに | `v_nani` | 何を食べますか、何がいい |
| Standalone / isolation | なに | `v_nani` | 何？ |
| Before です | なん | `v_nan` | 何ですか |
| Before の | なん | `v_nan` | 何の本 |
| Before counters | なん | `v_nan` | 何人、何時 (but use compound IDs: `v_nannin`, `v_nanji`) |
| Before d/n/t sounds | なん | `v_nan` | 何で (by what means) |
| 何か (something) | なに | `v_nani` + `p_ka` | 何か食べませんか |

**Never use `k_nani`** in conversation, reading, or drill `terms` arrays. The `k_nani` entry is only for the kanjiGrid display. Using it makes 何 non-tappable.

**Compound words** like 何人 (`v_nannin`), 何時 (`v_nanji`), 何曜日 (`v_nanyoubi`), 何回 (`v_nankai`), 何度 (`v_nando`) have their own dedicated IDs — use those instead of `v_nan` + a separate counter/noun tag.

### 後 (ushiro/ato) orthographic disambiguation

後 has two **completely distinct words** (not pronunciation variants of the same word) that happen to share the same kanji:

| Written form | Reading | Meaning | Tag | Notes |
|---|---|---|---|---|
| 後ろ (with ろ) | うしろ | behind / in back of | `v_ushiro` | Spatial position word — always written with ろ appended |
| 後 (standalone) | あと | after / later | `v_ato` | Temporal word — standalone 後 with no kana suffix |

**Unlike 何/なに/なん, the written form alone disambiguates — no phonological context rules needed:**

- Token is `後ろ` → always `v_ushiro`
- Token is `後` (standalone, not followed by ろ) → always `v_ato`

**Never use `k_ushiro`** in conversation, reading, or drill `terms` arrays. It is only for the kanjiGrid display.

**Common temporal usages** to watch for: 後で (later/afterwards — tag `v_ato` + `p_de`), ～の後で (after ~), 三時間後 (three hours later — compounds have their own IDs when introduced).

**Compounds** that use the こう/ご on-reading (e.g. 午後, 後半) have their own dedicated vocab IDs and are not tagged as `v_ato`.

### が (ga) — subject marker vs clause connector disambiguation

が has two **completely distinct grammatical roles** that share the same surface form:

| Context | Role | Tag | Examples |
|---|---|---|---|
| After a noun/pronoun (marks subject) | Subject marker | `p_ga` | カレー**が**おいしい、お金**が**ない |
| After a clause-final verb/adjective/です (connects contrasting clauses) | Conjunction "but" | `p_ga_but` | 行きたいです**が**、お金がありません |

**Disambiguation rule — position determines role:**

- **が immediately after a noun/pronoun** → `p_ga` (subject marker)
- **が after a clause-ending form (ます/ました/ません/です/plain form)** → `p_ga_but` (conjunction "but")

**Both can appear in the same sentence:** 「行きたいですが、お金がありません。」 — first が = `p_ga_but` (after ですが = "but"), second が = `p_ga` (after お金 = subject marker). Tagging both as `p_ga` would show "subject marker" when the student taps the conjunctive が, which is actively misleading.

`p_ga_but` is available from G10. Before G10, all が in content should be `p_ga` (subject marker) — if が appears as "but" before G10, it is an out-of-scope grammar violation.

### から (kara) — "from" vs "because" disambiguation

から has two **distinct grammatical roles**:

| Context | Role | Tag | Examples |
|---|---|---|---|
| After a noun (starting point) | "From" | `p_kara` | 東京**から**、月曜日**から** |
| After a clause-final verb/adjective/です (gives reason) | "Because" | `p_kara_because` | おいしい**から**食べます、高いです**から**買いません |

**Disambiguation rule — what precedes から determines role:**

- **から after a noun** (place, time, person) → `p_kara` ("from")
- **から after a verb/adjective/です** (clause ending) → `p_kara_because` ("because")

`p_kara_because` is available from G10. Before G10, all から should be `p_kara` ("from"). If から appears as "because" before G10, it is an out-of-scope grammar violation.

**Note:** `p_kara` ("from") was introduced in G4/N5.2. The GRAMMAR_CONTENT.md spec for G10 explicitly states: "Note: から was taught in G4 as a starting-point particle ('from'). This is a different role — teach the distinction explicitly."

### けど (kedo) — casual "but"

けど is a casual clause-linking conjunction ("but") introduced in G10. It has no other grammatical role, so no disambiguation is needed. Tag all instances as `p_kedo`.

けれど is a slightly more formal variant of けど. Both are tagged as `p_kedo`.

### でも (demo) — "even/any~" vs sentence-initial "but"

でも has two distinct roles depending on position:

| Context | Role | Tag | Available from |
|---|---|---|---|
| After a noun ("even X") or in compounds (何でも, いつでも) | Inclusive particle "even / any~" | `p_demo` | N4.14 |
| At the start of a sentence ("But..." / "However...") | Conjunction "but" | `p_demo_but` | G19 |

**Disambiguation rule — position determines role:**

- **でも after a noun** → `p_demo` (子どもでもわかる = "even a child understands")
- **でも at the start of a sentence/clause** → `p_demo_but` (でも、行きます = "But I'll go")

### と (to) — connective vs quotation disambiguation

と has two **completely distinct grammatical roles** that share the same surface form:

| Context | Role | Tag | Available from |
|---|---|---|---|
| Between nouns (A and B) or with action verbs (do X with Y) | Connective "and / with" | `p_to` | N5.2 |
| After quoted speech or thought content (「...」と) | Quotation marker | `p_to_quote` | N5.13 |
| After a plain-form verb/adjective expressing automatic result (AとB) | Conditional "if/when → natural result" | `p_to_conditional` | G22 (N4.25+) |

**Disambiguation rule — what precedes と determines role:**

- **と between/after nouns** → `p_to` (レンとミキ = "Ren and Miki")
- **と after a closing 」quotation mark** → `p_to_quote` (「おいしい」と言いました = said "it's delicious")
- **と after a plain-form clause with 思う/知る** → `p_to_quote` (いいと思います = "I think it's good")
- **と after a plain-form clause expressing automatic/natural result** → `p_to_conditional` (ボタンを押すと開く = "push the button and it opens") — **hard blocker before G22**

Before N5.13, と appears only as `p_to`. From N5.13, `p_to` and `p_to_quote` are both in scope. `p_to_conditional` is not available until G22 (N4.25+) — any sentence using the AとB natural-result pattern (including wishful expressions like あるといいね) before G22 is an out-of-scope grammar violation and must be rewritten. Tagging quotation と as `p_to` displays "and / with" when the student taps it, which is actively misleading.

### Counter references

When a counter expression appears in a `terms` array:

```json
{ "counter": "nin", "n": 4 }
```

Valid counter keys: `ji`, `fun`, `hon`, `mai`, `ko`, `hiki`, `hai`, `satsu`, `nin`, `dai`, `kai`, `sai`, `nen`, `kagetsu`, `shu`, `tsu`, `gatsu`

**Always use the counter engine.** All number + counter expressions in `terms` arrays must use the `{ "counter": ..., "n": N }` object format — never a hardcoded compound vocab ID like `v_yonin` or `v_sannin`. The counter engine handles reading generation, irregular readings (e.g. 四人 → よにん), and display formatting automatically. Hardcoded compound counter IDs are legacy entries that should be scrubbed from the glossary when encountered.

**Question-word counters** (何時, 何人, 何曜日, etc.) are the one exception — these use their dedicated compound ID (`v_nanji`, `v_nannin`, `v_nanyoubi`) because they are question words, not numeric counter expressions.

### Example — correct tagging

```json
{
  "jp": "母は毎日学校に行って、生徒を教えています。",
  "en": "My mother goes to school every day and teaches students.",
  "terms": [
    "k_haha",
    "v_mainichi",
    "v_gakkou",
    { "id": "v_iku", "form": "te_form" },
    "v_seito",
    { "id": "v_oshieru", "form": "te_form" },
    { "id": "v_iru", "form": "polite_masu" }
  ]
}
```

Note: every kanji-containing word is tagged. Particles (は, に, を) are not tagged. The verb いる that forms ～ています is also tagged even though it is a supporting verb.

---

## Character Name Tagging

### Overview

Character names (proper nouns for recurring people in the story world) receive special visual treatment in the app: they render in **sakura pink** and, when tapped, show a **character card popup** with a chibi portrait, the name in Japanese, and its hiragana reading. This is distinct from vocabulary terms (blue underline + vocab modal) and requires its own tagging system.

### The registry: `shared/characters.json`

All character entries live in `shared/characters.json`. This file is loaded by every module (Lesson.js, Game.js, Story.js) and merged into the shared termMap at startup. To add a new character, add an entry here — no other infrastructure changes are needed.

**Entry format:**

```json
{
  "id": "char_rikizo",
  "type": "character",
  "surface": "りきぞ",
  "reading": "りきぞ",
  "meaning": "Rikizo",
  "description": "The protagonist — a cheerful, curious learner navigating everyday life in Japan.",
  "portrait": "assets/characters/rikizo/rikizo_head.png",
  "matches": ["りきぞう"]
}
```

| Field | Required | Description |
|---|---|---|
| `id` | Yes | Always prefixed `char_`. Convention: `char_` + romanized name (lowercase, no spaces). |
| `type` | Yes | Always `"character"`. This is what triggers the pink highlight and portrait popup. |
| `surface` | Yes | The primary hiragana/katakana form used in most content. |
| `reading` | Yes | Hiragana reading — shown under the portrait even if already hiragana. |
| `meaning` | Yes | Romanized name (for display). |
| `description` | Yes | One-sentence description of the character's role. Shown in the popup. |
| `portrait` | Yes | Path to the chibi PNG asset (relative to repo root). If no portrait exists yet, use `""` — the popup will still show name + reading. |
| `matches` | No | Alternate surface spellings (e.g. a longer form, katakana variant). The text processor matches these alongside `surface`. |

**`portrait` is required in the entry even when no asset exists yet.** Use `""` as a placeholder — the popup gracefully omits the image. When the asset is ready, update the path.

### ID convention

This table is the authoritative list of every registered character. It must stay in sync with `shared/characters.json`. **Never use a `char_*` ID that does not appear in both this table and the JSON file.**

| Character | ID | Surface | Matches |
|---|---|---|---|
| Rikizo | `char_rikizo` | `りきぞ` | `["りきぞう"]` |
| Yamakawa | `char_yamakawa` | `やまかわ` | `[]` |
| Suzuki-sensei | `char_suzuki` | `すずき` | `["すずきせんせい"]` |
| Yamamoto-sensei | `char_yamamoto` | `やまもと` | `["やまもとせんせい"]` |
| Ken | `char_ken` | `けん` | `["ケン"]` |
| Yuki | `char_yuki` | `ゆき` | `[]` |
| Lee | `char_lee` | `リー` | `["リーさん"]` |
| Taro | `char_taro` | `たろう` | `[]` |
| Sakura | `char_sakura` | `さくら` | `[]` |
| Miki | `char_miki` | `ミキ` | `[]` |
| Nana | `char_nana` | `ナナ` | `[]` |
| Ren | `char_ren` | `レン` | `[]` |
| Joel | `char_joel` | `ジョエル` | `["ジョエルせんせい", "ジョエル先生"]` |
| Conor | `char_conor` | `コナー` | `["コナーさん"]` |
| Pochi | `char_pochi` | `ポチ` | `[]` |

### Adding a new character — required steps

When a new recurring character is introduced in a lesson, story, or grammar file, the following steps are **all mandatory** before Agent 2 writes any content that references the character. Skipping any step means the character's name will silently render as plain text with no pink highlight or popup.

**Step 1 — Add to `shared/characters.json`**

Append a new entry to the `"characters"` array:

```json
{
  "id": "char_newname",
  "type": "character",
  "surface": "にゅーねーむ",
  "reading": "にゅーねーむ",
  "meaning": "New Name",
  "description": "One-sentence description of the character's role in the story world.",
  "portrait": "",
  "matches": ["にゅーねーむさん"]
}
```

Rules for each field:
- `id`: Always `char_` + romanized lowercase name. No spaces or special characters.
- `surface`: The primary hiragana/katakana form as it will appear in `jp` fields. This is what the text processor matches.
- `reading`: The hiragana reading, shown under the portrait in the popup. If `surface` is already hiragana, `reading` equals `surface`.
- `meaning`: The romanized display name — shown in the popup header.
- `description`: One sentence. Describes who this person is in Rikizo's world.
- `portrait`: Set to `""` if no sprite asset exists yet. The popup renders gracefully without an image.
- `matches`: Any alternate spellings that appear in content — e.g. the name followed by さん, or a katakana variant. The text processor checks these alongside `surface`. **Omit name + title combos that use kanji** (e.g. `"先生"`) unless that kanji has been taught — the text processor is surface-literal.

**Step 2 — Add to the ID convention table in this file**

Add a row to the table above. If this step is skipped, future agents will see the table is out of sync with `shared/characters.json` and may treat the ID as unregistered.

**Step 3 — Tag the name in all lesson content**

In every `jp` field that contains the new character's name, add the `char_*` ID to the `terms` array. See [Tagging in lesson/review/grammar/game content](#tagging-in-lessonreviewgrammargame-content) below.

**Step 4 (stories only) — Add a surface key to `terms.json`**

Add the name as a key in the story's `terms.json`, pointing to `{ "id": "char_newname", "form": null }`. If the story uses multiple spellings, add one key per spelling.

### Tagging in lesson/review/grammar/game content

In lesson JSON files, whenever a `jp` field contains a character's name, add the character's `char_*` ID to the `terms` array of that item. Place it roughly where the name appears in the sentence (position ordering helps readability of the terms array, though the text processor matches by surface form).

```json
{
  "jp": "おはよう、りきぞさん。",
  "en": "Good morning, Rikizo!",
  "terms": ["p_ohayou_casual", "char_rikizo", "v_san"]
}
```

**When a name is followed by さん:** Tag the name and さん separately. `char_rikizo` covers `りきぞ` and `v_san` covers `さん` — the text processor matches longest-first, so りきぞ is highlighted in pink, then さん picks up the suffix.

**Warmup items:** Tag character names the same way — they are conversational context, not new vocabulary.

**Drill `q` fields:** Do **not** add character terms to drill MCQ `q` fields or `choices` arrays. Drill question text is not processed through the standard term-span system.

**Drill `scramble` items:** Do tag character names that appear in scramble `segments` — students need to recognise the name chip.

### Tagging in story content

Stories use a different system. The `terms.json` file maps surface strings (exactly as they appear in the markdown) to `{ "id": "...", "form": null }` pairs. Add the character's name as a key:

```json
{
  "terms": {
    "りきぞ": { "id": "char_rikizo", "form": null },
    "は": { "id": "p_wa", "form": null },
    ...
  }
}
```

The story processor performs longest-match, so `"りきぞ"` as a key will highlight every occurrence of `りきぞ` in the story markdown — including inside phrases like `りきぞのカレー`.

**If the story uses an alternate spelling** (e.g. `りきぞう`), add a second key for that spelling pointing to the same ID.

### What character tags are NOT

- Character terms are **not** vocabulary — they are **not** added to `vocabList` sections.
- Character terms are **not** added to the practice queue (no flagging behaviour).
- Character terms are **not** listed in `glossary.N5.json` or `glossary.N4.json` — the registry is `shared/characters.json` only.
- The `char_*` entries do **not** have kanji prerequisite rules — names are always written the same way regardless of which kanji have been taught.

### Agent responsibilities

| Agent | Responsibility |
|---|---|
| **Agent 1** | When scoping a lesson, identify which recurring characters appear in the planned conversations and readings. List their `char_*` IDs in the Content Brief so Agent 2 knows to include them in terms arrays. |
| **Agent 2** | Add the appropriate `char_*` ID to every `terms` array whose `jp` field contains a character name. For stories, add the surface key to `terms.json`. Check the CB Checklist item for character tagging. |
| **Agent 3** | For every `jp` field containing a name from the character registry, verify the correct `char_*` ID is present in `terms`. A missing character tag is flagged the same as a missing vocabulary term — the name is non-tappable without it. |
| **Agent 4** | Verify that character names used in conversations are consistent with the established roster (e.g. the teacher is not called やまかわ in one lesson and やまもと in another within the same narrative arc). Flag name inconsistencies under the "Consistency" category. |

### CB Checklist additions (character-specific)

```
[ ] Every jp field containing a character name has the correct char_* ID in its terms array
[ ] No char_* ID is used that is not registered in shared/characters.json and the ID table above
[ ] Character names are NOT added to vocabList sections
[ ] Character names are NOT added to drill MCQ q fields or choices arrays
[ ] Story terms.json includes a surface key for every character name that appears in story.md
[ ] Character name consistency checked — same character referred to by the same name throughout
```

### Common failures

| Failure | Description |
|---|---|
| Untagged character name | `りきぞ` appears in a `jp` field but `char_rikizo` is missing from `terms`. The name renders as plain text with no pink highlight or popup. |
| Wrong ID type | Using `v_san` or a bare string `"りきぞ"` instead of `char_rikizo`. The ID must match the `shared/characters.json` registry. |
| Missing story surface key | `りきぞ` appears throughout the story markdown but no `"りきぞ"` key exists in `terms.json`. Every occurrence is dead text. |
| Invented `char_*` ID | Agent 2 writes `char_yamakawa` in a terms array but the character is not yet registered in `shared/characters.json` and the ID table. The term modal will silently fail to open. |
| Character in vocabList | Agent 2 adds `char_rikizo` to a vocabList group. Characters are not study vocabulary — they should never appear in vocabList sections. |

---

## Kanji Prerequisite Rules

### Source of truth: `manifest.json`

Each lesson entry in `manifest.json` has a `kanji` array listing characters introduced in that lesson:

```json
{ "id": "N5.4", "title": "Places & Transport", "kanji": ["行","来","店","駅","山","川","家","道","車"] }
```

### How to compute the taught-kanji set

1. Read `manifest.json`.
2. Collect the `kanji` arrays from all lesson entries at or before the current lesson number, within the same level.
3. Flatten to a single set.
4. For multi-level content (N4 lessons): also include all N5 kanji.

### Enforcement

- Any kanji character that appears in a `jp` field and is **not** in the taught-kanji set is a **hard blocker**. Agent 2 must not use it. Agent 3 must reject any draft containing it.
- Exception: pure hiragana/katakana renderings of any word are always permitted.
- Compounds: a compound word is only permitted if **every** kanji in the compound has been taught. Example: 学校 requires both 学 (N5.7) and 校 (N5.7) to be in the taught set.
- **Watch for false-safe compounds.** A compound can look safe because one of its kanji is new to this lesson, while the other kanji is actually from a later lesson. Example: 先 is taught in N5.1, but 先週 cannot be used until N5.6 when 週 is taught. Check every character of every compound individually — never assume the compound is safe because the "focus" kanji is available.

---

## Approved Vocabulary Rules

### Where to find approved vocabulary

All permitted terms live in the glossary files:
- `data/N5/glossary.N5.json`
- `data/N4/glossary.N4.json`

Each entry has a `lesson` (for kanji type) or `lesson_ids` (for vocab type) field that specifies when it is introduced.

### Lesson scope

For a lesson or compose prompt targeting lesson `N5.X`, only terms with `lesson` / `lesson_ids` ≤ `N5.X` may be used. Terms from later lessons are **not permitted** even if the word is common Japanese.

### What "using vocab" means in practice

- Agent 2 must build the Japanese sentences from the available approved vocabulary.
- If a concept cannot be expressed with approved vocabulary, the sentence must be restructured or simplified until it can be.
- **Do not introduce vocabulary that isn't in the glossary.** If a concept genuinely requires a word that isn't in the glossary, flag this in the CB Checklist with a note: `"Word X not in glossary — restructured sentence to avoid it"`.

### Grammar patterns

Grammar patterns (particles, sentence-final forms, conjunctions like ～て) are governed by what has been taught, but they do not need to be explicitly listed in the glossary. Each conjugation form has an `introducedIn` field in `conjugation_rules.json` and each particle has an `introducedIn` field in `shared/particles.json` — these are the source of truth for when a grammar pattern becomes available. A form or particle whose `introducedIn` is later than the current lesson is **not permitted**, even if the result would be natural Japanese. See [Grammar Usage Prerequisite Rules](#grammar-usage-prerequisite-rules) for enforcement details.

---

## Lesson Refresh / Rewrite Guidelines

When the user requests a rewrite of an existing lesson (rather than creating new content from scratch), the pipeline runs identically — but Agent 1 must apply this additional rule during scoping:

**Treat every vocabulary item in the original lesson as unverified.** Do not assume that because a word appeared in an old lesson it is in scope. The original content may have been written before the current glossary discipline existed.

**Absent glossary entry = out-of-scope.** If the old lesson uses a vocab ID (e.g. `v_kouen`, `v_sanpo`) and that ID has no entry in the glossary, the word has not been introduced in the curriculum. The correct action is to remove the word and restructure the content to use available vocabulary. **Never add a new glossary entry to accommodate old lesson content.** Refreshes are not an opportunity to expand the curriculum.

**Glossary entry with wrong `lesson_ids` = still out-of-scope.** If an ID exists in the glossary but its `lesson_ids` is later than the current lesson, it is out-of-scope and must be removed. The presence of a glossary entry does not make the word available.

**The Unregistered Word Report path does not apply during refreshes.** That escalation is for new content creation where a genuinely natural word might warrant a new glossary entry at an appropriate lesson. During a refresh, all vocabulary must already exist in the glossary at or before the current lesson — no exceptions, no escalations.

**Agent 1 scoping step for refreshes:** After reading the original lesson, run a targeted Grep for every vocab ID used in the original against the glossary. Flag any ID that either (a) doesn't exist in the glossary, or (b) has `lesson_ids` later than the current lesson. List these as "out-of-scope replacements needed" in the Content Brief, along with candidate replacement vocabulary from within scope.

**Sentence Token Scan Protocol applies to all rewrites.** When Agent 2 builds the refreshed content, the STSP must be applied to every jp/passage field — including fields carried forward from the original file unchanged. Treat every jp string in the original as unaudited; the previous version may predate current tagging standards. Agent 3 must perform the STSP during QA of all refreshed content and may not give the original a "previously passing" exemption. This applies equally to lesson, review, and game day (Final Interactive Review) rewrites — anywhere jp + terms[] tagging is used. Grammar garden rewrites are governed by the Grammar Accuracy Audit, not the STSP.

---

## Early-Use Vocabulary Rules

### The problem

Some vocabulary is essential for natural conversations long before its kanji is formally taught. For example, わたし (私) is the most basic pronoun in Japanese and is needed from lesson 1, but the kanji 私 is not introduced until N4.3. Without an exception mechanism, agents cannot use these words in early content.

### How the glossary handles this

Each early-use word has its glossary entry set up with:
- **`surface`**: The kanji form (e.g. 私, 家族, 好き)
- **`matches`**: An array containing the hiragana writing (e.g. ["わたし", "かぞく", "すき"])
- **`lesson_ids`**: Set to the lesson where ALL constituent kanji are taught

The `matches` field allows the app to recognize the hiragana form when students type it (compose mode) or when it appears in content. The `lesson_ids` field controls when the full kanji form becomes available.

### Rules for agents

1. **Before the kanji lesson:** Write the word using its hiragana form (from the `matches` field). Tag it in `terms` using the same vocab ID — the ID is valid regardless of writing form.
2. **From the kanji lesson onward:** Write the word using its full kanji surface form.
3. **Only words on the approved list below may be used before their `lesson_ids` lesson.** This is a closed list — do not extend it without user approval.

### Approved early-use vocabulary

These words may be written in hiragana and used in content **from the listed lesson onward**, even though their `lesson_ids` (kanji introduction) is later.

| ID | Write as | Use from | Kanji form | Kanji available | Notes |
|---|---|---|---|---|---|
| `v_watashi` | わたし | N5.1 | 私 | N4.3 | Essential first-person pronoun |
| `v_nani` | なに | N5.1 | 何 | N5.2 | Question word (before を/が or standalone) |
| `v_nan` | なん | N5.1 | 何 | N5.2 | Question word (before です/の/counters/d-n-t sounds) |
| `v_kazoku` | かぞく | N5.1 | 家族 | N4.7 | Essential for family-themed content from lesson 1 |
| `v_suki` | すき | N5.7 | 好き | N4.4 | Na-adjective "like" — needed for food/preference conversations |
| `v_tsugi` | つぎ | N5.4 | 次 | (not taught) | "Next" — needed for sequencing and time expressions. 次 kanji is not formally introduced in any lesson; always write in hiragana. |
| `v_koto` | こと | N5.9 | 事 | N4.14 | Nominalizer "thing/fact" — needed for ～ことがある, ～ことにする patterns. Write as こと before N4.14. |
| `v_kinou` | きのう | N5.4 | 昨日 | (not taught) | "Yesterday" — essential time word paired with きょう. 昨 kanji is not formally introduced in any lesson; always write in hiragana. |
| `v_namae` | 名まえ | N5.1 | 名前 | N5.9 | Essential noun for introductions ("what is your name?"). 名 is N5.1 kanji; 前 is N5.9. Write as 名まえ until N5.9, then 名前. |

**Example usage in N5.1 content:**
```json
{
  "jp": "わたしのかぞくは四人です。",
  "en": "My family has four people.",
  "terms": ["v_watashi", "v_kazoku", ...]
}
```

The term ID `v_watashi` is used normally — the only difference is the surface text is written in hiragana instead of kanji.

### Partial-kanji vocabulary (hybrid writing)

Some compound words contain kanji from different lessons. When the word is introduced at a lesson where only SOME of its kanji have been taught, agents must write the word using partial kanji — available characters in kanji, unavailable characters in hiragana. The `matches` field contains these partial-kanji forms.

Unlike early-use vocabulary, these words are available at their `lesson_ids` lesson through normal rules. The only special instruction is the **writing form**.

| ID | Partial form | Use from | Full kanji form | Full kanji available |
|---|---|---|---|---|
| `v_daisuki` | 大すき | N5.7 | 大好き | N4.4 |
| `v_asagohan` | 朝ごはん | N4.3 | 朝ご飯 | N4.6 |
| `v_bangohan` | 晩ごはん | N4.3 | 晩ご飯 | N4.6 |
| `v_nichiyoubi` | 日ようび | N5.2 | 日曜日 | N4.14 |
| `v_getsuyoubi` | 月ようび | N5.2 | 月曜日 | N4.14 |
| `v_kayoubi` | 火ようび | N5.2 | 火曜日 | N4.14 |
| `v_suiyoubi` | 水ようび | N5.2 | 水曜日 | N4.14 |
| `v_mokuyoubi` | 木ようび | N5.2 | 木曜日 | N4.14 |
| `v_kinyoubi` | 金ようび | N5.2 | 金曜日 | N4.14 |
| `v_doyoubi` | 土ようび | N5.2 | 土曜日 | N4.14 |
| `v_nanyoubi` | 何よう日 | N5.2 | 何曜日 | N4.14 |
| `v_shuumatsu` | 週まつ | N5.4 | 週末 | *(末 never taught — permanent hybrid)* |

**Writing form decision rule:** For any word with a `matches` field, check whether ALL kanji in the surface are in the taught-kanji set for the current lesson. If yes, use the full kanji surface. If no, use the partial-kanji or hiragana form from `matches` that matches the available kanji.

### Maintaining these lists

- **Adding to the early-use list** requires user approval. Do not add words without explicit permission — the list is intentionally small (essential pronouns, question words, and high-frequency words only).
- **Adding partial-kanji entries** happens naturally when a compound word's constituent kanji are taught in different lessons. Agent 1 should check for this during scoping and ensure the `matches` field includes the appropriate partial form.
- **The partial-kanji table is a closed list.** Do not invent a new hybrid writing form for any compound not on it. If a compound's kanji are all eventually taught, the compound must be deferred to the lesson where the last kanji unlocks — it is not a partial-kanji candidate. The partial-kanji mechanism is only for compounds where at least one constituent kanji is **never introduced in any lesson** (永遠に未導入). Adding a word to this list requires explicit user approval.
- **Ad-hoc hybrid forms are prohibited.** Writing `おもい出` (hiragana substituted for an untaught-but-eventually-taught kanji) to introduce a compound before its kanji are ready is a scope violation, not a partial-kanji entry. Agent 1 must catch this during scoping; Agent 3 must reject any draft that uses a hybrid form for a word not on the approved partial-kanji list.
- When a word on either list reaches its full-kanji lesson, no special handling is needed — agents simply start writing the kanji form.

### Agent responsibilities

| Agent | Responsibility |
|---|---|
| **Agent 1** | When scoping a lesson, check the early-use list to identify which words are available in hiragana. Include them in the Content Brief's vocabulary scope. |
| **Agent 2** | Write early-use words in hiragana. Write partial-kanji words using the form appropriate for the lesson tier. Tag with the standard vocab ID regardless of writing form. |
| **Agent 3** | Verify that any word written in hiragana in a `jp` field either (a) has no kanji in the glossary surface, or (b) is on the early-use list and its kanji is not yet taught. Flag words written in hiragana that SHOULD be written in kanji (because the kanji is already taught). Also verify that early-use words are not used before their "Use from" lesson. |
| **Agent 4** | No additional checks beyond standard consistency review. |

---

## Grammar Usage Prerequisite Rules

### Source of truth: `conjugation_rules.json` and `shared/particles.json`

Each conjugation form in `conjugation_rules.json` has an `introducedIn` field specifying the lesson that formally teaches it. Each particle in `shared/particles.json` has an equivalent field. These are hard gates — not guidelines.

### How to compute the available grammar set

1. Read `conjugation_rules.json`.
2. Collect all form entries whose `introducedIn` lesson is ≤ the current lesson.
3. Read `shared/particles.json`.
4. Collect all particle entries whose `introducedIn` lesson is ≤ the current lesson.
5. The union of these two sets defines the grammar available for the content.

### Enforcement

- Any conjugation form whose `introducedIn` is later than the current lesson is a **hard blocker**. Agent 2 must not use it. Agent 3 must reject any draft containing it. Agent 4 must flag it as a grammar usage violation.
- Structural grammar patterns (e.g. ～ている, ～てください, ～たり～たりする) inherit the prerequisite of their constituent forms. If `te_form` has `introducedIn: "N5.5"`, then ～ている is not available before N5.5.
- Particles follow the same rule: a particle whose `introducedIn` is later than the current lesson must not appear in `jp` text.
- Exception: dictionary/base forms of verbs and adjectives have no `introducedIn` gate — they are available whenever the vocabulary item itself is available.
- When a sentence requires a grammar pattern that is not yet available, restructure the sentence to use only available forms. For example, in an N5.3 lesson, instead of 「行って食べました」(requires te_form, N5.5), write 「行きました。食べました。」(uses polite_mashita, N5.5 — or if that's also unavailable, use dictionary form or restructure further).

### Quick reference: form availability by lesson

| Lesson | Newly available forms |
|---|---|
| N5.1 | `polite_adj` |
| N5.5 | `polite_masu`, `polite_mashita`, `polite_negative`, `polite_past_negative`, `te_form`, `polite_negative_te`, `plain_past` |
| N5.8 | `plain_desire_tai`, `desire_tai_negative`, `polite_desire_tai_negative`, `polite_volitional_mashou` |
| N5.9 | `plain_negative`, `plain_past_negative` |
| G9 (N5.9+) | `plain_volitional`, `plain_past_adj`, `plain_appearance_sou`, `plain_desire_tai_past` |
| N5.10 | `polite_past_adj`, `adverbial`, `desire_tai_past` |
| N5.11 | `appearance_sou` |
| N4.3 | `potential`, `polite_potential`, `potential_negative`, `plain_potential_negative`, `polite_potential_past`, `plain_potential_past` |
| N4.10 | `tari_form`, `nagara_form` |
| G25 (~N4.34) | `sugiru_form`, `polite_sugiru_form`, `sugiru_past`, `polite_sugiru_past` |
| G22 (~N4.25) | `conditional_ba` |
| N4.25 | `conditional_tara` |
| N4.31 | `passive`, `polite_passive`, `polite_passive_past`, `plain_passive_past`, `causative`, `polite_causative`, `polite_causative_past`, `plain_causative_past`, `causative_passive`, `polite_causative_passive` |

Before N5.5, only `polite_adj` and dictionary forms are available. This means N5.1–N5.4 content is limited to noun-です sentences, い-adjective+です sentences, and verbs in dictionary form. Plan sentences accordingly.

**Desire expressions (N5.8+).** `plain_desire_tai` is available from N5.8. For polite desire sentences (〜たいです), use `plain_desire_tai` + `g_desu` (two chips). For plain/casual desire (〜たい without です), use `plain_desire_tai` alone. The deprecated `desire_tai` form must never be used — see [desire_tai — deprecated](#desire_tai--deprecated-always-use-plain_desire_tai--g_desu). The reinforcement schedule expects desire expressions from N5.9 onward (G9 active window); N5.8 content may use `plain_desire_tai` but is not required to meet reinforcement minimums for it.

---

## Grammar Reinforcement Requirements

The prerequisite rules above define when a grammar form **may** be used (the ceiling). This section defines when a grammar form **should** be used (the floor). Without both rules, content can technically pass all QA gates while never actually practicing the grammar students have learned — defeating the purpose of teaching it.

### The reinforcement principle

> Once a grammar form is unlocked, subsequent content must **actively use** it. Students learn through repeated, natural exposure — not by seeing a form once in a grammar lesson and never encountering it again.

### Grammar milestones and reinforcement schedule

Each milestone groups forms that unlock together. The **active reinforcement window** is the 2–3 lessons immediately after unlock, where minimum usage counts apply. After the window, forms enter **sustained use** where complete absence is flagged.

**Important — grammar lessons vs content lessons.** Grammar lessons (G1–G49) teach concepts and unlock after specific content lessons. The reinforcement schedule must respect this: a form may be *mechanically available* (its `introducedIn` lesson has passed) before the grammar lesson that *formally teaches the concept* has unlocked. For example, `te_form` is available from N5.5, and G8 (て-form mechanics + てください preview) unlocks after N5.5, but G9 (ている progressive, たいです, ましょう) doesn't unlock until after N5.8. The schedule below groups milestones by the grammar lesson that teaches them, not just the conjugation form availability.

| Milestone | Available from | Active window | Required patterns (per lesson, across convs + readings) | Sustained use (after window) |
|---|---|---|---|---|
| **Polite verbs** (G7) | N5.5 | N5.6–N5.7 | ≥3 `polite_masu`, ≥2 `polite_mashita`, ≥1 `polite_negative` or `polite_past_negative` | All four polite verb forms appear regularly; no lesson should use only ます/ました |
| **Te-form as connector + requests** (G8) | N5.5 | N5.6–N5.7 | ≥1 `てください` request, ≥1 te-form sequential connector (AてB) | てください appears naturally where context calls for requests; て as connector used in multi-action sentences |
| **Progressive + desire + volitional** (G9) | N5.9 | N5.9–N5.10 | ≥1 `ている/ています` progressive or state, ≥1 `～たいです` desire expression, ≥1 `～ましょう` suggestion/invitation | All three patterns appear where thematically appropriate |
| **Plain negative** (G10) | N5.9 | N5.10–N5.11 | ≥1 `～ない` or `～なかった` in context (reading, drill, or natural dialogue) | Plain negatives appear in varied contexts; not limited to drills |
| **Adj past + adverbial** (G11) | N5.10 | N5.11–N5.12 | ≥1 past-tense adjective (`polite_past_adj`), ≥1 adverbial form (`adverbial`) | Both used naturally in descriptions and narratives |
| **Appearance** (N5.11) | N5.11 | N5.12–N5.13 | ≥1 `～そうです` appearance pattern | Appears where observations or impressions are natural |
| **Potential** (G13) | N4.3 | N4.4–N4.6 | ≥1 potential form (affirmative or negative) | Ability/possibility expressions used where natural |
| **Give & receive** (G14) | N4.5 | N4.6–N4.8 | ≥1 `あげる`, `もらう`, or `くれる` in a natural exchange | All three verbs appear regularly; distinguish direction of giving/receiving in varied scenes |
| **Comparison + degree** (G15) | N4.5 | N4.6–N4.8 | ≥1 `より` comparison, ≥1 `いちばん` superlative or `ほど` degree pattern | Comparison/degree expressions appear where natural (describing preferences, rankings, qualities) |
| **Manner & similarity** (G16) | N4.6 | N4.7–N4.9 | ≥1 `ように` or `みたいに` manner/similarity expression | Manner expressions appear where actions are described by how they resemble something else |
| **Transitive & intransitive pairs** (G18) | N4.10 | N4.11–N4.13 | ≥1 transitive/intransitive pair used contrastively (e.g. 開ける vs 開く) | Transitive/intransitive verbs selected correctly for the subject/object role in each sentence |
| **Tari + nagara** (G19) | N4.10 | N4.11–N4.13 | ≥1 `～たり～たりする` listing, ≥1 `～ながら` simultaneous action | Both patterns appear where natural |
| **Contrast, concession & listing** (G20) | N4.14 | N4.15–N4.17 | ≥1 `のに` (despite/unexpectedly), ≥1 `ても` (even if/even though), ≥1 `し` (and what's more) | All three patterns appear where contrast, concession, or additive reasoning is natural |
| **Conversation mechanics** (G28) | N4.14 | N4.15–N4.17 | ≥1 floor-holding or hesitation filler (あのう, ええと, そうですね), ≥1 back-channel response (あいづち: そうですか, なるほど, へえ) | Conversation fillers and responses appear in casual or semi-formal dialogue naturally; not every conversation needs them, but prolonged absence across multiple lessons is a gap |
| **Appearance & hearsay** (G29) | N4.14 | N4.15–N4.17 | ≥1 `～そうだ` appearance (looks like) or `～そうだ` hearsay (I heard that) | Both usages appear where observation or reported information is natural; distinguish the two by context |
| **Limiting particles** (G17) | N4.14 | N4.15–N4.17 | ≥1 `だけ` or `しか～ない` limiting expression | Limiting particles appear where context calls for restriction or exclusion |
| **Permission + prohibition** (G21) | N4.20 | N4.21–N4.23 | ≥1 `てもいい` permission or ≥1 `てはいけない` prohibition | Both patterns appear where rules, permissions, or social norms are discussed |
| **Directional て-form** (G30) | N4.21 | N4.22–N4.24 | ≥1 `てくる` (coming toward/change toward speaker), ≥1 `ていく` (going away/continuing change) | Both directions appear; distinguish movement toward vs away, and resultant-state usage (てある) where natural |
| **Conditionals** (G22) | N4.25 | N4.26–N4.28 | ≥1 `～たら` or `～ば` conditional in conversation or reading | At least one conditional form (たら or ば) appears where natural |
| **ように patterns** (G31) | N4.25 | N4.26–N4.28 | ≥1 `ようにする` (make effort to) or `ようになる` (come to be able to / come to do) | Both patterns appear where expressing goal-oriented effort or gradual change is natural |
| **Passive + causative** (G23/G24) | N4.31 | N4.32–N4.34 | ≥1 passive, ≥1 causative across the lesson | Both voice patterns appear where natural |
| **Thoughts & experience** (G27) | N4.30 | N4.31–N4.33 | ≥1 `と思う` (I think / I thought), ≥1 `たことがある` (have done) | Both patterns appear where expressing opinion or past experience is natural |
| **Auxiliary compounds** (G25) | N4.34 | N4.35–N4.36 | ≥1 `てみる` (try) or `ておく` (prepare) or `てしまう` (complete/regret) | Auxiliary verb compounds appear where experimentation, preparation, or completion is discussed |
| **Excessive degree** (G25) | N4.34 | N4.35–N4.36 | ≥1 `～すぎる` excessive expression | ～すぎる appears where overabundance or excess is natural (eating too much, too expensive, too noisy) |

### How to read the schedule

- **Active window counts are minimums**, not targets. Natural content will typically exceed them. The counts exist to prevent the common failure where all verbs default to ます/ました and recently taught forms never appear.
- **Sustained use** means the form should appear at least once per lesson (across all conversations and readings combined) unless the lesson's theme genuinely has no natural context for it. Complete absence of a sustained-use form triggers an Agent 4 soft fail with an explanation of why the form was omitted.
- **Counts apply to lesson content only** (conversations, readings, warmups). Drill items are excluded from the count because drills test specific knowledge rather than providing natural reinforcement exposure.
- **Compose files** are exempt from minimum counts but should include recently-unlocked forms in their `conjugations` array and use them in model sentences.
- **Stories** should use the full available grammar set naturally. Agent 4 flags stories that use only basic forms when richer grammar is available.
- **Reviews** draw from their full lesson range, so reinforcement is inherent — but Agent 4 should verify that conversations in reviews exercise recently-taught forms, not just the earliest ones.

### Structural pattern reinforcement

Beyond individual conjugation forms, these **structural patterns** combine forms into practical constructions that students must encounter repeatedly. The table is divided into conjugation-based patterns and non-conjugation patterns (particle-based and structural grammar).

**Conjugation-based patterns:**

| Pattern | Taught in | Reinforce from | How to reinforce |
|---|---|---|---|
| `Verb-てください` (polite request) | G8 | N5.6+ | Use in at least 1 conversation per lesson. Natural contexts: giving directions, asking for help, making requests. |
| `Verb-て Verb` (sequential connector) | G8 | N5.6+ | Use in at least 1 multi-action sentence per lesson. Natural contexts: describing routines, narrating sequences. |
| `Verb-ないでください` (negative request) | G8 | N5.6+ | Use occasionally. Natural contexts: classroom rules, polite prohibitions. Should not be absent across 3+ consecutive lessons. |
| `Verb-ている/ています` (progressive/state) | G9 | N5.9+ | Use in at least 1 conversation or reading per lesson. Natural contexts: describing ongoing actions, states (住んでいます, 知っています). **Note:** te_form is mechanically available from N5.5, but ている as a *concept* is taught in G9 (unlocks after N5.8). Do not require ている in N5.6–N5.8 content. |
| `Verb-たいです` (desire) | G9 | N5.9+ | Use in at least 1 conversation per lesson. Natural contexts: discussing plans, preferences, wishes. |
| `Verb-ましょう` (let's/shall we) | G9 | N5.9+ | Use in at least 1 conversation per lesson. Natural contexts: making plans together, suggestions, invitations. |
| `あげる / もらう / くれる` (give & receive) | G14 | N4.6+ | Use in at least 1 exchange per lesson. Natural contexts: gifts, favours, teaching, lending. Vary which verb is used — don't default to あげる every time. |
| `ように / みたいに` (manner, similarity) | G16 | N4.7+ | Use occasionally. Natural contexts: describing how someone acts, what something resembles, role-modelling behaviour. |
| `Verb-てくる / ていく` (directional te-form) | G30 | N4.22+ | Use in at least 1 conversation or reading per lesson. Natural contexts: arriving with something, gradual change over time, continuing a habit going forward. |
| `ようにする / ようになる` (goal/change) | G31 | N4.26+ | Use occasionally. Natural contexts: habit-forming, improvement goals, gradual ability gain. |
| `と思う` (I think / thought) | G27 | N4.31+ | Use in at least 1 conversation per lesson. Natural contexts: expressing opinions, hedging a statement, reporting someone's thought. |
| `たことがある` (have done / experience) | G27 | N4.31+ | Use occasionally. Natural contexts: discussing past experiences, travel, food, activities. |
| `Verb-たり Verb-たりする` (listing actions) | G19 | N4.11+ | Use in at least 1 conversation or reading per lesson. Natural contexts: describing weekends, hobbies, routines. |
| `Verb-ながら` (while doing) | G19 | N4.11+ | Use occasionally. Natural contexts: multitasking descriptions, daily routines. |
| `～すぎる` (excessive degree) | G25 | N4.35+ | Use occasionally. Natural contexts: eating too much, too expensive, too loud, overwork. |
| `～ば / ～ければ` (ba conditional) | G22 | N4.26+ | Use occasionally. Natural contexts: general conditions, advice, logical consequences. |
| `～たら` (if/when conditional) | G22 | N4.26+ | Use in at least 1 context per lesson. Natural contexts: plans, hypotheticals, advice. |
| `Verb-てもいい` (permission) | G21 | N4.21+ | Use occasionally. Natural contexts: asking permission, stating what's allowed. |
| `Verb-てはいけない` (prohibition) | G21 | N4.21+ | Use occasionally. Natural contexts: rules, warnings, social norms. |
| `Verb-てみる` (try doing) | G25 | N4.35+ | Use occasionally. Natural contexts: trying new foods, experiences, suggestions. |
| `Verb-ておく` (prepare/do in advance) | G25 | N4.35+ | Use occasionally. Natural contexts: planning ahead, preparations. |
| `Verb-てしまう` (completion/regret) | G25 | N4.35+ | Use occasionally. Natural contexts: accidents, finishing something, unintended results. |

**Non-conjugation patterns (particle-based and structural grammar):**

| Pattern | Taught in | Particles/tracking | Reinforce from | How to reinforce |
|---|---|---|---|---|
| `X の方が Y より ～` (comparison) | G15 | `p_yori` | N4.6+ | Use in at least 1 context per lesson. Natural contexts: comparing food, places, seasons, preferences. |
| `X で いちばん ～` (superlative) | G15 | `v_ichiban` (vocab) | N4.6+ | Use occasionally alongside comparison. Natural contexts: "the most ～ in ～". |
| `X は Y ほど ～ない` (negative degree) | G15 | `p_hodo` | N4.6+ | Use occasionally. Natural contexts: "X is not as ～ as Y". |
| `～だけ` (only/just) | G17 | `p_dake` | N4.15+ | Use occasionally. Natural contexts: limitations, quantities. |
| `～しか～ない` (nothing but) | G17 | `p_shika` | N4.15+ | Use occasionally. Natural contexts: scarcity, emphasis on limits. |
| `～ので` (because — polite) | G10 | `p_node` | N4.11+ | Use occasionally as an alternative to から. Natural contexts: giving reasons in polite speech. |
| `のに` (despite / unexpectedly) | G20 | `p_noni` | N4.15+ | Use occasionally. Natural contexts: expressing surprise or frustration that a result contradicts an expectation. |
| `ても` (even if / even though) | G20 | `p_temo` | N4.15+ | Use occasionally. Natural contexts: conceding a condition while maintaining the conclusion ("even if it rains, we'll go"). |
| `し` (and what's more / listing reasons) | G20 | `p_shi` | N4.15+ | Use occasionally. Natural contexts: listing supporting reasons for a conclusion or opinion. |
| `～そうだ` appearance / hearsay | G29 | `p_sou_da` (appearance) / `p_sou_da_hearsay` | N4.15+ | Use occasionally. Natural contexts: commenting on how something looks (appearance そうだ) or reporting something heard (hearsay そうだ). Distinguish the two by context. |

### Reinforcement in warmups

Warmup items are an ideal place to reinforce recently-unlocked grammar because they draw exclusively from prior-lesson vocabulary. Agent 1 should plan warmup items that exercise the most recently unlocked grammar milestone. For example:

- N5.6–N5.7 warmups should include at least 1 item using G8 patterns (てください requests, て-connector sequences) with N5.1–N5.5 vocabulary
- N5.9–N5.10 warmups should include at least 1 item using G9 patterns (ています, ～たいです, or ～ましょう) with prior vocabulary
- N5.10–N5.11 warmups should include at least 1 item using plain negative forms with prior vocabulary
- N4.4–N4.6 warmups should include at least 1 item exercising potential form (できる or verb potential) with prior vocabulary
- N4.6–N4.8 warmups should include at least 1 item using give/receive (あげる/もらう/くれる) and 1 item using comparison patterns (より, いちばん) with prior vocabulary
- N4.7–N4.9 warmups should include at least 1 item using ように/みたいに manner expression with prior vocabulary
- N4.11–N4.13 warmups should include at least 1 item using たり pattern or ながら with prior vocabulary
- N4.15–N4.17 warmups should include at least 1 item using のに/ても/し contrast-concession or そうだ with prior vocabulary
- N4.22–N4.24 warmups should include at least 1 item using てくる/ていく directional pattern with prior vocabulary
- N4.26–N4.28 warmups should include at least 1 item using ようにする/ようになる or a conditional (たら/ば) with prior vocabulary
- N4.31–N4.33 warmups should include at least 1 item using と思う or たことがある with prior vocabulary

This ensures students engage with new grammar patterns using familiar words, reducing cognitive load.

### Enforcement summary

| Agent | Reinforcement responsibility |
|---|---|
| **Agent 1** | Includes "Grammar reinforcement targets" in the Content Brief. Identifies which milestone(s) are in the active window and which are in sustained use. Plans warmup items that exercise recently unlocked grammar. |
| **Agent 2** | Writes content that meets the minimum counts in the active window. Checks usage in the CB Checklist. If a minimum cannot be met naturally, flags it for Agent 1 rather than forcing awkward sentences. |
| **Agent 3** | Counts tagged forms and verifies active-window minimums are met. Reports under-counts in the QA Failure Report the same way as missing terms. |
| **Agent 4** | Performs the Grammar Reinforcement Audit (see below). Flags sustained-use forms that are completely absent. Verifies structural patterns appear where context naturally supports them. |

---

## Register Requirements (Polite vs Casual)

### The register principle

> G10 (plain forms & basic connectors) formally teaches when and how to use casual speech — with friends, family, and in relaxed settings. From the first content lesson after G10 unlocks (**N5.10**), lessons must include casual conversations to reinforce plain forms, connectors, and commands/prohibition in natural context. The majority of content remains polite to maintain the student's strongest register.

### Register schedule by lesson range

| Lesson range | Casual conversations per lesson | Register balance | Notes |
|---|---|---|---|
| N5.1–N5.9 | 0 | 100% polite | G10 not yet available. All conversations use です/ます register. |
| N5.10–N5.13 | 1 | ~75% polite, ~25% casual | First casual conversations. Keep them simple — friends/family contexts. |
| N5.14–N5.18 | 1–2 | ~60% polite, ~40% casual | Expand casual contexts: classmates, siblings, close colleagues. |
| N4.1–N4.12 | 1 | ~75% polite, ~25% casual | Early N4 grammar (potential, passive, conditionals) is cognitively demanding — keep casual light so new forms are modeled in polite register first. |
| N4.13–N4.24 | 1–2 | ~60% polite, ~40% casual | Grammar becoming familiar; ramp casual gradually. Context drives register. |
| N4.25–N4.36 | 2 | ~50% polite, ~50% casual | Balanced exposure by late N4. Casual in personal contexts, polite in service/formal contexts. |

### Casual conversation rules

1. **Context signals register.** Every conversation has a `context` field. Casual conversations must have a context that justifies informal speech — friends, family, roommates, close classmates, etc. Example: `"context": "Two college friends discussing weekend plans"`. Never use casual register in service encounters, workplaces with superiors, or stranger interactions.

1b. **Casual conversations go last and are labelled.** Within a lesson, casual conversations must be the final conversation(s) — after all polite conversations. Their `title` must include `(Casual)` at the end, e.g. `"Conversation 4: Weekend Plans (Casual)"`. This makes the register shift explicit so students know what to expect.

2. **Do not mix registers within a conversation.** A character should not switch between ます and plain form mid-dialogue unless there is a clear in-story reason (e.g. a character talks to their teacher politely, then turns to a friend and speaks casually — but this would be two conversations, not one).

3. **Casual conversations use plain forms naturally.** This means:
   - Verbs in dictionary form, plain negative (～ない), plain past (～た), plain past negative (～なかった)
   - だ instead of です for nouns and な-adjectives (but note: だ is often dropped in casual questions and feminine speech)
   - い-adjectives without です (おいしい rather than おいしいです)
   - Casual connectors: けど, から (clause-final), し, のに
   - Sentence-final particles used more freely: よ, ね, な, かな
   - Questions without ですか — rising intonation or の/かな instead

4. **Casual ≠ rude.** Plain commands (～ろ/～え) and prohibition (～な) are blunt. Use them sparingly and only in appropriate contexts:
   - Commands: sports coaching, very close male friends, playful/teasing tone, signs/instructions
   - Prohibition: warning signs (触るな "don't touch"), urgent warnings, parental scolding
   - For polite casual requests, use ～て (without ください) — this is the most common casual request form

5. **Casual conversations should not be the hardest conversation in the lesson.** The new grammar being practiced is the plain forms themselves, so the casual conversations should feel accessible and natural — not packed with advanced vocabulary.

6. **Tag plain forms correctly.** In casual conversations, verbs will use `plain_negative`, `plain_past`, `plain_past_negative`, and dictionary form (no form tag needed). Do not tag casual speech verbs with polite form tags. The copula だ should be tagged as `g_da` (not `g_desu`). See [Term Tagging Reference](#term-tagging-reference) for all valid form strings.

### What to prioritize in early casual conversations (N5.10–N5.11)

Focus on these patterns first — they are the core G10 concepts:

| Pattern | Example | Priority |
|---|---|---|
| Plain negative (～ない) | 食べない、行かない、わからない | High — core G10 |
| Plain past (～た) | 食べた、行った、見た | High — reinforces ta-form |
| けど connector | 行きたいけど、お金がない | High — natural casual connector |
| から as "because" | おいしいから食べる | High — clause-linking |
| だ copula | これは本だ / 元気だ | Medium — dropped in questions |
| Sentence-final の | どこに行くの？ | Medium — casual question form |
| Plain command (～ろ) | Only in appropriate contexts | Low — use sparingly |
| Prohibition (～な) | Signs/warnings only at first | Low — use sparingly |

### What to avoid in early casual conversations

- Don't use advanced casual patterns (んだけど, ちゃう/じゃう contractions, っぽい, etc.) before they are formally taught
- Don't drop particles aggressively — casual speech drops は and を sometimes, but lessons should keep particle usage clear for learning purposes
- Don't have all characters suddenly speaking casually — maintain a realistic social landscape where register depends on relationship

### Register in other content types

| Content type | Register rules |
|---|---|
| **Reviews** | Conversations may use either register. Mark context clearly so the student knows why. |
| **Compose** | Stay in polite register by default. From N5.10+, include one challenge prompt in casual register if the theme supports it (e.g. "Now write a casual version for a friend"). |
| **Stories** | Narrative prose uses plain past (standard for Japanese storytelling). Dialogue within stories follows the same register rules as lesson conversations — context determines register. |
| **Drills** | MCQ items may test register awareness from N5.10+: "Which is the casual form of 食べます?" Scramble items may use either register. |

### Enforcement summary

| Agent | Register responsibility |
|---|---|
| **Agent 1** | Includes "Register plan" in the Content Brief. Identifies how many casual vs polite conversations to build. Plans casual conversation contexts. For lessons before N5.10, confirms register = 100% polite. |
| **Agent 2** | Writes casual conversations using only available plain forms. Does not use casual register before N5.10. Tags plain forms correctly. Checks register in the CB Checklist. |
| **Agent 3** | Verifies casual conversations only appear in N5.10+ lessons. Verifies plain forms used in casual conversations have `introducedIn` ≤ current lesson. Verifies no register mixing within a single conversation. |
| **Agent 4** | Assesses naturalness of casual dialogue — does it sound like friends talking, not like a textbook exercise with です replaced by だ? Verifies the casual/polite ratio matches the schedule. Flags lessons that are 100% polite after N5.10 as a register reinforcement gap. |

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

## Quick Start Prompt for Claude Code

When the user says something like *"Create a lesson for N5.3"* or *"Add a new compose prompt for N5.6"* or *"Write a story for N4 lessons 7–9"*, Agent 1 runs in the main context. Agents 2, 3, and 4 are spawned as independent subprocesses via the `Agent` tool.

**Agent 1 (main context) — always announce what you're doing:**

```
=== AGENT 1: PROJECT MANAGER ===
Reading manifest.json and glossary to build Content Brief...
[Content Brief here]
Spawning Agent 2...
```

**Spawning Agent 2:**
Use the `Agent` tool with a prompt that includes the Content Brief, dependency file paths, and the instruction to read CLAUDE.md. Do not include the full conversation history — only what Agent 2 needs. Label the spawn clearly:

```
=== SPAWNING AGENT 2: CONTENT BUILDER ===
```

**When Agent 2 returns, announce receipt and spawn Agent 3:**

```
=== AGENT 2 RETURNED — spawning Agent 3: QA REVIEWER ===
```

Pass Agent 2's draft + the Content Brief to Agent 3. Do not include Agent 2's reasoning — only the draft JSON and the brief.

**When Agent 3 returns:**
- PASS → announce and spawn Agent 4:
  ```
  === AGENT 3: QA-PASS — spawning Agent 4: CONSISTENCY REVIEWER ===
  ```
- FAIL → show the full QA Failure Report, then re-spawn Agent 2 with it:
  ```
  === AGENT 3: QA-FAIL — re-spawning Agent 2 (Revision N) ===
  ```
- ESCALATE → present the Unregistered Word Report to the user, then re-spawn Agent 2 with the resolution

**When Agent 4 returns:**
- PASS → Agent 1 writes the file to the repo
  ```
  === AGENT 4: CR-PASS — Agent 1 writing to repo ===
  ```
- FAIL → show the full Consistency Note, update the Content Brief, re-spawn Agent 2
  ```
  === AGENT 4: CR-FAIL — Agent 1 updating brief, re-spawning Agent 2 (Revision N) ===
  ```

**Show all agent outputs in full.** Do not summarise or condense the CB Checklist, QA Failure Report, or Consistency Note. The full trail must be visible so the user can see exactly what each independent agent checked and found.
