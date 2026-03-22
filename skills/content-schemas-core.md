# Content Schemas — Core Types (Part 1: Lesson, Grammar, Review)

> **Loaded by:** Agent 2 (Content Builder) when building any content type.
> **Purpose:** Defines JSON schemas for Lesson, Grammar, Review, and Large Comprehensive Review content types.
> **See also:** `skills/content-schemas-extended.md` (Final Interactive Review, Scramble, Compose, Story schemas).

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
| `reading` | `type`, `title`, `passage[]` (each: `jp`, `en`, `terms`), optional `questions[]` (each: `q`, `a`, `terms`) |
| `drills` | `type`, `title`, `instructions`, `items[]` (each: `kind`, `q`, `choices[]`, `answer`, `terms`\*) |

\*`terms` is **omitted** on Drill 1 (vocabulary MCQ where the tested word is self-evident). All other drill types **must** include `terms`.

**CRITICAL — conversation line field is `spk`, NOT `speaker`:** The renderer reads `line.spk`. Writing `"speaker"` causes every character name to display as `undefined`. There is no fallback.

**CRITICAL — reading `passage` must be an array of objects, NOT a string:** The renderer iterates `passage` as `[{jp, en, terms}, ...]`. A flat string renders nothing — no error, just a blank section. The `en` translation and `terms` array belong inside each passage object, not at the reading section level. Each passage object contains **exactly one sentence**. A wall-of-text object (multiple sentences as one `jp` string) is a structural error — the student cannot tap individual sentence chips. Target 4–6 passage objects per reading section.

**CRITICAL — reading `questions` is required:** Every reading section must have a `questions` array with at least 1 item (standard: 3). Omitting `questions` leaves the reading section non-interactive. Each question has `q` (Japanese), `a` (Japanese), and `terms`.

```json
{
  "type": "reading",
  "title": "...",
  "passage": [
    {
      "jp": "正しい 考え方は 大切です。",
      "en": "Correct thinking is important.",
      "terms": ["v_tadashii", "v_kangaekata", "p_wa", {"id": "v_taisetsu", "form": "polite_adj"}]
    }
  ]
}
```

**Section order convention:** warmup → kanjiGrid → vocabList → conversation(s) → reading(s) → drills

**Warmup rule.** Warmup sections must contain **exactly 4 items**. All items must use **only** vocabulary and kanji from lessons already completed (lesson_ids strictly less than the current lesson). The purpose of the warmup is to activate prior knowledge, not preview new content. Any item that requires the student to read a new kanji or use a new vocabulary word from the current lesson is invalid.

**Conversation count.** Match the conversation count of the reference template lesson (the highest-numbered existing lesson of the same level and type). If no template exists yet, default to at least 4 conversations. Fewer conversations than the template is a CB failure regardless of how rich the reading sections are.

**Conversation register.** From N5.10 onward, at least 1 conversation per lesson must use casual register (plain forms). See Register Requirements in `skills/grammar-rules-reinforcement.md` for the full schedule and rules. Casual conversations must have a `context` that justifies informal speech and must not mix registers with polite conversations. Before N5.10, all conversations must be 100% polite.

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
