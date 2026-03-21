extends Node
## Singleton autoload — holds global game state and data references.
## Equivalent to the `game` state object and `termMap` from Game.js.

# --- Signals ---
signal conversation_started(conversation_data: Array, options: Dictionary)
signal conversation_ended
signal message_shown(message_data)
signal day_loaded(day_data: Dictionary)

# --- Game State ---
var in_conversation := false
var inspected: Dictionary = {}  # name → true
var doors: Dictionary = {}  # door_name → { "open": bool, "disabled": bool }
var void_seen := false
var void_asked: Dictionary = {}  # npc_name → true

# --- Tracking ---
var trackers := {
	"paranoia": 0,
	"relationships": {},
	"annoyance": {}
}

# --- Data ---
var day_data: Dictionary = {}
var term_map: Dictionary = {}  # id → entry dict
var glossary_entries: Array = []
var particles: Array = []
var characters: Array = []
var conjugation_rules: Dictionary = {}
var counter_rules: Dictionary = {}

# --- Loaded Assets ---
var convo_backgrounds: Dictionary = {}  # key → Texture2D
var alt_portraits: Dictionary = {}  # key → Texture2D

# Surface index for text processing (surface string → term id)
var _surface_index: Dictionary = {}

# --- Save path ---
const SAVE_PATH := "user://save_data.json"


func _ready() -> void:
	_load_save()


func load_day(day_json_path: String) -> void:
	## Load and parse a day.json file, then emit day_loaded.
	var file := FileAccess.open(day_json_path, FileAccess.READ)
	if not file:
		push_error("Cannot open day file: %s" % day_json_path)
		return
	var json_text := file.get_as_text()
	file.close()

	var json := JSON.new()
	var err := json.parse(json_text)
	if err != OK:
		push_error("JSON parse error in %s: %s" % [day_json_path, json.get_error_message()])
		return

	day_data = json.data
	_init_doors()
	day_loaded.emit(day_data)


func load_glossary(glossary_path: String) -> void:
	## Load a glossary JSON and merge entries into term_map.
	var data := _read_json(glossary_path)
	if data.has("entries"):
		for entry in data["entries"]:
			term_map[entry["id"]] = entry


func load_particles(particles_path: String) -> void:
	## Load particles.json and merge into term_map.
	var data := _read_json(particles_path)
	if data.has("particles"):
		for p in data["particles"]:
			term_map[p["id"]] = {
				"id": p["id"],
				"surface": p.get("particle", ""),
				"reading": p.get("reading", ""),
				"meaning": p.get("role", ""),
				"notes": p.get("explanation", ""),
				"type": "particle"
			}


func load_characters(characters_path: String) -> void:
	## Load characters.json and merge into term_map.
	var data := _read_json(characters_path)
	if data.has("characters"):
		for c in data["characters"]:
			var entry := {}
			for key in c:
				entry[key] = c[key]
			entry["type"] = "character"
			term_map[c["id"]] = entry


func load_conjugation_rules(path: String) -> void:
	conjugation_rules = _read_json(path)


func load_counter_rules(path: String) -> void:
	counter_rules = _read_json(path)


func build_surface_index() -> void:
	## Build a lookup: surface string → term ID, for text processing.
	_surface_index.clear()
	for id in term_map:
		var entry: Dictionary = term_map[id]
		if entry.has("surface") and entry["surface"] != "":
			_surface_index[entry["surface"]] = id


func get_surface_index() -> Dictionary:
	if _surface_index.is_empty():
		build_surface_index()
	return _surface_index


func lookup_term(id: String) -> Dictionary:
	return term_map.get(id, {})


# --- Door State ---

func _init_doors() -> void:
	doors.clear()
	if day_data.has("objects"):
		for obj in day_data["objects"]:
			if obj.get("isDoor", false):
				doors[obj["name"]] = {"open": false, "disabled": false}


func toggle_door(door_name: String) -> bool:
	## Toggle door open/closed. Returns the new state.
	if doors.has(door_name):
		doors[door_name]["open"] = not doors[door_name]["open"]
		return doors[door_name]["open"]
	return false


func is_door_open(door_name: String) -> bool:
	if doors.has(door_name):
		return doors[door_name]["open"]
	return false


func is_door_disabled(door_name: String) -> bool:
	if doors.has(door_name):
		return doors[door_name].get("disabled", false)
	return false


func disable_door(door_name: String) -> void:
	if doors.has(door_name):
		doors[door_name]["disabled"] = true


# --- Conversation ---

func start_conversation(conversation: Array, options: Dictionary = {}) -> void:
	in_conversation = true
	conversation_started.emit(conversation, options)


func end_conversation() -> void:
	in_conversation = false
	conversation_ended.emit()


func show_message(msg) -> void:
	message_shown.emit(msg)


# --- Tracking ---

func increment_tracker(category: String, key: String = "", delta: int = 1) -> void:
	if key == "":
		# Top-level tracker (e.g. paranoia)
		trackers[category] = trackers.get(category, 0) + delta
	else:
		# Nested tracker (e.g. relationships.mom)
		if not trackers.has(category):
			trackers[category] = {}
		trackers[category][key] = trackers[category].get(key, 0) + delta
	_save()


func get_tracker(category: String, key: String = "") -> int:
	if key == "":
		return trackers.get(category, 0)
	if trackers.has(category):
		return trackers[category].get(key, 0)
	return 0


# --- Save / Load ---

func _save() -> void:
	var save_data := {
		"trackers": trackers,
		"void_seen": void_seen,
		"void_asked": void_asked
	}
	var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file:
		file.store_string(JSON.stringify(save_data))
		file.close()


func _load_save() -> void:
	if not FileAccess.file_exists(SAVE_PATH):
		return
	var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if not file:
		return
	var json := JSON.new()
	if json.parse(file.get_as_text()) == OK and json.data is Dictionary:
		var data: Dictionary = json.data
		if data.has("trackers"):
			trackers = data["trackers"]
		if data.has("void_seen"):
			void_seen = data["void_seen"]
		if data.has("void_asked"):
			void_asked = data["void_asked"]
	file.close()


# --- Helpers ---

func _read_json(path: String) -> Dictionary:
	var file := FileAccess.open(path, FileAccess.READ)
	if not file:
		push_error("Cannot open: %s" % path)
		return {}
	var text := file.get_as_text()
	file.close()
	var json := JSON.new()
	if json.parse(text) != OK:
		push_error("JSON error in %s: %s" % [path, json.get_error_message()])
		return {}
	if json.data is Dictionary:
		return json.data
	return {}
