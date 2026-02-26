# Content Creation Workflow — Multi-Agent Pipeline

This file governs how Claude Code creates all lesson content for this repository. When a user asks for any content to be created or updated, Claude Code **must** follow the multi-agent pipeline defined here. Do not skip agents, do not merge roles, and do not deliver output that has not passed all quality gates.

---

## Table of Contents

1. [Pipeline Overview](#pipeline-overview)
2. [Agent Roles & Responsibilities](#agent-roles--responsibilities)
3. [The Handoff Protocol](#the-handoff-protocol)
4. [Content Types & Their Rules](#content-types--their-rules)
5. [Term Tagging Reference](#term-tagging-reference)
6. [Kanji Prerequisite Rules](#kanji-prerequisite-rules)
7. [Approved Vocabulary Rules](#approved-vocabulary-rules)
8. [Quality Gates (Pass/Fail Criteria)](#quality-gates-passfail-criteria)
9. [File & Structure Reference](#file--structure-reference)
10. [Common Failure Modes](#common-failure-modes)

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
- Read the relevant glossary file(s): `data/N5/glossary.N5.json` and/or `data/N4/glossary.N4.json`.
- Build a **Content Brief** (see format below) and pass it to Agent 2.
- If Agent 4 returns a rewrite note, analyse the feedback, update the brief, and re-dispatch to Agent 2. Log what changed.
- Final: write the approved file to the correct path and update `manifest.json` if required.

**Content Brief format (internal working document):**

```
CONTENT BRIEF
═════════════
Type:          [lesson | review | compose-prompt | story]
Target ID:     [e.g. N5.2, N4.Review.11]
Level:         [N5 | N4]
Lesson scope:  [list of lesson IDs whose vocab is permitted]
New kanji:     [list only if type=lesson — characters to introduce]
Taught kanji:  [full set from manifest.json up to and including this lesson]
Focus/theme:   [e.g. "Directions and position words used in daily navigation"]
Required vocab IDs: [explicit IDs that MUST appear, e.g. compose targets]
Sections to build:  [e.g. warmup, kanjiGrid, vocabList, conversation×2, reading×2, drills×3]
Dependencies:  [list any existing lesson files to read for context]
Rewrite notes: [empty on first pass; filled by Agent 4 feedback]
```

---

### AGENT 2 — Content Builder (CB)

**Trigger:** Receives a Content Brief from Agent 1.

**Responsibilities:**
- Read the relevant glossary file(s) in full before writing a single line of content.
- Read any existing lesson or review JSON files listed in `Dependencies`.
- Write all JSON/MD content strictly according to the schemas defined in [Content Types & Their Rules](#content-types--their-rules).
- Every Japanese surface form that is used in `jp` fields, passages, or conversation lines **must** either be tagged in the `terms` array of that item, or be fully hiragana/katakana with no kanji content (pure kana items for basic particles/common function words may be untagged when they are not in the glossary).
- Do **not** invent vocabulary. Use only IDs that exist in the glossary.
- Do **not** use kanji that have not been introduced by the current lesson or earlier. See [Kanji Prerequisite Rules](#kanji-prerequisite-rules).
- When a verb or adjective appears in a conjugated form, tag it with the correct `form` string. See [Term Tagging Reference](#term-tagging-reference).
- Output the draft as a single JSON (or MD + JSON pair for stories) in a clearly labelled code block.
- Attach a **CB Checklist** at the end of the output (see below).

**CB Checklist (Agent 2 self-check before passing to Agent 3):**

```
CB CHECKLIST
════════════
[ ] Read glossary in full before writing
[ ] Every kanji used is in the taught-kanji set
[ ] Every content word in every jp/passage field has a corresponding terms entry
[ ] Verbs/adjectives use { "id": "...", "form": "..." } objects, never bare strings
[ ] No invented IDs — every ID was verified against the glossary
[ ] Counter references use { "counter": "...", "n": N } format
[ ] Drill 1 (vocab MCQ) has NO terms array on items
[ ] Drill 2+ fill-in-the-blank / particle / conjugation items DO have terms arrays
[ ] Answer fields in reading questions match the passage text exactly
[ ] JSON is valid (no trailing commas, all brackets closed)
```

---

### AGENT 3 — QA Reviewer (QA)

**Trigger:** Receives draft output from Agent 2 (plus the original Content Brief).

**Responsibilities:**
- Perform a systematic line-by-line audit. Do **not** skim.
- For every `jp` or passage sentence: extract each kanji-containing word and verify it is tagged in `terms`.
- For every `terms` entry: verify the ID exists in the glossary (cross-reference the glossary file).
- For every verb/adjective term entry: verify the `form` string is a valid key in `conjugation_rules.json`.
- Verify all kanji in `jp` fields appear in the taught-kanji set (from `manifest.json`).
- Verify the JSON schema matches the content type schema exactly (no extra/missing required fields).
- Verify answer fields match the correct answer choices.
- Verify drill distractors are plausible (wrong but not absurd; drawn from same lesson vocab where possible).

**QA Decision:**

- **PASS:** Attach a QA-PASS stamp and forward to Agent 4.
- **FAIL:** Produce an annotated failure report (see format below) and return to Agent 2. Agent 2 must fix every listed issue and resubmit; Agent 3 performs a full re-audit.

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

---

### AGENT 4 — Consistency Reviewer (CR)

**Trigger:** Receives QA-approved draft from Agent 3.

**Responsibilities:**
- Read at minimum 2 existing files of the same content type for the same level to calibrate tone, complexity, and vocabulary density.
- Assess: **Natural language quality** — do conversations sound like real Japanese, not textbook recitations? Are the situations culturally plausible?
- Assess: **Skill progression** — does difficulty increase appropriately from the previous lesson? Are new grammar points used naturally rather than force-fed?
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

**Drill types:** `mcq` only in current system. Choices array must have exactly 4 options. The `answer` string must exactly match one of the `choices` strings.

---

### Review JSON (`data/N4/reviews/N4.Review.X.json`)

**Top-level required fields:**

```json
{
  "contentVersion": "1.0.0",
  "id": "N4.Review.X",
  "title": "...",
  "meta": { "focus": "..." },
  "sections": [...]
}
```

**Review section types:**

| Section type | Notes |
|---|---|
| `drills` | Same as lesson drills. All items must have `terms` except vocab-recognition MCQ (kind=`mcq` where the q is just the kanji and choices are meanings). |
| `reading` | Same structure as lesson reading. `questions` must have `choices[]` and `explanation` in addition to `q`, `a`, `terms`. |
| `conversation` | Lines + a single `question`/`choices`/`answer`/`explanation` appended to the conversation block. |

Reviews cover multiple lessons. Vocabulary drawn from any lesson in the reviewed range is permitted.

---

### Compose Prompt JSON (`data/N5/compose/compose.N5.json`)

Each entry in `prompts[]`:

```json
{
  "id": "kebab-case-unique-id",
  "title": "English Title",
  "titleJp": "Japanese Title",
  "emoji": "...",
  "lessons": ["N5.X"],
  "scenario": "English description of the writing task",
  "hint": "Japanese sentence starter or hint",
  "targets": [
    { "id": "GLOSSARY_ID", "count": N }
  ],
  "helpers": ["GLOSSARY_ID", ...]
}
```

Rules:
- `lessons` array: all lesson IDs whose vocabulary the student may use. Normally one or two consecutive lessons.
- `targets`: vocabulary the student **must** use to complete the prompt. Each `id` must exist in the glossary. `count` is how many times the word must appear (usually 1–2).
- `helpers`: optional additional glossary IDs that the UI will surface as clickable chips. These must also exist in the glossary.
- The `hint` must be written using only taught kanji and taught vocabulary.

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
- Every meaningful vocabulary word in the story must have an entry. Particles, conjunctions, and pure hiragana function words may be omitted.

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
| `polite_past_adj` | adjective past + です |
| `plain_past` | ～た / ～だった |
| `plain_negative` | ～ない |
| `plain_past_negative` | ～なかった |
| `te_form` | ～て / ～で |
| `potential` | ～られる / ～える |
| `potential_negative` | ～られません |
| `adverbial` | ～く / ～に |
| `desire_tai` | ～たいです |
| `appearance_sou` | ～そうです |
| `polite_volitional_mashou` | ～ましょう |
| `conditional_ba` | ～ば / ～ければ |

### Counter references

When a counter expression appears in a `terms` array:

```json
{ "counter": "nin", "n": 4 }
```

Valid counter keys: `ji`, `fun`, `hon`, `mai`, `ko`, `hiki`, `hai`, `satsu`, `nin`, `dai`, `kai`, `sai`, `nen`, `kagetsu`, `shu`

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

Grammar patterns (particles, sentence-final forms, conjunctions like ～て) are governed by what has been taught, but they do not need to be explicitly listed in the glossary. Use good judgment: stick to the grammar complexity of the target lesson's tier.

---

## Quality Gates (Pass/Fail Criteria)

### Agent 3 (QA) — hard pass/fail

All of the following must be TRUE for a QA pass:

- [ ] Every kanji in every `jp`/passage field is in the taught-kanji set
- [ ] Every content word in every `jp`/passage field is tagged in the `terms` array of that item
- [ ] Every term ID in every `terms` array exists in the glossary
- [ ] Every verb/adjective `terms` entry uses `{ "id": "...", "form": "..." }` with a valid form string
- [ ] Drill 1 MCQ items have no `terms` array; all other drills do
- [ ] Answer fields exactly match one of the choices strings
- [ ] The JSON validates (no syntax errors)
- [ ] All required fields are present for the section type
- [ ] No ID appears in terms that was not verified against the glossary file

### Agent 4 (CR) — soft pass/fail (judgment-based)

All of the following should be TRUE for a CR pass:

- [ ] Conversations sound natural and idiomatic, not like direct grammar exercises
- [ ] The scenario is culturally plausible and engaging
- [ ] Grammar complexity matches the target lesson tier
- [ ] Vocabulary density is appropriate (not overcrowded, not too sparse)
- [ ] Scenarios are meaningfully different from the 2 most recent same-type files
- [ ] Character names, places, and recurring details are consistent with the series
- [ ] The content builds genuine skill progression from the previous lesson
- [ ] Distractors in drills are plausible but clearly wrong
- [ ] Reading passages are coherent narratives, not disconnected sentences

---

## File & Structure Reference

### Key files to read before building any content

| File | Purpose |
|---|---|
| `manifest.json` | Level/lesson index, kanji arrays per lesson, file paths |
| `data/N5/glossary.N5.json` | All N5 kanji and vocab entries with IDs |
| `data/N4/glossary.N4.json` | All N4 kanji and vocab entries with IDs |
| `conjugation_rules.json` | Valid conjugation form strings |
| `counter_rules.json` | Valid counter keys and their rules |
| `Lesson Instructions.md` | Authoritative term tagging and drill authoring rules |

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
| N5 Compose | `data/N5/compose/compose.N5.json` (append to `prompts[]`) |
| N4 Compose | `data/N4/compose/compose.N4.json` (append to `prompts[]`) |
| Story markdown | `data/N5/stories/[slug]/story.md` |
| Story terms | `data/N5/stories/[slug]/terms.json` |

After writing new files, `manifest.json` must be updated. Lessons get an entry under `data.N5.lessons` or `data.N4.lessons`. Stories get an entry under `data.N5.stories` or `data.N4.stories`. Reviews get an entry under `data.N4.reviews`.

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

### Agent 3 failures (caught by Agent 4)

1. **Approving unnatural dialogue** — grammatically correct but no real speaker would say it.
2. **Approving overstuffed sections** — 30 vocabulary chips, 5 conversations, 4 readings in one lesson.
3. **Missing a grammar level jump** — content using grammar structures 2–3 tiers above the lesson.

### Agent 4 failures (caught by Agent 1 in next pass)

1. **Vague rewrite directives** — "make it more natural" without specific lines identified.
2. **Rejecting content for subjective reasons** — if the only issue is style preference rather than a structural problem, prefer a pass with a note over a full rewrite.

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
