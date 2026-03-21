#!/bin/bash
# Setup script: copies existing art assets into the Godot project
# so you can open the project in the Godot editor and hit Play immediately.
#
# Run from the repo root:  bash godot/setup_assets.sh

GODOT_DIR="godot"
ASSETS_DIR="$GODOT_DIR/assets"

echo "Setting up Godot assets..."

# Clean previous copy
rm -rf "$ASSETS_DIR"

# Create directories
mkdir -p "$ASSETS_DIR/day-data/sprites"
mkdir -p "$ASSETS_DIR/backgrounds"
mkdir -p "$ASSETS_DIR/sprites"
mkdir -p "$ASSETS_DIR/data"

# --- Day 01 assets ---
DAY_SRC="data/N5/game/day-01-home"

echo "  Copying Day 01 data..."
cp "$DAY_SRC/day.json"      "$ASSETS_DIR/day-data/day.json"
cp "$DAY_SRC/map.png"       "$ASSETS_DIR/day-data/map.png"
cp "$DAY_SRC/collision.png" "$ASSETS_DIR/day-data/collision.png"

echo "  Copying Day 01 sprites..."
cp "$DAY_SRC/sprites/mom.png"       "$ASSETS_DIR/day-data/sprites/mom.png"       2>/dev/null
cp "$DAY_SRC/sprites/mom-convo.png" "$ASSETS_DIR/day-data/sprites/mom-convo.png" 2>/dev/null
cp "$DAY_SRC/sprites/dad.png"       "$ASSETS_DIR/day-data/sprites/dad.png"       2>/dev/null
cp "$DAY_SRC/sprites/dad-convo.png" "$ASSETS_DIR/day-data/sprites/dad-convo.png" 2>/dev/null
cp "$DAY_SRC/sprites/me-convo.png"  "$ASSETS_DIR/day-data/sprites/me-convo.png"  2>/dev/null

# --- Conversation backgrounds ---
echo "  Copying conversation backgrounds..."
cp "assets/backgrounds/convo-bg-kitchen.png" "$ASSETS_DIR/backgrounds/" 2>/dev/null
cp "assets/backgrounds/convo-bg-living.png"  "$ASSETS_DIR/backgrounds/" 2>/dev/null
cp "assets/backgrounds/convo-bg-void.png"    "$ASSETS_DIR/backgrounds/" 2>/dev/null

# --- Alt portraits ---
echo "  Copying alt portraits..."
cp "assets/characters/rikizo/rikizo-convo-shocked.png" "$ASSETS_DIR/day-data/sprites/rikizo-convo-shocked.png" 2>/dev/null
cp "assets/characters/taro/taro-convo-angry.png"       "$ASSETS_DIR/day-data/sprites/taro-convo-angry.png"     2>/dev/null

# --- Door sprite ---
echo "  Copying door sprite..."
cp "shared/sprites/door.png" "$ASSETS_DIR/sprites/door.png" 2>/dev/null

# --- Shared player spritesheet ---
echo "  Copying player spritesheet..."
cp "shared/sprites/me_sheet.png" "$ASSETS_DIR/sprites/me_sheet.png"

# --- Glossary & data files ---
echo "  Copying data files..."
cp "data/N5/glossary.N5.json"   "$ASSETS_DIR/data/glossary.N5.json"
cp "shared/particles.json"      "$ASSETS_DIR/data/particles.json"
cp "shared/characters.json"     "$ASSETS_DIR/data/characters.json"
cp "conjugation_rules.json"     "$ASSETS_DIR/data/conjugation_rules.json"
cp "counter_rules.json"         "$ASSETS_DIR/data/counter_rules.json"

echo ""
echo "Done! Assets are in $ASSETS_DIR/"
echo ""
echo "Next steps:"
echo "  1. Download Godot 4.3+ from https://godotengine.org/download"
echo "  2. Open Godot → Import → select godot/project.godot"
echo "  3. Press F5 (or the Play button) to run"
echo ""
echo "Rikizo should appear in the bedroom and you can walk around!"
