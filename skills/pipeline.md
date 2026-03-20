# Content Pipeline — Agent Roles & Orchestration

> **Loaded by:** Agent 1 (Project Manager) at session start for any content creation task.
> **Purpose:** Defines the 4-agent pipeline, each agent's responsibilities, handoff protocol, and orchestration patterns.

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
- **Do not read the glossary in full.** The glossary files are large and will exceed output token limits. Instead use targeted Grep queries: search by `lesson_ids` to enumerate vocab for the target lesson, and search by `"id": "v_foo"` to verify individual IDs. See Glossary Access Pattern in `skills/quality-gates.md`.
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
- **Grammar reinforcement planning.** Before finalizing the Content Brief, Agent 1 must consult the Grammar Reinforcement Requirements in `skills/grammar-rules.md` schedule and identify: (a) which grammar milestones are in their **active reinforcement window** for this lesson, and (b) which milestones are in **sustained use**. List the specific reinforcement targets in the Content Brief. Plan at least 1 warmup item that exercises the most recently unlocked grammar using prior-lesson vocabulary. If the lesson's theme naturally supports certain grammar patterns (e.g. a travel theme supports ～たいです for desires, ～てください for requests), note these opportunities in the brief.
- **Register planning.** Before finalizing the Content Brief, Agent 1 must consult the Register Requirements in `skills/grammar-rules.md` schedule and determine how many casual conversations the lesson needs. For N5.10+ lessons, plan which conversations will be casual by assigning informal contexts (friends, family, close peers). For lessons before N5.10, confirm register = 100% polite. Include the register plan in the Content Brief.

**Spawning Agents 2, 3, and 4 via the Agent tool:**

Agent 1 spawns each downstream agent as an independent subprocess. Each agent receives only what is explicitly included in its prompt — it cannot read the main conversation history.

**What to include in the Agent 2 prompt:**
- The complete Content Brief
- Paths to any dependency files listed in the brief (reference template, prior lesson files) — Agent 2 must read these itself via its tools
- The instruction: *"You are Agent 2 (Content Builder). Read the following skill files for your full responsibilities: skills/pipeline.md, skills/content-schemas.md, skills/term-tagging.md, skills/grammar-rules.md. Build the draft JSON according to the Content Brief above, then return the complete draft and your CB Checklist."*
- If this is a revision pass: include the QA Failure Report from Agent 3 and instruct Agent 2 to fix every listed issue

**What to include in the Agent 3 prompt:**
- The complete Content Brief (including the taught-kanji set Agent 1 computed)
- The full draft JSON returned by Agent 2
- The instruction: *"You are Agent 3 (QA Reviewer). Read the following skill files for your full responsibilities: skills/pipeline.md, skills/quality-gates.md, skills/term-tagging.md, skills/grammar-rules.md. Your first task is the mechanical kanji scope audit described in your Responsibilities section — complete that before any other check. Return a QA-PASS stamp or a QA Failure Report."*

**What to include in the Agent 4 prompt:**
- The complete Content Brief
- The QA-approved draft JSON
- Paths to the 1–2 most recent same-type lesson files for comparison (Agent 4 must read these itself)
- The instruction: *"You are Agent 4 (Consistency Reviewer). Read the following skill files for your full responsibilities: skills/pipeline.md, skills/quality-gates.md, skills/grammar-rules.md. Return either a CR approval or a Consistency Note with a rewrite directive."*

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
- **Do not read the glossary in full.** Use targeted Grep queries only (see Glossary Access Pattern in `skills/quality-gates.md`). Reading the full file will exceed the 32k output token limit.
- Read any existing lesson or review JSON files listed in `Dependencies`.
- Write all JSON/MD content strictly according to the schemas defined in Content Types in `skills/content-schemas.md`.
- Every Japanese surface form that is used in `jp` fields, passages, or conversation lines **must** either be tagged in the `terms` array of that item, or be fully hiragana/katakana with no kanji content (pure kana items for basic particles/common function words may be untagged when they are not in the glossary).
- Do **not** invent vocabulary. Use only IDs that exist in the glossary.
- Do **not** use kanji that have not been introduced by the current lesson or earlier. See Kanji Prerequisite Rules in `skills/grammar-rules.md`.
- Do **not** use conjugation forms whose `introducedIn` lesson (in `conjugation_rules.json`) is later than the current lesson. For example, `te_form` has `introducedIn: "N5.5"` — a lesson targeting N5.3 must not contain any て-form usage. If a sentence requires a form that is not yet available, restructure the sentence to use only available forms. See Grammar Usage Prerequisite Rules in `skills/grammar-rules.md`.
- When a verb or adjective appears in a conjugated form, tag it with the correct `form` string. See Term Tagging Reference in `skills/term-tagging.md`.
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
- **New glossary entry kanji gate.** For any glossary entry created during this content-creation cycle (i.e. an entry that did not exist before Agent 1 began scoping), verify: (a) every kanji in the `surface` field is in the taught-kanji set at `lesson_ids`; (b) if the surface contains an untaught kanji, the entry must be on the approved partial-kanji list in skills/grammar-rules.md (permanent-hybrid case) — not an ad-hoc hybrid invented to work around a deferred compound. A new entry whose surface contains a kanji not taught until a later lesson, and which is not on the partial-kanji list, is a **hard fail**: flag it to Agent 1 with the lesson where the last required kanji unlocks.
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
- Assess: **Skill progression** — does difficulty increase appropriately from the previous lesson? Are new grammar points used naturally rather than force-fed? Are conjugation forms and grammar patterns appropriate for the lesson tier? See Agent 4 — Grammar Usage Validation (below).
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

2. **Count active-window forms.** For each milestone in the active reinforcement window, count the occurrences of its required patterns across all conversation and reading sections (excluding drills). Compare against the minimum counts in the Grammar Reinforcement Schedule in `skills/grammar-rules.md`.

   - **Hard fail:** An active-window minimum count is not met AND there are conversations/readings where the form could have been used naturally. Example: N5.7 lesson has 5 conversations and 2 readings, all verbs are in ます or ました, zero てください or ています — despite te-form being in the active window.
   - **Soft fail:** The count falls short by 1, and the lesson's theme makes it genuinely difficult to use the form naturally. Flag with a specific suggestion for where the form could be inserted.

3. **Check sustained-use forms.** For each milestone in sustained use, verify at least 1 instance of the milestone's forms appears somewhere in the lesson content (conversations + readings). Complete absence is a **soft fail** unless the lesson's theme genuinely has no natural context.

4. **Verb form diversity check.** Count the distribution of verb forms across all conversation and reading sections. If >80% of tagged verb forms are `polite_masu` or `polite_mashita` (excluding the introduction lesson N5.5 itself), flag as a diversity concern. The lesson should use the full range of available forms — negatives, te-form, desire, volitional — not default to affirmative present/past.

5. **Warmup reinforcement check.** Verify that at least 1 warmup item exercises a recently-unlocked grammar pattern (from the most recent active-window milestone) using prior-lesson vocabulary. Warmups that only use noun-です patterns after N5.5 are a missed reinforcement opportunity.

6. **Structural pattern presence.** For lessons after N5.5, verify the following structural patterns appear at least once (where the lesson is past their availability point):

   **Conjugation-based patterns:**
   - N5.6+: Is there a てください somewhere? Is there a て-connector (AてB) somewhere?
   - N5.9+: Is there a ています somewhere? Is there a たいです somewhere? Is there a ましょう somewhere?
   - N5.10+: Is there a ない/なかった somewhere? Is there a のです/なんです (or casual んだ) somewhere?
   - N4.11+: Is there a たり pattern somewhere? Is there a てから, まえに, or ために somewhere?
   - N4.21+: Is there a てもいい or てはいけない somewhere?
   - N4.26+: Is there a なければいけない or ないといけない somewhere? Is there at least one of ～なら or ～と conditional somewhere?
   - N4.35+: Is there a くなる/になる or くする/にする somewhere?

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
Use the `Agent` tool with a prompt that includes the Content Brief, dependency file paths, and the instruction to read the relevant skill files. Do not include the full conversation history — only what Agent 2 needs. Label the spawn clearly:

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
