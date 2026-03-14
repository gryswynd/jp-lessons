extends Node
## Processes Japanese text and wraps vocabulary terms in BBCode [url] tags
## so they are tappable in RichTextLabel. Mirrors the text processing from Game.js.
##
## Usage:
##   var tagged := TermProcessor.process_text("おはよう、りきぞ！")
##   # Returns BBCode with [url=term_id]surface[/url] wrapping known terms.

class_name TermProcessor


static func process_text(text: String) -> String:
	## Find all known term surfaces in the text and wrap them in [url] tags.
	## Longest match wins (prevents nesting: 今日 beats 今 + 日).
	var index := GameManager.get_surface_index()
	if index.is_empty():
		return text

	# Collect all surfaces that appear in the text
	var matches: Array = []  # [{ "surface": str, "id": str, "pos": int }]

	for surface in index:
		if surface == "":
			continue
		var search_from := 0
		while true:
			var pos := text.find(surface, search_from)
			if pos < 0:
				break
			matches.append({
				"surface": surface,
				"id": index[surface],
				"pos": pos,
				"len": surface.length()
			})
			search_from = pos + 1

	if matches.is_empty():
		return text

	# Sort by position, then longest first (so longest match wins at each position)
	matches.sort_custom(func(a, b):
		if a["pos"] != b["pos"]:
			return a["pos"] < b["pos"]
		return a["len"] > b["len"]
	)

	# Greedy non-overlapping selection: longest match at each position
	var selected: Array = []
	var covered_to := -1

	for m in matches:
		if m["pos"] >= covered_to:
			# Check that no longer match already covers this range
			var dominated := false
			for s in selected:
				if m["pos"] >= s["pos"] and m["pos"] + m["len"] <= s["pos"] + s["len"]:
					dominated = true
					break
			if not dominated:
				selected.append(m)
				covered_to = m["pos"] + m["len"]

	if selected.is_empty():
		return text

	# Sort selected by position
	selected.sort_custom(func(a, b): return a["pos"] < b["pos"])

	# Build BBCode output
	var result := ""
	var cursor := 0

	for m in selected:
		if m["pos"] > cursor:
			result += text.substr(cursor, m["pos"] - cursor)

		# Wrap in [url=id] for tappable terms
		var term_id: String = m["id"]
		var entry: Dictionary = GameManager.lookup_term(term_id)
		var color := _get_term_color(entry)
		result += "[url=%s][color=%s]%s[/color][/url]" % [term_id, color, m["surface"]]
		cursor = m["pos"] + m["len"]

	if cursor < text.length():
		result += text.substr(cursor)

	return result


static func _get_term_color(entry: Dictionary) -> String:
	## Return a BBCode color based on term type.
	var type := entry.get("type", "vocab")
	match type:
		"character":
			return "#f8a5c2"  # sakura pink
		"particle":
			return "#a29bfe"  # soft purple
		_:
			return "#4e54c8"  # vocab blue (matches Game.js .jp-term color)
