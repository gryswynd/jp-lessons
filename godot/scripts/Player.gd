extends CharacterBody2D
## Player controller — movement, animation, collision.
## Mirrors the exact behavior from Game.js: 4-direction walk,
## 6-frame animation per direction, pixel-based collision via CollisionMap.

signal interaction_requested

const SPEED := 120.0  # 2 px/frame × 60 fps
const FRAME_COUNT := 6
const FRAME_DELAY := 0.133  # ~8 frames at 60fps

# Spritesheet layout (matches walk_cycle_spec.json)
const SHEET_COLS := 6
const SHEET_ROWS := 4
const FRAME_W := 204
const FRAME_H := 293

# Rendered size on screen (matches Game.js player dimensions)
const RENDER_W := 63
const RENDER_H := 90

# Direction → spritesheet row
const DIR_ROW := {
	"down": 0,
	"left": 1,
	"right": 2,
	"up": 3
}

var direction := "down"
var anim_frame := 0
var frame_timer := 0.0
var is_moving := false

@onready var sprite: Sprite2D = $Sprite2D
@onready var collision_shape: CollisionShape2D = $CollisionShape2D


func _ready() -> void:
	_update_sprite_frame()


func _physics_process(delta: float) -> void:
	if GameManager.in_conversation:
		velocity = Vector2.ZERO
		is_moving = false
		anim_frame = 0
		_update_sprite_frame()
		return

	# --- Input ---
	var input_dir := Vector2.ZERO
	if Input.is_action_pressed("move_up"):
		input_dir.y -= 1
		direction = "up"
	if Input.is_action_pressed("move_down"):
		input_dir.y += 1
		direction = "down"
	if Input.is_action_pressed("move_left"):
		input_dir.x -= 1
		direction = "left"
	if Input.is_action_pressed("move_right"):
		input_dir.x += 1
		direction = "right"

	is_moving = input_dir != Vector2.ZERO
	velocity = input_dir.normalized() * SPEED

	# --- Collision ---
	# CharacterBody2D.move_and_slide() handles collision with StaticBody2D walls.
	# The CollisionMap node generates those bodies from the collision.png at load time.
	move_and_slide()

	# --- Animation ---
	if is_moving:
		frame_timer += delta
		if frame_timer >= FRAME_DELAY:
			frame_timer = 0.0
			anim_frame = (anim_frame + 1) % FRAME_COUNT
	else:
		anim_frame = 0
		frame_timer = 0.0

	_update_sprite_frame()

	# --- Interact ---
	if Input.is_action_just_pressed("interact"):
		interaction_requested.emit()


func _update_sprite_frame() -> void:
	if not sprite or not sprite.texture:
		return
	var row: int = DIR_ROW.get(direction, 0)
	sprite.region_rect = Rect2(
		anim_frame * FRAME_W,
		row * FRAME_H,
		FRAME_W,
		FRAME_H
	)


func get_facing_point() -> Vector2:
	## Returns a point 50px in front of the player (for interaction checks).
	var offset := Vector2.ZERO
	match direction:
		"up":    offset = Vector2(0, -50)
		"down":  offset = Vector2(0, 50)
		"left":  offset = Vector2(-50, 0)
		"right": offset = Vector2(50, 0)
	return global_position + offset
