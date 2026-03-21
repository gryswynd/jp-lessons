extends CanvasLayer
## Conversation overlay — speech bubble + character portrait + background.
## Supports per-conversation backgrounds and per-speaker portrait overrides.

@onready var overlay: ColorRect = $Overlay
@onready var speech_text: RichTextLabel = $Overlay/SpeechBubble/SpeechText
@onready var en_text: Label = $Overlay/SpeechBubble/EnText
@onready var continue_label: Label = $Overlay/SpeechBubble/ContinueLabel
@onready var portrait: TextureRect = $Overlay/Portrait
@onready var bg_texture_rect: TextureRect = $Overlay/Background

var conversation: Array = []
var conversation_index: int = 0
var portrait_map: Dictionary = {}
var portrait_overrides: Dictionary = {}  # speaker → Texture2D
var on_end_callback: Callable


func _ready() -> void:
	overlay.visible = false
	GameManager.conversation_started.connect(_on_conversation_started)
	GameManager.conversation_ended.connect(_on_conversation_ended)

	# Create background TextureRect if it doesn't exist in the scene
	if not bg_texture_rect:
		bg_texture_rect = TextureRect.new()
		bg_texture_rect.name = "Background"
		bg_texture_rect.set_anchors_preset(Control.PRESET_FULL_RECT)
		bg_texture_rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
		bg_texture_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
		overlay.add_child(bg_texture_rect)
		overlay.move_child(bg_texture_rect, 0)


func set_portrait_map(map: Dictionary) -> void:
	portrait_map = map


func _on_conversation_started(convo_data: Array, options: Dictionary) -> void:
	conversation = convo_data
	conversation_index = 0

	# Portrait overrides for this conversation
	portrait_overrides = options.get("portrait_overrides", {})

	# On-end callback
	if options.has("on_end"):
		on_end_callback = options["on_end"]
	else:
		on_end_callback = Callable()

	# Set background
	var bg_key: String = options.get("background", "")
	if bg_key != "" and GameManager.convo_backgrounds.has(bg_key):
		bg_texture_rect.texture = GameManager.convo_backgrounds[bg_key]
		bg_texture_rect.visible = true
	elif not GameManager.convo_backgrounds.is_empty():
		# Fallback to first available background
		bg_texture_rect.texture = GameManager.convo_backgrounds.values()[0]
		bg_texture_rect.visible = true
	else:
		bg_texture_rect.visible = false

	overlay.visible = true
	_display_line()


func _on_conversation_ended() -> void:
	overlay.visible = false
	conversation = []
	conversation_index = 0
	portrait_overrides = {}

	if on_end_callback.is_valid():
		var cb := on_end_callback
		on_end_callback = Callable()
		cb.call()


func _display_line() -> void:
	if conversation_index >= conversation.size():
		GameManager.end_conversation()
		return

	var line: Dictionary = conversation[conversation_index]
	var jp: String = str(line.get("jp", line.get("text", "")))
	var en: String = str(line.get("en", ""))
	var speaker: String = str(line.get("speaker", ""))

	# Process text through term tagger for tappable vocab
	var index := GameManager.get_surface_index()
	var tagged_jp := TermProcessor.process_text(jp, index, GameManager.term_map)
	speech_text.clear()
	speech_text.append_text(tagged_jp)

	en_text.text = en

	# Set portrait — check overrides first, then portrait_map
	var portrait_tex = portrait_overrides.get(speaker)
	if portrait_tex == null:
		portrait_tex = portrait_map.get(speaker)
	if portrait_tex is Texture2D:
		portrait.texture = portrait_tex as Texture2D
		portrait.visible = true
	else:
		portrait.visible = false


func advance() -> void:
	conversation_index += 1
	_display_line()


func _unhandled_input(event: InputEvent) -> void:
	if not GameManager.in_conversation:
		return

	if event.is_action_pressed("interact"):
		advance()
		get_viewport().set_input_as_handled()
	elif event is InputEventMouseButton and event.pressed:
		advance()
		get_viewport().set_input_as_handled()
	elif event is InputEventScreenTouch and event.pressed:
		advance()
		get_viewport().set_input_as_handled()
