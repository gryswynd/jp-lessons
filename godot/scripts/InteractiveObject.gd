extends Area2D
## Interactive objects: doors, furniture, items.
## Mirrors the object system from Game.js.

@export var object_name: String = ""
@export var object_name_jp: String = ""
@export var is_door: bool = false
@export var message_data: Dictionary = {}  # { "jp": ..., "en": ..., "terms": [...] }

@onready var label: Label = $InteractLabel
@onready var collision_shape: CollisionShape2D = $CollisionShape2D

var player_nearby := false
var obj_width: float = 0
var obj_height: float = 0


func _ready() -> void:
	body_entered.connect(_on_body_entered)
	body_exited.connect(_on_body_exited)
	if label:
		label.visible = false


func setup(data: Dictionary) -> void:
	## Initialize from a day.json object entry.
	object_name = data.get("name", "")
	object_name_jp = data.get("nameJp", "")
	is_door = data.get("isDoor", false)

	var x: float = data.get("x", 0)
	var y: float = data.get("y", 0)
	obj_width = data.get("width", 50)
	obj_height = data.get("height", 50)

	# Position at center of the defined rect
	global_position = Vector2(x + obj_width * 0.5, y + obj_height * 0.5)

	# Set collision shape to match the object bounds
	if collision_shape:
		var shape := RectangleShape2D.new()
		shape.size = Vector2(obj_width, obj_height)
		collision_shape.shape = shape

	if data.has("message"):
		message_data = data["message"]

	if is_door:
		# Doors need a blocking body that toggles
		_setup_door_blocker()


func interact() -> void:
	## Called by DayLoader when the player interacts with this object.
	## DayLoader handles all logic (doors, toilet scene, messages).
	## This is kept for backwards compatibility but DayLoader routes directly.
	GameManager.inspected[object_name] = true

	if is_door:
		var now_open := GameManager.toggle_door(object_name)
		var status := "opened" if now_open else "closed"
		GameManager.show_message("%s %s." % [object_name, status])
		_update_door_blocker()
	elif not message_data.is_empty():
		GameManager.show_message(message_data)


func _setup_door_blocker() -> void:
	## Create a StaticBody2D child that blocks movement when door is closed.
	var blocker := StaticBody2D.new()
	blocker.name = "DoorBlocker"

	var shape := RectangleShape2D.new()
	shape.size = Vector2(obj_width, obj_height)

	var col := CollisionShape2D.new()
	col.shape = shape

	blocker.add_child(col)
	add_child(blocker)
	# Position at 0,0 relative to parent (already centered)
	blocker.position = Vector2.ZERO


func _update_door_blocker() -> void:
	var blocker := get_node_or_null("DoorBlocker")
	if blocker:
		# Disable collision when door is open
		blocker.get_child(0).disabled = GameManager.is_door_open(object_name)


func _on_body_entered(body: Node2D) -> void:
	if body.is_in_group("player"):
		player_nearby = true
		_update_label()


func _on_body_exited(body: Node2D) -> void:
	if body.is_in_group("player"):
		player_nearby = false
		_update_label()


func _update_label() -> void:
	if not label:
		return

	# Hide label for disabled doors
	if is_door and GameManager.is_door_disabled(object_name):
		label.visible = false
		return

	label.visible = player_nearby and not GameManager.in_conversation
	if player_nearby:
		if is_door:
			label.text = "開いている" if GameManager.is_door_open(object_name) else "閉まっている"
		elif GameManager.inspected.has(object_name):
			label.text = object_name_jp
		else:
			label.text = "???"
