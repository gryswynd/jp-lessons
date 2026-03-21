# Rikizo Japanese Lessons — Project Instructions

> **⚠️ SCOPE: LESSON & LEARNING CONTENT ONLY.** This file governs educational content creation. For art assets, follow `RikizoArtPipeline.md`. Never mix the two systems.

## Tech Stack & Architecture

- **Current platform:** Web app (HTML/JS) embedded via Webflow
- **Future platform:** Godot 4.x → iOS/Android (see `campaigns/godot-migration.md`)
- **Content format:** JSON lesson files + markdown stories
- **Data files:** `manifest.json`, `glossary.N5.json`, `glossary.N4.json`, `conjugation_rules.json`, `counter_rules.json`, `shared/particles.json`, `shared/characters.json`
- **Rendering engine:** `app/shared/text-processor.js` (conjugation, chip generation, GODAN_MAPS)
- **Grammar spec:** `GRAMMAR_CONTENT.md` — authoritative source for grammar lesson scope

## The Content Pipeline

All content creation runs through a **4-agent pipeline**. No content may skip a stage.

```
User Request → Agent 1 (PM) → Agent 2 (CB) → Agent 3 (QA) → Agent 4 (CR) → Repo
                    ↑              ↑
                    └──── FAIL ────┘  (Agent 3 or 4 can reject → loop back)
```

- **Agent 1 (Project Manager):** Scopes, plans, builds Content Brief, spawns subagents, writes final output
- **Agent 2 (Content Builder):** Writes JSON/MD content from the Content Brief
- **Agent 3 (QA Reviewer):** Mechanical audit — kanji scope, term IDs, tagging completeness, form validity
- **Agent 4 (Consistency Reviewer):** Natural language, grammar reinforcement, redundancy, skill progression

Agents 2–4 run as **independent subprocesses** via the `Agent` tool. Each receives only what is explicitly passed — no shared conversation history.

## Skill Files (load on demand)

Detailed rules live in modular skill files under `skills/`. Load only what's needed for the current task.

| Skill file | When to load | What it contains |
|---|---|---|
| `skills/pipeline.md` | Any content creation task | Full agent responsibilities, Content Brief format, Sentence Token Scan Protocol, CB Checklist, handoff protocol, spawning instructions |
| `skills/content-schemas.md` | Building any content type | JSON schemas for lessons, grammar, reviews, compose, stories, scramble drills, final interactive reviews |
| `skills/term-tagging.md` | Any content with jp + terms[] | Term tagging rules, form strings, particle disambiguation (が/から/でも/と), character name tagging, counter format |
| `skills/grammar-rules.md` | Any content creation task | Kanji prerequisites, vocabulary scope, grammar gating (introducedIn), reinforcement schedule, register requirements (polite vs casual), early-use vocabulary |
| `skills/quality-gates.md` | Agent 3 and Agent 4 review passes | Pass/fail criteria, file structure reference, glossary access patterns, all 60+ documented failure modes |

**How agents load skills:**
- Agent 1: Read `skills/pipeline.md` + `skills/grammar-rules.md` at start of every content task
- Agent 2: Read `skills/content-schemas.md` + `skills/term-tagging.md` + `skills/grammar-rules.md`
- Agent 3: Read `skills/quality-gates.md` + `skills/term-tagging.md` + `skills/grammar-rules.md`
- Agent 4: Read `skills/quality-gates.md` + `skills/grammar-rules.md`

> **⚠️ SKILL FILE SIZE WARNING:** Skill files exceed the 10,000-token Read tool limit. Always use `offset` + `limit` parameters when reading them. Read in 200-line chunks (e.g. `offset: 1, limit: 200`, then `offset: 201, limit: 200`, etc.) until the full file is covered. Never attempt to read a skill file without pagination — it will fail with a token limit error.

When spawning subagents, include in the prompt: *"Read the following skill files for your full responsibilities: [list paths]. Each skill file exceeds 10,000 tokens — read them in 200-line chunks using offset/limit parameters."*

## Validation Hooks

Automated hooks in `hooks/` enforce rules that the environment should catch, not instructions:

| Hook | What it catches | Failure Modes covered |
|---|---|---|
| `validate-json.sh` | Invalid JSON syntax (trailing commas, unclosed brackets) | CB Checklist |
| `validate-kanji-scope.sh` | Untaught kanji in jp/passage fields | FM #1 |
| `validate-term-ids.sh` | Fabricated IDs, k_* in conversations, invalid form strings | FM #4, #5, #7 |
| `validate-deprecated-forms.sh` | desire_tai (deprecated), k_* outside kanjiGrid | FM #53c |
| `validate-form-scope.sh` | Conjugation forms used before introducedIn lesson | FM #30 |
| `validate-particle-context.sh` | Particle disambiguation: が (p_ga vs p_ga_but), から (p_kara vs p_kara_because), でも (p_demo vs p_demo_but), と (p_to vs p_to_quote), missing p_ka on questions | FM #34, #35, #36, #37, #58 |
| `validate-grammar-schema.sh` | Grammar section silent failures: wrong field names (annotatedExample→examples[], grammarComparison→items[], fillSlot→before/after), pattern chip color/label, sentenceTransform choices, meta.particles strings vs IDs | FM #56, #56b–f |
| `validate-structure.sh` | Warmup count (must be 4), N4+ 3-drill structure, Drill 1 no terms, meta.kanji required, answer/choices mismatch, review instructions/explanation/distractors | FM #6, #9b, #10b, #12, #14, #15, #16, #17, #33 |
| `validate-surface-match.sh` | Term ID surface doesn't match jp text token (vocab showing wrong thing), na-adjective missing verb_class | FM #18, #53d, #60 |
| `validate-writing-forms.sh` | Early-use words in kanji before taught, hiragana after taught, partial-kanji form enforcement | FM #41, #42, #43 |
| `validate-register.sh` | Casual speech before N5.10, missing casual after N5.10, register mixing within conversations | FM #44, #45, #46 |
| `validate-compose.sh` | Ungated particles, non-kanji targets, "close/wrap up" wording before challengePrompts | FM #20, #24, #25c |

12 hooks covering 35+ failure modes. They run automatically on every content file edit — errors surface on the edit that introduces them, not 20 edits later during review.

## Campaign Files

Long-running projects tracked in `campaigns/`:

| Campaign | Status | Description |
|---|---|---|
| `campaigns/n5-qa-and-game-days.md` | Ready | N5 term QA sweep (lessons, grammar, reviews, compose, stories) + build 17 remaining game days |
| `campaigns/n4-completion.md` | Ready | Full N4.21–N4.36 refresh, build G22–G31, compose.N4.21–36, stories, review QA, game planning |
| `campaigns/n3-production.md` | Planning | Finalize vocab roadmap, QA G32–G49, begin content lesson production |
| `campaigns/godot-migration.md` | Planning | Migration from web app to Godot 4.x for iOS/Android release |

Campaign files persist across sessions. Read the relevant campaign file when resuming work.

## Critical Rules (the 5 things that matter most)

1. **Never read glossary files in full.** Use targeted Grep queries only — they exceed token limits.
2. **Every kanji in jp text must be in the taught-kanji set** from manifest.json. No exceptions.
3. **Every content word in jp text must be tagged in terms[]** — including kana-only words, particles, copulas.
4. **Conjugation forms are gated by introducedIn** in conjugation_rules.json. A form used before its lesson is a hard fail.
5. **Grammar lessons scope comes from GRAMMAR_CONTENT.md only** — never infer grammar points from titles.

## File Paths Quick Reference

| Content type | Path |
|---|---|
| Lessons | `data/N5/lessons/N5.X.json`, `data/N4/lessons/N4.X.json` |
| Grammar | `data/N5/grammar/G1.json` … `data/N4/grammar/G31.json` |
| Reviews | `data/N4/reviews/N4.Review.X.json` |
| Final Reviews | `data/N5/reviews/N5.Final.Review.json` |
| Compose | `data/N5/compose/compose.N5.X.json` |
| Stories | `data/N5/stories/[slug]/story.md` + `terms.json` |
| Skills | `skills/*.md` |
| Hooks | `hooks/*.sh` |
| Campaigns | `campaigns/*.md` |

After writing new content files, update `manifest.json`.
