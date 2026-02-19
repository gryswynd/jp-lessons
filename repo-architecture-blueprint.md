# Japanese Learning App — Repository Architecture Blueprint

## Current State Summary

Your repo is flat, with proof-of-concept data embedded directly in module JS files. Here's what's hardcoded where:

| Module | Embedded Data | Lines of Data | Extract Priority |
|--------|--------------|---------------|-----------------|
| **Compose.js** | `LESSON_META` (6 lessons), `PROMPTS` (14 prompts with targets), `HELPER_VOCAB` (5 categories, ~50 words) | ~250 lines | High |
| **Game.js** | `INTERACTIVE_OBJECTS` (10 objects), `CONVERSATIONS` (2 NPCs, 9 dialogue lines), `OBJECT_POSITIONS` (10 coords), image filenames (9 assets) | ~80 lines | High |
| **Story.js** | `storyList` (1 entry), already loads external `.md` + `.json` | ~5 lines | Medium (mostly done) |
| **Review.js** | Already external — loads from GitHub JSON files | 0 | Done ✓ |
| **Lesson.js** | (Not shown but assumed similar — loads from external JSON) | 0 | Done ✓ |

---

## Proposed Directory Structure

```
/
├── manifest.json                          ← App index (replaces GitHub API listing)
├── conjugation_rules.json                 ← Global (small, universal across levels)
│
├── data/
│   ├── N5/
│   │   ├── glossary.N5.json
│   │   ├── lessons/
│   │   │   ├── N5.1.json
│   │   │   ├── N5.2.json
│   │   │   └── ...
│   │   ├── reviews/
│   │   │   ├── N5.Review.1.json
│   │   │   └── ...
│   │   ├── compose/
│   │   │   ├── compose.N5.json            ← All prompts + helper vocab for N5
│   │   │   └── (or split per lesson — see discussion below)
│   │   ├── stories/
│   │   │   ├── library-book/
│   │   │   │   ├── story.md
│   │   │   │   └── story.json             ← Term mappings
│   │   │   └── another-story/
│   │   │       ├── story.md
│   │   │       └── story.json
│   │   └── game/
│   │       ├── day-01-home/
│   │       │   ├── day.json               ← Objects, NPCs, conversations, positions
│   │       │   ├── map.png
│   │       │   ├── collision.png
│   │       │   └── sprites/
│   │       │       ├── mom.png
│   │       │       ├── dad.png
│   │       │       ├── me_sheet.png
│   │       │       ├── mom-convo.png
│   │       │       ├── dad-convo.png
│   │       │       ├── me-convo.png
│   │       │       └── convo-bg.png
│   │       └── day-02-school/
│   │           ├── day.json
│   │           ├── map.png
│   │           ├── collision.png
│   │           └── sprites/
│   │               └── ...
│   │
│   ├── N4/
│   │   ├── glossary.N4.json
│   │   ├── lessons/
│   │   │   ├── N4.1.json
│   │   │   └── ...
│   │   ├── reviews/
│   │   │   ├── N4.Review.1.json
│   │   │   └── ...
│   │   ├── compose/
│   │   │   └── compose.N4.json
│   │   ├── stories/
│   │   │   └── ...
│   │   └── game/
│   │       ├── day-05-market/
│   │       │   └── ...
│   │       └── day-06-station/
│   │           └── ...
│   │
│   ├── N3/                                ← Future
│   ├── N2/                                ← Future
│   └── N1/                                ← Future
│
├── shared/
│   ├── helper-vocab.json                  ← Common words (わたし, します, etc.)
│   ├── particles.json                     ← Particle reference data
│   └── sprites/
│       └── me_sheet.png                   ← Player sprite (reused across all game days)
│
└── app/
    ├── Lesson.js
    ├── Practice.js
    ├── Review.js
    ├── Compose.js                         ← Now data-free, loads from compose/*.json
    ├── Game.js                            ← Now data-free, loads from game/day-*/day.json
    └── Story.js                           ← Now data-free, loads from stories/*/
```

---

## Module-by-Module Extraction Plan

### 1. Compose Module

**What to extract:**

| Data | Current Location | New File | Reasoning |
|------|-----------------|----------|-----------|
| `LESSON_META` | Compose.js lines ~93-100 | **Not needed** — derive from glossary + lesson files | It duplicates info already in your lesson JSONs |
| `PROMPTS` (14 items) | Compose.js lines ~102-290 | `compose.N4.json` | Core content, must be external |
| `HELPER_VOCAB` (50 words) | Compose.js lines ~292-340 | `shared/helper-vocab.json` | Level-agnostic, reused across N5–N1 |
| Particle reference | Compose.js line ~430 | `shared/particles.json` | Level-agnostic |

**Should compose prompts be one file per level, or one file per lesson?**

**One file per level** (`compose.N4.json`). Here's why:

- Your prompts already span multiple lessons (e.g., "Village Festival" covers N4.28 + N4.30, "The Big Day" covers N4.28–N4.31). Splitting per-lesson would force you to duplicate cross-lesson prompts or create a confusing referencing system.
- The compose menu filters by selected lessons at runtime — this works perfectly with a single file.
- At scale, even N1 might have ~30–50 prompts. That's a ~50KB JSON file. Trivial to load.

**`compose.N4.json` structure:**

```json
{
  "level": "N4",
  "prompts": [
    {
      "id": "village-gate",
      "title": "The Village Gate",
      "titleJp": "村の門",
      "emoji": "🏘️",
      "lessons": ["N4.28"],
      "scenario": "Describe arriving at a small village...",
      "hint": "小さい村に来ました。大きい門が...",
      "targets": [
        { "surface": "村", "reading": "むら", "meaning": "village", "count": 1, "matches": ["村", "むら"] }
      ]
    }
  ]
}
```

**Additional considerations for Compose:**

- **Scoring vocab list**: Currently scoring uses `allVocab` filtered from the master glossary. After restructuring, it loads from `glossary.N4.json` — no change to logic, just the fetch URL.
- **Draft storage**: Currently uses `localStorage`. When you go mobile, you'll want to migrate this to your app's local storage or a cloud sync layer. For now, `localStorage` is fine.
- **Prompt difficulty metadata**: Consider adding a `difficulty` field (1-3) to prompts now. This lets you sort/filter in the UI later without restructuring the data again.

---

### 2. Game Module

**What to extract:**

| Data | Current Location | New File | Reasoning |
|------|-----------------|----------|-----------|
| `INTERACTIVE_OBJECTS` | Game.js lines ~188-199 | `day.json` → `objects[]` | Per-day content |
| `OBJECT_POSITIONS` | Game.js lines ~260-271 | `day.json` → `objects[]` (merged) | Per-day, tied to that day's collision map |
| `CONVERSATIONS` | Game.js lines ~201-223 | `day.json` → `npcs[].conversation` | Per-day, per-NPC |
| NPC positions + sprites | Game.js lines ~275-290 | `day.json` → `npcs[]` | Per-day |
| Image filenames | Game.js lines ~225-235 | `day.json` → `assets{}` | Per-day (different maps per day) |
| Player start position | Game.js line ~298 | `day.json` → `playerStart` | Per-day |

**`day.json` structure:**

```json
{
  "id": "day-01-home",
  "title": "Home",
  "titleJp": "いえ",
  "level": "N5",
  "unlockedBy": ["N5.1", "N5.2"],
  "assets": {
    "map": "map.png",
    "collision": "collision.png",
    "convoBackground": "convo-bg.png"
  },
  "playerStart": { "x": 200, "y": 250 },
  "objects": [
    {
      "name": "Bed",
      "x": 194, "y": 189, "width": 114, "height": 146,
      "isDoor": false,
      "message": "A comfortable bed. Maybe I should get some rest later.",
      "messageJp": "気持ちいいベッドです。あとで休もうかな。"
    },
    {
      "name": "Front_Door",
      "x": 911, "y": 789, "width": 158, "height": 58,
      "isDoor": true
    }
  ],
  "npcs": [
    {
      "name": "mom",
      "x": 970, "y": 330,
      "sprite": "sprites/mom.png",
      "convoPortrait": "sprites/mom-convo.png",
      "conversation": [
        { "speaker": "mom", "text": "おはよう！朝ごはんは食べた？", "translation": "Good morning! Did you eat breakfast?", "terms": ["v_taberu"] },
        { "speaker": "me", "text": "おはよう、お母さん。まだだよ。", "translation": "Good morning, Mom. Not yet." },
        { "speaker": "mom", "text": "冷蔵庫に卵があるから、食べてね。", "translation": "There are eggs in the fridge, so please eat.", "terms": ["v_taberu"] },
        { "speaker": "me", "text": "ありがとう！", "translation": "Thank you!" }
      ]
    }
  ]
}
```

**Why each game day needs its own subdirectory:**

1. **Art assets are tightly coupled to a specific map.** The collision map pixel colors encode object positions. A different location = completely different map + collision + sprites. These must live together.
2. **Binary asset isolation.** PNGs are large. Putting all game art in one folder means a flat mess of 50+ images by N3. Subdirectories keep each day self-contained and easy to update.
3. **Day-level loading.** The game engine only needs assets for the current day. Subdirectories make it trivial to construct the fetch path: `data/N4/game/day-05-market/map.png`.

**Additional considerations for Game:**

- **Player sprite reuse**: The player walk cycle sheet (`me_walk_cycle_sheet_transparent.png`) is the same across all days. Put it in `shared/sprites/` and reference it from the game engine, not from `day.json`. Only NPC/location-specific sprites go in the day folder.
- **Conversation term references**: Notice I added `"terms": ["v_taberu"]` to conversation lines. This lets you wire up the same clickable-term system from your Lesson/Story modules into game dialogues. Huge educational value — the player talks to Mom and can tap a word to see its glossary entry.
- **Unlock gating**: The `"unlockedBy": ["N5.1", "N5.2"]` field in `day.json` means the app can check lesson completion progress and lock/unlock days without hardcoding the logic. The manifest should also index game days so the menu knows what exists.
- **Transition triggers**: Consider adding a `"transitions"` field for doors that lead to other days/maps. Right now `Front_Door` just opens/closes — eventually it should transport the player to an overworld or another location.
- **Scalable NPC conversations**: Right now conversations are simple linear arrays. Consider a `"conversationId"` that references a separate conversations file if dialogue trees get complex (branching, quest-dependent dialogue). For now, inline is fine.

---

### 3. Story/Reading Module

**What to extract:**

| Data | Current Location | New File | Reasoning |
|------|-----------------|----------|-----------|
| `storyList` | Story.js line ~267-274 | `manifest.json` → `stories{}` | Module should discover stories from manifest |
| Story content | Already external (`library-book.md`) | ✓ Already done | — |
| Term mappings | Already external (`library-book.json`) | ✓ Already done | — |

Stories are in the best shape already. The main change is:

1. **Move each story into a named subdirectory** under `data/N[X]/stories/`.
2. **Register stories in the manifest** so the module doesn't hardcode the list.
3. **Standardize filenames**: `story.md` + `terms.json` inside each folder (not `library-book.md` / `library-book.json`).

**Story folder structure:**

```
data/N5/stories/library-book/
├── story.md                    ← Markdown content
└── terms.json                  ← Term mappings for clickable words
```

**Additional considerations for Stories:**

- **Reading difficulty metadata**: Add to `manifest.json` or a `story-meta.json`:
  ```json
  {
    "id": "library-book",
    "title": "図書館の本",
    "titleEn": "The Library Book",
    "level": "N5",
    "wordCount": 250,
    "estimatedMinutes": 5,
    "prerequisiteLessons": ["N5.1", "N5.2", "N5.3"],
    "themes": ["school", "library", "daily-life"]
  }
  ```
- **Audio files**: If you add narrated readings later, the subdirectory structure makes it natural to add `audio.mp3` alongside the markdown.
- **Comprehension questions**: Your Review module already handles reading comprehension (`type: 'reading'`). Consider whether standalone stories should also have optional comprehension questions in `terms.json` (or a separate `questions.json`). This bridges the Story and Review modules.
- **Translation toggle**: Your current `library-book.md` has Japanese and English in the same file. Consider separating: `story.md` (Japanese only) + a `translation` field in `terms.json` or a `story.en.md`. This lets the app toggle translation visibility rather than it always being present in the markdown.

---

## Updated Manifest Structure

The manifest is the single source of truth for what content exists:

```json
{
  "version": "2.0",
  "levels": ["N5", "N4"],
  "defaultLevel": "N4",

  "glossary": {
    "N5": "data/N5/glossary.N5.json",
    "N4": "data/N4/glossary.N4.json"
  },

  "conjugationRules": "conjugation_rules.json",

  "shared": {
    "helperVocab": "shared/helper-vocab.json",
    "particles": "shared/particles.json",
    "playerSprite": "shared/sprites/me_sheet.png"
  },

  "content": {
    "N5": {
      "lessons": [
        { "id": "N5.1", "file": "data/N5/lessons/N5.1.json" },
        { "id": "N5.2", "file": "data/N5/lessons/N5.2.json" }
      ],
      "reviews": [
        { "id": "N5.Review.1", "file": "data/N5/reviews/N5.Review.1.json" }
      ],
      "compose": "data/N5/compose/compose.N5.json",
      "stories": [
        {
          "id": "library-book",
          "title": "図書館の本",
          "titleEn": "The Library Book",
          "dir": "data/N5/stories/library-book/",
          "estimatedMinutes": 5
        }
      ],
      "game": [
        {
          "id": "day-01-home",
          "title": "Home",
          "titleJp": "いえ",
          "dir": "data/N5/game/day-01-home/",
          "unlockedBy": ["N5.1", "N5.2"]
        }
      ]
    },
    "N4": {
      "lessons": [],
      "reviews": [],
      "compose": "data/N4/compose/compose.N4.json",
      "stories": [],
      "game": [
        {
          "id": "day-05-market",
          "title": "Morning Market",
          "titleJp": "朝市",
          "dir": "data/N4/game/day-05-market/",
          "unlockedBy": ["N4.28", "N4.29"]
        }
      ]
    }
  }
}
```

**Why this matters**: Every module reads the manifest once on startup, then knows exactly what files to fetch and where. No more GitHub API directory listing. No more hardcoded file lists in JS. Adding a new story or game day = add a folder + update manifest.

---

## Shared vs Per-Level Data

| Data | Shared or Per-Level? | Why |
|------|---------------------|-----|
| Conjugation rules | **Shared** | Grammar rules don't change by JLPT level |
| Helper vocab (わたし, します, etc.) | **Shared** | Basic words used across all compose prompts |
| Particle reference | **Shared** | Same particles at every level |
| Player walk sprite | **Shared** | Same character across all game days |
| Glossary | **Per-level** | Loading 5,000 entries when you need 500 is wasteful |
| Compose prompts | **Per-level** | Prompts reference level-specific vocab |
| Game days | **Per-level** | Each day teaches level-specific vocabulary |
| Stories | **Per-level** | Stories use level-appropriate grammar/vocab |
| Lesson/Review JSONs | **Per-level** | Obviously level-specific |

---

## Things You Haven't Asked About But Should Consider

### 1. User Progress Data Model

Right now progress is scattered across `localStorage` keys:
- `compose-draft-{promptId}` — composition drafts
- `k-flags` / `k-active-flags` — flagged terms
- `k-review-scores` — review best scores

Before going mobile, **define a single progress schema**:

```json
{
  "userId": "...",
  "completedLessons": ["N5.1", "N5.2", "N4.28"],
  "reviewScores": { "N4.Review.6": 85 },
  "composeDrafts": { "village-gate": "村に来ました..." },
  "flaggedTerms": { "v_taberu": { "count": 3, "active": true } },
  "gameProgress": { "day-01-home": { "completed": true, "npcsSpokenTo": ["mom", "dad"] } },
  "storiesRead": ["library-book"]
}
```

This becomes your single object to sync to a backend or persist locally. Every module reads/writes to the same structure.

### 2. Asset Base URL Abstraction

Your modules currently build URLs like:
```js
`https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/...`
```

When you go to a real app, assets might come from a CDN, local bundle, or API. Abstract this now:

```js
// In your app config / shared module
function getAssetUrl(relativePath) {
  return `${APP_CONFIG.assetBaseUrl}/${relativePath}`;
}
```

Every module calls `getAssetUrl('data/N4/game/day-01-home/map.png')`. Switching from GitHub raw to a CDN is a one-line config change.

### 3. Content Versioning

Add a `"contentVersion"` to each data file:

```json
{
  "contentVersion": "1.0.0",
  "level": "N4",
  "prompts": [...]
}
```

When you push an update that changes data structure (e.g., adding a field to prompts), older cached versions of the app can detect the mismatch and re-fetch. This is critical for mobile where users may not update the app for weeks.

### 4. Shared Module Code

Four of your modules duplicate the same logic:
- **Term modal** (Compose, Story, Review all have their own modal injection)
- **TTS / `speak()`** (Compose and Story both implement it)
- **`processText()` / conjugation** (Review and Story both have their own copies)
- **`flagTerm()`** (Review has it, Story has a different version)

Extract these into a shared utility before going mobile:

```
app/
├── shared/
│   ├── term-modal.js       ← One modal, used by all modules
│   ├── tts.js              ← speak() helper
│   ├── text-processor.js   ← processText() + conjugation engine
│   ├── progress.js         ← Unified progress read/write
│   └── asset-loader.js     ← getAssetUrl() + image preloader
├── Lesson.js
├── Practice.js
├── Review.js
├── Compose.js
├── Game.js
└── Story.js
```

---

## Migration Checklist

### Phase 1: Data Extraction (Do This Now)
- [ ] Create `data/N4/` and `data/N5/` directory structure
- [ ] Move existing lesson JSONs into `data/N[X]/lessons/`
- [ ] Move existing review JSONs into `data/N[X]/reviews/`
- [ ] Split `glossary.master.json` into `glossary.N5.json` + `glossary.N4.json`
- [ ] Extract `PROMPTS` + compose-specific vocab → `compose.N4.json`
- [ ] Extract `HELPER_VOCAB` → `shared/helper-vocab.json`
- [ ] Extract game data → `data/N5/game/day-01-home/day.json`
- [ ] Move game PNGs into `data/N5/game/day-01-home/` + `sprites/`
- [ ] Move player sprite → `shared/sprites/me_sheet.png`
- [ ] Move stories into `data/N5/stories/library-book/`
- [ ] Create `manifest.json`
- [ ] Update all module fetch URLs to use manifest paths

### Phase 2: Code Cleanup (Before Mobile)
- [ ] Extract shared term-modal code
- [ ] Extract shared TTS code
- [ ] Extract shared processText/conjugation engine
- [ ] Unify progress/flagging into single module
- [ ] Abstract asset base URL
- [ ] Add content versioning to data files

### Phase 3: Scale (N3 and Beyond)
- [ ] Create `data/N3/` structure
- [ ] Add N3 glossary, lessons, reviews
- [ ] Add N3 compose prompts
- [ ] Add N3 game days
- [ ] Add N3 stories
- [ ] Update manifest
- [ ] Everything just works™

---

## Key Principles

1. **Modules should contain zero content data.** All content lives in JSON/MD files under `data/`. Modules are pure rendering engines.
2. **The manifest is the single source of truth.** No module should discover content by listing directories or hardcoding filenames.
3. **Each content unit is self-contained in its directory.** A game day folder has everything that day needs. A story folder has everything that story needs. You can add/remove content by adding/removing folders + updating the manifest.
4. **Shared data stays shared.** Helper vocab, particles, conjugation rules, and the player sprite don't belong to any level.
5. **Plan for the data model, not just the file structure.** User progress needs a unified schema before you have five different localStorage key patterns across six modules.
