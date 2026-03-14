extends Node2D
## Reads collision.png pixel data and generates StaticBody2D collision shapes.
## Red pixels (#FF0000) → wall. Blue pixels (#0000FF) → interactive zone.
##
## Strategy: scan the collision image in horizontal runs (RLE) and create
## rectangular CollisionShape2D bodies for each run of wall pixels.
## This is much more efficient than per-pixel bodies.

const TILE_SIZE := 8  # Sample every 8px for collision rects (balances accuracy vs body count)

var collision_image: Image
var image_width := 0
var image_height := 0


func build_from_texture(collision_texture: Texture2D) -> void:
	## Load the collision image and generate wall bodies.
	collision_image = collision_texture.get_image()
	image_width = collision_image.get_width()
	image_height = collision_image.get_height()

	_generate_wall_bodies()


func is_wall(x: float, y: float) -> bool:
	## Check if a world position is a wall pixel (red).
	var ix := int(x)
	var iy := int(y)
	if ix < 0 or iy < 0 or ix >= image_width or iy >= image_height:
		return true  # Out of bounds = wall
	var color := collision_image.get_pixel(ix, iy)
	return color.r > 0.78 and color.g < 0.2 and color.b < 0.2


func is_interactive_zone(x: float, y: float) -> bool:
	## Check if a world position is a blue interactive zone.
	var ix := int(x)
	var iy := int(y)
	if ix < 0 or iy < 0 or ix >= image_width or iy >= image_height:
		return false
	var color := collision_image.get_pixel(ix, iy)
	return color.b > 0.78 and color.r < 0.2 and color.g < 0.2


func _generate_wall_bodies() -> void:
	## Scan the collision image in a grid and create rectangular bodies
	## for contiguous wall regions. Uses horizontal run-length encoding.
	var visited := {}  # "x,y" → true

	for gy in range(0, image_height, TILE_SIZE):
		var run_start := -1
		for gx in range(0, image_width, TILE_SIZE):
			var key := "%d,%d" % [gx, gy]
			if _is_wall_tile(gx, gy) and not visited.has(key):
				if run_start < 0:
					run_start = gx
				visited[key] = true
			else:
				if run_start >= 0:
					_create_wall_rect(run_start, gy, gx - run_start, TILE_SIZE)
					run_start = -1
		# End of row
		if run_start >= 0:
			_create_wall_rect(run_start, gy, image_width - run_start, TILE_SIZE)


func _is_wall_tile(gx: int, gy: int) -> bool:
	## Check if the center of a tile-sized region is a wall.
	var cx := mini(gx + TILE_SIZE / 2, image_width - 1)
	var cy := mini(gy + TILE_SIZE / 2, image_height - 1)
	return is_wall(cx, cy)


func _create_wall_rect(x: int, y: int, w: int, h: int) -> void:
	var body := StaticBody2D.new()
	body.position = Vector2(x + w * 0.5, y + h * 0.5)

	var shape := RectangleShape2D.new()
	shape.size = Vector2(w, h)

	var col := CollisionShape2D.new()
	col.shape = shape

	body.add_child(col)
	add_child(body)
