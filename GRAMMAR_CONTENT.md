# GRAMMAR_CONTENT.md — Grammar Lesson Content Creation Guide

> **Purpose:** This document tells the CLAUDE.md multi-agent pipeline everything it needs to create grammar lesson JSON files (G1–G23). Feed this to Claude Code **after** the Grammar.js module has been built. The Project Manager agent (Agent 1) should read this document before scoping any grammar lesson.

---

## Table of Contents

1. [How Grammar Lessons Differ from Kanji Lessons](#how-grammar-lessons-differ-from-kanji-lessons)
2. [Grammar Lesson JSON Schema](#grammar-lesson-json-schema)
3. [Section Type Reference](#section-type-reference)
4. [Grammar Color Roles](#grammar-color-roles)
5. [Lesson Flow Convention](#lesson-flow-convention)
6. [Term Tagging in Grammar Lessons](#term-tagging-in-grammar-lessons)
7. [Full Lesson Map: N5 Grammar (G1–G11)](#full-lesson-map-n5-grammar-g1g11)
8. [Full Lesson Map: N4 Grammar (G12–G23)](#full-lesson-map-n4-grammar-g12g23)
9. [Content Brief Template for Grammar](#content-brief-template-for-grammar)
10. [Quality Gates for Grammar Content](#quality-gates-for-grammar-content)
11. [Common Failure Modes for Grammar Content](#common-failure-modes-for-grammar-content)

---

## How Grammar Lessons Differ from Kanji Lessons

Grammar lessons use a different module (`Grammar.js`) with its own section types. The multi-agent pipeline (CLAUDE.md) still applies, but with these modifications:

| Aspect | Kanji Lessons | Grammar Lessons |
|---|---|---|
| ID format | `N5.1`, `N4.7` | `G1`, `G2`, ... `G23` |
| File path | `data/N5/lessons/N5.X.json` | `data/N5/grammar/G1.json` or `data/N4/grammar/G12.json` |
| Type field | `"type"` not present (implied) | `"type": "grammar"` required |
| Section types | warmup, kanjiGrid, vocabList, conversation, reading, drills | grammarIntro, grammarRule, grammarTable, grammarComparison, annotatedExample, conjugationDrill, patternMatch, sentenceTransform, fillSlot, conversation, drills |
| New kanji | Introduces new kanji characters | Does **not** introduce new kanji — uses only kanji already taught |
| Vocabulary | Introduces new vocabulary | Does **not** introduce new vocabulary — uses only existing glossary entries |
| Term tagging | Required on conversation/reading/drill `jp` fields | Required on `conversation` and `drills` sections only. Grammar-specific sections (`grammarRule`, `annotatedExample`, etc.) use a `parts` array with `role` and `gloss` fields instead of `terms`. |
| Reference template | Highest-numbered existing kanji lesson | Highest-numbered existing grammar lesson of the same level |

### Critical rule: Grammar lessons never introduce new vocabulary or kanji

Grammar lessons teach **patterns and rules** using vocabulary and kanji the student already knows. Every kanji character and every vocabulary item used in a grammar lesson must already be taught by the lesson specified in `unlocksAfter` (or earlier). This means:

- Agent 1 computes the taught-kanji set from `manifest.json` up to and including the `unlocksAfter` lesson
- Agent 1 computes the available vocabulary by checking glossary entries with `lesson_ids` ≤ `unlocksAfter`
- Agent 2 builds all Japanese content strictly within these constraints
- Agent 3 verifies every character and every term ID against these constraints

If a concept genuinely requires a word not in the glossary, write the word in **hiragana only** and add a brief inline gloss in the `explanation` or `note` field. Do not add vocabulary to the glossary for grammar lessons.

---

## Grammar Lesson JSON Schema

### Top-level structure

```json
{
  "contentVersion": "1.0.0",
  "id": "G2",
  "type": "grammar",
  "title": "Core Particles I: は, が, の, か, も",
  "meta": {
    "level": "N5",
    "unlocksAfter": "N5.1",
    "focus": "Topic marking, subject marking, possession, questions, inclusion",
    "estimatedMinutes": 25,
    "particles": ["は", "が", "の", "か", "も"],
    "grammarForms": [],
    "icon": "📌"
  },
  "sections": [
    { "type": "grammarIntro", "..." },
    { "type": "grammarRule", "..." },
    { "type": "grammarComparison", "..." },
    { "type": "fillSlot", "..." },
    { "type": "conversation", "..." },
    { "type": "drills", "..." }
  ]
}
```

### Required top-level fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `contentVersion` | string | ✅ | Always `"1.0.0"` |
| `id` | string | ✅ | `G1` through `G23` |
| `type` | string | ✅ | Always `"grammar"` |
| `title` | string | ✅ | Display title |
| `meta.level` | string | ✅ | `"N5"` or `"N4"` |
| `meta.unlocksAfter` | string | ✅ | Lesson ID prerequisite (e.g. `"N5.1"`) |
| `meta.focus` | string | ✅ | Plain English description |
| `meta.estimatedMinutes` | number | ✅ | Estimated completion time (15–30) |
| `meta.particles` | array | Optional | Particles covered (for cross-linking) |
| `meta.grammarForms` | array | Optional | Conjugation forms covered (for cross-linking) |
| `meta.icon` | string | ✅ | Emoji for menu display |
| `sections` | array | ✅ | Must start with `grammarIntro`, must end with `drills` |

---

## Section Type Reference

### `grammarIntro`

Always first. Exactly one per lesson.

```json
{
  "type": "grammarIntro",
  "title": "The Particles that Build Every Sentence",
  "icon": "📌",
  "summary": "Particles are small words placed after nouns to show their role in a sentence.",
  "whyItMatters": "Get particles right and you'll be understood even with limited vocabulary.",
  "youWillLearn": [
    "は — marking the topic",
    "が — marking the subject",
    "の — connecting nouns",
    "か — asking questions",
    "も — adding 'also' or 'even'"
  ]
}
```

| Field | Required | Notes |
|---|---|---|
| `title` | ✅ | Engaging section title |
| `icon` | ✅ | Emoji matching `meta.icon` |
| `summary` | ✅ | One-sentence description |
| `whyItMatters` | ✅ | Motivational context |
| `youWillLearn` | ✅ | Array of 3–6 learning objectives |

---

### `grammarRule`

The core teaching unit. One per grammar point being taught.

```json
{
  "type": "grammarRule",
  "id": "rule_wa_basic",
  "pattern": [
    { "label": "TOPIC", "color": "topic", "text": "X" },
    { "label": "PARTICLE", "color": "particle", "text": "は" },
    { "label": "COMMENT", "color": "verb", "text": "..." }
  ],
  "meaning": "'As for X, ...' / 'Speaking of X, ...'",
  "explanation": "は tells the listener: 'I'm going to talk about X now.' Everything after は is the comment about that topic.",
  "notes": [
    "は is written with hiragana は (ha) but pronounced 'wa'.",
    "The topic doesn't have to be the grammatical subject."
  ],
  "examples": [
    {
      "parts": [
        { "text": "わたし", "role": "topic", "gloss": "I" },
        { "text": "は", "role": "particle" },
        { "text": "がくせい", "role": "predicate", "gloss": "student" },
        { "text": "です", "role": "verb" }
      ],
      "en": "I am a student.",
      "breakdown": "Topic: 'I' → Comment: 'am a student'"
    }
  ]
}
```

| Field | Required | Notes |
|---|---|---|
| `id` | ✅ | Unique within the lesson (e.g. `rule_wa_basic`) |
| `pattern` | ✅ | Array of `{label, color, text}` objects — the visual formula |
| `pattern[].label` | ✅ | Grammatical role (uppercase, e.g. `TOPIC`, `PARTICLE`, `VERB`) |
| `pattern[].color` | ✅ | Key from color system: `topic`, `subject`, `object`, `verb`, `particle`, `destination`, `location`, `modifier`, `time`, `connector`, `predicate` |
| `pattern[].text` | ✅ | Placeholder or actual text (e.g. `"X"`, `"は"`, `"Y です"`) |
| `meaning` | ✅ | English meaning of the pattern |
| `explanation` | ✅ | Clear explanation of how the pattern works |
| `notes` | Optional | Array of additional tips, exceptions, pronunciation notes |
| `examples` | ✅ | At least 2 examples. Each has `parts`, `en`, and optional `breakdown` |
| `examples[].parts` | ✅ | Array of `{text, role, gloss?}` — every word segment |
| `examples[].parts[].text` | ✅ | Japanese text segment |
| `examples[].parts[].role` | ✅ | Color key from color system |
| `examples[].parts[].gloss` | Optional | Short English gloss (omit for particles) |
| `examples[].en` | ✅ | Full English translation |
| `examples[].breakdown` | Optional | Structural breakdown |

**Content rules for `grammarRule`:**
- Every example must use only taught kanji and approved vocabulary
- Use hiragana for any word not in the glossary
- Pattern formulas should be simple and memorable — 2-4 chips maximum
- At least 2 examples per rule; ideally 3 for core concepts
- Examples should show varied usage (different subjects, contexts), not just the same pattern repeated

---

### `grammarTable`

Conjugation tables and form summaries.

```json
{
  "type": "grammarTable",
  "title": "Polite Verb Forms (ます)",
  "description": "All polite forms follow the same pattern: verb stem + ending.",
  "tableType": "conjugation",
  "headers": ["Form", "RU-Verb (食べる)", "U-Verb (話す)", "する", "くる"],
  "rows": [
    {
      "label": "Present / Future",
      "cells": ["食べます", "話します", "します", "きます"],
      "meaning": "do / will do"
    }
  ],
  "highlight": {
    "stem": "#00B894",
    "ending": "#D63031"
  },
  "notes": ["RU-verbs: drop る, add ます", "U-verbs: shift final sound to い-row, add ます"]
}
```

| Field | Required | Notes |
|---|---|---|
| `title` | ✅ | Table title |
| `description` | ✅ | Brief explanation above the table |
| `tableType` | ✅ | `"conjugation"`, `"comparison"`, or `"summary"` |
| `headers` | ✅ | Column headers (first column is the label column) |
| `rows` | ✅ | Array of row objects |
| `rows[].label` | ✅ | Row label (e.g. "Present / Future") |
| `rows[].cells` | ✅ | Cell values, one per header (excluding the label column) |
| `rows[].meaning` | Optional | English meaning for this row |
| `highlight` | Optional | `{stem, ending}` hex colors for conjugation splitting |
| `notes` | Optional | Footnotes below the table |

**Content rules for `grammarTable`:**
- All verb examples must use taught kanji only
- Include at least one RU-verb, one U-verb, and both irregulars (する, くる) in verb conjugation tables
- Headers should include the dictionary form with kanji for reference
- The `meaning` field uses plain English, not Japanese

---

### `grammarComparison`

Side-by-side comparison of confused grammar points.

```json
{
  "type": "grammarComparison",
  "title": "は vs が",
  "items": [
    {
      "label": "は — Topic Marker",
      "color": "topic",
      "points": [
        "Marks the topic (what we're talking about)",
        "For known / established info"
      ],
      "example": {
        "parts": [
          { "text": "田中さん", "role": "topic" },
          { "text": "は", "role": "particle" },
          { "text": "先生です", "role": "verb" }
        ],
        "en": "Mr. Tanaka is a teacher. (talking about Tanaka)"
      }
    },
    {
      "label": "が — Subject Marker",
      "color": "subject",
      "points": [
        "Marks the subject (who does the action)",
        "For new info or emphasis"
      ],
      "example": {
        "parts": [
          { "text": "田中さん", "role": "subject" },
          { "text": "が", "role": "particle" },
          { "text": "先生です", "role": "verb" }
        ],
        "en": "Mr. Tanaka is the teacher. (identifying Tanaka)"
      }
    }
  ],
  "tip": "Am I introducing new info? → が. Commenting on something known? → は."
}
```

| Field | Required | Notes |
|---|---|---|
| `title` | ✅ | Comparison title |
| `items` | ✅ | Exactly 2 items (the two things being compared) |
| `items[].label` | ✅ | Descriptive label |
| `items[].color` | ✅ | Color key from color system |
| `items[].points` | ✅ | 2–4 key differences |
| `items[].example` | ✅ | `{parts, en}` — annotated example |
| `tip` | ✅ | Memorable decision heuristic |

**Content rules:**
- The two examples should use the **same or very similar** sentences to highlight the difference (same nouns, different particle = clear contrast)
- The tip must be actionable — a question the student can ask themselves
- Keep points to 2–4 each; more than that loses the comparison clarity

---

### `annotatedExample`

Collection of context-labeled example sentences.

```json
{
  "type": "annotatedExample",
  "title": "に in Action",
  "examples": [
    {
      "context": "Marking a destination",
      "parts": [
        { "text": "公園", "role": "destination", "gloss": "park" },
        { "text": "に", "role": "particle" },
        { "text": "行きましょう", "role": "verb", "gloss": "let's go" }
      ],
      "en": "Let's go to the park.",
      "note": "に marks where the movement is directed toward."
    }
  ]
}
```

| Field | Required | Notes |
|---|---|---|
| `title` | ✅ | Section title |
| `examples` | ✅ | 3–6 examples showing varied usage |
| `examples[].context` | ✅ | Usage label (e.g. "Marking a destination") |
| `examples[].parts` | ✅ | Color-coded word segments |
| `examples[].en` | ✅ | English translation |
| `examples[].note` | Optional | Brief explanation |

---

### `conjugationDrill`

Interactive conjugation practice.

```json
{
  "type": "conjugationDrill",
  "title": "て-Form Practice",
  "instructions": "Convert each verb to its て-form.",
  "items": [
    {
      "verb": "食べる",
      "type": "ru",
      "reading": "たべる",
      "targetForm": "te_form",
      "answer": "食べて",
      "answerReading": "たべて",
      "hint": "RU-verb: drop る, add て",
      "choices": ["食べて", "食べって", "食んで", "食して"]
    }
  ]
}
```

| Field | Required | Notes |
|---|---|---|
| `title` | ✅ | Section title |
| `instructions` | ✅ | What to do |
| `items` | ✅ | 6–10 items |
| `items[].verb` | ✅ | Dictionary form |
| `items[].type` | ✅ | `"ru"`, `"u"`, or `"irregular"` |
| `items[].reading` | ✅ | Hiragana reading |
| `items[].targetForm` | ✅ | Target form string (from `conjugation_rules.json`) |
| `items[].answer` | ✅ | Correct conjugated form |
| `items[].answerReading` | ✅ | Reading of answer |
| `items[].hint` | ✅ | Rule hint shown on wrong answer |
| `items[].choices` | ✅ | Exactly 4 choices including the answer |

**Content rules:**
- Mix verb types: aim for ~40% U-verbs, ~40% RU-verbs, ~20% irregulars
- Distractors must be plausible wrong conjugations (e.g. applying the wrong て-form rule)
- Use only verbs the student has already learned (from glossary entries with `lesson_ids` ≤ `unlocksAfter`)
- Include at least one tricky exception per drill (e.g. 行く → 行って, not 行いて)

---

### `patternMatch`

Identify correct usage of a pattern.

```json
{
  "type": "patternMatch",
  "title": "Find the correct use of に",
  "pattern": "DESTINATION + に + VERB of motion",
  "items": [
    {
      "sentence": "学校に 行きます。",
      "correct": true,
      "explanation": "学校 is the destination, 行く is motion → に is correct."
    },
    {
      "sentence": "学校に 勉強します。",
      "correct": false,
      "explanation": "勉強する is not a motion verb. Use で for where actions happen."
    }
  ]
}
```

| Field | Required | Notes |
|---|---|---|
| `title` | ✅ | Section title |
| `pattern` | ✅ | The pattern being tested (plain English formula) |
| `items` | ✅ | 4–6 items, mix of correct and incorrect (aim for ~50/50) |
| `items[].sentence` | ✅ | Japanese sentence |
| `items[].correct` | ✅ | Boolean |
| `items[].explanation` | ✅ | Why it's correct or incorrect |

---

### `sentenceTransform`

Transform a sentence from one form to another.

```json
{
  "type": "sentenceTransform",
  "title": "Make it negative",
  "instructions": "Change each sentence to its negative form.",
  "items": [
    {
      "given": "先生は います。",
      "givenLabel": "Polite Present",
      "targetLabel": "Polite Negative",
      "answer": "先生は いません。",
      "choices": ["先生は いません。", "先生は いないです。", "先生は いなかった。", "先生は ありません。"]
    }
  ]
}
```

| Field | Required | Notes |
|---|---|---|
| `title` | ✅ | Section title |
| `instructions` | ✅ | What transformation to apply |
| `items` | ✅ | 4–6 items |
| `items[].given` | ✅ | Original sentence |
| `items[].givenLabel` | ✅ | Form label of the original |
| `items[].targetLabel` | ✅ | Target form label |
| `items[].answer` | ✅ | Correct transformed sentence (must match one of `choices`) |
| `items[].choices` | ✅ | Exactly 4 choices |

---

### `fillSlot`

Fill in the blank particle/form.

```json
{
  "type": "fillSlot",
  "title": "Choose the right particle",
  "items": [
    {
      "before": "学校",
      "slot": true,
      "after": "行きます。",
      "choices": ["に", "で", "を", "は"],
      "answer": "に",
      "explanation": "行く is a motion verb — use に for the destination."
    }
  ]
}
```

| Field | Required | Notes |
|---|---|---|
| `title` | ✅ | Section title |
| `items` | ✅ | 5–8 items |
| `items[].before` | ✅ | Text before the blank |
| `items[].slot` | ✅ | Always `true` |
| `items[].after` | ✅ | Text after the blank |
| `items[].choices` | ✅ | 3–4 choices |
| `items[].answer` | ✅ | Correct choice (must match one of `choices`) |
| `items[].explanation` | ✅ | Why this is correct |

---

### `conversation` (reused from Lesson.js)

Same schema as kanji lesson conversations. Uses standard `terms` array, not `parts`.

```json
{
  "type": "conversation",
  "title": "At the Library",
  "context": "Two students talking about what to do after class.",
  "lines": [
    {
      "spk": "ゆき",
      "jp": "今日は何をしますか。",
      "en": "What will you do today?",
      "terms": [
        "v_kyou",
        "v_nani",
        "p_wo",
        { "id": "v_suru", "form": "polite_masu" },
        "p_ka"
      ]
    }
  ]
}
```

**Same rules as CLAUDE.md for term tagging apply.** All kanji words must be tagged. Verbs/adjectives must use `{id, form}` objects. IDs must exist in the glossary or `particles.json`.

---

### `drills` (reused from Lesson.js)

Always the last section. Same schema as kanji lesson drills.

```json
{
  "type": "drills",
  "title": "Mixed Practice",
  "instructions": "Test your understanding of today's grammar.",
  "items": [
    {
      "kind": "mcq",
      "q": "先生 ______ 名まえは なんですか。",
      "choices": ["の", "は", "が", "を"],
      "answer": "の",
      "terms": ["v_sensei", "v_namae", "p_wa", "v_nan"],
      "explanation": "の connects two nouns — 'the teacher's name'."
    }
  ]
}
```

**Same rules as CLAUDE.md for drills and term tagging apply.** The `explanation` field is **required** for grammar lesson drills (optional in kanji lesson drills).

---

## Grammar Color Roles

When building `parts` arrays, use these role values:

| Role key | Color | Use for |
|---|---|---|
| `topic` | Purple | は-marked nouns, general topic phrases |
| `subject` | Blue | が-marked nouns |
| `object` | Green | を-marked nouns |
| `verb` | Red | Verbs, predicates, です/だ forms |
| `particle` | Gold | The particle itself (は, が, を, に, で, etc.) |
| `destination` | Coral | に-marked destinations, recipients, specific times |
| `location` | Teal | で-marked locations, means, tools |
| `modifier` | Lavender | Adjectives, adverbs, descriptive phrases |
| `time` | Peach | Time expressions (今日, 毎日, 三時に) |
| `connector` | Pink | Conjunctions, linking words (から, ので, けど) |
| `predicate` | Red | Alias for `verb` — use for non-verb predicates |

### Rules for role assignment
- Particles always get `"role": "particle"` — even if they could be categorized by function
- The noun **before** a particle gets the role that matches the particle's function (e.g. noun before は = `topic`, noun before を = `object`)
- Verbs at the end of a clause always get `"role": "verb"`
- When a word serves multiple roles, choose the role most relevant to what the lesson is teaching

---

## Lesson Flow Convention

Every grammar lesson must follow this structure:

```
1. grammarIntro        (exactly 1, always first)
2. grammarRule ×1-3    (core teaching)
3. grammarTable ×0-2   (conjugation/form-heavy lessons)
4. grammarComparison ×0-2  (confused pairs)
5. annotatedExample ×0-1   (varied usage examples)
6. conversation ×1-2   (natural dialogue)
7. [practice] ×1-3     (conjugationDrill / patternMatch / fillSlot / sentenceTransform)
8. drills              (exactly 1, always last)
```

Section 2-5 order can be adjusted to fit the teaching flow, but `grammarIntro` is always first and `drills` is always last. Practice sections come after all teaching sections.

---

## Term Tagging in Grammar Lessons

### Grammar-specific sections (parts-based)
`grammarRule`, `grammarTable`, `grammarComparison`, `annotatedExample`, `conjugationDrill`, `patternMatch`, `sentenceTransform`, and `fillSlot` do **NOT** use the `terms` array. They use `parts` arrays with `{text, role, gloss}` or direct string content.

Agent 3 does **not** run term-ID verification on these sections. Instead, Agent 3 verifies:
- Every kanji character in `text` fields is in the taught-kanji set
- Every `role` value is a valid color key
- Examples are accurate Japanese

### Reused sections (terms-based)
`conversation` and `drills` sections use the standard `terms` array exactly as defined in CLAUDE.md. All CLAUDE.md term tagging rules apply:
- Every kanji word must be tagged
- Verbs/adjectives use `{id, form}` objects
- IDs must exist in glossary or `particles.json`
- Agent 3 runs full term-ID verification

---

## Full Lesson Map: N5 Grammar (G1–G11)

---

### G1 — です / だ — The Copula ("To Be")

| Field | Value |
|---|---|
| **ID** | `G1` |
| **Level** | N5 |
| **Unlocks after** | N5.1 |
| **Icon** | 📐 |
| **Estimated minutes** | 20 |
| **Grammar forms** | `polite_adj`, `plain_past` |

**What to teach:**
- Basic sentence pattern: X は Y です (polite "to be")
- Casual equivalent: X は Y だ
- All forms of the copula in both registers:
  - Present: です / だ
  - Past: でした / だった
  - Negative: ではありません (じゃありません) / ではない (じゃない)
  - Past negative: ではありませんでした (じゃありませんでした) / ではなかった (じゃなかった)
- Question formation: ～ですか？
- When to use です vs だ (formal vs informal social contexts)
- い-adjective interaction:
  - Polite: やさしいです (い-adjective + です = correct polite form)
  - Plain: やさしい (い-adjective stands alone — do NOT add だ)
  - **⚠ ACCURACY NOTE:** です IS used after い-adjectives in polite speech. だ is NOT used after い-adjectives in plain speech. These are different rules — do not conflate them.
- じゃ as a standard spoken contraction of では (not slang, not incorrect)

**What NOT to teach in G1:**
- ~~Nominalization rules (だ→な before の, である before こと)~~ → Deferred. Requires の particle (G2) and nominalizer concepts.
- ~~なんです / のです explanatory form~~ → Deferred to G9 (Plain Forms & Basic Connectors), where plain form prerequisite is established.
- Verb conjugation of any kind — G1 is strictly about the copula with nouns and adjectives.

**Recommended sections:**
1. `grammarIntro` — what です/だ do; why mastering both registers matters
2. `grammarRule` — X は Y です (polite copula pattern with 3 examples)
3. `grammarRule` — X は Y だ (casual copula — same examples restated casually, to show the direct correspondence)
4. `grammarTable` — full conjugation chart: polite vs plain × present / past / negative / past-negative (8 forms total)
5. `grammarComparison` — formal です vs casual だ (when to use each, with social context guidelines; use parallel example sentences)
6. `annotatedExample` — です/だ across 5 real situations (introduction, question with か, past tense, denial, casual exclamation)
7. `conversation` ×1–2 — natural dialogues; at least one should show both registers (e.g., formal introduction → casual aside between friends)
8. `sentenceTransform` — convert between registers (polite ↔ plain) and between tenses (present ↔ past, positive ↔ negative), 5–6 items
9. `drills` — mixed MCQ covering all forms, register choice, and the い-adjective rules, 5–6 items with explanations

**Available vocabulary context:** All N5.1 vocabulary. This includes:
- Family terms: 母 (はは), 父 (ちち), 兄 (あに), 姉 (あね), etc.
- People: 先生, 友だち, 人
- Descriptors: やさしい, いい, うれしい 
- Pronouns: わたし, あなた, あの人
- Set phrases: はじめまして, よろしくおねがいします

Build examples around self-introduction, family description, and asking about people — these are the contexts students know from N5.1.


---

### G2 — Core Particles I: は, が, の, か, を

| Field | Value |
|---|---|
| **ID** | `G2` |
| **Level** | N5 |
| **Unlocks after** | N5.1 |
| **Icon** | 📌 |
| **Estimated minutes** | 25 |
| **Particles** | `は`, `が`, `の`, `か`, `を` |

**What to teach:**
- は as topic marker:
  - Marks what the sentence is about
  - Pronounced "wa" not "ha"
  - Used for known/established information
  - Contrast function: Aは X、Bは Y
- が as subject marker:
  - Marks who/what performs the action
  - Used for new information or emphasis
  - Used after question words (だれが, 何が)
  - Required with certain predicates (好き, 分かる, ある, いる)
- の for possession and noun connection:
  - A の B = A's B (possession)
  - Noun modification (日本の食べ物)
  - The "primary meaning" hierarchy from the PDF
- か for questions:
  - Sentence-final question marker
  - "Or" grouping: A か B
- を as object marker:
  - Marks the direct object of a transitive verb
  - Pronounced "o" (not "wo") in modern speech
  - "Motion through" usage (公園を歩く — walk through the park)
  - Note: at this stage students only have ある as a verb. Use hiragana verbs with glosses (e.g. よびます = call, よみます = read) to demonstrate を patterns. Formal verb instruction begins in G5.

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — は topic marker
3. `grammarRule` — が subject marker
4. `grammarComparison` — は vs が (use same sentence, different particle)
5. `grammarRule` — の possession/connection
6. `grammarRule` — か questions and "or"
7. `grammarRule` — を object marker
8. `annotatedExample` — mixed particle usage in natural sentences
9. `conversation` — dialogue demonstrating all five particles
10. `fillSlot` — choose the right particle (は/が/の/か/を)
11. `drills` — mixed MCQ

**Available vocabulary context:** Same as G1 — all N5.1 vocabulary. Verbs beyond ある may be used in hiragana with inline glosses to demonstrate を patterns.

---

### G3 — Core Particles II: も, と, や, から, まで, に (time)

| Field | Value |
|---|---|
| **ID** | `G3` |
| **Level** | N5 |
| **Unlocks after** | N5.2 |
| **Icon** | 📌 |
| **Estimated minutes** | 30 |
| **Particles** | `も`, `と`, `や`, `から`, `まで`, `に` (time use only) |

**What to teach:**
- も for "also/even":
  - Replaces は, が, or を (not added alongside them)
  - "Also" in positive: わたしもがくせいです
  - "Either" in negative: わたしもわかりません
  - Note: も REPLACES は/が/を — do not write わたしはも or わたしがも
- と for complete "and" / "with":
  - Complete list: A と B (only A and B, nothing else)
  - "Together with": 友だちと いっしょに
  - Quoted speech: 「…」と言う (note: いう not yet formally taught, use hiragana with gloss)
- や for incomplete "and":
  - Incomplete list: A や B (A, B, and others)
  - Often paired with など (etc.)
- から / まで:
  - から = starting point (time): 月曜日から; 今日から
  - まで = ending point (time): 金曜日まで; 今月まで
  - から…まで as a pair: 月曜日から金曜日まで (from Monday to Friday)
  - までに = "by" (deadline): 金曜日までに
  - Note: at this stage, place-based examples are limited. Focus on time expressions using days of the week and time words from N5.2. Place-based から/まで (東京から, 学校まで) can be reinforced after N5.5 when location vocabulary is available.
- に for specific time ("on/at a specific time"):
  - Specific day: 月曜日に (on Monday), 金曜日に (on Friday)
  - Specific date: 一日に (on the 1st), 三日に (on the 3rd)
  - **Critical rule to teach:** Specific/fixed time words → に. Relative/floating time words → NO に.
    - 月曜日に ✓ | 毎日 ✗ (no に) | 今日 ✗ (no に) | 今月 ✗ (no に)
  - Scope at G3: days of the week and dates from N5.2/N5.3. Clock times (三時に) will be reinforced in N5.4. Destination use (学校に行く) is taught in G4 after N5.5.
  - Rationale: N5.2 introduces days of the week; students naturally need に to say "on Monday" from the very first lesson it appears. Teaching に's time-connector role here prevents broken conversation patterns.

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — も also/even (note: replaces, doesn't stack)
3. `grammarRule` — と complete "and" / "with"
4. `grammarRule` — や incomplete "and"
5. `grammarComparison` — と vs や
6. `grammarRule` — から and まで (from/until)
7. `grammarRule` — に for specific time (days/dates; critical: relative words don't take に)
8. `annotatedExample` — all particles in natural sentences using N5.1+N5.2 vocab
9. `conversation` — dialogue using these particles with days/time context (include に naturally)
10. `fillSlot` — choose the right particle (も/と/や/から/まで/に)
11. `drills` — mixed MCQ

**Available vocabulary context:** All vocabulary through N5.2. This adds days of the week (月曜日–日曜日), time expressions (毎日, 今日, 今月), elemental nouns (水, 木, 火, 金, 土), and number-based terms. Days of the week are ideal for から/まで and に examples. Listing particles (と/や) work well with family terms and days.

---

### G4 — Core Particles III: に (destination/existence), で, へ

| Field | Value |
|---|---|
| **ID** | `G4` |
| **Level** | N5 |
| **Unlocks after** | N5.5 |
| **Icon** | 📌 |
| **Estimated minutes** | 25 |
| **Particles** | `に` (destination/existence uses), `で`, `へ` |

**Scope note:** に's time-connector role (specific days, dates, clock times) was introduced in G3. G4 extends に to its destination and existence-location roles, which require motion verbs (行く, 来る from N5.5) and existence verbs (いる from N5.4) not yet available at G3.

**What to teach:**
- に as "destination / existence-location" particle (extending the G3 time use):
  - Destination of movement (学校に行く — now available with 行く from N5.5)
  - Location of existence with いる/ある (部屋に猫がいる — いる from N5.4)
  - Indirect object / recipient (友だちに本をあげる)
  - Frequency (一週間に二回)
  - Cross-reference G3: remind students that specific times (月曜日に, 三時に) were the first use they learned; this lesson adds the destination and location uses
  - Note: relative time words (今日, 明日, 昨日) do NOT take に (also established in G3)
- で as "enabling" particle:
  - Location of action (学校で勉強する — places from N5.5)
  - Means/tool (バスで行く — 行く from N5.5)
  - Material (木で作る)
  - Reason (びょうきで やすみます)
- へ as directional:
  - Direction of movement (駅へ行く — 駅 from N5.5)
  - Interchangeable with に for destinations, but emphasizes the direction rather than arrival
  - Pronounced "e" (not "he") as a particle

**Key distinction to teach:** に vs で for location. This is the most important comparison:
- に marks WHERE something EXISTS (いる/ある): へやに います (is in the room)
- で marks WHERE an action TAKES PLACE: へやで べんきょうします (study in the room)
- Rule: "Is something EXISTING somewhere? → に. Is something HAPPENING somewhere? → で."

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — に destination and existence-location (review time use from G3; add new uses)
3. `grammarRule` — で enabling particle (cover all uses)
4. `grammarComparison` — に vs で (location of existence vs location of action)
5. `grammarRule` — へ direction (and comparison with に for destinations)
6. `annotatedExample` — に in its destination/existence roles
7. `annotatedExample` — で in its various roles
8. `conversation` — dialogue using all three particles naturally with places and motion verbs
9. `fillSlot` — choose に/で/へ
10. `patternMatch` — identify correct に vs で usage
11. `drills` — mixed MCQ

**Available vocabulary context:** All vocabulary through N5.5. This now includes motion verbs (行く, 来る), places (店, 駅, 家), time expressions (時, 分, 週), and existence verbs (いる from N5.4, ある from N5.1). This rich vocabulary set enables natural, meaningful examples for all three particles — destinations with 行く/来る, existence locations with いる/ある, action locations with で.

---

### G5 — Verb Types: RU-Verbs vs U-Verbs vs Irregulars

| Field | Value |
|---|---|
| **ID** | `G5` |
| **Level** | N5 |
| **Unlocks after** | N5.5 |
| **Icon** | 🔧 |
| **Estimated minutes** | 20 |
| **Grammar forms** | (identification, no specific conjugation forms) |

**What to teach:**
- RU-verbs (ichidan): end in -いる or -える; drop る to get stem
- U-verbs (godan): end in any う-column sound; shift to い-column for stem
- The "shift" system: how the final hiragana moves rows (う→い for ます, う→あ for ない, etc.)
- する and くる as the two irregular verbs
- **Tricky U-verbs that look like RU-verbs:** 入る (はいる), 知る (しる), 切る (きる), 帰る (かえる), 走る (はしる), 要る (いる), etc.
- The special わ ending: U-verbs ending in う use わ in negative (言う → 言わない)
- Why verb type matters: it determines which conjugation rule to apply

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — RU-verb identification and stem extraction
3. `grammarRule` — U-verb identification and the "shift" system
4. `grammarTable` — hiragana chart showing the row shift pattern (う→い, う→あ, etc.)
5. `grammarComparison` — RU-verb vs U-verb (side by side with same conjugation applied)
6. `grammarRule` — する and くる irregular patterns
7. `grammarRule` — tricky U-verbs that look like RU-verbs (with memorization list)
8. `patternMatch` — "Is this a RU-verb or U-verb?" (student classifies verbs)
9. `drills` — mixed MCQ on verb type identification

**Available vocabulary context:** Through N5.5, which introduces 行く, 来る, する, 食べる, and other foundational verbs. Good variety for drilling.

---

### G6 — Polite Verb Forms (ます System)

| Field | Value |
|---|---|
| **ID** | `G6` |
| **Level** | N5 |
| **Unlocks after** | N5.5 |
| **Icon** | 🎩 |
| **Estimated minutes** | 25 |
| **Grammar forms** | `polite_masu`, `polite_mashita`, `polite_negative`, `polite_past_negative` |

**What to teach:**
- How to form the ます-stem from each verb type:
  - RU-verbs: drop る, add ます (食べる → 食べます)
  - U-verbs: shift to い-column, add ます (話す → 話します)
  - する → します, くる → きます
- Four polite forms:
  - Present/future: ～ます (食べます)
  - Past: ～ました (食べました)
  - Negative: ～ません (食べません)
  - Past negative: ～ませんでした (食べませんでした)
- Progressive: ～ています (食べています) — introduced as a polite form

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — how to form the ます-stem (per verb type)
3. `grammarTable` — full 4-form conjugation table (RU-verb, U-verb, する, くる, at least 2 U-verb examples with different endings)
4. `annotatedExample` — each form in a natural sentence
5. `conversation` — dialogue using all four forms naturally
6. `conjugationDrill` — convert dictionary form → ます (mix verb types)
7. `sentenceTransform` — convert between the four polite forms
8. `drills` — mixed MCQ

**Available vocabulary context:** Through N5.5.

---

### G7 — て-Form & た-Form Construction

| Field | Value |
|---|---|
| **ID** | `G7` |
| **Level** | N5 |
| **Unlocks after** | N5.5 |
| **Icon** | 🔗 |
| **Estimated minutes** | 25 |
| **Grammar forms** | `te_form`, `plain_past` |

**What to teach:**
- て-form construction rules:
  - RU-verbs: drop る, add て (食べる → 食べて)
  - U-verbs by ending:
    - う, つ, る → って (買う→買って, 待つ→待って, 帰る→帰って)
    - ぶ, む, ぬ → んで (飛ぶ→飛んで, 飲む→飲んで, 死ぬ→死んで)
    - く → いて (書く→書いて)
    - ぐ → いで (泳ぐ→泳いで)
    - す → して (話す→話して)
  - 行く exception: 行って (not 行いて)
  - する → して, くる → きて
- た-form follows identical rules but with た/だ instead of て/で
- Usage preview: てください (polite request), ないでください (negative request)
- ～なさい (firm polite command):
  - Verb ます-stem + なさい (食べなさい — "Eat." / "You should eat.")
  - Softer than plain commands but more directive than てください
  - Used by teachers, parents, and authority figures to give instructions
  - Does NOT attach to the て-form — attaches to the ます-stem directly
  - Negative: ～なさい has no standard negative; use ないでください for "don't"

**Recommended sections:**
1. `grammarIntro`
2. `grammarTable` — the complete TE/TA ending chart (U-verb ending → て-form ending → た-form ending)
3. `grammarRule` — RU-verb て-form (simple)
4. `grammarRule` — U-verb て-form (by ending group, with the chart as reference)
5. `grammarRule` — 行く exception + irregular て-forms
6. `grammarRule` — てください and ないでください
7. `grammarRule` — ～なさい (firm polite command using ます-stem)
8. `annotatedExample` — て-form in request and command contexts
9. `conversation` — dialogue with てください and なさい usage
10. `conjugationDrill` — dictionary form → て-form (heavy U-verb focus, include 行く)
11. `drills` — mixed MCQ

**Available vocabulary context:** Through N5.5. Include all available verbs for maximum drill variety.

---

### G8 — Progressive, Desire, Suggestions & Conjecture

| Field | Value |
|---|---|
| **ID** | `G8` |
| **Level** | N5 |
| **Unlocks after** | N5.8 |
| **Icon** | 🎯 |
| **Estimated minutes** | 25 |
| **Grammar forms** | `te_form`, `desire_tai`, `polite_volitional_mashou` |

**What to teach:**
- ている (progressive and resultant state):
  - Ongoing action: 食べている (is eating)
  - Resultant state: 知っている (knows — result of having learned)
  - Polite: ています / Informal: ている/てる
- たい / たくない (want to / don't want to):
  - Verb stem + たい: 食べたい (want to eat)
  - Negative: 食べたくない (don't want to eat)
  - たい conjugates like an i-adjective
  - Polite: たいです / たくないです
  - Note: たい is for the speaker's own desire only; use ～たがる for others
- ましょう / ましょうか (let's / shall we):
  - ましょう: suggestion/invitation (行きましょう — let's go)
  - ましょうか: offer/question (持ちましょうか — shall I carry it?)
- でしょう / だろう (conjecture / probability):
  - でしょう: polite conjecture — 明日は雨でしょう (It will probably rain tomorrow)
  - だろう: plain conjecture — 明日は雨だろう (same meaning, more direct/casual)
  - Used to express what the speaker guesses or assumes to be likely
  - Rising intonation でしょう↑ turns it into a rhetorical question seeking agreement
  - Note: だろう is more direct; でしょう is safer when uncertain
  - **NOT to be confused with ましょう:** ましょう is a volitional (let's do); でしょう is a statement about probability

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — ている progressive
3. `grammarRule` — ている resultant state
4. `grammarRule` — たい desire
5. `grammarRule` — ましょう suggestions
6. `grammarRule` — でしょう/だろう conjecture (with distinction from ましょう)
7. `grammarComparison` — でしょう vs だろう (register difference, same meaning)
8. `annotatedExample` — all patterns in context
9. `conversation` — planning dialogue incorporating guesses and suggestions
10. `sentenceTransform` — plain form → progressive / desire / suggestion
11. `drills` — mixed MCQ

**Available vocabulary context:** Through N5.8. Richer verb vocabulary available by this point.

---

### G9 — Plain Forms & Basic Connectors

| Field | Value |
|---|---|
| **ID** | `G9` |
| **Level** | N5 |
| **Unlocks after** | N5.9 |
| **Icon** | 👋 |
| **Estimated minutes** | 30 |
| **Grammar forms** | `plain_past`, `plain_negative`, `plain_past_negative` |

This is the pivotal lesson where students transition from polite-only speech to real conversational Japanese. By the end of G9 students can form compound sentences, express reason, concession, and give commands — all the tools needed to move beyond single-clause polite speech throughout N4.

**What to teach:**

*Plain form conjugation:*
- Plain present: dictionary form (食べる, 話す, する, くる)
- Plain past: た-form (食べた, 話した, した, きた) — references G7
- Plain negative:
  - RU-verbs: drop る, add ない (食べない)
  - U-verbs: shift to あ-column, add ない (話さない, 書かない)
  - Special: う→わ+ない (言わない, 買わない)
  - する → しない, くる → こない
- Plain past negative: ない → なかった (食べなかった, 話さなかった)
- When to use plain vs polite: with friends/family, in casual settings, in subordinate clauses

*Clause connectors (using plain form):*
- が — "but" (clause-linking, formal/polite): 行きたいですが、時間がありません
  - Teaches the high-frequency connector that students encounter from day one of N4 content
  - が as "but" attaches mid-sentence to clause-ending forms (polite or plain)
  - Not the same as が subject marker (G2) — different grammar role entirely
- けど / けれど — "but" (informal/casual equivalent): 行きたいけど、時間がない
  - けど is casual spoken Japanese; けれど is slightly more formal but less stiff than が
  - Both connect two clauses with a contrasting or softening relationship
  - Common as sentence-enders for polite softening: ～んですけど... (trailing off)
- から — "because" (reason clause + から): 暑いから、冷たい水を飲みます (Because it's hot, I'll drink cold water)
  - Reason clause comes FIRST in Japanese (opposite of English word order)
  - Plain form + から in casual speech; polite form + から in polite speech
  - Note: から was taught in G3 as a starting-point particle ("from"). This is a different role — teach the distinction explicitly.
- ので — "because" (softer, more objective): 暑いので、冷たい水を飲みます
  - More formal and indirect than から; often preferred in writing and polite speech
  - のに distinction preview: ので explains reason; のに (G18) expresses "even though"
  - Uses plain form + ので (but na-adjective/noun + な + ので)

*Plain commands:*
- Plain imperative (strong/blunt):
  - RU-verbs: drop る, add ろ (食べろ — "Eat!")
  - U-verbs: shift to え-column (話せ — "Speak!", 書け — "Write!")
  - する → しろ, くる → こい
  - ⚠ Usually considered rude; used by anime characters, drill sergeants, very close friends jokingly
- Informal negative command ～な (plain prohibition):
  - Dictionary form + な: 食べるな — "Don't eat!" (strong/blunt prohibition)
  - ⚠ Also rude/very direct; used in emergencies or emphatic prohibitions
  - Contrast: ないでください (G7) is the polite version; ～な is the blunt plain version

*Explanatory form のです / なんです:*
- だ changes to な before の/ん: 先生なんです (It's that [he] is a teacher)
- Used to explain, justify, or gently emphasize
- Polite: ～なんです / ～のです
- Casual: ～なんだ / ～のだ (often shortened to ～んだ)
- Prerequisite: requires plain form knowledge (taught above) since plain form + の/ん is the construction

**Recommended sections:**
1. `grammarIntro`
2. `grammarTable` — complete plain form chart (present/past/negative/past-negative × RU/U/する/くる)
3. `grammarRule` — plain negative formation (with the あ-column shift)
4. `grammarComparison` — polite vs plain side-by-side
5. `grammarRule` — が (but) and けど as clause connectors (explain distinction from が subject marker)
6. `grammarRule` — から and ので (because) — reason clause pattern; distinguish から as "from" (G3) vs "because"
7. `grammarComparison` — から vs ので (same meaning, different nuance and formality)
8. `grammarRule` — plain commands (～ろ/～え) and plain prohibition (～な) — with strong warnings about register
9. `grammarRule` — のです/なんです (explanatory) — requires plain form as prerequisite
10. `conversation` — same scenario in formal then informal versions, incorporating が/けど/から naturally
11. `conjugationDrill` — dictionary form → plain negative
12. `sentenceTransform` — polite → plain conversion; combine two clauses with が/から
13. `fillSlot` — choose が/けど/から/ので in context
14. `drills` — mixed MCQ

**Available vocabulary context:** Through N5.9.

---

### G10 — i-Adjective Conjugation

| Field | Value |
|---|---|
| **ID** | `G10` |
| **Level** | N5 |
| **Unlocks after** | N5.10 |
| **Icon** | 🎨 |
| **Estimated minutes** | 25 |
| **Grammar forms** | `polite_adj`, `polite_past_adj`, `plain_negative`, `plain_past`, `plain_past_negative`, `te_form`, `adverbial` |

**What to teach:**
- Core i-adjective conjugation paradigm:
  - Adverb form: ～く (高い → 高く = highly)
  - て-form: ～くて (高い → 高くて)
  - Past: ～かった (高い → 高かった)
  - Negative: ～くない (高い → 高くない)
  - Past negative: ～くなかった
- Polite forms: add です (高いです, 高かったです, 高くないです, 高くなかったです)
- **いい → よい exception:** いい conjugates as よい (よかった, よくない, よくて, etc.) — NEVER いかった, いくない
- **Not taught here:** ～ければ conditional (G20), ～すぎる excessive (G15), ～さ noun form (G15)

**Recommended sections:**
1. `grammarIntro`
2. `grammarTable` — i-adjective conjugation chart (the 7 core forms only)
3. `grammarRule` — the いい → よい exception (with emphasis — this is the #1 student error)
4. `grammarRule` — adverb form ～く (how adjectives become adverbs)
5. `annotatedExample` — i-adjectives in various forms in context
6. `conversation` — weather/nature dialogue (matches N5.10 theme) using adjective forms
7. `conjugationDrill` — conjugate i-adjectives to target forms
8. `sentenceTransform` — present → past, positive → negative
9. `drills` — mixed MCQ (include いい conjugation traps)

**Available vocabulary context:** Through N5.10. Weather and energy vocabulary available — ideal for adjective-heavy content.

---

### G11 — na-Adjective Conjugation

| Field | Value |
|---|---|
| **ID** | `G11` |
| **Level** | N5 |
| **Unlocks after** | N5.11 |
| **Icon** | 🎨 |
| **Estimated minutes** | 20 |
| **Grammar forms** | `polite_adj`, `polite_past_adj`, `plain_negative`, `plain_past`, `plain_past_negative`, `te_form`, `adverbial` |

**What to teach:**
- na-adjective conjugation paradigm:
  - Before nouns: ～な (静かな部屋)
  - Adverb form: ～に (静かに歩く)
  - て-form: ～で (静かで広い)
  - Present polite: 静かです
  - Past polite: 静かでした
  - Negative polite: 静かではありません / 静かじゃありません
  - Past negative polite: 静かではありませんでした
  - Plain past: 静かだった
  - Plain past negative: 静かじゃなかった / 静かではなかった
  - Drop な before forms of である
- Easily confused na-adjectives (words that look like i-adjectives but aren't):
  - きれい (pretty) — NOT きれいい
  - 有名 (famous)
  - 嫌い (disliked)
  - If any of these are available in taught vocabulary, use them as examples
- Combining adjectives: i-adj くて + na-adj で in chains
- **Not taught here:** ～すぎる excessive (G15), ～さ noun form (G15)

**Recommended sections:**
1. `grammarIntro`
2. `grammarTable` — na-adjective conjugation chart
3. `grammarComparison` — i-adjective vs na-adjective (side-by-side conjugation comparison)
4. `grammarRule` — easily confused na-adjectives
5. `grammarRule` — chaining adjectives (くて/で)
6. `annotatedExample` — na-adjectives describing places and people
7. `conversation` — nature/environment dialogue (matches N5.11 theme)
8. `conjugationDrill` — conjugate na-adjectives
9. `drills` — mixed MCQ (include i-adj vs na-adj traps)

**Available vocabulary context:** Through N5.11.

---

## Full Lesson Map: N4 Grammar (G12–G23)

> **Note:** The exact `unlocksAfter` lesson for N4 grammar should be determined when the N4 lessons are being built. The values below are approximate placements. The user will set final values.

---

### G12 — Potential Form (Can / Able to)

| Field | Value |
|---|---|
| **ID** | `G12` |
| **Level** | N4 |
| **Unlocks after** | ~N4.3 (TBD by user) |
| **Icon** | 💪 |
| **Estimated minutes** | 25 |
| **Grammar forms** | `potential`, `potential_negative` |

**What to teach:**
- Potential form construction:
  - RU-verbs: drop る, add られる (食べる → 食べられる)
  - U-verbs: shift to え-column, add る (話す → 話せる, 書く → 書ける)
  - する → できる, くる → こられる
- Colloquial shortening: RU-verb られる → れる (食べれる) — note this is informal
- Particle shift: を often becomes が with potential (日本語が話せる)
- Negative potential: ～られない / ～えない
- Polite forms: ～られます / ～えます

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — potential form construction per verb type
3. `grammarTable` — potential form chart (RU, U, する, くる)
4. `grammarRule` — particle shift を → が
5. `grammarRule` — colloquial shortening (られる → れる)
6. `annotatedExample` — expressing abilities in various contexts
7. `conversation` — discussing what one can/can't do
8. `conjugationDrill` — dictionary form → potential form
9. `sentenceTransform` — make it "can do" / "can't do"
10. `drills` — mixed MCQ

---

### G13 — Transitive & Intransitive Verb Pairs (自動詞・他動詞)

| Field | Value |
|---|---|
| **ID** | `G13` |
| **Level** | N4 |
| **Unlocks after** | N4.10 |
| **Icon** | 🔀 |
| **Estimated minutes** | 25 |

**What to teach:**

*The concept:*
- Japanese verbs often come in pairs: a **transitive** (他動詞) verb that takes a direct object (someone does something to something), and an **intransitive** (自動詞) verb that describes something happening on its own (no agent required).
- English often uses the same word for both ("I open the door" / "The door opens"), but Japanese uses two different verbs.

*Core pattern recognition:*
- Ichidan (RU-verb) transitive + Godan (U-verb) intransitive is the most common pairing:
  - 開ける (あける, ichidan) = to open (something) ↔ 開く (あく, godan) = to open (by itself)
  - 入れる (いれる, ichidan) = to put in ↔ 入る (はいる, godan) = to enter
  - 始める (はじめる, ichidan) = to start (something) ↔ 始まる (はじまる, godan) = to begin
  - 集める (あつめる, ichidan) = to collect ↔ 集まる (あつまる, godan) = to gather
  - 止める (とめる, ichidan) = to stop (something) ↔ 止まる (とまる, godan) = to stop
- The reverse pattern also exists (godan transitive + ichidan intransitive):
  - 出す (だす, godan) = to take out ↔ 出る (でる, ichidan) = to exit

*Morphological clues:*
- ～える / ～ける endings → often transitive (開ける, 付ける, 始める)
- ～ある / ～く endings → often intransitive (始まる, 集まる, 開く)
- ～す endings → almost always transitive (出す, 消す, 直す)
- ～れる endings → often intransitive (壊れる, 離れる, 倒れる)
- These are tendencies, not absolute rules — but they help students guess correctly

*Particle changes:*
- Transitive verbs take を for the direct object: ドアを開ける (open the door)
- Intransitive verbs take が for the subject that changes state: ドアが開く (the door opens)
- This particle difference is a reliable cue: if you see を, the verb is likely transitive; if you see が with a non-human subject, likely intransitive

*Common mistakes:*
- Using the transitive form without an object: ×ドアが開ける (should be ドアが開く)
- Using the intransitive form with を: ×ドアを開く (should be ドアを開ける, though 開く can be transitive in literary contexts)

*Available pairs by this point in the curriculum:*
- N5.17: 出る/出す, 入る/入れる (students have been using these since N5 — now they learn *why* the forms differ)
- N4.10: 始まる/始める (the lesson this grammar module unlocks after)

**Recommended sections:**
1. `grammarIntro` — why Japanese needs two verbs where English uses one; the 自動詞/他動詞 concept
2. `grammarRule` — transitive verbs (他動詞): agent + を + verb (someone does something to something)
3. `grammarRule` — intransitive verbs (自動詞): subject + が + verb (something happens on its own)
4. `grammarTable` — chart of known pairs (出る/出す, 入る/入れる, 始まる/始める) with particle patterns
5. `grammarRule` — morphological clues (～える = transitive, ～ある = intransitive, ～す = transitive)
6. `grammarComparison` — transitive vs intransitive with the same kanji (始める vs 始まる — "I start class" vs "Class starts")
7. `annotatedExample` — pairs in natural daily-life sentences
8. `conversation` — dialogue where both forms appear naturally (e.g. discussing opening/closing a shop, entering/putting things in a room)
9. `fillSlot` — choose the correct verb from the pair given context (を/が cue + meaning)
10. `drills` — mixed MCQ

**Available vocabulary context:** Through N4.10. Three complete pairs are available (出る/出す, 入る/入れる, 始まる/始める). Later pairs (集まる/集める N4.30, 開く/開ける N4.31, 止まる/止める N4.35) are not yet in scope but can be referenced in the grammarRule morphological-clues section as "patterns you'll see later."

---

### G14 — Give & Receive (あげる / もらう / くれる)

| Field | Value |
|---|---|
| **ID** | `G14` |
| **Level** | N4 |
| **Unlocks after** | ~N4.5 (TBD) |
| **Icon** | 🎁 |
| **Estimated minutes** | 25 |
| **Grammar forms** | `te_form` |

**What to teach:**

*The three core give/receive verbs:*
- あげる — give (I/insider give to someone else or an outsider):
  - わたしは友だちにプレゼントをあげます (I give a present to my friend)
  - Direction: speaker/insider → recipient
- くれる — give (someone gives TO me or my insider group):
  - 友だちはわたしにプレゼントをくれます (My friend gives a present to me)
  - Direction: giver → speaker/insider (the beneficiary perspective is "me")
  - Key distinction: same physical transfer as あげる, but told from the receiving side's perspective
- もらう — receive (I/insider receive from someone):
  - わたしは友だちにプレゼントをもらいます (I receive a present from my friend)
  - The giver is marked with に (or から for more distance)

*Perspective is everything:* The same gift-giving event can be described with あげる (giver's view), くれる (receiver's view emphasizing the benefit to me), or もらう (receiver actively acquiring).

*て-form + give/receive (doing something as a favor):*
- て-form + あげる — do something for someone (you → them): 教えてあげる (I'll explain it for you)
- て-form + くれる — someone does something for me (them → me): 教えてくれた (they explained it for me)
- て-form + もらう — receive the benefit of someone doing something: 教えてもらった (I had them explain it to me / got them to explain)

*Honorific/humble variants (introduce as reference — active use is N3+):*
- さしあげる — humble あげる (I humbly give to a superior)
- いただく — humble もらう (I humbly receive from a superior)
- くださる → ください — honorific くれる (a superior gives to me); てください is the request form already taught in G7

**Recommended sections:**
1. `grammarIntro` — the Japanese "gift economy" of verbs; why directionality matters
2. `grammarRule` — あげる (giving out from speaker/insider group)
3. `grammarRule` — くれる (someone gives to me/insider — benefit perspective)
4. `grammarComparison` — あげる vs くれる (same action, different perspective)
5. `grammarRule` — もらう (I receive — active acquisition framing)
6. `grammarTable` — full give/receive chart (plain + honorific/humble variants as reference)
7. `grammarRule` — て-form + あげる/もらう/くれる (doing favors)
8. `annotatedExample` — give/receive in daily scenarios (gifts, helping, favors)
9. `conversation` — gift-giving scene, asking for help, expressing thanks
10. `fillSlot` — choose あげる/くれる/もらう in context
11. `drills` — mixed MCQ

**Available vocabulary context:** Through ~N4.5. The verbs あげる, もらう, くれる may be written in hiragana if not yet in the glossary; add inline glosses. くださる is already known as ください from G7 — teach the connection explicitly.

---

### G15 — Comparison & Degree (より, ほう, ほど, くらい)

| Field | Value |
|---|---|
| **ID** | `G15` |
| **Level** | N4 |
| **Unlocks after** | ~N4.5 (TBD) |
| **Icon** | ⚖️ |
| **Estimated minutes** | 25 |
| **Particles** | `より`, `ほう`, `ほど`, `くらい`/`ぐらい` |
| **Grammar forms** | `sugiru_form` |

**What to teach:**
- ほうが — the preferred/greater element: Aのほうが＋adjective (東京のほうが大きい)
- より — the lesser element: AよりBのほうが＋adjective (東京より大阪のほうが好きです)
- ほど — degree / negative comparison: AはBほど～ない (東京は大阪ほど暑くない = Tokyo isn't as hot as Osaka)
- くらい / ぐらい — approximate degree: ～くらい大きい (about that big); ～時間ぐらい (about X hours)
- ～すぎる — excessive degree (too much / too ～):
  - Verbs: ます-stem + すぎる (食べすぎる = eat too much)
  - i-adjectives: drop い + すぎる (高すぎる = too expensive)
  - na-adjectives: add すぎる directly (静かすぎる = too quiet)
  - Polite: すぎます / すぎました; negative: すぎません
  - Note: すぎる is itself an ichidan verb and conjugates normally after the stem
- ～さ — noun form of adjectives (abstract quality as a noun):
  - i-adjectives: drop い + さ (高い → 高さ = height; 大きい → 大きさ = size; 速い → 速さ = speed)
  - na-adjectives: drop な/だ + さ (静か → 静かさ = quietness; 便利 → 便利さ = convenience)
  - Used when the quality itself is the subject/topic, not the thing described: この山の高さ (the height of this mountain)
  - Naturally arises in comparison contexts: 二つの大きさを比べる (compare the sizes of two things)
  - Note: ～さ is a productive suffix but not a conjugation form — it is word derivation. Only the most common instances need to appear in the glossary; it does not need a `conjugation_rules.json` entry.

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — ほうが pattern (×1)
3. `grammarRule` — より pattern (×1)
4. `grammarRule` — ほど negative comparison (×1)
5. `grammarRule` — くらい/ぐらい approximate (×1)
6. `grammarRule` — ～すぎる excessive degree (×1)
7. `grammarRule` — ～さ noun form of adjectives (×1)
8. `grammarComparison` — より vs ほど (when to use which)
9. `annotatedExample` — comparing foods, places, activities; excessive degree and abstract quality expressions in context
10. `conversation` — dialogue about preferences and quantities
11. `fillSlot` — choose より/ほう/ほど/くらい/すぎる
12. `drills` — mixed MCQ

---

### G16 — Limiting Particles (だけ, しか, ばかり, でも)

| Field | Value |
|---|---|
| **ID** | `G16` |
| **Level** | N4 |
| **Unlocks after** | ~N4.7 (TBD) |
| **Icon** | 🔒 |
| **Estimated minutes** | 20 |
| **Particles** | `だけ`, `しか`, `ばかり`, `でも` |

**What to teach:**
- だけ — just/only: 水だけ飲む (drink only water); できるだけ (as much as possible)
- しか — firm limit, ALWAYS with negative verb: 水しか飲まない (drink nothing but water)
- ばかり — nothing but / only: 肉ばかり食べる (eat nothing but meat); ～たばかり (just did ~)
- でも — even / any~: 子どもでもわかる (even a child understands); 何でも (anything), いつでも (anytime)

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — だけ (×1)
3. `grammarRule` — しか + negative (×1)
4. `grammarComparison` — だけ vs しか (same meaning, different grammar)
5. `grammarRule` — ばかり (×1)
6. `grammarRule` — でも (×1)
7. `annotatedExample` — limiting particles in daily life contexts
8. `conversation` — dialogue about habits or restrictions
9. `fillSlot` — choose だけ/しか/ばかり/でも
10. `drills` — mixed MCQ

---

### G17 — Connecting Actions (てから, まえに, ながら, ために, ～たり)

| Field | Value |
|---|---|
| **ID** | `G17` |
| **Level** | N4 |
| **Unlocks after** | ~N4.10 (TBD) |
| **Icon** | ⛓️ |
| **Estimated minutes** | 25 |
| **Grammar forms** | `te_form`, `tari_form` |

**What to teach:**
- てから — after doing: 食べてから出かける (go out after eating)
- あとで — after (more casual): 食べたあとで (after eating)
- まえに — before doing: 食べるまえに (before eating) — note: verb stays in dictionary form
- ために — in order to: 勉強するために (in order to study)
- ながら — while doing simultaneously: 音楽を聞きながら勉強する (study while listening to music)
- ～たり～たりする — non-exhaustive action listing:
  - た-form + り, repeated: 食べたり飲んだりする (do things like eat and drink)
  - Implies the list is not exhaustive — "among other things"
  - Ends with する (or します in polite form)
  - Commonly used to describe a typical day or weekend activities
  - Formation: same sound-change rules as た-form (G7); just add り instead of nothing

**Note:** から and ので (because) were taught as basic connectors in G9. G17 focuses on sequential, simultaneous, purposive, and non-exhaustive action patterns. Do not re-teach から/ので here — reinforce them through example sentences where appropriate.

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — てから and あとで (×1)
3. `grammarRule` — まえに (×1)
4. `grammarRule` — ために (×1)
5. `grammarRule` — ながら (×1)
6. `grammarRule` — ～たり～たりする (×1)
7. `annotatedExample` — daily routine descriptions using time connectors
8. `conversation` — planning a day / travel itinerary
9. `sentenceTransform` — combine two sentences using てから/まえに/ながら/たり
10. `drills` — mixed MCQ

---

### G18 — Contrast & Concession (のに, ても)

| Field | Value |
|---|---|
| **ID** | `G18` |
| **Level** | N4 |
| **Unlocks after** | ~N4.14 (TBD) |
| **Icon** | 🌀 |
| **Estimated minutes** | 20 |
| **Grammar forms** | `te_form` |

**What to teach:**

- のに — "even though / despite" (expressing unexpectedness or complaint):
  - Plain form + のに: 勉強したのに、わからない (Even though I studied, I don't understand)
  - Expresses that the result is contrary to what the speaker expected or felt was fair
  - Common in complaints, surprised observations, and expressing frustration
  - Formation: same plain form rules as から/ので; copula da → na before のに (noun/na-adj + なのに)
  - Key distinction: ので (G9) explains a reason for something; のに contrasts an expected vs actual outcome

- ても — "even if / even though" (conditional concession):
  - て-form + も: 食べても、まだお腹がすいている (Even if I eat, I'm still hungry)
  - Expresses that the outcome holds regardless of the action
  - たとえ～ても reinforces: たとえ難しくても (even if it's difficult)
  - For nouns/na-adjectives: でも (雨でも行く — even if it rains, I'll go)
  - Note: ても is the concessive "even if"; てもいい (G19) is a separate construction meaning "it's okay to" — teach the distinction explicitly to prevent confusion

*Sentence-starting contrast adverbs (for reference):*
- しかし — however (formal/written)
- でも — but (informal, sentence-starting); same word, different position and function from ても
- だけど — but (casual spoken)
- ただし — however / provided that (formal qualification)

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — のに (even though — complaint/unexpectedness)
3. `grammarRule` — ても (even if — concessive conditional)
4. `grammarComparison` — のに vs ので (contrast vs reason — same-sounding, opposite meaning direction)
5. `grammarComparison` — ても vs てもいい (concession vs permission — prevent conflation)
6. `annotatedExample` — のに and ても in real complaint and hypothetical contexts
7. `conversation` — dialogue with frustrated observations and hypotheticals
8. `fillSlot` — choose のに/ても/ので in context
9. `drills` — mixed MCQ

---

### G19 — Permissions & Prohibitions (てもいい, てはいけない)

| Field | Value |
|---|---|
| **ID** | `G19` |
| **Level** | N4 |
| **Unlocks after** | ~N4.21 (TBD) |
| **Icon** | 🚦 |
| **Estimated minutes** | 20 |

**What to teach:**
- てもいい — may / it's okay to: 食べてもいいですか (may I eat?)
- てはいけない — must not / it's not okay to: ここで食べてはいけません (you must not eat here)
- Informal: てもいい → ていい; てはいけない → ちゃいけない / ちゃだめ

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — てもいい permission (×1)
3. `grammarRule` — てはいけない prohibition (×1)
4. `grammarComparison` — permission vs prohibition side by side
5. `annotatedExample` — rules and permissions in school/work/home
6. `conversation` — asking permission and stating rules
7. `patternMatch` — identify permission vs prohibition sentences
8. `drills` — mixed MCQ

---

### G20 — Obligations & Conditionals (なければ, ば, たら, なら, と)

| Field | Value |
|---|---|
| **ID** | `G20` |
| **Level** | N4 |
| **Unlocks after** | ~N4.25 (TBD) |
| **Icon** | 🔀 |
| **Estimated minutes** | 30 |
| **Grammar forms** | `conditional_ba` |

**What to teach:**
- なければいけない / ないといけない — must / have to:
  - 食べなければいけない (must eat)
  - Casual: 食べなきゃ
- Four conditional forms:
  - ば — general/logical if: 食べれば (if you eat); i-adj: 高ければ
  - と — natural/automatic if: ボタンを押すと、ドアが開く (push button → door opens)
  - たら — when/if (completed): 食べたら (when you eat / if you eat)
  - なら — contextual if: 東京に行くなら (if you're going to Tokyo [as you say])
- Key differences between the four conditionals

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — なければいけない obligation (×1)
3. `grammarRule` — ば conditional (×1)
4. `grammarRule` — と conditional (×1)
5. `grammarRule` — たら conditional (×1)
6. `grammarRule` — なら conditional (×1)
7. `grammarTable` — comparison chart of all four conditionals (when to use each)
8. `grammarComparison` — ば vs たら (the most commonly confused pair)
9. `conversation` — dialogue with hypothetical situations
10. `fillSlot` — choose the right conditional
11. `drills` — mixed MCQ

---

### G21 — Passive Form

| Field | Value |
|---|---|
| **ID** | `G21` |
| **Level** | N4 |
| **Unlocks after** | ~N4.31 (TBD) |
| **Icon** | 🔄 |
| **Estimated minutes** | 25 |
| **Grammar forms** | `passive` |

**What to teach:**
- Passive form construction:
  - RU-verbs: drop る, add られる (食べる → 食べられる)
  - U-verbs: shift to あ-column, add れる (話す → 話される, 読む → 読まれる)
  - する → される, くる → こられる
- Usage patterns:
  - Direct passive: 先生に褒められた (was praised by the teacher); agent marked with に
  - "Suffering passive" (adversative): 雨に降られた (got rained on — nuance of inconvenience)
  - Impersonal passive: この本は多くの人に読まれています (this book is read by many people)
- Particle changes: the direct object of the active sentence (を) becomes the subject (が) in the passive
- Register: passive is common in formal writing and polite indirect expressions
- **Critical note:** Passive and potential look identical for RU-verbs (食べられる = can eat / is eaten). Context distinguishes them.

**Recommended sections:**
1. `grammarIntro`
2. `grammarTable` — passive form chart (RU, U, する, くる)
3. `grammarRule` — direct passive (agent marked with に)
4. `grammarRule` — suffering/adversative passive
5. `grammarRule` — passive vs potential ambiguity for RU-verbs
6. `annotatedExample` — passive in news-style and daily-life contexts
7. `conversation` — dialogue about things that happened to people
8. `conjugationDrill` — dictionary form → passive form
9. `drills` — mixed MCQ

---

### G22 — Causative Form

| Field | Value |
|---|---|
| **ID** | `G22` |
| **Level** | N4 |
| **Unlocks after** | ~N4.31 (TBD) |
| **Icon** | 🎭 |
| **Estimated minutes** | 25 |
| **Grammar forms** | `causative` |

**What to teach:**
- Causative form construction:
  - RU-verbs: drop る, add させる (食べる → 食べさせる)
  - U-verbs: shift to あ-column, add せる (話す → 話させる, 書く → 書かせる)
  - する → させる, くる → こさせる
- "Make" vs "Let" distinction:
  - 母は子どもに野菜を食べさせる (mom MAKES the child eat vegetables — no choice)
  - 母は子どもに好きなものを食べさせる (mom LETS the child eat what they like — permission)
  - Context determines which reading; "let" is usually clearer when the action is positive for the causee
- Particle patterns:
  - Intransitive verb: causee takes に (子どもに泣かせる — make the child cry)
  - Transitive verb: causee takes に or を (子どもにを食べさせる — the を marks the food, に the causee)
- Causative-passive (させられる): made to do (against one's will) — introduce as a preview

**Recommended sections:**
1. `grammarIntro`
2. `grammarTable` — causative form chart (RU, U, する, くる)
3. `grammarRule` — "make someone do" (obligatory causation)
4. `grammarRule` — "let someone do" (permissive causation)
5. `grammarComparison` — make vs let (same form, different interpretation)
6. `grammarRule` — causative-passive (させられる — preview)
7. `conversation` — dialogue about workplace/family/school authority situations
8. `conjugationDrill` — dictionary form → causative form
9. `drills` — mixed MCQ

---

### G23 — Advanced Verb Usages (てみる, ておく, てしまう, すぎる, とする)

| Field | Value |
|---|---|
| **ID** | `G23` |
| **Level** | N4 |
| **Unlocks after** | ~N4.34 (TBD) |
| **Icon** | 🧩 |
| **Estimated minutes** | 30 |

**What to teach:**
- てみる — try doing: 食べてみる (try eating it)
- ておく — do in advance / leave as is: 買っておく (buy in advance); 窓を開けておく (leave the window open)
- てしまう — do completely / do by accident (with regret): 食べてしまった (ate it all / accidentally ate it); casual: 食べちゃった
- すぎる — too much: 食べすぎる (eat too much); 高すぎる (too expensive)
- ～とする — "to attempt / try to do" (and observe the result) / "to assume / treat as":
  - Dictionary form + とする: 食べようとする (try to eat / be about to eat)
  - Often paired with ～としたとき (just as [one] was about to ~): 出かけようとしたとき、電話がなった
  - "Let's assume" usage: 先生だとすると (assuming [they] are a teacher...)
  - Contrast with てみる: てみる = actually try and see; とする = attempt/be on the verge of (often interrupted or theoretical)
- Supplementary connectors (absorbed from dissolved G21):
  - かどうか — whether or not: 行くかどうかわからない (I don't know whether to go or not); embeds a yes/no question in a sentence
  - について — about / regarding: 日本語について話す (talk about Japanese); marks a topic of discussion

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — てみる (×1)
3. `grammarRule` — ておく (×1)
4. `grammarRule` — てしまう (×1, include casual ちゃう/じゃう)
5. `grammarRule` — すぎる (×1, for both verbs and adjectives)
6. `grammarRule` — ～とする (×1, attempt/volitional + assumption usage)
7. `grammarComparison` — てみる vs とする (both involve "trying" but differ in meaning and usage)
8. `grammarRule` — かどうか and について (supplementary connectors)
9. `annotatedExample` — all patterns in daily contexts
10. `conversation` — dialogue about cooking, travel prep, decisions, or mistakes
11. `sentenceTransform` — add てみる/ておく/てしまう/すぎる/とする to plain sentences
12. `drills` — mixed MCQ (N4 grammar capstone)

---

## Content Brief Template for Grammar

Agent 1 should use this template instead of the standard CLAUDE.md Content Brief for grammar lessons:

```
GRAMMAR CONTENT BRIEF
═════════════════════
Type:              grammar
Target ID:         [e.g. G2]
Level:             [N5 | N4]
Unlocks after:     [e.g. N5.1]
Title:             [e.g. "Core Particles I: は, が, の, か, も"]

Taught-kanji set:  [all kanji taught through the unlocksAfter lesson]
Available vocab:   [all glossary entries with lesson_ids ≤ unlocksAfter]

Grammar points:    [list each grammar point this lesson teaches]
Particles:         [particles covered, for meta.particles]
Grammar forms:     [conjugation forms covered, for meta.grammarForms]

Sections to build: [ordered list of section types with brief description]
                   e.g.:
                   1. grammarIntro — overview of particle functions
                   2. grammarRule — は topic marker
                   3. grammarRule — が subject marker
                   4. grammarComparison — は vs が
                   5. grammarRule — の possession
                   6. grammarRule — か questions
                   7. grammarRule — も also/even
                   8. annotatedExample — mixed particle usage
                   9. conversation — dialogue with all five particles
                   10. fillSlot — choose the right particle
                   11. drills — mixed MCQ

Reference template: [path to highest-numbered existing grammar lesson file, or "none — first grammar lesson"]
Dependencies:      [any existing files to read for context]
Rewrite notes:     [empty on first pass; filled by Agent 4 feedback]
```

---

## Quality Gates for Grammar Content

### Agent 3 (QA) — Grammar-specific checks

In addition to standard CLAUDE.md QA checks, grammar lessons must pass:

- [ ] `type` field is `"grammar"` at top level
- [ ] `meta` includes all required fields (level, unlocksAfter, focus, estimatedMinutes, icon)
- [ ] First section is `grammarIntro`; last section is `drills`
- [ ] Every `role` value in `parts` arrays is a valid color key (`topic`, `subject`, `object`, `verb`, `particle`, `destination`, `location`, `modifier`, `time`, `connector`, `predicate`)
- [ ] Every `color` value in `pattern` arrays is a valid color key
- [ ] Every kanji character in any text field (parts, examples, items, before/after, sentences, cells) is in the taught-kanji set for the `unlocksAfter` lesson
- [ ] No new vocabulary is introduced (all words either exist in glossary with lesson_ids ≤ unlocksAfter, or are written in pure hiragana)
- [ ] `conversation` and `drills` sections follow standard CLAUDE.md term tagging rules
- [ ] Grammar-specific sections (`grammarRule`, `annotatedExample`, etc.) use `parts` arrays, NOT `terms` arrays
- [ ] `conjugationDrill` items have exactly 4 choices, `answer` matches one choice
- [ ] `fillSlot` items have `answer` matching one of `choices`
- [ ] `sentenceTransform` items have `answer` matching one of `choices`
- [ ] `patternMatch` items have a mix of `correct: true` and `correct: false`
- [ ] `grammarComparison` has exactly 2 items and a `tip` field
- [ ] `grammarTable` with `tableType: "conjugation"` includes at least one RU-verb, one U-verb, and both irregulars
- [ ] All Japanese examples are grammatically correct
- [ ] Pattern formulas use 2–4 chips (not more)

### Agent 4 (CR) — Grammar-specific checks

- [ ] Grammar explanations are accurate and match established Japanese grammar pedagogy
- [ ] Examples show varied usage, not repetitive patterns
- [ ] Comparisons use parallel examples (same/similar sentences with the grammar point swapped)
- [ ] Tips are memorable and actionable
- [ ] Drill distractors are plausible (common student errors, not random)
- [ ] Vocabulary complexity matches what students would know at this point
- [ ] The lesson doesn't duplicate content from an adjacent grammar lesson
- [ ] Conversation dialogue sounds natural, not like a grammar textbook exercise

---

## Common Failure Modes for Grammar Content

1. **Using kanji from a later lesson** — Grammar lessons are the most prone to this because they cover abstract concepts that tempt authors to reach for advanced vocabulary. Always check the taught-kanji set.

2. **Inventing vocabulary** — If a word isn't in the glossary, write it in hiragana. Do not add glossary entries for grammar lessons.

3. **Wrong role in parts array** — Using `"role": "topic"` when the noun is actually が-marked (should be `"subject"`). The role must match the grammatical function in that specific sentence.

4. **Inaccurate grammar explanations** — The biggest risk. Verify all grammar rules against established references. Common errors: conflating は and が rules, getting conditional nuances wrong, incorrect passive form construction.

5. **Using terms array in grammar-specific sections** — `grammarRule`, `annotatedExample`, `conjugationDrill`, `patternMatch`, `sentenceTransform`, and `fillSlot` use `parts` or direct strings, NOT `terms`. Only `conversation` and `drills` use `terms`.

6. **Forgetting the explanation field on drills** — Grammar lesson drills REQUIRE `explanation` on every item. This is optional in kanji lesson drills but mandatory here.

7. **Pattern formula too complex** — Keep formulas to 2–4 chips. Students should be able to memorize the pattern at a glance.

8. **Comparison examples that don't parallel** — In `grammarComparison`, both examples should use the same or nearly identical sentences to isolate the grammar difference. If the sentences are completely different, the comparison doesn't work.

9. **Too many grammar points in one lesson** — Each `grammarRule` section takes significant cognitive load. Cap at 3-5 grammarRule sections per lesson. If more are needed, split into two lessons.

10. **Conjugation drill with only one verb type** — Always mix RU-verbs, U-verbs, and at least one irregular in conjugation drills.
