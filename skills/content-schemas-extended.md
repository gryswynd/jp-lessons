# Content Schemas — Extended Types (Part 2: Final Review, Scramble, Compose, Story)

> **Loaded by:** Agent 2 (Content Builder) when building Final Interactive Reviews, Scramble drills, Compose files, or Stories.
> **Purpose:** Defines JSON schemas for Final Interactive Review, Scramble Drill Items, Compose, and Story content types.
> **See also:** `skills/content-schemas-core.md` (Lesson, Grammar, Review schemas).

---

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
