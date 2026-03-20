# GRAMMAR_CONTENT.md — Grammar Lesson Content Creation Guide

> **Purpose:** This document tells the CLAUDE.md multi-agent pipeline everything it needs to create grammar lesson JSON files (G1–G47). Feed this to Claude Code **after** the Grammar.js module has been built. The Project Manager agent (Agent 1) should read this document before scoping any grammar lesson.

---

## Table of Contents

1. [How Grammar Lessons Differ from Kanji Lessons](#how-grammar-lessons-differ-from-kanji-lessons)
2. [Grammar Lesson JSON Schema](#grammar-lesson-json-schema)
3. [Section Type Reference](#section-type-reference)
4. [Grammar Color Roles](#grammar-color-roles)
5. [Lesson Flow Convention](#lesson-flow-convention)
6. [Term Tagging in Grammar Lessons](#term-tagging-in-grammar-lessons)
7. [Full Lesson Map: N5 Grammar (G1–G12)](#full-lesson-map-n5-grammar-g1g12)
8. [Full Lesson Map: N4 Grammar (G13–G31)](#full-lesson-map-n4-grammar-g13g31)
9. [Full Lesson Map: N3 Grammar (G32–G47)](#full-lesson-map-n3-grammar-g32g47)
10. [Content Brief Template for Grammar](#content-brief-template-for-grammar)
11. [Quality Gates for Grammar Content](#quality-gates-for-grammar-content)
12. [Common Failure Modes for Grammar Content](#common-failure-modes-for-grammar-content)

---

## How Grammar Lessons Differ from Kanji Lessons

Grammar lessons use a different module (`Grammar.js`) with its own section types. The multi-agent pipeline (CLAUDE.md) still applies, but with these modifications:

| Aspect | Kanji Lessons | Grammar Lessons |
|---|---|---|
| ID format | `N5.1`, `N4.7` | `G1`, `G2`, ... `G47` |
| File path | `data/N5/lessons/N5.X.json` | `data/N5/grammar/G1.json` or `data/N4/grammar/G13.json` |
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
  "id": "G3",
  "type": "grammar",
  "title": "Core Particles I: は, が, の, か, を",
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
| `id` | string | ✅ | `G1` through `G47` |
| `type` | string | ✅ | Always `"grammar"` |
| `title` | string | ✅ | Display title |
| `meta.level` | string | ✅ | `"N5"`, `"N4"`, or `"N3"` |
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

## Full Lesson Map: N5 Grammar (G1–G12)

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
- ~~Nominalization rules (だ→な before の, である before こと)~~ → Deferred. Requires の particle (G3) and nominalizer concepts.
- ~~なんです / のです explanatory form~~ → Deferred to G10 (Plain Forms & Basic Connectors), where plain form prerequisite is established.
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

### G2 — Ko-so-a-do Demonstratives

| Field | Value |
|---|---|
| **ID** | `G2` |
| **Level** | N5 |
| **Unlocks after** | N5.1 |
| **Icon** | 👉 |
| **Estimated minutes** | 25 |

**What to teach:**

The Japanese demonstrative system based on distance from speaker/listener:

- こ- series (near speaker): これ (this thing), この+noun (this X), ここ (here), こちら (this way/polite), こう (like this), こんな (this kind of)
- そ- series (near listener / just mentioned): それ (that thing), その+noun (that X), そこ (there), そちら (that way/polite), そう (like that), そんな (that kind of)
- あ- series (far from both): あれ (that thing over there), あの+noun (that X over there), あそこ (over there), あちら (that way over there/polite), ああ (like that), あんな (that kind of)
- ど- series (question): どれ (which thing), どの+noun (which X), どこ (where), どちら (which way/polite/which of two), どう (how), どんな (what kind of)

**Key distinctions to teach:**
- これ/それ/あれ (standalone pronouns) vs この/その/あの (must attach to a noun)
- Physical distance model (pointing at objects) vs discourse model (そ = something the listener mentioned or knows about, あ = shared knowledge between both speaker and listener)
- どちら as polite alternative to どこ and どれ (when choosing between two)
- こちら/そちら/あちら as polite forms used in shops and formal situations

**What NOT to teach in G2:**
- こそあど with particles beyond basic は/が/を (defer to G3 where particles are taught)
- そういう/こういう/ああいう (defer — requires いう which comes later)

**Recommended sections:**
1. `grammarIntro` — the distance-based system; why Japanese needs 4 sets where English has 2
2. `grammarRule` — これ/それ/あれ/どれ (standalone thing-words)
3. `grammarRule` — この/その/あの/どの + noun (modifier-words)
4. `grammarRule` — ここ/そこ/あそこ/どこ (place-words)
5. `grammarTable` — full ko-so-a-do chart (thing, modifier, place, direction, manner, kind)
6. `grammarComparison` — これ vs この (when to use standalone vs modifier)
7. `grammarRule` — こちら/そちら/あちら/どちら (polite forms)
8. `annotatedExample` — ko-so-a-do in daily situations (shopping, giving directions, pointing, asking)
9. `conversation` — two dialogues: one in a store (pointing at things), one asking about locations
10. `fillSlot` — choose the right demonstrative (こ/そ/あ/ど + appropriate suffix)
11. `drills` — mixed MCQ

**Available vocabulary context:** All N5.1 vocabulary. Build examples around people (この人, あの先生), introductions (こちらは田中さんです), and basic identification (これは何ですか, それは本です).

---

### G3 — Core Particles I: は, が, の, か, を

| Field | Value |
|---|---|
| **ID** | `G3` |
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
  - Note: at this stage students only have ある as a verb. Use hiragana verbs with glosses (e.g. よびます = call, よみます = read) to demonstrate を patterns. Formal verb instruction begins in G6.

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

### G4 — Core Particles II: も, と, や, から, まで, に (time)

| Field | Value |
|---|---|
| **ID** | `G4` |
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
  - Quoted speech: 「…」と言う (note: いう not yet formally taught, use hiragana with gloss) — **deferred treatment:** at G4, mention that と can frame quoted speech, but do not formally teach it. The quotation role of と (`p_to_quote`) is formally introduced in N5.13 when 言う enters the vocabulary. At that point, distinguish it explicitly from the connective と (`p_to`) that students have used since N5.2 — same surface form, different grammatical role.
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
  - Scope at G3: days of the week and dates from N5.2/N5.3. Clock times (三時に) will be reinforced in N5.4. Destination use (学校に行く) is taught in G5 after N5.5.
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

### G5 — Core Particles III: に (destination/existence), で, へ

| Field | Value |
|---|---|
| **ID** | `G5` |
| **Level** | N5 |
| **Unlocks after** | N5.5 |
| **Icon** | 📌 |
| **Estimated minutes** | 25 |
| **Particles** | `に` (destination/existence uses), `で`, `へ` |

**Scope note:** に's time-connector role (specific days, dates, clock times) was introduced in G4. G5 extends に to its destination and existence-location roles, which require motion verbs (行く, 来る from N5.5) and existence verbs (いる from N5.4) not yet available at G3.

**What to teach:**
- に as "destination / existence-location" particle (extending the G4 time use):
  - Destination of movement (学校に行く — now available with 行く from N5.5)
  - Location of existence with いる/ある (部屋に猫がいる — いる from N5.4)
  - Indirect object / recipient (友だちに本をあげる)
  - Frequency (一週間に二回)
  - Cross-reference G3: remind students that specific times (月曜日に, 三時に) were the first use they learned; this lesson adds the destination and location uses
  - Note: relative time words (今日, 明日, 昨日) do NOT take に (also established in G4)
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

**ある vs いる (existence verb distinction):**
- いる for animate beings (people, animals): 猫がいる, 先生がいる
- ある for inanimate objects (things, abstract concepts): 本がある, 時間がある
- The "animated vehicle" note: taxis and buses sometimes use いる when viewed as having agency
- Question patterns: だれがいますか (who is there?) vs 何がありますか (what is there?)
- Negative: いません/いない, ありません/ない

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — に destination and existence-location (review time use from G4; add new uses)
3. `grammarRule` — で enabling particle (cover all uses)
4. `grammarComparison` — に vs で (location of existence vs location of action)
5. `grammarRule` — へ direction (and comparison with に for destinations)
6. `grammarRule` — ある vs いる (animate vs inanimate existence)
7. `grammarComparison` — ある vs いる (parallel sentences: 部屋に猫がいます vs 部屋に本があります; tip: "Can it move on its own? → いる. Otherwise → ある.")
8. `annotatedExample` — に in its destination/existence roles
9. `annotatedExample` — で in its various roles
10. `conversation` — dialogue using all three particles naturally with places and motion verbs
11. `fillSlot` — choose に/で/へ
12. `patternMatch` — identify correct に vs で usage
13. `drills` — mixed MCQ

**Available vocabulary context:** All vocabulary through N5.5. This now includes motion verbs (行く, 来る), places (店, 駅, 家), time expressions (時, 分, 週), and existence verbs (いる from N5.4, ある from N5.1). This rich vocabulary set enables natural, meaningful examples for all three particles — destinations with 行く/来る, existence locations with いる/ある, action locations with で.

---

### G6 — Verb Types: RU-Verbs vs U-Verbs vs Irregulars

| Field | Value |
|---|---|
| **ID** | `G6` |
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

### G7 — Polite Verb Forms (ます System)

| Field | Value |
|---|---|
| **ID** | `G7` |
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

### G8 — て-Form & た-Form Construction

| Field | Value |
|---|---|
| **ID** | `G8` |
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

### G9 — Progressive, Desire, Suggestions & Conjecture

| Field | Value |
|---|---|
| **ID** | `G9` |
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
  - Key rule: たい is for the speaker's own desire only; use ～たがる for others (see below)
- たがる/がる (expressing others' desires/feelings):
  - Verb stem + たがる: 食べたがる (someone else wants to eat), 行きたがる (someone else wants to go)
  - Adjective stem + がる: 怖がる (act scared), 嫌がる (show dislike), 恥ずかしがる (act embarrassed)
  - Conjugates as a U-verb: たがっている (is wanting to), がっている (is showing signs of)
  - Key rule: たい = speaker's own desire only; たがる = observable desire/feeling in others
  - 2-3 examples showing the contrast: 私は食べたい vs 弟は食べたがっている
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
5. `grammarRule` — たがる/がる (expressing others' desires/feelings — full rule, not just a note)
6. `grammarComparison` — たい vs たがる (my desire vs observed desire in others)
7. `grammarRule` — ましょう suggestions
8. `grammarRule` — でしょう/だろう conjecture (with distinction from ましょう)
9. `grammarComparison` — でしょう vs だろう (register difference, same meaning)
10. `annotatedExample` — all patterns in context
11. `conversation` — planning dialogue incorporating guesses and suggestions
12. `sentenceTransform` — plain form → progressive / desire / suggestion
13. `drills` — mixed MCQ

**Available vocabulary context:** Through N5.8. Richer verb vocabulary available by this point.

---

### G10 — Plain Forms & Basic Connectors

| Field | Value |
|---|---|
| **ID** | `G10` |
| **Level** | N5 |
| **Unlocks after** | N5.9 |
| **Icon** | 👋 |
| **Estimated minutes** | 30 |
| **Grammar forms** | `plain_past`, `plain_negative`, `plain_past_negative` |

This is the pivotal lesson where students transition from polite-only speech to real conversational Japanese. By the end of G10 students can form compound sentences, express reason, concession, and give commands — all the tools needed to move beyond single-clause polite speech throughout N4.

**What to teach:**

*Plain form conjugation:*
- Plain present: dictionary form (食べる, 話す, する, くる)
- Plain past: た-form (食べた, 話した, した, きた) — references G8
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
  - Not the same as が subject marker (G3) — different grammar role entirely
- けど / けれど — "but" (informal/casual equivalent): 行きたいけど、時間がない
  - けど is casual spoken Japanese; けれど is slightly more formal but less stiff than が
  - Both connect two clauses with a contrasting or softening relationship
  - Common as sentence-enders for polite softening: ～んですけど... (trailing off)
- から — "because" (reason clause + から): 暑いから、冷たい水を飲みます (Because it's hot, I'll drink cold water)
  - Reason clause comes FIRST in Japanese (opposite of English word order)
  - Plain form + から in casual speech; polite form + から in polite speech
  - Note: から was taught in G4 as a starting-point particle ("from"). This is a different role — teach the distinction explicitly.
- ので — "because" (softer, more objective): 暑いので、冷たい水を飲みます
  - More formal and indirect than から; often preferred in writing and polite speech
  - のに distinction preview: ので explains reason; のに (G20) expresses "even though"
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
  - Contrast: ないでください (G8) is the polite version; ～な is the blunt plain version

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
6. `grammarRule` — から and ので (because) — reason clause pattern; distinguish から as "from" (G4) vs "because"
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

### G11 — i-Adjective Conjugation

| Field | Value |
|---|---|
| **ID** | `G11` |
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
- **Not taught here:** ～ければ conditional (G22), ～すぎる excessive (G15), ～さ noun form (G15)

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

### G12 — na-Adjective Conjugation

| Field | Value |
|---|---|
| **ID** | `G12` |
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

## Full Lesson Map: N4 Grammar (G13–G31)

> **Note:** The exact `unlocksAfter` lesson for N4 grammar should be determined when the N4 lessons are being built. The values below are approximate placements. The user will set final values.

---

### G13 — Potential Form (Can / Able to)

| Field | Value |
|---|---|
| **ID** | `G13` |
| **Level** | N4 |
| **Unlocks after** | N4.3 |
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
- ことができる (formal potential):
  - Plain form + ことができる: 日本語を話すことができます
  - More formal/written than the conjugated potential (話せる)
  - Negative: ことができない
  - Used in announcements, signs, written rules, polite speech

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — potential form construction per verb type
3. `grammarTable` — potential form chart (RU, U, する, くる)
4. `grammarRule` — particle shift を → が
5. `grammarRule` — colloquial shortening (られる → れる)
6. `grammarRule` — ことができる (formal potential)
7. `grammarComparison` — potential form vs ことができる (話せます conversational vs 話すことができます formal/written; tip: "Speaking? → potential form. Writing or being formal? → ことができる.")
8. `annotatedExample` — expressing abilities in various contexts
9. `conversation` — discussing what one can/can't do
10. `conjugationDrill` — dictionary form → potential form
11. `sentenceTransform` — make it "can do" / "can't do"
12. `drills` — mixed MCQ

---

### G14 — Give & Receive (あげる / もらう / くれる)

| Field | Value |
|---|---|
| **ID** | `G14` |
| **Level** | N4 |
| **Unlocks after** | N4.5 |
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

*てほしい (want someone to do something):*
- て-form + ほしい: 静かにしてほしい (I want you to be quiet)
- The person you want to act is marked with に: 先生に教えてほしい (I want the teacher to teach me)
- Negative: てほしくない (I don't want you to do that)
- Polite: てほしいです / てほしいんですが...
- Contrast with たい: たい = I want to do; てほしい = I want someone else to do
- Progression: てもらう (received the favor) → てほしい (want the favor)

*Honorific/humble variants (introduce as reference — active use is N3+):*
- さしあげる — humble あげる (I humbly give to a superior)
- いただく — humble もらう (I humbly receive from a superior)
- くださる → ください — honorific くれる (a superior gives to me); てください is the request form already taught in G8

**Recommended sections:**
1. `grammarIntro` — the Japanese "gift economy" of verbs; why directionality matters
2. `grammarRule` — あげる (giving out from speaker/insider group)
3. `grammarRule` — くれる (someone gives to me/insider — benefit perspective)
4. `grammarComparison` — あげる vs くれる (same action, different perspective)
5. `grammarRule` — もらう (I receive — active acquisition framing)
6. `grammarTable` — full give/receive chart (plain + honorific/humble variants as reference)
7. `grammarRule` — て-form + あげる/もらう/くれる (doing favors)
8. `grammarRule` — てほしい (want someone to do something — contrast with たい)
9. `annotatedExample` — give/receive in daily scenarios (gifts, helping, favors)
10. `conversation` — gift-giving scene, asking for help, expressing thanks
11. `fillSlot` — choose あげる/くれる/もらう in context
12. `drills` — mixed MCQ

**Available vocabulary context:** Through ~N4.5. The verbs あげる, もらう, くれる may be written in hiragana if not yet in the glossary; add inline glosses. くださる is already known as ください from G8 — teach the connection explicitly.

---

### G15 — Comparison & Degree (より, ほう, ほど, くらい)

| Field | Value |
|---|---|
| **ID** | `G15` |
| **Level** | N4 |
| **Unlocks after** | N4.5 |
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

### G16 — Manner & Similarity (のように / のような / みたいに / みたいな)

| Field | Value |
|---|---|
| **ID** | `G16` |
| **Level** | N4 |
| **Unlocks after** | N4.6 |
| **Icon** | 🪞 |
| **Estimated minutes** | 20 |
| **Particles** | `p_no`, `p_ni` |
| **Grammar forms** | none (よう is a formal noun; みたい is an auxiliary adjective — neither requires a conjugation form entry) |

**What to teach:**

- **Noun + のように + verb/adjective** — adverbial manner, formal: "like X / in the manner of X"
  - やまかわさんのように料理する (cook like Yamakawa)
  - 鳥のように空を飛びたい (want to fly through the sky like a bird)
  - よう is a formal noun (形式名詞); の connects it to the preceding noun; に is the adverbial particle
  - Students have already seen this pattern in N4.5 — this lesson gives it formal explanation

- **Noun + のような + Noun** — attributive similarity, formal: "an X-like noun / a noun like X"
  - やまかわさんのような料理人 (a chef like Yamakawa)
  - 猫のような目 (cat-like eyes)
  - な is the attributive ending (よう behaves like a na-adjective in this position)

- **Noun + みたいに + verb/adjective** — adverbial manner, casual: same meaning as のように
  - 犬みたいに走る (run like a dog)
  - みたい attaches directly to nouns — no の needed
  - Use with friends, family, casual contexts; のように in formal/written contexts

- **Noun + みたいな + Noun** — attributive similarity, casual: same meaning as のような
  - 猫みたいな目 (cat-like eyes)
  - みたい is an auxiliary adjective; みたいな is its attributive form

- **Key distinction — adverbial (に) vs attributive (な):**
  - Both のよう and みたい follow the same pattern: add に to modify a verb/adjective; add な to modify a noun
  - This mirrors the きれいに (adverbial) vs きれいな (attributive) pattern already known

- **Formal vs casual register summary:**
  - のように / のような = formal/written (safe in all contexts)
  - みたいに / みたいな = casual/spoken (friends, family, relaxed settings)
  - Same meaning — choose based on register

- **Do NOT teach in this lesson:**
  - のようだ / みたいだ as conjecture ("it seems like / appears that") — the sentence-final inference meaning is G33
  - ようにする / ようになる (deliberate effort / gradual change) — G26
  - Briefly flag to students: "You'll see ように and みたい again in different roles — keep this comparison pattern separate from those."

- **Tagging notes for content agents:**
  - のように: tag の as `p_no`, よう as `v_you_manner` (bare noun, existing entry), に as `p_ni` separately
  - のような: tag の as `p_no`, よう as `v_you_manner`; な here is the attributive particle — verify if `p_na_attr` exists in particles.json, otherwise leave untagged
  - みたいに / みたいな: a `v_mitai` glossary entry (gtype: na-adjective, verb_class: na_adj) must be created before any content uses this word; みたいに uses `adverbial` form; みたいな uses `attributive_na` form

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — Noun + のように / みたいに (adverbial manner, formal + casual) with 3 examples each
3. `grammarRule` — Noun + のような / みたいな + Noun (attributive, formal + casual) with 3 examples each
4. `grammarComparison` — のように vs みたいに (same meaning, formal vs casual register)
5. `grammarComparison` — のように (adverbial) vs のような (attributive): に vs な changes the syntactic role
6. `annotatedExample` — daily comparison contexts using N4.1–N4.6 vocabulary: people, animals, foods, styles
7. `conversation` — characters comparing styles, skills, or appearances naturally (mix of polite and casual lines)
8. `fillSlot` — choose のように / みたいに / のような / みたいな given sentence context (blank before verb vs before noun; formal vs casual cue in context field)
9. `drills` — MCQ: 4 items on のよう vs みたい register; 4 items on に vs な position

---

### G17 — Limiting Particles (だけ, しか, ばかり, でも)

| Field | Value |
|---|---|
| **ID** | `G17` |
| **Level** | N4 |
| **Unlocks after** | N4.7 |
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

### G18 — Transitive & Intransitive Verb Pairs (自動詞・他動詞)

| Field | Value |
|---|---|
| **ID** | `G18` |
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

### G19 — Connecting Actions (てから, まえに, ながら, ために, ～たり)

| Field | Value |
|---|---|
| **ID** | `G19` |
| **Level** | N4 |
| **Unlocks after** | N4.10 |
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
  - Formation: same sound-change rules as た-form (G8); just add り instead of nothing

**Note:** から and ので (because) were taught as basic connectors in G10. G19 focuses on sequential, simultaneous, purposive, and non-exhaustive action patterns. Do not re-teach から/ので here — reinforce them through example sentences where appropriate.

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

### G20 — Contrast, Concession & Listing Reasons (のに / ても / し)

| Field | Value |
|---|---|
| **ID** | `G20` |
| **Level** | N4 |
| **Unlocks after** | N4.14 |
| **Icon** | 🌀 |
| **Estimated minutes** | 20 |
| **Grammar forms** | `te_form` |

**What to teach:**

- のに — "even though / despite" (expressing unexpectedness or complaint):
  - Plain form + のに: 勉強したのに、わからない (Even though I studied, I don't understand)
  - Expresses that the result is contrary to what the speaker expected or felt was fair
  - Common in complaints, surprised observations, and expressing frustration
  - Formation: same plain form rules as から/ので; copula da → na before のに (noun/na-adj + なのに)
  - Key distinction: ので (G10) explains a reason for something; のに contrasts an expected vs actual outcome

- ても — "even if / even though" (conditional concession):
  - て-form + も: 食べても、まだお腹がすいている (Even if I eat, I'm still hungry)
  - Expresses that the outcome holds regardless of the action
  - たとえ～ても reinforces: たとえ難しくても (even if it's difficult)
  - For nouns/na-adjectives: でも (雨でも行く — even if it rains, I'll go)
  - Note: ても is the concessive "even if"; てもいい (G23) is a separate construction meaning "it's okay to" — teach the distinction explicitly to prevent confusion

- し — listing multiple reasons/qualities:
  - Clause + し, clause + し, (conclusion): 安いし、おいしいし、この店が好きです
  - Lists reasons additively — "not only X but also Y"
  - Can list positive or negative qualities
  - Often used to justify a conclusion or opinion
  - Single し is also valid: 安いし、買おう (it's cheap, so let's buy it)
  - Plain form + し in casual; polite form + し also acceptable

*Sentence-starting contrast adverbs (for reference):*
- しかし — however (formal/written)
- でも — but (informal, sentence-starting); same word, different position and function from ても
- だけど — but (casual spoken)
- ただし — however / provided that (formal qualification)

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — のに (even though — complaint/unexpectedness)
3. `grammarRule` — ても (even if — concessive conditional)
4. `grammarRule` — し (listing multiple reasons/qualities)
5. `grammarComparison` — のに vs ので (contrast vs reason — same-sounding, opposite meaning direction)
6. `grammarComparison` — ても vs てもいい (concession vs permission — prevent conflation)
7. `annotatedExample` — のに, ても, and し in real contexts
8. `conversation` — dialogue with frustrated observations, hypotheticals, and listed reasons
9. `fillSlot` — choose のに/ても/ので/し in context
10. `drills` — mixed MCQ

---

### G21 — Conversation Mechanics: Hesitation, Floor-Holding & 相槌

| Field | Value |
|---|---|
| **ID** | `G21` |
| **Level** | N4 |
| **Unlocks after** | N4.16 |
| **Icon** | 💬 |
| **Estimated minutes** | 25 |
| **Grammar forms** | none (pragmatic/discourse lesson — no conjugation forms) |

**What to teach:**

- **The floor-holding principle** — the foundational concept:
  - In Japanese, a mid-sentence pause with no sound is read as **floor yield** — the listener is entitled to speak
  - Hesitation sounds are not weak speech habits; they are explicit "I'm still speaking" signals
  - This is why learners get talked over: they pause without signalling, and native speakers respond to the floor-yield cue correctly
  - Mastering these sounds is as important as grammar for real conversation
- **Hesitation sounds — the speaker's floor-holding toolkit:**
  - えーと / えっと — "Um / uh / let me see": the most common floor-hold while retrieving an answer or thought; えーと is neutral/standard; えっと is quicker and slightly more casual; elongate (えーっと) for more time
  - あのう / あの — "Um / well / excuse me": softer and more polished than えーと; preferred in formal contexts; also serves as a gentle attention-getter (あのう、すみません — Excuse me...)
  - うーん — "Hmm / let me think": signals genuine weighing or uncertainty; can lean toward reluctance or soft negative (compare: うん = yes / うーん = hmm/I'm not sure)
  - さあ — two distinct uses: (1) uncertainty-signal: さあ、わかりません (Well... I really don't know) — unlike えーと, this signals the speaker may NOT have the answer; (2) commencement-signal: さあ、行こう！(Right then, let's go!) — gathering oneself or others to begin something
- **Critical distinction — うん vs うーん:**
  - うん (short, flat): casual affirmative "yeah / uh-huh" — listener agreement
  - うーん (long, falling): hesitation/uncertainty — the speaker is weighing something
  - The length and tone carry the full meaning; mix them up and you accidentally agree to something or seem dismissive when you meant to be thinking
- **相槌 (aizuchi) — the listener's mirror system:**
  - Aizuchi are active listening signals the listener produces WHILE the speaker holds the floor
  - They confirm reception and maintain rapport WITHOUT claiming the floor
  - Not producing aizuchi in Japanese conversation feels cold or inattentive — the silence that signals "I'm listening politely" in some cultures reads as disconnection in Japanese
  - Core aizuchi set:
    - うん / うん、うん (casual): "Yeah / uh-huh" — following along
    - はい / ええ (formal): polite listening acknowledgement; ええ is slightly warmer than はい
    - そうですね / そうですよね: "I see / I agree" — warm, engaged acknowledgement
    - なるほど: "I see / that makes sense" — signals genuine comprehension; slightly formal
    - へえ: "Oh really?" — new information received; signals interest
    - ほんとうに / ほんとう？: "Really? / Is that so?" — emphasises attention
    - そうそう / そうそうそう: "Yes, exactly! / Right right!" — enthusiastic agreement
- **Casual fillers (register-marked):**
  - なんか: casual sentence filler meaning roughly "like / kind of / you know"; extremely common in younger casual speech; reads as careless in professional contexts
  - まあ: "Well / sort of / I suppose"; softens assertions and expresses resigned acceptance (まあ、そうですね = Well, I suppose so); more register-neutral than なんか
- **Discourse restructuring markers:**
  - 実は (jitsu wa): "Actually / to tell you the truth" — signals that what follows may contradict expectations or reveal something new
  - つまり (tsumari): "In other words / that is to say" — signals a restatement or summary; used when clarifying or simplifying a previous point
- **Register summary for this whole system:**
  - Formal/polite: あのう, ええ, そうでございますね, なるほど, まあ
  - Neutral: えーと, はい, そうですね, なるほど, へえ
  - Casual: えっと, うん, そうそう, なんか, まあ
  - Avoid なんか as a filler in professional or formal settings

**Recommended sections:**
1. `grammarIntro` — "You have grammar. Now you need conversation survival: the sounds that hold the floor and the sounds that show you're listening."
2. `grammarRule` — floor-holding mechanics + えーと / あのう / うーん (the three core hesitation sounds and WHY they function this way in Japanese) (×1)
3. `grammarRule` — さあ: uncertainty vs commencement — same sound, two functions (×1)
4. `grammarTable` — hesitation sound comparison: sound / meaning / nuance / register / contrasting example
5. `grammarComparison` — うん vs うーん (short affirmative vs long hesitation — the length/tone carries everything)
6. `grammarRule` — 相槌 (aizuchi): the listener's toolkit — what each sound signals and when to use it (×1)
7. `grammarTable` — aizuchi toolkit: sound / meaning / when to use / register
8. `grammarRule` — なんか and まあ as casual fillers, with register warning (×1)
9. `grammarRule` — 実は and つまり as discourse restructuring markers (×1)
10. `annotatedExample` — a natural back-and-forth dialogue with hesitation and aizuchi highlighted and annotated
11. `conversation` — dialogue in which both sides use the full system: speaker holds floor with えーと/あのう; listener produces appropriate aizuchi; discourse markers appear naturally
12. `patternMatch` — "Is this person holding the floor or yielding it?" (identify from short dialogue snippets)
13. `drills` — mixed MCQ covering sound identification, register choices, and うん/うーん disambiguation

**Agent 1 notes:**
- No new conjugation form entries are needed. These are discourse/pragmatic items, not conjugated forms.
- Glossary entries already exist or were added at N5.10: `v_eto` (えーと), `v_anou` (あのう), `v_uun` (うーん), `v_saa` (さあ), `v_un` (うん).
- Aizuchi terms that need glossary verification before building content: `v_naruhodo` (なるほど), `v_hee` or similar (へえ), `v_souso` or similar (そうそう), `v_jitsuwa` (実は), `v_tsumari` (つまり), `v_nanka` (なんか), `v_maa` (まあ). Grep the glossary for each before Agent 2 builds content; add any missing entries.
- This lesson has NO conversation lines in the conventional sense — the `conversation` section is the practical payoff, so it should feel natural and showcase the full system, not be a mechanical drill in dialogue form.
- `patternMatch` items should present 2–3 line dialogue snippets and ask whether the highlighted speaker is still holding the floor (correct hesitation sound) or has yielded it (pause with no sound / wrong signal).

---

### G22 — そうだ: Appearance & Hearsay

| Field | Value |
|---|---|
| **ID** | `G22` |
| **Level** | N4 |
| **Unlocks after** | N4.18 |
| **Icon** | 👀 |
| **Estimated minutes** | 25 |

**What to teach:**

- Stem + そうだ — appearance/conjecture based on visual evidence:
  - Verb ます-stem + そう: 雨が降りそうだ (looks like it will rain)
  - i-adjective drop い + そう: おいしそう (looks delicious), 高そう (looks expensive)
  - na-adjective + そう: 元気そう (seems healthy), 静かそう (seems quiet)
  - Negative: なさそう (おいしくなさそう = doesn't look delicious) — irregular negative form
  - Exception: いい → よさそう (NOT いそう/いいそう)
  - This is based on the speaker's OWN visual observation or gut feeling
- Plain form + そうだ — hearsay/reported information:
  - Plain form + そうだ: 雨が降るそうだ (I heard it will rain)
  - Adjective: おいしいそうだ (I heard it's delicious)
  - Negative: おいしくないそうだ (I heard it's not delicious) — negation is inside the reported clause
  - This is information the speaker received from someone else or a source
  - Often translated as "apparently" or "they say that"
- Critical comparison: same word, different attachment, different meaning:
  - おいしそう (looks delicious — I can see/smell it) vs おいしいそうだ (I heard it's delicious — someone told me)
  - 降りそう (looks like it'll rain — I see clouds) vs 降るそうだ (I heard it'll rain — weather report)

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — stem + そうだ (appearance) with formation rules per word type
3. `grammarTable` — formation chart: verb/i-adj/na-adj × appearance-そう (show the stem extraction)
4. `grammarRule` — plain form + そうだ (hearsay) with formation rules
5. `grammarComparison` — appearance そうだ vs hearsay そうだ (same word, different grammar, different meaning)
6. `grammarRule` — negative forms for both (なさそう vs ないそうだ — this is where students trip up most)
7. `annotatedExample` — both patterns in weather, food, people, news contexts
8. `conversation` — dialogue mixing appearance and hearsay observations
9. `patternMatch` — identify whether a sentence uses appearance or hearsay そうだ
10. `drills` — mixed MCQ

---

### G23 — Permissions & Prohibitions (てもいい, てはいけない)

| Field | Value |
|---|---|
| **ID** | `G23` |
| **Level** | N4 |
| **Unlocks after** | N4.21 |
| **Icon** | 🚦 |
| **Estimated minutes** | 20 |

**What to teach:**
- てもいい — may / it's okay to: 食べてもいいですか (may I eat?)
- てはいけない — must not / it's not okay to: ここで食べてはいけません (you must not eat here)
- Informal: てもいい → ていい; てはいけない → ちゃいけない / ちゃだめ
- なくてもいい — don't have to:
  - Verb ない-form (drop final い) + くてもいい: 行かなくてもいいです (you don't have to go)
  - Casual: 行かなくてもいい / 行かなくていい
  - The missing piece of the obligation/permission system

**The Full Permission/Obligation Quadrant:**

| | Positive | Negative |
|---|---|---|
| **Permission** | てもいい (may do) | なくてもいい (don't have to) |
| **Prohibition/Obligation** | なければいけない (must do — cross-ref G25) | てはいけない (must not do) |

Tip: "Do I HAVE to? → なければいけない. Do I NOT have to? → なくてもいい. May I? → てもいい. Must I not? → てはいけない."

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — てもいい permission (×1)
3. `grammarRule` — てはいけない prohibition (×1)
4. `grammarRule` — なくてもいい (don't have to)
5. `grammarComparison` — permission vs prohibition side by side
6. `grammarTable` — the full permission/obligation quadrant (てもいい / てはいけない / なくてもいい / なければいけない)
7. `annotatedExample` — rules and permissions in school/work/home
8. `conversation` — asking permission and stating rules
9. `patternMatch` — identify permission vs prohibition sentences
10. `drills` — mixed MCQ

---

### G24 — Directional & Resultant て-Form (てくる / ていく / てある)

| Field | Value |
|---|---|
| **ID** | `G24` |
| **Level** | N4 |
| **Unlocks after** | N4.23 |
| **Icon** | ↔️ |
| **Estimated minutes** | 25 |
| **Grammar forms** | `te_form` |

**What to teach:**

- てくる — movement/change toward the speaker or present:
  - Physical approach: 持ってくる (bring here), 連れてくる (bring someone here)
  - Change approaching present: 寒くなってきた (it's gotten cold — change I now feel)
  - Continuation up to now: ずっと勉強してきた (have been studying all along until now)
  - Emergence: 雨が降ってきた (it started raining — I just noticed)
- ていく — movement/change away from speaker or into the future:
  - Physical departure: 持っていく (take away), 連れていく (take someone)
  - Change continuing into future: これから暑くなっていく (it's going to keep getting hotter)
  - Gradual disappearance: 忘れていく (will gradually forget)
- てある — resultant state from intentional action:
  - 窓が開けてある (the window has been opened [by someone, intentionally, and remains open])
  - エアコンがつけてある (the AC has been turned on [someone did it on purpose])
  - Particle: the object takes が (not を) in てある sentences
  - Implies someone did this intentionally and the result persists
- Critical comparison — ている vs てある:
  - 窓が開いている (the window is open — natural/observed state, no agent implied)
  - 窓が開けてある (the window has been opened — someone opened it intentionally)
  - ている = state exists; てある = state exists because of intentional prior action

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — てくる (all uses: approach, emerging change, continuation)
3. `grammarRule` — ていく (all uses: departure, future change, gradual)
4. `grammarComparison` — てくる vs ていく (toward speaker/now vs away/future)
5. `grammarRule` — てある (intentional resultant state)
6. `grammarComparison` — ている vs てある (natural state vs intentional result)
7. `annotatedExample` — all patterns in daily contexts
8. `conversation` — dialogue about weather changes, preparing a room, travel
9. `fillSlot` — choose てくる/ていく/てある in context
10. `drills` — mixed MCQ

---

### G25 — Obligations & Conditionals (なければ, ば, たら, なら, と)

| Field | Value |
|---|---|
| **ID** | `G25` |
| **Level** | N4 |
| **Unlocks after** | N4.25 |
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
- ば〜ほど — the more ~, the more ~:
  - Verb ば-form + same verb dictionary form + ほど: 食べれば食べるほど太る (the more you eat, the fatter you get)
  - Adjective: 安ければ安いほどいい (the cheaper the better)
  - Pattern: [condition-ば] [same word plain form] + ほど + [result]
  - Common set phrase: ～ば～ほどいい (the more the better)

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — なければいけない obligation (×1)
3. `grammarRule` — ば conditional (×1)
4. `grammarRule` — と conditional (×1)
5. `grammarRule` — たら conditional (×1)
6. `grammarRule` — なら conditional (×1)
7. `grammarRule` — ば〜ほど (the more ~, the more ~)
8. `grammarTable` — comparison chart of all four conditionals (when to use each)
9. `grammarComparison` — ば vs たら (the most commonly confused pair)
10. `conversation` — dialogue with hypothetical situations
11. `fillSlot` — choose the right conditional
12. `drills` — mixed MCQ

---

### G26 — ように Patterns

| Field | Value |
|---|---|
| **ID** | `G26` |
| **Level** | N4 |
| **Unlocks after** | N4.27 |
| **Icon** | 🎯 |
| **Estimated minutes** | 20 |

**What to teach:**

- ようにする — make an effort to / try to (habitual effort):
  - Dictionary form + ようにする: 早く寝るようにしている (I'm trying to go to bed early / I make it a habit to)
  - ない form + ようにする: 遅れないようにする (try not to be late)
  - Implies ongoing conscious effort to establish a habit or behavior
- ようになる — come to be able to / gradual change of state:
  - Dictionary form + ようになる: 日本語が話せるようになった (I've become able to speak Japanese)
  - ない form + ようになる: 食べなくなった can also be expressed as 食べないようになった (came to not eat)
  - Describes a change that happened gradually or naturally over time
  - Often used with potential form: できるようになる (come to be able to do)
- ように — purpose/goal clause ("so that"):
  - Dictionary form + ように: 忘れないように書く (write so that I don't forget)
  - 聞こえるように大きい声で話す (speak in a loud voice so that it can be heard)
  - The ように clause states the desired outcome; the main clause states the action taken
- Critical comparison — ようにする vs ようになる:
  - ようにする = I am making deliberate effort (agent-driven)
  - ようになる = it naturally/gradually came to be (change-driven)
  - 野菜を食べるようにしている (I'm making an effort to eat vegetables — my willpower)
  - 野菜を食べるようになった (I've come to eat vegetables — natural change over time)

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — ようにする (deliberate effort)
3. `grammarRule` — ようになる (gradual change)
4. `grammarComparison` — ようにする vs ようになる
5. `grammarRule` — ように purpose clause
6. `annotatedExample` — all patterns in self-improvement, health, study contexts
7. `conversation` — dialogue about lifestyle changes and goals
8. `sentenceTransform` — convert between ようにする/ようになる given context clues
9. `drills` — mixed MCQ

---


---

### G27 — Expressing Thoughts & Experience

| Field | Value |
|---|---|
| **ID** | `G27` |
| **Level** | N4 |
| **Unlocks after** | N4.30 |
| **Icon** | 💭 |
| **Estimated minutes** | 25 |
| **Grammar forms** | `plain_past` |

**What to teach:**

- と思う — I think (that): plain form + と思う / と思います
  - Present thought: 日本語は難しいと思います (I think Japanese is difficult)
  - Future intention: 明日行くと思います (I think I'll go tomorrow)
  - Negative thought: 来ないと思う (I think they won't come) — NOT 来ると思わない
  - Key: the negation goes INSIDE the quoted clause, not on 思う itself
- と思っている — ongoing belief / someone else's opinion:
  - 彼は日本語が簡単だと思っている (He thinks Japanese is easy — his ongoing belief)
  - Contrast: と思う = my current thought; と思っている = sustained belief or someone else's belief
- たことがある — have experienced:
  - た-form + ことがある: 日本に行ったことがあります (I have been to Japan)
  - Negative: 行ったことがありません / 行ったことがない (I have never been)
  - Question: 食べたことがありますか (Have you ever eaten it?)
  - Note: ことがある with dictionary form = different meaning (sometimes happens): 忘れることがある (I sometimes forget)
- ことがある — sometimes happens:
  - Dictionary form + ことがある: 遅れることがある (I'm sometimes late)
  - Distinct from たことがある (experience)

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — と思う (I think that)
3. `grammarRule` — と思っている (ongoing belief / third person)
4. `grammarComparison` — と思う vs と思っている
5. `grammarRule` — たことがある (experience)
6. `grammarRule` — ことがある (sometimes happens)
7. `grammarComparison` — たことがある vs ことがある (past experience vs occasional occurrence)
8. `annotatedExample` — expressing thoughts and experiences in daily conversation
9. `conversation` — dialogue about travel experiences and opinions
10. `fillSlot` — choose と思う/と思っている/ことがある forms in context
11. `drills` — mixed MCQ


---

### G28 — Passive Form

| Field | Value |
|---|---|
| **ID** | `G28` |
| **Level** | N4 |
| **Unlocks after** | N4.31 |
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

### G29 — Causative Form

| Field | Value |
|---|---|
| **ID** | `G29` |
| **Level** | N4 |
| **Unlocks after** | N4.31 |
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

### G30 — Advanced Verb Usages (てみる, ておく, てしまう, すぎる, とする)

| Field | Value |
|---|---|
| **ID** | `G30` |
| **Level** | N4 |
| **Unlocks after** | N4.34 |
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
- Supplementary connectors (absorbed from dissolved G22):
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

### G31 — Advanced Adjective Patterns (くなる / になる, くする / にする)

| Field | Value |
|---|---|
| **ID** | `G31` |
| **Level** | N4 |
| **Unlocks after** | N4.34 |
| **Icon** | 🌀 |
| **Estimated minutes** | 25 |
| **Grammar forms** | none new (uses existing `adverbial` form with なる / する / ても / なければ) |

**What to teach:**

- ～くなる / ～になる — become ~ (spontaneous/natural change of state):
  - i-adjective: い → くなる: 寒くなった (became cold), 高くなった (became expensive), 上手くなりたい (want to get better)
  - na-adjective: [stem] + になる: 有名になった (became famous), 元気になった (got better), 便利になった (became convenient)
  - With てくる (directional change toward now): 暖かくなってきた (it has been getting warmer — gradual change I now feel)
  - With ていく (directional change away/into future): もっと便利になっていく (it will keep getting more convenient)
  - Common pattern: [adjective] + くなりたい / になりたい (want to become ~): 上手になりたい, 元気になりたい
- ～くする / ～にする — make ~ / cause to be ~ (deliberate change by an agent):
  - i-adjective: い → くする: 部屋を暖かくする (make the room warm), もっと安くしてください (please make it cheaper)
  - na-adjective: [stem] + にする: 部屋を静かにする (make the room quiet), 便利にした (made it convenient)
  - Fixed expressions students must know: 静かにしてください (please be quiet), 元気にしてください (please take care of yourself)
  - Compare: 静かになった (it became quiet — naturally) vs 静かにした (I made it quiet — deliberately)
- ～くても / ～でも — even if it is ~ (adjective concessive, parallels G20 verb ても):
  - i-adjective: い → くても: 高くても買います (I'll buy it even if it's expensive), 難しくても頑張ります (I'll do my best even if it's difficult)
  - na-adjective: [stem] + でも: 暇でも行かない (I won't go even if I'm free), 不便でも住んでいます (I live here even though it's inconvenient)
  - Negative adjective + ても: 高くなくても買う (I'll buy it even if it's not expensive)
- ～くなければ / ～でなければ — must be ~ / if it's not ~ (adjective obligation/condition):
  - i-adjective: い → くなければ: 大きくなければいけない (it must be big), 安くなければ買わない (I won't buy it if it's not cheap)
  - na-adjective: [stem] + でなければ: 静かでなければいけない (it must be quiet), 有名でなければ知らない (I only know famous ones)
  - Parallels G25 verb なければいけない — the same obligation concept applied to adjective predicates
- ～すぎる reinforcement for adjectives (extension of G15):
  - i-adjective: 高すぎる (too expensive), 難しすぎる (too difficult) — taught in G15, reinforced here
  - na-adjective: 静かすぎる (too quiet), きれいすぎる (too pretty) — same mechanism
  - Note: すぎる is itself an ichidan verb after the adjective stem — conjugates normally (すぎます, すぎた, etc.)
- **Critical comparison — くなる vs くする:**
  - なる = spontaneous/natural change (subject changes by itself): 空が暗くなった (the sky got dark — it just happened)
  - する = deliberate change (agent makes it happen): 部屋を暗くした (I darkened the room — I did it)
  - Both use the adverb form (い → く for i-adj; stem + に for na-adj) — only the verb differs

**Recommended sections:**
1. `grammarIntro` — "You already know how adjectives describe things. Now learn how they transform things."
2. `grammarRule` — ～くなる / ～になる (become ~): i-adj and na-adj with くなってきた / になってきた progressive variants (×1)
3. `grammarRule` — ～くする / ～にする (make ~ / cause to be ~): i-adj and na-adj with common fixed expressions (×1)
4. `grammarComparison` — なる vs する (spontaneous change vs deliberate change — same adverb stem, different verb, different agent)
5. `grammarRule` — ～くても / ～でも (even if it is ~ — adjective concessive): parallels verb ても from G20 (×1)
6. `grammarRule` — ～くなければ / ～でなければ (must be ~ — adjective obligation): parallels verb なければいけない from G25 (×1)
7. `grammarTable` — full paradigm: i-adjective and na-adjective across all four patterns (くなる / くする / くても / くなければ)
8. `annotatedExample` — all patterns in context: seasons changing, improving skills, making requests, setting conditions
9. `conversation` — dialogue covering all four patterns naturally (seasonal change, preferences, requests, rules)
10. `conjugationDrill` — adjective → target pattern: given an adjective and context, produce the correct transformation
11. `fillSlot` — choose なる/する and the correct concessive/obligation form in context
12. `drills` — mixed MCQ

**Available vocabulary context:** Through N4.34. Weather, seasons, abilities, rooms/spaces, price — all support these patterns naturally.

**Agent 1 notes:**
- No new conjugation form entries are required in `conjugation_rules.json` — all patterns use the existing `adverbial` form (い→く / stem+に) combined with standard verbs (なる, する) and particles (ても, なければ).
- The なる and する in these patterns use their standard conjugated forms and should be tagged accordingly (e.g. なった = `plain_past`; なっています = te_form + `polite_masu` on いる).
- The adverbial form chip (く or に) is what gets tagged with `{ "id": "v_foo", "form": "adverbial" }`. The following verb or particle is tagged separately.
- ～くなってきた and ～になってきた: the てくる pattern is taught in G24 (Directional て-Form). This lesson introduces なってきた as a specific adjective+change combination; the full theory of てくる directional change is expanded in G24.
## Full Lesson Map: N3 Grammar (G32–G47)

> **Note:** N3 grammar lessons are planned but N3 content lessons do not yet exist. The `unlocksAfter` values below reference future N3 lessons. JSON stub files will be created but should NOT be added to `manifest.json` until the N3 content infrastructure is in place.

---

### G32 — Relative Clauses & Noun Modification

| Field | Value |
|---|---|
| **ID** | `G32` |
| **Level** | N3 |
| **Unlocks after** | N3.2 |
| **Icon** | 🔍 |
| **Estimated minutes** | 25 |

**What to teach:**
- Plain form directly modifying a noun: 昨日買った本 (the book I bought yesterday), 東京に住んでいる友だち (a friend who lives in Tokyo)
- The word order reversal from English: English puts the clause after the noun ("the book THAT I bought"), Japanese puts it before (買った本)
- Any plain form can modify: verb (行く人 = the person who goes), adjective (高い山 = a tall mountain — students already do this instinctively), noun+の (日本語の本 = already taught in G3, but now formalized as part of the same system)
- Longer/nested clauses: 昨日駅で会った人の名前 (the name of the person I met at the station yesterday)
- の as pronoun replacement: 赤いのをください (please give me the red one), 昨日買ったのは高かった (the one I bought yesterday was expensive)
- Subject inside relative clause takes が (not は): 母が作った料理 (the food that mom made) — NOT 母は作った料理

**Recommended sections:**
1. `grammarIntro` — why this is the key to reading Japanese; the "backwards" word order
2. `grammarRule` — basic noun modification with plain form verbs
3. `grammarRule` — longer and nested relative clauses
4. `grammarRule` — の as pronoun replacement
5. `grammarRule` — が inside relative clauses (not は)
6. `annotatedExample` — relative clauses in descriptions, explanations, daily life
7. `conversation` — dialogue describing people, places, things using relative clauses
8. `sentenceTransform` — combine two sentences into one using noun modification
9. `drills` — mixed MCQ

---

### G33 — Nominalizers: の and こと

| Field | Value |
|---|---|
| **ID** | `G33` |
| **Level** | N3 |
| **Unlocks after** | N3.4 |
| **Icon** | 📦 |
| **Estimated minutes** | 25 |

**What to teach:**
- Verb plain form + の/こと = noun phrase: 食べるのが好き / 食べることが好き (I like eating)
- When to use の vs こと:
  - の — direct/sensory, perception verbs (見る, 聞く, 感じる): 彼が歌うのを聞いた (I heard him singing)
  - こと — abstract facts, rules, experiences: 約束を守ることは大切です (keeping promises is important)
  - Some verbs require こと: ことがある (G27), ことができる (G13)
  - Some verbs require の: のを見る, のを手伝う
  - Many accept both: 食べるのが好き ≈ 食べることが好き
- ことにする — decide to do: 日本に行くことにした (I decided to go to Japan)
- ことになる — it has been decided / it turns out that: 来月引っ越すことになった (it's been decided that I'll move next month)
- ことはない — there's no need to: 心配することはない (there's no need to worry)
- Comparison: ことにする vs ことになる (my decision vs external/impersonal decision)

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — の as nominalizer
3. `grammarRule` — こと as nominalizer
4. `grammarComparison` — の vs こと (sensory/direct vs abstract/factual)
5. `grammarRule` — ことにする / ことになる
6. `grammarComparison` — ことにする vs ことになる
7. `grammarRule` — ことはない (no need to)
8. `annotatedExample` — nominalizers in varied contexts
9. `conversation` — dialogue about decisions and life changes
10. `fillSlot` — choose の or こと
11. `drills` — mixed MCQ

---

### G34 — Volitional Form & Intentions

| Field | Value |
|---|---|
| **ID** | `G34` |
| **Level** | N3 |
| **Unlocks after** | N3.6 |
| **Icon** | 🚀 |
| **Estimated minutes** | 25 |

**What to teach:**
- Plain volitional construction:
  - RU-verbs: drop る, add よう (食べよう)
  - U-verbs: shift to お-column + う (行こう, 話そう, 書こう, 飲もう)
  - する → しよう, くる → こよう
  - This is the plain equivalent of ましょう (G9)
- Volitional + とする — attempt / be about to:
  - 食べようとした (tried to eat / was about to eat)
  - Often with とした時/ところ: 出かけようとしたとき、電話がなった (just as I was about to leave, the phone rang)
  - Expands G30's とする with the volitional form specifically
- Volitional + と思う — I think I'll / I'm planning to:
  - 明日行こうと思います (I think I'll go tomorrow / I'm thinking of going)
  - Softer than つもり — more tentative
- つもりだ — intend to / plan to:
  - 来年日本に行くつもりです (I intend to go to Japan next year)
  - Negative: 行かないつもりだ (I intend not to go) / 行くつもりはない (I have no intention of going)
  - Stronger/more committed than volitional+と思う
- Comparison: volitional+と思う vs つもりだ (tentative plan vs firm intention)

**Recommended sections:**
1. `grammarIntro`
2. `grammarTable` — volitional form chart (RU, U by ending, する, くる)
3. `grammarRule` — plain volitional construction
4. `grammarRule` — volitional + とする (attempt)
5. `grammarRule` — volitional + と思う (tentative plan)
6. `grammarRule` — つもりだ (firm intention)
7. `grammarComparison` — volitional+と思う vs つもりだ
8. `annotatedExample` — intentions and plans in daily contexts
9. `conversation` — dialogue about future plans
10. `conjugationDrill` — dictionary form → volitional form
11. `drills` — mixed MCQ

---

### G35 — Conjecture & Inference (ようだ / みたいだ / らしい)

| Field | Value |
|---|---|
| **ID** | `G35` |
| **Level** | N3 |
| **Unlocks after** | N3.10 |
| **Icon** | 🔮 |
| **Estimated minutes** | 30 |

**Scope note:** The resemblance/manner usage of のよう and みたい ("like X / in the manner of X") was taught in G16. This lesson covers the **conjecture and inference** usage — where ようだ and みたいだ express "it seems / appears to be" based on observed evidence. These are meaningfully different: G16 compares to a noun benchmark (犬のように走る); G33 infers a state from indirect evidence (疲れているようだ). Make the distinction explicit at the start.

**What to teach:**
- ようだ — inference based on evidence the speaker has directly observed:
  - Plain form + ようだ: 雨が降るようだ (it seems like it will rain — I see dark clouds)
  - na-adj + な + ようだ: 静かなようだ (it seems quiet)
  - Polite: ようです
  - Note: the resemblance/simile use (夢のようだ, まるで～のようだ) was introduced in G16 — remind students, don't re-teach it
- みたいだ — casual equivalent of ようだ for conjecture:
  - Same inference meaning as ようだ but informal register
  - Attaches directly without の: 雨みたいだ (looks like rain), 疲れているみたいだ (seems tired)
  - Note: resemblance use (子どもみたいだ = like a child) was introduced in G16 — this lesson focuses on the inference/conjecture meaning
- らしい — typicality / hearsay from indirect evidence:
  - Hearsay: 彼は来ないらしい (apparently he's not coming — I heard indirectly)
  - Typicality: 男らしい (manly / like a man should be), 春らしい天気 (spring-like weather)
  - Attaches to plain form directly (no な/の needed)
  - Key contrast with ようだ: らしい signals indirect/secondhand evidence; ようだ signals direct observation
- **THE 4-WAY COMPARISON** — this is the critical N3 test topic:
  - そうだ (appearance, G22): looks like ~ (immediate visual impression) — おいしそう
  - そうだ (hearsay, G22): I heard that ~ (reported speech) — おいしいそうだ
  - ようだ / みたいだ: it seems like ~ (inference from observed evidence) — おいしいようだ
  - らしい: apparently ~ (indirect evidence / typicality) — おいしいらしい
  - Each has a different evidence source and different attachment rules — this chart is the core of the lesson

**Recommended sections:**
1. `grammarIntro` — the "evidence hierarchy" in Japanese; brief callback to G16 resemblance vs this lesson's inference focus
2. `grammarRule` — ようだ (evidence-based inference; attachment rules; polite ようです)
3. `grammarRule` — みたいだ (casual inference equivalent; direct attachment; no の)
4. `grammarComparison` — ようだ vs みたいだ (same inference meaning, formal vs casual register)
5. `grammarRule` — らしい (hearsay + typicality dual use; attachment rules; contrast with ようだ evidence source)
6. `grammarTable` — THE 4-WAY CHART: そうだ(appearance) / そうだ(hearsay) / ようだ / らしい — attachment rules, evidence source, meaning, and examples in one table
7. `annotatedExample` — all four patterns in parallel situations (weather, food, people)
8. `patternMatch` — identify which inference type is being used given the evidence context
9. `conversation` — dialogue using all four naturally
10. `fillSlot` — choose the right inference form given context clues about evidence source
11. `drills` — mixed MCQ heavily testing the 4-way distinction

---

### G36 — Expectation & Reasoning (はずだ / わけだ)

| Field | Value |
|---|---|
| **ID** | `G36` |
| **Level** | N3 |
| **Unlocks after** | N3.14 |
| **Icon** | 🧠 |
| **Estimated minutes** | 25 |

**What to teach:**
- はずだ — should be / expected to be (based on logic/knowledge):
  - Plain form + はずだ: 届くはずだ (it should arrive — I know it was shipped)
  - Noun + の + はずだ: 先生のはずだ (should be the teacher)
  - Negative: はずがない (can't possibly be): 知っているはずがない (there's no way they know)
  - Past: はずだった (was supposed to — but didn't): 届くはずだった (it was supposed to arrive)
- わけだ — that explains it / no wonder:
  - Plain form + わけだ: 道理で暑いわけだ (no wonder it's hot — now I understand why)
  - Used when the speaker realizes the reason for something
- わけがない — there's no way / impossible:
  - できるわけがない (there's no way I can do it)
  - Stronger denial than はずがない
- わけにはいかない — can't afford to / mustn't (social/moral obligation):
  - 辞めるわけにはいかない (I can't just quit — there are obligations/consequences)
  - Not about ability but about social/moral impossibility

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — はずだ (logical expectation)
3. `grammarRule` — はずがない (can't possibly be)
4. `grammarRule` — わけだ (that explains it)
5. `grammarRule` — わけがない (no way)
6. `grammarRule` — わけにはいかない (can't afford to)
7. `grammarComparison` — はずがない vs わけがない (expectation-denial vs impossibility)
8. `annotatedExample` — reasoning patterns in daily/work situations
9. `conversation` — dialogue with deductions and realizations
10. `fillSlot` — choose はず/わけ expressions in context
11. `drills` — mixed MCQ

---

### G37 — Aspect & Temporal States (ところだ / たばかり)

| Field | Value |
|---|---|
| **ID** | `G37` |
| **Level** | N3 |
| **Unlocks after** | N3.18 |
| **Icon** | ⏱️ |
| **Estimated minutes** | 20 |

**What to teach:**
- ところだ — three-stage aspect:
  - Dictionary form + ところだ: 食べるところだ (about to eat)
  - ている + ところだ: 食べているところだ (in the middle of eating)
  - た + ところだ: 食べたところだ (just ate — moments ago)
  - Polite: ところです
- たばかり — just did (relatively recent):
  - た-form + ばかり: 来たばかりだ (just arrived — could be minutes or days ago)
  - More flexible timeframe than たところだ
  - Expanding G17's ばかり from "nothing but" to temporal use
- Comparison: たところだ vs たばかりだ:
  - たところだ = just this moment (very recent, almost immediate)
  - たばかりだ = recently (broader — could be hours, days, even weeks depending on context)

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — ところだ (about to / in the middle of / just did)
3. `grammarTable` — the three stages of ところだ side by side
4. `grammarRule` — たばかり (recently did)
5. `grammarComparison` — たところだ vs たばかりだ
6. `annotatedExample` — all stages in daily life
7. `conversation` — dialogue about timing (arriving, leaving, starting tasks)
8. `drills` — mixed MCQ

---

### G38 — Sentence-Ending Particles & Register

| Field | Value |
|---|---|
| **ID** | `G38` |
| **Level** | N3 |
| **Unlocks after** | N3.22 |
| **Icon** | 💬 |
| **Estimated minutes** | 20 |

**What to teach:**
- よ — asserting new information the listener doesn't know: おいしいよ (it's good, you know!)
- ね — seeking agreement / confirming shared knowledge: いい天気ですね (nice weather, isn't it?)
- な — self-directed musing / mild emotion: 難しいな (hmm, this is hard)
- わ — soft assertion (traditionally feminine, increasingly gender-neutral in some regions): きれいだわ
- ぞ — strong assertion / self-pumping (masculine/rough): 行くぞ (let's go! / I'm going!)
- ぜ — similar to ぞ but slightly lighter: やるぜ (I'll do it!)
- さ — casual filler / soft assertion: まあ、いいさ (well, it's fine)
- かな — wondering / internal question: 明日は晴れるかな (I wonder if it'll be sunny tomorrow)
- Combinations: よね (asserting while seeking agreement — very common), だよね (casual confirmation)
- Register and gender notes: which particles are neutral, which skew masculine/feminine, which are formal/informal

**Recommended sections:**
1. `grammarIntro` — why these tiny words carry so much social meaning
2. `grammarRule` — よ and ね (the two most essential)
3. `grammarComparison` — よ vs ね (new info assertion vs shared info confirmation)
4. `grammarRule` — な, わ, さ (softer/reflective particles)
5. `grammarRule` — ぞ, ぜ (strong/masculine particles)
6. `grammarRule` — かな, よね (combinations and wondering)
7. `grammarTable` — full chart: particle, meaning, register, gender tendency, example
8. `annotatedExample` — same sentence with different ending particles showing meaning shifts
9. `conversation` — casual dialogue heavy with ending particles
10. `drills` — mixed MCQ (choose the right particle for the social context)

---

### G39 — Adverbs of Degree

| Field | Value |
|---|---|
| **ID** | `G39` |
| **Level** | N3 |
| **Unlocks after** | N3.26 |
| **Icon** | 📊 |
| **Estimated minutes** | 25 |

**What to teach:**

The full degree scale, organized into tiers:

- **Not at all (with negative):** ちっとも, 全く, 全然 — all require negative predicate. Note: 全然 is increasingly used with positives in casual speech (全然いい) but traditionally negative-only.
- **Not very / not really:** あまり (+ negative), ほとんど (+ negative = almost not), いまいち (underwhelming), 特に (not particularly, with negative), 大して (not greatly, with negative)
- **Slightly / a little:** ほんの少し, やや, 少し, ちょっと, いささか (literary), 若干 (somewhat formal)
- **Moderately / somewhat:** ある程度 (to a degree), そこそこ, まあまあ, それなりに, 割と/割かし (unexpectedly)
- **Considerably / quite:** 大分, 結構, 随分 — note: 結構 can also mean "fine/no thank you"
- **Very / extremely:** とても, かなり, 相当, 非常に (formal), 大変, すごく
- **Remarkably / extraordinarily:** 極めて (formal), めっちゃ (casual), とてつもなく, ものすごく, あまりにも

- よほど/よっぽど + conditional: よっぽどのことがない限り (unless something extreme happens), よほど頭がよくないと (unless you're really smart)
- Register awareness: which adverbs are written/formal (非常に, 極めて, いささか) vs spoken/casual (めっちゃ, すごく, ちょー)

**Recommended sections:**
1. `grammarIntro` — degree nuance matters; the same adjective with different adverbs conveys very different intensity
2. `grammarTable` — the full degree scale organized by tier with register markers
3. `grammarRule` — negative-requiring adverbs (ちっとも/全く/全然/あまり + negative)
4. `grammarRule` — middle-range adverbs (割と, 結構, まあまあ — these surprise learners)
5. `grammarRule` — よほど/よっぽど + conditional pattern
6. `grammarComparison` — formal vs casual at the same degree level (非常に vs すごく vs めっちゃ)
7. `annotatedExample` — same situation described at different degree levels
8. `conversation` — dialogue using natural degree adverbs
9. `fillSlot` — choose the right degree adverb for the context and register
10. `drills` — mixed MCQ

---

### G40 — Honorific & Humble Speech (敬語 Introduction)

| Field | Value |
|---|---|
| **ID** | `G40` |
| **Level** | N3 |
| **Unlocks after** | N3.34 |
| **Icon** | 🎩 |
| **Estimated minutes** | 30 |

**What to teach:**

- The three registers of keigo:
  - 尊敬語 (sonkeigo) — honorific: elevates the other person's actions
  - 謙譲語 (kenjougo) — humble: lowers your own actions
  - 丁寧語 (teineigo) — polite: です/ます (already taught in G1/G7)
- Honorific patterns — お/ご～になる:
  - お + verb ます-stem + になる: お読みになる (you read — honorific)
  - ご + Sino-Japanese noun + になる: ご利用になる (you use — honorific)
- Humble patterns — お/ご～する:
  - お + verb ます-stem + する: お持ちする (I'll carry it — humble)
  - ご + Sino-Japanese noun + する: ご連絡する (I'll contact you — humble)
- Special honorific verbs (memorization set):
  - いらっしゃる — honorific for いる/行く/来る
  - おっしゃる — honorific for 言う
  - 召し上がる — honorific for 食べる/飲む
  - ご覧になる — honorific for 見る
  - くださる — honorific for くれる (→ ください already known from G8)
  - なさる — honorific for する
- Special humble verbs (memorization set):
  - 参る (まいる) — humble for 行く/来る
  - 申す (もうす) — humble for 言う
  - いただく — humble for もらう/食べる/飲む (previewed in G14)
  - 拝見する (はいけんする) — humble for 見る
  - おる — humble for いる
  - 存じる (ぞんじる) — humble for 知る/思う
  - いたす — humble for する
- When to use which: "Is this about THEIR action (→ honorific) or MY action (→ humble)?"

**Recommended sections:**
1. `grammarIntro` — the social importance of keigo; the three-register system
2. `grammarRule` — お/ご～になる (honorific pattern)
3. `grammarRule` — お/ご～する (humble pattern)
4. `grammarTable` — special verb chart: plain → honorific → humble for all common verbs
5. `grammarComparison` — honorific vs humble (same situation from different perspectives)
6. `grammarRule` — common mistakes (using honorific for yourself, humble for superiors)
7. `annotatedExample` — keigo in workplace, customer service, and formal social situations
8. `conversation` — two dialogues: office hierarchy, customer interaction
9. `patternMatch` — identify whether honorific or humble is correct in each sentence
10. `drills` — mixed MCQ

---

### G41 — Time Clauses (間 / うちに / 以来 / とたん)

| Field | Value |
|---|---|
| **ID** | `G41` |
| **Level** | N3 |
| **Unlocks after** | N3.38 |
| **Icon** | ⏰ |
| **Estimated minutes** | 25 |

**What to teach:**
- 間 (あいだ) — during the whole time:
  - 寝ている間、雨が降っていた (while I was sleeping, it was raining the whole time)
  - The secondary action continues throughout the primary action
- 間に (あいだに) — at some point during:
  - 寝ている間に、雨が降った (while I was sleeping, it rained [at some point])
  - A one-time event happens within the duration of the primary action
- うちに — while the condition still holds (urgency/before it changes):
  - 若いうちに旅行したい (I want to travel while I'm still young)
  - 忘れないうちに書く (write it down before I forget)
  - Implies the condition is temporary and will change
- 以来 (いらい) — ever since:
  - 卒業以来会っていない (haven't met since graduation)
  - た-form + 以来 or noun + 以来
- たとたん(に) — the instant that:
  - ドアを開けたとたん、猫が逃げた (the instant I opened the door, the cat ran away)
  - Immediate, unexpected consequence

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — 間 (throughout)
3. `grammarRule` — 間に (at some point during)
4. `grammarComparison` — 間 vs 間に (continuous vs point-in-time)
5. `grammarRule` — うちに (before condition changes)
6. `grammarRule` — 以来 (ever since)
7. `grammarRule` — たとたんに (the instant that)
8. `annotatedExample` — all patterns in daily/travel/work contexts
9. `conversation` — dialogue about life changes and timing
10. `fillSlot` — choose 間/間に/うちに/以来/とたん
11. `drills` — mixed MCQ

---

### G42 — Perspective & Relation Particles

| Field | Value |
|---|---|
| **ID** | `G42` |
| **Level** | N3 |
| **Unlocks after** | N3.42 |
| **Icon** | 🔗 |
| **Estimated minutes** | 25 |

**What to teach:**
- にとって — from the perspective of / for:
  - 私にとって日本語は難しい (for me, Japanese is difficult)
  - Marks whose perspective is being described
- に対して (にたいして) — toward / in contrast to:
  - 先生に対して失礼だ (rude toward the teacher)
  - Contrast use: 兄はスポーツが好きだ。それに対して弟は読書が好きだ (older brother likes sports; in contrast, younger brother likes reading)
- について — about / regarding:
  - 日本の文化について話す (talk about Japanese culture)
  - Expanding G30's brief mention to full treatment
- として — in the capacity of / as:
  - 教師として働く (work as a teacher)
  - 友だちとして言う (say this as a friend)
- にわたって/にかけて — over the span of / throughout:
  - 三年にわたって研究した (researched over three years)
  - 春から夏にかけて暑くなる (it gets hot from spring through summer)

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — にとって (perspective)
3. `grammarRule` — に対して (toward / contrast)
4. `grammarRule` — について (regarding)
5. `grammarRule` — として (in the role of)
6. `grammarRule` — にわたって / にかけて (span)
7. `annotatedExample` — compound particles in news/essay/formal contexts
8. `conversation` — dialogue about opinions, roles, topics
9. `fillSlot` — choose the right compound particle
10. `drills` — mixed MCQ

---

### G43 — Causative-Passive & Advanced Voice

| Field | Value |
|---|---|
| **ID** | `G43` |
| **Level** | N3 |
| **Unlocks after** | N3.46 |
| **Icon** | 🔄 |
| **Estimated minutes** | 25 |

**What to teach:**
- させられる — full causative-passive (made to do against one's will):
  - RU-verbs: 食べさせられる (was made to eat)
  - U-verbs: 飲ませられる → shortened: 飲まされる
  - する → させられる, くる → こさせられる
  - Always implies the speaker/subject was forced or inconvenienced
  - Agent marked with に: 先生に宿題をやらされた (I was made to do homework by the teacher)
- Shortened U-verb forms: ～あせられる → ～あされる:
  - 飲ませられる → 飲まされる, 行かせられる → 行かされる
  - The shortened form is much more common in speech
- ざるを得ない — have no choice but to:
  - Dictionary form stem + ざるを得ない: 行かざるを得ない (have no choice but to go)
  - する → せざるを得ない (irregular)
  - Formal/written; means the same as ～しかない but more literary
- ないわけにはいかない — can't not do / must (social obligation):
  - 行かないわけにはいかない (I can't NOT go — social pressure)
  - Slightly different nuance from なければならない — emphasizes that not doing it is socially impossible

**Recommended sections:**
1. `grammarIntro` — completing the voice system
2. `grammarTable` — causative-passive chart (RU, U, する, くる) with shortened forms
3. `grammarRule` — causative-passive (being made to do)
4. `grammarRule` — shortened U-verb forms
5. `grammarRule` — ざるを得ない (no choice but to)
6. `grammarRule` — ないわけにはいかない (can't avoid doing)
7. `grammarComparison` — ざるを得ない vs しかない (same meaning, different register)
8. `annotatedExample` — workplace/school forced situations
9. `conversation` — dialogue about unwanted obligations
10. `conjugationDrill` — dictionary form → causative-passive (include shortened forms)
11. `drills` — mixed MCQ

---

### G44 — Suffixes & Word Formation (っぽい / がち / 気味 / ～やか)

| Field | Value |
|---|---|
| **ID** | `G44` |
| **Level** | N3 |
| **Unlocks after** | N3.50 |
| **Icon** | 🧩 |
| **Estimated minutes** | 20 |

**What to teach:**
- っぽい — -ish / has a tendency toward:
  - Noun/verb stem + っぽい: 忘れっぽい (forgetful), 子どもっぽい (childish), 怒りっぽい (short-tempered)
  - Slightly negative connotation — "too much of" or "reminiscent of"
  - Conjugates as an i-adjective
- がち — prone to / tends to (negative tendency):
  - Verb ます-stem + がち: 遅れがち (tends to be late), 休みがち (frequently absent)
  - Noun + がち: 病気がち (sickly / prone to illness)
  - Almost always negative tendencies
- 気味 (ぎみ) — slight touch of / a bit:
  - Noun/verb ます-stem + 気味: 風邪気味 (a bit of a cold), 疲れ気味 (a bit tired), 太り気味 (slightly overweight)
  - Milder than がち — just a slight tendency or condition
- ～やか(な) — adjective-forming suffix:
  - 穏やか (calm), 爽やか (refreshing), 賑やか (lively), 鮮やか (vivid), 健やか (healthy), 速やか (prompt), しなやか (supple)
  - These are na-adjectives
  - Productive but somewhat literary/formal

**Recommended sections:**
1. `grammarIntro` — how suffixes expand your vocabulary exponentially
2. `grammarRule` — っぽい
3. `grammarRule` — がち
4. `grammarRule` — 気味
5. `grammarComparison` — っぽい vs がち vs 気味 (degree of tendency, connotation)
6. `grammarRule` — ～やか(な) adjectives
7. `grammarTable` — suffix comparison chart with examples
8. `annotatedExample` — describing personality traits, health, tendencies
9. `conversation` — dialogue about habits and personality
10. `drills` — mixed MCQ

---

### G45 — Advanced Conditionals & Wishes

| Field | Value |
|---|---|
| **ID** | `G45` |
| **Level** | N3 |
| **Unlocks after** | N3.54 |
| **Icon** | 💫 |
| **Estimated minutes** | 25 |

**What to teach:**
- さえ～ば — if only / as long as:
  - Noun + さえ + verb-ば: お金さえあれば (if only I had money / as long as there's money)
  - Verb て-form + さえ + いれば: 勉強してさえいれば (as long as you keep studying)
  - さえ emphasizes the ONE critical condition
- ば/たらいい — should / it would be good if:
  - 聞けばいい (you should just ask), 早く寝たらいい (you should go to bed early)
  - Used for advice giving
- ばよかった / たらよかった — should have / wish I had (regret):
  - もっと勉強すればよかった (I should have studied more)
  - あの映画を見ればよかった (I wish I had seen that movie)
  - Expresses past regret about an action not taken
- としたら / とすれば — if we assume that / if it were the case:
  - もし私だとしたら (if I were in that situation)
  - 本当だとすれば (if it's true)
  - Hypothetical assumption framing

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — さえ～ば (critical single condition)
3. `grammarRule` — ばいい / たらいい (advice)
4. `grammarRule` — ばよかった / たらよかった (regret)
5. `grammarComparison` — ばいい (advice) vs ばよかった (regret) — present vs past
6. `grammarRule` — としたら / とすれば (hypothetical assumption)
7. `annotatedExample` — advice, regret, and hypothetical situations
8. `conversation` — dialogue about advice and past regrets
9. `sentenceTransform` — convert between advice and regret forms
10. `drills` — mixed MCQ

---

### G46 — Quoting & Indirect Speech

| Field | Value |
|---|---|
| **ID** | `G46` |
| **Level** | N3 |
| **Unlocks after** | N3.58 |
| **Icon** | 🗣️ |
| **Estimated minutes** | 25 |

**What to teach:**
- という — called / named / known as:
  - 「さくら」という映画 (a movie called "Sakura")
  - Noun modification: という functions like a relative clause marker for names/definitions
- ということ — the fact that / it means that:
  - 彼が来るということを知っていた (I knew the fact that he was coming)
  - それは無理だということだ (that means it's impossible)
- といわれている / といっている — it is said that / someone is saying:
  - 日本は安全だといわれている (it is said that Japan is safe)
  - 母は早く帰ってこいと言っている (mom is saying to come home early)
- ように言う / ように頼む — tell/ask someone to:
  - 先生が静かにするように言った (the teacher told us to be quiet)
  - 友だちに手伝うように頼んだ (I asked my friend to help)
  - Note: ように for indirect commands (not quoting exact words)
- Embedded questions with か and かどうか:
  - 何時に来るか知っていますか (do you know what time they're coming?)
  - 行くかどうか決めていない (I haven't decided whether to go or not)
  - Expanding G30's brief mention of かどうか

**Recommended sections:**
1. `grammarIntro` — the richness of Japanese quotation and embedding
2. `grammarRule` — という (naming/defining)
3. `grammarRule` — ということ (the fact that)
4. `grammarRule` — といわれている (it is said)
5. `grammarRule` — ように言う/頼む (indirect commands)
6. `grammarRule` — embedded questions with か/かどうか
7. `annotatedExample` — quoting in news, conversation, instructions
8. `conversation` — dialogue reporting what others said, asking indirect questions
9. `fillSlot` — choose the right quoting pattern
10. `drills` — mixed MCQ

---

### G47 — Compound Expressions & Set Patterns

| Field | Value |
|---|---|
| **ID** | `G47` |
| **Level** | N3 |
| **Unlocks after** | N3.64 |
| **Icon** | 🧱 |
| **Estimated minutes** | 25 |

**What to teach:**
- ずに / ないで — without doing:
  - 食べずに出かけた (went out without eating)
  - ずに is slightly more formal than ないで
  - する → せずに (irregular)
- ことはない — there's no need to:
  - 心配することはない (there's no need to worry)
  - Reinforces G31's こと patterns
- しかない / ほかない — have no choice but to:
  - 歩くしかない (have no choice but to walk)
  - 待つほかない (nothing to do but wait)
  - Casual/everyday equivalent of ざるを得ない (G41)
- てはいられない — can't keep doing / can't afford to stay in a state:
  - 待ってはいられない (can't keep waiting)
  - こんなことで泣いてはいられない (can't keep crying about something like this)
- にちがいない — must be / no doubt:
  - 犯人にちがいない (must be the culprit)
  - Plain form + にちがいない: 来るにちがいない (no doubt they'll come)
  - Stronger certainty than はず (G34)
- もう/まだ grammar patterns:
  - もう + past: もう食べました (already ate)
  - まだ + ていない: まだ食べていません (haven't eaten yet)
  - もう + negative: もう食べません (won't eat anymore)
  - まだ + positive: まだ食べています (still eating)
  - The four もう/まだ combinations

**Recommended sections:**
1. `grammarIntro`
2. `grammarRule` — ずに/ないで (without doing)
3. `grammarRule` — ことはない (no need to)
4. `grammarRule` — しかない/ほかない (no choice but)
5. `grammarRule` — てはいられない (can't keep doing)
6. `grammarRule` — にちがいない (must be)
7. `grammarTable` — もう/まだ four-pattern chart
8. `annotatedExample` — all patterns in urgent/decisive contexts
9. `conversation` — dialogue with urgency, conclusions, and necessity
10. `drills` — mixed MCQ

---

### G48 — Advanced Connectors

| Field | Value |
|---|---|
| **ID** | `G48` |
| **Level** | N3 |
| **Unlocks after** | N3.72 |
| **Icon** | 🔀 |
| **Estimated minutes** | 20 |

**What to teach:**
- 一方(で) (いっぽうで) — on the other hand / while:
  - 勉強する一方で、アルバイトもしている (while studying, I also have a part-time job)
  - Can express contrast or simultaneous activities
- 反面 (はんめん) — on the flip side:
  - 便利な反面、危険だ (convenient, but on the flip side, dangerous)
  - Always contrasting positive with negative (or vice versa)
- それに — moreover / in addition:
  - 安い。それに、おいしい (it's cheap. Moreover, it's delicious)
  - Adds supporting info in the same direction
- しかも — what's more / and on top of that:
  - 遅刻した。しかも、宿題も忘れた (was late. What's more, forgot homework too)
  - Stronger addition than それに, often escalating
- その上 (そのうえ) — on top of that:
  - Similar to しかも but slightly more formal
- それにしても — even so / nevertheless:
  - 難しいのは分かる。それにしても、もう少し頑張れるはずだ (I understand it's difficult. Even so, you should be able to try harder)
- かわりに — instead of / in return for:
  - 映画のかわりに本を読んだ (read a book instead of watching a movie)
  - 手伝うかわりに、ケーキをもらった (in return for helping, I got cake)

**Recommended sections:**
1. `grammarIntro` — connecting paragraphs and complex arguments
2. `grammarRule` — 一方で / 反面 (contrast connectors)
3. `grammarRule` — それに / しかも / その上 (additive connectors)
4. `grammarRule` — それにしても (concessive connector)
5. `grammarRule` — かわりに (replacement/exchange)
6. `grammarComparison` — それに vs しかも vs その上 (degree of escalation)
7. `annotatedExample` — connectors in essays, news, debate-style passages
8. `conversation` — dialogue with complex reasoning
9. `fillSlot` — choose the right connector
10. `drills` — mixed MCQ

---

### G49 — N3 Grammar Capstone Review

| Field | Value |
|---|---|
| **ID** | `G49` |
| **Level** | N3 |
| **Unlocks after** | N3.84 |
| **Icon** | 🏆 |
| **Estimated minutes** | 30 |

**What to teach:**
This is a mixed review lesson, not new grammar. Focus on the highest-confusion areas:

1. **The 4-way inference comparison:** そうだ(appearance) vs そうだ(hearsay) vs ようだ/みたいだ vs らしい — test attachment rules and evidence source
2. **ところだ three stages:** about to / in the middle of / just did
3. **Conditional nuances:** ば vs と vs たら vs なら vs さえ～ば — when to use which
4. **Voice system:** active → passive → causative → causative-passive — formation and usage
5. **はず vs わけ patterns:** expectation vs reasoning vs impossibility
6. **Honorific vs humble:** choosing the right register direction
7. **Nominalizer の vs こと:** sensory vs abstract
8. **Compound particles:** にとって vs に対して vs について vs として

**Recommended sections:**
1. `grammarIntro` — this is the final checkpoint; review strategy
2. `grammarTable` — master inference comparison chart
3. `grammarTable` — master voice system chart (active/passive/causative/causative-passive)
4. `patternMatch` — identify inference type across 6-8 items
5. `fillSlot` — mixed particles and expressions across 8-10 items
6. `sentenceTransform` — voice conversions (active → passive, active → causative-passive)
7. `conjugationDrill` — mixed conjugation across all N3 forms
8. `drills` — comprehensive MCQ covering all G32–G47 grammar points, 10-12 items minimum

---

## Content Brief Template for Grammar

Agent 1 should use this template instead of the standard CLAUDE.md Content Brief for grammar lessons:

```
GRAMMAR CONTENT BRIEF
═════════════════════
Type:              grammar
Target ID:         [e.g. G2]
Level:             [N5 | N4 | N3]
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
