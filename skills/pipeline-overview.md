# Content Pipeline — Pipeline Overview + Agent 1 (Project Manager)

> **Loaded by:** Agent 1 (Project Manager) at session start for any content creation task.
> **Purpose:** Defines the pipeline overview and Agent 1 (PM) responsibilities.
> **See also:** `skills/pipeline-content-builder.md` (Agent 2 + CB Checklist), `skills/pipeline-reviewers.md` (Agents 3 & 4), `skills/pipeline-handoff.md` (handoff protocol + quick start).
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
- **Custom story slug rule.** After the story title (titleJp) is finalized, derive the manifest `id` and directory name fresh as a romanization of the Japanese title. Do **not** carry over a slug from a campaign plan file if the title has changed — slugs must always match the final title. The `validate-manifest-slugs.sh` hook enforces that `id` equals `basename(dir)` for every custom story entry; a mismatch is a hard failure at write time.
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
- The instruction: *"You are Agent 2 (Content Builder). Read the following skill files for your full responsibilities: skills/pipeline-content-builder.md, skills/content-schemas-core.md, skills/content-schemas-extended.md, skills/term-tagging-forms.md, skills/term-tagging-characters.md, skills/grammar-rules-prerequisites.md, skills/grammar-rules-reinforcement.md. Build the draft JSON according to the Content Brief above, then return the complete draft and your CB Checklist."*
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

