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
| `skills/pipeline-overview.md` | Any content creation task | Pipeline overview, Agent 1 (PM) & Agent 2 (CB) responsibilities, Sentence Token Scan Protocol, CB Checklist, spawning instructions |
| `skills/pipeline-reviewers.md` | Agent 3 and Agent 4 review passes | Agent 3 (QA) & Agent 4 (CR) responsibilities, Grammar Accuracy Gate, Grammar Scope Enforcement, Grammar Usage Validation, Grammar Reinforcement Audit |
| `skills/pipeline-handoff.md` | Any content creation task | Handoff protocol between agents, quick-start prompt template |
| `skills/content-schemas-core.md` | Building lessons, grammar, or reviews | JSON schemas for Lesson, Grammar, Review, Large Comprehensive Review |
| `skills/content-schemas-extended.md` | Building final reviews, compose, or stories | JSON schemas for Final Interactive Review, Scramble Drills, Compose, Story |
| `skills/term-tagging-forms.md` | Any content with jp + terms[] | Term tagging rules, valid form strings, particle disambiguation (が/から/でも/と), counter format |
| `skills/term-tagging-characters.md` | Content featuring recurring characters | Character name registry, ID conventions, tagging rules for lesson/review/grammar/story content |
| `skills/grammar-rules-prerequisites.md` | Any content creation task | Kanji prerequisites, vocabulary scope, lesson refresh guidelines, early-use vocabulary, grammar gating (introducedIn) |
| `skills/grammar-rules-reinforcement.md` | Any content creation task | Grammar reinforcement schedule, structural pattern reinforcement, warmup reinforcement, register requirements (polite vs casual) |
| `skills/quality-gates-criteria.md` | Agent 3 and Agent 4 review passes | Pass/fail criteria (QA hard gates + CR soft gates), file structure reference, glossary access patterns |
| `skills/quality-gates-failures.md` | Agent 3 and Agent 4 review passes | All 60+ documented failure modes (Agent 2, 3, 4 failures + cross-agent grammar failures) |

**How agents load skills:**
- Agent 1: Read `skills/pipeline-overview.md` + `skills/pipeline-handoff.md` + `skills/grammar-rules-prerequisites.md` + `skills/grammar-rules-reinforcement.md` at start of every content task
- Agent 2: Read `skills/pipeline-overview.md` + `skills/content-schemas-core.md` + `skills/content-schemas-extended.md` + `skills/term-tagging-forms.md` + `skills/term-tagging-characters.md` + `skills/grammar-rules-prerequisites.md` + `skills/grammar-rules-reinforcement.md`
- Agent 3: Read `skills/pipeline-reviewers.md` + `skills/quality-gates-criteria.md` + `skills/quality-gates-failures.md` + `skills/term-tagging-forms.md` + `skills/term-tagging-characters.md` + `skills/grammar-rules-prerequisites.md` + `skills/grammar-rules-reinforcement.md`
- Agent 4: Read `skills/pipeline-reviewers.md` + `skills/quality-gates-criteria.md` + `skills/quality-gates-failures.md` + `skills/grammar-rules-prerequisites.md` + `skills/grammar-rules-reinforcement.md`

Each skill file is sized to be read in a single Read tool call — no chunking or pagination needed.

When spawning subagents, include in the prompt: *"Read the following skill files for your full responsibilities: [list paths]."*

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
| `validate-structure.sh` | Warmup count (must be 4), N4+ 3-drill structure, Drill 1 no terms, meta.kanji required, answer/choices mismatch, review instructions/explanation/distractors, conversation lines use `spk` not `speaker`, reading `passage` is array not string | FM #6, #9b, #10b, #12, #14, #15, #16, #17, #33 |
| `validate-surface-match.sh` | Term ID surface doesn't match jp text token (vocab showing wrong thing), na-adjective missing verb_class, `polite_adj` used when jp has space-split `adj です` | FM #18, #53d, #60 |
| `validate-suru-compound.sh` | noun_suru term used with a conjugation form (should be plain noun + {v_suru, form}) | suru compound splitting |
| `validate-writing-forms.sh` | Early-use words in kanji before taught, hiragana after taught, partial-kanji form enforcement, general noun/na-adj hiragana-when-kanji-available | FM #41, #42, #43 |
| `validate-register.sh` | Casual speech before N5.10, missing casual after N5.10, register mixing within conversations | FM #44, #45, #46 |
| `validate-compose.sh` | Ungated particles, non-kanji targets, "close/wrap up" wording before challengePrompts | FM #20, #24, #25c |
| `validate-chip-order.sh` | Adjacent single-char kana+kana terms sharing a jp token where the rightmost is not listed first in terms[] (causes chip not to display) | FM #59 |

14 hooks covering 39+ failure modes. They run automatically on every content file edit — errors surface on the edit that introduces them, not 20 edits later during review.

## Campaign Files

Long-running projects tracked in `campaigns/`:

| Campaign | Status | Description |
|---|---|---|
| `campaigns/n5-qa-and-game-days.md` | Ready | N5 term QA sweep (lessons, grammar, reviews, compose, stories) + build 17 remaining game days |
| `campaigns/n4-completion.md` | Ready | Full N4.21–N4.36 refresh, build G22–G31, compose.N4.21–36, stories, review QA, game planning |
| `campaigns/n3-production.md` | Planning | Finalize vocab roadmap, QA G32–G49, begin content lesson production |
| `campaigns/godot-migration.md` | Planning | Migration from web app to Godot 4.x for iOS/Android release |

Campaign files persist across sessions. Read the relevant campaign file when resuming work.

## Writing Large Files — Commit-as-You-Go

**Required for:** full content rewrites, new grammar lessons, new review files, new stories, any file expected to take more than ~3 writing steps.

Write and commit in sections rather than generating the entire file in one pass. Each intermediate state must be valid JSON (or valid markdown). After all sections are done, squash WIP commits into one clean commit before pushing.

**Pattern:**
1. Write section(s) → commit with `WIP <task>: <what was added>`
2. Repeat until file is complete
3. `git reset --soft <last-clean-commit>` → single clean commit → force-push

**When NOT required:** small edits (1–5 field fixes), single-section additions, non-content files.

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
