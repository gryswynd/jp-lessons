# PaperBanana for JRPG Art Generation

> Adapted from *PaperBanana: Automating Academic Illustration for AI Scientists* (Zhu et al., arXiv:2601.23265v1). This guide distills PaperBanana's five-agent agentic pipeline into actionable instructions for Claude Code to produce professional-quality JRPG illustrations.

---

## Framework Overview

PaperBanana is a reference-driven multi-agent pipeline. Each agent has a specialized role and the output of one feeds the next. The pipeline terminates with an iterative refinement loop between the Visualizer and Critic. Adapt this architecture to JRPG art by following the five phases below in strict sequence.

```
Input (scene description + art direction)
  │
  ▼
┌─────────────┐
│  RETRIEVER   │  ← Gather JRPG reference material & exemplars
└──────┬──────┘
       ▼
┌─────────────┐
│   PLANNER    │  ← Convert description into a detailed figure plan
└──────┬──────┘
       ▼
┌─────────────┐
│   STYLIST    │  ← Synthesize & apply a JRPG aesthetic guideline
└──────┬──────┘
       ▼
┌──────────────────────────┐
│  VISUALIZER ⇄ CRITIC     │  ← Generate image → critique → refine (T rounds)
└──────────────────────────┘
       ▼
     Output (final JRPG image)
```

---

## Phase 1 — Retriever Agent

**Purpose:** Select reference examples that inform the logical composition, character design, and stylistic norms of the target JRPG image.

**How to implement in Claude Code:**

1. Define a **reference corpus** — a curated set of JRPG art exemplars organized by category. Categories should include: character portraits, battle scenes, overworld environments, UI/menu mockups, item/equipment icons, spell effects, cutscene compositions, and monster/enemy designs.
2. For each generation request, retrieve **1-5 references** that best match the requested scene type, mood, and composition complexity.
3. Use a **generative retrieval** approach: have the LLM reason over reference metadata (tags, description, style notes) to rank and select the most relevant examples rather than relying on raw similarity search alone.
4. Retrieval can be **semantic or random** — the paper found random retrieval still transfers style effectively — but semantic retrieval improves structural faithfulness for complex compositions.

**Output of this phase:** A shortlist of reference exemplars with their descriptions, style tags, and composition notes passed forward to the Planner.

---

## Phase 2 — Planner Agent

**Purpose:** Transform the raw scene description and art-direction caption into a detailed, structured **figure plan** suitable for image generation.

**How to implement in Claude Code:**

1. Accept two inputs:
   - **Scene description** — the narrative or mechanical context (e.g., a method section describing a battle system, a character's backstory, an environment's lore).
   - **Art-direction caption** — a concise statement of communicative intent (e.g., "A dramatic wide-shot of the party confronting the ice dragon in the Crystal Cavern").
2. Perform **in-context learning** using the retrieved references: include 3–5 reference descriptions as few-shot examples in the prompt so the Planner learns the expected level of specificity and structure.
3. The Planner outputs a **structured figure plan** containing:
   - **Subjects & characters:** Who/what appears, their poses, expressions, equipment, and relative placement.
   - **Environment & background:** Setting, depth layers (foreground / midground / background), lighting direction, time of day.
   - **Composition & layout:** Camera angle, rule of thirds placement, focal point, leading lines, negative space.
   - **Action & narrative beat:** What is happening in the scene, the dramatic tension, implied motion.
   - **Color palette guidance:** Dominant hues, accent colors, mood-driven tonal range.
   - **Text & UI overlays (if any):** Damage numbers, dialogue boxes, menu frames, health bars.
4. The plan should be **detailed enough to directly prompt an image generator** with no ambiguity about spatial relationships, scale, or visual hierarchy.

**Output of this phase:** A structured text plan (ideally in a consistent schema — YAML, JSON, or clearly sectioned markdown) passed to the Stylist.

---

## Phase 3 — Stylist Agent

**Purpose:** Synthesize a cohesive JRPG aesthetic guideline from the reference corpus and refine the Planner's figure plan to comply with that style.

**How to implement in Claude Code:**

1. **Batch-analyze** the full reference set (not just the retrieved subset) to auto-generate an **Aesthetic Guideline** document covering these dimensions for JRPG art:

   - **Color palette:** Rich, saturated tones. Warm palette for friendly scenes, cool desaturated palette for dungeons/villains, high-contrast accent colors for magic effects. Typical JRPG palettes draw from Final Fantasy, Chrono Trigger, Persona, Fire Emblem, Octopath Traveler, or Dragon Quest traditions.
   - **Line work & rendering style:** Clean outlines vs. painterly rendering vs. cel-shading vs. pixel-art homage. Define stroke weight, edge softness, and hatching conventions.
   - **Character proportions:** Determine the target chibi ratio (2–3 heads tall) vs. realistic (7–8 heads tall) vs. the common JRPG semi-stylized (4–5 heads tall). Ensure consistency across all characters.
   - **Iconography & symbols:** Elemental sigils, status effect indicators, class/job emblems, magical runes. Standardize shape language (e.g., angular = aggressive, rounded = supportive).
   - **Typography & UI style:** Ornate serif fonts for fantasy settings, clean sans-serif for sci-fi JRPGs. Frame styles for dialogue boxes (stone borders, glowing edges, parchment textures).
   - **Layout & composition norms:** Golden ratio or thirds-based framing, layered depth (parallax-style foreground/background separation), cinematic aspect ratios (16:9 for landscapes, 3:4 for character portraits).
   - **Lighting & atmosphere:** Rim lighting on characters, volumetric god-rays in environments, dramatic shadow casting in boss encounters, soft ambient occlusion in towns.

2. Take the Planner's figure plan and produce a **stylistically optimized version** — the same content and composition but with every visual element annotated with specific style directives from the Aesthetic Guideline.

**Output of this phase:** A style-enriched generation prompt (the optimized figure plan + aesthetic directives) ready for the Visualizer.

---

## Phase 4 — Visualizer Agent

**Purpose:** Render the JRPG image from the stylistically optimized description.

**How to implement in Claude Code:**

1. Feed the Stylist's output as the generation prompt to an image generation model.
2. **Model selection guidance:**
   - For high-fidelity JRPG illustrations: use the best available image generation model (e.g., the image generation capabilities accessible through the API).
   - For pixel-art or retro-styled outputs: consider code-based rendering (Python + Pillow/Pygame) to ensure pixel-perfect alignment, consistent tile sizes, and exact palette constraints.
3. Generate **multiple candidates** (2–4) per round if possible. Candidate diversity improves the chances of a strong result after critique.
4. Specify technical parameters:
   - **Resolution:** At least 1024×1024 for character art, 1920×1080 for scene art.
   - **Aspect ratio:** Match the intended use — 1:1 for portraits/icons, 16:9 for battle scenes and landscapes, 9:16 for full-body character art.
5. For **code-based rendering** (pixel art, UI mockups, stat charts, maps):
   - The Visualizer writes executable Python code that produces the image.
   - This is the preferred path when precise spatial positioning, exact color values, tile grids, or numerical accuracy matters.

**Output of this phase:** One or more candidate images passed to the Critic.

---

## Phase 5 — Critic Agent (Iterative Refinement Loop)

**Purpose:** Evaluate each candidate against the original figure plan and aesthetic guidelines, then produce targeted feedback for the Visualizer to regenerate an improved version.

**How to implement in Claude Code:**

1. The Critic receives:
   - The generated image(s).
   - The original scene description and caption.
   - The Planner's structured figure plan.
   - The Stylist's aesthetic guideline.
2. The Critic evaluates across **four dimensions** (adapted from PaperBanana's evaluation rubric):

   | Dimension | JRPG Adaptation | Priority |
   |---|---|---|
   | **Faithfulness** | Does the image accurately depict the described scene, characters, abilities, and narrative beat? Are all specified elements present and correctly placed? | **Primary** |
   | **Readability** | Is the composition clear? Can the viewer immediately identify the focal point, characters, and action? Are text overlays legible? No cluttered overlapping elements? | **Primary** |
   | **Conciseness** | Does the image focus on essential elements without visual noise? Are unnecessary details stripped away to maintain the JRPG's signature clarity-of-design? | Secondary |
   | **Aesthetics** | Does it look like professional JRPG art? Is it stylistically consistent with the aesthetic guideline? Would it be at home in a published JRPG title? | Secondary |

3. **Hierarchical judgment:** Faithfulness and Readability are the primary criteria. Only when those are satisfied should the Critic weigh Conciseness and Aesthetics as tiebreakers.
4. The Critic outputs a **structured critique** containing:
   - A pass/fail assessment per dimension.
   - Specific, actionable feedback (e.g., "The mage's staff is missing from their left hand," "The background mountain overlaps the character's head — shift the character 10% right," "The palette is too muted for a victory scene — increase saturation of golds and warm tones").
   - An updated description `P(t+1)` incorporating all corrections for the Visualizer to use in the next round.
5. **Iterate for T = 3 rounds.** The paper found 3 rounds is the sweet spot — further iterations yield diminishing returns.
6. After the final round, select the best candidate across all rounds as the output.

**Output of this phase:** The final, refined JRPG image.

---

## End-to-End Execution Checklist for Claude Code

```
1. [ ] RETRIEVE  — Gather 5–10 JRPG reference exemplars matching the request
2. [ ] PLAN      — Produce a structured figure plan with subjects, environment,
                    composition, action, palette, and any UI overlays
3. [ ] STYLE     — Apply the JRPG Aesthetic Guideline to every element in the plan
4. [ ] VISUALIZE — Generate 2–4 candidate images from the styled plan
5. [ ] CRITIQUE  — Evaluate candidates on faithfulness, readability, conciseness,
                    aesthetics; produce actionable feedback
6. [ ] REFINE    — Feed critique back to Visualizer; repeat steps 4–5 for 3 rounds
7. [ ] DELIVER   — Select and output the best final image
```

---

## JRPG-Specific Prompt Engineering Tips

These tips are derived from PaperBanana's findings on what makes generation prompts effective, adapted for JRPG content:

- **Be spatially explicit.** Instead of "a party of heroes," write "four characters standing in a staggered diagonal line from lower-left to upper-right, the warrior in front with shield raised, the mage behind channeling blue energy from both hands."
- **Name the JRPG tradition.** Referencing specific visual lineages helps ground the style: "in the tradition of Yoshitaka Amano's watercolor concept art" or "cel-shaded in the style of Ni no Kuni" or "16-bit pixel art reminiscent of Chrono Trigger's overworld sprites."
- **Separate content from style.** The Planner handles *what* appears; the Stylist handles *how* it looks. Keep these concerns cleanly separated in your prompts for better controllability.
- **Describe lighting as a narrative tool.** JRPG art uses lighting to convey mood: warm golden rim-light for heroic moments, harsh blue-white underlighting for villain reveals, soft pink ambient glow for emotional scenes.
- **Specify negative space.** JRPG composition intentionally uses empty areas to direct the eye. Explicitly state where negative space should appear ("leave the upper-right quadrant as open sky to frame the castle silhouette").
- **Use element hierarchy.** List scene elements in priority order. The Visualizer should ensure the highest-priority elements are rendered with the most detail and prominence, while lower-priority elements recede into the background.

---

## Key Metrics for Self-Evaluation

When Claude Code acts as the Critic, score each candidate 1–5 on these scales:

| Score | Faithfulness | Readability | Conciseness | Aesthetics |
|-------|---|---|---|---|
| **5** | Every element from the plan is present and correctly depicted | Instant visual clarity; focal point obvious; text perfectly legible | Only essential elements; clean, focused composition | Indistinguishable from professional JRPG production art |
| **4** | Minor omissions or small inaccuracies | Clear at a glance; minor layout issues | Mostly clean; 1–2 unnecessary elements | Consistent style; minor polish needed |
| **3** | Some elements missing or notably inaccurate | Requires a moment to parse; some clutter | Noticeable visual noise | Recognizably JRPG but inconsistent execution |
| **2** | Major departures from the plan | Confusing layout; overlapping elements; illegible text | Overcrowded or overly sparse | Generic or conflicting styles |
| **1** | Bears little resemblance to the described scene | Incomprehensible composition | Extreme clutter or emptiness | Does not read as JRPG art at all |

**Minimum acceptable score for final output: 4 across all primary dimensions (Faithfulness and Readability), 3 across secondary dimensions.**

---

## Reference

Zhu, D., Meng, R., Song, Y., Wei, X., Li, S., Pfister, T., & Yoon, J. (2026). PaperBanana: Automating Academic Illustration for AI Scientists. *arXiv preprint arXiv:2601.23265*.
