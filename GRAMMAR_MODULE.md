# GRAMMAR_MODULE.md — Grammar Module Implementation Spec

> **Purpose:** This document contains everything needed to build the `Grammar.js` module from scratch. It defines the new section types, JSON schemas, color system, rendering behavior, manifest integration, progress tracking, and cross-linking to existing modules. Feed this to Claude Code as a standalone implementation brief.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [File Structure](#file-structure)
3. [Manifest Integration](#manifest-integration)
4. [Color System Constants](#color-system-constants)
5. [Visual Identity](#visual-identity)
6. [Section Type Schemas & Rendering](#section-type-schemas--rendering)
7. [Lesson Flow Convention](#lesson-flow-convention)
8. [Shared Infrastructure Reuse](#shared-infrastructure-reuse)
9. [Progress Tracking](#progress-tracking)
10. [Cross-Linking from Main Lessons](#cross-linking-from-main-lessons)
11. [Review Integration](#review-integration)
12. [TTS Integration](#tts-integration)
13. [Top-Level Grammar Lesson Schema](#top-level-grammar-lesson-schema)
14. [Implementation Priority](#implementation-priority)

---

## Architecture Overview

Grammar lessons are a **parallel lesson track** that teaches particles, conjugation, sentence patterns, and grammar rules explicitly. They unlock alongside the main kanji/vocabulary lessons but live in their own module with purpose-built section types.

### Why a new module

Grammar lessons need fundamentally different rendering than kanji lessons:
- Color-coded sentence diagrams with role-based highlighting
- Conjugation tables with split-colored stems/endings
- Side-by-side grammar comparisons
- Interactive slot-filling, pattern matching, and sentence transformation drills
- Visual pattern formulas (colored chip sequences)

### Module identity

| Property | Value |
|---|---|
| Module file | `Grammar.js` |
| Pattern follows | `Lesson.js`, `Review.js`, `Game.js` |
| Content type field | `"type": "grammar"` in JSON |
| Lesson ID format | `G1`, `G2`, ... `G20` |
| File extension | `.json` (same as lessons) |
| Header gradient | `linear-gradient(135deg, #F97316, #DC2626)` (orange-red) |
| Menu icon prefix | 📐 |

### Shared infrastructure

Grammar.js reuses these existing systems — do **not** rebuild them:
- `JPShared.textProcessor` — for rendering Japanese text with tappable terms
- `termModal` — for displaying vocabulary/kanji details on tap
- Glossary data loader — for resolving term IDs
- `conjugation_rules.json` — for validating and displaying conjugation forms
- TTS engine — for audio playback of example sentences
- Progress persistence layer — extend for grammar-specific keys

---

## File Structure

```
data/
  N5/
    grammar/
      G1.json
      G2.json
      G3.json
      G4.json
      G5.json
      G6.json
      G7.json
      G8.json
      G9.json
      G10.json
      G11.json
  N4/
    grammar/
      G12.json
      G13.json
      G14.json
      G15.json
      G16.json
      G17.json
      G18.json
      G19.json
      G20.json
```

---

## Manifest Integration

Grammar lessons get their own `grammar` array per level in `manifest.json`, parallel to `lessons` and `reviews`:

```json
{
  "data": {
    "N5": {
      "glossary": "data/N5/glossary.N5.json",
      "lessons": [ ... ],
      "grammar": [
        {
          "id": "G1",
          "title": "です / だ — Forms of 'To Be'",
          "file": "data/N5/grammar/G1.json",
          "unlocksAfter": "N5.1",
          "icon": "📐"
        },
        {
          "id": "G2",
          "title": "Core Particles I: は, が, の, か, も",
          "file": "data/N5/grammar/G2.json",
          "unlocksAfter": "N5.1",
          "icon": "📌"
        }
      ],
      "reviews": [ ... ]
    },
    "N4": {
      "grammar": [
        {
          "id": "G12",
          "title": "Potential Form",
          "file": "data/N4/grammar/G12.json",
          "unlocksAfter": "N4.3",
          "icon": "💪"
        }
      ]
    }
  }
}
```

### Unlock logic

A grammar lesson becomes accessible when the student has completed the lesson specified in `unlocksAfter`. The menu system should:
- Show grammar lessons grouped under their level
- Display with their icon and an "unlocks after [lesson]" badge if the prerequisite hasn't been completed
- Use a distinct visual treatment (orange-red accent) to differentiate from kanji lessons
- Show a 📐 or lesson-specific icon before the title

---

## Color System Constants

Every grammatical role gets a fixed color used across all grammar sections. Define these as module-level constants:

```javascript
const GRAMMAR_COLORS = {
  topic:       '#6C5CE7',  // purple     — は-marked, "what we're talking about"
  subject:     '#0984E3',  // blue       — が-marked, "who/what does the action"
  object:      '#00B894',  // green      — を-marked, "what receives the action"
  verb:        '#D63031',  // red        — the action or state (verb/predicate)
  particle:    '#FDCB6E',  // gold       — the particle itself, highlighted
  destination: '#E17055',  // coral      — に-marked, "where/when/to whom"
  location:    '#00CEC9',  // teal       — で-marked, "where/by what means"
  modifier:    '#A29BFE',  // lavender   — adjectives, descriptive words
  time:        '#FAB1A0',  // peach      — time expressions
  connector:   '#FD79A8',  // pink       — conjunctions and linking words
  predicate:   '#D63031',  // alias for verb
};
```

### Usage rules
- Colors appear as **background highlights** (with low opacity ~15%) behind text spans, plus a **bottom border** (2px solid) in the full color
- In pattern formulas, colors are used as **chip backgrounds** at full saturation with white text
- In conjugation tables, colors mark **stem vs ending** splits within cells
- In comparison cards, colors are used as **left border accents** (4px solid)
- The gold particle color is the most frequently used — it highlights the particle being taught in every example

### Dark mode
If the app supports dark mode, provide a parallel `GRAMMAR_COLORS_DARK` set with slightly desaturated, lighter variants. The hue relationships must stay identical.

---

## Visual Identity

### Header
- Gradient: `linear-gradient(135deg, #F97316, #DC2626)` (orange to red)
- Distinguish from kanji lesson headers which use `linear-gradient(135deg, #667eea, #764ba2)`

### Section cards
- Slightly warmer background than kanji lessons (`#FFF8F5` vs `#FFFFFF`)
- Rounded corners matching existing card style
- Grammar sections use a thin top-border accent in the relevant grammar color

### Typography
- Japanese example text: same font as lessons but slightly larger for readability in annotated examples
- Pattern formula labels: small caps, bold, colored
- Explanations: same body font as lessons

---

## Section Type Schemas & Rendering

### 1. `grammarIntro`

**Purpose:** Opens each grammar lesson. Sets context and lists learning objectives.

**Schema:**
```json
{
  "type": "grammarIntro",
  "title": "string — display title",
  "icon": "string — emoji icon",
  "summary": "string — one-sentence description of the grammar point",
  "whyItMatters": "string — motivational context for why this matters",
  "youWillLearn": ["string — learning objective 1", "string — objective 2", "..."],
  "prerequisites": ["string — G-lesson IDs that should be completed first (optional)"]
}
```

**Rendering:**
- Full-width card
- Large emoji icon centered at top
- Title in bold below icon
- Summary text in medium weight
- `whyItMatters` in a subtle callout box with a 💡 icon
- `youWillLearn` as a compact checklist (not bullet points — use ☐ markers)
- No interaction needed — tap/scroll to continue
- If `prerequisites` are listed and incomplete, show a gentle "Complete [G-lesson] first for best results" nudge

---

### 2. `grammarRule`

**Purpose:** The core teaching unit. Displays a grammar pattern as a visual formula with color-coded components, explanation, and annotated examples.

**Schema:**
```json
{
  "type": "grammarRule",
  "id": "string — unique rule ID within the lesson (e.g. 'rule_wa_basic')",
  "pattern": [
    {
      "label": "string — grammatical role label (e.g. 'TOPIC', 'PARTICLE', 'COMMENT')",
      "color": "string — key from GRAMMAR_COLORS (e.g. 'topic', 'particle', 'verb')",
      "text": "string — the text or placeholder shown in the formula (e.g. 'X', 'は', '...')"
    }
  ],
  "meaning": "string — English translation of the pattern (e.g. 'As for X, ...')",
  "explanation": "string — plain English explanation of how the pattern works",
  "notes": ["string — additional notes, tips, or exceptions"],
  "examples": [
    {
      "parts": [
        {
          "text": "string — Japanese text segment",
          "role": "string — key from GRAMMAR_COLORS",
          "gloss": "string — short English gloss (optional, omit for particles)"
        }
      ],
      "en": "string — full English translation",
      "breakdown": "string — optional structural breakdown (e.g. 'Topic: I → Comment: am a student')"
    }
  ]
}
```

**Rendering:**
- **Pattern formula** at top: horizontal row of rounded colored chips. Each chip shows the `label` in small caps above and `text` below, colored per `color` key. Chips are connected by subtle → arrows.
- **Meaning** displayed below the formula in large, slightly bold text
- **Explanation** in body text below meaning
- **Notes** in a collapsible "📝 Notes" section — shown as a list with muted styling
- **Examples** as cards below:
  - Each `parts` segment rendered inline, color-coded by `role` (background highlight + bottom border)
  - Tapping a word with `gloss` shows the gloss in a small tooltip above the word
  - English translation below in muted text
  - `breakdown` (if present) in a collapsible section
- **TTS button** on each example — plays the full Japanese sentence

---

### 3. `grammarTable`

**Purpose:** Conjugation tables, particle summaries, or form comparison charts.

**Schema:**
```json
{
  "type": "grammarTable",
  "title": "string — table title",
  "description": "string — brief explanation above the table",
  "tableType": "string — 'conjugation' | 'comparison' | 'summary'",
  "headers": ["string — column headers"],
  "rows": [
    {
      "label": "string — row label (e.g. 'Present / Future')",
      "cells": ["string — cell content for each column"],
      "meaning": "string — English meaning for this row (optional)"
    }
  ],
  "highlight": {
    "stem": "string — hex color for the unchanging stem portion",
    "ending": "string — hex color for the conjugation ending"
  },
  "notes": ["string — footnotes or rules below the table"]
}
```

**Rendering:**
- **`conjugation` type:** 
  - Standard table with sticky header row and sticky first column (for mobile horizontal scroll)
  - Each cell with `highlight` defined: the verb stem portion uses `highlight.stem` color background, the ending uses `highlight.ending`. This requires the renderer to split each cell string into stem + ending. The split point can be determined by comparing with the dictionary form (first row) or by explicit annotation.
  - **Implementation note for stem/ending split:** For each cell, compare with the dictionary form in the header. The shared prefix is the "stem" and the remainder is the "ending." For irregular verbs (する, くる), hardcode the split points. Alternatively, the JSON can provide an explicit split: `"cells": [{"stem": "食べ", "ending": "ます"}, ...]` — choose whichever approach is cleaner for the implementation.
  - `meaning` column on the right in muted italic text
  - Tap any cell to trigger TTS for that conjugated form
- **`comparison` type:**
  - Two-column layout with colored headers matching the grammar colors
  - Side-by-side examples in each row
  - More spacious than conjugation tables
- **`summary` type:**
  - Simple reference table, no color splitting
  - Used for particle quick-reference sheets
- **Notes** below the table in a callout box

---

### 4. `grammarComparison`

**Purpose:** Side-by-side breakdown of easily confused grammar points (は vs が, に vs で, etc.)

**Schema:**
```json
{
  "type": "grammarComparison",
  "title": "string — comparison title (e.g. 'は vs が')",
  "items": [
    {
      "label": "string — item label (e.g. 'は — Topic Marker')",
      "color": "string — key from GRAMMAR_COLORS",
      "points": ["string — key differences or usage rules"],
      "example": {
        "parts": [
          {
            "text": "string",
            "role": "string — GRAMMAR_COLORS key"
          }
        ],
        "en": "string — English translation"
      }
    }
  ],
  "tip": "string — a memorable tip for distinguishing the two (displayed in a 💡 callout)"
}
```

**Rendering:**
- **Two cards side by side** on desktop; **stacked vertically** on mobile
- Each card has a **4px left border** in its `color`
- Card header: `label` in bold with a colored dot
- `points` as a compact list inside the card
- `example` below: annotated Japanese sentence with color-coded parts, English below
- **💡 Tip** callout spans full width below both cards, with warm background
- TTS button on each example

---

### 5. `annotatedExample`

**Purpose:** A collection of example sentences where every word is color-coded by grammatical role. Used when more examples are needed than `grammarRule` provides.

**Schema:**
```json
{
  "type": "annotatedExample",
  "title": "string — section title",
  "examples": [
    {
      "context": "string — usage context label (e.g. 'Marking a destination')",
      "parts": [
        {
          "text": "string",
          "role": "string — GRAMMAR_COLORS key",
          "gloss": "string — English gloss (optional)"
        }
      ],
      "en": "string — full English translation",
      "note": "string — explanation of why this usage applies (optional)"
    }
  ]
}
```

**Rendering:**
- Each example is a **card** with:
  - `context` as a small colored label/tag at top
  - Japanese sentence with color-coded word spans (background + border per role)
  - Tapping a word with `gloss` shows tooltip
  - English translation below in muted text
  - `note` in a collapsible "Why?" section
- TTS button on each example
- Cards are stacked vertically with subtle spacing

---

### 6. `conjugationDrill`

**Purpose:** Interactive conjugation practice. Student converts a verb to a target form by selecting from choices.

**Schema:**
```json
{
  "type": "conjugationDrill",
  "title": "string",
  "instructions": "string — what the student should do",
  "items": [
    {
      "verb": "string — dictionary form in kanji (e.g. '食べる')",
      "type": "string — 'ru' | 'u' | 'irregular'",
      "reading": "string — dictionary form reading (e.g. 'たべる')",
      "targetForm": "string — target form label (e.g. 'te_form', 'polite_masu')",
      "answer": "string — correct conjugated form in kanji (e.g. '食べて')",
      "answerReading": "string — reading of the answer (e.g. 'たべて')",
      "hint": "string — conjugation rule hint (e.g. 'RU-verb: drop る, add て')",
      "choices": ["string — 4 answer choices including the correct one"]
    }
  ]
}
```

**Rendering:**
- **Running score** at top: "X / Y correct" with a progress bar
- Each item displayed one at a time:
  - Dictionary form prominently displayed with **verb type badge** (RU / U / IRR in a small colored chip)
  - Arrow → target form label (e.g. "→ て-form")
  - Four choice buttons styled as rounded chips (not standard buttons)
  - **On correct:** green flash animation, the rule hint appears briefly as a success message ("す → して ✓"), TTS plays the answer, advance to next after short delay
  - **On wrong:** red flash, hint expands and stays visible, correct answer highlights in green, student must tap the correct answer to proceed
- After all items: summary showing score, with per-verb-type breakdown (e.g. "RU-verbs: 3/3, U-verbs: 2/4, Irregular: 1/1") so students can see where they struggle
- Celebration animation (match existing lesson drill celebration) if score ≥ 80%

---

### 7. `patternMatch`

**Purpose:** Given a grammar pattern, student identifies which sentences correctly use it. Tests recognition.

**Schema:**
```json
{
  "type": "patternMatch",
  "title": "string",
  "pattern": "string — the pattern being tested (e.g. 'DESTINATION + に + VERB of motion')",
  "items": [
    {
      "sentence": "string — Japanese sentence",
      "correct": "boolean — is this a correct usage?",
      "explanation": "string — why it's correct or incorrect"
    }
  ]
}
```

**Rendering:**
- Pattern displayed at top as a formula (use same chip styling as `grammarRule` patterns)
- Each sentence as a card with ✓ and ✗ buttons
- **Before answering:** sentence displayed with neutral styling
- **After answering correctly:** card border turns green, explanation slides in below
- **After answering incorrectly:** card border turns red, explanation slides in, the relevant words in the sentence highlight to show why
- Running score at top
- TTS button on each sentence

---

### 8. `sentenceTransform`

**Purpose:** Given a sentence in one form, student transforms it to another (formal↔informal, positive↔negative, present↔past).

**Schema:**
```json
{
  "type": "sentenceTransform",
  "title": "string",
  "instructions": "string — what transformation to apply",
  "items": [
    {
      "given": "string — the original sentence",
      "givenLabel": "string — form label (e.g. 'Polite Present')",
      "targetLabel": "string — target form label (e.g. 'Polite Negative')",
      "answer": "string — correct transformed sentence",
      "choices": ["string — 4 answer choices including the correct one"]
    }
  ]
}
```

**Rendering:**
- Each item displayed one at a time:
  - **"From" card** on the left/top: shows `given` sentence with `givenLabel` as a colored tag
  - **Arrow** (→) pointing to...
  - **"To" card** on the right/bottom: empty with `targetLabel` tag, waiting for answer
  - Four choice buttons below
  - **On correct:** answer fills the "To" card with a smooth slide-in animation, green border, TTS plays
  - **On wrong:** red flash on wrong choice, correct answer highlights, student must select correct answer
- Running score at top

---

### 9. `fillSlot`

**Purpose:** Sentence with a blank slot where a particle or form should go. Student taps the correct choice to fill it.

**Schema:**
```json
{
  "type": "fillSlot",
  "title": "string",
  "items": [
    {
      "before": "string — text before the slot",
      "slot": true,
      "after": "string — text after the slot",
      "choices": ["string — 3-4 answer choices"],
      "answer": "string — correct choice",
      "explanation": "string — why this is the correct answer"
    }
  ]
}
```

**Rendering:**
- Each item displayed one at a time:
  - Sentence displayed with `before` text, then a **gold-bordered empty slot** (matching particle color), then `after` text
  - Choice chips float below the sentence
  - **Tap interaction:** tapping a choice animates it dropping into the slot
  - **Submit button** (or auto-submit on tap — choose based on app convention)
  - **On correct:** slot turns green, brief explanation appears below, TTS plays the complete sentence
  - **On wrong:** slot turns red, explanation expands, correct answer highlights among the choices
- Running score at top

---

### 10. Reused Section Types

These existing section types work as-is inside grammar lessons. **Do not rebuild them** — import and render using the existing Lesson.js / Review.js implementations:

#### `conversation`
Same schema as Lesson.js conversations. Grammar lessons use these to show the grammar point in natural dialogue. The only difference: when rendering inside Grammar.js, apply grammar color highlights to any words that match the lesson's focus particles/forms (use the lesson's `meta.particles` or `meta.grammarForms` arrays to identify which words to highlight).

```json
{
  "type": "conversation",
  "title": "string",
  "context": "string",
  "lines": [
    {
      "spk": "string",
      "jp": "string",
      "en": "string",
      "terms": ["... — same term tagging as Lesson.js"]
    }
  ]
}
```

#### `drills`
Same schema as Lesson.js drills. Used for mixed review MCQ and scramble exercises at the end of a grammar lesson.

```json
{
  "type": "drills",
  "title": "string",
  "instructions": "string",
  "items": [
    {
      "kind": "mcq",
      "q": "string",
      "choices": ["string × 4"],
      "answer": "string",
      "terms": ["... — optional, same rules as Lesson.js"],
      "explanation": "string — optional"
    }
  ]
}
```

---

## Lesson Flow Convention

Every grammar lesson follows this general arc. Not every lesson uses every section type — the content determines which are appropriate.

```
grammarIntro           →  "Here's what we're learning and why"
                          (always first, exactly one)

grammarRule (×1-3)     →  "Here's the pattern/rule"
                          (core teaching — 1 per grammar point in the lesson)

grammarTable           →  "Here's the full picture"
                          (for conjugation/form-heavy lessons; 0-2 per lesson)

grammarComparison      →  "Don't confuse these"
                          (when the lesson covers easily confused pairs; 0-2 per lesson)

annotatedExample       →  "See it in real sentences"
                          (3-6 examples showing varied usage; 0-1 per lesson)

conversation           →  "See it in dialogue"
                          (natural conversation using the grammar; 1-2 per lesson)

[practice sections]    →  Interactive drilling (mix of the following; 1-3 per lesson):
                          - conjugationDrill (for verb/adjective lessons)
                          - patternMatch (for particle/pattern lessons)
                          - fillSlot (for particle lessons)
                          - sentenceTransform (for form lessons)

drills                 →  Mixed review MCQ + scramble
                          (always last, exactly one)
```

### Which sections for which lesson types

| Lesson focus | Primary sections | Practice sections |
|---|---|---|
| Particles (G2, G3, G4, G13, G14) | grammarRule, grammarComparison, annotatedExample | fillSlot, patternMatch |
| Conjugation (G6, G7, G10, G11, G18) | grammarRule, grammarTable | conjugationDrill, sentenceTransform |
| Verb types/identification (G5) | grammarRule, grammarTable, grammarComparison | patternMatch (identify verb type) |
| Form usage (G1, G8, G9, G12, G15, G16, G19) | grammarRule, grammarComparison, annotatedExample | sentenceTransform, fillSlot |
| Mixed/capstone (G17, G20) | grammarRule, grammarTable (summary), annotatedExample | fillSlot, drills |

---

## Shared Infrastructure Reuse

### Term processing
Grammar lessons use the same `terms` array format as kanji lessons for `conversation` and `drills` sections. The existing `JPShared.textProcessor` handles term resolution and tappable span rendering — Grammar.js should use it directly.

For grammar-specific sections (`grammarRule`, `annotatedExample`, etc.), the `parts` array with `role` and `gloss` fields replaces the `terms` system. These are rendered by Grammar.js's own annotated-text renderer, not `textProcessor`. The two systems are separate:
- `terms` → existing textProcessor → tappable vocabulary spans → termModal
- `parts` → grammar color renderer → color-coded spans → gloss tooltips

### Glossary and conjugation data
Grammar.js accesses the same glossary files and `conjugation_rules.json` as Lesson.js. No duplication needed.

### Modal and overlay patterns
Reuse the existing modal/overlay patterns for any popups (gloss tooltips, hint expansions, etc.).

---

## Progress Tracking

Grammar progress extends the existing `JPShared.progress` system. New keys:

| Key pattern | Type | Purpose |
|---|---|---|
| `grammar_{id}_complete` | boolean | Whether the student has completed all sections |
| `grammar_{id}_section_{index}` | boolean | Per-section completion tracking |
| `grammar_{id}_drill_score` | number (0-100) | Best score on the final `drills` section |
| `grammar_{id}_conj_score` | number (0-100) | Best score on `conjugationDrill` sections |
| `grammar_{id}_conj_breakdown` | object | Per-verb-type accuracy: `{ ru: [correct, total], u: [correct, total], irr: [correct, total] }` |

### Completion conditions
A grammar lesson is "complete" when:
1. Every section has been viewed/attempted (all `grammar_{id}_section_{index}` = true)
2. The final `drills` section has been attempted at least once

Score thresholds for celebration animations should match the existing lesson/review celebration thresholds.

---

## Cross-Linking from Main Lessons

When a main kanji lesson's conversation or reading uses a grammar point that has a dedicated grammar supplement, the UI should show a small link:

**Display:** `📐 See G3` (or the grammar lesson title) — shown as a subtle chip/badge near the relevant line or at the bottom of the conversation section.

**Behavior:** Tapping the link navigates to the grammar lesson (if unlocked) or shows a "Complete [prerequisite] to unlock this grammar lesson" message.

**Implementation:**
- Each grammar lesson's `meta` includes `particles` and/or `grammarForms` arrays listing what it covers
- When rendering a main lesson conversation, check if any particles or grammar forms in the line's `terms` match a grammar lesson's `meta` fields
- If a match is found and the grammar lesson is unlocked, render the cross-link chip
- Cross-links should be non-intrusive — don't interrupt the lesson flow. A small icon at the end of the conversation section or in a collapsible footer is ideal.

---

## Review Integration

Grammar content integrates into the existing review system rather than having separate grammar reviews.

### How it works
- When a grammar lesson is completed, its drill content becomes eligible for inclusion in normal review sessions
- Review modules that cover lessons within a grammar lesson's unlock range should pull from that grammar lesson's `drills` and interactive sections
- The review system should treat grammar drill items the same as lesson drill items — same scoring, same term tagging, same UI

### Review item types from grammar
These grammar section types can generate review items:
- `fillSlot` → becomes a standard MCQ with the sentence + blank
- `conjugationDrill` → becomes a conjugation MCQ
- `sentenceTransform` → becomes a transformation MCQ
- `drills` → used directly (already in review-compatible format)
- `patternMatch` → becomes a true/false style MCQ

The review system should randomly sample from completed grammar lessons' practice sections, mixed in with kanji lesson review items.

---

## TTS Integration

Grammar lessons use the existing TTS engine. TTS buttons should appear on:

| Section type | TTS target |
|---|---|
| `grammarRule` | Each example sentence (plays the full `parts` concatenated) |
| `grammarTable` | Each cell (plays the conjugated form) |
| `grammarComparison` | Each example sentence |
| `annotatedExample` | Each example sentence |
| `conjugationDrill` | The correct answer (plays after correct selection) |
| `patternMatch` | Each sentence |
| `sentenceTransform` | The given sentence + the correct answer |
| `fillSlot` | The complete sentence with the correct answer filled in |
| `conversation` | Same as Lesson.js (per-line TTS) |

TTS input is constructed by concatenating the `text` fields from `parts` arrays (for grammar-specific sections) or from the `jp` field (for reused sections).

---

## Top-Level Grammar Lesson Schema

Every grammar lesson JSON file must conform to this top-level schema:

```json
{
  "contentVersion": "1.0.0",
  "id": "string — G-lesson ID (e.g. 'G2')",
  "type": "grammar",
  "title": "string — display title",
  "meta": {
    "level": "string — 'N5' | 'N4'",
    "unlocksAfter": "string — lesson ID that must be completed (e.g. 'N5.1')",
    "focus": "string — plain English description of what this lesson covers",
    "estimatedMinutes": "number — estimated completion time",
    "particles": ["string — particles covered (if applicable, e.g. ['は', 'が', 'の'])"],
    "grammarForms": ["string — grammar forms covered (if applicable, e.g. ['polite_masu', 'polite_mashita'])"],
    "icon": "string — emoji icon for menus"
  },
  "sections": [
    { "... — section objects as defined above" }
  ]
}
```

### Required fields
- `contentVersion`, `id`, `type`, `title`, `meta`, `sections` are all required
- `meta.level`, `meta.unlocksAfter`, `meta.focus`, `meta.estimatedMinutes`, `meta.icon` are required
- `meta.particles` and `meta.grammarForms` are optional but strongly recommended (used for cross-linking)
- `sections` must contain at least one `grammarIntro` (first) and one `drills` (last)

---

## Implementation Priority

Build in this order:

### Phase 1: Core renderer
1. `Grammar.js` module shell — routing, section dispatcher, progress tracking
2. `grammarIntro` renderer
3. `grammarRule` renderer (with color-coded parts and pattern formula)
4. `grammarTable` renderer (with stem/ending color split)
5. `grammarComparison` renderer
6. `annotatedExample` renderer

### Phase 2: Interactive sections
7. `fillSlot` renderer
8. `conjugationDrill` renderer
9. `patternMatch` renderer
10. `sentenceTransform` renderer

### Phase 3: Integration
11. Conversation/drills reuse from Lesson.js
12. Manifest integration (grammar array parsing, unlock logic)
13. Menu system updates (grammar lesson listing with icons and unlock badges)
14. Progress tracking keys
15. TTS hookup for all section types

### Phase 4: Cross-features
16. Cross-linking from main lessons to grammar lessons
17. Review integration (grammar items in normal reviews)

### Phase 5: Content
18. Load G1–G3 as test content (first batch of grammar JSONs)
19. Verify full render pipeline end-to-end
20. Load remaining N5 grammar (G4–G11)
21. Load N4 grammar (G12–G20) as N4 lessons are built
