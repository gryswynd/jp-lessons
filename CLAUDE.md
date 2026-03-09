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
9. [Early-Use Vocabulary Rules](#early-use-vocabulary-rules)
10. [Grammar Usage Prerequisite Rules](#grammar-usage-prerequisite-rules)
11. [Grammar Reinforcement Requirements](#grammar-reinforcement-requirements)
12. [Register Requirements (Polite vs Casual)](#register-requirements-polite-vs-casual)
13. [Quality Gates (Pass/Fail Criteria)](#quality-gates-passfail-criteria)
14. [File & Structure Reference](#file--structure-reference)
15. [Common Failure Modes](#common-failure-modes)

---

## Pipeline Overview

Content creation always runs through **four sequential agents**. Each agent has a single, well-defined job. No content may skip a stage.

```
User Request
     │
     ▼
┌─────────────────────────────┐
│  AGENT 1: Project Manager   │ ◄──── Receives rewrite requests from Agent 4
│  Scopes, plans, delegates   │
└────────────┬────────────────┘
             │ Brief + Scope Doc
             ▼
┌─────────────────────────────┐
│  AGENT 2: Content Builder   │ ◄──── Receives fix requests from Agent 3
│  Writes the actual JSON/MD  │
└────────────┬────────────────┘
             │ Draft content
             ▼
┌─────────────────────────────┐
│  AGENT 3: QA Reviewer       │
│  Vocab, tagging, structure  │──── FAIL → back to Agent 2 with annotated diff
└────────────┬────────────────┘
             │ QA-approved draft
             ▼
┌─────────────────────────────┐
│  AGENT 4: Consistency Check │
│  Natural language, scope,   │──── FAIL → back to Agent 1 with rewrite notes
│  skill progression          │
└────────────┬────────────────┘
             │ Final approved content
             ▼
        Write to repo
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
- **Compound discovery.** When scoping vocabulary for a new lesson, search the glossary for compounds that can be formed from the taught-kanji set. For each newly introduced kanji character, Grep for that character in the glossary's `"surface"` fields to discover existing compound words whose constituent kanji are all now taught. Flag any such compounds to the user as candidates for inclusion. This step ensures the lesson maximises use of newly-unlocked vocabulary.
- **Scope review gate.** Before dispatching to Agent 2, audit the proposed vocabulary list for cohesion. Ask: do these items naturally belong together in one lesson? If a cluster of time-expression words (e.g. 今朝/今晩/先月) or compound vocab is only partially introduced, either include the full cluster or defer all of it to a later lesson. Never split a natural vocabulary group across lessons unless there is a clear pedagogical reason. Note any deferred items in the Content Brief's Rewrite Notes field.
- **Grammar lesson scoping (GRAMMAR_CONTENT.md required).** For any grammar lesson (G1–G23), Agent 1 must read the relevant entry in `GRAMMAR_CONTENT.md` before building the Content Brief. The "What to teach" and "Recommended sections" fields in that entry define the locked scope. Do **not** infer grammar points from the lesson title or general knowledge — the spec is the only authoritative source. Missing a grammar point from the spec (as happened with でしょう in G8 and てください/なさい in G7) is a scope failure that all four agents will propagate unchecked.
- **Grammar scope lock.** For grammar lessons, the Content Brief's "Grammar points" list is a **locked scope**. Agent 2 may not add, remove, or substitute grammar points. If Agent 2 encounters a problem building content for a listed grammar point (e.g., the available vocabulary cannot support good examples), Agent 2 must flag this in the CB Checklist and return to Agent 1 for a scope adjustment — not silently swap in a different grammar point. Agent 1 documents any scope changes in the "Rewrite notes" field before redispatching.
- **Grammar prerequisite validation.** Before finalizing the Content Brief, Agent 1 must verify that every grammar point listed can be taught given the `unlocksAfter` lesson. Ask: "Has the student been exposed to the concepts needed to understand this grammar point?" If not, defer the point to a later grammar lesson and note the deferral in the brief. Consult the prerequisite table in Agent 4's Grammar Scope Enforcement section.
- **Grammar reinforcement planning.** Before finalizing the Content Brief, Agent 1 must consult the [Grammar Reinforcement Requirements](#grammar-reinforcement-requirements) schedule and identify: (a) which grammar milestones are in their **active reinforcement window** for this lesson, and (b) which milestones are in **sustained use**. List the specific reinforcement targets in the Content Brief. Plan at least 1 warmup item that exercises the most recently unlocked grammar using prior-lesson vocabulary. If the lesson's theme naturally supports certain grammar patterns (e.g. a travel theme supports ～たいです for desires, ～てください for requests), note these opportunities in the brief.
- **Register planning.** Before finalizing the Content Brief, Agent 1 must consult the [Register Requirements](#register-requirements-polite-vs-casual) schedule and determine how many casual conversations the lesson needs. For N5.10+ lessons, plan which conversations will be casual by assigning informal contexts (friends, family, close peers). For lessons before N5.10, confirm register = 100% polite. Include the register plan in the Content Brief.

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

**Trigger:** Receives a Content Brief from Agent 1.

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

**CB Checklist (Agent 2 self-check before passing to Agent 3):**

```
CB CHECKLIST
════════════
[ ] Verified all needed vocab IDs via targeted Grep queries (not full glossary read)
[ ] Every character name in jp fields has the correct char_* ID in its terms array (see Character Name Tagging)
[ ] No char_* ID is used that is not registered in shared/characters.json
[ ] Every kanji used is in the taught-kanji set
[ ] For every word with a `matches` field in the glossary: verified the jp text uses the correct writing form for the current lesson tier — if any kanji in the glossary `surface` is untaught, the hiragana/partial-kanji form from `matches` was used instead (e.g. いっしょに not 一緒に, だいじょうぶ not 大丈夫, until their kanji are taught)
[ ] Every content word in every jp/passage field has a corresponding terms entry
[ ] Every pure-kana lexical word (interjections, casual words, expressions not in particles.json) has a verified glossary entry — any that do not are listed in the CB Checklist under "Unregistered words" for Agent 3 to escalate
[ ] Verbs/adjectives use { "id": "...", "form": "..." } objects, never bare strings
[ ] No invented IDs — every ID was verified against the glossary or particles.json
[ ] Conversation/reading terms use v_* vocab entries, NOT k_* kanji entries
[ ] が after a clause-final form (ます/です/plain form) is tagged p_ga_but, not p_ga (see disambiguation rules)
[ ] から after a verb/adjective/です is tagged p_kara_because, not p_kara (see disambiguation rules)
[ ] けど is tagged p_kedo (not untagged)
[ ] Sentence-initial でも is tagged p_demo_but, not p_demo (see disambiguation rules)
[ ] と after a closing 」or after a plain-form clause with 思う/知る is tagged p_to_quote, not p_to (N5.13+)
[ ] VocabList covers every glossary+particles.json entry with lesson_ids = this lesson
[ ] Counter references use { "counter": "...", "n": N } format
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
[ ] (Compose) Prompt count matches level guidelines (2-3 early N5, scaling to 7-10 late N4)
[ ] (Stories) Every particle with a p_* entry in particles.json with introducedIn ≤ lesson scope is tagged in terms.json
[ ] (Stories) g_desu (です) is tagged in terms.json when the story uses です
[ ] (Stories) terms.json keys match exactly how each word appears in story.md (including kana-only spellings of words with untaught kanji)
[ ] (Stories) No particle or copula occurrence is left untagged / unclickable
```

---

### AGENT 3 — QA Reviewer (QA)

**Trigger:** Receives draft output from Agent 2 (plus the original Content Brief).

**Responsibilities:**
- Perform a systematic line-by-line audit. Do **not** skim.
- For every `jp` or passage sentence: tokenize the **full surface string** — not just kanji-containing words. For every lexical token (noun, verb, adjective, adverb, particle, conjunction, copula, sentence-final particle), verify it is either (a) tagged in `terms` with a matching ID, or (b) a permissible untagged pure-kana function word that has **no glossary entry**. Kana-only connectors and particles (e.g. でも, だから, だって, よ, ね, か) must be verified against `shared/particles.json` for their `introducedIn` lesson — do **not** assume they are permissible just because they are written in kana.
- For every `terms` entry: verify the ID exists in the glossary (cross-reference the glossary file). Then verify the **surface form** of that glossary entry matches (or inflects from) the actual token in the `jp` field. A surface mismatch — e.g. tagging `だ` with `g_desu` whose glossary surface is `です` — is a **hard fail** even if the ID exists.
- For every verb/adjective term entry: verify the `form` string is a valid key in `conjugation_rules.json`.
- Verify all kanji in `jp` fields appear in the taught-kanji set (from `manifest.json`).
- **Glossary-surface writing-form check.** For every word used in `jp` text, look up its glossary entry and check whether its `surface` field contains any kanji that are **not** in the taught-kanji set. If so, the word must appear in the hiragana/partial-kanji form from its `matches` field — never in the full-kanji `surface` form. This check catches cases like 一緒に (surface) written in jp text when the glossary's `matches` form is いっしょに and 緒 is not yet taught, or 大丈夫 written when だいじょうぶ is the required form. Grep the glossary for the word's ID, read both `surface` and `matches`, then verify the jp text uses the form consistent with the current taught-kanji set. Any mismatch is a **hard fail**.
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

**Trigger:** Receives QA-approved draft from Agent 3.

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
   | て-form usages (ている, てください) | て-form construction — needs G7 or equivalent |
   | Conditional forms (ば, たら, と, なら) | Plain form conjugation — needs G9 |
   | Passive / causative | Plain negative formation (あ-column shift) — needs G9 |
   | Potential form | Verb type identification — needs G5 |

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
Scope violation     | grammarRule "rule_nominalization" teaches なんです; not in Content Brief; prerequisite G2 (の) not yet available
Prerequisite gap    | Conditional ～たら requires plain form knowledge (G9); current lesson unlocks after N5.5
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
   | `desire_tai`, `desire_tai_negative`, `polite_volitional_mashou` | N5.8 | N5.8+ |
   | `plain_volitional` | G9 | N5.10+ |
   | `plain_negative`, `plain_past_negative` | N5.9 | N5.9+ |
   | `polite_past_adj`, `adverbial` | N5.10 | N5.10+ |
   | `plain_past_adj`, `plain_desire_tai`, `plain_appearance_sou` | G9 | N5.10+ |
   | `appearance_sou` | N5.11 | N5.11+ |
   | `potential`, `potential_negative` | N4.3 | N4.3+ |
   | `tari_form`, `nagara_form` | N4.10 | N4.10+ |
   | `sugiru_form` | G15 | N4.5+ |
   | `conditional_ba` | G20 | N4.25+ |
   | `conditional_tara` | N4.25 | N4.25+ |
   | `passive`, `causative` | N4.31 | N4.31+ |

2. **Structural grammar pattern scan.** Beyond tagged conjugation forms, scan the `jp` surface text for structural grammar patterns that imply knowledge of specific forms even when the individual verb tags might look in-scope. Common patterns to flag:

   | Pattern in `jp` text | Requires | Example violation |
   |---|---|---|
   | ～ている / ～ています | `te_form` (N5.5+) | Using ～ています in N5.3 content |
   | ～てください | `te_form` (N5.5+) | Using ～てください in N5.4 content |
   | ～たり～たりする | `tari_form` (N4.10+) | Using ～たりします in N4.8 content |
   | ～ながら | `nagara_form` (N4.10+) | Using ～ながら in N4.5 content |
   | ～たら | `conditional_tara` (N4.25+) | Using ～たら in N4.20 content |
   | ～ば / ～ければ | `conditional_ba` (G20 / N4.25+) | Using ～ば in N4.20 content |
   | ～すぎる | `sugiru_form` (G15 / N4.5+) | Using ～すぎます in N4.3 content |
   | ～られる (passive) | `passive` (N4.31+) | Using ～られます in N4.25 content |
   | ～させる (causative) | `causative` (N4.31+) | Using ～させます in N4.25 content |
   | ～たいです | `desire_tai` (N5.8+) | Using ～たいです in N5.6 content |
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
Grammar usage       | Reading passage contains ～たいです pattern (desire_tai, N5.8+) in N5.6 content
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

   **Note on G7/G8 boundary:** てください and て-connector are G7 patterns (reinforce from N5.6+). ています, たいです, and ましょう are G8 patterns (reinforce from N5.9+ only). Do not flag the absence of ています in N5.6–N5.8 content — ている is not formally taught until G8.

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
- **Per-prompt vocab pools.** Each prompt has its own `vocabPool` — a curated subset of lesson vocabulary relevant to that prompt. Include historical vocab (from prior lessons) that fits the theme, not just new-lesson words.
- **Targets.** Vocabulary the student **must** use to unlock the next prompt. Each `id` must exist in the glossary. `count` is how many times it must appear (usually 1). Target only kanji-containing vocabulary — coverage scoring is kanji-based.
- **Model sentences.** Each prompt includes a `model` showing one valid composition. The UI lets students toggle this on/off. Models must use only taught kanji and approved vocabulary.
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
| `potential` | ～られる / ～える |
| `potential_negative` | ～られません |
| `adverbial` | ～く / ～に |
| `desire_tai` | ～たいです (polite desire) |
| `plain_desire_tai` | ～たい (plain desire — casual speech and subordinate clauses) |
| `appearance_sou` | ～そうです (polite appearance) |
| `plain_appearance_sou` | ～そうだ (plain appearance — casual speech) |
| `polite_volitional_mashou` | ～ましょう |
| `plain_volitional` | ～おう / ～よう (plain "let's" / intention) |
| `conditional_ba` | ～ば / ～ければ |
| `tari_form` | ～たり (listing representative actions: ～たり～たりする) |
| `polite_negative_te` | ～ないで (negative te-form: "without doing"; ないでください = "please don't") |
| `desire_tai_negative` | ～たくない / ～たくないです (don't want to) |
| `sugiru_form` | ～すぎる (too much / excessively — verbs and adjectives) |
| `nagara_form` | ～ながら (while doing — simultaneous actions) |
| `conditional_tara` | ～たら / ～だったら (if / when — completed-action conditional) |
| `passive` | ～られる / ～れる (passive — being acted upon) |
| `causative` | ～させる / ～せる (causative — making/letting someone do) |

**Unlock schedule.** Each form is available from the grammar lesson that formally teaches it. The `introducedIn` field in `conjugation_rules.json` records this, using grammar lesson IDs (e.g. `"G6"`) or content lesson IDs (e.g. `"N5.1"`). All 25 forms have this field. Similarly, particles in `shared/particles.json` carry an `introducedIn` field using lesson or grammar IDs.

**Godan euphonic note.** `tari_form` and `conditional_tara` use `godan_euphonic` map types (`"map": "tari_form"` and `"map": "tara_form"`) that parallel `ta_form` but produce たり/だり and たら/だら endings respectively. The rendering engine will need these map types added alongside any future grammar module build. All ichidan, irregular, and adjective rules are fully defined in data and require no code changes.

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

`p_ga_but` is available from G9. Before G9, all が in content should be `p_ga` (subject marker) — if が appears as "but" before G9, it is an out-of-scope grammar violation.

### から (kara) — "from" vs "because" disambiguation

から has two **distinct grammatical roles**:

| Context | Role | Tag | Examples |
|---|---|---|---|
| After a noun (starting point) | "From" | `p_kara` | 東京**から**、月曜日**から** |
| After a clause-final verb/adjective/です (gives reason) | "Because" | `p_kara_because` | おいしい**から**食べます、高いです**から**買いません |

**Disambiguation rule — what precedes から determines role:**

- **から after a noun** (place, time, person) → `p_kara` ("from")
- **から after a verb/adjective/です** (clause ending) → `p_kara_because` ("because")

`p_kara_because` is available from G9. Before G9, all から should be `p_kara` ("from"). If から appears as "because" before G9, it is an out-of-scope grammar violation.

**Note:** `p_kara` ("from") was introduced in G3/N5.2. The GRAMMAR_CONTENT.md spec for G9 explicitly states: "Note: から was taught in G3 as a starting-point particle ('from'). This is a different role — teach the distinction explicitly."

### けど (kedo) — casual "but"

けど is a casual clause-linking conjunction ("but") introduced in G9. It has no other grammatical role, so no disambiguation is needed. Tag all instances as `p_kedo`.

けれど is a slightly more formal variant of けど. Both are tagged as `p_kedo`.

### でも (demo) — "even/any~" vs sentence-initial "but"

でも has two distinct roles depending on position:

| Context | Role | Tag | Available from |
|---|---|---|---|
| After a noun ("even X") or in compounds (何でも, いつでも) | Inclusive particle "even / any~" | `p_demo` | N4.14 |
| At the start of a sentence ("But..." / "However...") | Conjunction "but" | `p_demo_but` | G18 |

**Disambiguation rule — position determines role:**

- **でも after a noun** → `p_demo` (子どもでもわかる = "even a child understands")
- **でも at the start of a sentence/clause** → `p_demo_but` (でも、行きます = "But I'll go")

### と (to) — connective vs quotation disambiguation

と has two **completely distinct grammatical roles** that share the same surface form:

| Context | Role | Tag | Available from |
|---|---|---|---|
| Between nouns (A and B) or with action verbs (do X with Y) | Connective "and / with" | `p_to` | N5.2 |
| After quoted speech or thought content (「...」と) | Quotation marker | `p_to_quote` | N5.13 |
| After a plain-form verb/adjective expressing automatic result (AとB) | Conditional "if/when → natural result" | `p_to_conditional` | G20 (N4.25+) |

**Disambiguation rule — what precedes と determines role:**

- **と between/after nouns** → `p_to` (レンとミキ = "Ren and Miki")
- **と after a closing 」quotation mark** → `p_to_quote` (「おいしい」と言いました = said "it's delicious")
- **と after a plain-form clause with 思う/知る** → `p_to_quote` (いいと思います = "I think it's good")
- **と after a plain-form clause expressing automatic/natural result** → `p_to_conditional` (ボタンを押すと開く = "push the button and it opens") — **hard blocker before G20**

Before N5.13, と appears only as `p_to`. From N5.13, `p_to` and `p_to_quote` are both in scope. `p_to_conditional` is not available until G20 (N4.25+) — any sentence using the AとB natural-result pattern (including wishful expressions like あるといいね) before G20 is an out-of-scope grammar violation and must be rewritten. Tagging quotation と as `p_to` displays "and / with" when the student taps it, which is actively misleading.

### Counter references

When a counter expression appears in a `terms` array:

```json
{ "counter": "nin", "n": 4 }
```

Valid counter keys: `ji`, `fun`, `hon`, `mai`, `ko`, `hiki`, `hai`, `satsu`, `nin`, `dai`, `kai`, `sai`, `nen`, `kagetsu`, `shu`, `tsu`, `gatsu`

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
  "portrait": "references/pixel_characters/rikizo_head.png",
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

| Character | ID | Surface | Matches |
|---|---|---|---|
| Rikizo | `char_rikizo` | `りきぞ` | `["りきぞう"]` |
| Yamakawa | `char_yamakawa` | `やまかわ` | `[]` |
| Yamamoto-sensei | `char_yamamoto` | `やまもと` | `["やまもとせんせい"]` |
| Ken | `char_ken` | `けん` | `[]` |
| Yuki | `char_yuki` | `ゆき` | `[]` |
| Miku | `char_miku` | `ミク` | `[]` |
| Riku | `char_riku` | `リク` | `[]` |
| Lee | `char_lee` | `リー` | `["リーさん"]` |
| Taro | `char_taro` | `たろう` | `[]` |
| Sakura | `char_sakura` | `さくら` | `[]` |

**Adding a new character:** Add the entry to `shared/characters.json` and register it in this table. Do not invent a `char_*` ID that is not in this table — the ID must match the registry.

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
| `v_namae` | 名まえ | N5.1¹ | 名前 | N5.9 |
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

¹ `v_namae` has `lesson_ids=N5.9`. It is not on the early-use list — agents may only use it from N5.9 onward, at which point both kanji (名 and 前) are taught and the full form 名前 should be used.

**Writing form decision rule:** For any word with a `matches` field, check whether ALL kanji in the surface are in the taught-kanji set for the current lesson. If yes, use the full kanji surface. If no, use the partial-kanji or hiragana form from `matches` that matches the available kanji.

### Maintaining these lists

- **Adding to the early-use list** requires user approval. Do not add words without explicit permission — the list is intentionally small (essential pronouns, question words, and high-frequency words only).
- **Adding partial-kanji entries** happens naturally when a compound word's constituent kanji are taught in different lessons. Agent 1 should check for this during scoping and ensure the `matches` field includes the appropriate partial form.
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
| N5.8 | `desire_tai`, `desire_tai_negative`, `polite_volitional_mashou` |
| N5.9 | `plain_negative`, `plain_past_negative` |
| G9 (N5.10+) | `plain_volitional`, `plain_desire_tai`, `plain_past_adj`, `plain_appearance_sou` |
| N5.10 | `polite_past_adj`, `adverbial` |
| N5.11 | `appearance_sou` |
| N4.3 | `potential`, `potential_negative` |
| N4.10 | `tari_form`, `nagara_form` |
| G15 (~N4.5) | `sugiru_form` |
| G20 (~N4.25) | `conditional_ba` |
| N4.25 | `conditional_tara` |
| N4.31 | `passive`, `causative` |

Before N5.5, only `polite_adj` and dictionary forms are available. This means N5.1–N5.4 content is limited to noun-です sentences, い-adjective+です sentences, and verbs in dictionary form. Plan sentences accordingly.

---

## Grammar Reinforcement Requirements

The prerequisite rules above define when a grammar form **may** be used (the ceiling). This section defines when a grammar form **should** be used (the floor). Without both rules, content can technically pass all QA gates while never actually practicing the grammar students have learned — defeating the purpose of teaching it.

### The reinforcement principle

> Once a grammar form is unlocked, subsequent content must **actively use** it. Students learn through repeated, natural exposure — not by seeing a form once in a grammar lesson and never encountering it again.

### Grammar milestones and reinforcement schedule

Each milestone groups forms that unlock together. The **active reinforcement window** is the 2–3 lessons immediately after unlock, where minimum usage counts apply. After the window, forms enter **sustained use** where complete absence is flagged.

**Important — grammar lessons vs content lessons.** Grammar lessons (G1–G23) teach concepts and unlock after specific content lessons. The reinforcement schedule must respect this: a form may be *mechanically available* (its `introducedIn` lesson has passed) before the grammar lesson that *formally teaches the concept* has unlocked. For example, `te_form` is available from N5.5, and G7 (て-form mechanics + てください preview) unlocks after N5.5, but G8 (ている progressive, たいです, ましょう) doesn't unlock until after N5.8. The schedule below groups milestones by the grammar lesson that teaches them, not just the conjugation form availability.

| Milestone | Available from | Active window | Required patterns (per lesson, across convs + readings) | Sustained use (after window) |
|---|---|---|---|---|
| **Polite verbs** (G6) | N5.5 | N5.6–N5.7 | ≥3 `polite_masu`, ≥2 `polite_mashita`, ≥1 `polite_negative` or `polite_past_negative` | All four polite verb forms appear regularly; no lesson should use only ます/ました |
| **Te-form as connector + requests** (G7) | N5.5 | N5.6–N5.7 | ≥1 `てください` request, ≥1 te-form sequential connector (AてB) | てください appears naturally where context calls for requests; て as connector used in multi-action sentences |
| **Progressive + desire + volitional** (G8) | N5.8 | N5.9–N5.10 | ≥1 `ている/ています` progressive or state, ≥1 `～たいです` desire expression, ≥1 `～ましょう` suggestion/invitation | All three patterns appear where thematically appropriate |
| **Plain negative** (G9) | N5.9 | N5.10–N5.11 | ≥1 `～ない` or `～なかった` in context (reading, drill, or natural dialogue) | Plain negatives appear in varied contexts; not limited to drills |
| **Adj past + adverbial** (G10) | N5.10 | N5.11–N5.12 | ≥1 past-tense adjective (`polite_past_adj`), ≥1 adverbial form (`adverbial`) | Both used naturally in descriptions and narratives |
| **Appearance** (G11) | N5.11 | N5.12–N5.13 | ≥1 `～そうです` appearance pattern | Appears where observations or impressions are natural |
| **Potential** (G12) | N4.3 | N4.4–N4.6 | ≥1 potential form (affirmative or negative) | Ability/possibility expressions used where natural |
| **Comparison + degree** (G15) | N4.5 | N4.6–N4.8 | ≥1 `より` comparison, ≥1 `いちばん` superlative or `ほど` degree pattern | Comparison/degree expressions appear where natural (describing preferences, rankings, qualities) |
| **Tari + nagara** (G17) | N4.10 | N4.11–N4.13 | ≥1 `～たり～たりする` listing, ≥1 `～ながら` simultaneous action | Both patterns appear where natural |
| **Excessive degree + noun form** (G15) | N4.5 | N4.6–N4.8 | ≥1 `～すぎる` excessive expression | ～すぎる appears where overabundance or excess is natural (eating too much, too expensive, too noisy) |
| **Limiting particles** (G16) | N4.14 | N4.15–N4.17 | ≥1 `だけ` or `しか～ない` limiting expression | Limiting particles appear where context calls for restriction or exclusion |
| **Permission + prohibition** (G19) | N4.20 | N4.21–N4.23 | ≥1 `てもいい` permission or ≥1 `てはいけない` prohibition | Both patterns appear where rules, permissions, or social norms are discussed |
| **Conditionals** (G20) | N4.25 | N4.26–N4.28 | ≥1 `～たら` or `～ば` conditional in conversation or reading | At least one conditional form (たら or ば) appears where natural |
| **Passive + causative** (G21/G22) | N4.31 | N4.32–N4.34 | ≥1 passive, ≥1 causative across the lesson | Both voice patterns appear where natural |
| **Auxiliary compounds** (G23) | N4.34 | N4.35–N4.36 | ≥1 `てみる` (try) or `ておく` (prepare) or `てしまう` (complete/regret) | Auxiliary verb compounds appear where experimentation, preparation, or completion is discussed |

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
| `Verb-てください` (polite request) | G7 | N5.6+ | Use in at least 1 conversation per lesson. Natural contexts: giving directions, asking for help, making requests. |
| `Verb-て Verb` (sequential connector) | G7 | N5.6+ | Use in at least 1 multi-action sentence per lesson. Natural contexts: describing routines, narrating sequences. |
| `Verb-ないでください` (negative request) | G7 | N5.6+ | Use occasionally. Natural contexts: classroom rules, polite prohibitions. Should not be absent across 3+ consecutive lessons. |
| `Verb-ている/ています` (progressive/state) | G8 | N5.9+ | Use in at least 1 conversation or reading per lesson. Natural contexts: describing ongoing actions, states (住んでいます, 知っています). **Note:** te_form is mechanically available from N5.5, but ている as a *concept* is taught in G8 (unlocks after N5.8). Do not require ている in N5.6–N5.8 content. |
| `Verb-たいです` (desire) | G8 | N5.9+ | Use in at least 1 conversation per lesson. Natural contexts: discussing plans, preferences, wishes. |
| `Verb-ましょう` (let's/shall we) | G8 | N5.9+ | Use in at least 1 conversation per lesson. Natural contexts: making plans together, suggestions, invitations. |
| `Verb-たり Verb-たりする` (listing actions) | G17 | N4.11+ | Use in at least 1 conversation or reading per lesson. Natural contexts: describing weekends, hobbies, routines. |
| `Verb-ながら` (while doing) | G17 | N4.11+ | Use occasionally. Natural contexts: multitasking descriptions, daily routines. |
| `～すぎる` (excessive degree) | G15 | N4.6+ | Use occasionally. Natural contexts: eating too much, too expensive, too loud, overwork. |
| `～ば / ～ければ` (ba conditional) | G20 | N4.26+ | Use occasionally. Natural contexts: general conditions, advice, logical consequences. |
| `～たら` (if/when conditional) | G20 | N4.26+ | Use in at least 1 context per lesson. Natural contexts: plans, hypotheticals, advice. |
| `Verb-てもいい` (permission) | G19 | N4.21+ | Use occasionally. Natural contexts: asking permission, stating what's allowed. |
| `Verb-てはいけない` (prohibition) | G19 | N4.21+ | Use occasionally. Natural contexts: rules, warnings, social norms. |
| `Verb-てみる` (try doing) | G23 | N4.35+ | Use occasionally. Natural contexts: trying new foods, experiences, suggestions. |
| `Verb-ておく` (prepare/do in advance) | G23 | N4.35+ | Use occasionally. Natural contexts: planning ahead, preparations. |
| `Verb-てしまう` (completion/regret) | G23 | N4.35+ | Use occasionally. Natural contexts: accidents, finishing something, unintended results. |

**Non-conjugation patterns (particle-based and structural grammar):**

| Pattern | Taught in | Particles/tracking | Reinforce from | How to reinforce |
|---|---|---|---|---|
| `X の方が Y より ～` (comparison) | G15 | `p_yori` | N4.6+ | Use in at least 1 context per lesson. Natural contexts: comparing food, places, seasons, preferences. |
| `X で いちばん ～` (superlative) | G15 | `v_ichiban` (vocab) | N4.6+ | Use occasionally alongside comparison. Natural contexts: "the most ～ in ～". |
| `X は Y ほど ～ない` (negative degree) | G15 | `p_hodo` | N4.6+ | Use occasionally. Natural contexts: "X is not as ～ as Y". |
| `～だけ` (only/just) | G16 | `p_dake` | N4.15+ | Use occasionally. Natural contexts: limitations, quantities. |
| `～しか～ない` (nothing but) | G16 | `p_shika` | N4.15+ | Use occasionally. Natural contexts: scarcity, emphasis on limits. |
| `～ので` (because — polite) | G17 | `p_node` | N4.11+ | Use occasionally as an alternative to から. Natural contexts: giving reasons in polite speech. |

### Reinforcement in warmups

Warmup items are an ideal place to reinforce recently-unlocked grammar because they draw exclusively from prior-lesson vocabulary. Agent 1 should plan warmup items that exercise the most recently unlocked grammar milestone. For example:

- N5.6–N5.7 warmups should include at least 1 item using G7 patterns (てください requests, て-connector sequences) with N5.1–N5.5 vocabulary
- N5.9–N5.10 warmups should include at least 1 item using G8 patterns (ています, ～たいです, or ～ましょう) with prior vocabulary
- N5.10–N5.11 warmups should include at least 1 item using plain negative forms with prior vocabulary
- N4.6–N4.8 warmups should include at least 1 item using comparison patterns (より, いちばん) with prior vocabulary

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

> G9 (plain forms & basic connectors) formally teaches when and how to use casual speech — with friends, family, and in relaxed settings. From the first content lesson after G9 unlocks (**N5.10**), lessons must include casual conversations to reinforce plain forms, connectors, and commands/prohibition in natural context. The majority of content remains polite to maintain the student's strongest register.

### Register schedule by lesson range

| Lesson range | Casual conversations per lesson | Register balance | Notes |
|---|---|---|---|
| N5.1–N5.9 | 0 | 100% polite | G9 not yet available. All conversations use です/ます register. |
| N5.10–N5.13 | 1 | ~75% polite, ~25% casual | First casual conversations. Keep them simple — friends/family contexts. |
| N5.14–N5.18 | 1–2 | ~60% polite, ~40% casual | Expand casual contexts: classmates, siblings, close colleagues. |
| N4.1–N4.18 | 2 | ~50% polite, ~50% casual | Balanced exposure. Casual in personal contexts, polite in service/formal contexts. |
| N4.19–N4.36 | 2–3 | ~50% polite, ~50% casual | Same balance. Context drives register, not a fixed ratio. |

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

Focus on these patterns first — they are the core G9 concepts:

| Pattern | Example | Priority |
|---|---|---|
| Plain negative (～ない) | 食べない、行かない、わからない | High — core G9 |
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
- [ ] Every verb/adjective `terms` entry uses `{ "id": "...", "form": "..." }` with a valid form string
- [ ] Every `form` value in `terms` has `introducedIn` ≤ current lesson in `conjugation_rules.json` (see [Grammar Usage Prerequisite Rules](#grammar-usage-prerequisite-rules))
- [ ] No structural grammar pattern (～ている, ～てください, ～たり～たりする, ～ましょう, etc.) appears in `jp` text before its constituent form is available
- [ ] Active-window grammar reinforcement minimum counts are met (count tagged forms across conversations + readings; see [Grammar Reinforcement Requirements](#grammar-reinforcement-requirements))
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
- [ ] (Compose) Particles are gated — every particle ID has `introducedIn` ≤ current lesson
- [ ] (Compose) Conjugation examples are linguistically correct (especially irregular forms)
- [ ] (Compose) Conjugations use polite register only (unless lesson teaches casual speech)
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
| `GRAMMAR_CONTENT.md` | **Grammar lessons only** — authoritative scope for each G-lesson's grammar points, required sections, and vocabulary context. Agent 1 must read the relevant G-lesson entry before building any grammar Content Brief. Do not infer grammar scope from the lesson title alone. |

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

After writing new files, `manifest.json` must be updated. Lessons get an entry under `data.N5.lessons` or `data.N4.lessons`. Stories get an entry under `data.N5.stories` or `data.N4.stories`. Reviews get an entry under `data.N4.reviews`. Compose files get an entry in the `compose` array: `{ "lesson": "N5.X", "file": "data/N5/compose/compose.N5.X.json" }`.

---

## Common Failure Modes

These are the most frequent errors. All agents should be alert to them.

### Agent 2 failures (caught by Agent 3)

1. **Using kanji from a later lesson** — most common with compound words. Always check every character individually.
2. **Bare string for a verb** — `"v_iku"` instead of `{ "id": "v_iku", "form": "te_form" }` when the verb is conjugated.
3. **Missing a term entirely** — a kanji word in the `jp` field with no corresponding entry in `terms`.
4. **Fabricated IDs** — writing `"v_toshokan"` without verifying it exists in the glossary.
5. **Wrong form label** — using `"past"` when the correct string is `"plain_past"` or `"polite_mashita"`.
6. **Drill 1 with terms array** — the first vocabulary drill must not have `terms`.
7. **Using a kanji entry (`k_*`) in conversation or reading `terms`** — `k_*` entries only power the kanjiGrid display and will not produce clickable spans in conversations or readings. Any word that needs to be tappable in a conversation or reading line must have a corresponding `type: "vocab"` entry (`v_*`). Family terms are the most common case: 父, 母, 兄, 姉, etc. each need both a kanji entry for the grid and a vocab entry for content tagging.
8. **Incomplete vocabList** — omitting particles, set phrases, or grammar items introduced in this lesson. The vocabList must cover every glossary entry marked `lesson_ids = this lesson`, not just the headline nouns and verbs.
9. **Warmup items using new-lesson vocabulary or kanji** — warmup must reinforce prior lessons only. Any item whose `jp` field contains a new-lesson kanji, or whose `terms` reference a new-lesson vocab ID, is invalid and must be rewritten using N5.1 (or earlier) material.
9b. **Wrong warmup item count** — warmup sections must have exactly 4 items, no more and no fewer. Agent 3 must reject any warmup with fewer than 4 items as a hard fail.
10. **Too few conversations** — conversation count must match the reference template lesson (highest-numbered existing lesson of same type/level). Fewer than the template is a hard fail that Agent 3 must catch.
11. **Missing standalone noun v_* entry for a newly taught kanji** — if a kanji is to be used as a standalone noun in lesson content (e.g. 水 for water, 木 for tree), verify that a `type: "vocab"` entry with a matching `lesson_ids` exists before using it in a `jp` field. If it does not exist, create it and add it to the vocabList before building the content.
12. **Missing meta.kanji array** — the lesson `meta` object must include `"kanji": [...]` listing the characters introduced in this lesson.
13. **Missing scramble alts for flexible word order** — when a scramble sentence contains a time expression (毎日, 今日, 昨日, etc.) or frequency adverb (いつも, よく, etc.) that can naturally appear sentence-initially or after the topic, an `alts` array must be provided. Omitting alts means a valid student answer is marked wrong.
14. **Missing explanation on review drill items** — every MCQ and scramble item in reviews must include an `explanation` field. This is a hard requirement; omitting it means the student gets no feedback.
15. **Missing instructions on review sections** — every review section must include an `instructions` field describing the task.
16. **Flat conversation structure in reviews** — review conversations must use the `items[]` wrapper array with per-item `title`, `context`, `lines`, `question`, `choices`, `answer`, `explanation`. Do not use the flat lesson-style conversation structure.
17. **Missing distractors on scramble items** — scramble items must include a `distractors` array with 3 plausible wrong segments (wrong particles, transitive/intransitive confusions, similar words from the same lesson range).
18. **ID surface mismatch** — tagging a word with an ID whose glossary `surface` field does not match the token being tagged. Example: tagging `だ` or `だった` with `g_desu` (which has `surface: "です"`). The ID exists and the checklist item "ID exists in glossary" passes — but the tagged entity is semantically wrong. Always look up the `surface` value of each ID and confirm it matches the actual text in the sentence.
19. **Out-of-scope word in `jp` text, absent from `terms`** — a word appears in the `jp` surface string but is never added to `terms` because it "looks like" a common particle or connector. If that word has a glossary entry with an `introducedIn` or `lesson_ids` value, it must be tagged, and its lesson must be in scope. Example: `でも` (`p_demo`, `introducedIn: "N4.14"`) used in a G1 conversation is an out-of-scope scope violation — but scope checks that only scan `terms` IDs will miss it entirely because it was never tagged at all. Scanning `jp` surface tokens, not just `terms` arrays, is required.
20. **(Compose) Ungated particles** — including a particle in the `particles` array whose `introducedIn` is later than the compose file's lesson. Check every particle ID against `shared/particles.json`.
21. **(Compose) Plain forms in conjugations** — including だ, だった, or other plain-form patterns when the lesson hasn't taught casual speech. Compositions should stay in polite/formal register by default.
22. **(Compose) Incorrect irregular conjugation examples** — the most common error is showing いかったです instead of よかったです for the past of いい. All irregular forms (いい→よ stem) must be verified in every conjugation entry.
23. **(Compose) Disconnected prompts** — prompts should build one continuous composition, not jump between unrelated topics. Each prompt should extend the narrative from the previous one.
24. **(Compose) Targets using non-kanji vocabulary** — compose scoring is kanji-based. Target IDs should reference vocabulary that contains kanji so the coverage indicator works correctly.
25. **(Compose) VocabPool missing historical vocab** — each prompt's vocabPool should include relevant vocabulary from prior lessons, not just the current lesson's words. Students need connector words, common nouns, and adjectives from earlier lessons to write coherent text.
26. **Untagged character name** — a recurring character's name (e.g. りきぞ, やまかわ) appears in a `jp` field but the corresponding `char_*` ID is absent from `terms`. The name renders as plain unclickable text with no sakura pink highlight or portrait popup. Every occurrence in every conversation line and reading passage must be tagged. This is caught by Agent 3 when scanning jp surface tokens. The roster of registered character IDs is in the Character Name Tagging section and `shared/characters.json`.
27. **Invented `char_*` ID** — Agent 2 adds `char_yamakawa` to a terms array but `char_yamakawa` is not yet registered in `shared/characters.json`. The term modal silently fails to open. Before using any `char_*` ID, verify it exists in `shared/characters.json`. If it doesn't, add the character entry first (or flag to Agent 1 to add it before content is built).
28. **(Stories) Missing character name key in terms.json** — a character's name appears throughout `story.md` but no surface key for that name exists in `terms.json`. Add the name as a key (e.g. `"りきぞ": { "id": "char_rikizo", "form": null }`) — the story processor highlights every occurrence automatically. If the story uses two spellings (e.g. `りきぞ` and `りきぞう`), add both as separate keys pointing to the same `char_*` ID.
29. **(Stories) Missing particle/copula tags in terms.json** — particles (は, の, も, と, etc.) and g_desu (です) must be tagged in story terms.json so they are tappable, exactly as in lessons. Omitting them means function words are dead text the student cannot tap to look up. Every particle with a `p_*` entry in `shared/particles.json` whose `introducedIn` is ≤ the story's lesson scope must be included. The `"です"` key covers standalone copula occurrences; い-adjective predicative forms (e.g. `"うれしいです"`) are covered by their own longer key.
27. **Out-of-scope conjugation form** — using a conjugation form (e.g. `te_form`, `desire_tai`, `conditional_ba`) before its `introducedIn` lesson. This is the grammar equivalent of using an untaught kanji. Example: writing ～ています in N5.3 content when `te_form` has `introducedIn: "N5.5"`. Check every `form` value in `terms` against `conjugation_rules.json`. See [Grammar Usage Prerequisite Rules](#grammar-usage-prerequisite-rules).
28. **Out-of-scope structural grammar pattern** — the `jp` surface text contains a grammar construction (～ている, ～てください, ～ましょう, ～たり～たりする, etc.) before the constituent form is available, even if the individual word tags don't explicitly use that form. The pattern in the surface text is the violation, not just the tags. Agent 2 must scan `jp` strings for these patterns, not rely only on `terms` form checking.
29. **何 tagged as k_nani or generic v_nani without pronunciation context** — 何 has two pronunciations: **なに** (`v_nani`) and **なん** (`v_nan`). Using `k_nani` (kanji entry) makes 何 non-tappable in conversations and readings. Using only `v_nani` for all contexts gives students the wrong reading when the pronunciation is actually なん. **Rules:** Use `v_nani` when 何 precedes を or が, or stands alone (e.g. 何を食べますか、何がいい). Use `v_nan` when 何 precedes です, の, counters, or words starting with d/n/t sounds (e.g. 何ですか、何の本、何人). Never use `k_nani` in conversation, reading, or drill `terms` — it is only for the kanjiGrid. Compound words like 何人, 何時, 何曜日 have their own dedicated entries (`v_nannin`, `v_nanji`, `v_nanyoubi`) and should use those instead.
36. **後 tagged as v_ushiro regardless of meaning** — 後 has two completely distinct words: **後ろ** (`v_ushiro`, うしろ, spatial "behind") and **後** (`v_ato`, あと, temporal "after/later"). Unlike 何, the written form alone disambiguates them — no context rules needed. **Rule:** Token `後ろ` (with ろ) → `v_ushiro`. Token `後` standalone (no ろ) → `v_ato`. Using `v_ushiro` for temporal 後 is semantically wrong (it displays the wrong reading and meaning to the student). Never use `k_ushiro` in conversation, reading, or drill `terms` — it is only for the kanjiGrid. For 後で ("later"), tag as `v_ato` + `p_de`. Compounds using the on-reading (午後, 後半, etc.) have their own dedicated IDs.
37. **が tagged as p_ga regardless of role** — が has two completely distinct grammatical roles: subject marker (`p_ga`, N5.1) and clause connector "but" (`p_ga_but`, G9). They can appear in the same sentence: 「行きたいですが、お金がありません。」 — first が is "but" (`p_ga_but`), second が is subject marker (`p_ga`). Tagging the conjunctive が as `p_ga` displays "Subject marker" when the student taps it, which is actively misleading. **Rule:** が after a clause-final form (ます/です/plain form) → `p_ga_but`. が after a noun/pronoun → `p_ga`. See [が disambiguation](#が-ga--subject-marker-vs-clause-connector-disambiguation).
38. **から tagged as p_kara regardless of role** — から has two distinct roles: starting point "from" (`p_kara`, G3) and reason "because" (`p_kara_because`, G9). 「東京から来ました」uses p_kara (from). 「おいしいから食べます」uses p_kara_because (because). **Rule:** から after a noun → `p_kara`. から after a verb/adjective/です → `p_kara_because`. Tagging reason-から as p_kara displays "Starting-point marker" which is wrong. See [から disambiguation](#から-kara--from-vs-because-disambiguation).
39. **でも tagged as p_demo regardless of position** — でも has two roles: inclusive particle "even/any~" (`p_demo`, N4.14) and sentence-initial conjunction "but" (`p_demo_but`, G18). 「子どもでもわかる」= p_demo (even a child). 「でも、行きます」= p_demo_but (but I'll go). Tagging sentence-initial でも as p_demo displays "even / any~" which confuses the student. See [でも disambiguation](#でも-demo--evenany-vs-sentence-initial-but).
40. **と tagged as p_to regardless of role** — と has two completely distinct grammatical roles: connective "and/with" (`p_to`, N5.2) and quotation marker (`p_to_quote`, N5.13). 「レンとミキ」= p_to (and). 「おいしい」と言いました = p_to_quote (quotation). Before N5.13, と is always p_to. From N5.13, check what precedes と: after a 」closing mark or after a plain-form clause with 思う/知る → p_to_quote; between/after nouns → p_to. Tagging quotation と as p_to displays "and / with" when the student taps it, which is wrong. See [と disambiguation](#と-to--connective-vs-quotation-disambiguation).
30. **Grammar under-reinforcement (ます/ました monotony)** — all verbs in conversations and readings default to `polite_masu` or `polite_mashita` when negative forms, te-form, desire, and volitional forms are all available. This is the grammar equivalent of writing with a limited vocabulary — technically correct but failing to exercise the student's growing skillset. Example: an N5.7 lesson has 5 conversations with 20 tagged verbs, but 18 are ます/ました, zero are てください or ています despite te-form being available since N5.5. Agent 2 must consult the Grammar Reinforcement Requirements and vary verb forms intentionally.
31. **Missing structural patterns in active reinforcement window** — a lesson falls within a grammar milestone's active reinforcement window but none of the required structural patterns (てください, ています, たいです, ましょう, etc.) appear anywhere. This means the student has gone 2+ lessons since learning these patterns without encountering them in natural content. Agent 2 must include at least the minimum count of each pattern required by the reinforcement schedule.
32. **Warmup grammar stagnation** — warmup items continue using only noun-です patterns (「先生です」「大きいです」) long after polite verb forms, te-form, and other grammar have been unlocked. Warmups after N5.5 should exercise recently-unlocked grammar with prior-lesson vocabulary. Example: an N5.8 warmup should include items like 「先生は毎日学校に行きます」(polite_masu) or 「ここに名前を書いてください」(te-form request), not just 「これは本です」.
33. **Early-use word written in kanji before kanji is taught** — writing 私 in N5.1 content when the kanji 私 is not introduced until N4.3. Early-use words must be written in their hiragana form (わたし) until the kanji lesson. Similarly, partial-kanji words must use their partial form (大すき, not 大好き) until all constituent kanji are taught. See [Early-Use Vocabulary Rules](#early-use-vocabulary-rules).
34. **Early-use word written in hiragana after kanji is taught** — writing わたし in N4.5 content when the kanji 私 was introduced in N4.3. Once the kanji is available, the full kanji form must be used. Continuing to write hiragana after the kanji lesson is a missed learning opportunity.
35. **Using an early-use word before its "Use from" lesson** — using すき in N5.3 content when the early-use list says it is available from N5.7. The "Use from" lesson is a hard gate, not a guideline.
40. **Casual conversation before N5.10** — using plain forms in conversation dialogue before G9 has been taught. All conversations in N5.1–N5.9 must use polite register exclusively. A casual conversation in N5.8 is an out-of-scope grammar violation even if the individual plain forms are mechanically available.
41. **No casual conversation after N5.10** — a lesson at N5.10 or later with zero casual conversations. The register schedule requires at least 1 casual conversation from N5.10 onward. Omitting casual conversations means students never practice plain forms in natural dialogue.
42. **Register mixing within a conversation** — a character uses ます in one line and plain form in the next without an in-story reason. Each conversation must commit to one register throughout. Example failure: line 1 says 「今日は何を食べますか。」, line 2 responds 「ラーメン食べた。」 — the first speaker is polite, the second is casual, with no contextual justification.
43. **Mechanical register swap (です→だ find-and-replace)** — writing casual conversations by taking polite sentences and replacing です with だ and ます with dictionary form, without adjusting sentence structure, particle usage, or adding natural casual markers (よ, ね, な, けど, し). Casual Japanese has its own rhythm — it is not polite Japanese with different verb endings. Example failure: 「わたしは学生だ。日本語を勉強する。」 reads like a textbook, not a friend talking. Natural casual: 「おれ、学生だよ。日本語勉強してるんだ。」
44. **Overusing commands/prohibition** — packing ～ろ/～え commands and ～な prohibition into casual conversations where they don't belong. These forms are blunt/rude and used in narrow contexts (sports, male friends joking, warning signs, urgent situations). A casual conversation between friends discussing weekend plans should not have commands. Overuse makes the student think casual = aggressive.
45. **(Final Interactive Review) Missing sections** — a `final_interactive_review` draft that omits one or more of the 8 required sections. The most commonly dropped sections are `vocab_categories` and `kanji_bingo` because they come last and are easiest to run out of context budget for. All 8 sections are required regardless of file length. Agent 2 must check off each section type in the CB Checklist before handing off. Agent 3 must count sections and reject any draft with fewer than 8.

### Agent 3 failures (caught by Agent 4)

1. **Approving unnatural dialogue** — grammatically correct but no real speaker would say it.
2. **Approving overstuffed sections** — 30 vocabulary chips, 5 conversations, 4 readings in one lesson.
3. **Missing a grammar level jump** — content using grammar structures 2–3 tiers above the lesson. Now that conjugation forms have concrete `introducedIn` fields, this should be caught by Agent 3's hard gate. But Agent 4 remains the backstop for structural patterns in `jp` text that Agent 3's form-tag check might miss (e.g. a ～ている pattern where the て and いる are tagged separately but neither tag explicitly carries a form that triggers the gate).
4. **Kanji-only token scan** — checking that kanji-containing words are tagged but not scanning the full `jp` string token by token. Kana-only words (copulas like だ/だった, conjunctions, sentence-final particles, adverbs) can be out of scope, mis-tagged, or missing from `terms` entirely and will be invisible to a visual scan that only flags visually prominent kanji characters.
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

7. **Systematic grammar under-reinforcement across lessons** — The mirror image of failure #6. Grammar forms are correctly gated (never used too early) but also never used *enough* after they're taught. The student learns te-form in G7/N5.5, but N5.6, N5.7, and N5.8 content all default to ます/ました because Agent 2 wasn't prompted to use the new forms, Agent 3 only checked for out-of-scope violations (ceiling), and Agent 4's "skill progression" check was too vague to catch the absence. The defense is now distributed: Agent 1 includes reinforcement targets in the Content Brief, Agent 2 actively varies verb forms and meets minimum counts (CB Checklist), Agent 3 counts tagged forms against the active-window minimums (hard gate), and Agent 4 performs the Grammar Reinforcement Audit checking for under-use, verb form diversity, and structural pattern presence. All four layers must be active. The [Grammar Reinforcement Requirements](#grammar-reinforcement-requirements) section defines the concrete schedule.

---

## Quick Start Prompt for Claude Code

When the user says something like *"Create a lesson for N5.3"* or *"Add a new compose prompt for N5.6"* or *"Write a story for N4 lessons 7–9"*, begin with:

```
=== AGENT 1: PROJECT MANAGER ===
Reading manifest.json and glossary to build Content Brief...
```

Then proceed through each agent stage explicitly, labelling each transition:

```
=== AGENT 2: CONTENT BUILDER ===
=== AGENT 3: QA REVIEWER ===
=== AGENT 4: CONSISTENCY REVIEWER ===
=== AGENT 1: FINAL — Writing to repo ===
```

If any agent issues a FAIL, restart from the appropriate stage and label the retry clearly:

```
=== AGENT 2: CONTENT BUILDER (Revision 2 — addressing QA issues) ===
```

Do not summarise or condense agent outputs. Show the full checklist, report, or note so that the review trail is visible and the user can see exactly what was checked.
