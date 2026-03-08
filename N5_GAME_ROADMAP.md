# N5 Game Roadmap — "Golden Week"

## Core Premise

Rikizo is a high schooler on Golden Week vacation. The world outside his house is... not there yet. There is nothing outside. Literally nothing — endless white void. As lessons unlock vocabulary, the corresponding things materialize in the game world. Rikizo never questions this. The player does.

**The comedy:** Rikizo is blissfully, heroically oblivious. A building materializes where nothing was yesterday? "Oh, I never noticed that before!" The sky glitches? "Weird clouds today." Someone says something existentially terrifying? "Haha, you're funny, Yamakawa."

**The horror is for the player.** Rikizo is having a great Golden Week.

**Tone:** Somewhere between One Punch Man's comedic obliviousness and a slow-burn cosmic dread. The wasurebito are NOT visible in N5. No combat. No direct threats. Just a world that shouldn't exist, populated by people who don't remember not existing, observed by a protagonist who doesn't notice anything is wrong. The player notices everything.

## Structural Rules

- **One game day per lesson.** Completing lesson N5.X unlocks Day X.
- **Vocab/kanji from the lesson = what exists in that game day. Period.** If a kanji or word isn't taught yet, it doesn't exist in the world.
- **Day 1 = house interior only.** No yard, no outside. The front door opens to endless white void.
- **Can't leave the house until Day 5** (N5.5 teaches 行/来/店/駅 — the verbs to go/come and the places to go to).
- **Can't enter other buildings until Day 9** (N5.9 teaches 中/外 — inside/outside). Before that, shops use passthrough windows/counters.
- **School doesn't exist until Day 12** (N5.12 teaches 学/校).
- **Days 1–11 = Golden Week vacation.** Formally established in Day 10 when 休み unlocks.
- **Smartphone from Day 4.** Dad gives it to Rikizo. No messages before then.
- **Inventory from Day 2.** First collectible item is a bottle of water (水).
- **Money = teaching payment, from Day 3.** Dad gives Rikizo money he earned from tutoring (the meta: Rikizo teaches Japanese). Running gag: if the player earns too much, Dad pockets the extra claiming it's "for university." In late N4, if the player has earned absurd amounts, Dad starts appearing with luxury items he claims he "found."
- **Dad stays home Days 1–3.** He first leaves the house on Day 4 to pick up Rikizo's smartphone.
- **Game vocab:** Items that exist in the game world but aren't tied to a specific lesson live in a separate "game vocab" category (stored in `shared/helper-vocab.json` or a new `shared/game-vocab.json`). These words are tappable in-game and show glossary popups, but they don't appear in lesson vocabLists or practice queues. Examples: こたつ, れいぞうこ, ドア — household objects present from Day 1 that aren't formally taught in any lesson.
- **No combat in N5.** Still under consideration for late N5, but the current plan is combat-free. The threat is atmospheric only.
- **Save system:** Bed = save point. Game also auto-saves when exiting to the lesson menu via the laptop.
- **Laptop = "teach a lesson" exit.** Interacting with the パソコン gives the option to teach a lesson, which saves and exits to the main menu / lesson select. This is the core game↔learning bridge. Dad's 「先生をするよ」 dialogue is literally telling the player to go use the laptop.
- **Progression:** Completing a lesson with a high enough score unlocks the next game day (and other content throughout the app). The game day does not advance from within the game — it advances from lesson completion.
- **Persistent state:** Relationships, hidden stats (paranoia, curiosity, dad_annoyance), and event flags are tracked across days and determine dialogue variants, quest availability, and ending selection. See `GAME_SYSTEMS.md` for the full spec. **No numbers are ever shown to the player.** The systems are invisible — the consequences are not.

## Character Roster (N5)

| Character | ID | First Appears | Role |
|---|---|---|---|
| Mom (さくら) | `char_sakura` | Day 1 (in person) | Home base, emotional anchor |
| Dad (たろう) | `char_taro` | Day 1 (in person) | Home base, comic relief |
| すずき先生 | `char_suzuki` (TODO: add to characters.json) | Day 4 (smartphone), Day 12 (in person) | School Japanese teacher |
| やまもと先生 | `char_yamamoto` | TBD | School teacher (different from Suzuki) |
| やまかわ | `char_yamakawa` | Day 4 (smartphone), Day 5 (in person) | Best friend, exploration buddy, always eating |
| ゆき | `char_yuki` | Day 11 | Quiet nature lover, the only one who gently questions things |
| けん | `char_ken` | Day 12 | Upbeat classmate, goofy, fails to impress teachers |
| リー | `char_lee` | Day 12 | Exchange student, enthusiastic about Japanese |
| ミキ | `char_miki` | Day 12 | Always reading, intellectual, future mystery-investigator (N4) |
| レン | `char_ren` | Day 17 | Works everywhere, hustler, doesn't understand the concept of rest |
| ナナ | `char_nana` | Day 17 | Obsessively records everything "before she forgets" |

**TODO:** Remove `char_ali` from characters.json. Add `char_suzuki` to characters.json.

---

## Day 1 — "Home" (unlocked by N5.1: People & Family)

### Lesson Kanji & Key Vocab Available

**Kanji (10):** 人、男、女、子、友、母、父、名、生、先

**Vocab highlights:**
- Family: 父 (ちち), 母 (はは), お父さん, お母さん, 父母
- People: 人, 人々, 男子, 女子, 友だち
- Descriptors: いい, やさしい, うれしい, とても, たくさん, いちばん
- Pronouns: わたし, あなた, だれ
- Verbs: いる (exist/animate), ある (exist/inanimate), する, 生きる, 生まれる
- Household items: ベッド, パソコン, テレビ, トイレ
- Greetings: おはよう, こんにちは, こんばんは, おやすみなさい, はじめまして, よろしくおねがいします, ありがとう(ございます), すみません
- Grammar: です, だ, は, が, を, の, か, よ, ね, では, じゃ

**Particles (N5.1):** は, が, を, の, か, よ, ね, では, じゃ

**Grammar available:** Dictionary forms only + polite_adj (い-adj + です). No verb conjugation yet (polite_masu doesn't unlock until N5.5). This means NPC dialogue is limited to noun-です sentences, い-adjective+です sentences, and verbs in dictionary form. Plan accordingly.

**Not available yet:** No smartphone. No inventory. No money. No outside. Just the house and Rikizo's family.

### Location

**Rikizo's house — interior only.** There is no outside. Opening the front door reveals endless white void in every direction. No yard, no fence, no gate — just nothing. Rikizo can stand in the doorway but cannot step out. This is the first thing the player encounters that is deeply, fundamentally wrong. Rikizo does not think it is wrong.

**Rooms:**
- Rikizo's bedroom (ベッド, パソコン)
- Living room (テレビ, こたつ)
- Kitchen (れいぞうこ, table)
- Bathroom/toilet (トイレ, ドア that opens/closes)
- Entryway (front ドア → void)

### NPCs

#### Mom (さくら) — Kitchen area

Mom is the warm, supportive anchor of the early game. She greets Rikizo in the morning.

**Conversation (5 lines):**
1. **Mom:** 「おはよう、りきぞ！」 — "Good morning, Rikizo!"
2. **Rikizo:** 「おはよう、お母さん。」 — "Good morning, Mom."
3. **Mom:** 「あなたはとてもいい先生ですよ。」 — "You are a very good teacher, you know."
4. **Rikizo:** 「そうですか？うれしいです！」 — "Really? That makes me happy!"
5. **Mom:** 「お母さんがいちばんうれしいですよ。」 — "Mom is the happiest of all."

This conversation establishes the meta-narrative — Rikizo is a teacher. The player is his student.

**Repeatable line (after first conversation):** 「いい子ですね。」("You're a good kid.")

#### Dad (たろう) — Living room area

Dad is the comic relief anchor. Slightly stern, protective, fundamentally kind. On Day 1 he has two conversations: his default intro, and a triggered one about the void.

**Default conversation (5 lines):**
1. **Dad:** 「よ、りきぞ！先生ですか？」 — "Hey, Rikizo! Are you a teacher?"
2. **Rikizo:** 「はい！わたしは先生です。」 — "Yes! I am a teacher."
3. **Dad:** 「やさしい先生ですか？」 — "Are you a kind teacher?"
4. **Rikizo:** 「はい、とてもやさしい先生です！」 — "Yes, a very kind teacher!"
5. **Dad:** 「そうか。りきぞはいちばんいい先生です。」 — "Is that so. Rikizo is the best teacher."

**Triggered conversation — "The Nothing" (unlocked after opening the front door):**

When Rikizo opens the front door, he sees endless white void. He steps back inside and mutters:

> 「なにもないです...」("There's nothing out there...")

This unlocks a new conversation option with Dad:

1. **Rikizo:** 「お父さん、外はなにもないです。」 — "Dad, there's nothing outside."
2. **Dad:** 「そうですよ。なにもないです。」 — "That's right. There's nothing." *(Completely casual. Like Rikizo just told him the sky is blue.)*
3. **Rikizo:** 「...そうですか。」 — "...Is that so."
4. **Dad:** 「いい先生は先生をするよ。」 — "A good teacher goes and teaches." *(Deflection. Go do your job, kid.)*

Dad treats the void the way you'd treat a rainy day. Matter-of-fact. Untroubled. The player should be screaming internally. Rikizo accepts it and moves on.

**Repeatable line (after conversations):** 「先生！先生！」("Teacher! Teacher!") — Dad being Dad, shooing Rikizo away to go do teacher things.

### Interactive Objects

| Object | nameJp | Location | Interaction |
|---|---|---|---|
| Bed | ベッド | Bedroom | **SAVE POINT.** 「いいベッドです。」("A comfortable bed.") Interacting gives the option to save the game. |
| Laptop | パソコン | Bedroom | **TEACH A LESSON.** 「わたしのパソコンです。」("My laptop.") Interacting gives the option to exit the game and teach a lesson (returns to the app's main menu / lesson select). Auto-saves before exiting. This is the core bridge between the game world and the learning modules — Dad telling Rikizo to "go teach" is literally telling the player to use the laptop. |
| TV | テレビ | Living room | 「テレビです。」("The TV.") |
| Kotatsu | こたつ | Living room | 「こたつです。とてもいいです！」("The kotatsu. Very nice!") |
| Fridge | れいぞうこ | Kitchen | 「お母さんのれいぞうこです。」("Mom's fridge.") |
| Toilet (door open) | トイレ | Bathroom | **DOOR GAG.** If Rikizo interacts with the toilet without closing the bathroom door first, Dad yells from the living room: 「ドア！ドアです！」("The door! The DOOR!") Rikizo must close the bathroom door, then interact again → 「トイレです。」("The toilet.") Dad has a sixth sense for open bathroom doors. This persists as a running gag across the entire game. |
| Toilet (door closed) | トイレ | Bathroom | 「トイレです。」("The toilet.") |
| Bathroom door | ドア | Hallway→bathroom | Opens/closes. Required for toilet gag. |
| Other doors | ドア | Various | Standard room transitions. |
| Front door | ドア | Entryway | **THE VOID.** Opens to reveal endless white nothing. Rikizo cannot step outside. Triggers his 「なにもないです...」 line and unlocks the Dad void conversation. After that, interacting again: 「なにもないです。」 — he says it the same way every time, no drama, no concern. |

### Quests

**No quests on Day 1.** No quest system, no objectives, no checkboxes. This is pure exploration and discovery.

The player learns through doing:
- How to move Rikizo around the house
- How to interact with objects (approach + tap)
- How to talk to NPCs
- That the bathroom door mechanic exists (Dad teaches them the hard way)
- That there is nothing outside
- That the laptop exits to the lesson menu (the core game loop)
- That the bed saves the game

The implicit flow: explore the house → open the front door (void) → talk to Dad about it → Dad says go teach → use the laptop → exit to lesson menu → complete N5.2 with a passing score → Day 2 unlocks.

### Story Beats

| Moment | What Happens | What Rikizo Thinks | What the Player Should Feel |
|---|---|---|---|
| Opening the front door | Endless white void. No ground, no sky, no horizon. Just white. | 「なにもないです...」(mild puzzlement, moves on) | **What the hell.** There is NOTHING out there. |
| Asking Dad about the void | Dad confirms it casually: "Yep, nothing. Go teach." | Accepts it completely | Dad KNOWS there's nothing and doesn't care? This family is living in a house surrounded by nonexistence and treating it as normal? |
| Toilet door gag | Dad yells about the door from across the house | Closes the door, mildly embarrassed | Comic relief. Dad is funny. Also — how did he know from the living room? |
| Talking to Mom | Warm, loving, encouraging | Happy to be appreciated | Cozy. Normal. Safe. (This contrast with the void outside is the point.) |
| Using the laptop | Option to "teach a lesson" — exits to main menu | Rikizo is a teacher, this is his job | The meta-narrative clicks: Dad said "go teach." The laptop lets you teach. Completing lessons changes the game world. The player IS Rikizo's student. |
| Exploring the house | Every object has a simple です description | Just naming things, being Rikizo | The house is small and complete. The world beyond it does not exist. The player sits with that. |

**Tone calibration for Day 1:** The void is the only "wrong" thing. Everything inside the house is warm, cozy, and comedic. The player's discomfort comes from the gap between how terrifying "there is nothing outside" is versus how utterly unbothered everyone is about it. Day 1 should end with the player thinking: "This is fine. This is... probably fine."

### Running Gags Established

1. **The Toilet Door** — Dad's sixth sense. Persists every day, forever. Dad always knows. Even when he's at work (later days). Even when he's not in the house. Somehow, Dad knows.

### Assets Required

| Asset | Type | Mode | Priority | Notes |
|---|---|---|---|---|
| House interior map | Tilemap | A (Pixel) | **EXISTS** (map.png) | May need revision: remove yard/gate areas, ensure front door leads to void edge. |
| Collision map | Data | A (Pixel) | **EXISTS** (collision.png) | Update to match revised map. |
| Conversation background | Illustration | B (MP100) | **EXISTS** (convo-bg.png) | |
| Rikizo sprite | Sprite | A (Pixel) | **PARTIAL** (head exists) | Full walking sprite sheet needed. |
| Rikizo conversation portrait | Portrait | B (MP100) | Needed | Calm register. Friendly, open expression. |
| Mom sprite | Sprite | A (Pixel) | Needed | Kitchen/domestic pose. |
| Mom conversation portrait | Portrait | B (MP100) | Needed | Warm, gentle. At least 2 expressions (default, happy). |
| Dad sprite | Sprite | A (Pixel) | Needed | Living room pose. Slightly stern but kind. |
| Dad conversation portrait | Portrait | B (MP100) | Needed | At least 2 expressions (default, stern/yelling for toilet gag). |
| Void visual | Effect/tile | A (Pixel) | Needed | What the player sees when the front door opens. White void — no ground, no sky, no texture. Just flat white extending forever. Should feel empty, not bright. |

### Non-Kanji Real-World Vocab Used

| Word | Meaning | Glossary ID | In Glossary? | Notes |
|---|---|---|---|---|
| ベッド | bed | v_beddo | Yes (N5.1) | |
| パソコン | computer | v_pasokon | Yes (N5.1) | |
| テレビ | TV | v_terebi | Yes (N5.1) | |
| トイレ | toilet | v_toire | Yes (N5.1) | |
| ドア | door | v_doa | Game vocab | Door interactions and toilet gag |
| こたつ | kotatsu | v_kotatsu | Game vocab | Household item, present from Day 1 |

### Resolved Design Decisions

1. **Save system:** Bed = save point. Laptop auto-saves before exiting to lesson menu.
2. **Day transition:** Days unlock via lesson completion (passing score required), not from within the game. The laptop is the exit point. No in-game day/night cycle on Day 1.
3. **Void visual:** Pure nothing. White. No ground, no sky, no texture, no particles, no sound. Empty.
4. **Rikizo spelling:** りきぞ is canonical. Updated in day.json.

### State Tracking (Day 1)

**Flags settable:**
- `opened_front_door_day1` — Opening front door to void. Gates Dad's void conversation + paranoia.
- `asked_dad_void_day1` — Completing Dad's void conversation. Gates Day 2 void dialogue update.
- `toilet_door_open_day1` — Using toilet with door open. +1 dad_annoyance.
- `talked_to_mom_day1` — Completing Mom's conversation. Gates Mom Day 2 variant.
- `talked_to_dad_day1` — Completing Dad's default conversation. Gates Dad Day 2 variant.

**Relationships:** char_taro +1 (talk) +1 (void conversation). char_sakura +1 (talk).

**Hidden stats:** paranoia 0–2 possible. dad_annoyance 0–1 possible.

**Design note — the front door is the first choice.** Opening the door is optional. A player who never opens it misses the void, misses Dad's void conversation, and starts with 0 paranoia. The game still works — they just have a cozier, less unsettling Day 1. The player who opens the door gets the first paranoia point and the first hint that something is deeply wrong. This establishes the pattern: curiosity is rewarded with information, and information makes the world darker.

### Open Questions for Day 1

None — all resolved.

---

## Day 2 — "Elements" (unlocked by N5.2: Days of the Week)

### Lesson Kanji & Key Vocab Available

**New kanji (10):** 日、月、火、水、木、金、土、毎、今、何

**Cumulative kanji (20):** All N5.1 kanji + above.

**New vocab highlights:**
- Elemental nouns: 日 (ひ, day/sun), 月 (つき, moon), 火 (ひ, fire), 水 (みず, water), 木 (き, tree/wood), 金 (かね, gold/money), 土 (つち, earth/soil)
- Days of the week: 日ようび, 月ようび, 火ようび, 水ようび, 木ようび, 金ようび, 土ようび, 何よう日
- Time: 今日 (きょう, today), 今月 (こんげつ, this month), 毎日 (まいにち, every day), 毎月 (まいげつ, every month)
- Questions: 何 (なに/なん), 何人 (なんにん, how many people), いつ (when)
- Adverbs: いつも (always), よく (often/well)
- Other: お金 (おかね, money — but no currency system yet), ゲーム (game)

**New particles (N5.2):** に, も, と, から, まで, や, までに

**Grammar available:** Still dictionary forms + polite_adj only. No verb conjugation.

**New this day:** Inventory system activates. First collectible item.

### Location

**Rikizo's house + a yard now exists.** Yesterday, the front door opened to endless white void. Today, it opens to a small yard. A 木 (tree). Patches of 土 (earth). The void has receded to the edge of the yard — it's still there, a wall of white surrounding the property, but the house now has ground around it. Rikizo cannot walk past the yard's edge into the void.

Rikizo does not find this remarkable. Yesterday there was nothing. Today there is a tree. 「木です。」He names it as if it's always been there.

**Interior changes:**
- A calendar appears on the kitchen wall (days of the week)
- Dad has a 金 coin on a shelf in the living room (new object)
- A bottle of 水 appears on the kitchen counter (first inventory item)

**Exterior (yard):**
- 木 (tree) — central feature, interactable
- 土 (ground/earth) — the yard is patchy earth, not grass. Raw. New.
- Void edge — visible at the yard's perimeter. White wall. Rikizo can walk up to it but not into it.

### NPCs

#### Mom (さくら) — Kitchen area

Mom has a new Day 2 conversation. She references the calendar and the routine of days.

**Conversation (4 lines):**
1. **Mom:** 「りきぞ、今日は何ようびですか？」 — "Rikizo, what day of the week is it today?"
2. **Rikizo:** 「えっと...」 — "Umm..."
3. **Mom:** 「毎日、カレンダーを見てね。」 — "Check the calendar every day, okay?" *(Points to the new calendar)*
4. **Mom:** 「いい先生は毎日がんばるよ。」 — "A good teacher works hard every day."

**Repeatable line:** 「今日もいい日ですね。」("Today is a good day too.") — Mom uses も naturally.

#### Dad (たろう) — Living room area

Dad has a new default conversation and the 金 coin gag begins.

**Conversation (4 lines):**
1. **Dad:** 「りきぞ、今日もいい子ですね。」 — "Rikizo, you're a good kid today too."
2. **Rikizo:** 「お父さん、あれは何ですか？」 — "Dad, what's that?" *(Pointing at the gold coin)*
3. **Dad:** 「金です。お父さんの金です。」 — "Gold. Dad's gold." *(Possessive. Firm.)*
4. **Dad:** 「...だめですよ。」 — "...Don't even think about it."

**Triggered conversation — "The Nothing" (Day 1 version updates):**

The void conversation from Day 1 changes now that a yard exists. If the player walks to the void edge and interacts:

> Rikizo: 「白いです。何もないです。」("It's white. There's nothing.")

Then talk to Dad:

1. **Rikizo:** 「お父さん、外の白いのは何ですか？」 — "Dad, what's the white stuff outside?"
2. **Dad:** 「何もないです。いつもですよ。」 — "Nothing. It's always like that." *(Uses いつも — "always." Dad is claiming the void is permanent and normal.)*
3. **Rikizo:** 「...そうですか。」 — "...Is that so."

Same energy as Day 1. Dad doesn't care. He's never cared. The void has always been there, apparently.

### Interactive Objects

**Interior (updated/new):**

| Object | nameJp | Location | Interaction |
|---|---|---|---|
| Calendar | カレンダー | Kitchen wall | 「今日は[X]ようびです。」Displays the current day of the week. Rikizo reads it aloud. Can tap through all seven days. |
| Gold coin | 金 | Living room shelf | 「お父さんの金です。」("Dad's gold.") If you try to take it: Dad yells from wherever he is: 「金！だめ！」("The gold! No!") Same sixth sense as the toilet door. **Running gag #2 established.** |
| Water bottle | 水 | Kitchen counter | 「水です。」("Water.") **FIRST INVENTORY ITEM.** Picking it up adds it to inventory. This teaches the player that items can be collected. The water has no gameplay use on Day 2 — it's just... water. In your inventory. |
| Bed | ベッド | Bedroom | Same as Day 1. Save point. |
| Laptop | パソコン | Bedroom | Same as Day 1. Teach a lesson exit. |
| TV | テレビ | Living room | 「テレビです。」 |
| Kotatsu | こたつ | Living room | 「こたつです。とてもいいです！」 |
| Fridge | れいぞうこ | Kitchen | 「お母さんのれいぞうこです。」 |
| Toilet | トイレ | Bathroom | Door gag persists from Day 1. |
| Front door | ドア | Entryway | Now opens to yard instead of void. 「外です！」("Outside!") — Rikizo is mildly happy to go outside, as if he'd been meaning to but just hadn't gotten around to it. |

**Exterior (new):**

| Object | nameJp | Location | Interaction |
|---|---|---|---|
| Tree | 木 | Yard center | 「木です。いい木ですね。」("A tree. Nice tree.") Interact again: 「木...名は何ですか？」("Tree... what's your name?") Interact again: 「今日から友だちです。」("From today, we're friends.") **Comedy beat — Rikizo befriends the tree.** Uses から (from) and 友だち naturally. |
| Earth/ground | 土 | Yard | 「土です。」("Earth.") Interact again: 「土は土ですね。」("Dirt is dirt.") Rikizo has nothing profound to say about dirt. |
| Void edge | — | Yard perimeter | 「白いです。何もないです。」("It's white. There's nothing.") Same as always. No change in tone. Triggers the updated Dad conversation (once). |

### Quests

**No formal quests.** The quest system doesn't exist yet.

The player discovers:
- The yard exists (the world grew overnight)
- Inventory — picking up the water bottle
- The calendar (days of the week)
- Dad's gold coin (don't touch)
- The tree (comedy)
- The void has receded but is still there

### Story Beats

| Moment | What Happens | What Rikizo Thinks | What the Player Should Feel |
|---|---|---|---|
| Opening the front door | Yesterday: void. Today: a yard with a tree. | 「外です！」(casual, happy) | **Wait.** Yesterday there was NOTHING here. Now there's a yard, a tree, ground. Where did this come from? He's not surprised AT ALL? |
| Befriending the tree | Rikizo talks to the tree, names it his friend | Genuinely delighted. 「今日から友だちです。」 | Funny. But also — this tree didn't exist yesterday. Rikizo's first friend outside the family is a tree that materialized from nothing. |
| Dad's gold coin | Dad is intensely protective of a single coin | 「金！だめ！」 | Comedy. Dad has the same sixth sense for gold as he does for bathroom doors. |
| Walking to the void edge | White wall at the yard's perimeter | 「何もないです。」(same flat tone as Day 1) | The void is still RIGHT THERE. The yard is a tiny island of reality. Everything beyond is nothing. |
| Dad says it's "always" like this | いつもですよ — the void has always been there | Accepts it | Dad is now claiming the void is permanent, normal, always-been-there. But yesterday the void was at the FRONT DOOR. It moved. He doesn't notice that either. |
| Picking up the water | First inventory item | 「水です。」 | Mechanical — teaches inventory. But also: where did this water come from? It wasn't here yesterday. The house is generating items. |

**Tone calibration for Day 2:** The comedic obliviousness deepens. The world literally changed overnight and nobody comments on it. The tree is the focal point — Rikizo befriending something that appeared from nothing is both charming and unsettling. The player should be starting to feel the pattern: things appear, nobody questions it, move on.

### Running Gags Established

1. **The Toilet Door** — Continues from Day 1.
2. **Dad's Gold** — Touch the 金 → Dad yells. Same sixth-sense mechanic as the toilet door. Persists across the game. The gold coin on the shelf is always there, always untouchable.

### Assets Required

| Asset | Type | Mode | Priority | Notes |
|---|---|---|---|---|
| Yard map | Tilemap | A (Pixel) | Needed | Small yard: tree, earth patches, void edge visible. Connects to house interior via front door. |
| Yard collision map | Data | A (Pixel) | Needed | Player can walk the yard but not into the void. |
| Tree sprite | Object sprite | A (Pixel) | Needed | Simple tree. Central yard feature. |
| Gold coin sprite | Object sprite | A (Pixel) | Needed | Small, shiny, on a shelf. Visually appealing (you WANT to take it). |
| Water bottle sprite | Object/item sprite | A (Pixel) | Needed | First inventory item. Simple bottle. |
| Calendar UI | UI element | — | Needed | Kitchen wall calendar showing 7 days. Tappable. |
| Inventory UI | UI element | — | Needed | First time inventory is used. Needs to be designed for Day 2 launch. |
| Void edge visual | Effect/tile | A (Pixel) | Needed | Sharp cutoff — earth tiles end abruptly, white void begins. No fade, no fog. Reality has a hard border. |

### Non-Kanji Real-World Vocab Used

| Word | Meaning | Glossary ID | In Glossary? | Notes |
|---|---|---|---|---|
| カレンダー | calendar | — | Game vocab | Kitchen wall object |
| ゲーム | game | v_geemu | Yes (N5.2) | Might reference in dialogue or object |

### State Tracking (Day 2)

**Flags settable:**
- `befriended_tree_day2` — **THE most important optional flag in the game.** Interacting with the tree 3 times triggers the naming sequence. Without this flag, the tree remains 「木です。」forever. With it, 木-さん becomes a tracked secret character whose relationship score determines the best ending.
- `touched_gold_day2` — Trying to take Dad's gold. +1 dad_annoyance.
- `visited_void_edge_day2` — Walking to void edge. +1 paranoia, gates Day 2 Dad void conversation.
- `picked_up_water_day2` — Collecting water bottle. Inventory tutorial complete.

**Relationships:** char_taro +1 (talk). char_sakura +1 (talk). char_tree +1 (if befriended — first day of tracking).

**Hidden stats:** paranoia 0–4 cumulative. curiosity 0–3 (room scan, tree talk, new objects). dad_annoyance 0–2 net (after -1 cooling from Day 1).

**Critical path note:** A player who skips the tree naming sequence on Day 2 can never get it back. The three-interaction sequence (「木です」→「木...名は何ですか？」→「今日から友だちです」) is Day 2 only. After Day 2, the tree's first interaction defaults to either the 木-さん greeting (if befriended) or generic 「木です」(if not). This is the game's single most consequential missable moment — and the player has no idea.

### Resolved Questions for Day 2

1. **Void edge visual:** Sharp cutoff. Ground just stops, white begins. No fade, no fog, no wall — reality has a hard border. The earth tiles end and the void starts.
2. **Tree persistence:** 木-san stays forever. Rikizo's first friend persists across all future days. Future interactions can be added as the game progresses.
3. **Evening/night:** No day/night cycle until 朝 (あさ) is introduced. Day 2 is permanently daytime. 月 (moon) exists as vocabulary and kanji knowledge but is not visually represented yet.

---

## Day 3 — "Numbers" (unlocked by N5.3: Numbers & Money)

### Lesson Kanji & Key Vocab Available

**New kanji (14):** 一、二、三、四、五、六、七、八、九、十、百、千、万、円

**Cumulative kanji (34):** All N5.1 + N5.2 + above.

**New vocab highlights:**
- Numbers: 一〜十, 百 (hundred), 千 (thousand), 万 (ten thousand)
- Currency: 円 (えん, yen)
- People counters: 一人 (ひとり), 二人 (ふたり), 三人〜十人
- Months: 一月〜十月
- Day-of-month: 一日〜十日
- General counter: 一つ (ひとつ)
- Demonstratives: これ (this), それ (that), あれ (that over there), どれ (which one)
- Questions: いくら (how much), いくつ (how many)
- Other: それから (and then), たんじょうび (birthday)
- Money: お金 (おかね, from N5.2 — now has context)

**New particles:** None new in N5.3.

**Grammar available:** Still dictionary forms + polite_adj only. No verb conjugation.

**New this day:** Currency system activates. Demonstrative pointing (これ/それ/あれ). Numbers appear on things. Calendar becomes a full April calendar.

### Location

**Same as Day 2 — house + yard.** No new areas unlock. The void boundary hasn't moved. The tree is still there.

**Interior changes:**
- The calendar upgrades from day-of-week only to a **full April calendar** — a proper monthly grid with dates. Days 1–28 are crossed out (X marks), showing that today is **四月二十九日** (April 29th). This establishes the game's timeline: it started on April 27th (Day 1).
- Objects in the house now have quantities when inspected (「三つです」etc.)

**Exterior:** No changes from Day 2.

### NPCs

#### Dad (たろう) — Living room area

Dad is the central NPC for Day 3. The meta-narrative pays off: Rikizo has been studying Japanese lessons on the computer (the actual app the player is using), and Dad pays him for it. This is Day 3's defining moment — the currency system is earned through learning.

**Conversation — "Payment for Studying" (5 lines):**
1. **Dad:** 「りきぞ、今日もいい日ですね。」 — "Rikizo, today is a good day too."
2. **Dad:** 「これはお金ですよ。二千円です。」 — "This is money. 2,000 yen." *(Hands Rikizo 2,000円. Uses これ — first demonstrative in dialogue.)*
3. **Rikizo:** 「二千円！？」 — "2,000 yen!?"
4. **Dad:** 「日本語のお金です。」 — "It's Japanese [study] money." *(Payment for completing the lesson. Dad frames it simply — money for Japanese.)*
5. **Dad:** 「大切ですよ。」 — "It's important."

**Mechanical result:** Player receives 二千円 (2,000円). Currency balance appears in a UI element. **There is nothing to spend it on.** The money accumulates — this becomes meaningful later when shops exist (Day 5+).

**How payment works going forward:** After Day 3, Rikizo gets his phone back (established in Day 4). From that point, Dad mentions that payment will happen automatically after each lesson — the money just appears. The player no longer needs to talk to Dad to collect; it's deposited when they complete a lesson. This keeps the meta-joke alive (you earn game money by doing the real thing the game is about) without requiring a manual collection step every time.

**Dojo multiplier (future system):** A multiplier earned in the Dojo (introduced later) can increase the per-lesson payout. However, Dad pockets anything over 五千円 (5,000円) per lesson. So the effective cap is 5,000円/lesson regardless of multiplier. Dad's cut is presented matter-of-factly — he doesn't apologize or explain. He just takes it. This is never fully justified. Rikizo never questions it. The player might.

**Dad's gold coin — no price scene.** The gold coin remains on its shelf, still untouchable (「金！だめ！」). It does not get a price tag on Day 3. The coin's story develops later.

#### Mom (さくら) — Kitchen area

Mom has no special Day 3 scene. She's available for the family count conversation (see below) and her existing Day 2 interactions persist.

### Interactive Objects

**Interior (updated):**

| Object | nameJp | Location | Interaction |
|---|---|---|---|
| Calendar | カレンダー | Kitchen wall | **Full April calendar.** Grid layout showing 四月 (April). Days 1–28 crossed out. Today: 四月二十九日. Interaction: 「今日は四月二十九日です。」Uses month + date vocab. Player can tap different dates to hear readings (一日、二日、三日... etc.) — a natural way to practice the irregular date readings. |
| Gold coin | 金 | Living room shelf | Same as Day 2. 「お父さんの金です。」Touch attempt: 「金！だめ！」 No price, no change. |
| Water bottle | 水 | Inventory | Already collected on Day 2. Still in inventory. Still useless. |
| Fridge | れいぞうこ | Kitchen | 「お母さんのれいぞうこです。」("Mom's fridge.") — **The fridge has no inside.** Not locked, not sealed — 中 (なか, "inside") doesn't exist as a concept yet (introduced N5.9, Day 9). The fridge is a surface with no interior, the same way the yard has no beyond. Rikizo doesn't try to open it because there is nothing to open *into*. When 中 arrives in Day 9, the fridge gains an interior for the first time and can finally be opened. |

**Interior (new demonstrative interactions):**

From Day 3 onward, Rikizo can point at objects using これ/それ/あれ. This isn't a separate mechanic — it's how his dialogue naturally changes. When close to an object: 「これは...」 When across the room: 「あれは何ですか？」

This is a flavour upgrade, not a system. The script just uses demonstratives more naturally now that the player knows them.

**Exterior:**

| Object | nameJp | Location | Interaction |
|---|---|---|---|
| Tree | 木 | Yard center | Updated: 「木-さん、今日もいい日ですね。」("Tree-san, today is a good day too.") Rikizo greets the tree daily now. Uses 今日 + も naturally. |
| Earth/ground | 土 | Yard | Same as Day 2. |
| Void edge | — | Yard perimeter | Same as Day 2. |

### Family Count Beat

Numbers enable counting the family. This is a small moment but uses 何人 and the people counters. The family is four: Dad, Mom, Rikizo, and one older brother who is away and not mentioned by name (he appears in N4).

**Triggered when talking to Mom after Dad's payment scene:**

1. **Rikizo:** 「かぞくは何人ですか？」 — "How many people are in the family?"
2. **Mom:** 「四人ですよ。お父さんとお母さんと、りきぞと...四人です。」 — "Four. Dad, Mom, Rikizo, and... four." *(Mom trails off slightly — there's a fourth person she doesn't name. She just restates the number. The older brother exists but is conspicuously unmentioned.)*
3. **Rikizo:** 「四人...それから、木-さんも！五人です！」 — "Four... and then, Tree-san too! Five!"
4. **Mom:** 「...木は人ではないですよ。」 — "...A tree is not a person."

Uses: 何人, 四人, 五人, それから, も, と (listing).

**Design note:** Mom says 四人 and lists three names (Dad, Mom, Rikizo) + a trailing 「と...」 that she doesn't finish. She then restates 四人 as if to close the topic. This plants a seed: the player may notice there are only three named people for a count of four. The older brother is not named, not explained, and not discussed further. He simply exists as a gap in the count. This pays off in N4 when he appears.

### Story Beats

| Moment | What Happens | What Rikizo Thinks | What the Player Should Feel |
|---|---|---|---|
| Getting paid by Dad | Dad hands over 二千円 for studying Japanese | 「二千円！？」(shocked, grateful) | The meta-loop clicks: the player studied a real Japanese lesson, and the game rewards them with in-game currency for it. The fourth wall is thin and intentional. |
| The calendar | Full April grid, 28 days crossed out | 「四月二十九日です。」 | Time has been passing. The game started April 27th — just before Golden Week. The whole family is home because it's a holiday stretch. The crossed-out days imply the world existed before Day 1. |
| Counting the family | Four people — plus Tree-san makes five | Counts the tree as a person, doesn't notice the missing name | Charming. Rikizo doesn't catch that Mom trailed off. The player might. Who's the fourth family member? |
| Nothing to buy | Has money. World is: house, yard, tree, dirt, void. | Doesn't notice there's nothing to buy | The player notices. 2,000 yen and nowhere to spend it. The economy has no market. The yard has no shop. There is only void. |
| Greeting the tree | Daily ritual established | 「木-さん、今日もいい日ですね。」 | The tree is becoming a real character through repetition. Rikizo's commitment to this friendship is unreasonable and endearing. |

**Tone calibration for Day 3:** The comedy has two layers. Surface: Rikizo earns money for studying Japanese, has no shops, counts trees as people. Under the surface: Mom can't finish counting the family, the calendar shows time passing before the game "started," and Dad's payment system has a cap he'll never explain. The absurdist humour (void, nothing to buy) continues, but small mysteries are starting to accumulate.

**Ontological rule reinforced:** The fridge establishes that the "vocabulary = existence" rule applies to spatial concepts too, not just geography. The void is "no words for what's out there." The fridge is "no word for inside." Both resolve when the vocabulary arrives. This is now a core design principle: **things that require unknown vocabulary to exist do not exist.** The world is literally made of words.

### Running Gags Updated

1. **The Toilet Door** — Continues.
2. **Dad's Gold** — Same as Day 2 (untouchable, no new development this day).
3. **Tree-san** — Becomes a daily greeting. 木-さん is now counted as family member #5 (to Rikizo, not to Mom).
4. **The Fridge** — Has no inside. 中 doesn't exist yet. The fridge is an exterior-only object until Day 9 (N5.9: Relative Position). Same ontological rule as the void.

### Currency System Details

| Parameter | Value | Notes |
|---|---|---|
| Base payout per lesson | 二千円 (2,000円) | Set on Day 3. Paid by Dad in person for this lesson only. |
| Automatic payment | From Day 4 onward | After getting his phone back, payment deposits automatically after each completed lesson. Dad mentions this. |
| Dojo multiplier | Variable (future system) | Earned through Dojo training. Multiplies the base payout. |
| Dad's cap | 五千円 (5,000円) per lesson | Dad takes anything above this amount. Not explained. Not negotiable. |
| Starting balance | 0円 (before Day 3) | No money exists in the game before this moment. |

### Assets Required

| Asset | Type | Mode | Priority | Notes |
|---|---|---|---|---|
| Currency UI overlay | UI element | — | Needed | Shows 円 balance. Minimal — just a number + 円 symbol. Appears when collecting money. |
| April calendar sprite | Object/UI sprite | A (Pixel) | Needed | Full monthly grid for April. Dates 1–28 crossed out. 29th highlighted as today. Must support tappable dates for reading practice. |

### Non-Kanji Real-World Vocab Used

None new beyond existing game vocab (カレンダー, etc).

### State Tracking (Day 3)

**Flags settable:**
- `received_payment_day3` — Completing Dad's payment conversation. Gates currency system + phone payment (Day 4).
- `asked_family_count_day3` — Completing Mom's family count conversation. +1 curiosity, seeds brother mystery.
- `noticed_fridge_day3` — Interacting with fridge 3+ times. +1 paranoia, gates special Day 9 fridge scene when 中 unlocks.

**Relationships:** char_taro +1 (talk) +1 (payment conversation). char_sakura +1 (talk) +1 (family count). char_tree +1 (daily greeting, if befriended).

**Hidden stats:** paranoia 0–5 cumulative. curiosity 0–6 cumulative. dad_annoyance 0–2 net.

### Resolved Design Decisions

1. **Fridge = no inside until Day 9.** 中 (なか) is introduced in N5.9. Until then, the fridge has no interior — same ontological rule as the void beyond the yard. The fridge gains an inside on Day 9 and can be opened for the first time.

2. **Golden Week timeline confirmed.** Day 1 = April 27th. Day 3 = April 29th (Showa Day, start of Golden Week). The holiday explains why the entire family is home together. Golden Week runs through roughly Day 9 (May 5th, Children's Day), after which normal life resumes — conveniently aligning with when Rikizo's world starts expanding. The game timeline mapped to Golden Week:

   | Day | Date | Holiday |
   |---|---|---|
   | 1 | Apr 27 (Sun) | Pre-GW weekend |
   | 2 | Apr 28 (Mon) | — |
   | 3 | Apr 29 (Tue) | Showa Day |
   | 4 | Apr 30 (Wed) | — |
   | 5 | May 1 (Thu) | — |
   | 6 | May 2 (Fri) | — |
   | 7 | May 3 (Sat) | Constitution Memorial Day |
   | 8 | May 4 (Sun) | Greenery Day |
   | 9 | May 5 (Mon) | Children's Day (GW end) |

3. **Mom's trail-off has a dramatic pause.** She says 四人, lists three names, then hits a visible 「と...」 with a beat — a pause long enough that the player notices something is being left unsaid. Then she restates 「四人です」 to close the topic. The pause is the signal; nothing is explained. Let the player wonder.

---

## Day 4 — "Time" (unlocked by N5.4: Time & Duration)

### Lesson Kanji & Key Vocab Available

**New kanji (5):** 時、分、年、週、半

**Cumulative kanji (39):** All N5.1–N5.3 + above.

**New vocab highlights:**
- Time: 何時 (なんじ, what time), 時 (とき, time/when), 時々 (ときどき, sometimes)
- Duration: 今週 (こんしゅう, this week), 先週 (せんしゅう, last week), 毎週 (まいしゅう, every week), 今年 (ことし, this year), 毎年 (まいねん, every year), 先月 (せんげつ, last month), 半分 (はんぶん, half)
- Demonstrative adjectives: この (this+noun), その (that+noun), どの (which+noun)
- Time words: きのう (yesterday), すぐ (soon/right away), ちょっと (a little/moment), つぎ (next)
- Key new: 分かる (わかる, to understand), スマホ (smartphone), ケーキ (cake)

**New particles:** None new in N5.4.

**Grammar available:** Still dictionary forms + polite_adj only. No verb conjugation yet (that's N5.5).

**New this day:** Time exists (clocks work). Phone returned. Automatic lesson payments. First food item (cake). Yesterday becomes referenceable.

### Location

**Same as Day 2–3 — house + yard.** No new areas. April 30th on the calendar.

**Interior changes:**
- A clock appears on the wall (or becomes readable). It now displays a time. Previously it was just a decoration — now it's functional because 時 and 分 exist.
- The phone (スマホ) appears in Rikizo's inventory after Dad's conversation.

**Exterior:** No changes.

### NPCs

#### Dad (たろう) — Living room area

Dad is the star again. He returns Rikizo's phone and explains the new automatic payment system. This is the biggest mechanical moment since currency was introduced — the phone becomes Rikizo's primary tool.

**Conversation — "The Phone" (6 lines):**
1. **Dad:** 「りきぞ、ちょっと。」 — "Rikizo, a moment." *(First use of ちょっと as a conversational softener/attention-getter.)*
2. **Dad:** 「これはりきぞのスマホですよ。」 — "This is Rikizo's smartphone." *(Hands it over. The phone was broken — Dad had it repaired. Uses これ + の possession.)*
3. **Rikizo:** 「スマホ！？」 — "A smartphone!?" *(Pure relief. He's been without it for days.)*
4. **Dad:** 「日本語のお金はすぐスマホです。分かりますか？」 — "The Japanese [lesson] money goes straight to the phone. Understand?" *(Automatic deposits. Payment shows up on the phone now.)*
5. **Rikizo:** 「分かります！」 — "I understand!"
6. **Dad:** 「今週は大切ですよ。」 — "This week is important." *(Vague. Doesn't explain why. Golden Week? Something else? Dad doesn't elaborate.)*

**Mechanical result:** Player receives スマホ (repaired — it was broken before the game started). The phone becomes the primary UI hub:
- **Clock** — displays current time (何時何分)
- **Wallet** — shows 円 balance (replaces the coin purse as currency UI)
- **Everything else** — empty. No contacts, no apps, no messages. The phone is a clock and a wallet in a world with no internet, no cell towers, and no one to call. It is the most sophisticated object in a universe where the fridge doesn't have an inside.

**Automatic payment confirmation:** From this point forward, lesson completion deposits 二千円 directly. No NPC interaction required. The phone buzzes (or shows a notification) when payment arrives. Dad's earlier manual payment (Day 3) was a one-time ceremony.

#### Mom (さくら) — Kitchen area

Mom has cake. This is the first food item in the game. ケーキ is a celebration — whether for the phone, for Golden Week, or just because Mom made cake.

**Conversation — "Cake" (4 lines):**
1. **Mom:** 「りきぞ、このケーキはお母さんのですよ。」 — "Rikizo, this cake is Mom's." *(Uses この — attributive demonstrative. Immediately claims ownership.)*
2. **Rikizo:** 「...半分は？」 — "...Half?"
3. **Mom:** 「半分もお母さんのです。」 — "The half is also Mom's." *(も — "also." The half is also hers. All of it is hers. Every fraction of it is hers.)*
4. **Rikizo:** 「...」

**Design note:** The cake exists but Rikizo cannot eat it. Mom's cake follows the same possessive energy as Dad's gold coin. The family owns things. Rikizo does not get those things. He has a smartphone with no apps and 二千円 with nowhere to spend it. The cake is visible, described, and unavailable.

**Cake persistence:** The cake remains on the counter from Day 4 through Day 6, guarded by Mom. Each day, interacting with it produces: 「お母さんのケーキです。」("Mom's cake.") — Same energy as 「お父さんの金です。」 On **Day 7**, when 食べる (to eat) enters the world, the cake vanishes. See [Open Questions](#open-questions-for-day-4) for the conditional dialogue payoff (Mom blames Tree-san if the tree was befriended).

### Interactive Objects

**Interior (updated):**

| Object | nameJp | Location | Interaction |
|---|---|---|---|
| Clock | 時 | Living room wall | Now functional: 「今、[X]時[Y]分です。」Displays a time. Player can check anytime. Previously decorative — 時 and 分 didn't exist. |
| Calendar | カレンダー | Kitchen wall | Updated: 「今日は四月三十日です。」Day 29 now also crossed out. One more day into Golden Week. |
| Cake | ケーキ | Kitchen counter | 「お母さんのケーキです。」Cannot eat. Cannot take. Cannot have half. Exists only to be observed. |
| Gold coin | 金 | Living room shelf | Same as before. 「お父さんの金です。」 |
| Fridge | れいぞうこ | Kitchen | Same as Day 3. No inside. |
| Phone | スマホ | Inventory | 「りきぞのスマホです。」Shows time + money. Nothing else. First personal possession that isn't a water bottle. |

**Exterior:**

| Object | nameJp | Location | Interaction |
|---|---|---|---|
| Tree | 木 | Yard center | 「木-さん、今日もいい日ですね。」 Daily greeting continues. |
| Earth/ground | 土 | Yard | Same. |
| Void edge | — | Yard perimeter | Same. |

### The Phone as UI Hub

The phone is both a narrative object and the player's primary interface from Day 4 onward.

| Phone feature | Available Day 4 | Future expansion |
|---|---|---|
| Clock | Yes — 何時何分 display | Alarm, schedule (when time-related verbs exist) |
| Wallet | Yes — 円 balance | Transaction history, shop integration (Day 5+) |
| Contacts | Empty | Populated as Rikizo meets people outside the house |
| Messages | None | Unlocks when communication vocab arrives |
| Map | None | Unlocks when location/direction vocab arrives |
| Apps | None | ??? |

The phone's emptiness is intentional and funny. It's a smartphone with nothing smart about it. No signal, no data, no contacts. It tells the time and holds money. In a world bounded by void, what would you even connect to?

### "Yesterday" Awareness

きのう (yesterday) means Rikizo can now reference the past. This is small but significant — before Day 4, every day was only the present. Now there's a "before."

**Ambient dialogue change:** When Rikizo interacts with the coin purse location (bedroom desk, now empty since the wallet moved to the phone):

> 「きのうのお金...スマホです。」("Yesterday's money... [is on the] phone now.")

When interacting with Dad after the phone scene:

> Dad: 「きのうの二千円、分かりますか？スマホですよ。」 ("Yesterday's 2,000 yen — you know? It's on the phone.")

This reinforces きのう, 分かる, and the payment migration in one beat.

### Time-of-Day Awareness

With 時 and 分, the game can now acknowledge what time it is. This doesn't create a full day/night cycle (朝/昼/夜 come later), but the clock exists and characters can reference it.

**Dad's ambient time line (repeatable):**
> 「今、何時ですか？」 *(looks at clock)* 「...時々、時は大切です。」("What time is it now? ...Sometimes, time is important.")

Dad dispenses vague temporal wisdom. He does not answer his own question.

### Story Beats

| Moment | What Happens | What Rikizo Thinks | What the Player Should Feel |
|---|---|---|---|
| Getting the phone | Dad returns スマホ, explains auto-payment | 「スマホ！？」(pure joy) | The phone feels like a major unlock — until the player opens it and finds: clock, wallet, void. A smartphone with nothing to connect to. |
| The empty phone | Clock + wallet. No contacts, no apps, no signal. | Doesn't notice what's missing | The player notices. This is the most powerful device in a world that can't support it. |
| Mom's cake | ケーキ exists. All of it is Mom's. Including the half. | 「...半分は？」(hopeful) → 「...」(defeated) | Same pattern as Dad's gold. The family collects prized possessions. Rikizo collects disappointment. His only possessions: a phone (empty), money (unspendable), water (useless), and a tree (friend). |
| Time becomes real | Clock works. きのう exists. | Can reference Day 3 for the first time | The world gains a past. "Yesterday" means the previous day actually happened and is remembered. Time isn't just a number — it's memory. |
| Dad's vague warning | 「今週は大切ですよ。」 | Doesn't ask why | What's important about this week? It's Golden Week. Is something happening? Dad doesn't say. Another small mystery. |

**Tone calibration for Day 4:** The phone is the comic centrepiece. It's a smartphone in a pre-smartphone world — a tool designed for connectivity in a universe where there's nothing to connect to. The cake scene mirrors the gold coin scene beat-for-beat (family member claims object, Rikizo tries to negotiate, gets shut down), establishing that everyone in this house has something precious except Rikizo. His precious thing is 木-さん, who is free, abundant, and not a person.

### Running Gags Updated

1. **The Toilet Door** — Continues.
2. **Dad's Gold** — Persists (no new development).
3. **Tree-san** — Daily greeting continues.
4. **The Fridge** — No inside. Continues.
5. **Family Possessions** — New pattern crystallizes. Dad has 金. Mom has ケーキ. Rikizo has... 木-さん. (木-さん is free. 木-さん doesn't cost anything. 木-さん is always available. Maybe that's the point.)
6. **The Empty Phone** — New gag. A smartphone with: clock, wallet, nothing else. Rikizo never comments on its emptiness. The phone is full to him. He has a clock! He has money on it! What more could you want?

### Assets Required

| Asset | Type | Mode | Priority | Notes |
|---|---|---|---|---|
| スマホ sprite | Inventory item / UI icon | A (Pixel) | High | Phone in Rikizo's hand or inventory. Also serves as the UI hub icon. |
| Phone UI screen | UI element | — | High | Simple interface showing clock (時:分) and wallet (円 balance). Mostly empty space where future features will go. The emptiness should be visible — blank slots or grayed-out icons for contacts/messages/map. |
| Clock sprite | Object sprite | A (Pixel) | Medium | Wall clock in living room. Now shows a readable time. |
| Cake sprite | Object sprite | A (Pixel) | Medium | ケーキ on kitchen counter. Looks delicious. Untouchable. |

### Non-Kanji Real-World Vocab Used

| Word | Notes |
|---|---|
| スマホ | In glossary (N5.4). Short for スマートフォン. |
| ケーキ | In glossary (N5.4). Loanword. |

### State Tracking (Day 4)

**Flags settable:**
- `received_phone_day4` — Completing Dad's phone conversation. Gates phone UI + automatic payments.
- `tried_cake_day4` — Interacting with Mom's cake. Cake dialogue, Mom possessiveness pattern.
- `checked_clock_day4` — Interacting with wall clock. +1 curiosity.
- `asked_dad_week_day4` — Hearing Dad's 「今週は大切ですよ」. Seeds Golden Week mystery.

**Relationships:** char_taro +1 (talk) +1 (phone conversation). char_sakura +1 (talk) +1 (cake interaction counts as conversation). char_tree +1 (daily greeting, if befriended).

**Hidden stats:** paranoia 0–6 cumulative. curiosity 0–9 cumulative. dad_annoyance 0–3 net.

**Note:** Trying to take the cake does NOT annoy Mom. Mom has no annoyance counter — she's unflappable. The cake scene is comedy, not a relationship test. Dad's gold is the annoyance trigger; Mom's cake is just off-limits.

### Open Questions for Day 4

All resolved:

1. **Phone backstory: RESOLVED.** The phone was broken — not confiscated. Dad had it repaired. This explains the delay (Days 1-3 without a phone) without implying punishment. Dad's line is simply 「これはりきぞのスマホですよ。」 — he's returning a fixed item, not unlocking a reward. Why it was broken is not explained. Maybe Rikizo dropped it. Maybe the world broke it. The game doesn't say.

2. **Cake permanence: RESOLVED.** The cake persists from Day 4 through Day 6. On **Day 7** (N5.7: 食べる unlocks), the cake vanishes. The verb "to eat" now exists in the world, and Mom has used it.
   - If player interacts with the empty counter: 「ケーキは...？」("The cake...?")
   - If player asks Mom (default): 「お母さんのケーキです。お母さんが食べました。」("It was Mom's cake. Mom ate it.") She's matter-of-fact. She told you it was hers.
   - If player asks Mom **AND `flag:befriended_tree_day2` is set**: 「木-さんが食べました。」("Tree-san ate it.") Mom blames the tree. She says this with a straight face. The tree is outside. The tree has no mouth. The tree did not eat the cake. Mom does not elaborate. If Rikizo pushes: 「...お母さんのケーキです。」 She falls back to the ownership defense without confirming or denying the tree accusation.

   **Design note:** This is the first time the game's conditional flag system produces a visibly different (and funnier) outcome. Players who befriended the tree get rewarded with a joke. Players who didn't get the honest answer. Both are funny. The tree version is funnier. This teaches players (subconsciously) that their choices from earlier days have consequences — even silly ones.

---

*Pending approval before writing Day 5.*
