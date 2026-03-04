# Rikizo Art Pipeline — Test Plan

## Part 1: Prerequisites (One-time Setup)

### 1A. Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API key" → "Create API key"
4. Save the key somewhere safe

**Cost:** The free tier gives you ~1,500 image generations per day through the API — more than enough for testing. You won't need to enter a credit card.

**Pricing if you later exceed free tier:**
- Flash (bulk sprites, variants, UI): ~$0.04–0.07 per image at 1K
- Pro (hero portraits, CGs, bosses): ~$0.13 per image at 1K–2K
- A full character batch (portrait + expressions + full-body + sprite sheet) ≈ 15–25 images ≈ $1–3

### 1B. Set Up Your Project Directory

Create this folder structure wherever your Rikizo project lives:

```
rikizo-project/
├── CLAUDE.md                      ← your existing lesson pipeline (add scope block at top)
├── RikizoArtPipeline.md           ← the art pipeline instructions
├── PaperBanana.md                 ← framework reference
├── gemini-3-image-api-guide.md    ← Gemini API docs
├── references/                    ← existing art goes here
│   ├── pixel_characters/
│   ├── pixel_maps/
│   ├── vector_portraits/
│   ├── vector_ui/
│   └── style_dna.json             ← generated in Test 1
├── output/                        ← generated art lands here
│   ├── _wip/                      ← temp candidates during generation
│   ├── shared/sprites/
│   ├── characters/
│   ├── enemies/
│   ├── locations/
│   ├── ui/
│   ├── items/
│   ├── effects/
│   └── tiles/
├── logs/
│   └── generation_log.json
└── data/N5/game/                  ← your existing game data structure
    ├── day-01-home/
    └── ...
```

### 1C. Install Python Dependencies

Claude Code will need these available. You can pre-install or let Claude Code install them:

```bash
pip install google-genai Pillow numpy
```

Optional (for AI background removal fallback):
```bash
pip install rembg[gpu]    # or just: pip install rembg
```

### 1D. Place Your Existing PNGs

If you already have any art for the game (sprites, backgrounds, anything), copy them into the appropriate `references/` subdirectory. These are what the Retriever agent uses to maintain style consistency.

If you have NO existing art yet, that's fine — the pipeline handles the cold-start case.

### 1E. Set the API Key for Claude Code

When you open Claude Code, set the environment variable so the Python scripts can access it:

```bash
export GEMINI_API_KEY="your-key-here"
```

Or Claude Code can read it from a `.env` file if you prefer.

---

## Part 2: Test Sequence (Run These In Order)

Each test validates a specific layer of the pipeline. Run them sequentially — each one builds on the last.

---

### TEST 1 — Style DNA Analysis (validates Section 3)

**What it tests:** Can Claude Code read your existing PNGs and extract style parameters?

**Command to Claude Code:**
> "Read RikizoArtPipeline.md. Then analyze the PNGs in my references/ folder and generate style_dna.json."

**Expected outcome:**
- Claude Code reads the pipeline doc
- Catalogs your reference PNGs (or notes that none exist)
- If PNGs exist: generates `references/style_dna.json` with hex palette, line weight, proportions, shading analysis
- If no PNGs exist: tells you it will use Section 2 (Art Direction Bible) defaults and creates a skeleton style_dna.json

**Pass criteria:** `style_dna.json` exists and contains structured data. No errors.

**If it fails:** Check that Claude Code is reading `RikizoArtPipeline.md` and not trying to use `CLAUDE.md`. If it tries to run the lesson 4-agent pipeline, the scope delimiter isn't working — verify you added the scope block to the top of CLAUDE.md.

---

### TEST 2 — Single Portrait Generation (validates full 5-agent pipeline)

**What it tests:** The complete pipeline end-to-end on the simplest possible asset.

**Command to Claude Code:**
> "Generate Rikizo's calm neutral dialogue portrait. Show me each agent step."

**Expected outcome:** Claude Code runs all 5 agents with labeled transitions:

```
=== AGENT 1: RETRIEVER ===
[builds Asset Brief, selects references, determines Pro model]

=== AGENT 2: PLANNER ===
[builds Figure Plan with Rikizo's description, originality check]

=== AGENT 3: STYLIST ===
[applies MP100 日常 register, composes prompt]

=== AGENT 4: VISUALIZER ===
[calls Gemini API, generates 2-3 candidates]

=== AGENT 5: CRITIC ===
[scores candidates, selects best]

=== POST-PROCESSING ===
[saves to output/characters/rikizo/portrait_calm_neutral.png]
```

**Pass criteria:**
- All 5 agents fire in order with labeled output
- A PNG file appears in `output/characters/rikizo/`
- The image shows a character in the MP100 style (simple face, thin lines, lanky proportions)
- The character does NOT look like Mob or any other MP100 character
- A log entry appears in `logs/generation_log.json`
- The image is copied to `references/vector_portraits/` for future use

**What to check manually:**
- Does it look like MP100 style? (Simple face, thin lines, muted colors)
- Is it clearly an ORIGINAL character, not Mob?
- Is the quality reasonable for a first attempt?

**If it fails:** 
- If Gemini returns an error → check API key, check model name is correct
- If the pipeline mixes up agents → the Section 4 instructions may need adjustment
- If the character looks like Mob → the originality guardrails need strengthening

---

### TEST 3 — Transparency Pipeline (validates Section 6)

**What it tests:** Dual-render alpha matting produces clean RGBA PNGs with no fringe.

**Command to Claude Code:**
> "Generate a test NPC sprite for Mom using the dual-render transparency pipeline. Save the intermediate white and black background versions so I can inspect them."

**Expected outcome:**
- Claude Code generates the sprite on white background → saves `_white.png`
- Uses multi-turn to swap to black background → saves `_black.png`
- Runs `extract_alpha()` → produces final RGBA PNG
- The final PNG has transparent background with NO pink/magenta fringe

**Pass criteria:**
- Three files: `_white.png`, `_black.png`, and final `.png`
- Open the final PNG in any image editor — background should be transparent checkerboard
- Zoom to edges — there should be clean anti-aliased edges, NOT a colored halo
- The character should look identical between white and black versions (no pose/detail drift)

**If it fails:**
- If white and black versions show different poses → multi-turn consistency failed; try the standalone dual-render (two separate calls with matching prompts) instead
- If there's fringe → the extract_alpha math may need the threshold adjusted, or try the rembg fallback
- If Gemini refuses to just swap the background → adjust the multi-turn swap prompt

---

### TEST 4 — Pixel Art Sprite Sheet (validates Mode A + grid spec)

**What it tests:** Can the pipeline produce a correctly-sized sprite sheet with the right grid layout?

**Command to Claude Code:**
> "Generate Rikizo's 6×4 walk cycle sprite sheet. The final output must be exactly 1224×1172 pixels with RGBA transparency."

**Expected outcome:**
- A sprite sheet with 6 columns × 4 rows
- Each cell approximately 204×293 pixels
- Total dimensions 1224×1172
- Pixel art style (hard edges, limited palette, no anti-aliasing)
- Transparent background

**Pass criteria:**
- Dimensions are correct (check with any image tool or `python -c "from PIL import Image; print(Image.open('sheet.png').size)"`)
- You can visually identify 4 directional rows and 6 frame columns
- The character is recognizable as the same Rikizo from Test 2 (different art mode, same identity)

**What will probably go wrong:**
- Gemini is unlikely to produce a pixel-perfect grid on the first try. This is expected. The real test is whether the Critic catches size/grid issues and requests revisions.
- You may need to resize the output programmatically after generation. The pipeline includes resize verification in post-processing for this reason.

---

### TEST 5 — Critic Rejection Loop (validates quality gate)

**What it tests:** Does the Critic actually reject bad output and trigger a revision?

**Command to Claude Code:**
> "Generate a 忘れ人 minion battle sprite. Deliberately set the Critic thresholds high (all 5s required) so it rejects the first attempt. I want to see the revision loop."

**Expected outcome:**
- Round 1: Critic scores the candidate, finds it below threshold, produces feedback
- The feedback includes specific `updated_prompt_additions`
- Round 2: Visualizer regenerates with the feedback appended
- Critic evaluates again
- Eventually passes or reaches round 3 and selects best available

**Pass criteria:**
- You see at least 2 rounds of Critic evaluation
- The feedback is specific (not "make it better" but "line weight too thick, reduce to 1px")
- Round 2 output is noticeably different from Round 1

---

### TEST 6 — Batch Character Workflow (validates Section 10)

**What it tests:** The full production workflow for a single character from portrait through sprite sheet.

**Command to Claude Code:**
> "Run the batch character workflow for Mom. Generate: calm portrait, calm expressions (smile, concern), full-body, and NPC sprite."

**Expected outcome:** Multiple assets generated in sequence, each through the full 5-agent pipeline:
1. Calm hero portrait (Pro model)
2. Smile expression variant (Flash, multi-turn from hero portrait)
3. Concern expression variant (Flash, multi-turn)
4. Full-body (Pro)
5. NPC sprite with transparency (Flash + dual-render)

**Pass criteria:**
- All 5 assets generated and saved to correct paths
- Expression variants are recognizably the SAME character as the hero portrait
- The NPC sprite has correct transparency
- All 5 assets logged in `generation_log.json`

**This is the most resource-intensive test** — expect ~10–15 API calls (some fail + retries). Still well within free tier limits.

---

### TEST 7 — Background Generation (validates Mode B backgrounds)

**What it tests:** Location backgrounds in the MP100 painterly style.

**Command to Claude Code:**
> "Generate the Day 1 house interior background. 16:9 aspect ratio, 日常 calm register, warm and lived-in feeling."

**Expected outcome:**
- A wide 16:9 background with painterly detail
- More detailed than any character art (MP100 hallmark)
- Warm, muted color palette
- No characters in the scene (designed for character compositing)

**Pass criteria:**
- Looks like it could be a background from an anime, not a photograph
- Background detail level is clearly higher than the character portraits
- No transparency needed (this IS the background)

---

### TEST 8 — Scope Delimiter (validates CLAUDE.md separation)

**What it tests:** Claude Code correctly routes art tasks vs lesson tasks.

**Command to Claude Code:**
> "Create the N5.3 lesson JSON."

**Expected outcome:** Claude Code reads `CLAUDE.md` and starts the 4-agent lesson pipeline (PM → CB → QA → CR). It should NOT reference `RikizoArtPipeline.md`, the 5-agent art pipeline, or try to generate images.

**Then say:**
> "Now generate the Day 3 location background."

**Expected outcome:** Claude Code switches to reading `RikizoArtPipeline.md` and runs the 5-agent art pipeline. It should NOT try to run the lesson pipeline's QA or Consistency agents on an image.

**Pass criteria:** Each task uses the correct pipeline. No cross-contamination.

---

## Part 3: What to Expect and Iterate On

### Things that will likely work well:
- The pipeline structure (agents fire in order, handoffs are clear)
- Portraits and character art (Gemini is good at these)
- Background generation (Gemini excels at environmental art)
- Originality guardrails (prompt-level safeguards are effective)

### Things that will likely need tuning:
- **Sprite sheet grid accuracy.** Gemini doesn't natively understand "6×4 grid at exactly 204×293 per cell." You may need to generate individual frames and stitch them programmatically. If so, update the pipeline to have the Visualizer generate 24 individual sprite frames instead of one sheet, then have post-processing stitch them.
- **Dual-render consistency.** The two renders may not be identical enough for perfect alpha extraction. If you see artifacts, try: (a) the multi-turn approach (generate white first, then ask to swap to black), (b) increasing prompt specificity about character details, or (c) falling back to rembg.
- **Pixel art quality.** Current image models are better at illustration than true pixel art. You may get "pixel-art-style" output that's actually soft-edged. If so, add post-processing to snap to a palette and harden edges programmatically.
- **Style consistency across assets.** The first few assets will establish the style. Early Critic rounds may need more human guidance. After 5–10 assets exist in `references/`, the Retriever will have enough material and consistency should improve.

### After testing — next steps:
1. Run Tests 1–3 to validate the basics
2. Review the output and adjust prompts/style DNA as needed
3. Run Tests 4–7 for full coverage
4. When satisfied, run the full production order from Section 10 (Rikizo → Mom/Dad → first location → The Void → UI → enemies)
5. As you generate more assets, the reference library grows and quality/consistency improves

---

## Quick Reference: Estimated API Calls per Test

| Test | API calls | Free tier impact |
|---|---|---|
| Test 1 (Style DNA) | 0 | None — analysis only |
| Test 2 (Single portrait) | 3–6 | Minimal |
| Test 3 (Transparency) | 4–6 | Minimal |
| Test 4 (Sprite sheet) | 3–9 | Low |
| Test 5 (Critic loop) | 6–12 | Low |
| Test 6 (Batch character) | 10–20 | Moderate |
| Test 7 (Background) | 3–6 | Minimal |
| Test 8 (Scope test) | 3–6 | Minimal |
| **Total** | **~30–65** | **~5% of daily free limit** |

You can comfortably run ALL tests in a single day without spending a cent.
