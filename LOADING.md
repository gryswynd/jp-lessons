# Script Load Order — JP Lessons

## Required Load Order

All five shared modules must be injected **before** any feature module.
Load them sequentially in this exact order:

```
1. app/shared/asset-loader.js   ← URL building, manifest, JSON fetching, image preloading
2. app/shared/tts.js            ← Text-to-speech (no deps)
3. app/shared/progress.js       ← localStorage: flags, scores, compose drafts (no deps)
4. app/shared/text-processor.js ← Conjugation engine, processText, getRootTerm (no deps)
5. app/shared/term-modal.js     ← Shared term overlay (depends on 2, 3, 4)
────────────────────────────────────────────────────────────────────────
6. Feature modules (any order, only one active at a time):
     Lesson.js  Practice.js  Review.js  Compose.js  Story.js  Game.js
```

> `shared/asset-url.js` is a backwards-compat shim.  It is **not** needed
> when `app/shared/asset-loader.js` is loaded first (asset-loader already
> exports `window.getAssetUrl` and `window.getManifest`).  Keep the file for
> emergency fallback but do not add it to the normal load sequence.

---

## Shared Module Exports

### 1. `app/shared/asset-loader.js`
Canonical URL builder and data fetcher.  Self-contained (no JPShared deps).

| Export | Signature | Description |
|--------|-----------|-------------|
| `window.JPShared.assets.getUrl` | `(config, relativePath) → string` | Build GitHub raw URL |
| `window.JPShared.assets.getManifest` | `(config) → Promise<Object>` | Fetch + cache manifest.json |
| `window.JPShared.assets.clearManifestCache` | `() → void` | Reset manifest cache |
| `window.JPShared.assets.fetchJSON` | `(url) → Promise<Object>` | Cache-busted single fetch |
| `window.JPShared.assets.fetchAll` | `(urls[]) → Promise<Object[]>` | Parallel JSON fetches |
| `window.JPShared.assets.preloadImages` | `(urls[]) → Promise<Image[]>` | Parallel image preloads (never rejects) |
| `window.JPShared.assets.load` | `(config, filepath) → Promise<Object>` | getUrl + fetchJSON convenience |
| `window.getAssetUrl` | `(config, filepath) → string` | Compat alias for getUrl |
| `window.getManifest` | `(config) → Promise<Object>` | Compat alias for getManifest |

### 2. `app/shared/tts.js`
Web Speech API wrapper with mobile retry logic.  No JPShared deps.

| Export | Signature | Description |
|--------|-----------|-------------|
| `window.JPShared.tts.speak` | `(text, options?) → void` | Speak Japanese text; options: `{lang, rate, volume}` |
| `window.JPShared.tts.cancel` | `() → void` | Cancel any in-progress utterance |

### 3. `app/shared/progress.js`
All localStorage reads/writes go through this module.  No JPShared deps.

localStorage key schema (unchanged from pre-extraction):
- `k-flags` — `{ [key]: number }` flag counts
- `k-active-flags` — `{ [key]: boolean }` active practice queue
- `k-best-<category>` — best streak per quiz category
- `k-review-scores` — `{ [reviewId]: number }` best review percentages
- `compose-draft-<id>` — in-progress compose text

| Export | Signature | Description |
|--------|-----------|-------------|
| `window.JPShared.progress.getAllFlags` | `() → Object` | Full `{ key: count }` map |
| `window.JPShared.progress.getAllActiveFlags` | `() → Object` | Full `{ key: bool }` map; migrates from k-flags on first call |
| `window.JPShared.progress.getFlagCount` | `(key) → number` | Count for one key |
| `window.JPShared.progress.isActive` | `(key) → boolean` | Is key in practice queue? |
| `window.JPShared.progress.flagTerm` | `(key) → void` | Increment count + mark active |
| `window.JPShared.progress.clearFlag` | `(key) → void` | Remove from active queue (count preserved) |
| `window.JPShared.progress.getBestScore` | `(category) → number` | Best streak for 'meaning'\|'reading'\|'vocab'\|'verb' |
| `window.JPShared.progress.setBestScore` | `(category, score) → void` | Persist new best streak |
| `window.JPShared.progress.getReviewScore` | `(reviewId) → number\|undefined` | Best percentage for a review |
| `window.JPShared.progress.setReviewScore` | `(reviewId, pct) → void` | Persist review score |
| `window.JPShared.progress.getDraft` | `(promptId) → string` | Compose draft text |
| `window.JPShared.progress.saveDraft` | `(promptId, text) → void` | Save compose draft |
| `window.JPShared.progress.clearDraft` | `(promptId) → void` | Delete compose draft |

### 4. `app/shared/text-processor.js`
Conjugation engine and term-highlighting.  No JPShared deps.

| Export | Signature | Description |
|--------|-----------|-------------|
| `window.JPShared.textProcessor.GODAN_MAPS` | Object | 5-map godan stem tables (`u_to_i`, `u_to_a`, `u_to_e`, `ta_form`, `te_form`) |
| `window.JPShared.textProcessor.conjugate` | `(term, ruleKey, conjugationRules) → term` | Apply a conjugation rule; returns new term with updated surface/reading/meaning |
| `window.JPShared.textProcessor.processText` | `(text, termRefs, termMap, conjugationRules) → html` | HTML-escape + wrap recognised terms in clickable spans |
| `window.JPShared.textProcessor.getRootTerm` | `(termId, termMap) → term\|null` | Resolve conjugated ID to its base glossary entry |

### 5. `app/shared/term-modal.js`
Single shared DOM overlay for term detail.  **Depends on tts, text-processor, progress.**

| Export | Signature | Description |
|--------|-----------|-------------|
| `window.JPShared.termModal.setTermMap` | `(map) → void` | Register the active module's `{ id: term }` map |
| `window.JPShared.termModal.inject` | `() → void` | Create CSS + DOM overlay + default `JP_OPEN_TERM` (idempotent) |
| `window.JPShared.termModal.open` | `(termId, options?) → void` | Populate and show modal; options: `{enableFlag, onFlag}` |

Sets `window.JP_OPEN_TERM(id, enableFlag)` as a default handler.
Modules may reassign `JP_OPEN_TERM` after calling `inject()` to customise
flagging behaviour (Review.js and Story.js both do this).

---

## Dependency Graph

```
asset-loader.js ──────────────────────────────── (standalone)
tts.js ────────────────────────────────────────── (standalone)
progress.js ───────────────────────────────────── (standalone)
text-processor.js ─────────────────────────────── (standalone)
term-modal.js ──→ tts.js
              ──→ text-processor.js
              ──→ progress.js
```

No circular dependencies.

---

## Final Sweep — Remaining Issues Found

### 1. Duplicated / dead code in `Story.js`

Three functions exist in `Story.js` that have been superseded by the shared
module infrastructure but were **never removed**:

| Function | Lines | Status | Problem |
|----------|-------|--------|---------|
| `setupTermModal()` | 479–616 | **Dead code** — never called | Creates modal manually; contains direct `localStorage` calls for `k-flags` / `k-active-flags`; references local `speak()` |
| `speak(text)` | 618–625 | **Dead code** — only called by `setupTermModal()` | Wraps `speechSynthesis` directly instead of `JPShared.tts.speak` |
| `conjugate(term, ruleKey)` | 431–477 | **Dead code** — never called at runtime | References `GODAN_MAPS` which is **never defined in Story.js** (would throw a ReferenceError if called) |

The active code in `loadResources()` (lines 379–429) correctly uses
`JPShared.termModal.inject()`, `JPShared.termModal.open()`, and
`JPShared.progress.*` — the dead functions are simply leftover scaffolding.

**Recommended action:** Delete `setupTermModal`, `speak`, and `conjugate` from
`Story.js` in a follow-up cleanup commit.

### 2. Direct `localStorage` calls

All active code routes through `JPShared.progress.*`. The only direct
`localStorage` calls are inside `Story.js:setupTermModal()` (dead code, see §1).

No action required in active paths.

### 3. Local `GODAN_MAPS` definitions

None in any active code path.  `text-processor.js` is the single canonical
source.  `Story.js:conjugate()` references `GODAN_MAPS` but is dead code and
would throw a `ReferenceError` if ever called.

### 4. Local `conjugate()` definitions

| File | Status |
|------|--------|
| `Story.js` line 431 | Dead code (see §1) |
| `app/shared/text-processor.js` | Canonical implementation ✓ |

All active call sites (`Lesson.js`, `Review.js`, `Story.js:loadResources`) call
`window.JPShared.textProcessor.conjugate(...)` or pass `conjugationRules` to
`processText`.

### 5. Local `speak()` / `speechSynthesis` definitions

| File | Status |
|------|--------|
| `Story.js` line 618 | Dead code (see §1) |
| `app/shared/tts.js` | Canonical implementation ✓ |

Active callers:
- `Compose.js` → `window.JPShared.tts.speak()` ✓
- `Practice.js` → `window.JPShared.tts.speak()` ✓
- `app/shared/term-modal.js` → `window.JPShared.tts.speak()` ✓

### 6. Local modal creation code

| File | Status |
|------|--------|
| `Story.js:setupTermModal()` | Dead code (see §1) — full modal DOM + CSS + old flagging logic |
| `app/shared/term-modal.js` | Canonical implementation ✓ |

Active callers all use `window.JPShared.termModal.inject()` ✓:
- `Lesson.js` line 159
- `Review.js` line 240
- `Story.js:loadResources()` line 406

---

## Webflow Embed — Updated `launch()` Function

The old embed checked `!window.getManifest` and loaded only `shared/asset-url.js`.
The new version loads all five shared modules in the correct order before
any feature module is launched.  See `webflow-embed.html` for the full embed.

**Key change in `launch()`:**

```js
// OLD (only loaded asset-url.js):
if (!window.getManifest) {
  const success = await this.loadModule('shared/asset-url.js');
  if (!success) return;
}

// NEW (loads all five shared modules in order):
if (!window.JPShared || !window.JPShared.assets) {
  const sharedModules = [
    'app/shared/asset-loader.js',   // 1. URL building + manifest
    'app/shared/tts.js',            // 2. Text-to-speech
    'app/shared/progress.js',       // 3. localStorage persistence
    'app/shared/text-processor.js', // 4. Conjugation + term highlighting
    'app/shared/term-modal.js',     // 5. Term detail overlay (uses 1–4)
  ];
  for (const mod of sharedModules) {
    const ok = await this.loadModule(mod);
    if (!ok) return;
  }
}
```
