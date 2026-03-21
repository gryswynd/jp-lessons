extends CanvasLayer
## Touch D-pad and interact button overlay for mobile.
## Creates simple arrow/circle buttons programmatically.
## Emits virtual input actions that Player.gd already listens to.

const DPAD_SIZE := 50
const DPAD_MARGIN := 20
const BTN_ALPHA := 0.35


func _ready() -> void:
	layer = 20

	# Only show on touch devices
	if not DisplayServer.is_touchscreen_available():
		visible = false
		return

	var viewport_size := get_viewport().get_visible_rect().size

	# D-pad position (bottom-left)
	var dpad_cx := DPAD_MARGIN + DPAD_SIZE + DPAD_SIZE * 0.5
	var dpad_cy := viewport_size.y - DPAD_MARGIN - DPAD_SIZE - DPAD_SIZE * 0.5

	_add_button("move_up", dpad_cx, dpad_cy - DPAD_SIZE, "^")
	_add_button("move_down", dpad_cx, dpad_cy + DPAD_SIZE, "v")
	_add_button("move_left", dpad_cx - DPAD_SIZE, dpad_cy, "<")
	_add_button("move_right", dpad_cx + DPAD_SIZE, dpad_cy, ">")

	# Interact button (bottom-right)
	var interact_x := viewport_size.x - DPAD_MARGIN - DPAD_SIZE
	var interact_y := viewport_size.y - DPAD_MARGIN - DPAD_SIZE
	_add_button("interact", interact_x, interact_y, "A")


func _add_button(action: String, cx: float, cy: float, label_text: String) -> void:
	var btn := TouchScreenButton.new()
	btn.action = action
	btn.position = Vector2(cx, cy)
	btn.visibility_mode = TouchScreenButton.VISIBILITY_TOUCHSCREEN_ONLY

	# Create a simple texture for the button
	var img := Image.create(DPAD_SIZE, DPAD_SIZE, false, Image.FORMAT_RGBA8)
	img.fill(Color(1, 1, 1, BTN_ALPHA))
	var tex := ImageTexture.create_from_image(img)
	btn.texture_normal = tex
	btn.texture_pressed = _make_pressed_tex()

	# Center the texture on the position
	btn.position -= Vector2(DPAD_SIZE * 0.5, DPAD_SIZE * 0.5)

	add_child(btn)

	# Add label on top
	var lbl := Label.new()
	lbl.text = label_text
	lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	lbl.set_anchors_preset(Control.PRESET_FULL_RECT)
	lbl.size = Vector2(DPAD_SIZE, DPAD_SIZE)
	lbl.position = btn.position
	lbl.add_theme_color_override("font_color", Color(1, 1, 1, 0.8))
	lbl.add_theme_font_size_override("font_size", 20)
	lbl.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(lbl)


func _make_pressed_tex() -> ImageTexture:
	var img := Image.create(DPAD_SIZE, DPAD_SIZE, false, Image.FORMAT_RGBA8)
	img.fill(Color(1, 1, 1, BTN_ALPHA * 2))
	return ImageTexture.create_from_image(img)
