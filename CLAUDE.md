# JP Lessons — Project Context

## What This Is
A Japanese language learning app (currently Webflow web script, migrating to mobile/web app).
Covers JLPT levels N5 through N1. Currently closing out N4.

## Architecture Decisions (Agreed)
- Glossary: Split by JLPT level, NOT by type (kanji/vocab/grammar)
- Each glossary.N[X].json contains all entries for that level
- conjugation_rules.json stays global (small, universal)
- manifest.json at root replaces GitHub API directory listing
- All embedded data in JS modules must be extracted to JSON files
- Each game day gets its own subdirectory (map + collision + sprites + day.json)
- Each story gets its own subdirectory (story.md + terms.json)
- Compose prompts: one file per level (compose.N[X].json)
- Helper vocab and particles are shared (level-agnostic)
- Player sprite is shared across all game days

## Target Directory Structure
```
/
├── manifest.json
├── conjugation_rules.json
├── data/
│   ├── N5/
│   │   ├── glossary.N5.json
│   │   ├── lessons/
│   │   ├── reviews/
│   │   ├── compose/compose.N5.json
│   │   ├── stories/{story-name}/story.md + terms.json
│   │   └── game/{day-name}/day.json + map.png + collision.png + sprites/
│   ├── N4/ (same structure)
│   └── N3/, N2/, N1/ (future)
├── shared/
│   ├── helper-vocab.json
│   ├── particles.json
│   └── sprites/me_sheet.png
└── app/
    ├── Lesson.js, Practice.js, Review.js
    ├── Compose.js, Game.js, Story.js
    └── shared/ (term-modal, tts, text-processor, progress, asset-loader)
```

## Key Files
- `glossary.master.json` — current monolithic glossary (to be split by level)
- `conjugation_rules.json` — verb conjugation rules (stays global)
- `Compose.js` — has LESSON_META, PROMPTS (14), HELPER_VOCAB embedded → extract to JSON
- `Game.js` — has INTERACTIVE_OBJECTS, CONVERSATIONS, OBJECT_POSITIONS, image refs embedded → extract to day.json
- `Story.js` — has storyList embedded → read from manifest instead
- `Review.js` — already loads external data ✓
- `Lesson.js` — already loads external data ✓

## Data File Schemas

### compose.N[X].json
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
      "scenario": "...",
      "hint": "...",
      "targets": [
        { "surface": "村", "reading": "むら", "meaning": "village", "count": 1, "matches": ["村", "むら"] }
      ]
    }
  ]
}
```

### game day.json
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
    { "name": "Bed", "x": 194, "y": 189, "width": 114, "height": 146, "isDoor": false, "message": "..." }
  ],
  "npcs": [
    {
      "name": "mom",
      "x": 970, "y": 330,
      "sprite": "sprites/mom.png",
      "convoPortrait": "sprites/mom-convo.png",
      "conversation": [
        { "speaker": "mom", "text": "おはよう！", "translation": "Good morning!", "terms": [] }
      ]
    }
  ]
}
```

## Commands
- No build step (raw JS served via Webflow)
- Data hosted on GitHub raw (raw.githubusercontent.com)

## Rules
- Never delete original files until migration is verified
- Create new structure alongside existing files first
- Each phase = separate git commit
- Preserve all existing functionality — restructure, not rewrite
