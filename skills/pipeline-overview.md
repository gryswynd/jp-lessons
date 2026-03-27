# Content Pipeline — Agent Roles & Orchestration (Part 1: Overview + Agents 1 & 2)

> **Loaded by:** Agent 1 (Project Manager) at session start for any content creation task. Agent 2 (Content Builder) for its responsibilities and the CB Checklist.
> **Purpose:** Defines the pipeline overview, Agent 1 (PM) and Agent 2 (CB) responsibilities, the Sentence Token Scan Protocol, and the CB Checklist.
> **See also:** `skills/pipeline-reviewers.md` (Agents 3 & 4), `skills/pipeline-handoff.md` (handoff protocol + quick start).
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
- **Do not read the glossary in full.** The glossary files are large and will exceed output token limits. Instead use targeted Grep queries: search by `lesson_ids` to enumerate vocab for the target lesson, and search by `"id": "v_foo"` to verify individual IDs. See Glossary Access Pattern in `skills/quality-gates-criteria.md`.
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
- **Grammar reinforcement planning.** Before finalizing the Content Brief, Agent 1 must consult the Grammar Reinforcement Requirements in `skills/grammar-rules-reinforcement.md` schedule and identify: (a) which grammar milestones are in their **active reinforcement window** for this lesson, and (b) which milestones are in **sustained use**. List the specific reinforcement targets in the Content Brief. Plan at least 1 warmup item that exercises the most recently unlocked grammar using prior-lesson vocabulary. If the lesson's theme naturally supports certain grammar patterns (e.g. a travel theme supports ～たいです for desires, ～てください for requests), note these opportunities in the brief.
- **Register planning.** Before finalizing the Content Brief, Agent 1 must consult the Register Requirements in `skills/grammar-rules-reinforcement.md` schedule and determine how many casual conversations the lesson needs. For N5.10+ lessons, plan which conversations will be casual by assigning informal contexts (friends, family, close peers). For lessons before N5.10, confirm register = 100% polite. Include the register plan in the Content Brief.

**Spawning Agents 2, 3, and 4 via the Agent tool:**

Agent 1 spawns each downstream agent as an independent subprocess. Each agent receives only what is explicitly included in its prompt — it cannot read the main conversation history.

**What to include in the Agent 2 prompt:**
- The complete Content Brief
- Paths to any dependency files listed in the brief (reference template, prior lesson files) — Agent 2 must read these itself via its tools
- The instruction: *"You are Agent 2 (Content Builder). Read the following skill files for your full responsibilities: skills/pipeline-overview.md, skills/content-schemas-core.md, skills/content-schemas-extended.md, skills/term-tagging-forms.md, skills/term-tagging-characters.md, skills/grammar-rules-prerequisites.md, skills/grammar-rules-reinforcement.md. Build the draft JSON according to the Content Brief above, then return the complete draft and your CB Checklist."*
- If this is a revision pass: include the QA Failure Report from Agent 3 and instruct Agent 2 to fix every listed issue
- **For grammar lessons, reviews, stories, or any large file: include an explicit chunk plan.** Example: "Write sections 1–4, commit `WIP <task>: intro and rules`. Then write sections 5–7, commit `WIP <task>: examples and conversation`. Then write sections 8–9, commit `WIP <task>: drills`. Then squash all WIP commits into one clean commit and push." Agent 2 must not decide chunk boundaries on its own.

**Agent 2 timeout recovery:** If Agent 2 times out without producing the file, Agent 1 MUST re-spawn Agent 2 with a reduced chunk size — never attempt to build the content in the main context. Split the chunk plan into smaller pieces (e.g., 2 sections per chunk instead of 4) and re-dispatch. Agent 1's role is coordination, not content building.

**What to include in the Agent 3 prompt:**
- The complete Content Brief (including the taught-kanji set Agent 1 computed)
- The full draft JSON returned by Agent 2
- The instruction: *"You are Agent 3 (QA Reviewer). Read the following skill files for your full responsibilities: skills/pipeline-reviewers.md, skills/quality-gates-criteria.md, skills/quality-gates-failures.md, skills/term-tagging-forms.md, skills/term-tagging-characters.md, skills/grammar-rules-prerequisites.md, skills/grammar-rules-reinforcement.md. Your first task is the mechanical kanji scope audit described in your Responsibilities section — complete that before any other check. Return a QA-PASS stamp or a QA Failure Report."*

**What to include in the Agent 4 prompt:**
- The complete Content Brief
- The QA-approved draft JSON
- Paths to the 1–2 most recent same-type lesson files for comparison (Agent 4 must read these itself)
- The instruction: *"You are Agent 4 (Consistency Reviewer). Read the following skill files for your full responsibilities: skills/pipeline-reviewers.md, skills/quality-gates-criteria.md, skills/quality-gates-failures.md, skills/grammar-rules-prerequisites.md, skills/grammar-rules-reinforcement.md. Return either a CR approval or a Consistency Note with a rewrite directive."*

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
- **Do not read the glossary in full.** Use targeted Grep queries only (see Glossary Access Pattern in `skills/quality-gates-criteria.md`). Reading the full file will exceed the 32k output token limit.
- Read any existing lesson or review JSON files listed in `Dependencies`.
- Write all JSON/MD content strictly according to the schemas defined in Content Types in `skills/content-schemas-core.md`.
- Every Japanese surface form that is used in `jp` fields, passages, or conversation lines **must** either be tagged in the `terms` array of that item, or be fully hiragana/katakana with no kanji content (pure kana items for basic particles/common function words may be untagged when they are not in the glossary).
- Do **not** invent vocabulary. Use only IDs that exist in the glossary.
- Do **not** use kanji that have not been introduced by the current lesson or earlier. See Kanji Prerequisite Rules in `skills/grammar-rules-prerequisites.md`.
- Do **not** use conjugation forms whose `introducedIn` lesson (in `conjugation_rules.json`) is later than the current lesson. For example, `te_form` has `introducedIn: "N5.5"` — a lesson targeting N5.3 must not contain any て-form usage. If a sentence requires a form that is not yet available, restructure the sentence to use only available forms. See Grammar Usage Prerequisite Rules in `skills/grammar-rules-prerequisites.md`.
- When a verb or adjective appears in a conjugated form, tag it with the correct `form` string. See Term Tagging Reference in `skills/term-tagging-forms.md`.
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
   - **For every い-adjective token:** determine its position **in this field**. Ask: "Does this adjective directly precede a noun in this sentence?" If yes → bare string. If it is sentence-final (before です/でした or in casual plain form) → `polite_adj`. Do not carry over the form from how this adjective was tagged in another field (e.g. a passage). Reading question answers frequently rephrase passage sentences in ways that shift an adjective from predicate to attributive position — always re-check.
   - **For every な-adjective token:** same per-field check. Precedes a noun → `attributive_na`. Sentence-final predicate → `polite_adj`. The form is determined by position in this sentence, not by position in any other sentence in the lesson.
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
[ ] Adjacent single-char kana terms ordered correctly: wherever two single-char kana particles/copulas appear consecutively in jp text (e.g. だね, のは, かな, よね, には, では), the rightmost one is listed FIRST in the terms array — so it is wrapped in a <span> before the leftmost is processed, allowing the single-char lookahead regex to pass. Example: jp="ことだね" → put p_ne before g_da; jp="借りるのは" → put p_wa before p_no; jp="町には" → put p_wa before p_ni; jp="お店では" → put p_wa before p_de
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
[ ] manifest.json updated: a new entry for this content has been added to the correct array (lessons / stories / grammar / reviews / compose) with the correct `id`, `title`, `dir` or `file`, and `unlocksAfter` fields — verified by Grep that the entry is present before submitting to Agent 3
```

---

