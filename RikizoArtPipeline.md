# Rikizo JRPG Art Pipeline — Claude Code Instructions

> **⚠️ SCOPE: ART ASSETS ONLY.** This file governs visual art generation (sprites, portraits, backgrounds, tilesets, UI elements, enemy concepts) via the Gemini API and PaperBanana pipeline. It does **NOT** govern lesson content, reviews, compose prompts, stories, glossary entries, or any JSON/MD educational content. For all lesson and learning content creation, follow `CLAUDE.md` — that file's 4-agent pipeline (PM → CB → QA → CR) is the sole authority for educational content. **Never mix these two systems.** If a task involves generating art → use this file. If a task involves writing lesson JSON, review JSON, compose JSON, story MD, or glossary entries → use `CLAUDE.md`. If a task involves both (e.g. "create Day 3 assets and the Day 3 lesson"), treat them as two separate subtasks governed by their respective documents.

> **What this file is:** A complete instruction set for Claude Code to generate consistent, professional-quality art assets for **Rikizo**, a JRPG with real combat, exploration, and an evolving world that expands as the player learns Japanese through companion learning modules. This document adapts the PaperBanana agentic framework (arXiv:2601.23265) and wires it to the Gemini image generation API.
>
> **How to use it:** Place this file, the Gemini API guide (`gemini-3-image-api-guide.md`), and the `PaperBanana.md` framework doc in your Claude Code project root alongside your existing reference PNGs. Claude Code reads all three, then follows the pipeline below to produce new assets that match your established style.

---

## Table of Contents

1. [The World of Rikizo](#1-the-world-of-rikizo)
2. [Art Direction Bible](#2-art-direction-bible)
3. [Reference Image Protocol](#3-reference-image-protocol)
4. [The Five-Agent Pipeline](#4-the-five-agent-pipeline)
5. [Asset Type Catalog & Specs](#5-asset-type-catalog--specs)
6. [Transparency & Alpha Extraction](#6-transparency--alpha-extraction)
7. [Gemini API Integration](#7-gemini-api-integration)
8. [Prompt Templates](#8-prompt-templates)
9. [Quality Gate & Critic Rubric](#9-quality-gate--critic-rubric)
10. [Batch Production Workflow](#10-batch-production-workflow)
11. [File Organization](#11-file-organization)

---

## 1. The World of Rikizo

Claude Code must internalize these details so every generated asset feels like it belongs in the same game.

### Core Premise

Rikizo is a JRPG set in contemporary Japan with a dark cosmic-horror undercurrent. The protagonist, **Rikizo**, is a high-school student. The game itself is played **entirely in Japanese** — all dialogue, menus, signs, and NPC interactions are in Japanese with clickable terms that link to the glossary. This is how the game teaches: through immersion, not quizzes.

**The game has real combat** — swords, magic, monsters, boss fights. It is a genuine JRPG, not an e-learning tool with game dressing. The educational components (lessons, practice drills, kanji flashcards, reading stories) exist in separate modules outside the game. Completing those modules unlocks new content inside the game world.

### The Meta-Progression System

The app has multiple modules: **Lessons**, **Practice (Dojo)**, **Stories**, **Compose**, and the **Game**. Each module feeds into the game world:

| Module Completed | Unlocks in Game |
|---|---|
| **Lesson** (e.g., N5.1 "People & Family") | New game day with characters, objects, and dialogue tied to that vocabulary. N5.1 unlocks Day 1: Rikizo at home with Mom, Dad, and basic household objects. |
| **Practice / Dojo** | In-game currency (gold/yen). Grind drills, earn money to spend in shops. |
| **Stories** | Easter eggs and hidden content in the game world. |
| **Compose** | TBD — likely crafting or ability unlocks. |

### Technical Structure (How the Game Loads Content)

The game is structured as day-based JSON files referenced from a `manifest.json`. Each game day (`day-01-home`, `day-02-...`, etc.) has its own directory containing:

- `day.json` — defines NPC positions, interactive objects, conversations, player start position, and required asset filenames
- Map image (the full pixel-art background)
- Collision image (red = wall, blue = interactive zone)
- Conversation background (Mode B art used behind dialogue)
- NPC sprites (individual PNGs per NPC)
- NPC conversation portraits (Mode B bust-up art per NPC)

Player conversation portrait and sprite sheet are shared assets that persist across all days.

The conversation UI uses a **speech bubble + character portrait** layout: a white speech bubble on the left with Japanese text (clickable terms link to the glossary), and a full-height character portrait on the right. This means conversation portraits must be designed to work at tall aspect ratios composited against a background image.

NPCs are rendered as single static sprites on the map (not sprite sheets). Sprites use **true RGBA transparency** produced by the dual-render alpha extraction pipeline (Section 6) — the legacy magenta (#FF00FF) chroma-key approach has been replaced. The `chromaKey()` function in Game.js should be removed once sprites are regenerated with proper alpha.

This structure means: **every new game day = a full set of new assets** (map, collision, NPCs, conversation art, background). The art pipeline must be able to produce a complete day's worth of assets as a batch.

### World-Building Through Vocabulary

The game world literally materializes as the player learns. Each lesson's kanji and vocabulary unlock their associated **objects, concepts, and environmental elements** in the game:

- **N5.1 (People & Family):** Day 1 — Rikizo's house. Mom (母), Dad (父), basic family interactions. Simple objects. If the player tries to go outside, they see **a blank void** — the world beyond doesn't exist yet. This seeds the darker storyline.
- **N5.2 (Days of the Week):** Day 2 — The celestial/elemental kanji (日 sun, 月 moon, 火 fire, 水 water, 木 tree, 金 gold, 土 earth) manifest as interactable objects. A tree appears outside. The sun is in the sky. A gold coin appears — touch it and Dad yells at you because it's his money (金). A bottle of water to collect.
- **N5.3 (Numbers & Money):** Money system activates. Shops begin appearing.
- **N5.5 (Going & Places):** The town starts forming — 店 (shops), 駅 (station), 家 (houses). The world expands outward from home.
- **Later lessons:** School unlocks, the town fills in, NPCs populate, combat encounters begin, and eventually magic abilities unlock.

Each new day adds more to explore, more NPCs to talk to, more items to find — all tied to the vocabulary the player has actually studied.

### The Dark Lore — 忘れ人 (Wasure-bito)

Beneath the cozy slice-of-life surface is a cosmic horror: **the 忘れ人 ("Forgotten Ones")** are eldritch beings that erased the world — made everyone forget everything. The blank void outside Rikizo's house on Day 1 is not a loading screen. It's the aftermath.

Rikizo, through the meta act of teaching Japanese (the player learning through the external modules), is **unraveling the forgetting**. As vocabulary returns, reality reconstitutes. People "wake up." But the 忘れ人 notice. Their minions begin appearing as the world rebuilds, leading to escalating combat encounters and eventually a climactic confrontation.

The "gaijin students" Rikizo teaches are a meta stand-in for **the actual player**. Rikizo is their tutor; the player is learning alongside the fictional students. A future version may include an AI-powered Rikizo that teaches lessons directly in the app, deepening this meta connection.

### Narrative Arc

1. **Early game (N5.1–N5.5):** Domestic slice-of-life. Rikizo at home, exploring as the world slowly appears. Warm, cozy, a little eerie around the edges (the void).
2. **Mid game (N5.6–N5.18 + N4):** School life, town exploration, making friends, first quests. Combat begins. The 忘れ人's minions start appearing as shadows and distortions.
3. **Late game (N4+):** Full JRPG — dungeon crawling, party members, boss fights, magic systems. The 忘れ人 become a direct threat. The story builds toward a final confrontation.

### Tone & Mood

- **Warm but with an edge.** Think Persona's social-link warmth crossed with Stardew Valley coziness — but with Undertale's willingness to go dark. The void outside the house. The 忘れ人 watching.
- **Culturally authentic.** Environments, signage, food, and clothing should reflect real Japanese high-school life and neighborhoods — not exaggerated anime tropes.
- **The game is in Japanese.** All in-game text (dialogue, signs, menus, item names) is Japanese. Clickable terms link to definitions. This is immersion, not a quiz.
- **Escalating atmosphere.** Early days are bright and safe. As the world expands, shadows creep in. Color palettes subtly shift — warmer in safe zones, cooler/desaturated near 忘れ人 influence.

### Core Cast (expand as needed)

| Character | Role | Key Visual Traits | Personality |
|---|---|---|---|
| **Rikizo (りきぞう)** | Protagonist | Black hair, school uniform (white shirt, dark slacks), always carries a pocket dictionary. Friendly, open expression. | Patient, earnest, brave. Gradually realizes the weight of what he's doing. |
| **Mom (母)** | Family / early NPC | Warm, domestic design. Apron, gentle features. | Loving, supportive. One of the first people Rikizo "wakes up." |
| **Dad (父)** | Family / early NPC | Slightly stern but kind. Business-casual at home. Protective of his gold coin. | Practical, occasionally funny. Guards his 金 jealously. |
| **Sensei Tanaka** | Mentor / quest-giver | Older woman, glasses, cardigan over blouse, gentle smile. | Wise, encouraging. Knows more about the 忘れ人 than she lets on. |
| **Townsfolk / NPCs** | Unlock progressively | Authentic contemporary Japanese clothing. Aprons for shopkeepers, uniforms for station staff. | Speak only Japanese. Initially "asleep" — wake up as vocabulary unlocks. |
| **忘れ人 Minions** | Enemies | Shadowy, distorted, glitch-like. Visual corruption — static, missing features, inverted colors. | Hostile. Manifest where the world is rebuilding. |
| **忘れ人 (Bosses)** | Main antagonists | Eldritch designs. Massive, unsettling, beautiful in a wrong way. Mix of cosmic horror and Japanese yokai aesthetics. | Ancient. They consumed the world's memory. They do not want it restored. |

### Key Locations (unlock progressively)

- **Rikizo's house (Day 1)** — small Japanese home interior. Kitchen, living room, Rikizo's bedroom. Surrounded by void initially.
- **Yard / immediate outside (Day 2+)** — tree, sky, ground materialize. Still sparse.
- **Neighborhood (mid N5)** — narrow residential street, vending machines, small gardens, power lines. Gradually populates.
- **School (N5.12+)** — classroom, hallways, rooftop, courtyard. Major social hub.
- **Shopping district (N5.5+)** — konbini, shops, train station. Commerce unlocks.
- **Shrine / temple (later N5)** — torii gate, stone path, lanterns. Spiritual significance to the 忘れ人 storyline.
- **The Void** — visible from Day 1. Empty, black/dark space beyond the world's edge. Unsettling. Gradually recedes as more of the world materializes.
- **忘れ人 domains (N4+)** — corrupted zones where reality is unstable. Dungeon environments with glitch aesthetics, distorted architecture, impossible geometry.

---

## 2. Art Direction Bible

This game uses **two distinct art modes**. Every asset falls into one of these modes. Never mix them in a single asset.

### Mode A — Chibi Pixel Art (Maps & Battles)

**Used for:** Overworld map sprites, battle sprites, tile sets, item drops, small animated effects.

| Property | Specification |
|---|---|
| **Style** | Chibi pixel art. Characters are 2–3 heads tall with large expressive eyes and simplified features. |
| **Palette** | Limited palette per sprite (16–32 colors max). Warm base tones — soft peach skin, rich fabric colors. Outline color is a darker shade of the fill, never pure black. |
| **Resolution** | Character sprites: 32×48 or 48×64 pixels at 1x. Tile size: 16×16 or 32×32. Always pixel-perfect — no anti-aliasing, no sub-pixel blending. |
| **Animation** | Idle: 2–4 frames. Walk: 4 frames per direction (up/down/left/right). Battle: idle, attack, hurt, victory — 3–6 frames each. |
| **Rendering rules** | Hard pixel edges. No gradients. Dithering is acceptable for shading large areas. 1-pixel outlines on characters, none on environment tiles. Shadows are a single darker tone, placed consistently from the upper-left light source. |
| **Influences** | Earthbound / Mother 3, Stardew Valley, Undertale overworld, early Harvest Moon. |

### Mode B — Mob Psycho 100 Style Illustration (Conversations, CGs & UI)

**Used for:** Character portraits (dialogue boxes), full-body character art, CG event scenes, menu backgrounds, UI elements, title screen art, enemy concept art.

**Primary reference: Mob Psycho 100 (anime adaptation by Studio BONES).** This means ONE's distinctive character design philosophy — intentionally simple, loose, and expressive — as interpreted through BONES' polished animation aesthetic. NOT hyper-detailed anime. NOT clean vector. The charm is in the simplicity and the explosive contrast between calm and intense.

| Property | Specification |
|---|---|
| **Style** | Mob Psycho 100 style: simple character designs with thin, slightly loose linework. Characters have minimal detail in calm states (dot-like eyes, simple mouths, basic shapes) but explode with expressive energy during emotional or combat moments. The gap between "chill" and "intense" IS the style. |
| **Character proportions** | Lanky, slightly noodle-like bodies. Not hyper-muscled or idealized. Characters look like real people drawn simply — slightly awkward, endearing. Head-to-body ratio around 1:5 or 1:6. Limbs are thin with minimal joint definition. Hands are simplified. |
| **Faces** | **Calm/default:** Very simple. Small dot or dash eyes, minimal nose (often just a line or shadow), small mouth. Almost no detail. **Emotional/combat:** Eyes go HUGE, mouths stretch wide, facial features distort expressively. Sweat drops, speed lines, dramatic shadows. The face transforms completely. |
| **Linework** | Thin, slightly uneven lines — not perfectly clean vector strokes. Lines have a hand-drawn quality with subtle variation in weight. Slightly scratchy or loose in places. Black outlines predominantly (#1A1A1A), not colored outlines. |
| **Palette** | **Slice-of-life scenes:** Muted, everyday colors. Soft browns, greys, school-uniform navy, desaturated sky blue. Realistic and grounded. **Action/combat/忘れ人 scenes:** Colors EXPLODE — vivid purples, electric blues, hot pinks, neon effects. Dramatic lighting shifts. The palette contrast signals intensity. |
| **Shading** | Minimal in calm scenes — mostly flat color with one shadow tone. During intense scenes, shading becomes dramatic: hard shadows, rim lighting, color washes, atmospheric glow effects. |
| **Backgrounds** | Can be more detailed than characters (a MP100 hallmark) — semi-realistic environments with painterly touches that contrast with the simple character designs. Or can go abstract during intense moments (color washes, geometric patterns, psychic energy fields → 忘れ人 corruption fields). |
| **Resolution** | Portraits: 512×512 or 1024×1024. Full-body: 768×1376 (9:16). Scene CGs: 1376×768 (16:9) or 2752×1536 (16:9 at 2K). |
| **Expressions** | Each character needs a portrait set in TWO registers: **Calm set** (neutral, mild smile, mild concern, thinking — simple dot-eye style) and **Intense set** (shocked, angry, terrified, battle-ready, laughing hard — full expressive distortion). The body/clothing framing stays identical; only the face transforms. This dual-register expression system is core to the MP100 aesthetic. |
| **Influences** | Mob Psycho 100 (primary), ONE's art style (Saitama-esque simplicity for calm, BONES-quality explosion for intense), with touches of: Ping Pong: The Animation (dynamic distortion), Tatami Galaxy (abstract backgrounds during surreal moments). |

### The Two Registers (Critical for Prompt Design)

Every character portrait and CG exists on a spectrum between two visual registers. Claude Code must specify which register an asset targets:

**Register 1 — 日常 (Nichijou / Everyday)**
- Simple faces, dot eyes, muted colors, flat shading
- Used for: home scenes, school conversations, shopping, casual NPC chats
- Warm, safe, cozy. The normal world Rikizo is rebuilding.

**Register 2 — 覚醒 (Kakusei / Awakening)**
- Explosive expressions, vivid colors, dramatic shading, dynamic energy effects
- Used for: combat encounters, 忘れ人 confrontations, emotional story beats, the void
- Intense, unsettling, powerful. The fight against forgetting.

### Shared Rules (Both Modes)

- **Consistent character identity.** Rikizo must be recognizable in both pixel and MP100 forms. Key identifiers (hair style, uniform, pocket dictionary) must carry across modes.
- **The two registers carry into pixel art.** Pixel mode should also have calm sprites (normal gameplay) and intense sprites (combat, 忘れ人 encounters) with noticeably different energy — brighter colors, more dynamic poses, maybe slight palette shifts.
- **Japanese text accuracy.** Any hiragana, katakana, or kanji visible in the art must be correct. Claude Code should verify Japanese text before including it in prompts. The game is played entirely in Japanese — text accuracy is non-negotiable.
- **Seasonal variants.** Environments change by season. Spring = cherry blossoms, summer = bright green + cicadas, autumn = red/orange leaves, winter = snow + breath clouds.
- **Light source consistency.** Upper-left at approximately 10 o'clock for all assets.
- **No watermarks or signatures** in the final output.
- **Progressive world design.** Early-game assets (Day 1–5) should feel sparse — few objects, empty spaces, the void visible at edges. Later assets grow denser and more detailed as the world fills in. This visual progression IS the game's core identity.

### Originality Guardrails — "Inspired by, Not Copied from"

**Legal context:** Art style cannot be copyrighted — only specific character designs and expressions can. Drawing in ONE's style is legal. Drawing ONE's characters is infringement. The game's art direction is "Mob Psycho 100 style" the same way Avatar: The Last Airbender is "anime style" — inspired by, not derivative of.

**What we borrow (STYLE — legal, unprotectable):**
- Intentionally simple character designs with minimal facial features
- Dual-register system (calm/simple ↔ intense/explosive)
- Thin, loose, slightly uneven linework
- Lanky proportions (1:5 or 1:6 head-to-body ratio)
- Backgrounds more detailed and painterly than characters
- Flat colors in calm scenes, vivid color explosions in intense scenes
- Dot/dash eyes in everyday mode, dramatic full eyes in awakening mode

**What we NEVER borrow (CHARACTERS — protected IP):**
- No character may resemble Mob (Shigeo Kageyama), Reigen, Dimple, Ritsu, Teru, Shou, the Body Improvement Club members, Mogami, or ANY named Mob Psycho 100 character
- No school uniform may match Salt Middle School's specific design (black gakuran with specific collar and buttons) — Rikizo's school uniform must be visually distinct
- No psychic ability visual may replicate MP100's specific aura effects (Mob's blue energy swirl, ???%'s red/black tendrils, Teru's golden barrier)
- No location may recreate Seasoning City landmarks, Spirits and Such Consultation Office, or any identifiable MP100 setting
- No scene composition may reference specific iconic frames from the anime or manga

**The "Stranger Test":** After generating any character, ask: "If someone who has watched all of Mob Psycho 100 saw this character with no context, would they think it IS a character from that show?" If yes → redesign. If they'd say "this looks like it COULD be from that show but I don't recognize who it is" → you're in the clear. That's the difference between style (fine) and likeness (infringement).

**Prompt-level safeguard — include in ALL character generation prompts:**
```
ORIGINALITY REQUIREMENT: This character must be an ORIGINAL design. Do NOT 
reference, replicate, or draw from any existing Mob Psycho 100 character 
(Mob, Reigen, Dimple, Ritsu, Teru, etc.) or any other copyrighted character.
The art STYLE is inspired by ONE's linework and dual-register approach, but 
every character design — face shape, hairstyle, clothing, accessories, body 
type, color palette — must be wholly original to this project.
```

**Critic-level check — the Originality Score:**
After generating any character asset, the Critic agent must evaluate:
1. Does this character's face/hair/outfit closely match any known MP100 character? (If yes → REJECT, regenerate with explicit differentiation instructions)
2. Does this character's psychic/combat visual closely match MP100's specific effects? (If yes → redesign the effect with different colors/shapes/movement)
3. Could this character pass as a generic "ONE-style" design without being mistaken for someone specific? (Must be yes to pass)

---

## 3. Reference Image Protocol

Before generating any asset, Claude Code must load and analyze the user's existing PNGs to maintain style consistency.

### Step 1 — Catalog Existing Assets

```python
import os, base64
from pathlib import Path

ASSET_DIR = "./references"  # Adjust to your project path

def catalog_assets(directory):
    """Scan reference directory and categorize PNGs."""
    catalog = {"pixel_characters": [], "pixel_maps": [], "vector_portraits": [], "vector_ui": [], "other": []}
    for f in Path(directory).rglob("*.png"):
        # Claude Code: visually inspect each and assign to category
        catalog["other"].append(str(f))
    return catalog

reference_catalog = catalog_assets(ASSET_DIR)
```

### Step 2 — Analyze Style DNA

For each reference image, Claude Code extracts and documents:

- **Color palette:** Dominant colors (hex values), accent colors, shadow/highlight strategy.
- **Line weight & style:** Pixel width of outlines, anti-aliased or not, outline color.
- **Proportions:** Head-to-body ratio for characters, tile dimensions for maps.
- **Shading approach:** Flat, cel-shaded, dithered, or gradient.
- **Text rendering:** How Japanese text appears (font style, size relative to elements, color).

Store this analysis in a `style_dna.json` file that persists across sessions.

### Step 3 — Reference Injection

When generating any new asset, **always include 1–3 existing reference PNGs** as input to the Gemini API call. This is PaperBanana's Retriever step adapted for style transfer. The Gemini API's multi-image input preserves character identity and style consistency far better than text descriptions alone.

```python
# Always attach references when calling Gemini
reference_images = select_references(asset_type, reference_catalog)
# reference_images = list of PIL Image objects or base64 data
```

---

## 4. The Five-Agent Pipeline

Every art asset generation runs through **five sequential agents**. Each agent has a single, well-defined job. No asset may skip a stage. Claude Code executes each agent as a discrete labeled step.

```
Asset Request (from user or batch workflow)
     │
     ▼
┌─────────────────────────────────┐
│  AGENT 1: RETRIEVER             │
│  Gathers references & style DNA │
└────────────┬────────────────────┘
             │ Asset Brief + references
             ▼
┌─────────────────────────────────┐
│  AGENT 2: PLANNER               │
│  Structures the visual plan     │
└────────────┬────────────────────┘
             │ Figure Plan
             ▼
┌─────────────────────────────────┐
│  AGENT 3: STYLIST               │
│  Applies art direction rules    │
└────────────┬────────────────────┘
             │ Styled Prompt + API Config
             ▼
┌─────────────────────────────────┐
│  AGENT 4: VISUALIZER            │
│  Calls Gemini API               │
└────────────┬────────────────────┘
             │ Candidate images
             ▼
┌─────────────────────────────────┐
│  AGENT 5: CRITIC                │
│  Evaluates & iterates           │──── FAIL → back to Agent 4 with updated prompt
└────────────┬────────────────────┘    (up to 3 rounds, then select best)
             │ Final approved image
             ▼
        Post-processing & save
```

---

### AGENT 1 — Retriever

**Trigger:** User request for any art asset, or a batch workflow step that requires a new image.

**Responsibilities:**

1. **Parse the request.** Identify: asset type (portrait, sprite sheet, background, etc.), character name (if applicable), register (日常 calm or 覚醒 intense), and any special notes.
2. **Determine art mode.** Map the asset type to its mode using the Asset Type Catalog (Section 5):
   - Mode A (Chibi Pixel): sprite sheets, battle sprites, tilesets, item icons, NPC sprites, effect sprites, corrupted zone tiles
   - Mode B (Mob Psycho 100 Style): portraits, full-body, scene CGs, location backgrounds, conversation backgrounds, UI elements, menu BGs, title screen, enemy concept art, boss concepts, The Void, corrupted backgrounds
3. **Read the reference catalog.** Check the `references/` directory for existing assets in the same category. Use the catalog structure from Section 3:
   - `references/pixel_characters/` — existing pixel character PNGs
   - `references/pixel_maps/` — existing pixel map/tileset PNGs
   - `references/vector_portraits/` — existing MP100-style portrait PNGs
   - `references/vector_ui/` — existing UI element PNGs
4. **Select 1–3 reference images** that best match the requested asset. Priority order: (a) same character in a different pose/expression, (b) same asset type for a different character, (c) same art mode in any category. If no references exist yet (first asset), skip to step 5.
5. **Load style_dna.json.** Read `references/style_dna.json` for the relevant mode. If this file does not exist yet, flag it — the Retriever must run the Style DNA Analysis (Section 3, Step 2) before any generation can proceed.
6. **Build the Asset Brief** (see format below) and pass it to Agent 2.

**Asset Brief format (internal working document):**

```
ASSET BRIEF
════════════
Request:          [verbatim user request or batch step description]
Asset type:       [e.g. dialogue_portrait, character_sprite_sheet, location_background]
Art mode:         [A (pixel) | B (vector/MP100)]
Register:         [日常 calm | 覚醒 intense | N/A for backgrounds/items]
Character:        [name or "N/A" for non-character assets]
Target file path: [e.g. output/characters/rikizo/portrait_calm_neutral.png]
Reference images: [list of paths to selected reference PNGs]
Style DNA:        [loaded from style_dna.json — hex palette, line weight, proportions, shading approach]
Transparency:     [yes (sprites/characters) | no (backgrounds/CGs)]
Transparency method: [dual-render | rembg | none — see Section 6 decision matrix]
Gemini model:     [gemini-3-pro-image-preview | gemini-3.1-flash-image-preview — per Section 7 model selection]
Resolution:       [1K | 2K | 4K — per asset type spec in Section 5]
Aspect ratio:     [1:1 | 9:16 | 16:9 | custom — per asset type spec]
Special notes:    [e.g. "This is the first asset — no references available yet, prioritize establishing style"]
```

**File locations the Retriever reads:**
- `references/` — all subdirectories for existing PNGs
- `references/style_dna.json` — extracted style parameters
- Section 5 of this document — asset type → mode/model/resolution mapping
- Section 6 of this document — transparency decision matrix

**File locations the Retriever writes to:** None. The Asset Brief is an internal handoff document only.

---

### AGENT 2 — Planner

**Trigger:** Receives an Asset Brief from Agent 1.

**Responsibilities:**

1. **Read the character bible.** For character assets, read the Core Cast section (Section 1) to get the character's physical description, key identifiers, personality, and any design constraints. For enemies, read the 忘れ人 lore section.
2. **Read the Originality Guardrails** (Section 2, "Originality Guardrails" subsection). For every character asset, internalize the "what we borrow vs. what we NEVER borrow" lists and the Stranger Test.
3. **Parse the request into a structured Figure Plan.** The plan must specify every visual element with no ambiguity:

```
FIGURE PLAN
════════════
Asset:            [from Asset Brief]
Register:         [from Asset Brief]

SUBJECTS:
- Character(s):   [name, expression, pose, clothing details, accessories, hair style]
- Key identifiers:[items that MUST be present for character recognition — e.g. Rikizo's pocket dictionary]

COMPOSITION:
- Framing:        [bust-up, full-body, wide-shot, overhead, etc.]
- Camera angle:   [3/4 view, front-facing, side profile, etc.]
- Focal point:    [where the eye should land first]
- Negative space: [where to leave empty for text overlay, UI, transparency, etc.]

ENVIRONMENT:
- Setting:        [interior/exterior, specific location, time of day]
- Depth layers:   [foreground elements, midground, background]
- Lighting:       [direction (upper-left default), quality (soft/harsh), color temperature]

COLOR:
- Dominant hues:  [from style_dna.json palette + register-appropriate colors]
- Register color: [calm: muted/warm | intense: vivid/electric — see Section 2 register rules]
- Accent colors:  [specific hex values for highlights, effects]

TEXT/OVERLAYS:
- Japanese text:  [exact text if any, verified for accuracy]
- UI elements:    [if this is a UI asset, specify layout zones]

TECHNICAL:
- Grid/layout:    [for sprite sheets: rows × cols, cell dimensions]
- Background:     [solid white (for dual-render), solid black (for dual-render pass 2), or scene-integrated]
- Pixel rules:    [for Mode A only: palette limit, outline rules, dithering, anti-aliasing=NO]

ORIGINALITY CHECK:
- This character does NOT resemble: [list any MP100 characters that share traits with the described design]
- Distinguishing features:          [what makes this design original — specific hair, clothing, color choices that differ from MP100 cast]
```

4. **Cross-reference the character bible for accuracy.** Verify that every detail in the Figure Plan matches the established character design. If this is the first time generating this character, the Figure Plan ESTABLISHES the canonical design — flag this in the plan so the Critic knows to evaluate it as a new design rather than checking for consistency with a non-existent reference.
5. **Pass the Figure Plan to Agent 3** along with the Asset Brief.

**Planner reads:**
- Section 1 (The World of Rikizo) — character descriptions, location descriptions, lore
- Section 2 (Art Direction Bible) — register rules, originality guardrails, shared rules
- The Asset Brief from Agent 1

**Planner writes:** The Figure Plan (internal handoff document).

---

### AGENT 3 — Stylist

**Trigger:** Receives a Figure Plan and Asset Brief from Agent 2.

**Responsibilities:**

1. **Determine the governing prompt template.** Read Section 8 (Prompt Templates) and select the template that matches the asset type. Templates exist for: dialogue portrait, location background, character sprite sheet, UI element, item icons, 忘れ人 minion, 忘れ人 boss concept, The Void, corrupted zone tileset.
2. **Apply art-mode-specific aesthetic rules.** Read Section 2 (Art Direction Bible) for the relevant mode:
   - **Mode A (Pixel):** Enforce hard pixel edges, no anti-aliasing, 16–32 color palette, 1px outlines (darker shade of fill color, NOT black), dithering permitted, upper-left light source, 2–3 head proportions.
   - **Mode B (MP100):** Enforce the correct register. 日常 = dot/dash eyes, minimal features, flat colors, thin loose outlines, muted palette. 覚醒 = dramatic full eyes, vivid colors, variable line weight, atmospheric effects. BOTH registers: lanky proportions (1:5 or 1:6), thin limbs, simplified hands, backgrounds MORE detailed than characters.
3. **Inject style_dna.json parameters.** Take the hex palette, line weight measurements, and shading approach from the style DNA and weave them into the prompt as concrete values (e.g. "use these exact hex colors: #2A3B4C, #5D6E7F...").
4. **Inject the originality safeguard.** For all character assets, append the mandatory originality clause from Section 2 to the prompt.
5. **Compose the final styled prompt.** Merge the Figure Plan details + template structure + style DNA + aesthetic rules + originality clause into a single generation prompt string. The prompt must be a complete, self-contained instruction to Gemini — it should not require any external context to be interpretable.
6. **Set the API configuration:**

```
API CONFIG
══════════
Model:         [from Asset Brief]
Resolution:    [from Asset Brief — maps to image_size param: "1K", "2K", "4K"]
Aspect ratio:  [from Asset Brief]
Response mode: [IMAGE only — set response_modalities=["IMAGE"]]
Temperature:   [not configurable in Gemini image API — omit]
Candidates:    [generate 2–3 by making 2–3 separate API calls]
```

7. **Pass the Styled Prompt + API Config + Reference Images to Agent 4.**

**Stylist reads:**
- Section 2 (Art Direction Bible) — mode rules, register rules
- Section 8 (Prompt Templates) — the matching template
- `references/style_dna.json` — concrete style values
- The Figure Plan and Asset Brief from previous agents

**Stylist writes:** The Styled Prompt (string) and API Config (dict). These are the direct inputs to the Gemini API.

---

### AGENT 4 — Visualizer

**Trigger:** Receives Styled Prompt, API Config, and Reference Images from Agent 3.

**Responsibilities:**

1. **Determine transparency workflow.** Check the Asset Brief's `Transparency` field:
   - If `yes` + `dual-render`: Execute TWO generation passes (see Section 6). First pass with white background instruction appended. Second pass using multi-turn chat to swap background to black. Then run `extract_alpha()` to produce the final RGBA PNG.
   - If `yes` + `rembg`: Execute ONE generation pass, then run `remove_background_ai()` on the result.
   - If `no`: Execute ONE generation pass. The image is used as-is.

2. **Call the Gemini API.** Use the Python functions from Section 7:
   - For standard assets: `generate_asset()` with the styled prompt, reference images, and API config.
   - For expression variants: `generate_expression_variants()` using multi-turn chat to preserve character identity.
   - For pixel art: `generate_pixel_asset()` with the pixel-specific style prefix.
   - For upscaling: `upscale_and_refine()` after initial generation if 4K is needed.

3. **Generate 2–3 candidates.** Make separate API calls for each candidate. Do NOT rely on a single generation — variation between candidates gives the Critic options.

4. **Save all candidates** to a temporary working directory:
   ```
   output/_wip/[asset_type]/[character_name]/
   ├── candidate_1.png
   ├── candidate_1_white.png   (if dual-render)
   ├── candidate_1_black.png   (if dual-render)
   ├── candidate_2.png
   └── candidate_3.png
   ```

5. **Pass all candidates to Agent 5** along with the original Asset Brief, Figure Plan, and Reference Images (for comparison).

**Visualizer reads:**
- Section 6 (Transparency & Alpha Extraction) — dual-render procedure, extract_alpha code
- Section 7 (Gemini API Integration) — API functions, model selection, code
- The Styled Prompt, API Config, and Reference Images from Agent 3

**Visualizer writes:**
- Candidate images to `output/_wip/[asset_type]/[character_name]/`
- A generation log entry (see Section 11 file organization for log format)

**API error handling:** If Gemini returns an error or refuses generation (content policy, etc.):
- Log the error with the full prompt text
- If the error is a content policy block: revise the prompt to remove potentially flagged content, re-run through Agent 3 for a softened version
- If the error is a rate limit: wait and retry (exponential backoff)
- If 3 consecutive failures: halt and report to user with the error details

---

### AGENT 5 — Critic

**Trigger:** Receives candidate images from Agent 4, plus the Asset Brief, Figure Plan, and Reference Images.

**Responsibilities:**

1. **Evaluate each candidate** using the Quality Gate rubric from Section 9. Score every candidate on all applicable dimensions:
   - **Faithfulness** (1–5): Are all requested elements present? Is Japanese text accurate? Is character identity correct?
   - **Style Consistency** (1–5): Does it match the reference PNGs and style_dna.json?
   - **Readability** (1–5): Is visual clarity good? Is the focal point obvious?
   - **Usefulness** (1–5): Can it drop into the game engine with no/minimal editing?
   - **Originality** (1–5, character assets only): Does it pass the Stranger Test? See Section 2 Originality Guardrails.

2. **Check minimum thresholds.** Compare scores against the Minimum Acceptance Thresholds table in Section 9 for the specific asset type. ALL dimensions must meet or exceed their threshold.

3. **Perform Japanese text verification** (if the asset contains visible Japanese text). Use the VLM verification technique from Section 9: re-ingest the generated image and ask Gemini to read back the Japanese text. Compare against the intended text from the Figure Plan. Any mismatch is a hard fail.

4. **Perform originality check** (character assets only). Apply the Stranger Test: "Would an MP100 fan think this IS a character from that show?" If Originality ≤ 2 → automatic reject regardless of other scores. Specify which copyrighted character it resembles and how to differentiate.

5. **Perform consistency check** (if references exist). Overlay/compare the candidate against existing character references. Verify: same face shape, same hair style, same proportions, same color palette. Identity drift between assets is a fail for Expression Variants (Style Consistency must be ≥ 5).

6. **Decision:**

   - **PASS:** At least one candidate meets all thresholds. Select the highest-scoring candidate. Proceed to post-processing.
   - **FAIL (round < 3):** No candidate meets thresholds. Produce a Critic Feedback Report (see format below) and return to Agent 4 with an updated prompt. The updated prompt = original styled prompt + the `updated_prompt_additions` from the feedback report.
   - **FAIL (round = 3):** Select the best available candidate despite threshold failures. Log the failure and flag the asset for manual review.

**Critic Feedback Report format:**

```json
{
  "round": 1,
  "candidate_scores": [
    {
      "candidate": "candidate_1.png",
      "scores": {"faithfulness": 3, "style_consistency": 4, "readability": 4, "usefulness": 3, "originality": 5},
      "passed": false
    },
    {
      "candidate": "candidate_2.png",
      "scores": {"faithfulness": 4, "style_consistency": 3, "readability": 4, "usefulness": 4, "originality": 5},
      "passed": false
    }
  ],
  "best_candidate": "candidate_2.png",
  "issues": [
    "Candidate 1: character is missing the pocket dictionary — faithfulness fail",
    "Candidate 2: line weight is thicker than reference — style consistency fail"
  ],
  "updated_prompt_additions": [
    "The character MUST be holding a small blue pocket dictionary in their right hand",
    "Use THINNER line weight — match the reference images exactly, approximately 1px stroke"
  ]
}
```

**Critic reads:**
- Section 9 (Quality Gate & Critic Rubric) — scoring dimensions, thresholds, feedback format
- Section 2 (Art Direction Bible) — originality guardrails, Stranger Test
- The Asset Brief, Figure Plan, and Reference Images for comparison

**Critic writes:**
- Critic Feedback Report (if FAIL — internal handoff back to Agent 4)
- Final quality scores and generation log entry (if PASS)

---

### Post-Processing & File Delivery (after Critic PASS)

After the Critic approves a final image, Claude Code performs these steps:

1. **Run transparency extraction** if flagged in Asset Brief (should already be done by Visualizer, but verify the output is valid RGBA).
2. **Resize/crop to exact spec** from Section 5 (e.g. sprite sheets must be exactly 1224×1172, portraits exactly 1024×1024).
3. **Verify pixel dimensions** programmatically — do not trust Gemini's output dimensions.
4. **Reference immutability rule.** The `references/` directory is the style source-of-truth. **Never overwrite or delete existing files in `references/`.** When a character design changes (e.g. adding glasses, updating clothing), the original reference stays as-is and the updated asset is written to `output/`. New hero assets may be *added* to `references/` as new files (Step 6) to expand the style corpus, but existing files are never replaced. If a design change is permanent, the old reference remains for historical style continuity and the new version becomes the active asset in `output/` and game directories.
5. **Copy the final file** to its permanent location in `output/` following the file organization from Section 11:
   ```
   output/
   ├── shared/sprites/me_sheet.png         ← player sprite sheet
   ├── data/N5/game/day-01-home/           ← per-day game assets
   │   ├── me_portrait.png
   │   ├── mom_sprite.png
   │   ├── mom_portrait.png
   │   └── ...
   ├── characters/rikizo/                  ← master reference sheets
   │   ├── portrait_calm_neutral.png
   │   ├── portrait_calm_smile.png
   │   └── ...
   ├── enemies/, locations/, ui/, items/, effects/, tiles/
   └── ...
   ```
6. **Update the reference catalog.** If this is a brand-new hero portrait or key design asset (not a modification of an existing one), copy it to `references/` in the appropriate subdirectory as a new file so future Retriever runs can use it.
7. **Log the generation.** Append to `logs/generation_log.json`:
   ```json
   {
     "timestamp": "2026-03-02T14:30:00Z",
     "asset_type": "dialogue_portrait",
     "character": "rikizo",
     "register": "calm",
     "model": "gemini-3-pro-image-preview",
     "rounds": 2,
     "final_scores": {"faithfulness": 5, "style_consistency": 4, "readability": 5, "usefulness": 5, "originality": 5},
     "output_path": "output/characters/rikizo/portrait_calm_neutral.png",
     "reference_images_used": ["references/vector_portraits/rikizo_fullbody.png"],
     "prompt_hash": "a3f8c2..."
   }
   ```
7. **Clean up working files.** Delete `output/_wip/` candidates that were not selected (or keep them if the user wants to review alternatives).

---

### The Handoff Protocol

Each handoff between agents **must** include:

1. The current working document (Asset Brief, Figure Plan, Styled Prompt, or Critic Report)
2. All accumulated documents from previous agents
3. A one-line label: `=== AGENT N: [ROLE] ===` followed by `Passing to Agent N+1 — [reason]`

**Show every step.** When running the pipeline, label each agent transition explicitly in the output so the user can see exactly what happened:

```
=== AGENT 1: RETRIEVER ===
Selected 2 references: rikizo_fullbody.png, mom_portrait.png
Art mode: B (MP100), Register: 日常 calm, Model: Pro
Passing to Agent 2 — Asset Brief complete

=== AGENT 2: PLANNER ===
Built Figure Plan for dialogue portrait: bust-up, 3/4 angle, neutral expression...
Originality check: no MP100 character resemblance detected
Passing to Agent 3 — Figure Plan complete

=== AGENT 3: STYLIST ===
Applied MP100 日常 register rules + style_dna palette
Composed final prompt (847 tokens)
Passing to Agent 4 — Styled Prompt ready

=== AGENT 4: VISUALIZER ===
Generated 3 candidates via gemini-3-pro-image-preview
Dual-render alpha extraction completed
Passing to Agent 5 — 3 candidates ready for evaluation

=== AGENT 5: CRITIC (Round 1) ===
Candidate 1: F:5 S:4 R:5 U:5 O:5 — PASS ✓
Selected candidate 1 as final

=== POST-PROCESSING ===
Resized to 1024×1024, verified RGBA transparency
Saved to output/characters/rikizo/portrait_calm_neutral.png
Copied to references/vector_portraits/ for future retrieval
Logged to logs/generation_log.json
```

If the Critic issues a FAIL, label the retry:

```
=== AGENT 5: CRITIC (Round 1) ===
No candidates passed — style_consistency below threshold
Returning to Agent 4 with updated prompt additions

=== AGENT 4: VISUALIZER (Revision 2) ===
Regenerating with Critic feedback appended to prompt...
```

---

### Quick-Start: Running the Pipeline

When the user says something like *"Generate Rikizo's calm portrait"* or *"Make the Day 1 house interior background"* or *"Run the batch character workflow for Mom"*, begin with:

```
=== AGENT 1: RETRIEVER ===
Reading references/ catalog and style_dna.json...
```

Then proceed through each agent. For batch workflows (Section 10), each individual asset within the batch runs through the full 5-agent pipeline independently — do not batch-skip agents.

**First-ever asset (no references exist yet):**
If `references/` is empty and `style_dna.json` does not exist:
1. Ask the user if they have any existing PNGs to analyze. If yes, run the Style DNA Analysis (Section 3, Step 2) first.
2. If no references exist at all, the Retriever skips reference selection and the Stylist relies solely on the Art Direction Bible (Section 2) and prompt templates (Section 8).
3. The first generated hero portrait becomes the founding reference — copy it to `references/` immediately after Critic approval so all subsequent assets can reference it.

---

## 5. Asset Type Catalog & Specs

### Pixel Assets (Mode A) — Use Gemini Flash for bulk

| Asset Type | Dimensions | Aspect Ratio | Resolution | Notes |
|---|---|---|---|---|
| **Character sprite sheet** | 1224×1172 (6 cols × 4 rows of 204×293 sprites) | custom | 2K | 4 directions × 6 frames (idle + 5 walk). Processed through dual-render alpha extraction (Section 6) for true RGBA transparency. |
| **Battle sprite (player/ally)** | 64×64 per frame, sheet of 6 | 1:1 | 1K | Idle, attack, defend, hurt, victory, special |
| **Enemy sprite** | 64×64 or 96×96 per frame | 1:1 | 1K | 忘れ人 minions: shadowy, glitchy, corrupted. Various sizes. |
| **Boss sprite** | 128×128 or larger | 1:1 | 2K (Pro) | 忘れ人 bosses: eldritch, imposing. Unique per boss. |
| **Map tile set** | 256×256 (grid of 16×16 tiles) | 1:1 | 1K | Ground, walls, furniture, decorations. Seamless tiling. |
| **Void tile set** | 256×256 | 1:1 | 1K | The blank void outside the world. Dark, empty, subtly unsettling. Slight static/noise texture. |
| **Corruption tiles** | 256×256 | 1:1 | 1K | 忘れ人 domain tiles: distorted architecture, glitch patterns, inverted colors, impossible geometry. |
| **Item icons** | 32×32 each, grid of 8×4 | 4:1 | 1K | Weapons, potions, quest items, consumables, key items. |
| **NPC sprites** | 48×64 per frame | 3:4 | 1K | Same format as character sprites. NPCs unlock progressively. |
| **Effect sprites** | 64×64, 4–6 frames | 1:1 | 1K | Sword slash, magic burst, healing glow, shadow tendrils, hit sparks, status effects. |

### Vector Assets (Mode B) — Use Gemini Pro for hero art, Flash for variants

| Asset Type | Dimensions | Aspect Ratio | Resolution | Notes |
|---|---|---|---|---|
| **Dialogue portrait** | 1024×1024 | 1:1 | 1K (Pro) | Bust-up, white/transparent BG. One per expression. |
| **Full-body character art** | 768×1376 | 9:16 | 2K (Pro) | Standing pose, full outfit visible, clean background. |
| **Scene CG** | 2752×1536 | 16:9 | 2K (Pro) | Key story moments — first time seeing the void, boss confrontations, town materializing, festivals. |
| **Location background** | 1376×768 | 16:9 | 2K (Pro or Flash) | Classroom, konbini, station, shrine, park. Detailed but not cluttered. |
| **Location background (void)** | 1376×768 | 16:9 | 2K (Pro) | The void beyond the world's edge. Dark, empty, cosmic. Subtle wrongness. |
| **Location background (corrupted)** | 1376×768 | 16:9 | 2K (Pro) | 忘れ人 domains. Glitch-distorted versions of normal locations. |
| **Battle background** | 1376×768 | 16:9 | 1K (Flash) | Combat encounter backdrops. Street, school yard, corrupted zone, boss arena. |
| **Enemy concept art** | 1024×1024 | 1:1 | 2K (Pro) | 忘れ人 minion and boss designs. Full detail reference sheets. |
| **UI frame / dialogue box** | 1376×768 | 16:9 | 1K (Flash) | Semi-transparent panel with decorative border. Must leave room for text. |
| **Battle UI** | 1376×768 | 16:9 | 1K (Flash) | HP/MP bars, command menus, enemy targeting indicators. |
| **Menu background** | 1024×1024 | 1:1 | 1K (Flash) | Subtle pattern or soft illustration. Non-distracting. |
| **Title screen** | 2752×1536 | 16:9 | 2K (Pro) | Hero art featuring Rikizo + key cast, game logo space at top. Hint of the void/忘れ人 in the background. |
| **Expression variant** | 1024×1024 | 1:1 | 1K (Flash) | After hero portrait exists, generate expression swaps via editing. |

---

## 6. Transparency & Alpha Extraction

Gemini outputs standard RGB images — even when you prompt for "transparent background," the result is typically a solid-color background, not true RGBA with an alpha channel. The magenta (#FF00FF) chroma-key approach leaves pink fringe on anti-aliased edges because those edge pixels are a blend of character color + background color.

### The Solution: Dual-Render Alpha Matting

This is a standard VFX compositing technique. Generate the **exact same sprite twice** — once on pure white, once on pure black. Then mathematically extract the perfect alpha channel from the pixel differences. No ML inference, no edge artifacts, mathematically exact.

**Why it works:** When a semi-transparent edge pixel (say, 50% opaque dark hair) is rendered over white, you get a light grey. Over black, you get a dark grey. The difference between those two values IS the transparency. Pure background pixels are white-on-white and black-on-black — easy to detect. Pure character pixels are identical in both — easy to detect. Edge pixels fall in between proportionally. It's perfect.

```python
import numpy as np
from PIL import Image

def extract_alpha(white_bg_path: str, black_bg_path: str, output_path: str) -> Image.Image:
    """
    Given two renders of the same sprite — one on white, one on black —
    compute the true RGBA image with perfect transparency.
    
    Math:
      Over white:  Cw = C * α + 255 * (1 - α)
      Over black:  Cb = C * α + 0   * (1 - α) = C * α
      Therefore:   α  = 1 - (Cw - Cb) / 255
      And:         C  = Cb / α   (where α > 0)
    """
    white_img = np.array(Image.open(white_bg_path).convert("RGB")).astype(np.float64)
    black_img = np.array(Image.open(black_bg_path).convert("RGB")).astype(np.float64)
    
    # Compute alpha from the difference between the two renders
    # Use the average across RGB channels for stability
    diff = white_img - black_img  # For background pixels: 255-0 = 255, for opaque: same-same = 0
    alpha = 1.0 - (np.mean(diff, axis=2) / 255.0)
    alpha = np.clip(alpha, 0.0, 1.0)
    
    # Recover true color: C = Cb / α (black render = C * α)
    alpha_3ch = np.stack([alpha] * 3, axis=2)
    # Avoid division by zero — where alpha is 0, color doesn't matter (fully transparent)
    safe_alpha = np.where(alpha_3ch > 0.01, alpha_3ch, 1.0)
    true_color = np.clip(black_img / safe_alpha, 0, 255)
    
    # Assemble RGBA
    rgba = np.zeros((*white_img.shape[:2], 4), dtype=np.uint8)
    rgba[:, :, :3] = true_color.astype(np.uint8)
    rgba[:, :, 3] = (alpha * 255).astype(np.uint8)
    
    result = Image.fromarray(rgba, "RGBA")
    result.save(output_path)
    return result
```

### Integrating Dual-Render into the Pipeline

The Visualizer agent generates every sprite TWICE with identical prompts — only the background color instruction changes. The PaperBanana pipeline wraps this:

```python
def generate_transparent_sprite(
    prompt: str,
    reference_images: list,
    aspect_ratio: str = "1:1",
    resolution: str = "1K",
    model: str = "gemini-3.1-flash-image-preview",
    output_path: str = "sprite.png"
) -> Image.Image:
    """
    Generate a sprite with true RGBA transparency via dual-render alpha matting.
    """
    # Strip any background instructions from the original prompt
    clean_prompt = prompt.replace("transparent background", "").replace("magenta background", "")
    
    # Render 1: Pure white background
    white_prompt = clean_prompt + (
        "\n\nCRITICAL: The background must be PURE SOLID WHITE (#FFFFFF). "
        "No gradients, no shadows on the background, no off-white — "
        "every single background pixel must be exactly RGB(255, 255, 255). "
        "The character/subject must not cast any shadow onto the background."
    )
    white_img = generate_asset(
        white_prompt, reference_images, aspect_ratio, resolution, model,
        output_path.replace(".png", "_white.png")
    )
    
    # Render 2: Pure black background — SAME prompt, same references
    black_prompt = clean_prompt + (
        "\n\nCRITICAL: The background must be PURE SOLID BLACK (#000000). "
        "No gradients, no lighting on the background, no dark grey — "
        "every single background pixel must be exactly RGB(0, 0, 0). "
        "The character/subject must not cast any shadow onto the background."
    )
    black_img = generate_asset(
        black_prompt, reference_images, aspect_ratio, resolution, model,
        output_path.replace(".png", "_black.png")
    )
    
    # Extract perfect alpha
    result = extract_alpha(
        output_path.replace(".png", "_white.png"),
        output_path.replace(".png", "_black.png"),
        output_path
    )
    
    return result
```

### Handling Consistency Between the Two Renders

The two renders must depict the **exact same** sprite for the math to work. If Gemini generates a slightly different pose or detail between them, the alpha extraction will produce artifacts. Mitigation strategies:

1. **Use multi-turn editing.** Generate the white-background version first. Then in a follow-up turn, send that image back and say: "Redraw this exact image with the background changed to pure black (#000000). Do NOT change the character, pose, colors, or any detail — ONLY change the background color."

2. **Use a seed if available.** If the Gemini API exposes a seed parameter, use the same seed for both renders.

3. **Critic verification.** The Critic agent should overlay the two renders at 50% opacity to check alignment before running alpha extraction. If they differ, regenerate.

```python
def generate_transparent_sprite_multiturn(
    prompt: str,
    reference_images: list,
    aspect_ratio: str = "1:1",
    resolution: str = "1K",
    model: str = "gemini-3.1-flash-image-preview",
    output_path: str = "sprite.png"
) -> Image.Image:
    """
    More reliable dual-render using multi-turn conversation.
    Generate on white first, then ask Gemini to swap background to black.
    """
    # Step 1: Generate on white
    white_prompt = prompt + (
        "\n\nThe background must be PURE SOLID WHITE (#FFFFFF). "
        "No gradients, no shadows on background. Every background pixel = RGB(255,255,255)."
    )
    white_img = generate_asset(
        white_prompt, reference_images, aspect_ratio, resolution, model,
        output_path.replace(".png", "_white.png")
    )
    
    # Step 2: Use multi-turn to swap background to black
    chat = client.chats.create(
        model=model,
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE"],
            image_config=types.ImageConfig(
                aspect_ratio=aspect_ratio,
                image_size=resolution,
            ),
        ),
    )
    
    response = chat.send_message([
        white_img,
        "Change ONLY the background of this image to pure solid black (#000000). "
        "Do NOT change anything about the character — same exact pose, colors, details, "
        "proportions, and position. Only replace every white background pixel with black. "
        "The character must remain pixel-identical."
    ])
    
    black_path = output_path.replace(".png", "_black.png")
    for part in response.parts:
        if part.inline_data is not None:
            black_img = part.as_image()
            black_img.save(black_path)
            break
    
    # Step 3: Extract alpha
    return extract_alpha(
        output_path.replace(".png", "_white.png"),
        black_path,
        output_path
    )
```

### Fallback: AI Background Removal (rembg)

If dual-render produces inconsistent results for a particular asset, use `rembg` as a fallback. It uses a U²-Net segmentation model and handles edge anti-aliasing well:

```python
# pip install rembg[gpu]  (or rembg for CPU-only)
from rembg import remove
from PIL import Image

def remove_background_ai(input_path: str, output_path: str) -> Image.Image:
    """
    AI-based background removal. Good fallback when dual-render 
    produces inconsistent sprites between white/black versions.
    """
    input_img = Image.open(input_path)
    output_img = remove(
        input_img,
        alpha_matting=True,          # Enable alpha matting for cleaner edges
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=10
    )
    output_img.save(output_path)
    return output_img
```

### Decision Matrix: Which Approach to Use

| Scenario | Approach | Why |
|---|---|---|
| Character sprites (single characters on solid BG) | Dual-render multi-turn | Mathematically perfect, no fringe |
| Sprite sheets (grids of multiple sprites) | Dual-render multi-turn | Each cell gets perfect alpha |
| NPC sprites (single static images) | Dual-render multi-turn | Same as character sprites |
| Item icons | rembg fallback | Small, many items per sheet — dual-render consistency harder to maintain |
| Conversation portraits | Dual-render OR rembg | Depends on whether portraits need transparency (they may composite over backgrounds) |
| Full scene CGs / backgrounds | No transparency needed | These ARE the background |

### Important: Update Game.js

Once sprites have true RGBA transparency, remove the `chromaKey()` function from Game.js — it's no longer needed. The PNGs will load with correct alpha directly.

---

## 7. Gemini API Integration

### Model Selection Strategy

```python
# Model routing logic
def select_model(asset_type: str) -> str:
    PRO_ASSETS = [
        "dialogue_portrait",      # Hero art — needs highest quality
        "full_body_character",    # Character identity critical
        "scene_cg",              # Key story moments
        "title_screen",          # First impression
        "location_background",   # When it's a new location (first generation)
        "void_background",       # The void needs to feel right — atmospheric
        "corrupted_background",  # 忘れ人 domains need careful detail
        "boss_sprite",           # Boss designs are hero-tier assets
        "enemy_concept_art",     # Reference sheets for enemy designs
    ]
    # Everything else uses Flash for speed and cost
    if asset_type in PRO_ASSETS:
        return "gemini-3-pro-image-preview"
    else:
        return "gemini-3.1-flash-image-preview"
```

### Core Generation Function (Python)

```python
from google import genai
from google.genai import types
from PIL import Image
import os

client = genai.Client()

def generate_asset(
    prompt: str,
    reference_images: list[Image.Image],
    aspect_ratio: str = "1:1",
    resolution: str = "1K",
    model: str = "gemini-3.1-flash-image-preview",
    output_path: str = "output.png"
) -> Image.Image:
    """
    Generate a single JRPG art asset via Gemini.
    
    Args:
        prompt: The fully styled generation prompt from the Stylist agent.
        reference_images: 1-3 existing PNGs for style consistency.
        aspect_ratio: Target ratio (e.g., "1:1", "16:9", "9:16").
        resolution: "1K", "2K", or "4K".
        model: Gemini model string.
        output_path: Where to save the result.
    """
    # Build content parts: references first, then prompt text
    contents = []
    for ref_img in reference_images:
        contents.append(ref_img)
    contents.append(prompt)
    
    response = client.models.generate_content(
        model=model,
        contents=contents,
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE"],
            image_config=types.ImageConfig(
                aspect_ratio=aspect_ratio,
                image_size=resolution,
            ),
        ),
    )
    
    for part in response.parts:
        if part.inline_data is not None:
            image = part.as_image()
            image.save(output_path)
            return image
    
    raise RuntimeError("No image returned from Gemini API")
```

### Multi-Turn Editing for Expression Variants

Once a hero portrait exists, use multi-turn chat to generate expression swaps. This preserves character identity better than generating from scratch.

```python
def generate_expression_variants(
    base_portrait: Image.Image,
    character_name: str,
    expressions: list[str],
    output_dir: str
):
    """
    Generate expression variants from an existing portrait using multi-turn editing.
    """
    chat = client.chats.create(
        model="gemini-3.1-flash-image-preview",
        config=types.GenerateContentConfig(
            response_modalities=["TEXT", "IMAGE"],
            image_config=types.ImageConfig(
                aspect_ratio="1:1",
                image_size="1K",
            ),
        ),
    )
    
    # First turn: establish the base
    chat.send_message([
        base_portrait,
        f"This is the base portrait of {character_name} from a JRPG. "
        f"I will ask you to create expression variants. "
        f"Keep the exact same character design, clothing, hair, pose, and background. "
        f"Only change the facial expression."
    ])
    
    # Subsequent turns: one per expression
    for expression in expressions:
        prompt = (
            f"Create a variant of this portrait where {character_name} looks {expression}. "
            f"Change ONLY the facial expression — eyebrows, eyes, mouth. "
            f"Keep the exact same outfit, hair, background, art style, and color palette. "
            f"The result must be visually interchangeable in a dialogue box."
        )
        response = chat.send_message(prompt)
        
        for part in response.parts:
            if part.inline_data is not None:
                img = part.as_image()
                safe_expr = expression.replace(" ", "_")
                img.save(os.path.join(output_dir, f"{character_name}_{safe_expr}.png"))
                break
```

### Pixel Art Generation Strategy

Pixel art requires special handling. Gemini excels at illustration but doesn't natively produce pixel-perfect results. Use this two-step approach:

```python
def generate_pixel_asset(
    prompt: str,
    reference_images: list[Image.Image],
    target_size: tuple[int, int],  # e.g., (48, 64) for a single sprite
    sheet_layout: tuple[int, int] = (1, 1),  # cols, rows if sprite sheet
    output_path: str = "pixel_output.png"
):
    """
    Generate pixel art by having Gemini create at higher res, 
    with explicit pixel-art style instructions baked into the prompt.
    """
    cols, rows = sheet_layout
    w, h = target_size
    
    # Pixel art style prefix — prepend to every pixel-mode prompt
    pixel_prefix = (
        "Create pixel art in a retro JRPG style. "
        "The art must have hard pixel edges with NO anti-aliasing and NO smoothing. "
        "Use a limited color palette of 16-32 colors maximum. "
        "Outlines should be 1 pixel wide using a darker shade of the fill color, never pure black. "
        "Shading uses flat tones with optional dithering, no gradients. "
        "Light source is from the upper-left. "
        "Characters are chibi proportioned (2-3 heads tall) with large expressive eyes. "
        "The background must be a single flat color or transparent. "
    )
    
    full_prompt = pixel_prefix + prompt
    
    # Generate at 1K, then the user/engine can downscale
    contents = list(reference_images) + [full_prompt]
    
    response = client.models.generate_content(
        model="gemini-3.1-flash-image-preview",
        contents=contents,
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE"],
            image_config=types.ImageConfig(
                aspect_ratio="1:1",
                image_size="1K",
            ),
        ),
    )
    
    for part in response.parts:
        if part.inline_data is not None:
            img = part.as_image()
            img.save(output_path)
            return img
    
    raise RuntimeError("No image returned")
```

### Upscaling and Refinement

After initial generation, use Gemini Pro to upscale and refine hero assets:

```python
def upscale_and_refine(
    image: Image.Image,
    refinement_notes: str,
    output_path: str
):
    """Use Gemini Pro to upscale a generated asset to 4K with refinements."""
    prompt = (
        f"Upscale this image to high resolution. "
        f"Preserve the exact art style, colors, and composition. "
        f"Sharpen details and clean up any artifacts. "
        f"{refinement_notes}"
    )
    
    response = client.models.generate_content(
        model="gemini-3-pro-image-preview",
        contents=[image, prompt],
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE"],
            image_config=types.ImageConfig(
                aspect_ratio="1:1",  # Match original
                image_size="4K",
            ),
        ),
    )
    
    for part in response.parts:
        if part.inline_data is not None:
            img = part.as_image()
            img.save(output_path)
            return img
```

---

## 8. Prompt Templates

Claude Code should use these templates as the Planner's starting framework, then the Stylist fills in the style-specific details.

### Template: Dialogue Portrait (Mode B — Mob Psycho 100 Style)

```
GENERATION PROMPT STRUCTURE:
[Reference images attached: existing Rikizo portrait, existing character references]

"A character portrait in the style of Mob Psycho 100 anime for {character_name} 
from a JRPG, showing a {expression} expression in {register} register.

Character details: {hair_description}, wearing {clothing_description}. 
{distinguishing_features}. {body_type_description — lanky, average, stocky}.

REGISTER: {register — choose one:}
IF 日常 (everyday/calm):
  - Simple face: small dot or dash eyes, minimal nose, small mouth
  - Minimal detail, relaxed posture
  - Flat coloring with one shadow tone, muted everyday palette
  - Thin, slightly loose black outlines with hand-drawn quality
IF 覚醒 (awakening/intense):
  - Expressive face: large dramatic eyes, wide mouth, exaggerated features
  - Dynamic energy, dramatic posture shift
  - Vivid colors, dramatic rim lighting, atmospheric effects
  - Line weight varies — thicker emphasis lines on key features

Framing: Bust-up composition (head and shoulders), centered in frame. 
The character faces slightly left of center at a 3/4 angle.

Art style: Mob Psycho 100 / ONE style — intentionally SIMPLE character 
designs, NOT hyper-detailed anime. Thin slightly uneven linework in black. 
Lanky proportions. The charm is in the simplicity. Flat colors, minimal 
shading in calm register. Characters should look like real people drawn 
with deliberate economy of line.

Background: Pure white (#FFFFFF) or very light grey, no elements.

Color palette: {specific_hex_colors_from_style_dna}

This portrait must be visually consistent with the attached reference images 
— same art style, same line weight, same level of simplicity.

Do NOT include: watermarks, signatures, text, hyper-detailed rendering, 
realistic proportions, thick clean vector outlines, or any background elements.
Do NOT make the character look like generic polished anime — maintain the 
intentional simplicity of ONE's character design philosophy.
Do NOT reference or replicate any existing Mob Psycho 100 character — this must 
be a wholly original character design. The art STYLE is inspired by ONE's 
approach, but the character's face, hair, clothing, and silhouette must not 
resemble Mob, Reigen, Dimple, Ritsu, Teru, or any other copyrighted character."
```

### Template: Location Background (Mode B — Mob Psycho 100 Style)

```
"A wide-angle illustration of {location_name} from a JRPG set in contemporary 
Japan, during {season} {time_of_day}.

Environment details: {detailed_description_of_the_space}. 
Japanese signage is visible reading {accurate_japanese_text}. 
{seasonal_details}.

Composition: Wide establishing shot, 16:9 aspect ratio. Depth is conveyed 
through 3 layers — foreground elements slightly out of focus, sharp midground 
where characters would stand, detailed background extending to a vanishing point.

Lighting: {time_of_day_lighting}. Warm color temperature. Soft shadows from 
{light_direction}. {atmospheric_effects}.

Art style: Mob Psycho 100 background style — MORE detailed and semi-realistic 
than the characters. Painterly touches, visible brushwork, richer textures. 
This contrast between detailed backgrounds and simple characters is a hallmark 
of the MP100 aesthetic. Use muted, naturalistic colors for everyday locations. 
The environment should feel grounded and lived-in.

REGISTER: {register}
IF 日常: Warm, inviting, everyday Japan. Muted but pleasant palette.
IF 覚醒: Dramatic lighting shifts, color washes, abstract elements creeping 
in. Reality bending at the edges. 忘れ人 corruption if applicable.

This background must be designed so that character sprites/portraits can be 
composited on top of it — avoid placing focal elements dead center where 
characters will stand.

Do NOT include: characters or people, watermarks, realistic photo textures.
DO maintain the painterly-detailed-background vs simple-character contrast."
```

### Template: Character Sprite Sheet (Mode A — Pixel)

```
"A pixel art character sprite sheet for {character_name} from a retro-style JRPG.

Character: {brief_visual_description}. Chibi proportions, approximately 2.5 heads 
tall. {key_identifiers_like_dictionary_or_notebook}.

Layout: 6 columns × 4 rows grid on a PURE SOLID WHITE (#FFFFFF) background.
Each cell is 204×293 pixels, making the full sheet 1224×1172.
- Row 1: Facing down (toward viewer) — idle, walk 1, walk 2, walk 3, walk 4, walk 5
- Row 2: Facing left — idle, walk 1, walk 2, walk 3, walk 4, walk 5
- Row 3: Facing right — idle, walk 1, walk 2, walk 3, walk 4, walk 5
- Row 4: Facing up (away from viewer) — idle, walk 1, walk 2, walk 3, walk 4, walk 5

NOTE: This sprite is processed through the dual-render alpha extraction pipeline
(Section 6). Generate once on white, once on black, then extract true RGBA transparency.
Do NOT use magenta chroma-key.

Each sprite cell is exactly the same size with clear grid separation.

Pixel art rules: Hard pixel edges, NO anti-aliasing, NO smoothing. Limited 
16-color palette. 1-pixel outlines in a darker shade of the fill. Flat shading 
with upper-left light source. Visible pixel grid structure.

Match the attached reference sprites exactly in style, palette warmth, and 
proportional approach."
```

### Template: UI Element (Mode B — Vector)

```
"A JRPG dialogue box UI element for Rikizo, a Japanese-language JRPG.

Design: A semi-transparent panel with {border_style} borders. The panel has 
rounded corners and sits at the bottom of a 16:9 screen, occupying the lower 
25% of the frame height.

Layout zones:
- Left side: Square portrait frame (for character bust-up) with {frame_style} border
- Right side: Text area with clean space for 3-4 lines of dialogue
- Bottom-right: Small indicator arrow/triangle showing "next" prompt
- Top-left of text area: Character name plate with {name_plate_style}

Decorative touches: {japanese_cultural_motifs} — subtle, not distracting.
Small Japanese characters ({specific_kanji_or_hiragana}) as decorative elements 
in the border corners.

Colors: {palette_from_style_dna}. The panel must be semi-transparent so the 
game background shows through.

This is a UI template — it must be clean enough to composite over any background 
with text rendered on top."
```

### Template: Item Icon (Mode A — Pixel)

```
"A grid of pixel art item icons for Rikizo, a Japanese-language JRPG with real combat.

Layout: 8 columns × 4 rows of square icons on a transparent or 
{background_color} background. Each icon occupies one grid cell.

Items (left to right, top to bottom):
Row 1: {item_1}, {item_2}, {item_3}, {item_4}, {item_5}, {item_6}, {item_7}, {item_8}
Row 2: {item_9}, ...
Row 3: ...
Row 4: ...

Each icon should be immediately recognizable at small size. Use bold shapes 
and 3-4 colors per icon. 1-pixel dark outline. Slight highlight on upper-left 
edge to suggest depth.

Common items for this game include: pocket dictionary, wooden sword, health potion,
bento box, train pass (Suica card), gold coin (金), water bottle (水), onigiri,
school bag, calligraphy brush, omamori charm, 忘れ人 shard (dark crystal fragment),
key item glow orb, festival fan (uchiwa), daruma doll, shield talisman, magic scroll,
monster drop (shadow essence), chopsticks, green tea bottle.

Style must match the attached pixel art references exactly."
```

### Template: 忘れ人 Minion (Mode A — Pixel)

```
"A pixel art enemy sprite for a 忘れ人 (Wasure-bito) minion from a JRPG. 
These are eldritch creatures born from mass forgetting — reality-corruption 
entities that appear where the world is rebuilding.

Design: {minion_type_description}. The creature should look WRONG — like a 
glitch in reality. Combine elements of: missing/corrupted features (a face 
with no eyes, limbs that trail into static), visual noise (pixel corruption, 
color channel separation), and unsettling beauty (elegant despite being broken).

Color palette: Desaturated base with accent flashes of {corruption_color — 
typically deep purple #2D1B69, void black #0A0A0F, static white #E8E8E8, 
and a single bright accent like toxic cyan #00FFCC or warning red #FF2040}.

Pixel art rules: Hard pixel edges, NO anti-aliasing. But intentionally break 
the pixel grid in small areas to suggest corruption — a few pixels that seem 
'wrong' in placement or color. 1-pixel outlines in dark purple, not black.

Layout: Single sprite or 4-frame idle animation sheet.

These enemies must feel unsettling but not gratuitously horrific — think 
Undertale's Amalgamates or Omori's Something. Creepy, not gory."
```

### Template: 忘れ人 Boss Concept (Mode B — Vector)

```
"Full concept art of a 忘れ人 (Wasure-bito) boss for a JRPG. The 忘れ人 are 
eldritch horrors that consumed the world's memory — ancient beings that erased 
everything and everyone.

This boss is {boss_name}: {detailed_description}.

Design philosophy: Mix cosmic horror with Japanese yokai aesthetics. The creature 
should be massive, imposing, and beautiful in a deeply wrong way. Think: 
a Shinto deity that has been inverted, or a constellation that learned to hate.

Key visual elements:
- {signature_feature — e.g., "multiple overlapping faces that phase in and out"}
- {body_structure — e.g., "flowing robes that dissolve into void at the edges"}
- {corruption_markers — e.g., "kanji characters float around it, but they're 
  garbled and unreadable — language itself breaking down"}
- {scale_indicator — e.g., "towers over buildings, partially transparent"}

Color palette: Deep void blacks and purples as base. Accent with {boss_specific_color}.
Areas of the body should appear to dissolve into static or void. 
Corrupted kanji or broken text fragments orbit the creature.

Art style: Mob Psycho 100 覚醒 (awakening) register — this is where the style 
goes FULL INTENSITY. Think the art during Mob's ??? explosions or Mogami arc. 
Dramatic line weight variation, vivid color explosions, atmospheric energy effects.
The boss should feel like it belongs in the same art world but is fundamentally 
alien within it — like an enemy from MP100's psychic battles rendered as cosmic horror.

Background: The void — pure black with subtle star-like particles or static noise.

This is a reference sheet: include front view and key detail callouts."
```

### Template: The Void (Mode B — Vector Background)

```
"A wide-angle illustration of THE VOID from a JRPG — the empty space beyond 
the edge of the rebuilt world. This is what the player sees when they try to 
leave the game area before enough vocabulary has been learned to materialize 
more of the world.

The void is NOT just a black screen. It should feel like an absence — like 
reality was surgically removed. Specifically:

- The ground the player stands on simply ENDS — a clean edge, like torn paper 
  or a broken tile map, revealing nothing beneath.
- Beyond the edge: {void_style — choose one:}
  * Deep black with very faint, distant static/noise — like a dead TV channel
  * An unsettling gradient from dark purple (#0A0015) to pure black
  * Subtle suggestion of shapes that ALMOST form — buildings, trees — but 
    never quite resolve, like memories trying and failing to return
- The sky (if any) transitions from the normal game sky into the void 
  seamlessly — blue fading to nothing.
- {atmospheric_detail — e.g., "A single distant light pulses slowly, like 
  something watching from impossibly far away."}

Mood: Lonely, eerie, melancholy. Not aggressive — the void isn't hostile, 
it's just EMPTY. The horror is existential, not visceral.

This background must work with the game's warm art style — the contrast 
between the cozy rebuilt world and the void IS the emotional impact.

Aspect ratio 16:9. The left third of the image shows the edge of the normal 
world (warm colors, lit), transitioning to void on the right."
```

### Template: Corrupted Zone / 忘れ人 Domain (Mode A — Pixel Tileset)

```
"A pixel art tile set for a CORRUPTED ZONE in a JRPG — an area where the 
忘れ人 (Wasure-bito, memory-erasing eldritch beings) have influence.

These tiles are DISTORTED versions of normal environment tiles. Take a 
{base_environment — school, town, shrine} and corrupt it:

Corruption effects (use 2-3 per tile):
- Color channel separation: red/blue offset by 1-2 pixels
- Missing sections: parts of walls/floors replaced with void black
- Inverted/wrong colors: grass is purple, sky is dark green
- Geometric impossibility: stairs that loop, doors that open to nothing
- Static bands: horizontal noise lines across tiles
- Garbled text: where Japanese signs should be, the text is scrambled/broken

Grid: 16×16 or 32×32 tiles on a 256×256 sheet. Include:
- Corrupted floor (3-4 variants with increasing distortion)
- Corrupted walls
- Void holes (sections of pure black)  
- Transition tiles (normal → corrupted boundary)
- Corrupted decorative objects (broken furniture, glitched plants)

Palette: Start from the base location's normal palette, then shift: 
desaturate 40%, add purple/cyan tint, inject void-black and static-white accents.

Must still read as pixel art with hard edges — the corruption should feel 
deliberate and designed, not like actual rendering errors."
```

---

## 9. Quality Gate & Critic Rubric

The Critic agent evaluates every candidate image before accepting it. Claude Code must perform this evaluation by analyzing the generated image (re-ingesting it into a VLM call) against the original request.

### Scoring Dimensions

| Dimension | Score 5 (Ship it) | Score 4 (Minor fix) | Score 3 (Needs work) | Score 2 (Major issues) | Score 1 (Reject) |
|---|---|---|---|---|---|
| **Faithfulness** | Every requested element present and correct. Japanese text accurate. Character identity perfect. | 1 minor inaccuracy (e.g., slightly wrong accessory color) | Some elements missing or clearly wrong | Major departures from request | Barely related to the prompt |
| **Style Consistency** | Indistinguishable from existing reference assets | Same style family, minor deviations in line weight or palette | Recognizably similar but noticeable differences | Different style that clashes with references | Completely different art style |
| **Readability** | Instant visual clarity. Focal point obvious. Text legible. Clean composition. | Clear at a glance, 1-2 minor layout issues | Takes a moment to parse; some clutter | Confusing layout, overlapping elements | Incomprehensible |
| **Usefulness** | Ready to drop into the game engine with no editing | Needs minor cropping or color adjustment | Needs moderate post-processing | Needs significant rework | Unusable |
| **Originality** | Wholly original design — no resemblance to any existing copyrighted character | Original but shares 1 minor trait with a known character (e.g., similar hair color — easy fix) | Echoes a known character in 2+ ways (hairstyle + outfit combo) — needs redesign | Clearly evokes a specific copyrighted character | Recognizable as a specific MP100 or other anime character — IMMEDIATE REJECT |

**Originality scoring applies to character assets only** (portraits, full-body, sprites, enemy concepts). It does not apply to backgrounds, UI elements, item icons, or tilesets.

**Automatic rejection:** Any character asset scoring Originality ≤ 2 is rejected regardless of all other scores. The Critic must specify which copyrighted character it resembles and provide explicit differentiation instructions for the next round (e.g., "Hair too similar to Mob's bowl cut — change to spiky/asymmetric/tied back").

### Minimum Acceptance Thresholds

| Asset Type | Faithfulness | Style Consistency | Readability | Usefulness | Originality |
|---|---|---|---|---|---|
| Hero portrait (Pro) | ≥ 4 | ≥ 4 | ≥ 4 | ≥ 4 | ≥ 4 |
| Expression variant (Flash) | ≥ 4 | ≥ 5 | ≥ 4 | ≥ 4 | ≥ 4 |
| Scene CG (Pro) | ≥ 4 | ≥ 4 | ≥ 4 | ≥ 3 | — |
| Location background | ≥ 3 | ≥ 4 | ≥ 4 | ≥ 3 | — |
| Sprite sheet (Flash) | ≥ 4 | ≥ 4 | ≥ 4 | ≥ 4 | ≥ 4 |
| UI element (Flash) | ≥ 3 | ≥ 4 | ≥ 5 | ≥ 4 | — |
| Item icons (Flash) | ≥ 3 | ≥ 4 | ≥ 4 | ≥ 4 | — |
| NPC portrait/sprite | ≥ 4 | ≥ 4 | ≥ 4 | ≥ 4 | ≥ 4 |
| Enemy concept art | ≥ 4 | ≥ 4 | ≥ 4 | ≥ 3 | ≥ 4 |

### Critic Feedback Format

When a candidate fails, the Critic produces structured feedback:

```json
{
  "round": 1,
  "scores": {"faithfulness": 3, "style_consistency": 4, "readability": 4, "usefulness": 3, "originality": 5},
  "passed": false,
  "issues": [
    "Rikizo's hair is too light — should be solid black, not dark brown",
    "The pocket dictionary is missing from his shirt pocket",
    "Background is not pure white — has a slight blue gradient"
  ],
  "updated_prompt_additions": [
    "Ensure the character has solid BLACK hair (#1A1A1A), not brown.",
    "The character MUST have a small red pocket dictionary visible in the left breast pocket of his white shirt.",
    "Background must be PURE WHITE (#FFFFFF) with absolutely no gradient or color variation."
  ]
}
```

### Japanese Text Verification

For any asset containing Japanese text, Claude Code must verify accuracy before generation AND after generation:

```python
COMMON_GAME_TEXT = {
    "konbini_sign": "コンビニ",
    "station_sign": "駅",  # eki
    "school": "学校",       # gakkou
    "classroom": "教室",    # kyoushitsu
    "welcome": "ようこそ",
    "lets_study": "勉強しましょう",
    "good_morning": "おはようございます",
    "thank_you": "ありがとうございます",
    "train_exit": "出口",   # deguchi
    "entrance": "入口",     # iriguchi
}
```

After generation, if the image contains visible Japanese text, re-ingest the image and ask the VLM: "Read all Japanese text visible in this image and verify it is correctly written." If errors are found, flag for regeneration.

---

## 10. Batch Production Workflow

For producing asset sets efficiently (e.g., all expression variants for a character, all tiles for a location).

### Batch Orchestration

```python
def batch_generate_character(character: dict, reference_images: list):
    """
    Full character asset pipeline:
    1. Hero portrait (Pro) → base identity
    2. Expression variants (Flash) → via multi-turn editing from hero
    3. Full-body art (Pro) → using hero as reference
    4. Sprite sheet (Flash) → using hero + full-body as reference
    5. Battle sprites (Flash) → using sprite sheet as reference
    """
    results = {}
    
    # Step 1: Hero portrait establishes the character's visual identity
    hero = run_pipeline(
        request=f"Dialogue portrait of {character['name']}, neutral expression",
        asset_type="dialogue_portrait",
        references=reference_images,
        model="gemini-3-pro-image-preview",
    )
    results["hero_portrait"] = hero
    
    # Step 2: Expression variants branch from the hero — DUAL REGISTER
    calm_expressions = ["mild smile", "mild concern", "thinking", "slightly embarrassed"]
    intense_expressions = ["shocked", "angry", "determined/battle-ready", "terrified", "laughing hard"]
    
    results["calm_expressions"] = generate_expression_variants(
        base_portrait=hero,
        character_name=character["name"],
        expressions=calm_expressions,
        output_dir=f"./output/characters/{character['name']}/calm/"
    )
    
    # Generate intense register base first, then variants from that
    intense_hero = run_pipeline(
        request=f"Dialogue portrait of {character['name']}, intense/awakened register, shocked expression",
        asset_type="dialogue_portrait",
        references=[hero] + reference_images,
        model="gemini-3-pro-image-preview",
    )
    results["intense_hero"] = intense_hero
    
    results["intense_expressions"] = generate_expression_variants(
        base_portrait=intense_hero,
        character_name=character["name"],
        expressions=intense_expressions,
        output_dir=f"./output/characters/{character['name']}/intense/"
    )
    
    # Step 3: Full-body uses both register heroes as reference
    full_body = run_pipeline(
        request=f"Full-body standing art of {character['name']}",
        asset_type="full_body_character",
        references=[hero, intense_hero] + reference_images,
        model="gemini-3-pro-image-preview",
    )
    results["full_body"] = full_body
    
    # Step 4: Sprite sheet uses hero + full_body for identity (6 frames × 4 directions)
    # Route through dual-render alpha extraction pipeline (Section 6) for true transparency
    sprites = run_pipeline(
        request=f"Overworld sprite sheet for {character['name']}, 4-direction walk cycle, 6 frames per direction",
        asset_type="character_sprite_sheet",
        references=[hero, full_body] + reference_images,
        model="gemini-3.1-flash-image-preview",
        transparent=True,  # Triggers dual-render alpha matting
    )
    results["sprite_sheet"] = sprites
    
    return results
```

### Production Order

For maximum consistency, generate assets in this order:

1. **Rikizo hero portrait (日常 calm register)** (Pro) — This is the style anchor for everything. Simple MP100 face, dot eyes, relaxed.
2. **Rikizo hero portrait (覚醒 intense register)** (Pro) — Same character, explosive expression. Proves the dual-register system works.
3. **Rikizo calm expression set** (Flash multi-turn) — neutral, mild smile, mild concern, thinking.
4. **Rikizo intense expression set** (Flash multi-turn) — shocked, angry, determined, battle-ready.
5. **Rikizo full-body** (Pro) — Establishes lanky MP100 proportions and outfit.
6. **Rikizo sprite sheet** (Flash) — Proves pixel-mode matches MP100 identity.
7. **First location background (Rikizo's house interior)** — Establishes the MP100-style detailed-background aesthetic.
8. **The Void background** (Pro) — Critical atmosphere piece. What the player sees Day 1 looking outside.
9. **UI dialogue box** — Establishes UI art style, must work with MP100 portraits.
10. **Mom & Dad** — First NPCs. Each follows steps 1–6 using Rikizo's assets as additional references.
11. **First enemy concept (忘れ人 minion)** (Pro) — Establishes the 覚醒 register for enemies.
12. **Remaining characters, locations, enemies, items, CGs** — Bulk production phase, following the lesson-unlock order (N5.1 → N5.2 → etc.).

---

## 11. File Organization

```
project/
├── references/                    # YOUR existing PNGs go here
│   ├── characters/
│   │   ├── rikizo_pixel.png
│   │   ├── rikizo_vector.png
│   │   └── ...
│   ├── maps/
│   │   └── first_map.png
│   └── style/
│       └── style_dna.json        # Auto-generated style analysis
│
├── output/                        # ALL generated assets land here
│   │
│   ├── shared/                    # Assets used across all game days
│   │   └── sprites/
│   │       └── me_sheet.png       # Player sprite sheet (1224×1172, magenta BG)
│   │
│   ├── data/N5/game/              # Game days organized by JLPT level
│   │   ├── day-01-home/           # Unlocked by lesson N5.1
│   │   │   ├── day.json           # Day configuration (NPC positions, objects, dialogue)
│   │   │   ├── map.png            # Full pixel-art map background
│   │   │   ├── collision.png      # Collision mask (red=wall, blue=interactive)
│   │   │   ├── convo_bg.png       # Conversation background (Mode B)
│   │   │   ├── mom_sprite.png     # NPC map sprite (single frame, no sheet)
│   │   │   ├── dad_sprite.png     # NPC map sprite
│   │   │   ├── mom_portrait.png   # Conversation portrait (Mode B, MP100 style)
│   │   │   ├── dad_portrait.png   # Conversation portrait
│   │   │   └── me_portrait.png    # Rikizo's conversation portrait for this day
│   │   ├── day-02-elements/       # Unlocked by lesson N5.2
│   │   │   ├── day.json
│   │   │   ├── map.png            # House + yard, tree, sun, sparse outside
│   │   │   ├── collision.png
│   │   │   └── ...
│   │   └── day-03-.../
│   │
│   ├── characters/                # Master character reference sheets
│   │   ├── rikizo/
│   │   │   ├── portrait_calm_neutral.png      # 日常 register
│   │   │   ├── portrait_calm_smile.png
│   │   │   ├── portrait_calm_concern.png
│   │   │   ├── portrait_calm_thinking.png
│   │   │   ├── portrait_intense_shocked.png   # 覚醒 register
│   │   │   ├── portrait_intense_angry.png
│   │   │   ├── portrait_intense_determined.png
│   │   │   ├── portrait_intense_battle.png
│   │   │   ├── full_body.png
│   │   │   ├── sprite_sheet.png
│   │   │   └── battle_sprites.png
│   │   ├── mom/
│   │   ├── dad/
│   │   └── sensei_tanaka/
│   │
│   ├── enemies/
│   │   ├── minions/
│   │   │   ├── shadow_wisp_sprite.png
│   │   │   ├── memory_fragment_sprite.png
│   │   │   └── ...
│   │   └── bosses/
│   │       └── wasure_bito_01_concept.png
│   │
│   ├── locations/                 # Master location backgrounds (Mode B)
│   │   ├── house_interior.png
│   │   ├── void_edge.png
│   │   ├── school_classroom.png
│   │   └── ...
│   │
│   ├── ui/
│   │   ├── dialogue_box.png
│   │   ├── menu_background.png
│   │   ├── title_screen.png
│   │   └── battle_ui.png
│   │
│   ├── items/
│   │   └── item_icons.png
│   │
│   ├── effects/
│   │   └── combat_effects.png
│   │
│   └── tiles/
│       ├── house_tileset.png
│       ├── town_tileset.png
│       ├── school_tileset.png
│       └── corrupted_tileset.png
│
├── logs/                          # Generation logs for each asset
│   └── {asset_name}_log.json     # Contains all prompts, scores, rounds
│
├── PaperBanana.md                 # Framework reference
├── gemini-3-image-api-guide.md    # API reference
└── RikizoArtPipeline.md           # THIS FILE
```

---

## Quick-Start Command for Claude Code

When you open Claude Code with this project, say:

> "Read RikizoArtPipeline.md, PaperBanana.md, and gemini-3-image-api-guide.md. Then analyze my reference PNGs in the references/ folder and generate a style_dna.json. Start with Rikizo's hero portrait."

Claude Code will:
1. Read all three instruction files — **RikizoArtPipeline.md is the primary authority** for all art asset work; PaperBanana.md is background framework context; gemini-3-image-api-guide.md is the API reference
2. **NOT read CLAUDE.md** for art tasks — that file governs lesson/learning content only (see scope delimiter at top of this file)
3. Catalog and analyze existing PNGs in `references/`
4. Run the Style DNA Analysis (Section 3, Step 2) and save `references/style_dna.json`
5. Execute the 5-agent pipeline (Section 4) for Rikizo's hero portrait:
   - AGENT 1 (Retriever): Build Asset Brief, select references
   - AGENT 2 (Planner): Build Figure Plan with character details and originality check
   - AGENT 3 (Stylist): Compose final Gemini prompt with style DNA and register rules
   - AGENT 4 (Visualizer): Call Gemini API, handle dual-render transparency
   - AGENT 5 (Critic): Score candidates, iterate if needed, approve final
6. Post-process (resize, verify dimensions, verify transparency)
7. Save to `output/characters/rikizo/portrait_calm_neutral.png`
8. Copy to `references/vector_portraits/` as the founding reference
9. Log to `logs/generation_log.json`
10. Move to the next asset in the production order (Section 10)

**For subsequent assets,** just say what you need:

> "Generate Mom's calm portrait"
> "Make the Day 1 house interior background"
> "Run the batch character workflow for Sensei Tanaka"
> "Generate 忘れ人 minion enemy sprites"

Claude Code will determine the asset type, select the right mode/model/template, and run the full pipeline automatically.

**Important file routing:**
| Task | Governing document | Pipeline |
|---|---|---|
| Art assets (sprites, portraits, backgrounds, tilesets, UI, enemies) | `RikizoArtPipeline.md` | 5-agent: Retriever → Planner → Stylist → Visualizer → Critic |
| Lesson content (JSON lessons, reviews, compose, stories, glossary) | `CLAUDE.md` | 4-agent: PM → CB → QA → CR |
| Mixed task (e.g. "create Day 3 with assets and lesson") | Both — split into two subtasks | Art pipeline first (assets), then lesson pipeline (content) |

---

## Reference

- Zhu, D. et al. (2026). *PaperBanana: Automating Academic Illustration for AI Scientists.* arXiv:2601.23265v1.
- Google. *Nano Banana Image Generation — Gemini API Documentation.*
