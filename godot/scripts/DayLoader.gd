extends Node2D
## Main scene controller. Loads day.json data, creates map, NPCs, objects,
## and wires up the player interaction system including scripted events.

const NPC_SCENE := preload("res://scenes/npc.tscn")
const OBJECT_SCENE := preload("res://scenes/interactive_object.tscn")

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

var portrait_map: Dictionary = {}
var npc_backgrounds: Dictionary = {}  # npc_name → background key


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
	var map_path := "res://assets/day-data/" + str(data["assets"]["map"])
	if ResourceLoader.exists(map_path):
		var map_tex := load(map_path) as Texture2D
		map_sprite.texture = map_tex
		map_sprite.centered = false

	# --- Collision Map ---
	var col_path := "res://assets/day-data/" + str(data["assets"]["collision"])
	if ResourceLoader.exists(col_path):
		var col_tex := load(col_path) as Texture2D
		collision_map.build_from_texture(col_tex)

	# --- Conversation Backgrounds ---
	var bg_map: Dictionary = data["assets"].get("convoBackgrounds", {})
	for bg_key in bg_map:
		var bg_path := "res://assets/backgrounds/" + str(bg_map[bg_key]).get_file()
		if ResourceLoader.exists(bg_path):
			GameManager.convo_backgrounds[bg_key] = load(bg_path) as Texture2D

	# --- Alt Portraits ---
	var alt_map: Dictionary = data.get("altPortraits", {})
	for alt_key in alt_map:
		var alt_path := "res://assets/day-data/sprites/" + str(alt_map[alt_key]).get_file()
		if ResourceLoader.exists(alt_path):
			GameManager.alt_portraits[alt_key] = load(alt_path) as Texture2D

	# --- Player Start ---
	var start_data: Dictionary = data["playerStart"]
	player.global_position = Vector2(
		float(start_data["x"]),
		float(start_data["y"])
	)

	# --- Player Sprite ---
	var sheet_path := "res://assets/sprites/me_sheet.png"
	if ResourceLoader.exists(sheet_path):
		var sheet_tex := load(sheet_path) as Texture2D
		var player_sprite: Sprite2D = player.get_node("Sprite2D")
		player_sprite.texture = sheet_tex
		player_sprite.region_enabled = true
		player_sprite.region_rect = Rect2(0, 0, 204, 293)
		var sx := 63.0 / 204.0
		var sy := 90.0 / 293.0
		player_sprite.scale = Vector2(sx, sy)
		player_sprite.offset = Vector2(0, -293.0 * 0.5)

	# --- Player conversation portrait ---
	if data.has("meConvoPortrait"):
		var me_portrait_path := "res://assets/day-data/" + str(data["meConvoPortrait"])
		if ResourceLoader.exists(me_portrait_path):
			portrait_map[&"りきぞ"] = load(me_portrait_path)

	# --- NPCs ---
	var npcs_array: Array = data.get("npcs", [])
	for i in range(npcs_array.size()):
		var npc_data: Dictionary = npcs_array[i]
		var npc_instance = NPC_SCENE.instantiate()
		npcs_container.add_child(npc_instance)

		var sprite_tex: Texture2D = null
		var portrait_tex: Texture2D = null
		var sprite_path := "res://assets/day-data/" + str(npc_data.get("sprite", ""))
		var portrait_path := "res://assets/day-data/" + str(npc_data.get("convoPortrait", ""))

		if ResourceLoader.exists(sprite_path):
			sprite_tex = load(sprite_path) as Texture2D
		if ResourceLoader.exists(portrait_path):
			portrait_tex = load(portrait_path) as Texture2D
			portrait_map[npc_data["name"]] = portrait_tex

		# Store per-NPC background key
		if npc_data.has("convoBackground"):
			npc_backgrounds[npc_data["name"]] = npc_data["convoBackground"]

		npc_instance.setup(npc_data, sprite_tex, portrait_tex)

	# --- Interactive Objects ---
	var objects_array: Array = data.get("objects", [])
	for i in range(objects_array.size()):
		var obj_data: Dictionary = objects_array[i]
		var obj_instance = OBJECT_SCENE.instantiate()
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


# --- Interaction Routing ---

func _on_player_interact() -> void:
	if GameManager.in_conversation:
		return

	var best_target = null
	var best_dist := 100.0
	var best_type := ""

	var facing_point: Vector2 = player.get_facing_point()

	# Check NPCs
	for npc in npcs_container.get_children():
		if not (npc is Area2D):
			continue
		var dist: float = player.global_position.distance_to(npc.global_position)
		if dist < best_dist:
			best_dist = dist
			best_target = npc
			best_type = "npc"

	# Check objects (use facing point for directional check)
	for obj in objects_container.get_children():
		if not (obj is Area2D):
			continue
		# Skip disabled doors
		if obj.is_door and GameManager.is_door_disabled(obj.object_name):
			continue
		var dist: float = facing_point.distance_to(obj.global_position)
		if dist < best_dist:
			best_dist = dist
			best_target = obj
			best_type = "object"

	if best_target == null:
		return

	if best_type == "npc":
		_handle_npc_interaction(best_target)
	elif best_type == "object":
		_handle_object_interaction(best_target)


func _handle_npc_interaction(npc) -> void:
	GameManager.inspected[npc.npc_name] = true
	var convo: Array = npc.conversation
	var bg_key: String = npc_backgrounds.get(npc.npc_name, "")
	var options := {"background": bg_key}

	# Post-void one-time conversations
	if GameManager.void_seen and not GameManager.void_asked.has(npc.npc_name):
		GameManager.void_asked[npc.npc_name] = true
		var shocked: Texture2D = GameManager.alt_portraits.get("meShocked")

		if npc.npc_name == "mom":
			convo = [
				{"speaker": "りきぞ", "jp": "お母さん…！", "en": "Mom…!"},
				{"speaker": "りきぞ", "jp": "そとに…なにも…！", "en": "Outside… nothing…!"},
				{"speaker": "mom", "jp": "なに？", "en": "What?"},
				{"speaker": "mom", "jp": "りきぞはいい先生ですよ。", "en": "Rikizo, you're a good teacher."},
				{"speaker": "りきぞ", "jp": "…はい。", "en": "…OK."}
			]
			if shocked:
				options["portrait_overrides"] = {"りきぞ": shocked}
			GameManager.increment_tracker("paranoia", "", 1)

		elif npc.npc_name == "dad":
			convo = [
				{"speaker": "りきぞ", "jp": "お父さん！", "en": "Dad!"},
				{"speaker": "りきぞ", "jp": "そとに…なにもない…！", "en": "Outside… there's nothing…!"},
				{"speaker": "dad", "jp": "ん？", "en": "Hm?"},
				{"speaker": "dad", "jp": "りきぞ、先生ですよ。", "en": "Rikizo, you're a teacher."},
				{"speaker": "りきぞ", "jp": "…はい。", "en": "…OK."}
			]
			if shocked:
				options["portrait_overrides"] = {"りきぞ": shocked}
			GameManager.increment_tracker("paranoia", "", 1)

		GameManager._save()
	else:
		# Normal conversation — increment relationship
		GameManager.increment_tracker("relationships", npc.npc_name, 1)

	GameManager.start_conversation(convo, options)


func _handle_object_interaction(obj) -> void:
	GameManager.inspected[obj.object_name] = true

	if obj.is_door:
		_handle_door(obj)
	elif obj.object_name == "Toilet" and GameManager.is_door_open("Bath_Door"):
		# Dad yells if you use the toilet with the door open
		var angry_dad: Texture2D = GameManager.alt_portraits.get("dadAngry")
		var options := {"background": "living"}
		if angry_dad:
			options["portrait_overrides"] = {"dad": angry_dad}
		GameManager.start_conversation([
			{"speaker": "dad", "jp": "おい！ドアをしめて！", "en": "Hey! Close the door!"},
			{"speaker": "りきぞ", "jp": "す、すみません…！", "en": "S-sorry…!"}
		], options)
		GameManager.increment_tracker("annoyance", "dad", 1)
	elif not obj.message_data.is_empty():
		GameManager.show_message(obj.message_data)


func _handle_door(obj) -> void:
	# Front door: void scene
	if obj.object_name == "Front_Door" and not GameManager.is_door_disabled("Front_Door"):
		GameManager.disable_door("Front_Door")
		var shocked: Texture2D = GameManager.alt_portraits.get("meShocked")
		var options := {
			"background": "void",
			"on_end": func():
				GameManager.doors["Front_Door"]["open"] = false
				obj._update_door_blocker()
				obj._update_label()
				GameManager.void_seen = true
				GameManager.increment_tracker("paranoia", "", 2)
				GameManager._save()
		}
		if shocked:
			options["portrait_overrides"] = {"りきぞ": shocked}
		GameManager.start_conversation([
			{"speaker": "りきぞ", "jp": "え…？", "en": "Huh…?"},
			{"speaker": "りきぞ", "jp": "な…なにもない…！", "en": "Th-there's nothing there…!"},
			{"speaker": "りきぞ", "jp": "なんですか、これ…？！", "en": "What is this…?!"}
		], options)
		return

	# Disabled door — do nothing
	if GameManager.is_door_disabled(obj.object_name):
		return

	# Normal door toggle
	var now_open := GameManager.toggle_door(obj.object_name)
	var status := "opened" if now_open else "closed"
	GameManager.show_message("%s %s." % [obj.object_name, status])
	obj._update_door_blocker()
	obj._update_label()

	# Push player out if door closed on them
	if not now_open:
		_push_player_from_door(obj)


func _push_player_from_door(obj) -> void:
	var door_center := obj.global_position
	var px := player.global_position.x
	var py := player.global_position.y
	var half_w := obj.obj_width * 0.5
	var half_h := obj.obj_height * 0.5

	if px + 12 > door_center.x - half_w and px - 12 < door_center.x + half_w \
		and py + 10 > door_center.y - half_h and py - 20 < door_center.y + half_h:
		# Push to nearest side (above or below)
		if py < door_center.y:
			player.global_position.y = door_center.y - half_h - 21
		else:
			player.global_position.y = door_center.y + half_h + 11


func _on_message_shown(msg) -> void:
	if msg is Dictionary:
		var jp: String = str(msg.get("jp", ""))
		var en: String = str(msg.get("en", ""))
		message_popup.text = jp + "\n" + en
	elif msg is String:
		message_popup.text = msg
	else:
		return

	message_popup.visible = true
	await get_tree().create_timer(3.0).timeout
	message_popup.visible = false
