extends CanvasLayer
## Conversation overlay — speech bubble + character portrait.
## Mirrors the conversation system from Game.js.

@onready var overlay: ColorRect = $Overlay
@onready var speech_text: RichTextLabel = $Overlay/SpeechBubble/SpeechText
@onready var en_text: Label = $Overlay/SpeechBubble/EnText
@onready var continue_label: Label = $Overlay/SpeechBubble/ContinueLabel
@onready var portrait: TextureRect = $Overlay/Portrait

var conversation: Array = []
var conversation_index: int = 0
var portrait_map: Dictionary = {}


func _ready() -> void:
	overlay.visible = false
	GameManager.conversation_started.connect(_on_conversation_started)
	GameManager.conversation_ended.connect(_on_conversation_ended)


func set_portrait_map(map: Dictionary) -> void:
	portrait_map = map


func _on_conversation_started(convo_data: Array) -> void:
	conversation = convo_data
	conversation_index = 0
	overlay.visible = true
	_display_line()


func _on_conversation_ended() -> void:
	overlay.visible = false
	conversation = []
	conversation_index = 0


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

	# Set portrait
	var portrait_val = portrait_map.get(speaker)
	if portrait_val is Texture2D:
		portrait.texture = portrait_val as Texture2D
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
