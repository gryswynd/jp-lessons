# Campaign: Practice.js Game Module Extraction

> **Status:** In Progress — 5/7 games complete
> **Branch pattern:** `claude/extract-<game>-<id>`
> **Started:** 2026-03-26
> **Last updated:** 2026-04-09
> **Depends on:** Conjugation Station build (complete — `app/games/conjugation-dojo.js`)

## Goal

Decompose Practice.js from a 2100+ line monolith into a lightweight shell + independent game modules. Each game is rebuilt from scratch with its own UI/UX, not bound by the old shared infrastructure. The plugin pattern established by `conjugation-dojo.js` is the reference implementation.

## Architecture

```
Practice.js (shell)
├── Header chrome (title, filter icon, settings, exit)
├── Lesson picker overlay (floating panel)
├── ALL_VIEWS constant + view switching
├── Streak/hanabi/celebration system
├── Score persistence (bestScores via progress.js)
├── Game loader functions (fetch + script inject)
│
├── app/games/conjugation-dojo.js  ✅ DONE
├── app/games/connections.js       ✅ DONE
├── app/games/connections4.js      ✅ DONE
├── app/games/scramble.js          ✅ DONE
├── app/games/marathon.js          ✅ DONE
└── app/games/flashcards.js + quiz.js  🔲 TODO (may combine)
```

## Shell Contract (all games use this)

```javascript
window.JPShared.<gameName> = {
  init: function(container, ctx) { ... },
  destroy: function() { ... }
};

// ctx object provided by shell:
{
  activeLessons: Set,           // currently selected lessons
  vocabMap: Map,                // surface → glossary entry
  conjugationRules: Object,     // (if needed)
  textProcessor: Object,        // (if needed)
  unlock: Object,               // unlock system
  repoConfig: Object,           // for getAssetUrl()
  onCorrect: function(),        // shell increments streak
  onWrong: function(),          // shell resets streak
  onExit: function(),           // return to menu
  onProgress: function(cur, total),
  getStreakInfo: function(),    // { streak, best }
}
```

## Game Modules — Build Order

### 1. Connections — "Link Up: Sorted"
- **File:** `app/games/connections.js`
- **Status:** ✅ DONE
- **Data:** `connections.N5.json`, `connections.N4.json` via `getAssetUrl()`
- **Reference:** Practice.js `connStart()` → `connShowSummary()` (~lines 649-876)
- **Game rules:** Sort vocabulary words into labeled category columns
- **Fresh design opportunities:**
  - Drag-and-drop to sort words into columns (replace tap-select)
  - Smooth animations on correct placement
  - Visual feedback when a word is in the wrong column
  - Mobile-friendly touch interactions
- **After build:** Remove lines 649-876 from Practice.js, replace with loader function

### 2. Connections4 — "Link Up: Hidden"
- **File:** `app/games/connections4.js`
- **Status:** ✅ DONE
- **Data:** Same as Connections
- **Reference:** Practice.js `conn4Start()` block (~lines 881-1148)
- **Game rules:** Guess groups of 4 related words from a 4x4 grid
- **Fresh design — move away from NYT aesthetic:**
  - Hanabi/festival theme — lantern colors, not pastel squares
  - Lives as something thematic (lanterns that dim, hanabi fuses)
  - Animated tile grouping on correct guess
  - Celebrate via shell hanabi on completion
  - Should feel like its own game, not a clone
- **After build:** Remove lines 881-1148 from Practice.js

### 3. Scramble — "Sentence Builder"
- **File:** `app/games/scramble.js`
- **Status:** ✅ DONE
- **Data:** `scramble.N5.json` via `getAssetUrl()`
- **Reference:** Practice.js `scrStart()` block (~lines 1152-1391)
- **Game rules:** Arrange shuffled word tiles into correct Japanese sentence order
- **Fresh design opportunities:**
  - Drag-to-reorder in place (not tap-remove-tap-insert)
  - "Sentence slot" area + "word bank" below
  - Snap-to-grid with smooth reorder animations
  - Long-press to pick up on mobile
  - Show English meaning as target
- **After build:** Remove lines 1152-1391 from Practice.js

### 4. Marathon — "Sentence Challenge"
- **File:** `app/games/marathon.js`
- **Status:** ✅ DONE
- **Data:** `scramble.N4.json` via `getAssetUrl()`
- **Reference:** Practice.js `marathonStart()` block (~lines 1397-1672)
- **Game rules:** Progressive difficulty sentence scramble (warm-up → challenge)
- **Fresh design opportunities:**
  - Same drag-to-reorder interaction as Scramble
  - Visual difficulty progression (belt colors? level tiers?)
  - Escalation feeling — sentences get harder
  - Maybe share drag interaction code with Scramble
- **After build:** Remove lines 1397-1672 from Practice.js
- **Note:** Currently shares `#k-view-scr` with Scramble. Give it its own view.

### 5. Flashcards + Quiz — "Study & Quiz"
- **File(s):** `app/games/flashcards.js` + `app/games/quiz.js` (or combined)
- **Status:** 🔲 TODO — needs design rethink
- **Reference:** Practice.js lines ~1672-1993 (heavily interleaved)
- **Current modes:** Flashcards, meaning quiz, reading quiz, vocab quiz, verb quiz
- **Problems with current implementation:**
  - `kRenderFC()` is 446 lines mixing 3 item types
  - Quiz and flashcard share `curSet`, `curIdx`, `curMode` with different semantics
  - Flag management interleaved with rendering
  - TTS tightly coupled
- **Design questions to resolve:**
  - Split into two modules (flashcards + quiz) or one?
  - Flashcard reimagine: swipe-based? spaced repetition? better visual design?
  - Quiz reimagine: keep MCQ or try something different?
  - How to handle the 3 item types (kanji, vocab, verb) cleanly?
  - Flag/bookmark system — keep as-is or redesign?
- **After build:** Remove the remaining quiz/flash code from Practice.js. This is the final extraction — Practice.js becomes a pure shell.

## Common Instructions for Build Agents

> You're building a new game module under `app/games/`, following the plugin pattern established by `app/games/conjugation-dojo.js`. Read that file first as the reference implementation for the shell contract. The shell (Practice.js) owns chrome (streak counter, hanabi celebrations, session tracking via callbacks). Your game module owns EVERYTHING inside its container div — UI, interaction, styling, animation. You are NOT extracting code from Practice.js. You are building the game fresh with its own design. Use the existing Practice.js implementation only as reference for game rules, data format, and scoring logic. The game loads data files via `fetch(window.getAssetUrl(config, path))`. After building, remove the old game code from Practice.js and replace it with a loader function following the `dojoStart()`/`dojoLoadScript()` pattern. Add the new view ID to the `ALL_VIEWS` constant.

## Data File Formats

### connections.N5.json / connections.N4.json
- Array of puzzle objects
- Each puzzle has categories with word lists
- Agent should read the data file to understand the exact schema

### scramble.N5.json / scramble.N4.json
- Array of sentence objects with shuffled word order
- Each has English translation, correct order, and word tiles
- Agent should read the data file to understand the exact schema

## Progress Tracking

| Game | Module Built | Old Code Removed | Tested | Committed |
|------|:---:|:---:|:---:|:---:|
| Conjugation Station | ✅ | ✅ | ✅ | ✅ |
| Connections | ✅ | ✅ | ✅ | ✅ |
| Connections4 | ✅ | ✅ | ✅ | ✅ |
| Scramble | ✅ | ✅ | ✅ | ✅ |
| Marathon | ✅ | ✅ | ✅ | ✅ |
| Flashcards | 🔲 | 🔲 | 🔲 | 🔲 |
| Quiz | 🔲 | 🔲 | 🔲 | 🔲 |

## Notes

- Each extraction should be its own branch and PR
- Test each game independently before removing old code
- The lesson picker overlay (Phase 1 of this work) is already complete
- `ALL_VIEWS` constant is already extracted — just add new view IDs to it
- Game modules inject their own CSS via `<style>` tags (check for existing ID before injecting)
- Data files are fetched at runtime via GitHub raw content API (not static script tags)
- Mobile-first: all games should work well on touch devices
- `getDynamicCompounds()` helper (added to Practice.js) filters vocab compounds by active kanji progression — only shows compounds where all constituent kanji are from active lessons. Currently used for kanji card backs only. When extracting Flashcards/Quiz modules, apply this same filtering to the vocab quiz mode (currently lines ~649-664 in Practice.js) so vocab quizzes also respect the "all constituent kanji must be known" rule.
