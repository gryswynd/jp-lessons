extends Area2D
## An NPC that the player can interact with to trigger a conversation.

@export var npc_name: String = ""
@export var npc_name_jp: String = ""
@export var conversation: Array = []
@export var convo_portrait_texture: Texture2D

@onready var sprite: Sprite2D = $Sprite2D
@onready var label: Label = $InteractLabel

var player_nearby := false


func _ready() -> void:
	body_entered.connect(_on_body_entered)
	body_exited.connect(_on_body_exited)
	if label:
		label.visible = false


func setup(data: Dictionary, sprite_tex: Texture2D, portrait_tex: Texture2D) -> void:
	## Initialize from day.json NPC entry.
	npc_name = data.get("name", "")
	npc_name_jp = data.get("nameJp", "")
	conversation = data.get("conversation", [])
	global_position = Vector2(data.get("x", 0), data.get("y", 0))

	if sprite_tex and sprite:
		sprite.texture = sprite_tex
		# Scale to match Game.js: height=108, width=aspect-ratio-preserving
		var aspect := float(sprite_tex.get_width()) / float(sprite_tex.get_height())
		var target_h := 108.0
		var target_w := target_h * aspect
		sprite.scale = Vector2(target_w / sprite_tex.get_width(), target_h / sprite_tex.get_height())
		# Anchor at feet (sprite draws upward from position)
		sprite.offset = Vector2(0, -sprite_tex.get_height() * 0.5)

	convo_portrait_texture = portrait_tex


func interact() -> void:
	## Called when the player interacts with this NPC.
	if conversation.size() > 0:
		GameManager.inspected[npc_name] = true
		GameManager.start_conversation(conversation)


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
	label.visible = player_nearby and not GameManager.in_conversation
	if player_nearby:
		if GameManager.inspected.has(npc_name):
			label.text = npc_name_jp
		else:
			label.text = "???"
