# Rikizo Game — Godot Port (Phase 1)

## What this is

A proof-of-concept port of Day 01 (House Adventure) from the browser canvas game to Godot 4. Same art, same data, same gameplay — but running in a real game engine.

## What works in Phase 1

- Rikizo walks around the house with 4-direction animated sprite
- Pixel-based collision from `collision.png` (red = walls)
- Camera follows the player with smooth scrolling
- NPC interaction: walk up to Mom or Dad, press Space/Enter to talk
- Full conversation overlay with portraits
- Vocab term tagging in dialogue (tappable words in BBCode)
- Interactive objects: beds, doors, kotatsu, laptop, etc.
- Door open/close with collision toggling
- "???" → name reveal on first inspection
- All data loaded from the existing `day.json` format

## Quick start

### 1. Install Godot 4.3+

Download from [godotengine.org/download](https://godotengine.org/download). It's a single executable — no installer needed.

### 2. Copy assets into the Godot project

From the repo root:

```bash
bash godot/setup_assets.sh
```

This copies your existing PNGs and JSON data files into `godot/assets/` where Godot can find them.

### 3. Open in Godot

- Launch Godot
- Click **Import** → navigate to `godot/project.godot` → **Import & Edit**
- Press **F5** (or the Play ▶ button)

Rikizo should appear in the bedroom. Walk with arrow keys or WASD, interact with Space/Enter.

## Project structure

```
godot/
├── project.godot          # Engine config (viewport 800×600, input mappings)
├── setup_assets.sh        # Copies art from the main repo into assets/
├── .gitignore             # Ignores .godot/ cache and copied assets/
│
├── scripts/
│   ├── GameManager.gd     # Autoload singleton — game state, data, term map
│   ├── Player.gd          # CharacterBody2D — movement, animation, interact signal
│   ├── CollisionMap.gd    # Reads collision.png, generates StaticBody2D walls
│   ├── NPC.gd             # Area2D — proximity detection, conversation trigger
│   ├── InteractiveObject.gd  # Area2D — doors, furniture, message popups
│   ├── DialogueOverlay.gd # CanvasLayer — speech bubble + portrait UI
│   ├── TermProcessor.gd   # BBCode term tagging for RichTextLabel
│   └── DayLoader.gd       # Main scene script — loads day.json, builds world
│
├── scenes/
│   ├── main.tscn          # Root scene (map, player, NPCs, objects, UI)
│   ├── npc.tscn           # Prefab for NPC instances
│   └── interactive_object.tscn  # Prefab for object instances
│
└── assets/                # Created by setup_assets.sh (gitignored)
    ├── day-data/          # day.json, map.png, collision.png, sprites/
    ├── sprites/           # me_sheet.png (player spritesheet)
    └── data/              # glossary, particles, characters, rules JSONs
```

## How it maps to Game.js

| Game.js | Godot equivalent |
|---------|-----------------|
| `canvas` + `ctx.drawImage()` | Sprite2D nodes + Camera2D |
| `requestAnimationFrame(gameLoop)` | `_physics_process(delta)` on Player.gd |
| `game.keys` + `keydown/keyup` | Godot Input system (`Input.is_action_pressed`) |
| Pixel collision from `collision.png` | CollisionMap.gd → StaticBody2D grid |
| `game.doors` state | GameManager.doors dictionary |
| `processGameText()` + surface index | TermProcessor.gd + BBCode `[url]` tags |
| HTML conversation overlay | CanvasLayer with RichTextLabel + TextureRect |
| D-pad touch controls | Not yet implemented (Phase 2) |

## What's next (Phase 2)

- Touch controls (D-pad + interact button) for mobile
- Term modal popup when tapping vocab words
- Animated door open/close
- Smoother camera with limits at map edges
- Web export (.wasm) to run alongside existing curriculum app
