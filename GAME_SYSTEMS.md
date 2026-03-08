# Game Systems — Relationships, Flags & Hidden Mechanics

This document defines the persistent state systems that track player choices across days, gate conditional content, and determine ending variants. These systems operate independently of the lesson content pipeline (CLAUDE.md) — they are game-layer mechanics only.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Relationship System](#relationship-system)
3. [Hidden Stat Counters](#hidden-stat-counters)
4. [Event Flags](#event-flags)
5. [Conditional Content Rules](#conditional-content-rules)
6. [Secret Characters](#secret-characters)
7. [Ending Variants](#ending-variants)
8. [Per-Character Breakdown](#per-character-breakdown)
9. [Day-by-Day Flag Map](#day-by-day-flag-map)
10. [Data Structure](#data-structure)

---

## System Overview

Three persistence layers track player behavior across game days:

```
┌──────────────────────────────────────────────────────────┐
│                    PLAYER STATE                          │
├──────────────────┬──────────────────┬────────────────────┤
│  RELATIONSHIPS   │  HIDDEN STATS    │  EVENT FLAGS       │
│  Per-character   │  Per-player      │  Per-event         │
│  Integer 0–MAX   │  Integer 0–∞     │  Boolean           │
│  +1/day (talk)   │  +1 per trigger  │  Set once, persist │
│  +/- from events │  Never shown     │  Never reset       │
├──────────────────┼──────────────────┼────────────────────┤
│ Unlocks:         │ Unlocks:         │ Unlocks:           │
│ - Personal quests│ - Ending variants│ - Conversations    │
│ - Dialogue vars  │ - Hidden scenes  │ - NPC appearances  │
│ - Ending changes │ - Tonal shifts   │ - Object states    │
│ - Gift options   │                  │ - Quest prereqs    │
└──────────────────┴──────────────────┴────────────────────┘
```

**Core rule:** None of these systems are ever shown to the player as numbers. There is no relationship meter, no stat screen, no flag tracker. The player discovers the effects of their choices through changed dialogue, new options, and story outcomes. The systems are invisible — the consequences are not.

---

## Relationship System

### How It Works

Every character in `shared/characters.json` that appears as an NPC in the game world has a **relationship score** tracked in the player's save data.

| Mechanic | Rule |
|---|---|
| **Base increment** | +1 per day you talk to the character (first conversation only — repeating the same conversation on the same day doesn't stack) |
| **Event bonuses** | Specific actions grant +1 or +2 beyond the daily base (documented per-character below) |
| **Event penalties** | Specific actions cause -1 or -2 (documented per-character below) |
| **Floor** | Relationship cannot go below 0 |
| **Ceiling** | No hard cap, but meaningful thresholds top out around 15–20 for N5 characters |
| **Daily cap** | Total relationship change per character per day: max +3, min -2 (prevents grinding or catastrophic loss) |
| **Persistence** | Relationship scores persist across days. They never decay. Missing a day (not talking to a character) doesn't cost points — it just doesn't gain the daily +1. |

### Relationship Thresholds

These are general tiers. Specific unlocks are documented per-character.

| Level | Score | Effect |
|---|---|---|
| Stranger | 0 | Default dialogue only |
| Acquaintance | 1–3 | Minor dialogue variants (warmer greetings, small talk) |
| Friendly | 4–7 | Personal quest becomes available, new conversation topics |
| Close | 8–12 | Quest rewards, unique items, expanded dialogue trees |
| Bonded | 13+ | Ending variant eligibility, secret scenes, special interactions |

### What Counts as "Talking To"

- Initiating any conversation with the NPC (not just walking past them)
- The conversation must play at least one full exchange (not immediately cancelled)
- Interacting with an object that triggers an NPC response does **not** count (e.g., touching Dad's gold makes him yell, but that's a reaction, not a conversation)
- Each NPC's daily +1 is tracked independently — talking to Mom and Dad both grant +1 to their respective scores

---

## Hidden Stat Counters

These are player-level stats (not per-character) that accumulate based on specific actions. They are **never displayed** and have no UI. They affect dialogue tone, available options, and ending selection.

### paranoia

> How much Rikizo has noticed — or been affected by — the wrongness of the world.

| Action | Change | Day Available |
|---|---|---|
| Open the front door to void (Day 1) | +1 | Day 1 |
| Ask Dad about the void (Day 1) | +1 | Day 1 |
| Walk to void edge in the yard (Day 2) | +1 | Day 2 |
| Ask Dad about the void again (Day 2) | +1 | Day 2 |
| Examine the void edge multiple times on the same day (3+) | +1 | Day 2+ |
| Notice the fridge has no inside (interact 3+ times) | +1 | Day 3+ |
| Interact with any "glitch" or anomaly event | +1 | Varies |
| Read specific lore objects (when available) | +1 | Late N5 |
| Witness a wasurebito-adjacent event (late N5 / N4) | +2 | Late N5+ |

**Effects:**

| paranoia | Effect |
|---|---|
| 0–2 | Rikizo is completely oblivious. Standard dialogue. |
| 3–5 | Subtle shifts: Rikizo occasionally pauses before accepting weird things. 「...そうですか。」gets a longer beat. |
| 6–8 | Rikizo starts asking questions he didn't before. New optional dialogue with observant NPCs (ゆき, ミキ). |
| 9–12 | Rikizo's inner monologue (if implemented) shows cracks. He notices things but can't articulate why they bother him. |
| 13+ | Eligible for the "Awakened" ending branch. Rikizo's dialogue in the final act changes significantly. |

**Design note:** Most players will naturally reach 3–5 through normal exploration. Reaching 9+ requires deliberately seeking out anomalies and interacting with the void/glitches repeatedly. This rewards curious, paranoid players with a richer horror layer without punishing casual players who just want the comedy.

### curiosity

> How much Rikizo explores and investigates rather than just following the main path.

| Action | Change | Day Available |
|---|---|---|
| Examine every interactable object in a room (100% room scan) | +1 | Day 1+ |
| Talk to the tree (daily — beyond the first time) | +1 | Day 2+ |
| Interact with a new object the first time it appears | +1 | Day 2+ |
| Read the calendar on a new day | +1 | Day 2+ |
| Check the phone clock unprompted (no quest requiring it) | +1 | Day 4+ |
| Find a hidden object or Easter egg | +2 | Varies |
| Complete an optional side conversation | +1 | Varies |

**Effects:**

| curiosity | Effect |
|---|---|
| 0–3 | Standard content. No extras. |
| 4–7 | NPCs occasionally offer bonus information unprompted. "Oh, you're interested? Let me tell you more..." |
| 8–12 | Hidden objects become discoverable (items that don't appear unless curiosity is high enough). |
| 13+ | Eligible for "Explorer" ending variant. Secret areas or scenes unlock. |

### dad_annoyance

> How much Rikizo has annoyed Dad specifically. This is Dad's personal patience counter.

| Action | Change | Day Available |
|---|---|---|
| Use the toilet with the door open | +1 | Day 1+ |
| Touch/try to take Dad's gold coin | +1 | Day 2+ |
| Touch the gold coin again on the same day | +1 (stacks) | Day 2+ |
| Interrupt Dad's nap/rest (future) | +1 | Varies |
| Touch Dad's new possessions (as they appear) | +1 | Varies |
| Break something (future) | +2 | Varies |
| Use the phone excessively near Dad (future) | +1 | Day 4+ |

**Cooling:** Unlike other stats, dad_annoyance decreases by -1 at the start of each new day (Dad forgives overnight, minimum 0). This means isolated incidents fade, but persistent misbehavior accumulates.

**Effects:**

| dad_annoyance | Effect (checked at time of interaction) |
|---|---|
| 0–2 | Dad is his normal comedic self. Standard dialogue. |
| 3–5 | Dad's tone gets shorter. Fewer jokes, more 「だめ！」 |
| 6–8 | Dad stops giving bonus dialogue. His personal quest becomes **locked** (cannot start until annoyance drops below 4). New grumpy lines appear. |
| 9+ | Dad gives Rikizo the silent treatment in non-essential conversations. Only mandatory plot dialogue works. Payment still happens (he's annoyed, not cruel). Quest permanently locked for this playthrough if it reaches 9+ and stays there for 3+ consecutive days. |

**Design note:** The daily -1 cooling means a player would have to deliberately antagonize Dad every single day to hit 9+. Normal play (occasional toilet gag, one gold touch per day) will hover around 2–4. The system rewards players who respect Dad's boundaries with a warmer relationship and his personal quest.

**Interaction with relationship:** dad_annoyance is checked **independently** from Dad's relationship score. You can have high relationship (you talk to him every day) AND high annoyance (you also touch his gold every day). The quest unlock requires relationship ≥ 7 AND annoyance < 4. Both conditions must be met.

---

## Event Flags

Boolean flags set by specific player actions. Once set, they persist forever (within that save file). They gate conditional content.

### Naming Convention

Flags use the format: `{action}_{context}_day{N}`

### Master Flag List

#### Day 1

| Flag | Trigger | Gates |
|---|---|---|
| `opened_front_door_day1` | Player opens the front door and sees the void | Dad's void conversation (Day 1); +1 paranoia |
| `asked_dad_void_day1` | Player talks to Dad after seeing void | Updated void dialogue (Day 2); +1 paranoia |
| `toilet_door_open_day1` | Player uses toilet without closing door | Toilet gag persists; +1 dad_annoyance |
| `talked_to_mom_day1` | Completed Mom's conversation | Mom's Day 2 dialogue variant |
| `talked_to_dad_day1` | Completed Dad's default conversation | Dad's Day 2 dialogue variant |

#### Day 2

| Flag | Trigger | Gates |
|---|---|---|
| `befriended_tree_day2` | Interacted with tree 3 times (naming sequence) | **CRITICAL:** Unlocks 木-さん dialogue for ALL future days. Without this flag, tree interactions remain generic 「木です。」forever. |
| `touched_gold_day2` | Tried to take Dad's gold coin | +1 dad_annoyance; gold gag response |
| `visited_void_edge_day2` | Walked to void edge in yard | +1 paranoia; Dad void conversation (Day 2) |
| `picked_up_water_day2` | Collected the water bottle | Inventory tutorial complete |

#### Day 3

| Flag | Trigger | Gates |
|---|---|---|
| `received_payment_day3` | Completed Dad's payment conversation | Currency system active; phone payment setup (Day 4) |
| `asked_family_count_day3` | Completed Mom's family count conversation | +1 curiosity; seeds the missing brother mystery |
| `noticed_fridge_day3` | Interacted with fridge 3+ times | +1 paranoia; special fridge dialogue on Day 9 when 中 unlocks |

#### Day 4

| Flag | Trigger | Gates |
|---|---|---|
| `received_phone_day4` | Completed Dad's phone conversation | Phone UI active; automatic payments enabled |
| `tried_cake_day4` | Interacted with Mom's cake | Cake dialogue; Mom's possessiveness established |
| `checked_clock_day4` | Interacted with the wall clock | +1 curiosity; time awareness established |
| `asked_dad_week_day4` | Heard Dad's 「今週は大切ですよ」 line | Seeds Golden Week mystery |

*(Flags for Days 5+ will be added as those days are written.)*

---

## Conditional Content Rules

### How Conditional Dialogue Works

Each conversation node or object interaction can have **conditions** — a set of flag/relationship/stat checks that must pass for the content to appear.

**Condition types:**

```
flag:befriended_tree_day2 = true        // Flag must be set
rel:char_taro >= 7                       // Relationship threshold
stat:paranoia >= 5                       // Hidden stat threshold
stat:dad_annoyance < 4                   // Hidden stat below threshold
day >= 5                                 // Day number check
AND / OR combinators                     // Multiple conditions
```

**Examples:**

| Content | Condition | Fallback |
|---|---|---|
| 木-さん daily greeting | `flag:befriended_tree_day2` | Generic 「木です。」 |
| Dad's personal quest start | `rel:char_taro >= 7 AND stat:dad_annoyance < 4` | Quest doesn't appear |
| ゆき's void observation | `stat:paranoia >= 6 AND day >= 11` | ゆき's standard dialogue |
| Secret ending scene | `stat:paranoia >= 13 AND rel:char_tree >= 15` | Standard ending |
| Dad's grumpy lines | `stat:dad_annoyance >= 6` | Normal Dad lines |

### Fallback Rule

Every piece of conditional content **must** have a fallback. If the condition isn't met, the player sees the default version — never a blank or broken interaction. The game is always fully playable regardless of flag state. Conditional content is bonus/variant, never required.

---

## Secret Characters

Some entities that are not standard NPCs can develop into characters with relationship tracking if the player invests in them.

### 木-さん (Tree-san)

**Character type:** Secret / conditional NPC

**How it works:**
- **Without `befriended_tree_day2`:** The tree is a generic object. 「木です。」 forever. No relationship tracking.
- **With `befriended_tree_day2`:** The tree becomes a tracked "character" with its own relationship score. Daily greeting = +1 relationship per day. The tree never talks back — Rikizo talks TO it — but the relationship score determines how the tree factors into the ending.

**Relationship tracking ID:** `char_tree` (not in characters.json — this is a game-state-only tracker, not a lesson content character)

| Score | Dialogue Evolution |
|---|---|
| 0 | (Flag not set) 「木です。」 |
| 1 | 「木-さん、今日もいい日ですね。」(Daily greeting unlocked) |
| 2–4 | Rikizo starts sharing his day. 「木-さん、今日は...」+ brief summary of what happened. |
| 5–8 | Rikizo asks the tree questions he doesn't ask anyone else. 「木-さん、外の白いのは... 何ですか？」 These are the only moments Rikizo comes close to questioning the world. |
| 9–12 | Rikizo confides things. 「木-さんだけ... 分かります。」("Only Tree-san... understands.") The tree becomes his emotional anchor. |
| 13–15 | Rikizo's dialogue becomes genuinely touching. He's built a real relationship with a tree. The absurdity and sincerity coexist. |
| 15+ | **Ending eligible:** Tree-san can affect the final sequence. See [Ending Variants](#ending-variants). |

**The comedy:** Rikizo is pouring his heart out to a tree. The tree does not respond. It is a tree. Rikizo doesn't care. This is his best friend. The relationship score tracks how deep this one-sided friendship goes, and the game rewards the player's commitment to the bit with genuinely emotional payoff.

**Consistency rule:** Every day that Rikizo greets the tree (and the flag is set), the tree's relationship goes up by exactly +1. No bonus events, no penalties. Just consistency. The reward for talking to your tree every single day is that Tree-san saves the day at the end. Dedication is the mechanic.

### Future Secret Characters

*(Placeholder — additional secret characters will be documented as the story develops.)*

| Candidate | Concept | Unlock Condition |
|---|---|---|
| The Void | Does the void... respond? Eventually? | paranoia ≥ 10 + specific void interactions |
| The Fridge | Same energy as Tree-san but for the fridge | Interact with fridge every day before it has an inside |
| ??? | Late N5 / N4 reveals | TBD |

---

## Ending Variants

The game's ending is determined by a combination of relationship scores, hidden stats, and flags. Multiple factors can be true simultaneously — the game selects the highest-priority ending whose conditions are all met.

### Ending Priority (highest to lowest)

| Priority | Ending | Key Conditions | Description |
|---|---|---|---|
| 1 | **Tree-san Saves the Day** | `rel:char_tree >= 15 AND flag:befriended_tree_day2` | In the final crisis, the tree does something impossible. It shouldn't be able to help — it's a tree. But Rikizo believed in it from Day 2, and in this world, belief has weight. The specifics depend on the final arc's design, but the tree intervenes in a way that is both absurd and emotionally resonant. The comedy and the sincerity land simultaneously. |
| 2 | **Awakened** | `stat:paranoia >= 13` | Rikizo has noticed too much. In the final act, his dialogue changes — he stops accepting things. He questions the world, the void, the materializations. The ending is darker, more aware. Rikizo isn't having a great Golden Week anymore. He knows something is wrong. |
| 3 | **Explorer** | `stat:curiosity >= 13` | Rikizo's relentless investigation uncovers something the other endings miss. A hidden room, a secret object, a piece of information that recontextualizes everything. The ending is revelatory — the player is rewarded for looking under every rock. |
| 4 | **Family** | `rel:char_taro >= 12 AND rel:char_sakura >= 12` | The ending focuses on the family unit. Dad and Mom's dialogue in the final sequence is warmer, more open. They share things they wouldn't otherwise. The missing brother is addressed directly. The ending is the most emotionally complete — but requires investment in both parents. |
| 5 | **Standard** | (default — always available) | The baseline ending. Rikizo has a great Golden Week. Things are weird but he's happy. The world keeps materializing. Life goes on. Satisfying but doesn't resolve the mysteries. Exists so every player gets a complete experience. |

**Combo endings:** If multiple conditions are met, the game uses the highest-priority ending but can **weave in elements** from lower-priority ones. For example, a player with Tree-san at 15+ AND paranoia at 13+ gets the Tree-san ending but with Awakened-flavored dialogue. The primary ending determines the final scene; secondary qualifications add texture.

---

## Per-Character Breakdown

### たろう (Dad) — char_taro

**Relationship sources:**
| Action | Change | Repeatable? |
|---|---|---|
| Daily conversation | +1 | 1x per day |
| Complete a lesson (he cares about Rikizo's teaching) | +1 | 1x per lesson completion |
| Avoid touching his gold for 3 consecutive days | +1 (bonus) | Resets if you touch gold |
| Give Dad a gift (when gift system exists) | +1 to +2 | Per gift |

**Annoyance sources:** (See [dad_annoyance](#dad_annoyance) above)

**Personal quest:** "Dad's Gold" — Unlocks at relationship ≥ 7, annoyance < 4. Dad tells the story of where the gold coin came from. Multi-step quest across several days. Reward: a unique item and a permanent +3 relationship bonus. The quest reveals something about the family that connects to the larger mystery.

**Quest lock:** If annoyance hits 9+ and stays there for 3 consecutive days, the quest is permanently locked for this playthrough. The player must start a new save to try again. This is harsh but fair — it takes deliberate, sustained antagonism to trigger.

### さくら (Mom) — char_sakura

**Relationship sources:**
| Action | Change | Repeatable? |
|---|---|---|
| Daily conversation | +1 | 1x per day |
| Check the calendar | +1 (first time each day) | 1x per day |
| Help Mom with a task (when task system exists) | +1 | Per task |

**No annoyance counter.** Mom is patient. She doesn't get annoyed — she gets worried. High curiosity or paranoia + close relationship with Mom unlocks dialogue where she almost breaks character and says something real about the world.

**Personal quest:** "The Fourth Person" — Unlocks at relationship ≥ 8. Across several days, Mom gradually reveals more about the family count. She still doesn't name the brother directly, but her dialogue cracks open enough that the player pieces it together. Reward: a photograph item (the family photo from before Rikizo "arrived") and a permanent +2 relationship bonus.

### 木-さん (Tree-san) — char_tree

**Relationship sources:**
| Action | Change | Repeatable? |
|---|---|---|
| Daily greeting (only if befriended) | +1 | 1x per day |

**No bonus events, no penalties.** The tree's relationship is pure consistency. Talk to it every day. That's it. The reward is proportional to commitment — miss a day and you lose nothing, but you don't gain either. The ending requires ~15 days of consecutive greeting. A player who befriends the tree on Day 2 and talks to it every day through Day 18 will have a score of 16 — just enough.

**No personal quest.** The tree IS the quest. The quest is talking to it every day. The reward is the ending.

### やまかわ — char_yamakawa (from Day 5+)

*(Detailed breakdown to be written when Day 5 is designed. Preview:)*

- Best friend archetype. High relationship unlocks co-exploration dialogue.
- Personal quest: "Yamakawa's Appetite" — involves finding food items.
- Yamakawa is the first NPC who occasionally says things that don't quite make sense — foreshadowing.

### ゆき — char_yuki (from Day 11+)

*(Detailed breakdown to be written when Day 11 is designed. Preview:)*

- The "almost-aware" character. She's the closest to questioning the world.
- High paranoia + high relationship with Yuki = the deepest lore conversations in N5.
- Personal quest: "What Yuki Remembers" — she has fragments of memory that don't belong to this timeline.

---

## Day-by-Day Flag Map

Quick reference: what flags can be set on each day, and what they gate.

### Day 1

```
AVAILABLE FLAGS:
  opened_front_door_day1 ──→ Gates: Dad void conversation, +1 paranoia
  asked_dad_void_day1    ──→ Gates: Day 2 void dialogue update, +1 paranoia
  toilet_door_open_day1  ──→ Gates: +1 dad_annoyance
  talked_to_mom_day1     ──→ Gates: Mom Day 2 dialogue variant
  talked_to_dad_day1     ──→ Gates: Dad Day 2 dialogue variant

RELATIONSHIP AVAILABLE:
  char_taro:  +1 (daily talk), +1 (if completed void conversation)
  char_sakura: +1 (daily talk)

HIDDEN STATS:
  paranoia: 0–2 possible
  dad_annoyance: 0–1 possible
```

### Day 2

```
AVAILABLE FLAGS:
  befriended_tree_day2 ──→ Gates: 木-さん dialogue FOREVER. This is the
                           single most important optional flag in the game.
  touched_gold_day2    ──→ Gates: +1 dad_annoyance
  visited_void_edge_day2 ──→ Gates: +1 paranoia, Dad void conv Day 2
  picked_up_water_day2 ──→ Gates: Inventory tutorial complete

RELATIONSHIP AVAILABLE:
  char_taro:   +1 (daily talk)
  char_sakura: +1 (daily talk)
  char_tree:   +1 (if befriended — first day of tracking)

HIDDEN STATS:
  paranoia: 0–4 cumulative possible
  curiosity: 0–3 possible (room scan, tree talk, new objects)
  dad_annoyance: 0–2 cumulative possible (net, after -1 cooling)
```

### Day 3

```
AVAILABLE FLAGS:
  received_payment_day3  ──→ Gates: Currency system, phone payment (Day 4)
  asked_family_count_day3 ──→ Gates: +1 curiosity, brother mystery seed
  noticed_fridge_day3    ──→ Gates: +1 paranoia, special Day 9 fridge scene

RELATIONSHIP AVAILABLE:
  char_taro:   +1 (daily talk), +1 (payment conversation)
  char_sakura: +1 (daily talk), +1 (family count conversation)
  char_tree:   +1 (daily greeting, if befriended)

HIDDEN STATS:
  paranoia: 0–5 cumulative possible
  curiosity: 0–6 cumulative possible
  dad_annoyance: 0–2 cumulative (cooling helps)
```

### Day 4

```
AVAILABLE FLAGS:
  received_phone_day4  ──→ Gates: Phone UI, auto-payments
  tried_cake_day4      ──→ Gates: Cake dialogue, Mom possessiveness
  checked_clock_day4   ──→ Gates: +1 curiosity
  asked_dad_week_day4  ──→ Gates: Golden Week mystery seed

RELATIONSHIP AVAILABLE:
  char_taro:   +1 (daily talk), +1 (phone conversation)
  char_sakura: +1 (daily talk), +1 (cake conversation counts)
  char_tree:   +1 (daily greeting, if befriended)

HIDDEN STATS:
  paranoia: 0–6 cumulative possible
  curiosity: 0–9 cumulative possible
  dad_annoyance: 0–3 cumulative (cooling helps; cake doesn't annoy Mom)
```

---

## Data Structure

### Save Data Schema (per save file)

```json
{
  "saveVersion": "1.0.0",
  "currentDay": 4,
  "currency": 2000,
  "inventory": ["water_bottle", "smartphone"],

  "relationships": {
    "char_taro": 6,
    "char_sakura": 4,
    "char_tree": 3,
    "char_yamakawa": 0,
    "char_yuki": 0
  },

  "hiddenStats": {
    "paranoia": 3,
    "curiosity": 5,
    "dad_annoyance": 1
  },

  "flags": {
    "opened_front_door_day1": true,
    "asked_dad_void_day1": true,
    "befriended_tree_day2": true,
    "received_payment_day3": true,
    "asked_family_count_day3": true,
    "received_phone_day4": true,
    "tried_cake_day4": true
  },

  "dailyTracking": {
    "day4": {
      "talkedTo": ["char_taro", "char_sakura", "char_tree"],
      "annoyed": ["toilet_open"],
      "explored": ["clock", "cake", "void_edge"]
    }
  }
}
```

**Notes:**
- `relationships` uses `char_*` IDs matching the game character system. `char_tree` is game-only (not in `shared/characters.json`).
- `dailyTracking` resets each day and is used to prevent duplicate +1s within the same day.
- `flags` only contains flags that have been set to `true`. Absent = `false`.
- `hiddenStats` are computed values — `dad_annoyance` applies -1 cooling at day start before any Day N interactions.

### Where This Lives (Implementation)

This is a **game design document**, not an implementation spec. The actual save system will be built when the game engine is implemented. This doc defines the rules; the engine implements them.

The key architectural decision: **all condition checks happen at dialogue/interaction time**, not pre-computed. When Rikizo talks to a tree, the game checks `flag:befriended_tree_day2` right then. When Dad's quest is queried, it checks `rel:char_taro >= 7 AND stat:dad_annoyance < 4` right then. This keeps the system simple — save data is flat, logic is in the dialogue scripts.

---

## Design Principles

1. **Invisible mechanics, visible consequences.** No numbers on screen. The player knows Dad is annoyed because his dialogue changes, not because a meter went down.

2. **Reward curiosity, don't punish caution.** A player who never opens the front door, never befriends the tree, and never touches the gold still gets a complete game. They just get the Standard ending with default dialogue. Every flag, relationship, and stat is bonus content.

3. **Consistency is the hardest currency.** Tree-san's ending requires ~15 days of daily greeting. No shortcuts, no bonus events. Just show up and talk to your tree. This is the single most demanding thing in the game, and its reward is the best ending.

4. **Dad's annoyance is fair.** It cools daily. You have to work to keep Dad angry. Isolated incidents are forgotten. The quest lock at 9+ sustained requires deliberate griefing — a normal player will never hit it accidentally.

5. **Paranoia is self-selecting.** Players who seek out the void, investigate anomalies, and interact with glitches get a darker, richer experience. Players who ignore the weird stuff get a lighter, funnier one. Both are valid. The game adapts to how the player plays.

6. **No missable critical content.** Nothing required for game completion is gated behind flags or relationships. Endings, quests, and dialogue variants are all bonus layers on top of a complete base experience.
