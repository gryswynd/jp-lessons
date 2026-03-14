extends Node2D
## Main scene controller. Loads day.json data, creates map, NPCs, objects,
## and wires up the player interaction system.
## This is the root script for main.tscn.

const NPC_SCENE := preload("res://scenes/npc.tscn")
const OBJECT_SCENE := preload("res://scenes/interactive_object.tscn")

# Paths to data files — adjust these if your directory structure differs.
# The setup script symlinks/copies assets into res://assets/
const DAY_JSON := "res://assets/day-data/day.json"
const GLOSSARY_N5 := "res://assets/data/glossary.N5.json"
const PARTICLES := "res://assets/data/particles.json"
const CHARACTERS := "res://assets/data/characters.json"
const CONJ_RULES := "res://assets/data/conjugation_rules.json"
const COUNTER_RULES := "res://assets/data/counter_rules.json"

@onready var map_sprite: Sprite2D = $Map
@onready var collision_map: Node2D = $CollisionMap
@onready var player: CharacterBody2D = $Player
@onready var camera: Camera2D = $Player/Camera2D
@onready var npcs_container: Node2D = $NPCs
@onready var objects_container: Node2D = $Objects
@onready var dialogue_overlay: CanvasLayer = $DialogueOverlay
@onready var message_popup: Label = $MessagePopup
@onready var interaction_area: Area2D = $Player/InteractionArea

var portrait_map: Dictionary = {}  # speaker → Texture2D


func _ready() -> void:
	# Load supporting data first
	if FileAccess.file_exists(GLOSSARY_N5):
		GameManager.load_glossary(GLOSSARY_N5)
	if FileAccess.file_exists(PARTICLES):
		GameManager.load_particles(PARTICLES)
	if FileAccess.file_exists(CHARACTERS):
		GameManager.load_characters(CHARACTERS)
	if FileAccess.file_exists(CONJ_RULES):
		GameManager.load_conjugation_rules(CONJ_RULES)
	if FileAccess.file_exists(COUNTER_RULES):
		GameManager.load_counter_rules(COUNTER_RULES)
	GameManager.build_surface_index()

	# Load day data
	GameManager.load_day(DAY_JSON)
	_build_world(GameManager.day_data)

	# Wire up signals
	player.interaction_requested.connect(_on_player_interact)
	GameManager.message_shown.connect(_on_message_shown)

	# Hide message popup initially
	message_popup.visible = false


func _build_world(data: Dictionary) -> void:
	# --- Map ---
	var map_path := "res://assets/day-data/" + data["assets"]["map"]
	if ResourceLoader.exists(map_path):
		var map_tex := load(map_path) as Texture2D
		map_sprite.texture = map_tex
		# Anchor top-left (Godot default for Sprite2D is centered)
		map_sprite.centered = false

	# --- Collision Map ---
	var col_path := "res://assets/day-data/" + data["assets"]["collision"]
	if ResourceLoader.exists(col_path):
		var col_tex := load(col_path) as Texture2D
		collision_map.build_from_texture(col_tex)

	# --- Player Start ---
	player.global_position = Vector2(
		data["playerStart"]["x"],
		data["playerStart"]["y"]
	)

	# --- Player Sprite ---
	var sheet_path := "res://assets/sprites/me_sheet.png"
	if ResourceLoader.exists(sheet_path):
		var sheet_tex := load(sheet_path) as Texture2D
		player.get_node("Sprite2D").texture = sheet_tex
		player.get_node("Sprite2D").region_enabled = true
		player.get_node("Sprite2D").region_rect = Rect2(0, 0, 204, 293)
		# Scale to rendered size
		var sx := float(player.RENDER_W) / 204.0
		var sy := float(player.RENDER_H) / 293.0
		player.get_node("Sprite2D").scale = Vector2(sx, sy)
		# Anchor at feet
		player.get_node("Sprite2D").offset = Vector2(0, -293 * 0.5)

	# --- Player conversation portrait ---
	if data.has("meConvoPortrait"):
		var me_portrait_path := "res://assets/day-data/" + data["meConvoPortrait"]
		if ResourceLoader.exists(me_portrait_path):
			portrait_map["りきぞ"] = load(me_portrait_path)

	# --- NPCs ---
	for npc_data in data.get("npcs", []):
		var npc_instance := NPC_SCENE.instantiate()
		npcs_container.add_child(npc_instance)

		var sprite_tex: Texture2D = null
		var portrait_tex: Texture2D = null
		var sprite_path := "res://assets/day-data/" + npc_data.get("sprite", "")
		var portrait_path := "res://assets/day-data/" + npc_data.get("convoPortrait", "")

		if ResourceLoader.exists(sprite_path):
			sprite_tex = load(sprite_path)
		if ResourceLoader.exists(portrait_path):
			portrait_tex = load(portrait_path)
			portrait_map[npc_data["name"]] = portrait_tex

		npc_instance.setup(npc_data, sprite_tex, portrait_tex)

	# --- Interactive Objects ---
	for obj_data in data.get("objects", []):
		var obj_instance := OBJECT_SCENE.instantiate()
		objects_container.add_child(obj_instance)
		obj_instance.setup(obj_data)

	# --- Camera Limits ---
	if map_sprite.texture:
		camera.limit_left = 0
		camera.limit_top = 0
		camera.limit_right = map_sprite.texture.get_width()
		camera.limit_bottom = map_sprite.texture.get_height()

	# --- Dialogue portrait map ---
	dialogue_overlay.set_portrait_map(portrait_map)


func _on_player_interact() -> void:
	if GameManager.in_conversation:
		return

	# Find the closest interactable
	var best_target = null
	var best_dist := 100.0  # max interaction distance

	var facing_point := player.get_facing_point()

	# Check NPCs
	for npc in npcs_container.get_children():
		if not npc is Area2D:
			continue
		var dist := player.global_position.distance_to(npc.global_position)
		if dist < best_dist:
			best_dist = dist
			best_target = npc

	# Check objects (use facing point for directional check)
	for obj in objects_container.get_children():
		if not obj is Area2D:
			continue
		var dist := facing_point.distance_to(obj.global_position)
		if dist < best_dist:
			best_dist = dist
			best_target = obj

	if best_target and best_target.has_method("interact"):
		best_target.interact()


func _on_message_shown(msg) -> void:
	## Show a temporary message popup (3 seconds).
	if msg is Dictionary:
		var jp: String = msg.get("jp", "")
		var en: String = msg.get("en", "")
		message_popup.text = jp + "\n" + en
	elif msg is String:
		message_popup.text = msg
	else:
		return

	message_popup.visible = true

	# Auto-hide after 3 seconds
	await get_tree().create_timer(3.0).timeout
	message_popup.visible = false
