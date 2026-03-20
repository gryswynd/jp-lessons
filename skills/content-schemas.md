# Content Schemas — JSON Structure Reference

> **Loaded by:** Agent 2 (Content Builder) when building any content type.
> **Purpose:** Defines the required JSON schemas, field names, and structural rules for every content type (lessons, grammar, reviews, compose, stories).

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

