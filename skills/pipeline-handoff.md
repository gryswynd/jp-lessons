# Content Pipeline — Handoff Protocol & Quick Start (Part 3)

> **Loaded by:** Agent 1 (Project Manager) for orchestration reference.
> **Purpose:** Defines the handoff protocol between agents and the quick-start prompt template for Claude Code.
> **See also:** `skills/pipeline-overview.md` (Pipeline overview + Agents 1 & 2), `skills/pipeline-reviewers.md` (Agents 3 & 4).

---

## The Handoff Protocol

Each handoff **must** include:

1. The current draft (JSON/MD in a code block)
2. The originating Content Brief
3. The previous agent's output document (checklist, QA report, or consistency note)
4. A one-line summary: `Passing to Agent N — [reason]`

Never silently forward content without the accompanying documents. If an agent discovers an issue outside its own scope, it must still forward the document but add a note flagging the out-of-scope issue for the receiving agent to handle.


---

## Quick Start Prompt for Claude Code

When the user says something like *"Create a lesson for N5.3"* or *"Add a new compose prompt for N5.6"* or *"Write a story for N4 lessons 7–9"*, Agent 1 runs in the main context. Agents 2, 3, and 4 are spawned as independent subprocesses via the `Agent` tool.

**Agent 1 (main context) — always announce what you're doing:**

```
=== AGENT 1: PROJECT MANAGER ===
Reading manifest.json and glossary to build Content Brief...
[Content Brief here]
Spawning Agent 2...
```

**Spawning Agent 2:**
Use the `Agent` tool with a prompt that includes the Content Brief, dependency file paths, and the instruction to read the relevant skill files. Do not include the full conversation history — only what Agent 2 needs. Label the spawn clearly:

```
=== SPAWNING AGENT 2: CONTENT BUILDER ===
```

**When Agent 2 returns, announce receipt and spawn Agent 3:**

```
=== AGENT 2 RETURNED — spawning Agent 3: QA REVIEWER ===
```

Pass Agent 2's draft + the Content Brief to Agent 3. Do not include Agent 2's reasoning — only the draft JSON and the brief.

**When Agent 3 returns:**
- PASS → announce and spawn Agent 4:
  ```
  === AGENT 3: QA-PASS — spawning Agent 4: CONSISTENCY REVIEWER ===
  ```
- FAIL → show the full QA Failure Report, then re-spawn Agent 2 with it:
  ```
  === AGENT 3: QA-FAIL — re-spawning Agent 2 (Revision N) ===
  ```
- ESCALATE → present the Unregistered Word Report to the user, then re-spawn Agent 2 with the resolution

**When Agent 4 returns:**
- PASS → Agent 1 writes the file to the repo
  ```
  === AGENT 4: CR-PASS — Agent 1 writing to repo ===
  ```
- FAIL → show the full Consistency Note, update the Content Brief, re-spawn Agent 2
  ```
  === AGENT 4: CR-FAIL — Agent 1 updating brief, re-spawning Agent 2 (Revision N) ===
  ```

**Show all agent outputs in full.** Do not summarise or condense the CB Checklist, QA Failure Report, or Consistency Note. The full trail must be visible so the user can see exactly what each independent agent checked and found.
