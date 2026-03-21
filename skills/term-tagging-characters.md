# Character Name Tagging (Part 2)

> **Loaded by:** Agent 2 (Content Builder) and Agent 3 (QA Reviewer) for any content featuring recurring characters.
> **Purpose:** Defines the character registry system, ID conventions, tagging rules for lesson/review/grammar/story content, and agent responsibilities for character names.
> **See also:** `skills/term-tagging-forms.md` (term tagging forms, particle disambiguation).

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
  "portrait": "assets/characters/rikizo/rikizo_head.png",
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

This table is the authoritative list of every registered character. It must stay in sync with `shared/characters.json`. **Never use a `char_*` ID that does not appear in both this table and the JSON file.**

| Character | ID | Surface | Matches |
|---|---|---|---|
| Rikizo | `char_rikizo` | `りきぞ` | `["りきぞう"]` |
| Yamakawa | `char_yamakawa` | `やまかわ` | `[]` |
| Suzuki-sensei | `char_suzuki` | `すずき` | `["すずきせんせい"]` |
| Yamamoto-sensei | `char_yamamoto` | `やまもと` | `["やまもとせんせい"]` |
| Ken | `char_ken` | `けん` | `["ケン"]` |
| Yuki | `char_yuki` | `ゆき` | `[]` |
| Lee | `char_lee` | `リー` | `["リーさん"]` |
| Taro | `char_taro` | `たろう` | `[]` |
| Sakura | `char_sakura` | `さくら` | `[]` |
| Miki | `char_miki` | `ミキ` | `[]` |
| Nana | `char_nana` | `ナナ` | `[]` |
| Ren | `char_ren` | `レン` | `[]` |
| Joel | `char_joel` | `ジョエル` | `["ジョエルせんせい", "ジョエル先生"]` |
| Conor | `char_conor` | `コナー` | `["コナーさん"]` |
| Pochi | `char_pochi` | `ポチ` | `[]` |

### Adding a new character — required steps

When a new recurring character is introduced in a lesson, story, or grammar file, the following steps are **all mandatory** before Agent 2 writes any content that references the character. Skipping any step means the character's name will silently render as plain text with no pink highlight or popup.

**Step 1 — Add to `shared/characters.json`**

Append a new entry to the `"characters"` array:

```json
{
  "id": "char_newname",
  "type": "character",
  "surface": "にゅーねーむ",
  "reading": "にゅーねーむ",
  "meaning": "New Name",
  "description": "One-sentence description of the character's role in the story world.",
  "portrait": "",
  "matches": ["にゅーねーむさん"]
}
```

Rules for each field:
- `id`: Always `char_` + romanized lowercase name. No spaces or special characters.
- `surface`: The primary hiragana/katakana form as it will appear in `jp` fields. This is what the text processor matches.
- `reading`: The hiragana reading, shown under the portrait in the popup. If `surface` is already hiragana, `reading` equals `surface`.
- `meaning`: The romanized display name — shown in the popup header.
- `description`: One sentence. Describes who this person is in Rikizo's world.
- `portrait`: Set to `""` if no sprite asset exists yet. The popup renders gracefully without an image.
- `matches`: Any alternate spellings that appear in content — e.g. the name followed by さん, or a katakana variant. The text processor checks these alongside `surface`. **Omit name + title combos that use kanji** (e.g. `"先生"`) unless that kanji has been taught — the text processor is surface-literal.

**Step 2 — Add to the ID convention table in this file**

Add a row to the table above. If this step is skipped, future agents will see the table is out of sync with `shared/characters.json` and may treat the ID as unregistered.

**Step 3 — Tag the name in all lesson content**

In every `jp` field that contains the new character's name, add the `char_*` ID to the `terms` array. See Tagging in lesson/review/grammar/game content (below) below.

**Step 4 (stories only) — Add a surface key to `terms.json`**

Add the name as a key in the story's `terms.json`, pointing to `{ "id": "char_newname", "form": null }`. If the story uses multiple spellings, add one key per spelling.

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
