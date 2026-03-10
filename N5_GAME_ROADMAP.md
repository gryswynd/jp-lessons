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
| Water bottle | 水 | Kitchen counter | 「水です。」("Water.") **FIRST INVENTORY ITEM.** Picking it up adds it to inventory AND triggers the quest log for the first time: ◻ 水を＿＿. Two tutorials in one interaction — inventory and quests. The verb is a blank. The player can't read the quest, can't complete the quest, can't do anything with the water. The sentence has a hole where the verb should be. It stays that way until Day 7. |
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

**THE QUEST LOG APPEARS FOR THE FIRST TIME.**

When Rikizo picks up the water bottle, a small UI notification pops: a quest log icon appears on the phone (or as a screen-edge HUD element). The player opens it and finds one entry:

```
📋 Quest Log
─────────────
◻ 水を＿＿
  "_____ the water."
```

That's it. One quest. Do *something* to the water. But what? The verb is blank — a fill-in-the-blank with no answer yet. The player has just learned that inventory exists (by picking up the water) and that quests exist (by receiving one). The quest seems like it should be simple — you have water, do the thing — but the thing has no name. 飲む doesn't exist. The verb for drinking has not been introduced. The quest isn't just impossible to *complete*. It's impossible to *read*.

The player will try to use the water. Nothing happens. 「水です。」 It's water. That's all you can say about it. The quest sits in the log with its blank slot. Uncompleted. Unreadable. The first quest the game ever gives you is one you cannot do — and one you cannot even fully understand.

**Days 3–6:** The quest persists. Every time the player checks the quest log (if they do), there it is: ◻ 水を＿＿. Still incomplete. Still blank. The water bottle is in inventory. The quest is in the log. Neither does anything. The blank stares back. Veteran RPG players will recognize this as a "come back later" quest. They'll assume a mechanic needs to unlock. They're right — but the mechanic is a *vocabulary word*, and the quest itself is waiting for it.

**Day 7 resolution:** See Day 7 — "The Water Bottle." When N5.7 unlocks and 飲む enters the world, the quest text fills in:

```
📋 Quest Log
─────────────
◻ 水を飲む
  "Drink the water."
```

The blank becomes a word. The quest that was unreadable for five days suddenly makes sense. And now you can do it. Tap the water bottle. Quest complete. Chime. Checkmark. Fanfare.

```
📋 Quest Log
─────────────
✅ 水を飲む
   "Drink the water."
   Completed: Day 7
```

Five days. One verb. The verb didn't just unlock the action — it completed the *sentence*.

**Design note — quest system introduction:** This is deliberately the game's tutorial for quests. The first quest teaches: (1) quests exist, (2) quests persist across days, (3) some quests can't be completed immediately, (4) the game world's constraints are *linguistic*. The blank verb slot makes this visceral — the player can SEE that something is missing. They have を, which by Day 2 they may not even understand yet (it's taught in N5.3). The quest is a sentence with a hole in it. Learning Japanese fills the hole. This is the game.

The player discovers:
- The yard exists (the world grew overnight)
- Inventory — picking up the water bottle
- **The quest system** — first quest received (水を＿＿), first quest unreadable AND impossible
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
| Picking up the water | First inventory item + first quest (◻ 水を＿＿) | 「水です。」 | Two systems unlock at once: inventory and quests. The quest has a blank where the verb should be. You can't read it. You can't do it. You have water and a sentence with a hole. The quest will sit in your log for **five days** with that blank staring at you. On Day 7, the word fills in. This is the game teaching you that vocabulary = ability. |

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
| Quest log UI | UI element | — | Needed | First appearance. Minimal: a list with checkbox items. Appears when water bottle is picked up. Must support persistent cross-day tracking. One entry on Day 2: ◻ 水を飲む. |
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
| Water bottle | 水 | Inventory | Already collected on Day 2. Still in inventory. Still useless. Quest log still shows ◻ 水を＿＿. Still blank. Still impossible. Day 3 of carrying water you can't ＿＿. |
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

## Day 5 — "Going" (unlocked by N5.5: Going & Places)

### Lesson Kanji & Key Vocab Available

**New kanji (5):** 行、来、店、駅、家

**Cumulative kanji (44):** All N5.1–N5.4 + above.

**New vocab highlights:**
- Movement verbs: 行く (いく, to go), 来る (くる, to come)
- Places: 駅 (えき, station), 店 (みせ, shop), 家 (いえ, house/home), コンビニ (convenience store), スーパー (supermarket)
- Location words: ここ (here), そこ (there), あそこ (over there), どこ (where), うち (home/my place)
- Transport: バス (bus), タクシー (taxi)
- Time: 来週 (らいしゅう, next week), 来月 (らいげつ, next month), 来年 (らいねん, next year)
- Food: おにぎり (rice ball)
- Other: また (again/also), だめ (no good/not allowed)

**GRAMMAR REVOLUTION — N5.5 unlocks polite verb conjugation:**
- `polite_masu` — 行きます, 来ます
- `polite_mashita` — 行きました, 来ました
- `polite_negative` — 行きません, 来ません
- `polite_past_negative` — 行きませんでした
- `te_form` — 行って, 来て (connector, requests)
- `polite_negative_te` — 行かないで (negative request)
- `plain_past` — 行った, 来た

This is the single biggest grammar leap in N5. Characters go from "X is Y" sentences to full action narratives: "I went to the station," "Please come here," "I didn't go." Every conversation transforms.

**New particles:** None new, but existing particles now combine with verbs: 駅に行きます, 店から来ました, etc.

**New this day:** Rikizo can leave the yard. The world expands. First NPC outside the family. First shop (that you can't buy from — 買う is Day 8). Verbs conjugate. Everything changes.

### Location

**THE WORLD EXPANDS.** Yesterday: house + yard + void wall at the perimeter. Today: the void has receded dramatically. A road extends from the house. Buildings have materialized. There is a neighborhood.

Rikizo steps out of the yard and there is somewhere to go. 行く exists. Places exist. The void hasn't disappeared — it's visible at the edges of the new area, a white border around a small town that's just... appeared. But for the first time, there is a "there" to go to.

**New areas:**

| Area | Description | Accessibility |
|---|---|---|
| Road | A path leading from the house to the neighborhood. Simple, short. The first connecting geography. | Walkable |
| コンビニ | Convenience store. Small building with a **passthrough window** (cannot enter — 中 doesn't exist until Day 9). Items visible through the window but 買う (to buy) doesn't exist until Day 8 — it's a shop you can look at but not shop at. | Window only |
| 駅 | Train station. Visible, reachable, but there are no trains. The platform exists. The tracks exist. Nothing comes. The station is empty and perfect and waiting for a train that cannot arrive because there is nowhere for it to come from. | Explorable exterior |
| Void edge (new) | The void has retreated to the edge of the new neighborhood. Still visible — white nothing beyond the last building. The world is bigger but finite. | Visible boundary |

**Interior changes (house):**
- Calendar: 「五月一日」(May 1st). The month has changed — 五月 is now writable.
- Phone: A message icon appears. One message. From やまかわ. (See Phone section below.)

**What does NOT exist yet:**
- No roads leading out of town (山, 川, 道 are N5.6)
- No vehicles on the road (車 is N5.6; バス and タクシー are vocab but there's no road system yet)
- Cannot enter any building (中/外 = N5.9)
- No other neighborhoods or distant locations

### NPCs

#### Dad (たろう) — Living room area

Dad has a short scene. He acknowledges Rikizo is going out for the first time.

**Conversation — "Going Out" (4 lines):**
1. **Dad:** 「りきぞ、どこに行きますか？」 — "Rikizo, where are you going?" *(First use of 行きます in dialogue. Dad conjugates a verb for the first time. The world has grammar now.)*
2. **Rikizo:** 「外に行きます！」 — "I'm going outside!"
3. **Dad:** 「店に行きますか？」 — "Going to the shops?"
4. **Dad:** 「だめですよ、金は...だめです。」 — "Don't [spend on]... the gold is off limits." *(Dad's paranoia about money leaking. He doesn't finish the thought. だめ is now formally available and Dad has been waiting for this word his entire life.)*

**Repeatable line (Day 5+):** 「どこに行きますか？」("Where are you going?") — Dad asks this every day from now on. Every single day. Forever. It's how dads work.

#### Mom (さくら) — Kitchen area

Mom has a brief send-off. She's supportive but doesn't leave the house.

**Conversation (3 lines):**
1. **Mom:** 「りきぞ、今日はどこに行きますか？」 — "Rikizo, where are you going today?"
2. **Rikizo:** 「店に行きます！」 — "I'm going to the shops!"
3. **Mom:** 「家に来てくださいね。」 — "Come home, okay?" *(te-form request. Mom's first conjugated verb is a plea to come back. She doesn't say why. She doesn't seem worried. She just wants him to come home. It's a perfectly normal Mom thing to say. It might also be something else.)*

**Repeatable line (Day 5+):** 「また来てくださいね。」("Come back again, okay?") — Every day.

#### やまかわ — Near the コンビニ

**Yamakawa appears.** He's standing near the convenience store, leaning against the wall. He's holding an onigiri. It's clearly an onigiri — triangular, wrapped in nori, unmistakable. But 食べる (to eat) doesn't exist until Day 7. Yamakawa is not eating. He is standing near food. He is holding food.

**THE ONIGIRI IS HIS.** From Day 5 through Day 7, Yamakawa's overworld sprite shows him holding an onigiri. His conversation portrait shows the onigiri. It is a permanent fixture of his visual identity. Every time the player talks to him, the onigiri is visible. It never gets smaller. It never changes. Yamakawa is a man with an onigiri. That's just what he looks like. Nobody mentions it because there is no verb for what one does with food — but the body language is clear. The way he holds it. The way he doesn't offer it. This is *his* onigiri.

**First meeting conversation (6 lines):**
1. **Yamakawa:** 「お、りきぞ！ここに来ましたか！」 — "Oh, Rikizo! You came here!" *(来ました — first past-tense verb from an NPC. Yamakawa talks like someone who's been here the whole time.)*
2. **Rikizo:** 「やまかわ！」 — "Yamakawa!"
3. **Yamakawa:** 「毎日ここに来ます。コンビニはいいですよ。」 — "I come here every day. The convenience store is great." *(He says this as if the convenience store has existed for years. It materialized this morning.)*
4. **Rikizo:** 「いつからですか？」 — "Since when?"
5. **Yamakawa:** 「いつから？...いつもですよ。」 — "Since when? ...Always." *(The same word Dad uses about the void. いつも. "Always." Yamakawa has always been here, at a convenience store that appeared today, near a road that didn't exist yesterday. He does not find this question interesting.)*
6. **Yamakawa:** 「また来てくださいね。」 — "Come again, okay?"

**Repeatable line:** 「りきぞ、また来ましたか！いいですね。」("Rikizo, you came again! Nice.")

**Design note — Yamakawa and the Eternal Onigiri:** The onigiri gag works on three levels. **Level 1 (comedy):** A man holds a single onigiri for three days and it never changes. His sprite has it. His portrait has it. It's just part of him now. The player starts to wonder if this is just... what Yamakawa looks like. **Level 2 (ontological horror):** He CAN'T eat it. The verb doesn't exist. He is holding food in a world where consumption is undefined. The onigiri is Schrödinger's lunch — observed but never consumed because the concept of consuming doesn't exist in the world's vocabulary. **Level 3 (the punchline):** The instant 食べる exists (Day 7), Rikizo asks if he can have it. Yamakawa says no. And then eats it. Right there. In front of you. The onigiri that was a frozen visual constant for three days is consumed in seconds — not offscreen, not between days, but while you watch. The man who couldn't eat for three days eats the moment the verb arrives, and he doesn't share.

### The Onigiri Quest — ◻ おにぎりを＿＿

When Rikizo finishes his first conversation with Yamakawa, something happens. Yamakawa waves the onigiri casually — and a small piece breaks off and falls. Rikizo catches it. The piece enters inventory.

> **Quest log update:** ◻ おにぎりを＿＿

The second quest in the game. Same pattern as the water bottle: an item paired with an incomplete sentence. The verb is missing. What do you do with おにぎり? The word for it doesn't exist.

**How the player receives it:**

After line 6 of Yamakawa's first conversation, an additional beat:

> **Yamakawa:** 「あ。」 *(A piece of onigiri crumbles off. Yamakawa doesn't notice — or doesn't care. The piece falls. Rikizo catches it instinctively.)*
> **Rikizo:** 「おにぎり...」 *(He's holding a fragment of rice ball. It's not enough to be a meal. It's a morsel. A token. A piece of Yamakawa's eternal snack.)*

**Quest log:** ◻ おにぎりを＿＿

The player now has two incomplete quests:
- ◻ 水を＿＿ (from Day 2 — still waiting for 飲む)
- ◻ おにぎりを＿＿ (from Day 5 — waiting for 食べる)

Both are nouns waiting for their verbs. The quest log is becoming a vocabulary gap list.

**Days 5–6:** The onigiri fragment sits in inventory. Tapping it produces: 「おにぎりです。」 That's it. It's a piece of food. What you do with food has no name.

**Day 7 (食べる arrives) — Phase 2: The Social Block:**

When 食べる unlocks, the quest text fills in:

> ◻ おにぎりを＿＿ → ◻ おにぎりを食べる

The player can read the quest! They have the onigiri fragment in inventory! They try to eat it:

> Rikizo: 「おにぎりを食べ—」
> Yamakawa: 「あ！だめだめ！わたしのおにぎりですよ！」 — "Hey! No no no! That's MY onigiri!"

Yamakawa appears. Somehow. Like Dad and the car, Yamakawa has a sixth sense for his food. The fragment was his. It's *always* been his. He snatches it back.

> **Rikizo:** 「...」
> **Quest log:** ◻ おにぎりを食べる *(Still incomplete. You had the verb. You had the food. Yamakawa said no.)*

This is the escalation from the water quest: 水を飲む was blocked by vocabulary alone — once the verb existed, the quest completed. おにぎりを食べる is blocked by vocabulary AND then by a character. Having the words isn't enough. You also need your *own* onigiri.

**Day 8 (買う arrives) — Phase 3: Resolution:**

The player can now buy an onigiri at the コンビニ (150 yen). When they eat a *purchased* onigiri:

> 「おにぎりを食べます。いただきます！...おいしいです！」

> **Quest complete.** ✅ おにぎりを食べる

The quest that took three days and two vocabulary unlocks to complete. The water bottle needed one verb. The onigiri needed a verb AND a second verb to acquire its own supply. The game teaches: vocabulary unlocks ability, but sometimes you need *multiple* words working together to accomplish a single goal. 食べる lets you eat. 買う lets you *have something to eat*.

**Thematic parallel:**
- Water quest: Blocked by missing verb → verb arrives → quest completes. (Linguistic obstacle only.)
- Onigiri quest: Blocked by missing verb → verb arrives → blocked by NPC → second verb arrives → quest completes. (Linguistic obstacle + social obstacle + economic obstacle.)

The onigiri quest is harder because the world is more complex now. Day 2's world had objects and nothing else. Day 5's world has objects, people, and ownership. Yamakawa's 「だめ！」 is the social version of the void — a barrier that requires a different kind of vocabulary to circumvent.

**The いつも pattern:** Dad said いつも about the void on Day 2. Yamakawa says いつも about a store that appeared this morning. The word is becoming a recurring tell — whenever an NPC is confronted with something that clearly just materialized, their instinct is to say it's "always" been this way. It's not that they're lying. It's that for them, it genuinely HAS always been this way. Their memory rewrites itself to match the current state of the world. いつも is the sound of reality smoothing over its own seams.

### The コンビニ (A Shop You Can't Shop At)

The convenience store is the first commercial building in the game. It uses a **passthrough window** — Rikizo stands outside, the shopkeeper stands inside. Items are visible through the window. No entering the building (中 doesn't exist until Day 9).

There is one problem: **買う (to buy) doesn't exist until N5.8 (Day 8).** Rikizo cannot buy things. The verb for purchasing has not been invented. He has 2,000+ yen. There is a shop. There are items. The concept of exchanging money for goods does not exist.

**Shopkeeper:** A generic NPC. Not a named character. Polite, functional.

**Shopkeeper dialogue (when approached):**
> 「いらっしゃいませ！」("Welcome!")

The shopkeeper greets Rikizo. And then... nothing. There's no transaction. There's no "which one?" because there's no verb that would complete the interaction. The shopkeeper welcomes you. You stand at the window. Items are visible:

**Visible items (Day 5–7, not purchasable):**

| Item | Price tag | Notes |
|---|---|---|
| おにぎり | 百五十円 | Triangular rice ball. Same thing Yamakawa is holding outside. Visible but untouchable. His won't be available either, as it turns out. |
| 水 (みず) | 百円 | Water. Player already has water from Day 2. Can see more water. Cannot acquire more water. |
| ノート | 三百円 | Notebook. Sits on the shelf. Exists. Cannot be obtained. |

**If the player tries to interact with an item:**
> 「...」 *(Nothing happens. Rikizo looks at the item. The item exists. The money exists. The bridge between them — the verb — does not.)*

**If the player talks to the shopkeeper again:**
> 「いらっしゃいませ！」("Welcome!") *(Same line. The shopkeeper is stuck in a greeting loop. They can welcome you. They cannot sell to you. The transaction requires a verb that hasn't been created yet.)*

**Design note:** The コンビニ is a shop that functions as a window display for three days. Rikizo can visit, look at items, and leave. The player has money and wants things. The game has a store. But the verb 買う doesn't arrive until Day 8, at which point the shopkeeper's dialogue expands: 「いらっしゃいませ！どれですか？」("Welcome! Which one?") — and suddenly the whole system works. The three-day gap between "store exists" and "buying exists" is the ontological rule at its most absurd-commercial. Yamakawa is standing RIGHT THERE holding an onigiri. There are onigiri IN THE SHOP. Rikizo has money. He cannot buy one. The verb doesn't exist.

**Day 8 update (買う arrives):** The shopkeeper gains the full interaction: 「どれですか？」→ item selection → 「ありがとうございます！また来てください。」 The shop becomes functional. The inventory grows over time as vocabulary grows.

### The 駅 (Station)

The train station is the most hauntingly beautiful location in the early game. It's a small, clean, well-maintained platform. Tracks stretch in both directions and vanish into the void. There is a departure board with no departures. A bench. A vending machine (non-functional — 買う "to buy" doesn't exist until Day 8). Everything is perfect and empty and waiting.

**Rikizo's reaction:**
> 「駅です。」("A station.")

**If player examines the tracks:**
> 「...どこからですか？どこに行きますか？」("...From where? Going where?")

**If player examines the departure board:**
> 「何もないです。」("Nothing.") *(Same flat tone as the void. The departure board IS the void — white, empty, no information. The station exists but connects to nothing.)*

**If player sits on the bench:**
> 「いい駅ですね。」("Nice station.") *(Rikizo is content. He's at a train station that goes nowhere. He thinks it's nice.)*

**Design note:** The station will eventually connect to other areas as the world grows. Trains will arrive when there are places for them to come from. For now, it's a beautiful monument to potential — a station without a system, tracks without destinations, a departure board without departures. The player who explores it thoroughly gets +1 curiosity. The player who finds it unsettling gets +1 paranoia (if they examine the tracks and the departure board on the same visit — the game interprets this as "noticing something is wrong").

### The Phone — Yamakawa's Message

When the player checks the phone on Day 5, there's a message. The phone that had nothing — no contacts, no messages, no apps — now has one notification.

**Message from やまかわ:**
> 「りきぞ！コンビニに来て！」("Rikizo! Come to the convenience store!")

This is a te-form request (来て). It serves as a gentle quest marker — go find Yamakawa. The message was somehow sent despite the phone having no messaging app visible on Day 4. How did Yamakawa message him? The phone didn't have contacts. The phone didn't have a messaging function. And yet: one message. From someone who's "always" been at a store that materialized this morning.

**After reading:** The message stays in the phone's message log. It's the first entry. The phone now has a "Messages" section with one conversation.

**Phone UI update (Day 5):**

| Feature | Status |
|---|---|
| Clock | Active (from Day 4) |
| Wallet | Active (from Day 4) |
| Messages | **NEW** — one message from やまかわ |
| Contacts | **NEW** — やまかわ auto-added |
| Map | Still empty |
| Apps | Still empty |

### Interactive Objects

**New exterior objects:**

| Object | nameJp | Location | Interaction |
|---|---|---|---|
| Road | みち (game vocab — 道 kanji arrives Day 6) | Between house and town | 「ここからあそこまで...」("From here to over there...") Rikizo walks the road. It's short. It connects two places that didn't exist relative to each other yesterday. |
| コンビニ window | コンビニ | Town | Items visible through window. Shopkeeper says いらっしゃいませ. Cannot buy anything (買う doesn't exist until Day 8). See shop section. |
| コンビニ door | ドア | Town | 「...だめです。」("...Can't.") Rikizo can't enter. He doesn't explain why. He just can't. The concept of "going inside" doesn't exist. He stands at the window. |
| 駅 platform | 駅 | Town edge | 「駅です。」Explorable exterior. See station section. |
| 駅 tracks | — | 駅 | 「...どこからですか？どこに行きますか？」 |
| 駅 departure board | — | 駅 | 「何もないです。」 |
| 駅 bench | — | 駅 | 「いい駅ですね。」 Rikizo can sit. |
| Void edge (town) | — | Beyond the last buildings | Same as always. Bigger world, same boundary. |

**Updated house objects:**

| Object | Change |
|---|---|
| Calendar | 「今日は五月一日です。」(May 1st) |
| Phone | Message notification. See phone section. |
| Front door | 「行きましょう！」("Let's go!") — wait, ましょう isn't until N5.8. Corrected: 「外に行きます！」("Going outside!") |

**Persistent objects:**

| Object | Status |
|---|---|
| Tree (木-さん) | Daily greeting continues (if befriended). 「木-さん、今日も行きますよ。」("Tree-san, I'm heading out today too.") — First time Rikizo tells the tree he's going somewhere. The tree, naturally, is not going anywhere. |
| Dad's gold | Same. 「だめ」now formally available as a word. |
| Mom's cake | Still on the counter. Still Mom's. Days 4–6 persistence. |
| Fridge | No inside. Continues. |

### Story Beats

| Moment | What Happens | What Rikizo Thinks | What the Player Should Feel |
|---|---|---|---|
| Stepping beyond the yard | A road exists. Buildings in the distance. The void has retreated. | 「外に行きます！」(thrilled, no questions) | The world DOUBLED overnight. There's a whole neighborhood. Yesterday it was void. Today there are buildings, a road, a station. How? Nobody asks. |
| First conjugated verb | Dad says 「どこに行きますか？」 | Responds naturally | The player might not consciously notice, but dialogue just transformed. Characters can DO things now, not just BE things. |
| Meeting Yamakawa | Best friend is at the コンビニ as if he's always been there | 「やまかわ！」(pure happy) | Yamakawa says いつも — "always." The same word Dad used about the void. At a store that appeared this morning. Their memories rewrite to match the world. |
| The food in Yamakawa's hand | He's holding something food-shaped. It changes. Nobody has a word for what's happening. | Doesn't comment | 食べる doesn't exist. Eating doesn't exist. And yet, food is disappearing from Yamakawa's hand. What is this process? The ontological rules say it can't be eating. But it's clearly eating. The world can't describe what's happening. |
| The convenience store | Passthrough window. Items visible: おにぎり, 水, ノート. 2,000 yen in pocket. Can't buy anything. | Confused? Accepting? | A store exists. Money exists. Items exist. The verb for buying doesn't. Rikizo stands at the window. The shopkeeper says いらっしゃいませ and nothing else. Yamakawa is RIGHT THERE holding an onigiri. There are onigiri IN THE SHOP. How did Yamakawa get his? Nobody asks. (Spoiler: he won't share it either.) |
| The empty station | Perfect platform, tracks into void, no departures | 「いい駅ですね。」 | The most beautiful and sad location yet. A station built for a train system that doesn't exist, tracks that lead into nothing, a departure board with no information. It's the void made architectural. Rikizo thinks it's nice. |
| Mom says "come home" | 「家に来てくださいね。」— perfectly normal Mom line | Takes it at face value | Is it normal? Or does Mom know that the world beyond the house is unstable, new, not-quite-real? Her "come home" is warm but insistent. Every day from now on. |
| The phone message | やまかわ messaged despite the phone having no messaging app yesterday | Doesn't question it | How? The phone had nothing. Now it has a message from someone who found the phone's contact info in a system that didn't exist. The phone is generating features the way the world generates buildings. |

**Tone calibration for Day 5:** This is the most exciting day so far — the world opens up and Rikizo has a friend and a shop and a station. But the undertone deepens. いつも appears again (Yamakawa). The station is hauntingly empty. The phone generated a feature spontaneously. Mom's "come home" is warm but carries weight. The comedy (Dad saying だめ about money, Yamakawa not-eating, three items in a store) sits alongside genuine unease (tracks into void, a departure board of nothing, a best friend who's "always" been somewhere impossible). Day 5 is where the game's two tones — comedy and cosmic dread — achieve their first real balance.

### Running Gags Updated

1. **The Toilet Door** — Continues. Dad detects it from the living room even when Rikizo was just outside for the first time. Sixth sense undiminished by distance.
2. **Dad's Gold** — Continues. だめ is now a real word. Dad has been empowered.
3. **Tree-san** — Rikizo tells the tree he's going out. The tree does not go out. The tree is stationary. Their relationship is asymmetric in mobility.
4. **The Fridge** — No inside. Continues.
5. **Family Possessions** — Cake still on counter. Gold still on shelf. Rikizo still has a tree.
6. **The Empty Phone** — Less empty now! It has a message! And a contact! Progress. (Still no apps, no map, no signal explanation.)
7. **いつも** — **Recurring tell.** When NPCs are confronted with something impossible, they say いつも — "always." Dad: the void is いつも. Yamakawa: the コンビニ is いつも. Their memories rewrite to match reality. It's not a lie — for them, it genuinely has always been this way. The word is the sound of the world smoothing over its seams. Players who notice the pattern get the creepiest experience; players who don't still get the general NPC obliviousness vibe.
8. **Yamakawa's Eternal Onigiri** — **New gag, resolves Day 7.** Yamakawa's chibi sprite and conversation portrait both show him holding an onigiri from Day 5 onward. It's always there. Same onigiri. Never changes. Nobody can mention it because 食べる doesn't exist. On Day 7, 食べる arrives. Rikizo can finally ask about the onigiri. He asks to eat it. Yamakawa says no — it's his. Then eats it right there, mid-conversation, in front of Rikizo. Sprite changes from onigiri-in-hand to empty-hand during the dialogue. 「おいしかったですよ。」 Three days of visual constancy resolved in three seconds of onscreen cruelty.
9. **The Onigiri Quest** — **NEW. ◻ おにぎりを＿＿.** Second quest in the game. Same blank-verb pattern as water. A fragment of Yamakawa's onigiri enters inventory. The verb (食べる) arrives Day 7 → text fills in → but Yamakawa blocks you (「だめ！わたしのおにぎり！」). Resolution requires 買う (Day 8) to buy your own. Three-day, two-verb quest. The game's thesis escalation: water needed one word. Onigiri needs two words and the social awareness to go around a stubborn friend.

### State Tracking (Day 5)

**Flags settable:**
- `met_yamakawa_day5` — Completing Yamakawa's first conversation. Gates Yamakawa as a recurring NPC + daily relationship tracking.
- `received_onigiri_fragment` — Rikizo caught the onigiri fragment from Yamakawa. Quest ◻ おにぎりを＿＿ added to quest log.
- `read_yamakawa_message_day5` — Reading the phone message. +1 curiosity (the phone generated a feature). If also `received_phone_day4`: +1 paranoia (the player might connect: empty phone → spontaneous message).
- `visited_station_day5` — Reaching the station. +1 curiosity.
- `examined_tracks_and_board_day5` — Examining both the tracks AND departure board on the same visit. +1 paranoia (noticing the station connects to nothing).
- `visited_konbini_day5` — Approaching the コンビニ window. Shopkeeper greets you. You can't buy anything. +1 curiosity (why can't I buy things?).
- `tried_konbini_door_day5` — Trying to enter the convenience store (can't — 中 doesn't exist). +1 curiosity.

**Relationships:**
- char_taro: +1 (talk)
- char_sakura: +1 (talk)
- char_tree: +1 (daily greeting, if befriended)
- char_yamakawa: +1 (first meeting counts as daily talk) +1 (event bonus: first meeting)

**Hidden stats:**
- paranoia: 0–8 cumulative possible (phone message + station tracks + board combo)
- curiosity: 0–13 cumulative possible (station visit, konbini door, phone message, etc.)
- dad_annoyance: 0–3 net (cooling continues)

**Conditional content (Day 5):**
- Tree-san's dialogue varies: if befriended, 「木-さん、今日も行きますよ。」 If not: 「木です。」
- Mom's "come home" line plays regardless of flags — it's always there. But if `stat:paranoia >= 5`, Rikizo pauses slightly before responding. A tiny beat. The first sign paranoia is affecting him.

### Assets Required

| Asset | Type | Mode | Priority | Notes |
|---|---|---|---|---|
| Town/neighborhood tilemap | Tilemap | A (Pixel) | **Critical** | First exterior map beyond the yard. Road, コンビニ exterior, 駅 platform, void edges. |
| Town collision map | Data | A (Pixel) | **Critical** | Player can walk road and station platform but not enter buildings or pass void edge. |
| コンビニ exterior sprite | Building sprite | A (Pixel) | High | Small convenience store with visible passthrough window. Typical Japanese コンビニ look (green/blue/orange stripes). |
| コンビニ window display | UI element / sprite | — | High | Items visible through window (おにぎり, 水, ノート with price tags). NOT interactive until Day 8 when 買う arrives. Window-shopping only. |
| 駅 exterior/platform | Tileset | A (Pixel) | High | Small station platform. Tracks going both directions into void. Departure board (empty). Bench. Clean, well-maintained, deserted. |
| Departure board (empty) | Object sprite | A (Pixel) | Medium | Wall-mounted board with no entries. Pure white/blank display. |
| やまかわ sprite (with onigiri) | Sprite | A (Pixel) | High | Leaning against wall near コンビニ. Holding onigiri in right hand. Casual, relaxed. This is his Day 5–7 sprite (until the player talks to him on Day 7 and he eats it). |
| やまかわ sprite (no onigiri) | Sprite | A (Pixel) | High | Same pose/location but empty-handed. Swapped in mid-conversation on Day 7 when he eats the onigiri in front of Rikizo. Permanent from then on. |
| やまかわ conversation portrait (with onigiri) | Portrait | B (MP100) | High | Friendly, easy-going. Onigiri visible in hand/frame. At least 2 expressions (default, happy). Day 5–7 version (pre-eating). |
| やまかわ conversation portrait (no onigiri) | Portrait | B (MP100) | High | Same character, no onigiri. Post-eating version (Day 7+ after the conversation). At least 2 expressions (default, happy). |
| Phone message UI | UI element | — | High | Message notification, message list (one entry), conversation view. |
| Road tileset | Tileset | A (Pixel) | Medium | Simple path connecting house area to town area. |

### Non-Kanji Real-World Vocab Used

| Word | Notes |
|---|---|
| コンビニ | In glossary (N5.5). Short for コンビニエンスストア. |
| スーパー | In glossary (N5.5). Not physically present yet (building exists but is background — no window, no interaction until more items are available). |
| バス | In glossary (N5.5). Vocab exists but no bus appears (no vehicle system yet). |
| タクシー | In glossary (N5.5). Same — vocab only, no vehicle. |
| ノート | Game vocab. Shop item. |
| ばんそうこう | Game vocab. Shop item. |

### Open Questions for Day 5

1. ~~**Yamakawa's food object:**~~ **RESOLVED — Onigiri.** Yamakawa holds an onigiri in both his overworld sprite and conversation portrait from Day 5–7. It's always the same onigiri. It never changes. On Day 7, when 食べる unlocks, Rikizo asks if he can eat it. Yamakawa says no and eats it himself, right there. Sprite changes mid-conversation. See "Yamakawa's Eternal Onigiri" in the running gags and NPC section for full design.

2. **Station sound design:** Should the station be silent (emphasizing emptiness) or have ambient train-station sounds (PA chime, distant rumble) despite no trains existing? Silent is creepier. Ambient sounds without a source is creepier in a different way — where are the sounds coming from? Recommendation: a single, soft PA chime that plays once when you first arrive. Then silence. The chime implies a system. The silence confirms nothing is using it.

---

## Day 6 — "Landscape" (unlocked by N5.6: Landscape & Vehicles)

### Lesson Kanji & Key Vocab Available

**New kanji (4):** 山、川、道、車

**Cumulative kanji (48):** All N5.1–N5.5 + above.

**New vocab highlights:**
- Landscape: 山 (やま, mountain), 川 (かわ, river), 道 (みち, road/path)
- Compound: 火山 (かざん, volcano — 火 Day 2 + 山 Day 6). Available as lesson vocab but does not appear as a game-world feature.
- Vehicle: 車 (くるま, car)
- Communication: メール (email)

**Grammar:** No new unlocks. Same as Day 5 — full polite verb paradigm, te-form, plain_past. G7 (te-form mechanics / てください) formally unlocked after N5.5, so reinforcement targets apply: ≥1 てください, ≥1 て-connector in today's content.

**New this day:** The world gains geography. Mountains on the horizon. A river. Roads extending further. Cars. Dad gets a car and immediately becomes insufferable about it.

### Location

**THE WORLD GETS BIG.** Yesterday: a small neighborhood — house, road, コンビニ, 駅, void at the edges. Today: the camera pulls back. There are mountains on the horizon. A river runs near the town. The road extends further. The void has retreated again — it's now at the base of the mountains, behind the river bend, past where the road curves out of sight. The playable area hasn't grown enormously (new explorable zones are limited), but the *visible* world has expanded dramatically. There's a skyline now. There's terrain.

Rikizo wakes up, looks out the window, and there are mountains. They weren't there yesterday. He does not find this remarkable.

**New areas:**

| Area | Description | Accessibility |
|---|---|---|
| Extended road (道) | The road from Day 5 now continues further. It has a proper name-concept. Branches appear — one path leads toward the river, another toward the edge of town where mountains are visible. | Walkable |
| River bank (川) | A small river runs near the edge of town. Clear water, gentle flow. The river comes from the direction of the mountains and flows toward... the edge of the known world. It doesn't end. It just goes past where you can follow it. | Walkable to the bank. Cannot cross (no bridge — 橋 doesn't exist). |
| Mountain viewpoint | A spot at the edge of town where the mountains are visible on the horizon. You can't reach the mountains. They're scenery. Beautiful, distant, and new. | View only. Not reachable. |
| Roadside | Cars pass on the extended road. They come from one direction and go in the other. Where from? Where to? The road curves out of sight in both directions. | Observable from roadside |

**Interior changes (house):**
- Calendar: 「五月二日」(May 2nd, Friday).
- Window: Mountains visible through the window for the first time. The view has changed overnight. Nobody comments.
- Phone: Email icon appears. One new メール. (See Phone section.)

**What does NOT exist yet:**
- No bridge across the river (橋 not in N5 curriculum)
- Cannot reach the mountains (too distant, no path extends that far)
- No other towns or villages visible
- Still cannot enter buildings (中/外 = N5.9)
- No bus/taxi vehicles on the road (バス/タクシー are vocab from Day 5 but no bus stops or taxi stands — the vehicles that pass are all 車)

### The Cars

Cars appear on the road. They drive through town — not fast, not slow, just... passing. They come from one direction (where the road curves out of sight toward the void edge) and leave in the other direction (where the road curves out of sight toward the other void edge). They do not stop. They do not park. They pass through like the town is a waypoint on a journey that has no visible origin or destination.

**What's inside them?** Dark silhouettes. Shapes that suggest people. Rikizo never comments on the drivers. If the player tries to examine a passing car:

> 「車です。」("A car.")

That's it. He identifies the object. He does not wonder about the people inside, where they're going, or where they came from. Cars exist now. Cars drive. This is how roads work.

**One exception — Dad's car.** A car is parked in front of the house. It's just... there. Was it always there? It was not. There was no car yesterday. There is a car today.

Dad has immediately claimed it with a ferocity that surprises everyone, including possibly Dad. He stands near it. He watches it. If Rikizo approaches it, Dad appears from nowhere to say だめ. The car is Dad's most prized possession, surpassing even the gold. The gold he hoards quietly. The car he guards actively. See the NPC section for the full car gag.

**Design note — Cars from the void:** The passing cars are the first hint that there might be an outside world with *people* in it. The station suggested infrastructure (tracks, departure board) but had no activity. The cars are active — they move, they carry silhouettes, they travel with purpose. But their origin and destination are both beyond the visible world. They emerge from the void and return to the void. This raises a question the game will sit with for a long time: is there a world out there that Rikizo simply can't see yet? Or are the cars... something else?

### The River

The 川 is the first natural feature in the game. Not a building, not a road, not a station — a river. Water that moves. It comes from the direction of the mountains and flows past the edge of town.

**At the river bank:**
> 「川です。きれいですね。」("A river. It's pretty.")

**If the player examines the water:**
> 「水です。」("Water.") *(Same word as the bottle. Same kanji. But this water moves. It flows. It goes somewhere. The bottle water just sits there.)*

**If the player tries to cross:**
> 「...行きません。」("...I won't go.") *(Not "I can't" — he won't. He looks at the other side and decides not to cross. There's nothing over there anyway — just more ground and then the void edge. But the phrasing is interesting. He could say だめ. He says 行きません — the polite negative of going. A deliberate choice.)*

**If the player follows the river downstream (toward the void edge):**
> The river flows past the last visible terrain and continues into the whiteness. It doesn't end. It doesn't hit a wall. It just goes. The water flows into nothing and Rikizo stops walking before he reaches the edge.

**Design note — The river's direction:** The river flows FROM the mountains (which materialized today) TOWARD the void. Water flows downhill, from high ground to low ground. The mountains are "real" terrain. The void is "below" the mountains. The river treats the void as if it's a continuation of the landscape — as if there's more terrain out there, unseen. The water doesn't stop at the void. It keeps going. What does this mean? Nothing yet. But the player who notices will remember.

### NPCs

#### Dad (たろう) — Living room / Front of house

Dad has a new outdoor position — he can be found near "his" car, standing guard with the intensity of a man protecting national treasure. The car materialized overnight. Dad has immediately bonded with it on a spiritual level.

**Indoor conversation (morning, 3 lines):**
1. **Dad:** 「今日もどこに行きますか？」 — "Where are you going today too?"
2. **Rikizo:** 「道を行きます！」 — "I'm going down the road!"
3. **Dad:** 「だめですよ、車の道はだめです。」 — "No good, the car road is no good." *(Dad's prohibition vocabulary is limited to だめ. Everything dangerous is だめ. Cars? だめ. The road? だめ.)*

**Outdoor conversation — THE CAR GAG (4 lines):**

If the player approaches Dad's car, Dad materializes nearby (if not already there) with alarming speed:

1. **Dad:** 「だめ！」 — "No!" *(Immediate. Loud. The fastest Dad has ever reacted to anything. Faster than the toilet door detection. Dad has found something he cares about more than gold.)*
2. **Rikizo:** 「...車ですか？」 — "...The car?"
3. **Dad:** 「わたしの車です。だめです。」 — "MY car. No." *(First time Dad uses わたしの about anything. He didn't say わたしの金 about the gold. He didn't say わたしの家 about the house. But the car that appeared this morning? わたしの.)*
4. **Dad:** 「見ないでください。」 — Wait, 見る isn't available. Revised: 「行ってください。」 — "Go away." *(Te-form request. Dad's first てください is telling his own son to leave the vicinity of a car.)*

**If the player examines the car WITHOUT Dad nearby:**
> 「たろうの車です。」("Dad's car.") — Rikizo identifies ownership immediately. There's no question whose car this is. The car radiates Dad Energy.

**If the player touches/examines the car AGAIN after the first conversation:**
> Dad (appearing from nowhere): 「だめ！だめです！」("NO! No!") — He appears. He was inside. He was across town. It doesn't matter. Dad detects contact with his car the way he detects the toilet door — sixth sense, infinite range, zero delay.

**The car becomes a persistent gag.** From Day 6 onward, touching the car summons Dad. Every time. He doesn't have to be in the scene. He wasn't walking toward the car. He's just suddenly THERE, saying だめ. The player can test this from anywhere Dad's car is visible. Walk up, touch car, Dad appears. It's the toilet door gag promoted to outdoor use, but more territorial. Dad's reaction to the toilet door is comic timing. Dad's reaction to the car is genuine emotional investment.

**Repeatable line:** 「どこに行きますか？」 — continues from Day 5. But if the player just touched the car: 「どこに行きますか？...車はだめですよ。」("Where are you going? ...The car is off limits.")

#### Mom (さくら) — Kitchen

**Conversation (2 lines):**
1. **Mom:** 「今日は山が見えますね。」 — Wait, 見える isn't available (potential form, N4.3). Revised: 「今日は山がありますね。」 — "There are mountains today." *(ある is available. Mom says mountains ARE there today. Not "appeared" — ARE there. Present tense. Factual. As if observing the weather. "There are mountains today." Like there might not be tomorrow? Or like she didn't notice them before? Both interpretations are unsettling.)*
2. **Mom:** 「きれいですね。家に来てくださいね。」 — "Pretty, aren't they. Come home, okay?" *(Same closing line. Every day. Come home.)*

#### やまかわ — At the River

**Yamakawa has migrated.** He's not at the コンビニ today. He's at the river bank, sitting on a rock, looking at the water. Still holding the onigiri. Same onigiri. Same hand. Day 3 of the Eternal Onigiri. (Day 5, 6, and 7 — he holds it all three days. It resolves on Day 7 when 食べる arrives.)

If the player visits the コンビニ first:
> The usual spot is empty. Yamakawa isn't leaning against the wall. His absence is noticeable — he was there every time you visited. The shopkeeper still says いらっしゃいませ to the void.

**Discovery:** When Rikizo arrives at the river bank, Yamakawa is already there. Of course he is. He found the river before Rikizo did. He found the コンビニ before Rikizo did. Yamakawa is always one step ahead in discovering the world's new additions, as if he gets a preview.

**Conversation (6 lines):**
1. **Yamakawa:** 「お、りきぞ！ここに来ましたか！」 — "Oh, Rikizo! You came here!" *(Same energy as Day 5. Yamakawa greets you at every new location as if he's been waiting.)*
2. **Rikizo:** 「やまかわ！川ですね！」 — "Yamakawa! A river!"
3. **Yamakawa:** 「いい川ですよ。毎日ここに来ます。」 — "Good river. I come here every day." *(Every day. The river appeared this morning. Yamakawa comes here every day. His timeline is already overwritten.)*
4. **Rikizo:** 「水がきれいですね。」 — "The water is pretty."
5. **Yamakawa:** 「山から来ますよ、この水は。」 — "This water comes from the mountains." *(Yamakawa gestures vaguely upstream. The mountains that materialized overnight are, in Yamakawa's understanding, the ancient source of the river that also materialized overnight. He has a complete geographical model of a landscape that is hours old.)*
6. **Yamakawa:** 「いいところですね。」 — "Nice place, huh." *(He looks back at the water. He's content. Onigiri in hand. River in front. Mountains on the horizon. Everything is nice. Everything has always been here.)*

**If player asks about the mountains:**
> Yamakawa: 「山？...いつもありましたよ。」 — "Mountains? ...They were always there."

いつも again. The rewrite is instant. The mountains have always been there. The river has always been there. Yamakawa has always come here every day.

**If player asks about the onigiri (no interaction — 食べる doesn't exist):**
> The onigiri is visible. Rikizo looks at it. There is no dialogue option about food. You cannot ask about something when the verbs that describe its purpose don't exist. The onigiri is an object. It is in Yamakawa's hand. That is the complete description. The player who has been eyeing it since Day 5 has no way to express interest, let alone request a bite.

**Design note — Yamakawa at the river:** This is the first time an NPC has moved to a new location between days. Until now, NPCs were fixed: Dad in the living room, Mom in the kitchen, Yamakawa at the コンビニ. Yamakawa's migration to the river signals that NPCs can exist in the wider world, not just at their "assigned" spot. It also makes the river feel alive — it's not just scenery, it's a place where people go. When the player finds Yamakawa already sitting there, looking at the water, it creates the impression that this world has activity even when Rikizo isn't watching. Yamakawa didn't teleport — he walked here. (When? How? He was at the コンビニ yesterday. The river didn't exist yesterday. Don't think about it.)

### The Phone — Email

The phone gets another new feature: メール. An email icon appears alongside the existing Messages.

**Email from すずき先生:**

> Subject: 「来週」("Next week")
> Body: 「りきぞさん、来週から学校です。来てくださいね。」 — "Rikizo, school starts next week. Please come."

This is the first contact from すずき先生 (Suzuki-sensei), the school Japanese teacher. The email mentions 来週 (next week) and 学校... wait — 学校 isn't available (学/校 = N5.12). Let me revise:

> Body: 「りきぞさん、来週からです。来てくださいね。すずき」 — "Rikizo, from next week. Please come. — Suzuki"

来週から — "from next week." From next week... what? Suzuki doesn't say. 学校 doesn't exist. The thing that starts next week has no name. Suzuki-sensei, a teacher at a school that doesn't exist, sends an email about something that starts next week but cannot be described. The player who knows the curriculum knows it's school. Rikizo... accepts it.

**After reading:**
> Phone gains: Email section (one email). すずき先生 appears as a contact.

**Phone UI update (Day 6):**

| Feature | Status |
|---|---|
| Clock | Active |
| Wallet | Active |
| Messages | 1 conversation (やまかわ) |
| Email | **NEW** — 1 email from すずき先生 |
| Contacts | やまかわ, **すずき先生 (new)** |
| Map | Still empty |
| Apps | Still empty |

### Interactive Objects

**New exterior objects:**

| Object | nameJp | Location | Interaction |
|---|---|---|---|
| Dad's car | 車 | Front of house | **TRAP.** 「たろうの車です。」 Touching it summons Dad from anywhere: 「だめ！わたしの車です。」 Second touch: 「だめ！だめです！」 Third touch: 「...」「だめ。」 (quiet disappointment). |
| Passing cars | 車 | Road | 「車です。」 — Cannot interact further. They don't stop. |
| River | 川 | River bank area | 「川です。きれいですね。」 Water examination: 「水です。」 |
| River downstream (toward void) | 川 | River bank edge | The river continues into the void. Rikizo stops walking. |
| Mountain viewpoint | 山 | Edge of town | 「山です。大きいですね。」 |
| Extended road | 道 | Beyond Day 5 road | 「道です。どこに行きますか...」("A road. Where does it go...") — Another rare moment of Rikizo questioning. He trails off. |

**Persistent objects (updates):**

| Object | Status |
|---|---|
| Window (house) | **Changed** — mountains visible through it now. 「山がありますね。」 |
| Tree-san | Daily greeting continues. 「木-さん、今日も山がありますよ。」("Tree-san, there are mountains today too.") — Rikizo reports landscape changes to the tree. The tree's response to geological upheaval is the same as its response to everything: being a tree. |
| Yamakawa | **Moved to the river.** Not at the コンビニ. Sprite: still holding onigiri (Day 2 of 3). Tomorrow: 食べる arrives. Rikizo will finally be able to ask about it. First NPC location change in the game. |
| コンビニ | Same window display. Still can't buy anything (買う = Day 8). Shopkeeper says いらっしゃいませ to nobody — Yamakawa isn't there. |
| 駅 | Same. Empty. No trains. Tracks into void. But now the tracks lead toward the mountains — the void between the station and the mountain range has contracted. The tracks don't reach the mountains, but they point at them. Progress? Or coincidence? |
| Mom's cake | **Final day.** Day 4–6 persistence ends. The cake is consumed overnight (offscreen, unnarrated — 食べる doesn't exist until tomorrow). On Day 7, the counter is empty. If asked, Mom: 「ケーキ？...ないですよ。」("Cake? ...There isn't any.") The cake's disappearance mirrors the onigiri's — things cease to exist between days. |

### Story Beats

| Moment | What Happens | What Rikizo Thinks | What the Player Should Feel |
|---|---|---|---|
| Mountains through the window | Waking up, looking outside: a mountain range that wasn't there yesterday | 「山がありますね。」(observational, calm) | A MOUNTAIN RANGE appeared overnight. Rikizo treats this as weather. |
| The extended road | The path from Day 5 goes further now, branching | 「道です。どこに行きますか...」 | Roads to somewhere. Or nowhere. The road curves out of sight — what's beyond the bend? |
| First car passes | A car drives through town, silhouettes inside, heading from void to void | 「車です。」 | Where are they going? Where did they come from? WHO is in there? Rikizo doesn't ask. |
| Dad's car | A car is parked at the house. It wasn't there yesterday. | 「たろうの車です。」 | Dad has a car now. He guards it like a dragon guards gold. Actually, he guards it MORE than the gold. The gold he just says だめ about. The car he teleports to defend. |
| Touch Dad's car | Player approaches the car. Dad materializes instantly. 「だめ！わたしの車です。」 | Surprised, then amused | The toilet door gag, outdoors, escalated. Dad's sixth sense now covers two objects. The car reaction is FASTER than the toilet reaction. Dad has a hierarchy of territorial instincts and the car is at the top. |
| Yamakawa at the river | He's not at the コンビニ. He's at the river, sitting on a rock, already there. | 「やまかわ！川ですね！」 | First NPC location change. Yamakawa migrated. He's always one step ahead in discovering the world. He says he comes here "every day." It's been one morning. |
| The river | Clear water, flowing from mountains toward the void | 「きれいですね。」 | Beautiful. The water flows into nothing. The river doesn't end — it just goes past where you can see. |
| "This water comes from the mountains" | Yamakawa explains geography that is hours old with the confidence of a geologist | 「山から来ますよ、この水は。」 | He has a complete geographical model of terrain that appeared this morning. He knows where the river comes from. He has always known. |
| River into void | Following the river downstream — it flows past the world's edge into whiteness | Stops walking. Doesn't comment. | The most visually striking void moment yet. Water flowing into nothing. A natural feature that treats the void as if it's just more landscape. |
| Mom says mountains "are" today | 「今日は山がありますね。」 | Nods | "There are mountains today." TODAY. The phrasing implies they might not have been there yesterday. Or it's just a comment. The ambiguity is the horror. |
| Suzuki's email | Something starts next week. It has no name. | Rikizo reads it and doesn't question what "from next week" refers to | A teacher at a school that doesn't exist sends an email about an event that can't be named. The student reads it and nods. |
| The station tracks | Tracks now point toward the mountains. The void between has contracted. | Doesn't notice | Progress? The infrastructure is reaching toward the new geography. The world is knitting itself together. |

### Running Gags Updated

1. **The Toilet Door** — Continues. Now has competition from the car for Dad's fastest teleportation.
2. **Dad's Gold** — Continues. But the car has usurped gold as Dad's primary territorial fixation. Gold gets a passive だめ. The car gets an active teleport-and-shout.
3. **Dad's Car** — **NEW. MAJOR GAG.** Touching the car summons Dad from anywhere, instantly. He says だめ with more conviction than he's ever said anything. He used わたしの for the first time in the entire game — about the car. Not the gold, not the house, not his family. The car. Dad has a hierarchy: car > gold > toilet door > everything else. This gag persists for the rest of the game. Every day, from any location, touching the car = Dad appears. The player can test this. It always works. It becomes a speedrun category: "how far from the car can I get before touching it and still have Dad appear instantly?"
4. **Tree-san** — Rikizo now reports landscape developments to the tree. The tree's participation in these conversations is limited by being a tree.
5. **The Fridge** — No inside. Continues.
6. **Family Possessions** — Cake = FINAL DAY. Gold = continues (demoted in Dad's heart). Car = **new** (Dad's most beloved). Tree = Rikizo's.
7. **The Empty Phone** — Less empty! Email exists. Two contacts now.
8. **Yamakawa's Eternal Onigiri** — DAY 2 OF 3. Tomorrow: 食べる arrives. The onigiri is still there. The verb for eating is not. One more day.
9. **The Onigiri Quest** — ◻ おにぎりを＿＿ persists. Day 2 of blank. Fragment in inventory: 「おにぎりです。」 That's all you can say.
10. **Mom's "Come Home"** — **Pattern crystallizing.** 「家に来てくださいね。」 Every day. Warm. Insistent. She never forgets to say it. She never varies the phrasing. It's a ritual. The player should start wondering why she's so consistent about this specific request.

### State Tracking (Day 6)

**Flags settable:**
- `visited_river_day6` — Reaching the river bank. +1 curiosity.
- `followed_river_to_void_day6` — Following the river downstream to the void edge. +1 paranoia (water flows into nothing). +1 curiosity.
- `touched_dads_car_day6` — Triggering Dad's car teleportation for the first time. +1 dad_annoyance. Also sets `car_gag_active` (persistent flag — enables the summon mechanic for all future days).
- `touched_car_twice_day6` — Triggering Dad's car reaction a second time on the same day. +1 dad_annoyance (he's genuinely annoyed now). If player touches it a third time: Dad's line becomes just 「...」 followed by 「だめ。」 (flat, quiet, disappointed — worse than yelling).
- `read_suzuki_email_day6` — Reading the email about "next week." +1 curiosity (what starts next week?).
- `examined_road_day6` — Examining the extended road and hearing Rikizo trail off. +1 curiosity.
- `visited_mountain_viewpoint_day6` — Seeing the mountains up close. +1 curiosity.

**Relationships:**
- char_taro: +1 (talk, indoor). But if `touched_dads_car_day6`: -1 (net zero or negative — Dad is annoyed). If touched twice: -2.
- char_sakura: +1 (talk)
- char_tree: +1 (daily greeting, if befriended)
- char_yamakawa: +1 (talk)

**Hidden stats (Day 6 additions):**
- paranoia: +1 to +2 possible today (river-void, mountains overnight)
- curiosity: +1 to +4 possible today (river, road, email, mountain viewpoint)
- dad_annoyance: +0 to +1 (Dad is becoming predictable)

**Conditional content (Day 6):**
- If `stat:curiosity >= 10`: Rikizo's line at the extended road changes from 「道です。どこに行きますか...」 to 「この道は...どこからですか？」("This road... where is it from?") — He asks about origin, not destination. A subtle shift. Curious Rikizo is starting to look backwards, not forwards.
- If `befriended_tree`: Tree-san's daily line is unique. If not befriended: 「木です。」
- If player touches Dad's car 3+ times in one day: Dad stops appearing. The car is just... locked somehow. A small 「だめ」 text floats above it if examined. Dad has transcended physical presence and embedded his prohibition directly into the object.

### Assets Required

| Asset | Type | Mode | Priority | Notes |
|---|---|---|---|---|
| Expanded town tilemap | Tilemap | A (Pixel) | **Critical** | Extends Day 5 map. Add: extended road with curves, river bank area, mountain viewpoint, void edges pushed back. |
| Mountain skyline | Background layer | A (Pixel) | **Critical** | Parallax mountain range on the horizon. Visible from multiple locations including through the house window. Peaceful, scenic, no volcanic activity. |
| River tileset | Tileset | A (Pixel) | High | Flowing water animation (2–3 frame loop). River runs from mountain direction to void direction. |
| River-void transition | Tileset/FX | A (Pixel) | High | The point where the river flows past the world's edge into white void. Visually striking — water meeting nothing. |
| Dad's car (parked) | Object sprite | A (Pixel) | High | Small car parked in front of the house. Dad's most prized possession. Needs to look touchable/interactable — the player should be drawn to click on it. |
| Passing cars | Sprite | A (Pixel) | Medium | 2–3 car variants that drive across the road. Dark silhouettes visible through windows. Move on a fixed path, spawn offscreen, despawn offscreen. |
| Mountain viewpoint area | Tilemap detail | A (Pixel) | Medium | Small clearing at the edge of town with a view of the mountains. Maybe a fence or railing. |
| Email UI | UI element | — | Medium | Email list view, email detail view. Simple — one email initially. |
| すずき先生 contact icon | UI element | — | Low | Small icon for the email sender. No full portrait needed yet (first appears in person Day 12). |

### Non-Kanji Real-World Vocab Used

| Word | Notes |
|---|---|
| メール | In glossary (N5.6). Email. Phone feature. |
| コンビニ | Continues from Day 5. |
| バス / タクシー | Vocab from Day 5 but no bus/taxi vehicles appear — only generic 車. |

### Open Questions for Day 6

1. **How far can the player walk?** The road extends further, but where does it dead-end? Recommendation: the road curves out of sight and the player can follow it to where it meets the void edge — the pavement continues into whiteness, like the river. The road doesn't end. It goes where you can't follow. This mirrors the river and the train tracks: all infrastructure in this world continues past its edge, implying a larger world that isn't visible. Or implying nothing at all.

2. **Can the player interact with passing cars?** Recommendation: No. Cars are ambient. They pass. Rikizo says 「車です。」 If the player stands in the road, the car... goes through him? Around him? This should be tested. Maybe cars don't come if you're on the road — they only pass when you're on the sidewalk. They're Schrödinger's traffic: observed from the side, never tested.

3. **Station update:** Should the station show any change on Day 6 (tracks now pointing at mountains, void between contracted)? Recommendation: Yes, subtle. The void visible at the end of the tracks is now further away — mountains are faintly visible past where the tracks disappear. No dialogue change. Just a visual update the observant player might notice.

---

## Day 7 — "Hunger" (unlocked by N5.7: Size & Food)

### Lesson Kanji & Key Vocab Available

**New kanji (4):** 大、小、食、飲

**Cumulative kanji (52):** All N5.1–N5.6 + above.

**New vocab highlights:**
- Actions: 食べる (たべる, to eat), 飲む (のむ, to drink)
- Size: 大きい (おおきい, big), 小さい (ちいさい, small)
- Feelings: すき (like — early-use hiragana, 好き kanji = N4.4), 大すき (だいすき, love — partial kanji)
- Food: カレー (curry), パン (bread), サラダ (salad), おにぎり (rice ball — from Day 5 glossary)
- Drinks: コーヒー (coffee), ジュース (juice/soft drink)
- Places: レストラン (restaurant)
- Set phrases: いただきます (before eating), ごちそうさまでした (after eating)

**Grammar:** No new unlocks. Same as Day 5–6 — full polite verb paradigm, te-form, plain_past. G7 reinforcement continues: ≥1 てください, ≥1 て-connector.

**New this day:** FOOD EXISTS. 食べる and 飲む enter the world simultaneously. The cake resolves. The onigiri resolves. The コンビニ gains おにぎり as a visible food item (still can't buy — 買う = Day 8). Mom's kitchen becomes a place where eating happens. The world transitions from a place where objects exist to a place where objects can be consumed.

---

### The Day Food Entered the World

Day 7 is the most consequential vocabulary expansion since Day 5 gave Rikizo legs. Two verbs — 食べる and 飲む — transform every food and drink object that has existed as static inventory into something with *purpose*. Water is no longer just 水. It's something you 飲む. The cake that sat on the counter for three days wasn't waiting — it was inedible. Not "Rikizo chose not to eat it." The *concept* of eating it did not exist.

Today, that changes. And the game acknowledges the change by resolving every frozen food reference simultaneously.

---

### Morning — The Kitchen Revolution

Rikizo wakes up. The calendar reads 「五月三日」(May 3rd, Saturday).

**THE CAKE IS GONE.**

The counter where Mom's cake has sat since Day 4 is empty. The cake — that inviolable, permanent, possessively-guarded object — has vanished overnight.

**If player interacts with the empty counter:**
> 「ケーキは...？」("The cake...?")

**If player asks Mom (default path):**
> Mom: 「お母さんのケーキです。お母さんが食べました。」("It was Mom's cake. Mom ate it.")

She's matter-of-fact. She told you it was hers. On Day 4 she said 「お母さんのケーキです。」 She was not describing it. She was filing a property claim. And overnight — the *exact night* that 食べる entered the world — she exercised her rights. She didn't share. She didn't offer. She ate the entire thing. Offscreen. Between days. The first act of eating in this world was Mom consuming a cake that had been untouchable for 72 hours.

**If player asks Mom AND `flag:befriended_tree_day2` is set:**
> Mom: 「木-さんが食べました。」("Tree-san ate it.")

Mom blames the tree. She says this with a straight face. The tree is outside. The tree has no mouth. The tree did not eat the cake. Mom does not elaborate.

**If Rikizo pushes (talks to Mom again):**
> Mom: 「...お母さんのケーキです。」("...It was Mom's cake.")

She falls back to the ownership defense without confirming or denying the tree accusation. Did the tree eat it? Did Mom eat it and blame the tree? Was there ever a cake? Mom's final position is: it was hers. What happened to it is immaterial.

**Design note:** This is the first time the game's conditional flag system produces a visibly different (and funnier) outcome. Players who befriended the tree get rewarded with a joke. Players who didn't get the honest answer. Both are funny. The tree version is funnier. This teaches players (subconsciously) that their choices from earlier days have consequences — even silly ones.

### Breakfast — First Meal

Mom has prepared breakfast. This is the first time food appears as something to be *consumed*, not just observed.

**Mom's breakfast conversation (4 lines):**
1. **Mom:** 「朝ごはんを食べてください。」 — "Please eat breakfast." *(The first てください about food. The first time anyone in this world has invited anyone to eat. Mom says it casually, as if breakfast has always existed.)*
2. **Rikizo:** 「いただきます！」 — *(First use. The ritual begins.)*
3. **Mom:** 「パンとサラダです。コーヒーもありますよ。」 — "Bread and salad. There's coffee too." *(Mom lists food by name. These words are new. Each one is a small miracle — yesterday, this meal would have been indescribable.)*
4. **Rikizo:** 「ごちそうさまでした！」 — *(First use. The ritual completes.)*

**After breakfast, Mom's regular line:**
> 「今日もどこに行きますか？家に来てくださいね。」 — "Where are you going today? Come home, okay."

The pattern holds. Come home. Every day.

**Design note — いただきます / ごちそうさまでした:** These are not vocabulary items in the usual sense. They are *rituals*. The game treats them as such — they bookend the meal. Every meal in the game from this point forward will begin with いただきます and end with ごちそうさまでした. The player will learn these phrases through pure repetition, the way Japanese children do. No flashcard needed. You say it before you eat. You say it after.

---

### Location

**No new areas.** The map is the same as Day 6 — house, road, town, コンビニ, 駅, river, mountain viewpoint. The change today is not geographical. It's ontological. The same locations now support *consumption*. The コンビニ has food that could theoretically be eaten (if you could buy it). The kitchen is a place where meals happen. Water at the river is the same 水 as water you drink, but one is a landscape feature and the other is a beverage. The distinction is new.

**Interior changes (house):**
- Calendar: 「五月三日」(May 3rd, Saturday).
- Kitchen counter: **Empty.** The cake is gone. See above.
- Kitchen table: Breakfast items visible (パン, サラダ, コーヒー). After the breakfast conversation, they're cleared. The meal is finite.

**What does NOT exist yet:**
- Still cannot buy anything at the コンビニ (買う = Day 8)
- No restaurant building (レストラン is vocab only — the word exists, the place doesn't yet)
- Cannot enter buildings (中/外 = Day 9)

---

### NPCs

#### Mom (さくら) — Kitchen

Mom has the most expanded role today. She made breakfast. She ate the cake. She runs the food economy of this household.

**Breakfast conversation:** See above.

**Post-breakfast conversation (2 lines):**
1. **Mom:** 「大きいパンでしたね。おいしかったですか？」 — "It was a big piece of bread, wasn't it. Was it tasty?" *(大きい — first size adjective in conversation. Mom comments on the size of the bread Rikizo ate.)*
2. **Rikizo:** 「おいしかったです！」 — "It was delicious!" *(Past tense. It has been consumed. The first meal is in the past.)*

**Repeatable line:**
> 「水を飲んでくださいね。」 — "Drink some water, okay." *(Mom's universal advice. 飲んでください — te-form request with the new verb. Mom weaponizes new vocabulary immediately.)*

#### Dad (たろう) — Living room / Near car

**Indoor conversation (3 lines):**
1. **Dad:** 「朝ごはんを食べましたか？」 — "Did you eat breakfast?" *(Dad's first food-related line. He asks about breakfast. He didn't make breakfast. He didn't eat with you. He asks if you ate, in past tense, as if checking a box.)*
2. **Rikizo:** 「食べました！パンを食べました。」 — "I ate! I ate bread."
3. **Dad:** 「いいですね。」 — "Good." *(Minimal. Dad approves of eating. He does not elaborate. His emotional investment is reserved for the car.)*

**Outdoor — car gag continues:**
> Same as Day 6. Touch car → Dad appears. 「だめ！わたしの車です。」 The teleportation gag is now a known pattern. Players test it from increasingly creative positions.

#### やまかわ — Back at the コンビニ (THE ONIGIRI RESOLUTION)

**THE ONIGIRI IS STILL THERE.**

Yamakawa is back at the コンビニ. Leaning against the wall. Same pose. Same onigiri. Day 3. The player has seen this onigiri in every interaction with Yamakawa since Day 5. It's in his sprite. It's in his portrait. It's become part of who Yamakawa IS. But today is different. Today, 食べる exists. And for the first time, Rikizo can *talk about what you do with food.*

**If player talks to Yamakawa (6 lines):**
1. **Yamakawa:** 「お、りきぞ！」 — "Oh, Rikizo!"
2. **Rikizo:** 「やまかわ！そのおにぎり...食べてもいいですか？」 — "Yamakawa! That onigiri... is it okay if I eat it?" *(The player has been staring at this onigiri for three days. Rikizo finally has the verb. He asks. Politely. Hopefully.)*
3. **Yamakawa:** 「...だめですよ。わたしのおにぎりです。」 — "...No way. It's MY onigiri." *(A beat. Yamakawa looks at Rikizo. Looks at the onigiri. Looks back at Rikizo. And then—)*
4. *(Yamakawa eats the onigiri. Right there. In front of Rikizo. The sprite changes mid-conversation — onigiri-in-hand becomes empty-hand. The portrait updates. The onigiri that was a frozen visual constant for three days is consumed in a single animation. It takes maybe two seconds.)*
5. **Yamakawa:** 「おいしかったですよ。」 — "It was delicious." *(Past tense. Already past tense. He just ate it and it's already in the past. He's smiling. He is not sorry.)*
6. **Yamakawa:** 「りきぞも食べましたか？朝ごはん。」 — "Did you eat too, Rikizo? Breakfast." *(He just ate the only available onigiri in front of the person who asked for it, and his follow-up is to ask if THEY'VE eaten. As if concerned for their wellbeing. As if he didn't just do what he did.)*

**After the conversation:** Yamakawa's sprite and portrait are permanently updated — no onigiri. He's just a guy now. The onigiri is gone forever. There is no second onigiri. The コンビニ has onigiri in its window display, but 買う doesn't exist until Day 8. The player watched the only free onigiri in the world get eaten by someone else.

**Repeatable line (post-onigiri):** 「りきぞ、また来ましたか！いいですね。」 ("Rikizo, you came again! Nice.") — Same as before, but now his hands are empty. He never mentions the onigiri again. It happened. It's over.

**If player asks about the river:**
> Yamakawa: 「川ですか？いい川ですよ。また行きます。」 — "The river? Good river. I'll go again." *(He went yesterday. He'll go again. The river is part of his routine now — a routine that is 24 hours old.)*

**Design note — The onigiri resolution:** The punchline is the *cruelty of timing*. For three days, the player has watched Yamakawa hold this onigiri. They couldn't ask about it. They couldn't express interest. They had no verb for what you do with food. Then — the moment 食べる arrives — Rikizo can finally ask. And the answer is no. And then Yamakawa eats it in front of you. The three-day wait doesn't earn you the onigiri. It earns you the vocabulary to *watch someone else eat it*.

This is funnier than the offscreen consumption version because it's *personal*. Yamakawa doesn't eat the onigiri between days where nobody sees it. He eats it right in your face, after you asked for it, and then asks if YOU'VE eaten. The gag has a victim now — and it's Rikizo (and by extension, the player).

The player, who has been watching this onigiri for three days, knowing it couldn't be eaten, knowing there was no verb for consumption — they finally get the verb and immediately discover that having the verb doesn't mean you get the food. Vocabulary unlocks the *ability to ask*, not the *guarantee of receiving*. This is actually a more honest thesis statement than "vocabulary unlocks the world." Sometimes vocabulary just lets you understand that you can't have something.

### The Onigiri Quest — Phase 2 (Social Block)

The quest text fills in today:

> ◻ おにぎりを＿＿ → ◻ おにぎりを食べる

The player has the onigiri fragment in inventory from Day 5. They have the verb. They try to eat it:

> Rikizo: 「おにぎりを食べ—」

**Yamakawa appears.** Like Dad and the car. Sixth sense for his food.

> Yamakawa: 「あ！だめだめ！わたしのおにぎりですよ！」 — "Hey! No no no! That's MY onigiri!"

He takes the fragment back. It leaves inventory. The quest remains incomplete:

> ◻ おにぎりを食べる *(You can read it now. You just can't do it. Yamakawa's だめ is the social equivalent of a missing verb.)*

**If the player tries again (anywhere):**
> 「おにぎりがありません...」 — "I don't have an onigiri..." *(The fragment is gone. Yamakawa reclaimed it. The player needs a NEW onigiri — one that is unambiguously theirs. 買う arrives tomorrow.)*

**Design note — the social block:** The water quest had one gate: vocabulary. The onigiri quest has two: vocabulary (食べる, Day 7) and economy (買う, Day 8). The player can now READ the quest (progress!) but can't COMPLETE it (frustration!). This one-day gap between readability and completability teaches that language alone isn't enough — you also need the means. Yamakawa is the embodiment of this lesson: he has food, you have words, and words without means equal nothing.

---

### The コンビニ Update

The コンビニ window display now has additional context: おにぎり is recognizable as FOOD. Yesterday it was an object with a price tag. Today it's something that could be 食べる'd — if you could buy it. Which you can't. 買う = Day 8.

**Shopkeeper (unchanged):**
> 「いらっしゃいませ！」

Still stuck. Still can't sell. But now the items in the window have a new dimension: they're not just objects with prices. They're food. Food you can see. Food someone just ate *right in front of you* (Yamakawa! He said it was おいしい! While you watched!). Food with a price tag. And no verb for purchasing.

The gap is now crueller. Yesterday, the コンビニ was a window display of abstract objects. Today, the player watched Yamakawa eat an onigiri after being asked to share it, and can see *more onigiri* through the glass, and STILL can't buy one.

**Window items (updated descriptions, same items):**

| Item | Price tag | Notes |
|---|---|---|
| おにぎり | 百五十円 | Now recognized as food. Yamakawa ate one *in front of you* after you asked for it. This one sits behind the glass. Taunting. |
| 水 (みず) | 百円 | Now recognized as something you 飲む. Still can't buy more. |
| ノート | 三百円 | Still just an object. No verb for what you do with a notebook exists yet (書く = write, N5.9). |

---

### The River (Revisit)

The river is accessible but Yamakawa is not there today — he's back at the コンビニ. The river feels different without him. Quieter.

**If player visits the river:**
> 「川です。水がきれいですね。」 — Same as yesterday.

**New interaction — drinking from the river:**
> 「...飲みますか？...飲みません。」 — "...Drink? ...No." *(Rikizo considers drinking river water. He decides against it. 飲みません — the first polite negative of the new verb. The river water is pretty but not potable. Or maybe Rikizo just has standards. He does have bottled water at home.)*

**Design note:** This tiny moment — Rikizo considering and rejecting drinking river water — demonstrates that new verbs don't just create new actions. They create new *decisions*. Before 飲む existed, the river was scenery. Now it's a potential drink source that Rikizo actively rejects. The world has moved from "things exist" to "things can be interacted with, and you can choose not to."

---

### The Water Bottle — Five Days of Patience Rewarded

The water bottle has been in Rikizo's inventory since Day 2. Five days. It was the first item the player ever picked up — the game's way of teaching that inventory exists. And for five days it has sat there: 「水です。」 Water. Just water. A noun in your pocket. And a quest in the log — ◻ 水を＿＿ — with a blank where the verb should be.

Today, 飲む exists. The blank fills in. The quest log updates:

> ◻ 水を＿＿ → ◻ 水を飲む

The sentence completes itself. The player can now *read* the quest for the first time. And they can do it.

**If player opens inventory and taps the water bottle:**
> 「水を飲みます。おいしいです！」 — "I'll drink the water. It's tasty!"

**Quest complete.** ✅ 水を飲む. The game plays its quest-completion fanfare — chime, checkmark, maybe a small celebratory particle effect. The first quest in the game. Completed five days after it was given. The reward is nothing. You drank water. There is no XP, no item, no unlock. The reward is *the act itself*. The verb was the reward. You couldn't drink, and now you can, and you did. Quest complete.

The bottle is not consumed — it's reusable, or infinite, or the game doesn't track liquid levels. The player can drink again whenever they want. Each time: 「水を飲みます。」 It's a comfort action now. The quest is done but the water remains.

**If player drinks the water at the river:**
> 「水を飲みます。...川の水じゃないですよ。」 — "I'll drink water. ...Not the river water though."

Rikizo clarifies. He has standards. He brought his own. The river is for looking. The bottle is for drinking. These are different waters.

**Design note — the quest as vocabulary tutorial:** The 水を＿＿ quest is the game's thesis statement compressed into one interaction. On Day 2, the player picks up water and receives a quest with a hole in it. They can't read it. They can't do it. Not because of a locked door or a missing key or a level requirement — because the *word* doesn't exist. The sentence itself is incomplete. For five days the quest sits there with its blank, a constant visible reminder that something is missing from the language. Then N5.7 teaches 飲む. The blank fills in. 水を飲む. The player reads the quest for the first time. They drink the water. Quest complete. The moment teaches, retroactively, what kind of game this is: **vocabulary completes sentences, and sentences unlock the world.** Every future impossible-seeming moment in the game — every door that won't open, every conversation that dead-ends, every object that just sits there — the player now knows: *a word is coming*.

This is also a deliberate design pattern for the whole game: items and objects are introduced before the verbs that activate them. The water bottle taught inventory on Day 2. The cake taught possession on Day 4. The コンビニ taught commerce-without-purchasing on Day 5. In each case, the object exists first, and the verb that gives it purpose arrives later. The water bottle has the longest gap (5 days) and the smallest payoff (you drink water, nothing happens). But that smallness IS the joke — and the lesson. The game's first quest, its most dramatic wait, its biggest fanfare... is for drinking a bottle of water.

---

### The レストラン Problem

レストラン is now vocabulary. The word exists. There is no restaurant building in the world. This is the inverse of the コンビニ problem (building exists, purchasing doesn't). Here the *concept* exists but the *place* doesn't.

**If player walks through town:**
No restaurant is visible. The word is in Rikizo's vocabulary — he could say レストラン — but there is nothing in the world corresponding to it. The restaurant is a Platonic ideal: a word without a referent.

**Design note:** Not every vocab item needs an immediate world anchor. レストラン exists as knowledge — Rikizo knows what a restaurant is. One will appear eventually (likely when the town expands in later lessons with more building interiors). For now, it sits in vocabulary like a promise. The player might look for it and find nothing. That absence is intentional.

---

### Size — 大きい and 小さい

The size adjectives transform description. Until today, things just *were*. Now they can be big or small. Mountains are 大きい. The river is not 小さい but also not 大きい — it's medium? There is no word for medium (中 as a size concept isn't available until Day 9). Binary size: things are either big or small. The continuum between them doesn't exist.

**Objects that gain size descriptions:**

| Object | Description | Notes |
|---|---|---|
| Mountains | 「大きい山ですね。」 — "Big mountains." | Obviously. They're mountains. |
| River | 「小さい川ですね。」 — "Small river." | Compared to what? To the mountains? To an imagined bigger river? Rikizo has no frame of reference. He just knows this river is 小さい. |
| Dad's car | 「大きい車ですね。」 — "Big car." | Is it? It's a car. Dad: 「大きいですよ！いい車です！」("It IS big! Good car!") Dad takes the compliment. |
| おにぎり (in window) | 「小さいおにぎりですね。」 — "Small onigiri." | Store onigiri. Standard size. But to Rikizo, who has never eaten one, it's small. |
| Tree-san | 「大きい木-さんですね。」 — "Big Tree-san." | Rikizo has been talking to this tree since Day 2. Now he can describe it. It's big. He reports this to the tree, who remains a tree. |

---

### すき — The Beginning of Preferences

すき (like) arrives as an early-use word. It's written in hiragana (好き kanji = N4.4). But it fundamentally changes how characters can relate to the world. Before today, people could say things were いい (good) or きれい (pretty) or だめ (no good). These are objective observations. すき is *subjective*. It's personal.

**Mom uses it first:**
> 「りきぞはパンがすきですか？」 — "Do you like bread, Rikizo?"

This is the first time anyone has asked Rikizo about his *preferences*. Not what things are. What he *likes*. The answer doesn't change the game state. But the question itself is revolutionary — the world now cares about individual taste.

**Yamakawa uses it about the river:**
> If asked about the river again: 「川がすきですよ。いい川です。」 — "I like the river. Good river." *(Yamakawa upgrades from いい to すき. Yesterday the river was "good." Today he "likes" it. Feelings have entered the world.)*

---

### NPCs — Full Interactions

#### Tree-san

**Daily greeting (updated):**
> 「木-さん、大きいですね！」 — "Tree-san, you're big!" *(Rikizo can finally describe Tree-san's defining physical characteristic. He says this with genuine enthusiasm, as if discovering something new about a friend he's talked to every day.)*

**If `flag:befriended_tree_day2` is set:**
> 「木-さんは大すきです。」 — "I love Tree-san." *(大すき. The strongest positive feeling available. Rikizo's first expression of love in the entire game is directed at a tree.)*

#### すずき先生 — Email Reply

**If the player opens the phone email:**
> A reply option appears for すずき先生's Day 6 email (「来週からです。来てくださいね。」).

**Rikizo's reply (auto-generated, player triggers it):**
> 「はい、行きます。」 — "Yes, I'll go."

Rikizo agrees to go to the thing that starts next week. The thing that has no name. He doesn't ask what it is or where it is. He says yes. He'll go.

**すずき先生's reply arrives later in the day:**
> 「いいですね！来てくださいね。」 — "Great! Please come."

来てください — the same construction Mom uses. Come. Come home. Come to the unnamed thing. Everyone asks Rikizo to come places. He always says yes.

---

### Phone Update

**Phone UI (Day 7):**

| Feature | Status |
|---|---|
| Clock | Active |
| Wallet | Active |
| Messages | 1 conversation (やまかわ) |
| Email | 2 emails (すずき先生 thread — original + reply) |
| Contacts | やまかわ, すずき先生 |
| Map | Still empty |
| Apps | Still empty |

---

### Interactive Objects

**Updated interactions (food-aware):**

| Object | Location | Interaction |
|---|---|---|
| Kitchen counter | Kitchen | **EMPTY.** 「ケーキは...？」 See cake resolution above. |
| Kitchen table (breakfast) | Kitchen | Pre-meal: visible food. Post-meal: cleared. |
| Fridge | Kitchen | Still can't open. 「...」 No 中. But now the player KNOWS there's food in this world. The fridge gains new significance: it contains food. Probably. You can't check. |
| 水 (home) | Kitchen | 「水を飲みます。」("I'll drink water.") New! Rikizo can drink his own water at the kitchen sink/counter. |
| 水 (inventory) | Anywhere | **THE WATER BOTTLE WORKS.** 「水を飲みます。おいしいです！」("I'll drink the water. Tasty!") The bottle Rikizo picked up on Day 2 — five days ago — finally has a purpose. The first *player-initiated* consumption in the game. Tap the water bottle in inventory → Rikizo drinks. The bottle is not consumed (it's reusable, or infinite — the game doesn't care about realism here). This is the payoff for carrying a useless item for five days. |
| River water | River bank | 「...飲みません。」("Won't drink.") River water: rejected. |
| コンビニ window | Town | Updated awareness: items are now recognizable as food/drink. Still can't buy. |
| Dad's car | Front of house | Unchanged. Touch → Dad appears. 「だめ！」 |

**Persistent objects (updates):**

| Object | Status |
|---|---|
| Window (house) | Mountains visible (Day 6+). |
| Tree-san | 「大きいですね！」 — Rikizo can now describe the tree. If befriended: 「大すきです。」 |
| Yamakawa | Back at the コンビニ. Still holding onigiri — until you talk to him. Then: no onigiri. He ate it. In front of you. After you asked for it. He is now just a man. |
| コンビニ | Same window display. Same items. Food items now have existential weight — you know they can be eaten. You just can't buy them. |
| 駅 | Same. Empty. No trains. |
| River | Same. Yamakawa not present today. Rikizo can now consider (and reject) drinking from it. |
| Mom's cake | **GONE.** Resolved. Mom ate it / Tree-san ate it. The three-day saga ends. |
| Dad's gold | Persists. Dad still says だめ. But his passion has shifted to the car. Gold is the old love. |

---

### Story Beats

| Moment | What Happens | What Rikizo Thinks | What the Player Should Feel |
|---|---|---|---|
| The empty counter | The cake is gone. Three days of 「お母さんのケーキです。」 — resolved overnight. | 「ケーキは...？」 | Satisfaction? Loss? The cake was a fixture. It's gone. The first thing that ever left. |
| Mom ate the cake | 「お母さんが食べました。」 / 「木-さんが食べました。」 | Accepts either explanation | The tree version is comedy gold. Mom blaming an inanimate object she watched her son befriend. |
| First breakfast | いただきます. パンとサラダ. ごちそうさまでした. | Happy. Fed. | The ritual of eating is established. This will happen every day from now on. |
| 「食べてもいいですか？」 | Rikizo finally asks about the onigiri. Three days of waiting. The verb exists. He asks. | Hopeful | The player has been WAITING for this. Three days of watching an uneaten onigiri. Finally, FINALLY you can ask — |
| 「だめですよ。」→ *eats it* | Yamakawa says no. Then eats it. Right there. In front of you. Sprite changes mid-conversation. | Rikizo watches | — and the answer is no. And then he eats it while you watch. Three days of patience. Zero onigiri. The cruelest punchline in the game. |
| 「おいしかったですよ。」 | Yamakawa reports the onigiri was delicious. He just ate it. He is not sorry. Then asks if YOU'VE eaten. | Rikizo is speechless | He ate your onigiri (it was never your onigiri) and his concern is whether you had breakfast. The man is either oblivious or a sociopath. |
| River water — no | Rikizo considers and rejects drinking river water. | 「...飲みません。」 | New verbs create new choices. Including the choice NOT to do something. |
| The water bottle / quest complete | ◻ 水を＿＿ → ◻ 水を飲む → ✅ 水を飲む. The blank fills in. The sentence completes. You drink. Chime. Checkmark. Five days. | Happy. Hydrated. Accomplished? | The game's thesis statement. You had water. You had an incomplete sentence. You couldn't read it or do it. Five days later, the word fills in, and you drink your water. The reward is nothing. The reward is everything. |
| Size descriptions | Everything gains dimensions. Mountains are big. The river is small. Tree-san is big. | Descriptive, enthusiastic | The world has adjectives now. Things aren't just here — they're big or small. (Nothing is medium. 中 = Day 9.) |
| すき — preferences arrive | Mom asks if Rikizo likes bread. Yamakawa likes the river. | The world cares about opinion | Before today: objective descriptions. Today: subjective feelings. This is a bigger shift than it appears. |
| Tree-san love confession | 「木-さんは大すきです。」 — if befriended | Pure, genuine | Rikizo's first love is a tree. |
| The fridge (updated) | Still can't open. But now the player knows food exists. The fridge's contents are more tantalizing than ever. | 「...」 | You KNOW there's food in there. You know eating is possible. You still can't open the fridge. 中 = Day 9. TWO MORE DAYS. |
| Email to Suzuki | Rikizo agrees to go to the unnamed thing next week. | 「はい、行きます。」 | He didn't ask what it is. He didn't ask where. He just said yes. |

---

### Running Gags Updated

1. **The Toilet Door** — Continues. Dad now has three territorial objects: car > gold > toilet.
2. **Dad's Gold** — Continues. Slowly being eclipsed by the car in Dad's emotional hierarchy.
3. **Dad's Car** — Continues. Touch → teleport → だめ.
4. **Tree-san** — **UPGRADED.** Rikizo can now describe the tree (大きい) and declare love (大すき). The tree relationship has grown from greeting to genuine affection. The tree does not reciprocate. The tree is a tree.
5. **The Fridge** — **INTENSIFIED.** Food exists now. Eating is real. The fridge — which definitely contains food — remains unopenable. Every day it becomes slightly more maddening. The fridge is Schrödinger's pantry: the food inside is simultaneously there and inaccessible. Day 9 (中/外) will resolve this. Two more days.
6. **Family Possessions** — Cake = RESOLVED (eaten). Gold = continues. Car = continues (dominant).
7. **The Water Bottle / First Quest** — **RESOLVED.** ◻ 水を＿＿ → ✅ 水を飲む. The game's first quest, given on Day 2 as an incomplete sentence. The blank sits in the quest log for five days. On Day 7, the word fills in, the sentence completes, and you drink water. Full fanfare for... drinking water. The game's thesis statement: vocabulary completes sentences, sentences unlock the world. The bottle stays in inventory as a reusable comfort action.
8. **The Empty Phone** — Email thread growing. Two contacts. Still no map, no apps. The phone is becoming useful in tiny increments.
9. **Yamakawa's Eternal Onigiri** — **RESOLVED.** Rikizo asks. Yamakawa says no. Yamakawa eats it in front of him. おいしかったですよ. The three-day saga ends with Rikizo watching someone else eat the thing he's been staring at since Day 5. Yamakawa has entered the post-onigiri era. He is not sorry.
10. **The Onigiri Quest** — **PHASE 2: SOCIAL BLOCK.** ◻ おにぎりを＿＿ → ◻ おにぎりを食べる. The text fills in (食べる exists!) but Yamakawa reclaims the fragment: 「だめ！わたしのおにぎり！」 Quest is readable but incomplete. Player needs to BUY their own onigiri. 買う = Day 8. One more day.
11. **Mom's "Come Home"** — 「家に来てくださいね。」 Day 7. Every day. The pattern is now well-established enough that the player should notice it's not just flavor text — it's a persistent, unvarying request.
11. **Mom's Eating Authority** — **NEW.** Mom ate the cake overnight. She ate the ENTIRE thing. She told you it was hers. She wasn't lying. But the speed and totality of her consumption — the moment eating became possible — establishes Mom as the supreme food authority. She made breakfast. She controls the kitchen. She decides what gets eaten and when. This dynamic will persist.
12. **いただきます / ごちそうさまでした** — **NEW RITUAL.** From today onward, every meal begins and ends with these phrases. They are not optional. They are not flavor text. They are how eating works in this world. The player will learn them through repetition, like learning to say "please" and "thank you."

---

### State Tracking (Day 7)

**New flags:**
- `ate_breakfast_day7` — First meal in the game. いただきます → food → ごちそうさまでした. The eating ritual is established.
- `cake_resolved` — The cake is gone. Tracks which version the player sees (Mom ate it vs Tree-san ate it).
- `onigiri_resolved` — Yamakawa ate the onigiri in front of Rikizo after refusing to share. He is now onigiri-free. The eternal has become personal.
- `replied_to_suzuki` — Rikizo agreed to go to the unnamed thing next week.
- `described_tree_big` — Rikizo told Tree-san it's big. (First size adjective used on a befriended object.)
- `tree_love_confession` — (If befriended) Rikizo said 大すき to a tree. First love declaration in the game.

**Economy:**
- Wallet: Still 二千円 (2,000 yen). Cannot spend money. 買う = Day 8.

---

### Art Assets Required (Day 7)

| Asset | Type | Style | Priority | Notes |
|---|---|---|---|---|
| Yamakawa sprite (no onigiri) | Overworld sprite | A (Pixel) | High | Same design as Day 5 sprite but empty-handed. Swapped in mid-conversation on Day 7 when he eats the onigiri. |
| Yamakawa portrait (no onigiri) | Conversation portrait | B (MP100) | High | Same character, no onigiri. Swapped mid-conversation Day 7. At least 2 expressions. |
| Yamakawa eating animation | Conversation portrait / sprite | A+B | Medium | Brief animation of Yamakawa eating the onigiri. Can be as simple as 2–3 frames: onigiri to mouth → bite → empty hand + satisfied expression. Plays mid-conversation on Day 7. |
| Kitchen — breakfast scene | Background variant | B (MP100) | Medium | Kitchen with visible breakfast items on table (パン, サラダ, コーヒー). Variant of existing kitchen BG. |
| Kitchen — empty counter | Background variant | B (MP100) | Medium | Kitchen without the cake on the counter. Variant of Day 4–6 kitchen. |
| River — solo version | Background variant | B (MP100) | Low | River bank without Yamakawa. Day 6 has Yamakawa there; Day 7 river is empty/peaceful. |
| レストラン | — | — | NOT YET | The building doesn't exist in the world yet. No asset needed. |

---

### Open Questions for Day 7

1. **Does Mom offer more food throughout the day?** Recommendation: No. One meal per day for now. Breakfast is established as the daily meal event. Lunch and dinner will arrive when daily time progression becomes more detailed (likely N5.10+ when time-of-day vocab expands). For Day 7, breakfast is the one meal, and it's enough — the point is that eating exists, not that it's complex.

2. **Can Rikizo eat an おにぎり?** Not yet. The only free onigiri was Yamakawa's — and he ate it in front of you after saying no. The コンビニ has onigiri behind the window, but 買う doesn't exist until Day 8. The first purchased おにぎり will be the first player-triggered 食べる event. Yamakawa's onigiri was the first 食べる event in the game, but the player didn't get to do it — they just watched.

3. **River drinking — should it work?** Currently Rikizo rejects it (飲みません). Could there be a secret "drink river water" path? Recommendation: No. River water = no. Tap water = no (where's the tap? Inside, where 中 doesn't exist). Bottled water = yes (Mom's kitchen). This is fine. Drinking options will expand with the コンビニ on Day 8.

4. **Yamakawa's location pattern:** Day 5 = コンビニ. Day 6 = river. Day 7 = back at コンビニ. Should he alternate, or settle? Recommendation: Yamakawa settles back at the コンビニ as his default spot. The Day 6 river visit was a special event — he explored the new geography. Now he's back to his routine. Future days may move him again when new locations appear, but the コンビニ wall is his home base. He has an anchor. He always comes back.

---

## Day 8 — "Commerce" (unlocked by N5.8: Shopping & Adjectives)

### Lesson Kanji & Key Vocab Available

**New kanji (6):** 古、新、買、長、高、安

**Cumulative kanji (58):** All N5.1–N5.7 + above.

**New vocab highlights:**
- Action: 買う (かう, to buy) — THE VERB. Three days of window-shopping end today.
- Adjectives: 新しい (あたらしい, new), 古い (ふるい, old), 高い (たかい, expensive/tall), 安い (やすい, cheap), 長い (ながい, long)
- Feelings: ほしい (wanted/desired), すごい (amazing/awesome)
- Time: もう (already), まだ (still/not yet), あまり (not very — with negatives)
- Places: デパート (department store)
- People: 駅長 (えきちょう, station master)
- Things: プレゼント (present/gift)
- Food: おいしい (delicious — formally introduced; used by Yamakawa on Day 7)

**Grammar:** G8 unlocks after this lesson — ている (progressive), たいです (desire), ましょう (let's). These forms will be available from Day 9 onward. For Day 8 content, the available grammar is the same as Days 5–7: full polite verb paradigm, te-form, plain_past. G7 reinforcement continues.

**New this day:** COMMERCE EXISTS. 買う enters the world and transforms every shopping venue from a display case into a functional store. The コンビニ that has been a window display for three days becomes a place where you exchange money for goods. The vending machine at the station turns on. And a new location — the デパート — appears. Rikizo can finally spend the 2,000 yen he's been carrying since Day 1. Simultaneously, adjectives for evaluation arrive: things aren't just objects anymore. They're 高い or 安い, 新しい or 古い. The world gains *judgment*.

---

### The Day Money Learned to Move

Day 8 is the economic awakening. For three days, Rikizo has stood at shop windows with money in his pocket and no way to spend it. The shopkeeper has said いらっしゃいませ to an audience that could only stare. Items have had price tags that functioned as decoration — numbers attached to objects with no mechanism for exchange.

Today, 買う exists. And with it, the entire concept of commerce materializes. Money moves. Items change hands. Prices become real — not because the numbers changed, but because the *act of purchasing* now exists to make them meaningful.

But Day 8 isn't just about buying. It's about *evaluating*. Five adjectives arrive simultaneously: 高い, 安い, 新しい, 古い, 長い. For the first time, Rikizo can look at something and have an opinion beyond 「いいです」 or 「きれいです」. The world gains texture. Things have qualities. And qualities have prices.

---

### Morning — The Wallet Wakes Up

Rikizo wakes up. The calendar reads 「五月四日」(May 4th, Sunday).

Breakfast continues — the eating ritual from Day 7 is now established. Mom makes food. いただきます. Eat. ごちそうさまでした. This is now routine. (The specific food can vary: パン, or rice, or whatever Mom prepares. The ritual is the constant.)

**Mom's new line after breakfast:**
> 「りきぞ、買い物に行きますか？」 — "Rikizo, are you going shopping?"

買い物 (かいもの, shopping). Mom says the word casually, as if shopping has always been a thing people do. As if there's always been somewhere to shop. As if the verb that makes shopping possible didn't materialize this morning.

**If player says yes:**
> Mom: 「お金はありますか？」 — "Do you have money?"

The 二千円 (2,000 yen) has been in Rikizo's wallet since the beginning. Rikizo nods. Mom nods. The transaction tutorial has begun, and it started in the kitchen.

> Mom: 「高いものは買わないでくださいね。」 — "Don't buy expensive things, okay?" *(買わないでください — negative te-form request. Mom's first shopping instruction. She uses 高い, one of today's new adjectives, as if the concept of "expensive" has always existed in this household.)*

**Then, casually:**
> Mom: 「あ、りきぞ。プレゼントを買ってきてください。お父さんのプレゼントです。」 — "Oh, Rikizo. Please go buy a present. It's a present for Dad."

**Quest log update:** ◻ お母さんの買い物: プレゼントを買う

The third quest. Unlike the first two (incomplete sentences waiting for verbs), this one is readable from the start — you know what to do. The challenge is *where*. Mom said プレゼント. The コンビニ doesn't sell プレゼント. The コンビニ sells おにぎり, 水, and ノート. Gift boxes are a デパート item. And the デパート... you can't go inside. 中 doesn't exist until Day 9.

**If the player checks the コンビニ:**
> No プレゼント. The shopkeeper doesn't sell gifts. The コンビニ is functional but limited.

**If the player approaches the デパート:**
> 「プレゼント...ここにありますか？」 — "A present... is it here?" *(Rikizo can see gift-looking boxes through the デパート windows. But the doors don't open. 中 doesn't exist. The present is behind glass in a store he can't enter.)*

**If the player returns to Mom empty-handed:**
> Mom: 「だいじょうぶですよ。明日でもいいです。」 — "It's alright. Tomorrow is fine too." *(Mom is patient. She knows somehow that the デパート will be accessible tomorrow. Or she's just being a kind parent. Either way, the quest persists.)*

**Design note — the shopping quest:** This is the first quest that is fully readable from the moment it's given but *physically impossible* to complete on the day you receive it. The water quest was unreadable (missing verb). The onigiri quest was unreadable then socially blocked. Mom's quest is perfectly clear — buy a present — but the only store that sells presents can't be entered. The obstacle is spatial, not linguistic. The solution arrives tomorrow with 中 (Day 9). The quest teaches: sometimes you understand exactly what to do and still can't do it — because the world isn't ready yet.

---

### Dad — Unmoved by Commerce

Dad is in his chair. The world has gained an entire economic system overnight. Dad does not care.

**If player talks to Dad:**
> 「...車はいいですよ。新しい車です。」 — "...The car is good. It's a new car."

Dad has adopted 新しい instantly. His car is 新しい. It has always been 新しい. The adjective exists to describe his car and nothing else. He does not mention shopping, money, or the existence of stores. These things are beneath the car.

**If player touches the car:**
> Same as always. Dad teleports. 「だめ！わたしの車です。」 But now add: 「新しいです！」 — "It's NEW!" *(The adjective gives Dad a new dimension of protectiveness. It's not just his car. It's his NEW car. Touch it and you'll scratch the newness off.)*

**Design note:** Dad's instant adoption of 新しい for his car — which appeared on Day 6 and is therefore two days old — is another いつも-tier reality edit. The car is new because 新しい exists. Not new-as-in-recently-acquired. New-as-in-the-adjective-new-applies-to-it. In Dad's reality, the car has always been new. The adjective doesn't describe a temporal property. It describes an inherent quality.

---

### The コンビニ — OPEN FOR BUSINESS

**The three-day embargo ends.**

When Rikizo arrives at the コンビニ, everything looks the same. Yamakawa is leaning against the wall (empty-handed now, post-onigiri). The shopkeeper is behind the window. The items are on display with their price tags.

But today, when Rikizo approaches the window:

> Shopkeeper: 「いらっしゃいませ！何がほしいですか？」 — "Welcome! What do you want?"

何がほしいですか. *What do you want.* For three days, the shopkeeper has only been able to greet. Today she can ask. And Rikizo can answer.

**THE FIRST PURCHASE IN THE GAME.**

The コンビニ becomes an interactive shop. When Rikizo approaches, a purchase UI appears: the window display items are now selectable. Each item shows its name and price.

| Item | Price | New description |
|---|---|---|
| おにぎり | 百五十円 (150¥) | 「おにぎりです。安いですね。」 — "An onigiri. It's cheap." |
| 水 (みず) | 百円 (100¥) | 「水です。もうあります。」 — "Water. I already have some." *(Rikizo has the bottle from Day 2.)* |
| ノート | 三百円 (300¥) | 「ノートです。新しいです。」 — "A notebook. It's new." |

**When the player selects an item:**
1. Shopkeeper: 「はい、どうぞ。」 — "Here you go."
2. Money deducts from wallet. Sound effect: coin clink.
3. Item enters inventory.
4. Shopkeeper: 「ありがとうございます！また来てくださいね。」 — "Thank you! Please come again."

**If player buys the おにぎり (expected first purchase):**
> 「おにぎりを買いました！」 — "I bought an onigiri!"

This is the first player-initiated 食べる moment waiting to happen. The player has bought food. They can eat it from inventory:

> 「おにぎりを食べます。いただきます！...おいしいです！」 — "I'll eat the onigiri. Itadakimasu! ...It's delicious!"

**Quest complete.** ✅ おにぎりを食べる. The game's second quest, resolved. Three days and two vocabulary unlocks: 食べる let you read it, 買う let you do it. The fanfare plays. The quest that Yamakawa blocked with 「だめ！」 is conquered not by arguing with him, but by going around him. You didn't need HIS onigiri. You needed YOUR OWN.

> 📋 Quest Log
> ✅ 水を飲む (Day 2 → Day 7)
> ✅ おにぎりを食べる (Day 5 → Day 8)

Two quests. Both complete. Both followed the same pattern: incomplete sentence → verb fills in → complete. The onigiri quest added a social obstacle that the water quest didn't have. The next quest will add something new again.

The player has now completed the full economic cycle for the first time: see item → want item → buy item → consume item. This cycle was impossible three days ago. Today it takes four taps.

**If player tries to buy everything:**
> The wallet updates after each purchase. 二千円 is a lot for コンビニ prices. The player can buy multiples. There's no purchase limit — but the wallet will eventually empty. The game does not replenish money automatically. (How Rikizo earns money is a future system. For now, the 2,000 yen is finite.)

**If player checks wallet after shopping:**
> The wallet shows the remaining balance. This is the first time the number has changed from 二千円. Money is real now.

**Design note — the first purchase:** The コンビニ is deliberately the *first* place the player can shop. Not the デパート (which is bigger and more intimidating). Not a vending machine (which is impersonal). The コンビニ — a small, familiar window where you've been standing for three days — is where commerce begins. The shopkeeper who has greeted you every day finally gets to do her job. The items you've memorized through the glass finally cross the counter. The first purchase should feel like a relief, not a tutorial.

---

### The おにぎり Moment

The player's first purchased おにぎり deserves special attention. This is the food that Yamakawa ate in front of Rikizo yesterday. The one Rikizo asked for and was denied. And now — through the miraculous arrival of 買う — Rikizo can get his own.

**If Rikizo eats the purchased おにぎり near Yamakawa:**
> Yamakawa: 「お、おにぎりですか！いいですね。」 — "Oh, an onigiri! Nice." *(No acknowledgment. No guilt. No awareness that yesterday he ate one in front of Rikizo after refusing to share. Yamakawa lives in the eternal present.)*

**If Rikizo eats it anywhere else:**
> 「おいしいです！やまかわのおにぎりと...おなじですか？」 — "Delicious! Same as Yamakawa's...?" *(Rikizo wonders if it tastes the same as the one he never got to try. He'll never know. Yamakawa said おいしかった. Rikizo says おいしい. They have the same word but different experiences.)*

---

### The 駅 — The Station Master Appears

The station has been empty and haunting since Day 5. Tracks to nowhere. A departure board with no departures. A bench. Silence.

Today, the station has a person.

**The 駅長 (station master)** stands on the platform. He's in uniform. He's official. He's the first NPC in the game who has a *title* instead of just a name. He is not やまかわ or Mom or Dad. He is 駅長 — a function, a role, a piece of institutional infrastructure given human form.

**First interaction (4 lines):**
1. **駅長:** 「いらっしゃいませ。」 — "Welcome." *(Same greeting as the shopkeeper. The station is a service venue. The station master is staff. But his いらっしゃいませ is quieter, more formal. He's welcoming you to a station that goes nowhere.)*
2. **Rikizo:** 「駅長ですか？」 — "Are you the station master?"
3. **駅長:** 「はい。この駅は古い駅ですよ。」 — "Yes. This is an old station." *(古い. The station is OLD. The station that materialized on Day 5 — four days ago — is, in the station master's reality, old. It has history. It has age. It has been here long enough to be 古い. He says this with pride, the way someone says "this is a historic building." The adjective gives the station a past it does not have.)*
4. **駅長:** 「長い道ですから。」 — "It's a long road, you see." *(長い. The road — which the player has walked end to end in seconds — is long. The station master's geography doesn't match the player's geography. His road is longer. His station is older. His world has more history. NPCs experience a denser, richer version of the same terrain.)*

**If player examines the departure board:**
> Still empty. 「何もないです。」 But now the station master adds: 「まだです。」 — "Not yet." *(まだ. Not yet. Not "nothing" — "not yet." This is the first time an NPC has acknowledged that something WILL come. The departure board isn't empty forever. It's empty for now. Trains are coming. When? まだです. Not yet.)*

**If player examines the vending machine:**
> It works now. 買う exists. The vending machine has two items:

| Item | Price |
|---|---|
| 水 | 百円 (100¥) |
| ジュース | 百二十円 (120¥) |

Vending machine purchases are simpler than the コンビニ — no dialogue, just select → coin sound → item dispensed. A small functional moment. The machine that was dead since Day 5 hums to life.

**If player sits on the bench:**
> 「いい駅ですね。」 — Same as before. But if the station master is nearby: 「古い駅ですが、いい駅です。」 — "It's an old station, but it's a good station." *(Rikizo has absorbed the station master's assessment. The station is old now, in Rikizo's mind too. The adjective is contagious.)*

**Repeatable line (station master):**
> 「まだですよ。」 — "Not yet." *(He says this about everything. The train? まだ. The schedule? まだ. Where does the track go? まだ. He is a man whose entire professional existence is organized around something that hasn't happened yet. He is patient. He has been patient, apparently, for a very long time. The station is old, after all.)*

**Design note — the station master's "not yet":** まだ is one of the most important words introduced this lesson, and the station master is its avatar. Everything about the station is まだ — not yet. The train isn't here *yet*. The departure board is empty *for now*. The tracks go somewhere *eventually*. In a game where new things materialize with each lesson, the station master is the first NPC who explicitly acknowledges that the world is incomplete and that completion is coming. Every other NPC treats the current state as eternal (いつも). The station master treats it as temporary (まだ). He is either the most honest character in the game or the most deluded — and the player can't tell which.

---

### The デパート — A Building Too Big for Its Vocabulary

A new building appears in the town: the デパート (department store). It's visibly larger than the コンビニ. Multiple floors implied by the exterior. Glass windows. A more urban feel — this is a real store, not a window counter.

**But there's a problem.** The デパート exists as a building, but Rikizo cannot go inside. 中 (inside) doesn't exist until Day 9. The department store is the コンビニ situation reversed: instead of having items visible but unpurchasable, the デパート has a door but no concept of entering.

**If player approaches the デパート:**
> 「デパートです。大きいですね！」 — "A department store. It's big!" *(大きい from Day 7. The size adjective finds its most appropriate target yet.)*

**If player tries to enter:**
> 「...」 *(Nothing happens. The door exists. Rikizo stands in front of it. There is no interaction prompt. He cannot go in. He doesn't try. The concept of going inside a building doesn't exist. He stands outside a department store the way he stands outside the world — looking at something that should be accessible but isn't.)*

**If player examines the windows:**
> 「...高いですか？」 — "...Expensive?" *(Rikizo can see items through the windows. They look nicer than the コンビニ's stock. He suspects 高い. He's right — デパート items will be more expensive. But he can't confirm because he can't go inside.)*

**Design note — the デパート as vocabulary teaser:** The デパート serves the same function on Day 8 that the コンビニ served on Day 5: it introduces a location that vocabulary hasn't fully enabled yet. The player can shop at the コンビニ (買う works there) but not at the デパート (中 is needed). This creates the next "vocabulary gate" — the player knows that going inside is the missing piece, and they may even guess that a word for "inside" or "enter" is coming. The デパート is bigger and has better stuff. The player wants in. The word arrives tomorrow.

---

### Yamakawa — Shopping Companion

Yamakawa is at the コンビニ. Empty-handed. Post-onigiri era. But today he has opinions.

**If player talks to Yamakawa (4 lines):**
1. **Yamakawa:** 「りきぞ！買い物ですか？」 — "Rikizo! Shopping?"
2. **Rikizo:** 「はい！」 — "Yes!"
3. **Yamakawa:** 「いいですね。おにぎりは安いですよ。」 — "Nice. The onigiri is cheap." *(安い. He recommends the onigiri. The item he refused to share yesterday. He recommends it to the person he refused to share it with. He sees no contradiction. He is helping.)*
4. **Yamakawa:** 「ジュースもいいですよ。」 — "Juice is good too." *(A suggestion. The first NPC shopping recommendation in the game.)*

**If player buys an onigiri and shows Yamakawa (eats it near him):**
> Yamakawa: 「お、おにぎりですか！いいですね。」 *(See above. Zero memory. Zero guilt. Yamakawa is sunshine and amnesia.)*

**If player asks about the デパート:**
> Yamakawa: 「デパートですか？大きいですね。」 — "The department store? It's big." *(Same assessment as Rikizo. Nobody can go inside. Nobody mentions this as a problem. Going inside is not a concept.)*

**Repeatable line:**
> 「りきぞ、また来ましたか！コンビニはいいですよ。」 — "Rikizo, you came again! The convenience store is great." *(His loyalty to the コンビニ is unwavering. There is a department store now. Yamakawa does not care. He has his wall. He has his spot. He does not need more.)*

---

### The Adjective Revolution (World Exploration)

Five new adjectives change how Rikizo describes the world. Every existing object can now be evaluated:

**At home:**
- Tree-san: 「大きい木ですね。古いですか？...古い木です。」 — "Big tree. Old? ...An old tree." *(Tree-san gains a second adjective. First it was 大きい. Now it's 古い. The tree has history — or at least, the adjective that implies history.)*
- Dad's car: 「新しい車です。」 — "A new car." *(Dad agrees vigorously.)*
- The fridge: 「古いですか？新しいですか？...わかりません。」 — "Old? New? ...I don't know." *(The fridge resists classification. It has no age because it has no inside. It's just a door.)*

**In town:**
- The road: 「長い道ですね。」 — "A long road." *(長い finds its first outdoor use.)*
- The river: 「長い川ですね。」 — "A long river." *(Same adjective, different noun. The world is becoming measurable.)*
- The mountains: 「高い山ですね！すごいです！」 — "Tall mountains! Amazing!" *(高い = tall AND expensive. Here it's tall. すごい finds its natural habitat — looking at something impressive. The mountains have been scenery since Day 6. Today they're すごい.)*

**At the station:**
- The tracks: 「長い...ですね。」 — "Long..." *(Trailing off. The tracks are long. They go into the void. Or into the distance. Or both.)*
- The vending machine: 「安いです。」 — "It's cheap." *(100¥ water. Rikizo notices prices now.)*

**Design note — adjective distribution:** The five adjectives aren't random. They form natural pairs: 新しい/古い (new/old), 高い/安い (expensive/cheap or tall/short), and 長い on its own (long — 短い "short" comes later). The pairs create *comparison*, even before the grammar for comparison (より, N4.5) exists. The player evaluates objects by binary: is this 高い or 安い? 新しい or 古い? The world becomes a place with qualities, not just labels.

---

### The Phone — Yamakawa's Shopping Tips

**Message from やまかわ:**
> 「コンビニで買い物！おにぎりは安いです。おいしいですよ！」 — "Shopping at the convenience store! The onigiri is cheap. It's delicious!"

Yamakawa is texting about onigiri again. He has moved on. He has fully moved on. He is recommending the food he ate in front of you to you, via text, as if sharing a life hack. He is impossible.

**If player responds:**
> 「もう買いました。」 — "Already bought one."

もう. Already. The first time Rikizo uses this adverb in conversation. It carries the weight of three days of waiting.

**Email from すずき先生:**
> 「新しい本がありますよ。来週、見てくださいね。」 — "There are new books. Please look at them next week."

The unnamed event next week is slowly gaining detail. First it was just a place to go. Now there are new books there. This is either a school, a bookstore, or a library. すずき先生 is building anticipation through vocabulary drips.

---

### Economy Update

**Starting balance:** 二千円 (2,000 yen)

The wallet is finally active. Purchases deduct from the total. There is no income source yet — 仕事 (work/job) vocabulary doesn't appear until N4.

**Price reference (all purchasable items):**

| Location | Item | Price |
|---|---|---|
| コンビニ | おにぎり | 150¥ |
| コンビニ | 水 | 100¥ |
| コンビニ | ノート | 300¥ |
| 駅 vending | 水 | 100¥ |
| 駅 vending | ジュース | 120¥ |

**If the player spends everything:** The wallet shows ゼロ (zero) or 〇円. Rikizo can no longer buy anything. This creates a mild soft-lock of the economy — no income means no recovery. The game should acknowledge this:

> 「お金がありません。」 — "I have no money."

**Design note — finite money:** The 2,000 yen is deliberately finite and non-renewable for now. This teaches resource management organically. The player who buys 13 onigiri (150 × 13 = 1,950) will be nearly broke. The player who buys one of each (150 + 100 + 300 + 100 + 120 = 770) keeps 1,230 yen for future shopping. There's no wrong choice — the game won't hard-lock — but the player's wallet becomes a record of their priorities. Future money sources (allowance, found coins, helping NPCs) will replenish the economy, but not until later.

---

### ほしい — The Emotion of Wanting

ほしい (wanted/desired) is not 買う. 買う is the action. ほしい is the feeling. And the game uses both — sometimes together, sometimes apart.

**Objects you can buy but might not want:**
> コンビニ水: 「もうあります。ほしくないです。」 — "I already have some. I don't want it."

**Objects you want but can't buy:**
> デパート items (visible through window): 「ほしいです...」 — "I want it..." *(Trailing off. You want it. You can see it. You can't go inside. ほしい without 買う is longing.)*

**Objects you can't even see:**
> Fridge contents: 「何がありますか？...ほしいです。」 — "What's in there? ...I want it." *(Rikizo wants whatever is in the fridge. He doesn't know what it is. He wants it anyway. 中 = Day 9.)*

**Design note — ほしい vs 買う:** The distinction between wanting and buying is pedagogically important and narratively rich. ほしい is the softer, more emotional word — students often confuse it with たい (which arrives via G8 after this lesson). The game separates them temporally: ほしい is available now; たいです arrives when G8 unlocks after this lesson. By the time students learn たいです (want to DO something), they already understand ほしい (want to HAVE something). The game teaches the distinction through experience, not explanation.

---

### Story Beats

| Moment | What Happens | What Rikizo Thinks | What the Player Should Feel |
|---|---|---|---|
| Mom says 買い物 | Shopping exists. Mom mentions it like it's always existed. | Ready to go | After three days of staring at windows, YES. FINALLY. Shopping! |
| Dad says 新しい車 | Dad instantly claims the adjective for his car | 「新しいですね。」 | Of course. The car got an adjective before anything else. |
| First コンビニ purchase | Select item → pay → item enters inventory. Money leaves wallet. | 「買いました！」 | *Satisfaction.* Three days of waiting. One click. The embargo is over. |
| Buying the おにぎり | The food Yamakawa refused to share — now purchasable | 「おいしいです！」 | Sweet revenge. Not really revenge. But *something*. You have your own onigiri now. |
| Eating near Yamakawa | Yamakawa says "nice!" about you eating the thing he denied you | Slight frustration? | He doesn't remember. He genuinely doesn't remember. Move on. |
| Station master says 古い | The 4-day-old station is "old" | 「古いですか？」 | Another いつも-tier delusion. But... kinder? The station master seems to love his station's imaginary history. |
| Station master says まだ | "Not yet." The departure board is empty but temporary. | Notices the difference | *Wait.* Every other NPC says いつも ("always"). This one says まだ ("not yet"). He knows something is coming. He *knows* the world isn't finished. |
| The デパート | A building you can see but can't enter | 「大きいですね！...」 | The new vocabulary gate. The コンビニ is solved. The デパート is the next wall. You KNOW a word for "inside" must be coming. |
| ほしいです at the デパート | Wanting something you can see but can't reach | 「ほしいです...」 | The ache of vocabulary-gated desire. You have the word for wanting. You don't have the word for entering. |
| Yamakawa recommends onigiri | Via text. The food he refused to share. Recommended cheerfully. | Reads the message twice | This man. THIS MAN. |

---

### Running Gags Updated

1. **The Toilet Door** — Continues. Unresolved. 中 = Day 9.
2. **Dad's Gold** — Continues. Still untouchable.
3. **Dad's Car** — **UPGRADED.** Now it's 「新しいです！」 Dad's protectiveness gains an adjective dimension. The car isn't just his — it's *new*. The newness must be preserved.
4. **Tree-san** — **AGED.** Tree-san is now 古い in addition to 大きい and 大すき. The tree has gained history. The relationship deepens with every adjective. (If befriended: 「大きくて古い木です。大すきです。」 — "A big, old tree. I love it." The most complete sentence Rikizo has ever said to a tree.)
5. **The Fridge** — Continues. Still cannot open. ほしい makes it worse — you can now *want* what's inside, you just can't *access* what's inside. The fridge has gone from frustrating to philosophically tormenting. One more day.
6. **Family Possessions** — Car = 新しい + Dad's. Gold = Dad's. Fridge = sealed.
7. **The Water Bottle** — Still in inventory. Still reusable. Now somewhat redundant — you can buy water. But it's free and it's yours. The sentimental value of the first inventory item.
8. **The Empty Phone** — Two contacts. Shopping texts from Yamakawa. Academic texts from すずき先生. The phone is slowly becoming useful.
9. **Yamakawa's Onigiri Legacy** — Post-onigiri Yamakawa now *recommends* onigiri to the person he refused to share with. He has transcended selfishness into a pure, uncomplicated enthusiasm for rice balls that exists independently of any awareness of his own recent history.
10. **The Onigiri Quest** — **RESOLVED.** ✅ おにぎりを食べる. Three days, two verbs. The game's second quest and its first multi-gate quest. Water needed one word. Onigiri needed two words and the social awareness to go around Yamakawa.
11. **Mom's Shopping Quest** — **NEW. ◻ お母さんの買い物: プレゼントを買う.** Mom asks Rikizo to buy a present for Dad. Fully readable from the start — but the デパート can't be entered (中 = Day 9). The quest sits for one day. First quest with a spatial obstacle instead of a linguistic one.
12. **Mom's "Come Home"** — 「家に来てくださいね。」 Day 8. Always.
13. **Mom's Kitchen Authority** — Mom knew you were going shopping before you did. She gave spending advice (don't buy expensive things). She made breakfast. She is the household's central intelligence.
12. **いただきます / ごちそうさまでした** — Day 2 of the ritual. Becoming automatic.
13. **The Station Master's まだ** — **NEW.** The only NPC who says "not yet" instead of "always." In a world of いつも, he is まだ. He is either the most honest or the most patient character in the game. He is waiting for something. He won't say what.

---

### State Tracking (Day 8)

**New flags:**
- `first_purchase` — Tracks the first item the player buys. (Most likely おにぎり, but could be anything.)
- `bought_onigiri` — Did the player buy an onigiri? (Relevant for the Yamakawa interaction.)
- `ate_purchased_onigiri` — Did the player eat a purchased onigiri? (First player-triggered 食べる of purchased food.)
- `ate_onigiri_near_yamakawa` — Ate the onigiri near Yamakawa? (Triggers his oblivious response.)
- `met_ekichou` — Player has met the station master.
- `heard_mada` — Player heard the station master say まだ. (Distinct from other NPCs' いつも pattern.)
- `visited_depaato` — Player has seen the department store exterior.
- `tried_depaato_door` — Player tried to enter the department store.
- `wallet_empty` — Player has spent all 2,000 yen.

**Economy:**
- Starting: 二千円 (2,000 yen)
- Ending: variable — depends on player purchases
- All purchases tracked in inventory

---

### Art Assets Required (Day 8)

| Asset | Type | Style | Priority | Notes |
|---|---|---|---|---|
| コンビニ purchase UI | UI element | — | **Critical** | Item selection overlay on コンビニ window. Show items with prices, selectable. Wallet balance visible. |
| 駅長 sprite | Overworld sprite | A (Pixel) | High | Standing on station platform. Uniform. Formal posture. Small, dignified. |
| 駅長 conversation portrait | Portrait | B (MP100) | High | Calm, professional. At least 2 expressions (default, gentle smile when saying まだ). Uniform details. |
| デパート exterior | Building sprite/background | A (Pixel) | High | Larger than コンビニ. Multiple floors implied. Glass windows. Urban feel. Door visible but non-interactive. |
| Vending machine (active) | Sprite variant | A (Pixel) | Medium | Same station vending machine from Day 5 but now lit up / active. Purchase interaction: select item → dispense. |
| Wallet UI | UI element | — | Medium | Shows current yen balance. Updates after purchases. Position: corner of screen or in inventory. |
| おにぎり inventory item | Item sprite | A (Pixel) | Medium | Small onigiri icon for inventory. Can be consumed (triggers eating interaction). |
| ノート inventory item | Item sprite | A (Pixel) | Low | Notebook icon for inventory. No current use — 書く (to write) doesn't exist until N5.9. Another "item waiting for its verb." |
| ジュース inventory item | Item sprite | A (Pixel) | Low | Juice can/bottle icon. Consumable (飲む interaction). |

---

### Open Questions for Day 8

1. **Should the player be able to buy multiple of the same item?** Recommendation: Yes. Inventory can hold multiples. Each おにぎり is a separate consumable. The wallet is the only limiting factor. Let the player buy 13 onigiri if they want.

2. **What happens when money runs out?** Recommendation: Gentle acknowledgment (「お金がありません。」) but no hard punishment. The game continues — you just can't buy things. Money replenishment should come within 2–3 days (found coin, Mom's allowance, helping an NPC). Don't let the player feel stuck.

3. **Should the デパート have visible items through its windows?** Recommendation: Yes — but they should be vague/expensive-looking. プレゼント (gift boxes), clothing shapes, shiny objects. No specific item names yet (the vocab for clothes and gifts is limited). The player should see *stuff* and want to go inside. High prices visible: 五千円, 一万円. This contrasts with the コンビニ's 百円 items and makes the player feel the 高い/安い distinction viscerally.

4. **The ノート — an item waiting for its verb.** 書く (to write) is N5.9. The player can buy a notebook today but can't use it until tomorrow. This mirrors the Day 2 water bottle — an item in inventory with no applicable verb. Should the game acknowledge this? Recommendation: Yes, subtly. If the player tries to use the notebook: 「ノートです。...きれいですね。」 ("A notebook. ...It's clean.") It's just an object. Tomorrow, it becomes a tool.

5. **Station master's name:** Does he have one? Recommendation: Not yet. He's 駅長. A title, not a person. He may gain a name later when the station becomes more central to the plot. For now, his identity IS his role. He's the first NPC defined by function rather than personality.

6. **Day 8 correction — 書く:** Earlier notes suggested 書く (to write) = N5.9. It's actually N5.13. The notebook remains an item without its verb for longer than expected. This is fine — it sits in inventory as a mystery object, and the longer it waits, the more satisfying the eventual payoff.

---

## Day 9 — "Inside" (unlocked by N5.9: Relative Position)

### Lesson Kanji & Key Vocab Available

**New kanji (4):** 前、後、中、外

**Cumulative kanji (62):** All N5.1–N5.8 + above.

**New vocab highlights:**
- Spatial: 中 (なか, inside), 外 (そと, outside), 前 (まえ, front/before), 後ろ (うしろ, behind)
- Temporal: 後 (あと, after/later) — same kanji as 後ろ, completely different word
- Polite direction: こちら (this way), そちら (that way), あちら (over there), どちら (which way)
- Question: どうして (why/how come)
- Reassurance: だいじょうぶ (alright/okay)
- Compounds: 外人 (がいじん, foreigner), 外食 (がいしょく, eating out), 名前 (なまえ, name — 名 was N5.1, 前 is now taught)

**Grammar:** G9 unlocks after this lesson — plain forms, けど/から (clause connectors), plain commands, plain prohibition, のです/なんです. These will be available from Day 10 onward. For Day 9 content, the available grammar remains the same as Days 5–8: polite verb paradigm, te-form, plain_past, desire (たいです), volitional (ましょう from G8 which unlocked after Day 8).

**Wait — G8 grammar is now available.** G8 unlocked after N5.8 (Day 8). This means Day 9 is the first day with:
- ～ています (progressive: "is doing")
- ～たいです (desire: "want to")
- ～ましょう (invitation: "let's")
- ～でしょう (conjecture: "probably")

This is massive. Day 9 doesn't just add spatial vocabulary. It adds spatial vocabulary *and* the ability to express desire, ongoing actions, and suggestions. 「中に入りたいです」 — "I want to go inside." That sentence was impossible yesterday.

**New this day:** THE WORLD GAINS DEPTH. 中 and 外 transform every building from a facade into a space. The fridge becomes openable. The デパート becomes enterable. The コンビニ gains an interior. The house has rooms you can be *in*, not just *at*. Simultaneously, 前/後ろ/後 give the world a front and a back — things are no longer floating labels but objects with spatial relationships. And G8's ～たいです/～ましょう arrive to let Rikizo *want* things and *suggest* actions for the first time.

---

### The Day the World Became Three-Dimensional

Every day so far, Rikizo has experienced the world as a surface. Buildings have exteriors. Rooms have doors. Objects have faces pointed toward you. The concept of being *inside* something — surrounded by walls, enclosed, contained — has not existed. The fridge is a door with no behind-the-door. The convenience store is a window with no behind-the-window. The house is a collection of rooms Rikizo is always, somehow, standing *at* rather than *in*.

Today, 中 exists. And everything unfolds.

This is the biggest single spatial expansion since Day 5 gave Rikizo the ability to leave the house. Day 5 was horizontal expansion — the world got wider. Day 9 is depth expansion — the world gets *deeper*. Buildings gain interiors. Objects gain insides. The void that filled every doorframe is replaced by rooms that have things in them. And 外 arrives simultaneously, because the concept of "inside" inherently creates "outside." You can't have 中 without 外. They're born together, two halves of a door that finally swings both ways.

But the real surprise is 前 and 後ろ. Front and behind. The world hasn't just gained depth — it's gained *orientation*. Things have a face and a back. You can be in front of the station or behind the house. The flat map becomes navigable in a way that was impossible when everything was just "here" or "there."

---

### Morning — The Fridge

Rikizo wakes up. The calendar reads 「五月五日」(May 5th, Monday — Children's Day, a national holiday).

Breakfast with Mom. いただきます. パン and コーヒー. ごちそうさまでした. The ritual is established. Three days running.

But after breakfast, something is different. The kitchen looks the same. The fridge is in the same place it's been since Day 1. The same fridge that has mocked Rikizo for eight days — a door to nothing, a container without containment, a monument to vocabulary-gated frustration.

Today, Rikizo walks up to the fridge.

**THE FRIDGE OPENS.**

> Rikizo: 「中に...」 — "Inside..." *(He reaches for the handle. He has never done this before. Not because he chose not to — because "inside" didn't exist. Today it does. His hand knows where the handle is. He's been looking at this fridge for eight days.)*

> *The fridge door swings open.*

> Rikizo: 「中にありますよ！食べ物があります！」 — "There's stuff inside! There's food!"

**The fridge contains:**
- 水 (water bottles)
- ジュース (juice)
- たまご (eggs — visible but not yet vocab. Decorative food. The fridge has things you can't name.)
- Something wrapped in plastic (unknown. No vocabulary for it. It's just a shape.)

**If player takes water from the fridge:**
> 「水を飲みたいです。」 — "I want to drink water." *(First ～たいです usage in the game. The desire form, available since G8 unlocked after Day 8, finds its natural first use: wanting a drink from the fridge you've been staring at for eight days.)*

**If player examines the unknown wrapped thing:**
> 「...何ですか？」 — "...What is it?" *(No vocabulary for it. Even with 中 unlocked, the fridge still has mysteries. The world opens in layers, not all at once.)*

**Mom, watching from the kitchen:**
> 「だいじょうぶですよ。」 — "It's alright." *(だいじょうぶ. The first use of this word. Mom says it casually, as if her child has always been able to open the fridge. As if the fridge has always had an inside. She's not surprised. She's never been surprised by anything.)*

**Design note — the fridge resolution:** This is the single most-anticipated unlock in the game so far. The fridge has been a running gag for EIGHT DAYS. Every day, the player has walked past it knowing it should open. Every day, it hasn't. The moment it opens is the game's proof-of-concept: vocabulary unlocks the world. The fridge had food in it the whole time. The food was always there. The word wasn't.

---

### The House — Rooms Have Insides

With 中 and 外 active, the house transforms. Rikizo has been navigating the house as a series of connected spaces, but now those spaces have explicit spatial properties.

**The kitchen:**
> 「台所の中にいます。」 — "I'm inside the kitchen." *(First time Rikizo explicitly locates himself INSIDE a room, not just AT a room.)*

**If player goes to the front door:**
> 「外に行きたいですか？」 — "Do you want to go outside?" *(The game asks. This is new. Before, leaving was just... leaving. Now there's a threshold: 中 → 外. The door has two sides.)*

**If player looks outside from the front door:**
> 「外はいいてんきですね。」 — "It's nice weather outside." *(Narrative license — てんき (weather) isn't formally taught until N5.10, but can appear as a set phrase in Mom's or NPC dialogue as flavor. Alternatively, use: 「外はきれいですね。」 — "It's pretty outside." — which uses only available vocab.)*

**The toilet door:**
> Finally. FINALLY. The toilet door that has been locked since Day 1 — the door Dad guards, the door that has no behind-the-door — today it has a behind-the-door.

> *Player approaches the toilet door.*
> Rikizo: 「中に...」 — "Inside..."

> **OPTION A (Dad is nearby):**
> Dad: 「だめ！わたしのトイレです！」 — "No! My toilet!" *(Dad has upgraded from blocking the door to claiming the room. The toilet has an inside now, and Dad insists it's HIS inside. The gag evolves: it was never about the door. It's about ownership.)*

> **OPTION B (Dad is not nearby):**
> *The door opens. Inside: a small, clean, normal bathroom. Toilet. Small sink. A hand towel. Absolutely nothing special. Nothing worth guarding. Nothing worth eight days of territorial behavior.*
> Rikizo: 「...ふつうのトイレです。」 — "...It's a normal toilet."
> *(ふつう — "normal/ordinary" — is N4 vocab, so this specific word may not be available. Alternative: 「...トイレです。」 — flatly. The anticlimax IS the punchline. The most guarded room in the house contains exactly what you'd expect.)*

**Design note — the toilet resolution:** The toilet door is the oldest running gag in the game (Day 1). Its resolution should be deliberately anticlimactic. The player has been imagining what could possibly be behind a door that Dad guards so fiercely. Gold? A secret room? The answer is: a toilet. Just a toilet. Dad's possessiveness has no rational basis. He guards it because it's *his*, not because it contains anything worth guarding. This is consistent with his character: car (his), gold (his), toilet (his). Dad's defining trait is ownership, not value assessment.

---

### The コンビニ — You Can Go Inside Now

The コンビニ has been a window counter since Day 5. The shopkeeper has been visible through glass. Items have been on display. Rikizo has been buying from outside, pointing at items through the window.

Today, the door exists.

**If player enters the コンビニ:**
> Rikizo: 「コンビニの中ですか...!」 — "I'm inside the convenience store...!"

> Shopkeeper: 「いらっしゃいませ！中にどうぞ。」 — "Welcome! Please come in." *(She says this as if people have always come inside. The window-counter era never happened in her memory.)*

**The interior reveals:**
- The same items as before (おにぎり, 水, ノート) — now on shelves instead of behind glass
- New items visible but not purchasable (no vocab for them: magazines, snacks with kanji the player can't read)
- A small seating area (two chairs, a counter by the window)
- The shopkeeper, now full-body visible instead of just head-and-shoulders through the window

**Yamakawa is also inside.**
> Yamakawa: 「お！りきぞ！中に来ましたか！すごいですね！」 — "Oh! Rikizo! You came inside! Amazing!" *(Yamakawa treats this as an achievement. He has been leaning against the OUTSIDE wall for four days. Today, for the first time, he's inside. He's sitting on one of the chairs. He looks comfortable. He has always been comfortable here, apparently.)*

**If player examines the shelves:**
> Items on high shelves: 「高いです...」 — This could mean "expensive" OR "high up." The double meaning of 高い (tall/expensive) triggers for the first time in a spatial context. The shelf is physically 高い. The items on it might also be 高い (price-wise). Rikizo isn't sure which meaning he means. Neither is the player. This is the joke.

**Design note — the コンビニ interior:** The コンビニ becoming enterable is a smaller payoff than the fridge but still significant. It changes the shopping experience from transactional (point at window → buy) to spatial (browse shelves → select → buy). Future items will be discoverable by exploring the interior. The seating area is Yamakawa's new spot — he's migrated from the outside wall to the inside chair. His territory has expanded inward.

---

### The デパート — Finally Inside

The department store was the vocabulary gate of Day 8. You could see it. You couldn't enter it. Today:

**If player enters the デパート:**
> Rikizo: 「大きいですね...中も大きいです！」 — "It's big... the inside is big too!"

The デパート interior is the largest indoor space in the game so far. Multiple sections. Higher-end items. A different atmosphere from the コンビニ — quieter, cleaner, more intimidating.

**Visible sections:**
| Section | What's visible | Can buy? |
|---|---|---|
| Food floor (一かい) | Beautiful food displays, wrapped packages | Yes — but expensive. おかし (snacks) 五百円, プレゼント gift boxes 千円+ |
| Clothing (二かい) | Mannequins, folded clothes | No — no clothing vocab yet. Window-shopping only. |
| Electronics (三かい) | Something that looks like phones/devices | No — no vocab. Decorative. |

**Floor indicator:** The player can see 一かい、二かい、三かい markers. Counter vocabulary hasn't been fully taught, but the kanji 一, 二, 三 are from N5.1 and かい is readable. The デパート teaches floor counting through environment, not lecture.

**Shopkeeper (different from コンビニ):**
> 「いらっしゃいませ。こちらにどうぞ。」 — "Welcome. This way, please." *(こちら. The polite direction word finds its natural habitat: a department store employee guiding customers. The コンビニ shopkeeper says いらっしゃいませ. The デパート shopkeeper says いらっしゃいませ AND こちらにどうぞ. More words = more formal = more expensive store.)*

**If player tries to buy プレゼント:**
> 千円 (1,000 yen). If the player has enough money: 「プレゼントを買いました！」 A gift box enters inventory.

**Mom's Shopping Quest — Resolution:**

If the player has the active quest ◻ お母さんの買い物: プレゼントを買う (from Day 8), buying the プレゼント triggers a quest update:

> **Quest log:** ◻ お母さんの買い物: プレゼントを買う → ◻ お母さんにプレゼントをあげる... *(wait — あげる [to give] isn't available yet. The quest updates to:)* ◻ お母さんの買い物: 家に来てください

The quest becomes: go home. Bring the present to Mom. When the player returns home and talks to Mom:

> **Mom:** 「あ！プレゼントを買いましたか？ありがとう、りきぞ！」 — "Oh! You bought the present? Thank you, Rikizo!"
> **Rikizo:** 「お父さんのプレゼントです。」 — "It's Dad's present."
> **Mom:** 「そうですね。後でお父さんにあげましょう。」 — "That's right. Let's give it to Dad later."

**Quest complete.** ✅ お母さんの買い物. The present disappears from inventory. Mom takes it. The player receives 五百円 (500 yen) — Mom's first monetary reward.

> 📋 Quest Log
> ✅ 水を飲む (Day 2 → Day 7)
> ✅ おにぎりを食べる (Day 5 → Day 8)
> ✅ お母さんの買い物 (Day 8 → Day 9)

Three quests. Each with a different obstacle: missing verb, social block + missing verb, spatial block. Each resolved by a different vocabulary unlock: 飲む, 買う, 中. The quest system is teaching the player that every barrier in this world is linguistic — and every solution is a new word.

**The 500 yen reward:** This is the first time the player EARNS money. The 2,000 yen from Day 1 was a starting allowance. This 500 yen was *earned* by doing a task. Mom just created the first job in the game world. The economic system now has income, not just expenditure.

**If player bought the プレゼント before the quest:** The game tracks inventory. If the player already bought a プレゼント during Day 8's デパート window-shopping (they couldn't enter, but if they somehow got one — they didn't), or during a Day 9 visit without checking the quest log, Mom recognizes it: 「もう買いましたか？すごいですね！」 ("You already bought it? Amazing!")

**If the player doesn't have enough money:**
> Mom: 「お金がないですか？はい、どうぞ。」 — "No money? Here you go." *(Mom gives Rikizo 千円 to cover the purchase. This only triggers if the wallet is under 1,000 yen. Mom is practical.)*

**Design note — quest economy:** Mom's quest introduces two things: (a) quests can give monetary rewards, and (b) NPCs can fund quests if the player is broke. This prevents the soft-lock where a player who spent all 2,000 yen on onigiri can't complete the quest. The game never punishes exploration spending — Mom backstops the economy.

> If not enough money: 「お金がありません...高いですね。」 — "No money... it's expensive."

**If player goes to the clothing floor:**
> Rikizo: 「...きれいですね。」 — "...Pretty." *(He can see clothes. He can't name them. He can't buy them. The vocabulary gate continues, one floor up. The デパート is a vertical vocabulary progression — each floor unlocks as the student's vocabulary grows.)*

**Design note — the デパート as vertical world:** The department store is the game's first multi-level interior. Each floor represents a vocabulary tier: Floor 1 (food) is accessible with current vocab. Floor 2 (clothing) requires N4 vocab. Floor 3 (electronics) requires even more. The building physically embodies the curriculum — you can ride the escalator up, but the higher you go, the less you can interact with. The building grows with the student.

---

### The 駅 — Behind the Platform

The station gains depth. The station master is still there, still saying まだ.

**New spatial interactions:**
> 前: 「駅の前にいます。」 — "I'm in front of the station." *(First use of 前 as positional. Rikizo can now stand IN FRONT OF the station, not just AT it.)*

> 後ろ: If the player walks behind the station: 「駅の後ろですか...何もないです。」 — "Behind the station? ...Nothing." *(The back of the station is empty. Not void-empty — just normal-empty. A wall, some weeds, nothing interesting. But the fact that "behind" exists as a navigable direction is new.)*

**Station master interaction:**
1. 駅長: 「おはようございます。中にどうぞ。」 — "Good morning. Please come inside." *(The station has an interior now. The waiting room.)*
2. Rikizo enters the waiting room. A bench. A clock. A timetable board — still empty.
3. 駅長: 「まだですよ。でも、だいじょうぶです。」 — "Not yet. But it's alright." *(まだ + だいじょうぶ. Two of today's new words, combined. The station master acknowledges the train isn't here but insists it's fine. He's patient. He's always been patient.)*

**If player asks どうして (why):**
> Rikizo: 「どうしてまだですか？」 — "Why not yet?"
> 駅長: 「...長い道ですから。」 — "...It's a long road." *(Same answer as yesterday. He deflects. The station master's mystery deepens — he knows something is coming, he won't say when, he isn't worried. He sits in an empty waiting room and waits. His まだ is either the most reassuring or the most ominous word in the game.)*

---

### 前 / 後ろ / 後 — The World Gets Orientation

With front, behind, and after available, the world reorients. Objects that were just "there" now have faces.

**At home:**
- 「家の前に木があります。」 — "There's a tree in front of the house." *(Tree-san gets a location. It's in FRONT of the house. It has always been in front of the house. The spatial relationship was always true — the word for it is new.)*
- 「家の後ろに何がありますか？」 — "What's behind the house?" *(Behind the house: a small garden area becomes visible for the first time. Not explorable yet — no garden vocabulary — but the space exists. The world extends backward as well as inward.)*

**In town:**
- 「コンビニの前にやまかわがいます。」 — "Yamakawa is in front of the convenience store." *(Wait — he's inside now. This sentence is wrong, which is itself a moment: the spatial relationships are catching up with the narrative. Yamakawa's location has changed, and the spatial vocabulary can now track it: 「コンビニの中にやまかわがいます。」)*

**The after/later distinction (後 vs 後ろ):**
> 後ろ (うしろ) = behind, spatial. 後ろ always has the ろ.
> 後 (あと) = after, temporal. 後 stands alone.

The game teaches this through context, not explanation:
- Station master: 「後でまた来てください。」 — "Please come again later." (後で = temporal)
- Rikizo behind a building: 「後ろにいます。」 — "I'm behind (it)." (後ろ = spatial)

The player encounters both within minutes. The kanji is the same. The meaning is different. The ろ is the marker. This is one of those Japanese distinctions that textbooks explain in a paragraph but games can teach in two interactions.

---

### こちら / そちら / あちら / どちら — Polite Space

The polite direction words are a gift from the デパート. The department store employee says こちら. The station master says あちら. These words don't replace ここ/そこ/あそこ — they're the formal version, the customer-service version, the "please follow me" version.

**Where they appear naturally:**
- **こちら** — デパート employee: 「こちらにどうぞ。」 ("This way, please.")
- **そちら** — Shopkeeper pointing across the store: 「そちらにあります。」 ("It's over that way.")
- **あちら** — Station master pointing down the platform: 「あちらにベンチがあります。」 ("There's a bench over there.")
- **どちら** — Shopkeeper: 「どちらがほしいですか？」 ("Which one do you want?" — polite)

**Design note:** The こそあど system (this/that/over there/which) already exists via ここ/そこ/あそこ/どこ (from N5.3). The ちら variants are the polite register. The game teaches this naturally by having service NPCs use こちら while friends use ここ. Yamakawa says ここ. The station master says あちら. The register difference maps onto character personality.

---

### Yamakawa — Interior Decorator

Yamakawa has migrated indoors. For four days he leaned against the コンビニ exterior wall. Today he's sitting on a chair inside. His wall era is over. His chair era begins.

**If player talks to Yamakawa inside the コンビニ:**
1. **Yamakawa:** 「中はいいですね！」 — "It's nice inside!" *(He says this as if discovering the interior. He has been standing outside this building for four days. He has been watching other people go through the door. He did not go inside because — well, the game doesn't explain why. Because 中 didn't exist. Because Yamakawa, like Rikizo, lives in a world made of words.)*
2. **Rikizo:** 「やまかわ、まえは外にいましたね。」 — "Yamakawa, before you were outside." *(前 used temporally: "before." Rikizo notices the change.)*
3. **Yamakawa:** 「え？外ですか？あまりおぼえていません。」 — "Huh? Outside? I don't really remember." *(あまり + negative. He doesn't really remember standing outside. Of course he doesn't. Yamakawa's memory is a present-tense phenomenon. He is always where he is. Where he was doesn't interest him.)*
4. **Yamakawa:** 「デパートに行きましょう！」 — "Let's go to the department store!" *(～ましょう. First NPC use of the invitation form. Yamakawa suggests going to the デパート together. This is the first time an NPC has proposed a joint activity.)*

**If player says yes to the デパート trip:**
> Yamakawa walks with Rikizo to the デパート. Inside, Yamakawa looks at everything:
> 「すごいですね！高いです！」 — "Amazing! Expensive!" *(He touches nothing. He buys nothing. He is enthusiastic about the existence of expensive things. His appreciation is purely aesthetic.)*

**If player says no:**
> Yamakawa: 「だいじょうぶですよ。また後で。」 — "That's alright. Later then." *(だいじょうぶ + 後で. Two new words in one casual response.)*

---

### 外人 and 名前 — Identity Words

Two compound words become available that touch on identity:

**外人 (がいじん, foreigner):**
A word that exists in the vocabulary but doesn't have a clear game trigger yet. Is Rikizo a 外人? The game doesn't specify. Rikizo has a Japanese name, lives with a Japanese family, speaks Japanese. But the player might not be Japanese. The word sits in the vocabulary like a question the game hasn't asked.

**Possible encounter:** A passing NPC (not a named character) uses the word:
> NPC: 「あ、外人ですか？」 — "Oh, a foreigner?"
> Rikizo: 「...」 *(No response. The game doesn't answer. The player decides.)*

**Design note:** 外人 is a loaded word in real Japan. The game acknowledges it exists without making a judgment. It's available as vocabulary. Whether it describes Rikizo is left ambiguous. This is intentional — the player's identity is their own.

**名前 (なまえ, name):**
Both kanji are now taught (名 from N5.1, 前 from N5.9). The word becomes writable in full kanji for the first time.

**The station master uses it:**
> 駅長: 「名前は...駅長です。」 — "My name is... Station Master." *(He introduces himself by title. Not a name — a function. This is either because he has no name or because his name IS his role. The game leaves this open. If the player asks again: 「駅長です。」 Same answer. He is what he does.)*

**Yamakawa notices:**
> Yamakawa: 「りきぞ、駅長の名前をしっていますか？」 — "Rikizo, do you know the station master's name?" *(知る = N5.6. Yamakawa asks a question the game can't answer. The station master's name might not exist.)*

---

### 外食 — Eating Out

外食 (がいしょく, eating out) is a compound of 外 (outside) + 食 (eat, from Day 7). The word creates a concept: eating that happens *outside the home*. Mom's kitchen is 食 (eating). The コンビニ onigiri eaten on a bench is 外食.

**Mom's reaction to the concept:**
> Mom: 「外食ですか？だいじょうぶですか？」 — "Eating out? Are you sure?" *(Mom is skeptical. She controls the kitchen. She made breakfast. The idea of eating outside her domain is mildly threatening to her kitchen authority. だいじょうぶですか here is not "are you okay?" but "is that really a good idea?" — the classic Japanese passive-aggressive check.)*

**If player eats a purchased おにぎり outside the house:**
> 「外食です！」 — "Eating out!" *(The game labels the action. The player has performed 外食 for the first time. It's the same onigiri. It tastes the same. But eating it outside makes it a different category of eating. Japanese vocabulary doesn't just describe the world — it categorizes it.)*

---

### The Phone — Yamakawa's Interior Report

**Message from やまかわ:**
> 「コンビニの中はいいですよ！前は外にいました。中の方がいいですね！」 — "The inside of the convenience store is great! Before I was outside. Inside is better!"

Yamakawa has discovered interiority and wants to share the news. He sends this message even if the player visited him inside the コンビニ already. He would send it regardless. He is reporting a discovery to a person who may have made the same discovery at the same time. He doesn't check.

**Email from すずき先生:**
> 「来週の前に、名前を書いてください。りきぞさんの名前です。だいじょうぶですか？」 — "Before next week, please write your name. Your name, Rikizo. Is that okay?"

すずき is asking Rikizo to write his name before the event next week. This is the first concrete *task* assigned by an NPC beyond "come to a place." The event is getting closer. It requires preparation. Writing a name requires... 書く. Which doesn't exist until N5.13. Rikizo can read the request. He cannot fulfill it. Another word-gated task — but this time, the gap is longer. The notebook in inventory gains a purpose it can't yet serve.

---

### Story Beats

| Moment | What Happens | What Rikizo Thinks | What the Player Should Feel |
|---|---|---|---|
| The fridge opens | Eight days of waiting. One kanji (中). The door swings open. Food inside. | 「中にあります！」 | The single most satisfying moment in the game so far. YOU KNEW there was food in there. Now you can reach it. |
| Mom says だいじょうぶ | She acts like the fridge always opened | Slight disorientation | Of course she does. She always does this. The world is always how it is now. |
| The toilet | Dad's most guarded territory revealed: a normal toilet | 「...」 | Anticlimax as punchline. Eight days of guarding. A toilet. Just a toilet. |
| Entering the コンビニ | The window counter becomes a door | 「中ですか...!」 | Satisfying but quieter than the fridge. You've been buying from outside. Now you're inside. The items are the same but the experience is different. |
| Yamakawa is inside | He's been standing outside for four days. Now he's on a chair. | 「外にいましたね。」 | He doesn't remember being outside. Of course he doesn't. |
| Yamakawa says ～ましょう | "Let's go to the department store!" First joint activity invitation. | Surprised | An NPC just suggested doing something TOGETHER. This hasn't happened before. The game just gained cooperative social interaction. |
| The デパート interior | Three floors. Each a different vocabulary tier. | 「大きいです...」 | Awe. And the dawning realization that higher floors = more words needed. The building IS the curriculum. |
| Station master says だいじょうぶ | "Not yet. But it's alright." | Trust? Doubt? | He's still waiting. Still not worried. His patience is either comforting or eerie. |
| どうして / まだ exchange | "Why not yet?" / "Long road." | Frustrated curiosity | The station master knows something. He won't explain. The mystery deepens. |
| 名前 / station master | "My name is... Station Master." | 「名前は...？」 | He has no name. Or his name IS his title. This is unsettling in a way that's hard to articulate. |
| すずき's task | Write your name before next week | Can't do it | 書く doesn't exist yet (N5.13). The request sits in the phone, unfulfillable. A longer wait than the fridge. |

---

### Running Gags Updated

1. **The Toilet Door** — **RESOLVED.** Behind the most guarded door in the house: a toilet. A completely normal toilet. Dad will still guard it (「わたしのトイレです！」) but the mystery is gone. The punchline is that there was no punchline. It was always just a toilet.
2. **Dad's Gold** — Continues. Still untouchable. Now there's a 中 to Dad's treasure area, but he blocks access the same way.
3. **Dad's Car** — Continues. 「新しいです！」 (from Day 8). Now also: 「車の中に...」 "Inside the car..." → 「だめ！」 The car has an interior now. Dad guards the interior too.
4. **Tree-san** — Continues. 「大きくて古い木です。」 From Day 7–8. Today: 「家の前にあります。」 — Tree-san is in front of the house. The tree gains a spatial address. (If befriended: 「木の後ろに何がありますか？」 — "What's behind the tree?" Answer: the side of the house. Nothing special. But checking behind a tree is the kind of thing only a friend would do.)
5. **The Fridge** — **RESOLVED.** The eight-day saga ends. The fridge opens. Food is inside. It was always inside. The resolution is simultaneously satisfying and anticlimactic — of course there was food in there. It's a fridge. But the emotional weight of eight days of inaccessibility makes "a fridge with food in it" feel like finding treasure.
6. **Family Possessions** — Car interior = Dad's. Toilet interior = Dad's. Fridge interior = Mom's domain. The house has rooms now, and every room has an owner.
7. **The Water Bottle** — Still in inventory. Now slightly redundant: fridge has water, vending machine has water, コンビニ sells water. But it's the original. Sentimental.
8. **The Empty Phone** — Three contacts. Yamakawa sends interior design reviews. すずき assigns homework. The phone is becoming a task manager.
9. **Yamakawa's Migration** — From コンビニ wall (Days 5–8) to コンビニ chair (Day 9). He has gone inside. He does not remember being outside. His anchor point is the same building — the transition was horizontal to interior, not location to location. He has depth now.
10. **Mom's "Come Home"** — 「家に来てくださいね。」 Day 9. Every day. But now with spatial awareness: she's asking him to come *inside* the home, not just *to* it.
11. **Mom's Kitchen Authority** — Reinforced. She's skeptical of 外食. The kitchen is her domain. The fridge is technically openable but emotionally Mom's territory.
12. **いただきます / ごちそうさまでした** — Day 3 of the ritual. Automatic.
13. **The Station Master's まだ** — Continues. Now with だいじょうぶ. "Not yet. But it's alright." He still won't explain. He still isn't worried. He has a waiting room now — because the station has an interior. He sits in it. He waits.
14. **The ノート** — Continues waiting. 書く = N5.13, not N5.9 as originally guessed. The notebook's wait just got longer. And すずき has now assigned a task that requires writing. The notebook is in inventory. The verb is four lessons away. The task cannot be completed. This is the fridge situation all over again, but slower.
15. **Mom's Shopping Quest** — **RESOLVED.** ✅ お母さんの買い物. Player buys a プレゼント at the デパート (千円), brings it home. Mom gives 500 yen reward — the first earned income in the game. The quest that was spatially blocked on Day 8 (can't enter デパート) is resolved on Day 9 (中 exists). Each quest teaches a different lesson: water = vocabulary unlocks action, onigiri = vocabulary + social navigation, shopping = vocabulary + spatial access.

---

### State Tracking (Day 9)

**New flags:**
- `fridge_opened` — The fridge has been opened for the first time. The eight-day saga ends.
- `toilet_resolved` — Player has seen inside the toilet. (Dad may still block future access.)
- `entered_konbini` — Player has gone inside the convenience store.
- `entered_depaato` — Player has entered the department store.
- `moms_shopping_complete` — Player bought the プレゼント and returned it to Mom. +500 yen reward.
- `depaato_with_yamakawa` — Player went to the デパート with Yamakawa (accepted ましょう invitation).
- `bought_present` — Player purchased a プレゼント at the デパート.
- `entered_station_waiting_room` — Player went inside the station.
- `asked_doushite` — Player asked the station master why.
- `heard_daijoubu` — Station master said だいじょうぶ.
- `ekichou_name_asked` — Player asked the station master's name. Answer: 駅長.
- `suzuki_task_received` — すずき assigned the name-writing task. Cannot be completed yet.
- `ate_outside` — Player performed 外食 (eating a purchased food item outside the home).

**Economy:**
- Wallet: variable from Day 8. If player buys a プレゼント (1,000¥), wallet decreases significantly.
- New purchasable items: デパート food floor (higher prices)

---

### Art Assets Required (Day 9)

| Asset | Type | Style | Priority | Notes |
|---|---|---|---|---|
| Fridge interior | UI element / sprite | B (MP100) | **Critical** | Inside of fridge when opened: shelves with water, juice, eggs, wrapped mystery item. The most anticipated art reveal so far. |
| Fridge opening animation | Animation | A+B | **Critical** | 2–3 frames: closed → handle pull → open → interior visible. This is the payoff of eight days. It should feel satisfying. |
| コンビニ interior | Background | B (MP100) | **Critical** | Inside the convenience store: shelves, counter, seating area (2 chairs by window). Warm, well-lit. Small but complete. |
| デパート interior (Floor 1) | Background | B (MP100) | High | Food floor: display cases, wrapped gifts, elegant food presentation. Upscale feel compared to コンビニ. |
| デパート interior (Floor 2) | Background | B (MP100) | Medium | Clothing floor: mannequins, shelves. Player can see but not interact. Decorative. |
| Station waiting room | Background | B (MP100) | High | Small room inside the station: bench, clock, empty timetable board. Quiet, contemplative. |
| Toilet interior | Background / sprite | B (MP100) | Medium | Deliberately boring. Normal bathroom. Toilet, sink, hand towel. The anticlimax is the point. |
| Behind the house | Background variant | B (MP100) | Low | Small garden area behind the house. Not detailed — just establishing that "behind the house" is a place. |
| Yamakawa (sitting) | Sprite + portrait | A+B | Medium | Yamakawa sitting on a chair inside コンビニ instead of leaning against the wall outside. New pose, same energy. |
| プレゼント inventory item | Item sprite | A (Pixel) | Low | Gift box icon. In inventory with no recipient. |

---

### Open Questions for Day 9

1. **Should all buildings become enterable at once?** Recommendation: Yes. 中 is a universal concept — once it exists, it applies everywhere. But not all interiors need to be fully designed. The コンビニ and デパート get full interiors. The station gets a waiting room. Other buildings (if any) get placeholder interiors or "there's nothing interesting inside" responses. The principle: 中 unlocks the *concept*; individual locations get fleshed out as vocabulary supports them.

2. **Does the garden behind the house do anything?** Recommendation: Not yet. It's visible — you can walk there — but there's no interaction. Garden vocabulary (花 = flower, etc.) comes later. For now, it establishes that "behind the house" is a space that exists. Future days will fill it.

3. **Should Dad always block the toilet?** Recommendation: 50/50 chance. Sometimes Dad is there (blocks access, comedy continues). Sometimes he's not (toilet accessible, anticlimactic reveal). The toilet's content never changes — it's always just a toilet. The variable is Dad's guard schedule. This keeps the gag alive without making it a permanent blocker.

4. **How much can you buy at the デパート?** Recommendation: Limited selection. Food floor has a few expensive items (プレゼント at 1,000¥, おかし/snacks at 500¥ if vocab supports it). Upper floors are browse-only. The デパート should feel like a place you'll return to as your vocabulary grows — each visit unlocking more interaction as new words arrive.

5. **The 外人 encounter — should it happen?** Recommendation: Optional/rare. It can be a random NPC encounter that triggers once. The game presents the word without judgment. Rikizo's silence in response is the design choice — the player fills in the meaning. If this feels too loaded for a game about learning vocabulary, it can be deferred to N4 when the player has more nuanced language to process it. The word exists in the glossary either way.

6. **こちら/そちら/あちら — are they too formal for early game?** Recommendation: No. They're *appropriately* formal for where they appear (department store, station). The game naturally teaches register by having different NPCs use different politeness levels. Yamakawa says ここ. The station master says あちら. The player learns that formality varies by context, not by rule. This is better pedagogy than explaining register in a grammar box.

---

## Day 10 — "Weather & Energy" (unlocked by N5.10: Weather & Energy)

### Lesson Kanji & Key Vocab Available

**New kanji (4):** 天、電、気、休

**Cumulative kanji (66):** All N5.1–N5.9 + above.

**New vocab highlights:**
- Weather: 天気 (てんき, weather)
- Energy: 電気 (でんき, electricity), 電車 (でんしゃ, train)
- Mood/feeling: 気分 (きぶん, mood)
- Rest: 休み (やすみ, day off / rest), 休日 (きゅうじつ, holiday), 休む (やすむ, to rest)
- Popularity: 人気 (にんき, popularity)
- Accommodation: ホテル (hotel)
- Becoming: なる (to become / turn into)
- Casual expressions: そうだね (yeah / that's right), そうなの (is that so? / really?), そうだよ (that's right / yeah — emphatic), うん (yeah / uh-huh)

**Grammar — G9 is NOW AVAILABLE.** G9 unlocked after N5.9. This is the single biggest grammar expansion since G6 gave us polite verbs. Day 10 is the first day with:
- Plain negative (～ない): 「行かない」 "not going"
- Plain past negative (～なかった): 「食べなかった」 "didn't eat"
- Plain volitional (～おう/～よう): 「行こう」 "let's go" (casual)
- けど (casual "but"): 「行きたいけど...」 "I want to go, but..."
- から as "because": 「おいしいから食べる」 "I eat it because it's tasty"
- が as "but" (clause connector): 「行きたいですが...」
- Casual copula だ: 「いい天気だ」 "Nice weather."

**Also newly available from N5.10 itself:**
- polite_past_adj (かったです / でした)
- adverbial (～く / ～に)

**This means:** For the first time, NPCs can speak casually. Yamakawa has been locked in です/ます prison for five days. Today, he speaks like a friend.

**Calendar:** 五月六日 (May 6th, Tuesday). Golden Week is *officially* over — May 5th (Children's Day) was the last national holiday. But many families take extra days off during Golden Week, extending the break through the week. The たろう household is doing exactly this. Rikizo's family is still on extended vacation. School doesn't exist yet anyway (学/校 = N5.12), so the question is academic — there is nowhere to go back to.

**Not available yet:** 乗る (to ride) is N4 vocab. This means 電車 exists — you can SEE the train — but you cannot RIDE it. Same logic as Dad's car: the vehicle is real but the verb to use it hasn't materialized.

---

### The Day the World Got a Mood

Something shifted overnight. Not in the world — in the *air*. Yesterday the world gained depth (中/外). Today it gains... atmosphere. 天気 gives the sky a name. 気分 gives Rikizo an inner state. 電気 gives the house a pulse — a TV that has a power state, a lamp that can be toggled. And 休み names the thing Rikizo has been doing for nine days without a word for it.

But the real earthquake is G9. Casual speech. For nine days, every character has spoken to Rikizo in polite register. Mom, Dad, Yamakawa, the shopkeepers, the station master — everyone has been performing formality. Yamakawa, Rikizo's best friend since Day 5, has been saying です and ます to him like a bank teller. Today, the mask slips. Yamakawa drops polite form and talks like what he is: a teenager talking to his best friend.

This is the first time the game's linguistic reality has shifted not by adding objects (nouns) or actions (verbs) but by changing *how people talk*. The world didn't gain a new thing. It gained a new tone.

---

### Morning — The Lights Come On

Rikizo wakes up. The calendar reads 「五月六日」(May 6th, Tuesday).

Something is different in the bedroom. Not different-wrong — different-new. There's a lamp on the desk next to the パソコン. It has always been there (object decoration from Day 1). But today it responds to a tap — on, off, on, off. 電気 exists. The house has electricity now — not as infrastructure (the TV has worked since Day 1) but as a *concept*. Things can be turned on and off.

**If player interacts with the lamp:**
> 「電気です。」 — "Electricity." *(Rikizo names it. The lamp becomes the first toggle-able object in the game: tap to turn on, tap to turn off. A tiny mechanic, but it establishes that the world has states now — not just existence and non-existence, but on and off.)*

**If player interacts with the TV:**
> NEW: The TV now has a power state. Before today, interacting with it produced a flat message. Now:
> - TV off: 「テレビです。電気をつけますか？」 — "The TV. Turn it on?"
> - TV on: The screen shows... static. Or maybe a weather forecast. A cheerful announcer voice:「今日の天気は...」"Today's weather is..." followed by a description. The TV is the first object that *broadcasts* — it generates content from the world outside the house. What it says about the weather matches what the player sees outside.
> - TV off again: 「電気をけしました。」 — "Turned it off."

**Design note — 電気 as toggle:** The introduction of on/off states is subtle but foundational. The house has had objects since Day 1. But objects have been inert — they exist or they don't. Today, objects can be *active* or *inactive*. The lamp glows or doesn't. The TV plays or doesn't. This is the game's first step toward dynamic environments. In later days, more objects will gain states: doors locked/unlocked, items hidden/revealed, machines running/stopped. 電気 is the seed.

---

### Breakfast — Extended Vacation

Mom is in the kitchen. The ritual continues. いただきます. But today, the conversation after breakfast is different.

**Mom conversation (6 lines):**

1. **Mom:** 「おはよう、りきぞ。今日もいい天気ですね。」 — "Good morning, Rikizo. Nice weather again today." *(天気. The first time anyone has commented on the weather. It's been nice weather every day — the sky has been blue since it materialized in Day 6. But no one could SAY that until today.)*

2. **Rikizo:** 「お母さん、今日は休みですか？」 — "Mom, is today a day off?" *(休み. Rikizo asks the question the player has been wondering: are we still on vacation?)*

3. **Mom:** 「うん、休みですよ。お父さんも休みです。」 — "Yes, it's a day off. Dad too." *(うん — Mom uses the casual affirmative, then slips back to polite. She's comfortable enough with her son to say うん but her speech patterns are deeply polite. This is realistic Japanese family register: parents often mix casual acknowledgments into polite speech.)*

4. **Rikizo:** 「休日ですね！いい気分です。」 — "A holiday! I feel good." *(休日. 気分. Rikizo names both the holiday and his mood. Two new compound words in one sentence — 天 doesn't appear in either, but 気 and 休 each get two compounds. The lesson's kanji are pulling double duty.)*

5. **Mom:** 「天気もいいですし、気分もいいですね。」 — "The weather is good and the mood is good too." *(し — "and also" — is Mom reinforcing the pattern. 天気 and 気分 side by side, both using 気.)*

6. **Mom:** 「りきぞは先生になりましたね。」 — "You've become a teacher, Rikizo." *(なる — "to become." Mom uses it warmly, reflecting on Rikizo's role. This is the first natural use of なる in dialogue — not philosophical, just maternal pride. But the word sits in the air. Became. Things become. Everything in this world has been becoming.)*

---

### Dad — The Train Enthusiast

Dad is in the living room. He's staring out the window toward the direction of the station.

**Dad conversation (5 lines):**

1. **Dad:** 「りきぞ、電車を見ましたか？」 — "Rikizo, did you see the train?" *(電車. Dad asks about the train as if it has always been there. It has not. The station has had a platform, a station master, and an empty timetable for five days. Today a train exists. Dad acts like this is old news.)*

2. **Rikizo:** 「電車ですか？駅に？」 — "A train? At the station?"

3. **Dad:** 「そうだよ。電車がありますよ。でも...」 — "Yeah. There's a train. But..." *(そうだよ — Dad uses the casual emphatic. He's always been more casual than Mom in the roadmap vision, and today the vocabulary supports it.)*

4. **Rikizo:** 「でも？」 — "But?"

5. **Dad:** 「まだです。電車に...」 — "Not yet. The train..." *(He trails off. The sentence he can't finish: 「電車に乗れません」— "Can't ride the train." 乗る doesn't exist. Dad WANTS to say you can't ride it, but the verb isn't there. He knows the limitation. He can't articulate it. The ellipsis does the work. The player understands: the train exists but can't be used. Same as the car. Dad stares at two vehicles he owns and operates but cannot currently describe the act of using.)*

**If player interacts with Dad again:**
> 「わたしの車も... まだです。」 — "My car too... not yet." *(Dad connects the two: train and car. Both exist. Both are unusable. He's frustrated in a way he can't express. His possessiveness (the car is HIS) meets vocabulary limitations (he can't ride it). The comedy: a man who owns a car and can see a train, but the verb "to ride" hasn't been invented yet.)*

---

### The Station — The Train Exists

The player walks to the station. The timetable board — empty since Day 5 — has something on it. Not a schedule. Just a single line:

> 「電車」

That's it. The word. The concept. The timetable doesn't say where the train goes or when it leaves. It says that a train exists.

**On the platform:**

A train is there. It's sitting on the tracks. Not moving. Not departed. Just... parked. It has always been parked here, apparently. The doors are closed. The windows are dark. It is a train the way the fridge was a fridge before Day 9: present but inert. You can see it. You cannot enter it.

**If player approaches the train:**
> 「電車です！大きいですね。」 — "A train! It's big." *(Rikizo is delighted. He sees a train. He doesn't try to board it because the concept of boarding doesn't exist. He admires it the way you admire a mountain: from outside.)*

**If player tries to interact with the train doors:**
> 「...」 *(Nothing. The doors don't respond. There is no interaction because there is no verb for the interaction. 乗る will arrive in N4. The train waits.)*

**Station master interaction:**

1. **駅長:** 「おはようございます。電車を見ましたか？」 — "Good morning. Did you see the train?"

2. **Rikizo:** 「はい！電車がありますね！」 — "Yes! There's a train!"

3. **駅長:** 「そうです。電車はあります。でも...まだですよ。」 — "That's right. The train is here. But... not yet." *(まだ. His word. His eternal word. But now it has specificity — the train is here but まだ. Before, まだ floated in void. Now it has an object. The train is the thing that is not-yet.)*

4. **Rikizo:** 「どうしてですか？」 — "Why?"

5. **駅長:** 「...電車は休みです。」 — "...The train is on a holiday." *(休み. The station master says the train is resting. On holiday. Like everyone else. The train exists but isn't working because it's on vacation. This is either the most reasonable explanation (Golden Week, everything's closed) or the most absurd (trains don't take holidays). In this world, it's both. The station master isn't lying — the train literally cannot operate because the verb to operate it doesn't exist. "It's on holiday" is as true as anything.)*

**If player has high curiosity (≥ 7):**
> **Rikizo:** 「電車は...どこに行きますか？」 — "Where does the train go?"
> **駅長:** 「...」 *(Long pause.)* 「まだ、わかりません。」 — "I don't know yet." *(He doesn't know where the train goes. The timetable is blank. The destination doesn't exist. The tracks run into... the player can follow them with their eyes and see they fade into void at the edge of town. The train goes nowhere because nowhere has been built yet. The station master knows this, somehow. He isn't worried. He waits.)*

**Design note — the train paradox:** The train is Day 10's equivalent of the fridge. It's a concrete, recognizable object that exists but can't be used — not because something is wrong with it, but because the verb to use it hasn't been invented. 乗る (to ride/board) is N4 vocabulary. Until then, the train sits. The station master's まだ gains an object but doesn't resolve. The mystery shifts from "Where is the train?" to "When can we ride it?" The answer is: when the word exists.

---

### Yamakawa — The Register Shift

This is the scene. The moment the game's social world cracks open.

The player finds Yamakawa in his usual spot — inside the コンビニ, sitting on his chair, eating something. Yamakawa sees Rikizo walk in. He grins.

**Yamakawa conversation (8 lines):**

1. **Yamakawa:** 「よ、りきぞ！天気いいね！」 — "Yo, Rikizo! Nice weather, huh!" *(No です. No ます. For the first time in five days of friendship, Yamakawa talks like a teenager. The いい has no です after it. The ね is casual sentence-final, not polite ね after です. The player should feel something shift — Yamakawa sounds DIFFERENT. He sounds like a person, not an NPC.)*

2. **Rikizo:** 「...え？」 — "...Huh?" *(Rikizo is caught off guard. For a beat. One beat. He's heard polite speech from everyone, always. Yamakawa just broke the pattern.)*

3. **Yamakawa:** 「ん？どうした？」 — "Hm? What's up?" *(どうした — casual past of どうする. Yamakawa doesn't understand why Rikizo paused. To Yamakawa, this is how he's always talked. The formality of the last five days — that was the anomaly, not this. G9 didn't teach Yamakawa casual speech. G9 revealed that he was always casual underneath.)*

4. **Rikizo:** 「...うん、いい天気だね！」 — "...Yeah, nice weather!" *(Rikizo adapts. One beat of surprise, then he matches Yamakawa's register. うん. だ. ね. Three casual markers in one short sentence. Rikizo doesn't fumble — he goes with it. He's a teenager too. This is how teenagers talk. The player has just watched a character change register in real time, guided by a social cue from a friend. THIS is how the game teaches casual speech: not through a grammar box, but through Yamakawa being Yamakawa.)*

5. **Yamakawa:** 「今日も休みだよ。いいね！」 — "Today's a day off too. Nice!" *(休み + だ + よ. Casual copula + emphatic particle. Yamakawa is thriving. He has been liberated from です/ます and he is visibly happier for it. His speech has energy it didn't have before.)*

6. **Rikizo:** 「うん。でも...電車を見た？」 — "Yeah. But... did you see the train?" *(見た — plain past. Rikizo is already using plain forms naturally in casual context. The game doesn't flag this or celebrate it. It just happens. Grammar in context.)*

7. **Yamakawa:** 「電車？ああ、駅にあるね。でも乗れな...」 — "The train? Oh yeah, it's at the station. But we can't ri—" *(Yamakawa tries to say 乗れない (can't ride) and the sentence CUTS OFF. He literally cannot complete the word. The verb doesn't exist. His mouth moves but no sound comes. He blinks.)* 「...まあ、いいか。」 — "...Well, whatever." *(He shrugs it off. He was going to say something about the train but the word dissolved before he could finish. He doesn't notice. He's already moved on. The player notices. The player always notices.)*

8. **Yamakawa:** 「ホテル見た？新しいよ！行こう！」 — "Seen the hotel? It's new! Let's go!" *(行こう — plain volitional, first use in the game. The casual version of ～ましょう. Yamakawa doesn't suggest going politely — he says "let's go!" like a friend dragging you somewhere. And he's pointing toward a new building: the ホテル. New location unlocked.)*

**Design note — the register shift:** This conversation is the most important social scene since Yamakawa's introduction in Day 5. The shift from polite to casual is NOT explained in-game. No tutorial. No grammar popup. Yamakawa just... talks differently. The player, who has been studying G9 in the lesson, recognizes the plain forms. The game trusts the player's knowledge. If the player doesn't recognize the grammar, the English translations are still there — but the *feeling* of the shift is linguistic. Yamakawa sounds like a friend for the first time. That feeling IS the lesson.

**Yamakawa's cut-off word:** The moment where Yamakawa can't say 乗れない is the first time a character has been *interrupted by vocabulary limitations* mid-word. Previously, characters simply didn't attempt sentences they couldn't finish. They routed around missing vocabulary. Yamakawa, in his casual recklessness, tried to say something the world doesn't support yet. The word broke in his mouth. This is deeply, fundamentally wrong. Characters shouldn't know words that don't exist yet. Yamakawa almost said one. The game is glitching at the linguistic level.

### Yamakawa's Appetite — Quest Seed

After the hotel visit (or if the player talks to Yamakawa again later in the day), Yamakawa brings up food. Of course he does.

> **Yamakawa:** 「りきぞ、コンビニのおにぎりはおいしいけど...もう毎日だよ。」 — "Rikizo, the convenience store onigiri is tasty, but... it's every day already."
> **Rikizo:** 「ちがうものを食べたい？」 — "You want to eat something different?"
> **Yamakawa:** 「うん！何か...新しいものがほしい！」 — "Yeah! Something... new!" *(新しい + もの + ほしい. Yamakawa wants new food. He has eaten onigiri every single day since Day 5. He wants variety. This is the most relatable thing he's ever said.)*

**Quest log update:** ◻ やまかわのごはん: 新しい食べ物をさがす

"Yamakawa's Meal: Find new food." The quest is vague — 新しい食べ物 (new food) could be anything. This is the first open-ended quest. The water quest and onigiri quest had specific solutions (drink water, eat onigiri). Mom's quest had a specific item (プレゼント). Yamakawa's quest says "find something new" without specifying what.

**Why it can't complete yet:** The available food items are: おにぎり (コンビニ), パン (Mom's breakfast), and whatever's in the fridge (水, ジュース). None of these is "new" to Yamakawa — he's been in this world as long as Rikizo has. New food requires... new vocabulary. And new vocabulary arrives with new lessons.

**How it will resolve (future days):** Each subsequent lesson that introduces food vocabulary (魚 on Day 11, and further food items in later lessons) creates a potential solution. The first time the player obtains a food item that isn't おにぎり, パン, or water and brings it to Yamakawa, the quest completes. The quest is a rolling reward for future vocabulary — every new food word is a potential quest solution.

**If the player tries existing food:**
> Yamakawa: 「おにぎり？...もう食べた。」 — "Onigiri? ...Already ate that." *(Past. Flat. Uninterested.)*
> Yamakawa: 「パン？...いつも食べてるよ。」 — "Bread? ...Always eating that." *(He rejects both. He wants NOVELTY. The man who ate the same onigiri for three days straight now craves variety. Character growth — of a kind.)*

**Design note — Yamakawa's Appetite as a rolling quest:** This quest is different from the previous three in a critical way: it doesn't have a single predetermined solution. It's a feed-forward hook — it makes future vocabulary personally meaningful. When 魚 arrives on Day 11, the player who has this quest thinks "fish! Yamakawa might want fish!" The vocabulary isn't just a lesson item — it's a quest solution. The quest turns future lessons into loot drops. This is the game's first quest that bridges across multiple days with an open-ended solution set.

**paranoia +1 if the player interacts with Yamakawa again and asks about it:**
> **Rikizo:** 「やまかわ、さっき...何を言った？」 — "Yamakawa, just now... what did you say?"
> **Yamakawa:** 「え？何も言ってないよ。」 — "Huh? I didn't say anything." *(He doesn't remember. Of course he doesn't.)*

---

### The ホテル — New Location

A new building has appeared at the edge of town. Between the デパート and the far end of the street — in a space that was, until today, more void being slowly filled in by the expanding world. The ホテル.

It's taller than the other buildings. Three stories, maybe four. Clean, modern-looking. A small sign above the entrance: 「ホテル」. Not a name — just the word. The building has no proper name. It's just... a hotel.

**Exterior:**
The hotel has a lobby visible through glass doors. A front desk. Plants in the lobby. It looks like it could be in any small Japanese town. Unremarkable. Comfortable. The kind of place a family might stay during Golden Week.

**Since Day 9 gave us 中, the player can enter.**

**Hotel lobby:**

A clean, well-lit lobby. A front desk with a bell. Plants. A seating area with couches. An elevator door (decorative — no floor vocabulary for an elevator yet). Stairs to a second floor (visible but not climbable — no second-floor interior built yet). Soft music.

**Hotel clerk — new NPC:**

The hotel clerk is the first new NPC since the station master. She stands behind the front desk, perfectly composed, radiating professional warmth.

**Clerk conversation (5 lines):**

1. **Clerk:** 「いらっしゃいませ。ホテルにようこそ。」 — "Welcome. Welcome to the hotel." *(ようこそ — a new greeting. Formal, service-oriented. The clerk speaks in the same hyper-polite register as the デパート employee. Service NPCs all sound like this. The contrast with Yamakawa's new casual register is stark.)*

2. **Rikizo:** 「ホテルですか...きれいですね。」 — "A hotel... It's pretty."

3. **Clerk:** 「ありがとうございます。今日はいい天気ですね。」 — "Thank you. Nice weather today." *(天気. Everyone is talking about the weather today. It's the first day anyone CAN. The weather conversation is the universal small talk unlock — every NPC now has something to say about it. This is realistic: Japanese small talk defaults to weather. The game just unlocked the most Japanese conversation topic imaginable.)*

4. **Rikizo:** 「この ホテル は人気ですか？」 — "Is this hotel popular?" *(人気. First use. Rikizo asks the natural question: is this place busy?)*

5. **Clerk:** 「はい、休日はとても人気ですよ。今日もお客さんがいます。」 — "Yes, it's very popular on holidays. We have a guest today too." *(休日 + 人気. The clerk connects the hotel's popularity to the holiday. And she mentions a guest. The player's curiosity should trigger: who's staying at this hotel?)*

**Design note — the clerk:** The hotel clerk is a service NPC, not a named character. She doesn't have a char_* ID or a relationship track. She's functional — she tells the player about the hotel and points them toward the guest. Her register is pure keigo (polite service language), making her the most formal NPC in the game so far. This creates a register spectrum the player can now perceive: Yamakawa (casual) → Mom/Dad (polite-familiar) → Shopkeepers (polite-professional) → Hotel clerk (formal-service). Four distinct register levels, all in one game day.

---

### The Hotel Guest — Vacation NPC

In the hotel lobby's seating area, a man is reading a newspaper (or just sitting, staring at nothing — newspapers require vocab the player may not have). He looks relaxed. He's clearly on vacation.

**Guest conversation (5 lines):**

1. **Guest:** 「あ、こんにちは。」 — "Oh, hello."

2. **Rikizo:** 「こんにちは。ホテルに来ましたか？」 — "Hello. Did you come to the hotel?" *(Obvious question, but Rikizo is a teenager — he states the obvious.)*

3. **Guest:** 「うん、休みだからね。天気がいいから、ここに来ました。」 — "Yeah, it's a holiday, so. Weather's nice, so I came here." *(から as "because" — first NPC use of causal から. And the guest is casually informal: うん, だ, casual から. He's on vacation. He's relaxed. His register matches his mood. Another data point for the player: strangers on vacation can be casual too, not just friends.)*

4. **Rikizo:** 「どこから来ましたか？」 — "Where did you come from?"

5. **Guest:** 「...」 *(Pause.)* 「ここの近くですよ。」 — "...Nearby." *(He can't answer the question properly. Where did he come from? The world outside this town doesn't exist. There is no "somewhere else" to come from. He's a hotel guest with no origin. He pauses because — the player suspects — the answer doesn't exist. Then he deflects: "nearby." The safest answer. The only answer available in a world with no elsewhere.)*

**If player asks again or probes:**
> **Guest:** 「天気がいいですね。休みはいいですね。」 — "Nice weather. Holidays are nice." *(He redirects to weather and holidays. The two new vocabulary categories. He is made of today's vocabulary, literally. He can discuss weather and rest because those words exist today. He cannot discuss his origin because the geography doesn't support it. He is the most distilled example of an NPC who exists entirely within the day's vocabulary set.)*

**If player has high paranoia (≥ 5):**
> Rikizo notices something after the conversation: the guest has no luggage. He's staying at a hotel. On vacation. With nothing. No bag, no suitcase, no... anything. He's sitting in the lobby of a hotel he checked into with no possessions. Rikizo stares for a moment. Then looks away.
> 「...気分がいいです。」 — "...I feel good." *(Rikizo redirects himself. He almost noticed something wrong. He chose not to. 気分. His mood is fine. He's fine. Everything is fine.)*

**paranoia +1 if player examines the guest's area and interacts with the "no luggage" observation.**

---

### 天気 — The Sky Gets a Name

Weather has been implicit since Day 6 (when the sky first appeared with the landscape kanji). The sun has been there. Clouds have drifted. But no one could talk about it. Today:

**Every outdoor location now has ambient weather dialogue.** NPCs comment on it. Objects react to it.

**Town square / street:**
> 「いい天気ですね。」 — "Nice weather." *(The default. Every NPC says some variant of this today. It's the Japanese social default made literal: the weather is the first thing you can talk about when you have nothing else to say. And today, for the first time, everyone has this thing to say.)*

**If the player checks weather on TV first, then goes outside:**
> Rikizo: 「テレビの天気と同じですね。」 — "Same as the TV weather." *(A small moment of environmental consistency — the TV broadcast matches reality. In most games this is trivial. In THIS game, where reality is constructed from vocabulary, the TV and the sky agreeing is mildly reassuring.)*

**Design note — weather as atmosphere:** Weather is cosmetic for now. It doesn't affect gameplay. But it gives NPCs their most natural conversation topic. In later N4 days, weather can become functional (rain prevents certain actions, heat changes NPC behavior). Day-night cycles also arrive in N4 with 朝/夜 vocabulary. For Day 10, it's about naming: the sky has a word now.

---

### 休み — Naming the Vacation

Nine days. Rikizo has been on vacation for nine days. He did not have the word for it. He was just... home. Not going to school (school doesn't exist). Not working (he teaches, but that's the meta-layer). Just existing, day after day, in a house that slowly grew into a town. Now: 休み.

**The significance:** 休み, 休日, 休む — three words built from 休. Rest. Holiday. To rest. Rikizo can now name what he's been doing. He can say 「今日は休みです」 and mean: today is a day off. But every day has been a day off. The word applies retroactively to every day of the game. What changes is awareness — Rikizo knows he's resting. Before, he was just alive.

**Mom uses it to reframe the whole trip:**
> 「休みはいいですね。天気もいいし、気分もいいし。」 — "Holidays are good. Nice weather, nice mood." *(Mom stacks し — "and also" — to build a picture of contentment. The holiday is good. The weather is good. The mood is good. Everything is good. Mom is at peace. This should feel warm on the surface and hollow underneath — everything being good in a world built from nothing is either idyllic or synthetic, depending on how much the player has been paying attention.)*

**Dad (later in the day):**
> 「今日は休日です。明日も休みですよ。」 — "Today is a holiday. Tomorrow is a day off too." *(Dad confirms: the vacation continues. The extended Golden Week. But the player should wonder — when does it end? The lesson title is "Weather & Energy" but the real theme is rest. Rikizo is resting in a world that was built for him to rest in. The vacation might never end. School is two lessons away. Until then: 休み.)*

---

### なる — To Become

なる is the most philosophically loaded verb in the N5.10 set. "To become." "To turn into." In a world where things materialize from vocabulary, なる is the word for what the world does. The void *becomes* ground. The sky *becomes* weather. A sound *becomes* a train. Everything in this game has been なる-ing since Day 1 — the word just didn't exist until now.

The game doesn't draw attention to this. No NPC says 「世界はなりました」(the world became). But the verb appears in natural contexts that the observant player can read as meta-commentary:

- **Mom:** 「りきぞは先生になりましたね。」 — "You've become a teacher, Rikizo."
- **Yamakawa:** 「天気よくなったね！」 — "The weather got good, huh!"
- **Station master:** 「いい日になりましたね。」 — "It's become a nice day."
- **Hotel clerk:** 「人気になりましたよ。」 — "It's become popular."

Every use of なる is innocent. Every use of なる also describes the fundamental mechanic of the game. The world is always becoming. It has been becoming for ten days.

**If player has paranoia ≥ 6:**
> When Rikizo uses なる himself — 「いい天気になった...」 ("It became nice weather...") — there's a pause. A half-second longer than normal. As if the word tastes strange in his mouth. As if "becoming" is something he almost recognizes from the other side. Then the moment passes and he's fine.

---

### Tree-san Update (if befriended)

The tree is in front of the house, as always. The spatial tag from Day 9 persists: 「家の前に木があります。」

**Daily greeting (standard):**
> 「木-さん、おはよう。今日もいい天気だね。」 — "Tree-san, good morning. Nice weather today too." *(Rikizo has gone casual with the tree too. Of course he has. The tree is his closest confidant. If anyone gets casual speech, it's the tree.)*

**If befriended + curiosity ≥ 6:**
> 「木-さん... 休みはいつまでですか？」 — "Tree-san... how long is the holiday?" *(Rikizo asks the tree what he hasn't asked anyone else. When does the vacation end? The tree doesn't answer. It never answers. But the question is in the air now. Rikizo is, for the first time, thinking about the holiday's *end* — which implies a beginning, a duration, a structure. The vacation has been formless. 休み gives it a name. Names imply limits.)*

---

### Running Gags Updated

1. **The Toilet Door** — Status quo. Resolved in Day 9. Dad may or may not be guarding it. No new developments.
2. **Dad's Gold** — Continues. 「だめ！」 Dad's gold is eternal.
3. **Dad's Car** — Evolves. Dad stares at the car AND the train. He owns one and desires the other. Both are unusable for the same reason: 乗る doesn't exist. 「車も電車も...まだです。」 — "The car and the train... not yet."
4. **Tree-san** — Upgraded with casual speech. The relationship deepens.
5. **The Fridge** — Resolved since Day 9. Functional. Contains food. Normal.
6. **The Water Bottle** — Still in inventory. Truly vestigial now.
7. **The Empty Phone** — New message from Yamakawa (casual register). すずき's homework still pending (書く = N5.13).
8. **Yamakawa's Migration** — From wall (Days 5–8) to chair (Day 9) to... still chair. But now he talks different. Same location, transformed character.
9. **Mom's "Come Home"** — 「家に来てくださいね。」 Every day. Unchanged but persistent.
10. **Mom's Kitchen Authority** — Unchanged. She still controls the fridge and the kitchen.
11. **いただきます / ごちそうさまでした** — Day 4 of the ritual. Automatic.
12. **The Station Master's まだ** — Evolves. The train is HERE. The まだ now applies to riding it, not to its existence. The station master's patience has a new object. He sits in the waiting room, next to an idle train, and waits.
14. **The ノート** — Still waiting for 書く (N5.13). The wait grows.
15. **Weather Small Talk** — NEW. Every NPC can now discuss the weather. This is the most Japanese conversation topic possible. The game has unlocked small talk. 「いい天気ですね」 is the new universal greeting. This gag doesn't have a punchline — it's just accurate cultural simulation. Everyone talks about the weather because everyone can finally talk about the weather.
16. **The Hotel Guest** — NEW. A man on vacation with no luggage and no origin. He came from "nearby." He is made of today's vocabulary. He might be the most distilled NPC in the game: a person who exists because the word for his situation (休み) exists. If the word for "where he's from" existed, he might have an answer.
17. **Yamakawa's Broken Word** — NEW. The first time a character tried to say a word that doesn't exist yet. The sentence cut off. He doesn't remember. This is a new category of anomaly: linguistic glitch. Not a missing object or a void — a missing *word* that a character almost said. The game is breaking at the speech level now.
18. **Yamakawa's Appetite** — **NEW QUEST. ◻ やまかわのごはん: 新しい食べ物をさがす.** Yamakawa is tired of onigiri every day and wants something new. First open-ended quest — no specific solution, just "find new food." Each future lesson that introduces food vocabulary creates a potential solution. The quest turns future vocab into loot drops.

---

### State Tracking (Day 10)

**New flags:**
- `saw_train_day10` — Player saw the train at the station.
- `train_doors_tried` — Player tried to interact with the train doors (no response).
- `yamakawa_casual_day10` — Completed Yamakawa's casual conversation. This is a milestone flag — marks the first casual NPC interaction.
- `yamakawa_broken_word` — Player noticed and asked about Yamakawa's cut-off word. +1 paranoia.
- `entered_hotel` — Player entered the ホテル.
- `talked_to_hotel_guest` — Completed guest conversation.
- `guest_no_luggage` — Player noticed the guest has no luggage (paranoia ≥ 5).
- `tv_turned_on` — Player turned on the TV (first toggle interaction).
- `lamp_toggled` — Player toggled the desk lamp (on/off state mechanic established).
- `ekichou_train_holiday` — Heard the station master say the train is "on holiday."
- `yamakawa_appetite_quest` — Yamakawa asked for new food. Quest ◻ やまかわのごはん added to quest log.

**Economy:**
- Wallet: unchanged from Day 9 (no new purchases available today unless they visit existing shops).
- New items: none added to inventory. The ホテル is not a shop.

**Relationships available:**
```
char_taro:     +1 (daily talk), +1 (train conversation — bonding over shared vehicle frustration)
char_sakura:   +1 (daily talk), +1 (morning conversation about 休み)
char_tree:     +1 (daily greeting, if befriended)
char_yamakawa: +1 (daily talk), +2 (completing the full casual conversation — milestone bonus for first casual interaction)
```

**Hidden stats:**
```
paranoia:       +1 (yamakawa_broken_word, if asked about it)
                +1 (guest_no_luggage, noticing hotel guest has nothing)
curiosity:      +1 (entering hotel — new location)
                +1 (trying train doors — investigating new object)
                +1 (turning on TV — new mechanic)
dad_annoyance:  -1 (daily cooling at day start)
```

---

### Art Assets Required (Day 10)

| Asset | Type | Style | Priority | Notes |
|---|---|---|---|---|
| Train on platform | Sprite / BG element | B (MP100) | **Critical** | A passenger train sitting idle on the station tracks. Doors closed. Windows dark. Not in motion — parked. Should look functional but inactive. |
| ホテル exterior | Background | B (MP100) | **Critical** | Hotel building: 3-4 stories, clean modern Japanese business hotel style. Sign reads ホテル. Glass lobby doors. Fits the town's growing aesthetic. |
| ホテル lobby interior | Background | B (MP100) | **Critical** | Clean lobby: front desk with bell, plants, seating area with couches, elevator door (decorative), staircase up. Warm lighting. |
| Hotel clerk | Sprite + portrait | A+B | High | Female clerk behind front desk. Professional, composed. Service-industry posture. |
| Hotel guest | Sprite | A+B | Medium | Male guest sitting in lobby seating area. Relaxed posture. No luggage (deliberately). Casual clothing. |
| Lamp (on/off states) | Sprite | A (Pixel) | Medium | Desk lamp with two states: off (dark) and on (warm yellow glow). First toggleable object. |
| TV (on/off states) | Sprite | A (Pixel) | Medium | TV with two states: off (dark screen) and on (glowing with weather broadcast image). |
| Train timetable (with 電車) | UI element | A (Pixel) | Low | The station timetable board with a single entry: 「電車」. No schedule, no destination. Just the word. |

---

### Open Questions for Day 10

1. **Does weather ever change within a day?** Recommendation: Not yet. Day 10 weather is fixed (nice all day). 雨 (rain) arrives next day (N5.11) — dynamic weather becomes possible then. For now, weather is a conversation topic and a TV broadcast, not a mechanic.

2. **The hotel guest — recurring?** Recommendation: He's there every day from now on. Same spot. Same lack of luggage. Same deflected questions about where he's from. He becomes another quiet anomaly for observant players. He never checks out. He never has bags. He's always "on holiday." On Day 17, when ナナ arrives, she might be the first character to notice him: 「あの人は... 毎日いますね。」 "That person is... here every day."

3. **Should Yamakawa's broken word be repeatable?** Recommendation: No. It happens once, during the initial conversation. If the player replays the conversation (talking to Yamakawa again), the broken word moment is gone — replaced with normal casual dialogue. The glitch was a one-time event. This makes it feel more like a real glitch and less like a scripted moment. Players who weren't paying attention miss it. That's the point.

4. **電気 — do lights ever go out?** Recommendation: Not in Day 10. Lights are toggleable but reliable. In a future Day (maybe N4, when the world starts showing cracks), lights might flicker. Electricity might fail. 電気 stops working. That's a horror beat for later. For now, 電気 is functional and reassuring — you can control the light.

---

## Day 11 — "Sky, Rain & Nature" (unlocked by N5.11: Sky, Rain & Nature)

### Lesson Kanji & Key Vocab Available

**New kanji (4):** 空、雨、花、魚

**Cumulative kanji (70):** All N5.1–N5.10 + above.

**New vocab highlights:**
- Sky: 空 (そら, sky)
- Weather: 雨 (あめ, rain)
- Nature: 花 (はな, flower), 魚 (さかな, fish)
- Compounds: 花火 (はなび, fireworks), 金魚 (きんぎょ, goldfish), 空気 (くうき, atmosphere/air)
- Adjectives: かわいい (cute), きれい (beautiful/clean — na-adjective)
- Grammar: `appearance_sou` (～そうです — "looks like / seems") becomes available at N5.11. Also `attributive_na` (な-adjective + な before nouns, e.g. きれいな花).

**G10 is now in its active reinforcement window.** G10 unlocked after N5.10. This means:
- `polite_past_adj` (かったです / でした) — actively reinforce
- `adverbial` (～く / ～に) — actively reinforce

**G9 plain forms move to sustained use.** No longer in active window but should not be absent.

**Calendar:** 五月七日 (May 7th, Wednesday). Extended Golden Week continues. Still no school.

**Character debut: ゆき.** The quiet nature lover. The only character who gently questions things. She appears for the first time in the game world — not at a building, not at the station. She's standing outside, looking at the sky.

---

### The Day the World Got Beautiful

Ten days of vocabulary have built a functional world. A house with rooms. A town with shops. A station with a train. People with names and relationships. But something has been missing from this world, something that no one noticed because the vocabulary for noticing it didn't exist: *beauty*.

The world has had adjectives. いい (good), 大きい (big), 高い (expensive/tall), 新しい (new), きれい (beautiful — but only as a generic compliment, not attached to natural beauty specifically). The world has had objects to describe. But it hasn't had things that exist *because they are beautiful*.

Today: 花. Flowers. Not functional objects. Not buildings or vehicles or food. Just... flowers. Growing. Being pretty. Existing for no utilitarian reason except that the world is more complete with them.

And 空. The sky has been there since Day 6 when the landscape materialized. The player has looked at it. NPCs have commented on the 天気 (since yesterday). But the sky itself — not the weather it produces, not the function it serves — the sky as a *thing*, blue and vast and above — has not had a name. Today it does. The sky becomes an object of attention, not just a backdrop.

And 雨. Rain. The first weather that isn't nice. For ten days straight, it's been いい天気. Perfect blue sky. No variation. Today, the sky can do something other than be nice. It can rain. The world gains imperfection — and imperfection is beautiful in its own way. The rain on the flowers. The fish in the river. The sky changing its mind. Nature arrives, and nature is messy.

---

### Morning — Rain

Rikizo wakes up. The calendar reads 「五月七日」(May 7th, Wednesday).

Something is different outside the window. The sky — which has been blue every single day since it materialized — is grey. Not void-grey. Cloud-grey. Weather-grey. And there's a sound the game has never made before: a soft, steady patter. Rain on the roof.

**If player looks out the window:**
> 「雨ですか...」 — "Rain..." *(Rikizo's first encounter with non-perfect weather. He doesn't sound disappointed. He sounds thoughtful. The world has been relentlessly pleasant until now. Today it's doing something different. The sky has opinions.)*

**Breakfast with Mom:**

1. **Mom:** 「おはよう、りきぞ。今日は雨ですね。」 — "Good morning, Rikizo. It's raining today." *(Mom states it like information, not complaint. She has never seen rain before — rain has never existed — but she talks about it as if it's a normal Tuesday occurrence.)*

2. **Rikizo:** 「雨ですか...天気がよくなかったですね。」 — "Rain... the weather wasn't good." *(`polite_past_adj` — negative past adjective. G10 reinforcement in the first sentence of the day. Rikizo uses the newly-reinforced form naturally.)*

3. **Mom:** 「でも、花にはいいですよ。」 — "But it's good for the flowers." *(花. Mom mentions flowers before Rikizo has seen them. She knows they're out there. She's always known. The flowers materialized with the rain, but in Mom's world, they've been in the garden forever.)*

4. **Rikizo:** 「花？」 — "Flowers?"

5. **Mom:** 「うん。家の後ろにありますよ。きれいですよ。」 — "Yeah. They're behind the house. They're beautiful." *(家の後ろ — behind the house. The garden area from Day 9 that was visible but empty. Today it has flowers. きれい — the na-adjective gets its defining context. Not "clean." Beautiful. Mom says it with warmth. She's proud of her garden. The garden that appeared overnight. That she has always tended.)*

---

### The Garden — Behind the House

The player walks behind the house to the area that has been a blank space since Day 9 gave us 後ろ. Today:

Flowers. A small, tidy garden. Reds, yellows, whites — small pixel flowers in neat rows. They're wet from the rain. They glisten. The rain falls on them and they look alive in a way that nothing in this game has looked alive before. Objects have existed. Buildings have appeared. But flowers are the first thing in the game world that looks like it *grew*.

**If player examines the flowers:**
> 「花です。きれいな花ですね。」 — "Flowers. Pretty flowers." *(`attributive_na` — first use. きれいな花. The na-adjective modifying a noun directly. The grammar form arrives alongside its perfect example.)*

**If player examines further:**
> 「お母さんの花ですか...」 — "Mom's flowers..." *(Mom claimed them. By mentioning them first, she established ownership. The garden is Mom's domain. It extends her kitchen authority to the outdoors — Mom controls food inside and beauty outside. Dad controls vehicles and gold. The house is a territory map.)*

**A goldfish pond:**

In the corner of the garden: a small ornamental pond. And in the pond — 金魚. Goldfish. Orange specks drifting through dark water. They are absurdly, pointlessly beautiful.

> 「金魚です！かわいいですね！」 — "Goldfish! They're cute!" *(かわいい. The first thing in the game that Rikizo calls cute. Not good, not big, not expensive. Cute. An emotional response to something small and alive. 金魚 = gold + fish. Both kanji taught: 金 from N5.3, 魚 from today. The compound word was waiting for its second character.)*

**If player interacts with the goldfish multiple times:**
> 1st: 「かわいい金魚ですね。」 — "Cute goldfish."
> 2nd: 「何びきいますか...?」 — "How many are there...?" *(Counter: ひき/匹. The player might not have this counter yet, but Rikizo tries.)*
> 3rd: 「金魚は気分がいいですか？」 — "Are the goldfish in a good mood?" *(Rikizo projects mood onto fish. 気分 from Day 10 applied to animals. He's talking to goldfish. He talks to a tree. This is consistent behavior.)*

**Design note — the garden:** The garden is Mom's Tree-san. The tree is Rikizo's impossible friendship. The garden is Mom's impossible creation — a garden that appeared overnight, fully formed, that she tends as if she planted the seeds herself. The garden does not have a relationship system. It's environmental storytelling. Mom has always had a garden. The flowers have always been there. The goldfish have always been goldfish. The rain falls on them and they're beautiful.

---

### The Sky — 空

The sky has been a visual element since Day 6. Today it gets a name.

**If player looks up anywhere outdoors:**
> 「空...」 — "The sky..." *(Rikizo names it. The grey, rainy sky. Not the perfect blue of the last five days. The sky on the day it gets its name happens to be grey. This is either bad luck or poetic timing — the thing you name the moment it stops being perfect.)*

**空気 (atmosphere/air):**
A compound that merges sky (空) with feeling (気). The atmosphere — the mood of a place.

> **In the garden:** 「空気がいいですね。」 — "The atmosphere is nice." *(Rain + flowers + quiet. The garden has an atmosphere. The game's first environmental quality description. Not "there is a garden." The garden *feels* a certain way.)*

> **At the station:** 「空気が...」 *(Rikizo starts to say something about the station's atmosphere and trails off. The station has a different 空気 than the garden. Quieter. Heavier. The train sits there, inert. The station master sits there, waiting. The air itself feels like it's waiting. Rikizo can name this feeling now — 空気 — but he doesn't finish the sentence. The atmosphere at the station resists description.)*

**If player has paranoia ≥ 5:**
> 「この空気は... 何ですか？」 — "This atmosphere... what is it?" *(Rikizo almost questions the ambient wrongness. The station's 空気 — it's not just quiet. It's *heavy*. Something hangs in the air at the station that hangs nowhere else. It's been there since Day 5. Rikizo couldn't name it until today. Now he can almost name it, and it unsettles him for a moment before he moves on.)*

---

### 雨 — The First Bad Weather

For ten days, the weather has been perfect. いい天気. Every NPC confirmed it. The TV broadcast it. The sky was blue and clear and unchanging.

Today it rains.

This is the first time the game world has done something *other* than be pleasant. The void is unsettling, but it's not weather — it's absence. The rain is a presence. It's active. The sky chose to rain. The world has agency it didn't have before.

**Gameplay effect:** The rain is visual and auditory. Rain animation over all outdoor screens. A soft rain sound loop. NPCs reference it. It does not prevent the player from doing anything — you can still walk around, still talk to people, still enter buildings. The rain is atmosphere, not mechanic (same principle as Day 10's weather: visual only until N4 when weather systems have more vocabulary support).

**NPC reactions to rain:**

**Shopkeeper (コンビニ):**
> 「雨ですね。中にどうぞ。」 — "It's raining. Please come inside." *(She invites Rikizo in from the rain. This is the first time an NPC has responded to weather. The world has weather-reactive behavior now.)*

**Yamakawa (inside コンビニ, of course):**
> 「雨だね。外に出たくないよ。」 — "It's raining, huh. Don't wanna go outside." *(出たくない — plain desire negative. Yamakawa doesn't want to go out. He has found his natural habitat: indoors, sitting, eating. The rain gives him an excuse to never leave the コンビニ. He's thrilled.)*

**Station master:**
> 「雨ですか。電車にはいい天気ですよ。」 — "Rain? It's good weather for the train." *(What does that mean? Rain is good weather for a train? A train that doesn't move? The station master says something that sounds like wisdom but makes no sense. Or maybe it makes perfect sense — the train sits in the rain and the rain runs down its windows and the station master watches and it's beautiful and sad and patient, like everything about the station.)*

**Hotel clerk:**
> 「雨の日は人気ですよ。」 — "Rainy days are popular (here)." *(The hotel is popular when it rains. Because people need shelter? Because rain drives people indoors? The clerk says it with professional pride. The hotel has weather-dependent business patterns. In a world where yesterday was the first day weather could be discussed.)*

**Hotel guest:**
> 「雨ですか。...いいですね。」 — "Rain? ...Nice." *(The guest likes rain. He sits in the hotel lobby, luggage-less, origin-less, and says rain is nice. He's the most content person in the game. Nothing bothers him. He has no past to miss, no luggage to carry, no destination to reach. Rain is nice. Everything is nice. He is the most unsettling character in the game because he is perfectly at peace.)*

---

### ゆき — The Nature Girl

The player is walking through the rain. Between buildings, or near the edge of town, or in a spot that doesn't get much traffic. And there's someone new.

A girl. Standing in the rain. Not under an awning, not rushing to shelter. Standing still, face tilted slightly upward, looking at the sky. She's getting wet. She doesn't seem to mind.

This is ゆき.

**First encounter (5 lines):**

1. **Rikizo:** 「...あ。こんにちは。」 — "...Oh. Hello." *(Rikizo notices her. She doesn't notice him first. She's absorbed in the rain. He has to initiate. This is the opposite of every other NPC introduction — Yamakawa called out to him, the shopkeeper welcomed him, the station master greeted him. ゆき is somewhere else. The player walks up to her.)*

2. **ゆき:** 「...こんにちは。」 — "...Hello." *(A beat. She was somewhere in her head. She comes back slowly. Her greeting is quiet, not cold — she's not unfriendly, just... elsewhere. A quality no other NPC has shown. Everyone in this game is present, engaged, performatively social. ゆき is the first character who seems to have an inner life independent of the player.)*

3. **Rikizo:** 「雨ですよ。だいじょうぶですか？」 — "It's raining, you know. Are you okay?" *(Rikizo is concerned. She's standing in the rain. Normal human response.)*

4. **ゆき:** 「うん...空がきれいだから。」 — "Yeah... because the sky is beautiful." *(The sky. The grey, rainy sky. She thinks it's beautiful. Not the blue sky everyone else praised. Not いい天気. The rain sky. She looks up at the clouds and calls them beautiful. This sentence does three things: (a) it uses casual register naturally — ゆき is a peer, she speaks casually; (b) it uses から as "because" (G9 reinforcement); (c) it establishes ゆき as someone who sees beauty where others see inconvenience. The rain that makes Yamakawa not want to go outside makes ゆき want to stand in it.)*

5. **ゆき:** 「...花も雨がすきだよ。」 — "...The flowers like the rain too." *(すき. ゆき says the flowers like the rain. She attributes feelings to nature — the same way Rikizo talks to a tree. But where Rikizo's tree-talking is played for comedy (a boy befriending a tree), ゆき's nature empathy is played straight. She's not being funny. She believes the flowers have preferences. She might be right. In this world, flowers appeared overnight with the vocabulary for them. Who's to say they don't have feelings?)*

**If player talks to ゆき again:**

6. **ゆき:** 「魚も雨がすきだと思う。」 — "I think fish like the rain too." *(と思う — casual quotation. She continues: fish like rain. She's building a picture of a natural world where everything is connected, everything has preferences, everything is alive in its own way.)*

7. **Rikizo:** 「魚...? 川に魚がいますか？」 — "Fish...? Are there fish in the river?" *(There IS a river. Since Day 6 when 川 appeared. Rikizo has never seen fish in it. He's asking: are there fish now?)*

8. **ゆき:** 「うん。見に行こう。」 — "Yeah. Let's go look." *(行こう — plain volitional. ゆき uses the casual "let's go" — the same form Yamakawa used yesterday for the hotel. But ゆき says it differently. Yamakawa's 行こう was excited, energetic. ゆき's is quiet, an invitation. She walks toward the river. The player can follow.)*

**At the river (if player follows):**

Fish. In the river. Silver-grey shapes flickering in the water, visible between the rain-rippled surface. They've always been there, apparently. Fish require the word 魚 to exist, and 魚 arrived today. The river gained inhabitants.

> **ゆき:** 「きれいでしょう？」 — "Beautiful, right?" *(でしょう — G8 conjecture, available since N5.8. ゆき asks if Rikizo agrees: the fish are beautiful. She's sharing something she cares about. This is the start of her character: nature, beauty, quiet attention to things others overlook.)*

> **Rikizo:** 「うん。きれいだね。」 — "Yeah. They're beautiful." *(Casual agreement. Rikizo and ゆき are already speaking casually. They're peers. The register matched instantly, like Yamakawa — but the energy is completely different. Yamakawa's casual is loud. ゆき's casual is soft.)*

**Design note — ゆき's introduction:** ゆき is the anti-Yamakawa. Where Yamakawa is loud, social, always eating, always at the コンビニ — ゆき is quiet, solitary, standing in rain, looking at the sky. She's introduced through nature (rain, flowers, fish) rather than through a building. She doesn't have a "spot" — she's found in transitional spaces, between locations, at the edges. This is her character: she exists at the margins. She notices things at the margins. She's the only NPC who looks at the sky and says it's beautiful when it's grey. She's the only NPC who will, eventually, notice that the world is wrong — not because she's paranoid, but because she pays attention to things that don't demand attention.

---

### ゆき's Quiet Observations

ゆき says things that sound simple but sit differently in the player's mind. She doesn't question the world directly. She observes it with care, and her observations have edges.

**After the river scene, if player talks to ゆき again:**

> 「空気がいつもと ちがうね、今日は。」 — "The atmosphere feels different today, doesn't it?" *(空気. Atmosphere. "Different from usual." ゆき says the air feels different today. She's right — it's raining for the first time. But "different from usual" implies she has a sense of usual. She has expectations about how the world should feel. No other NPC has expectations. Every other NPC accepts each day as it is. ゆき compares today to yesterday. This is the beginning of awareness.)*

**If player has paranoia ≥ 3:**
> Rikizo pauses at this. 「...ちがう?」 — "...Different?" He almost engages with the observation. But ゆき has already moved on, looking at the rain again.

**If player has paranoia ≥ 6 AND talks to ゆき a third time:**
> **ゆき:** 「この花は...いつからありましたか？」 — "These flowers... since when have they been here?" *(She asks. She asks the question. Not aggressively, not fearfully — gently. As if she genuinely doesn't remember the flowers being here yesterday. Because they weren't. They materialized today. ゆき is the first NPC to express uncertainty about the timeline of the world's existence. She's not calling it fake. She's asking when it became real.)*
> **Rikizo:** 「...ずっと前からですよ。」 — "...From a long time ago." *(Rikizo answers without hesitation. The flowers have always been here. He believes this completely. ゆき nods slowly. She doesn't argue. She doesn't push. She accepts his answer. But the player saw her face when she asked. She wasn't sure. She's the first NPC who wasn't sure.)*
> **paranoia +1** for witnessing this exchange.

---

### 花火 — The Promise of Fireworks

花火 = flower + fire. Fireworks. The word arrives with the other 花 vocabulary. But fireworks don't happen during the day in the rain. They're an *event*. A future event.

**Mom brings it up:**
> 「花火がありますよ、今週。」 — "There'll be fireworks this week." *(Mom casually mentions fireworks. A fireworks event. This week. This is the first scheduled community event in the game — something happening in the future that multiple NPCs know about and look forward to. The world has a social calendar now.)*

**Yamakawa confirms:**
> 「花火！行こう、りきぞ！」 — "Fireworks! Let's go, Rikizo!" *(Of course Yamakawa is excited. Of course he wants to go. 花火 is the first thing in the game that is both beautiful AND an event. It combines nature (花) with spectacle (火). Yamakawa has never seen fireworks. He's extremely certain he loves them.)*

**ゆき's reaction (if player mentions fireworks near her):**
> 「花火...空がきれいになりますね。」 — "Fireworks... the sky becomes beautiful." *(なる again. The sky *becomes* beautiful. ゆき sees fireworks as a transformation of the sky — the same sky she stood in the rain admiring. For ゆき, the sky is always the point. Fireworks just add color.)*

**Design note — 花火 as narrative seed:** The fireworks event doesn't happen on Day 11. It's announced. It creates anticipation. The player now has something to look forward to — a future event that multiple characters reference. This is the first time the game has created forward momentum through social planning rather than vocabulary unlocks. The fireworks will happen on a later day (Day 13 or 14, timing TBD). Until then, NPCs mention it, Yamakawa brings it up every conversation, and the anticipation builds. 花火 is a word that arrived before its event.

---

### Yamakawa — Rainy Day Energy

Yamakawa is in the コンビニ. Where else would he be? It's raining. He has zero interest in rain.

**Yamakawa conversation (6 lines):**

1. **Yamakawa:** 「よ、りきぞ。雨だね。外に出たくない。」 — "Yo, Rikizo. It's raining huh. Don't wanna go outside." *(出たくない — plain desire negative. A natural, casual complaint. Yamakawa in his element: indoors, commenting on how much he doesn't want to be outdoors.)*

2. **Rikizo:** 「やまかわはいつもここにいるね。」 — "Yamakawa, you're always here." *(いつもここにいる. Rikizo notices. He says it casually, but the player should catch it: Yamakawa is ALWAYS HERE. コンビニ wall → コンビニ chair → still here. He has migrated zero meters in six days. His entire world is one building.)*

3. **Yamakawa:** 「ここがいちばんいいよ。」 — "This place is the best." *(いちばんいい. Yamakawa has ranked the entire accessible world and concluded that a コンビニ is the peak of civilization. He's not wrong — it has food, shelter, and a chair. What more does a person need?)*

4. **Rikizo:** 「ゆきに会った？」 — "Did you meet Yuki?" *(If the player has already met ゆき. Rikizo asks about the new person in town.)*

5. **Yamakawa:** 「ゆき？ああ、あの子。雨の中にいたよ。」 — "Yuki? Oh, that girl. She was out in the rain." *(Yamakawa knows ゆき already — or at least, he recognized her. NPCs knowing each other before the player introduces them is another subtle wrongness: in a normal story, the player would introduce characters to each other. Here, they already know each other. They always have. Even ゆき, who just appeared today.)*

6. **Yamakawa:** 「ゆきは...ちょっとふしぎだよ。」 — "Yuki is... a little mysterious." *(ふしぎ — "mysterious/strange." If it's in the glossary. If not, Yamakawa might say 「ちょっとちがう」 — "a little different." Either way, Yamakawa has noticed that ゆき is not like the other NPCs. He can't articulate what's different. But he's noticed. Yamakawa, who notices nothing about the void or the materializations or the linguistic limits of reality, has noticed that one person doesn't quite fit. This is character insight that defies his usual obliviousness — Yamakawa is socially perceptive even when he's cosmically oblivious.)*

---

### Dad — The Fish Enthusiast

Dad is home. Looking out the window at the rain with the expression of a man whose car is getting wet and he can't drive it.

**Dad conversation (5 lines):**

1. **Dad:** 「雨ですね。車が...」 — "It's raining. The car..." *(Dad's first thought in rain: the car. His car is outside. In the rain. Getting wet. He can't drive it (乗る still doesn't exist). He can't put it in a garage (no garage vocabulary). He can only watch it get rained on. Dad's suffering is mundane and endless.)*

2. **Rikizo:** 「お父さん、川に魚がいますよ！」 — "Dad, there are fish in the river!"

3. **Dad:** 「魚か！いいですね。」 — "Fish! Nice." *(Dad perks up. Fish interests him. This is new character information — Dad likes fish. Maybe he's a fishing type. Maybe he just likes the idea of something alive in the river. Either way, fish > rain > car worries for Dad.)*

4. **Dad:** 「金魚もいますか？」 — "Are there goldfish too?"

5. **Rikizo:** 「うん、お母さんの庭に。」 — "Yeah, in Mom's garden." *(庭 — garden. If this isn't available as vocab, replace with 「家の後ろに」— "behind the house." Dad nods. He doesn't go see them. He's Dad. He doesn't move.)*

**If player tells Dad about the goldfish pond:**
> Dad: 「金魚は...わたしのですか？」 — "Are the goldfish... mine?" *(Dad immediately attempts to claim the goldfish. The goldfish are in Mom's garden. They are not Dad's. But Dad's instinct — car, gold, toilet — is to claim. Mom will win this territorial dispute, but Dad tried.)*

---

### The Station in Rain

The station in the rain is the most atmospheric location in the game today. Rain runs down the platform roof. The idle train sits on wet tracks, water beading on its windows. The platform is empty except for the station master.

**Station master:**

1. **駅長:** 「雨の日もいい日ですよ。」 — "A rainy day is a good day too." *(The station master finds rainy days good. He finds everything good. He waits in any weather. But today he says something that echoes ゆき — both the station master and ゆき appreciate the non-perfect. Both find beauty or value in rain. They are the game's two characters who look past the surface.)*

2. **Rikizo:** 「電車は...まだですか？」 — "The train... still not yet?"

3. **駅長:** 「まだですよ。でも...雨の後ですね。」 — "Not yet. But... after the rain." *(後. After. The station master gives the most specific timeline he's ever given: after the rain. This is still vague — when does the rain stop? — but it's the first time まだ has been qualified with a condition. Before, it was just "not yet." Now it's "not yet, but after the rain." The train's timeline is tied to the weather. Or maybe the station master is just making small talk. The player can't be sure.)*

**If player asks further:**
> **駅長:** 「雨が止んで... 空がきれいになったら...」 — "When the rain stops... when the sky becomes beautiful..." *(He trails off. He was about to say something conditional — "when X happens, then Y" — but the grammar for conditionals (～たら) isn't available until N4.25. The station master's sentence breaks the same way Yamakawa's did on Day 10. He can't complete the thought because the grammar doesn't exist yet. But unlike Yamakawa, the station master seems aware that he couldn't finish. He pauses. He looks at the rain. He says nothing more.)*
> **paranoia +1** if the player noticed Yamakawa's broken word on Day 10 (`yamakawa_broken_word` flag set) — the pattern repeats.

### What Yuki Remembers — Quest Seed

If the player has met ゆき, followed her to the river, AND witnessed her flower question (paranoia ≥ 6 path), a quiet quest activates at the end of the day. It doesn't trigger from a conversation — it triggers from ゆき's phone message.

**Message from ゆき (evening):**
> 「今日は空がきれいでした。でも...花は前からありましたか？わたしは...わからない。また明日。」 — "The sky was beautiful today. But... were the flowers there before? I... don't know. See you tomorrow."

She asks the question again. In writing this time. Not to Rikizo face-to-face but in a message, alone, to herself as much as to him. She doesn't know if the flowers were there before. She's the only character who has ever expressed uncertainty about the world's history.

**Quest log update:** ◻ ゆきのきおく: ゆきの話を聞く

"Yuki's Memory: Listen to Yuki's story." The quest is passive — it doesn't ask the player to find an item or complete an action. It asks them to *listen*. To pay attention to ゆき over time. To talk to her each day and hear what she says. The quest advances not through mechanical steps but through relationship — higher relationship with ゆき unlocks more of her observations, which become more pointed, which eventually lead to the truth she's circling.

**Why it can't complete in N5:** Yuki's memories require vocabulary and grammar that doesn't exist yet. She needs to describe things she half-remembers — scenes from another timeline, fragments of knowledge that shouldn't exist. The conditional forms (～たら, ～ば), the ability to say "if I remember correctly" (確か), the vocabulary for dreams (夢, N4) and memories (思い出, N4) — none of these exist in N5. ゆき is trying to articulate something the language can't yet express. Her quest is blocked by grammar, not by a missing item. This is thematically perfect: she's the only character aware that the world has limits, and her quest is limited by those same limits.

**Quest progression (across future days):** Each day ゆき appears, talking to her advances the quest. At relationship 4, she shares small observations ("the river was quiet yesterday"). At relationship 6, she asks questions ("do you remember when the road appeared?"). At relationship 8, she describes fragments ("I had a dream about a place with no sky..."). The quest formally completes in N4, when the grammar and vocabulary exist for her to articulate what she remembers. The payoff is the game's deepest lore revelation — but the seed is planted here, on a rainy day, with a girl looking at flowers and asking when they appeared.

**Design note — quest type taxonomy:** By Day 11, the quest log has taught the player four distinct quest types:

| Quest | Type | Obstacle | Resolution |
|---|---|---|---|
| ◻ 水を飲む | Vocab-gated (verb) | Missing verb (飲む) | Learn the word |
| ◻ おにぎりを食べる | Vocab + social | Missing verb (食べる) + NPC block (Yamakawa) | Learn the word + buy your own (買う) |
| ◻ お母さんの買い物 | Spatial | Can't enter building (中) | Learn the word for inside |
| ◻ やまかわのごはん | Open-ended | No specific item — needs "new food" | Future vocabulary = future solutions |
| ◻ ゆきのきおく | Relationship | Needs time + trust + grammar that doesn't exist yet | Listen. Come back. Wait for the language to catch up with the story. |

Each quest type teaches the player something different about how vocabulary, grammar, and the game world interact. The complexity escalates: single word → two words + social → spatial → open-ended → relationship + grammar. By the end of N5, the player has internalized the game's core thesis: everything in this world — including your ability to understand it — is bounded by language.

**Design note — ゆきのきおく as long-term engagement:** This is the game's first "main story" quest seed. The water and onigiri quests were tutorials. Mom's quest was a fetch quest. Yamakawa's is a rolling side quest. ゆき's quest is *the* narrative quest — the one that connects to the central mystery of the game. It won't complete for dozens of game-days. But it starts here, with one quiet question about flowers.

---

**Design note — linguistic fractures:** Day 10 introduced the concept of characters being interrupted by missing vocabulary (Yamakawa's 乗れな...). Day 11 escalates it: the station master is interrupted by missing *grammar*. The sentence structure he needs — conditional ～たら — doesn't exist yet. This is subtler and more disturbing than a missing word. A missing word is a gap in the dictionary. Missing grammar is a gap in the ability to *think*. The station master's thoughts are bounded by the student's progress. His mind can go as far as the grammar lesson has reached, and no further.

---

### ～そうです — The World Looks Like Something

`appearance_sou` (～そうです, "looks like / seems") becomes available at N5.11. This is the first grammar form that describes *appearance* rather than fact. Until now, characters have stated things as true: 「おいしいです」 (it's delicious), 「高いです」 (it's expensive). Today they can say: 「おいしそうです」 (it *looks* delicious).

The distinction matters: ～そうです introduces subjectivity. The speaker isn't stating a fact — they're reporting an impression. This is the first time the game's language can express uncertainty about reality. Not doubt — just the gap between appearance and truth.

**Where it appears naturally:**

**ゆき, looking at the sky:**
> 「雨がやみそうですね。」 — "It looks like the rain is going to stop." *(～そう applied to rain stopping. ゆき reads the weather. She observes and predicts. The first NPC to make a prediction about the near future based on observation rather than declaration.)*

**Yamakawa, looking at food:**
> 「このおにぎり、おいしそうだよ。」 — "This onigiri looks delicious." *(The most natural ～そう usage in any language: food looks good. Yamakawa, the food character, uses the food form. Perfect.)*

**Mom, looking at Rikizo:**
> 「りきぞ、たのしそうですね。」 — "Rikizo, you look like you're having fun." *(Mom observes her son's mood. She doesn't say he IS having fun — she says he LOOKS like he is. This is subtle maternal awareness: she's reading him, not stating.)*

**Design note — ～そうです as worldbuilding:** In a game where the player suspects the world isn't real, a grammar form that separates appearance from reality is loaded. Everything in this world *looks* real. The sky *looks* blue (when it's not raining). The NPCs *look* normal. The town *looks* like a town. ～そうです lets characters describe appearances — and the player can wonder: is the appearance all there is?

---

### The Phone — Messages in the Rain

**Message from やまかわ:**
> 「雨だ。コンビニから出たくない。花火、たのしみだね！」 — "It's raining. Don't wanna leave the convenience store. Looking forward to the fireworks!" *(たのしみ — looking forward to. Yamakawa's message is pure Yamakawa: weather complaint + food location + excitement about a future event.)*

**Message from すずき先生:**
> 「今週の天気はどうですか？名前はまだですか？」 — "How's the weather this week? Have you written your name yet?" *(すずき checks in. She asks about the weather (now answerable!) and the name-writing task (still impossible — 書く = N5.13). The task sits. The notebook sits. Two more lessons.)*

**Message from ゆき (NEW CONTACT):**
> 「今日は空がきれいでした。また明日。」 — "The sky was beautiful today. See you tomorrow." *(ゆき sends a message. She was added to the phone contacts after meeting her. Her message is short, poetic, and slightly melancholy. "The sky was beautiful." Past tense — the day is ending for her. "See you tomorrow." She'll be there. The player now has a reason to find ゆき each day. She's a daily appointment, like the tree.)*

---

### Running Gags Updated

1. **The Toilet Door** — Status quo. Resolved.
2. **Dad's Gold** — Continues. 「だめ！」
3. **Dad's Car** — New dimension: Dad worries about the car in the rain. 「車が雨に...」 He can't protect it. He can't drive it. He can only worry about it. This is the most Dad thing in the game.
4. **Tree-san** — In the rain. If befriended, Rikizo greets the tree: 「木-さん、雨ですね。だいじょうぶですか？」 "Tree-san, it's raining. Are you okay?" The tree is a tree. Trees love rain. But Rikizo asks. Of course he asks. (+1 relationship for daily greeting as always.)
5. **The Fridge** — Normal. Functional. Contains food. Mom's domain.
6. **The Water Bottle** — Still in inventory. With rain falling and a river with fish and a goldfish pond, water is everywhere. The original water bottle is a relic.
7. **The Empty Phone** — Three contacts. Now four: Yamakawa, すずき, and ゆき. The phone is becoming a social network.
8. **Yamakawa's Migration** — Still in the コンビニ. Now with a reason: rain. He doesn't want to go outside. He never wanted to go outside. The rain is an excuse, not a cause.
9. **Mom's "Come Home"** — 「雨ですよ。家に来てくださいね。」 "It's raining. Please come home." Rain gives Mom a reason for her eternal request.
10. **Mom's Kitchen Authority** — Expands to garden authority. The flowers are hers. The goldfish are hers. The garden is her outdoor domain.
11. **いただきます / ごちそうさまでした** — Day 5 of the ritual.
12. **The Station Master's まだ** — Evolves again. "After the rain." A condition. A timeline. The most specific he's ever been. The train sits in the rain and waits.
13. **The ノート** — Still waiting for 書く (N5.13). Two more lessons. すずき asked again.
14. **Weather Small Talk** — Evolves from 「いい天気ですね」 to 「雨ですね」. The conversation topic has a second state. Weather can be good or bad. The world has tonal variety.
15. **The Hotel Guest** — Still there. Still luggage-less. Likes rain. 「雨ですか。...いいですね。」 The most content person in existence.
16. **Yamakawa's Broken Word** — Not repeated. But the station master had a similar linguistic fracture today (grammar-level, not vocabulary-level). The pattern is escalating.
17. **花火 Anticipation** — NEW. Fireworks this week. Every NPC knows about it. Yamakawa is counting down. ゆき is thinking about the sky. The game has its first forward-looking communal event.
18. **ゆき's Questions** — NEW. She asked when the flowers appeared. She's the first NPC to question the timeline of the world. She didn't push. She accepted Rikizo's answer. But she asked. She's the crack in the wall.
19. **Yamakawa's Appetite** — ◻ やまかわのごはん persists from Day 10. Yamakawa wants new food. 魚 arrived today — if the player can obtain fish (future mechanic: fishing or buying), this quest could resolve. But no fish-purchasing or fishing mechanic exists yet. The quest waits.
20. **What Yuki Remembers** — **NEW QUEST (conditional). ◻ ゆきのきおく: ゆきの話を聞く.** If paranoia ≥ 6 and ゆき asked about the flowers, her evening message triggers the quest. The game's first narrative quest — passive, relationship-based, completing in N4. The quest log now carries a mystery alongside its fetch quests.

**Quest log state (end of Day 11):**
> 📋 Quest Log
> ✅ 水を飲む (Day 2 → Day 7)
> ✅ おにぎりを食べる (Day 5 → Day 8)
> ✅ お母さんの買い物 (Day 8 → Day 9)
> ◻ やまかわのごはん: 新しい食べ物をさがす (Day 10 → ???)
> ◻ ゆきのきおく: ゆきの話を聞く (Day 11 → N4) *(conditional — paranoia ≥ 6 only)*

---

### State Tracking (Day 11)

**New flags:**
- `met_yuki_day11` — Player met ゆき for the first time. **Milestone flag** — unlocks ゆき as a daily NPC and phone contact.
- `followed_yuki_river` — Player followed ゆき to the river to see fish.
- `yuki_flower_question` — ゆき asked "since when have the flowers been here?" (paranoia ≥ 6 required). +1 paranoia.
- `saw_garden` — Player visited the garden behind the house.
- `saw_goldfish` — Player interacted with the goldfish pond.
- `dad_claims_goldfish` — Dad tried to claim the goldfish.
- `ekichou_after_rain` — Station master said "after the rain." First conditional timeline for the train.
- `ekichou_grammar_break` — Station master's sentence broke mid-grammar (conditional ～たら). +1 paranoia if yamakawa_broken_word was set.
- `hanabi_announced` — Player heard about the fireworks event.
- `yuki_phone_added` — ゆき added to phone contacts.
- `yuki_memory_quest` — ゆき's evening message triggered the quest ◻ ゆきのきおく (requires `yuki_flower_question` flag). The game's first narrative quest.

**Economy:**
- Wallet: unchanged. No new purchasable items.

**Relationships available:**
```
char_taro:     +1 (daily talk)
char_sakura:   +1 (daily talk), +1 (garden conversation about flowers)
char_tree:     +1 (daily greeting, if befriended)
char_yamakawa: +1 (daily talk)
char_yuki:     +1 (first meeting — initial relationship established at 1, not 0)
               +1 (following her to the river)
```

**Hidden stats:**
```
paranoia:       +1 (yuki_flower_question, if paranoia ≥ 6)
                +1 (ekichou_grammar_break, if yamakawa_broken_word was set)
curiosity:      +1 (saw_garden — new area explored)
                +1 (saw_goldfish — new interaction)
                +1 (followed_yuki_river — following an NPC to a new discovery)
dad_annoyance:  -1 (daily cooling)
```

---

### Art Assets Required (Day 11)

| Asset | Type | Style | Priority | Notes |
|---|---|---|---|---|
| Rain overlay | Animation / VFX | B (MP100) | **Critical** | Rain animation layer for all outdoor backgrounds. Soft, steady rain. First weather VFX in the game. |
| Garden (behind house) | Background | B (MP100) | **Critical** | Mom's garden: neat flower rows (red, yellow, white), a small goldfish pond in one corner. Wet from rain. The first purely beautiful location. |
| Goldfish pond close-up | Sprite / UI | A+B | High | Close-up view when examining the pond: orange goldfish drifting in dark water. Rain ripples on the surface. |
| ゆき sprite | Sprite | A (Pixel) | **Critical** | Girl standing outdoors. Quiet posture, face slightly tilted up. Not expressive — calm. Should feel like she belongs outside, not at a building. |
| ゆき conversation portrait | Portrait | B (MP100) | **Critical** | Soft features, thoughtful expression. Not smiling per se — at peace. Hair wet from rain (in initial scenes). |
| Fish in river | Sprite / animation | A (Pixel) | High | Silver-grey fish shapes visible in the river (from Day 6 川). Flickering movement under rain-rippled water. |
| Grey sky | BG variant / palette | B | High | Overcast sky replacing the standard blue. Rain-grey, not void-grey — distinguishable. Clouds with texture, not flat. |
| Station in rain | BG variant | B (MP100) | Medium | Station platform with rain. Train with water on windows. Wet tracks. Atmospheric and melancholic. |
| Town in rain | BG variant / overlay | B (MP100) | Medium | Town streets with rain. Puddles optional. Wet surfaces. Everything slightly muted compared to sunny days. |

---

### Open Questions for Day 11

1. **When do the fireworks happen?** Recommendation: Day 13 or 14. This gives 2-3 days of anticipation. NPCs mention it each day. Yamakawa gets increasingly excited. The event becomes the first shared social experience in the game.

2. **Does the rain stop during Day 11?** Recommendation: Yes. Partway through the day, the rain clears and the sky goes blue. This creates a before/after: rain → clearing → post-rain beauty. ゆき's prediction (「雨がやみそうですね」) comes true. The station master's "after the rain" gains weight. The first weather change within a single game day.

3. **ゆき's daily location — where is she found?** Recommendation: ゆき is never in the same spot twice. She's found in different outdoor locations each day — near the river, by the tree, at the edge of town, outside the station. The player has to look for her. Unlike Yamakawa (always at the コンビニ), ゆき moves. Finding her each day is a mini-exploration incentive. Her phone message the previous day sometimes hints at where she'll be.

4. **Does ゆき have a relationship track?** Recommendation: Yes. Standard relationship system. Daily talk +1. Following her to places (like the river) +1. Answering her questions honestly (future days) +1. At high relationship (8+), her observations become more pointed and her quest "What Yuki Remembers" becomes available. See GAME_SYSTEMS.md.

5. **Dad and the goldfish — does he actually try to claim them?** Recommendation: Yes, but it's immediately shot down. If the player tells Dad about the goldfish and then talks to Mom: 「お父さんが金魚は自分のだと...」 "Dad said the goldfish are his..." → Mom: 「...金魚はお母さんのですよ。」 "...The goldfish are Mom's." Case closed. Dad doesn't push it. He knows the territorial hierarchy.

6. **空 vs 天気 — do they overlap?** Recommendation: 空 is the physical sky (the thing you look at). 天気 is the weather (the state of the sky). They co-exist naturally: 空 gets a visual description (blue, grey, beautiful), 天気 gets a quality judgment (いい, わるい). NPCs can use both in the same conversation: 「天気はよくないけど、空はきれいですね。」 "The weather isn't great, but the sky is beautiful." This is basically ゆき's entire worldview in one sentence.

---

## Day 12 — "Study & Country" (unlocked by N5.12)

**New kanji:** 本、語、学、校、国

**New vocabulary:**
- 本 (book), 日本 (Japan), 日本語 (Japanese language), 日本人 (Japanese person)
- 学校 (school), 学生 (student), 学ぶ (to learn)
- 高校 (high school), 中学校 (middle school), 大学 (university), 小学校 (elementary school), 校長 (principal)
- 外国 (foreign country), 外国人 (foreigner — polite), 中国 (China)
- クラス (class), テスト (test/exam), ペン (pen), ノート (notebook — re-introduced)
- おもしろい (interesting/funny), つまらない (boring)

**Grammar context:**

**G11 (Appearance ～そうです) enters its active reinforcement window.** G11 unlocked after N5.11. This means:
- `appearance_sou` (～そうです) — actively reinforce. NPCs can now comment on how things *look* rather than just how they *are*.
- The school looks big (大きそうです). すずき先生 looks kind (やさしそうです). The test looks hard (むずかしそうです). These are first impressions — the vocabulary of arriving somewhere new.

**G10 (Adj past + adverbial) remains in active window.** N5.11–N5.12:
- `polite_past_adj` (かったです / でした) — actively reinforce
- `adverbial` (～く / ～に) — actively reinforce

**G9 plain forms in sustained use.** Should not be absent. At least 1 casual conversation.

**Calendar:** 五月八日 (May 8th, Thursday). Golden Week is over. Extended vacation is over. Today is a school day. For the first time in the game, there is somewhere Rikizo is *supposed* to be.

**Character debuts: すずき先生 (in person), けん, リー, ミキ.** Four new named NPCs in one day. This is by far the largest character introduction in the game — intentionally so. School is a social explosion. After 11 days of the same 5–6 characters, Rikizo walks into a building full of people.

---

### The Day the World Got Structure

For eleven days, Rikizo's life has been formless. Wake up, eat, explore, talk to whoever happens to be around, go to bed. No schedule. No obligations. No place he's expected to be at a specific time. Golden Week has been a vacation from a life that — as far as the player has seen — never had structure to begin with.

Today that changes. 学校 materializes, and with it comes the concept of *having to be somewhere*. Not because you want to explore it (like the デパート) or because someone invited you (like the ホテル). Because you're a 高校生 and it's a school day and you go to school. Period.

This is the game's first externally imposed obligation. Every previous day, the player chose where to go and what to do. Today, there is a correct answer to "where should Rikizo be this morning?" For the first time, not going somewhere has a social cost.

The vocabulary cluster makes this day uniquely dense with identity concepts. 日本. 日本語. 日本人. 外国. 外国人. These aren't objects or locations — they're categories. The world has had things (水, 本) and places (店, 駅) and qualities (大きい, 新しい). Now it has *nations*. The concept of "here" and "not here." The concept of "us" and "them." The concept that this world is specifically Japan, not just a town, and that the language Rikizo speaks has a name, and that there are places and people from elsewhere.

For a world that didn't have an outside until Day 5, gaining a national identity is a conceptual earthquake.

---

### Morning — The Last Day of Nowhere to Be

Rikizo wakes up. The calendar reads 「五月八日」(May 8th, Thursday).

Mom is in the kitchen, but she's different today. More purposeful. She's packing something. She has the energy of someone with a schedule.

**Breakfast conversation:**

1. **Mom:** 「おはよう、りきぞ。今日は学校ですよ。」 — "Good morning, Rikizo. Today is school." *(学校. The word exists. It exits Mom's mouth and hits the air and the world reorganizes itself around it. Mom has always known about school. She's been waiting for this word the way she waited for 冷蔵庫 — patiently, as if the thing has always been there and today just happens to be the day it gets mentioned.)*

2. **Rikizo:** 「学校...？」 — "School...?" *(He repeats the word. Not confused — processing. A building he's never seen, a concept he's never encountered, but the word arrives and he knows what it means. He's a 高校生. He goes to 学校. This has always been true. It just hasn't been sayable until now.)*

3. **Mom:** 「すずき先生からのメールを読みましたか？来週からって...今日ですよ。」 — "Did you read すずき先生's email? She said 'from next week'... that's today." *(Mom connects the email thread. 「来週から」 — "from next week" — the phrase すずき sent on Day 6. Six days ago, the unnamed thing that started "next week" had no description. Now it has a name: 学校. Mom is telling Rikizo — and the player — that the mystery of what starts next week has been answered. It was always school. It just couldn't be said.)*

4. **Dad:** 「本を持っていますか？ペンは？」 — "Do you have books? A pen?" *(Dad, practical as ever. 本 and ペン — the tools of school. Dad doesn't ask if Rikizo knows where the school is. He doesn't give directions. In this world, you don't need directions to places that exist. You just... go to them. The path materializes when the destination does.)*

5. **Mom:** 「ノートも持ってくださいね。すずき先生が名前を書いてって...」 — "Please take your notebook too. すずき先生 said to write your name..." *(She trails off. 書く doesn't exist yet — N5.13. Mom can reference the concept — she can gesture toward the act of writing — but she can't complete the instruction. The notebook goes into Rikizo's bag. Its purpose remains deferred. One more day.)*

**Design note — Mom's tone:** Mom isn't surprised by school. She isn't excited. She's matter-of-fact. In her reality, school has always existed and today is a normal school day after a normal Golden Week. The dissonance is entirely on the player's side: they've watched this family live for 11 days with no mention of school, no evidence of school, no building, no teachers, no classmates. And now Mom is acting like it's the most ordinary thing in the world. Because it is. It always was. The word just arrived.

**If player checks phone before leaving:**

すずき先生's email thread now reads differently. The player can scroll back:
- Day 6: 「来週からです。来てくださいね。」 — "From next week. Please come."
- Day 7: 「はい、行きます。」 — Rikizo's reply.
- Day 8: 「新しい本がありますよ。来週、見てくださいね。」 — "There are new books. Please look at them next week."
- Day 9: 「来週の前に、名前を書いてください。」 — "Before next week, please write your name."

Every email now resolves. 「来週からです」 = school starts this week. 「新しい本」 = textbooks. 「名前を書いてください」 = the enrollment form. すずき先生 has been preparing Rikizo for this day since Day 6. She was talking about school before school could be named. She was talking about books before 本 existed. She was asking Rikizo to write before 書く was available. The entire email thread was a woman describing a building that didn't exist, requesting actions that couldn't be performed, for an event that couldn't be named.

And Rikizo said yes to all of it. Without question.

---

### Walking to School — A New Building

Rikizo leaves the house. The town is familiar — road, shops, station, river. But there's something new on the skyline. South of the station, past the park, a building. Large. Institutional. Gated. It has always been there. It just hasn't been *visible* until now.

The walk to school is the first time the game requires the player to go to a specific location for a non-optional reason. Every previous destination was chosen by the player. The コンビニ, the デパート, the ホテル, the river — all optional. All exploration. School is not optional. It's where Rikizo goes because he's a student and it's a school day.

**Walking past familiar NPCs:**

The town NPCs react to Rikizo heading in an unusual direction.

- **Yamakawa** (if player passes the コンビニ): 「おはよう！学校？いいね。」 — "Morning! School? Nice." *(Yamakawa knows about school. Of course he does. Does Yamakawa go to the same school? He doesn't say. He doesn't follow. He stays at the コンビニ. His relationship to school is ambiguous — he knows the word, acknowledges it, but doesn't seem to participate in it. File this for later.)*

- **Dad** (at the gate, if Dad leaves before Rikizo): 「がんばれ。」 — "Do your best." *(One word. No explanation. Dad standing at the gate seeing Rikizo off is a tiny moment, but it's the first time a parent has appeared at a transition point. He's not going with Rikizo. He's sending him out. The family home → school boundary is real.)*

**Approaching the school:**

> The building is larger than the デパート. Two stories — maybe three. Windows in neat rows. A gate with the school name: **[school name in kanji — the player can read 学校 now]**. Cherry trees lining the path (花, from yesterday). Everything looks new. Not "recently built" new — "recently materialized" new. The paint is too perfect. The windows are too clean. There are no scuff marks on the floors. This building appeared today, fully formed, complete with furniture and books and a principal's office. Nobody finds this remarkable.

**Design note — school location:** The school is placed south of the station, establishing a new zone of the map. The town now has clear geography: house (center-north) → town/shops (center) → station (center-south) → school (south). Each zone was unlocked by vocabulary: house (Day 1), town (Day 5), station (Day 5), hotel (Day 10), school (Day 12). The world grows outward from home.

**Design note — the school gate:** The gate is the first mandatory passage point in the game. The player must walk through it. There's no "not going to school" option on Day 12. The game gently but firmly establishes that school is not a side activity. On future days, the player CAN skip school (with consequences — すずき先生 notices, classmates comment), but on Day 12, the narrative requires attendance to introduce the characters and setting.

**At the gate — 校長 (principal):**

A man stands at the gate. Older. Formal posture. He greets every student who walks in. He greets Rikizo.

1. **校長:** 「おはようございます。学生ですか？」 — "Good morning. Are you a student?" *(校長. Principal. His register is the most formal in the game — more formal even than the hotel clerk. He uses おはようございます as an indicator of institutional authority. The school has a hierarchy, and he's at the top.)*

2. **Rikizo:** 「はい、高校生です。」 — "Yes, I'm a high school student." *(高校生. Rikizo identifies himself within the school system for the first time. He's not just a 学生 — he's a 高校生 specifically. The vocabulary gives him a position in an institution.)*

3. **校長:** 「いい学校ですよ。がんばってくださいね。」 — "It's a good school. Please do your best." *(The principal endorses his own school. Of course it's a good school — it materialized today in perfect condition. The "do your best" is a standard Japanese school-gate phrase, as ritualistic as いただきます before a meal.)*

**Design note — 校長 as a non-named NPC:** The principal is a functional NPC like the hotel clerk. No char_* ID, no relationship track. He appears at the gate on Day 12 and occasionally thereafter. His role is institutional — he represents the school's authority, not a personal relationship. His dialogue is generic encouragement. He exists to make the school feel like an institution with layers, not just a classroom with すずき先生 in it.

**The school hierarchy in vocabulary:**
- 校長 (principal) — top of the school
- すずき先生 (teacher) — classroom authority
- 高校生/学生 (student) — that's Rikizo
- 小学校 → 中学校 → 高校 → 大学 — the progression through the education system

All of these words arrive simultaneously. The student hasn't just learned "school" — they've learned the entire educational hierarchy in one day. The game can reference this: a bulletin board in the hallway lists the school types. A display case shows photos of 大学 graduation (all identical, newly materialized, nobody questions this). The education system exists fully formed because the vocabulary for it arrived all at once.

---

### すずき先生 — The Voice Becomes a Person

The hallway is clean. Lockers line one wall. Classroom doors with numbers. Rikizo doesn't know which one is his — but his feet do. He walks to 1-A like he's done it a thousand times. The door is open. A woman stands at the front. She turns.

She's younger than the player might expect from the emails. Mid-thirties, maybe. Warm eyes. A cardigan over professional clothes. She smiles when she sees Rikizo — not a teacher smile (polite, institutional) but a *recognition* smile. She's been emailing this student for six days. She knows him. He's never seen her face.

**すずき先生 — first meeting (6 lines):**

1. **すずき:** 「りきぞさん！来ましたね。よかったです。」 — "Rikizo! You came. I'm glad." *(よかったです — polite_past_adj of いい. G10 reinforcement. She's genuinely relieved. Not because she doubted he'd come — teachers in this world don't doubt students — but because the arrival is meaningful. She's been sending emails into the void for six days. Now the student is here. The abstract has become concrete.)*

2. **Rikizo:** 「すずき先生ですか？メールを読みました。」 — "Are you すずき先生? I read your emails." *(He identifies her by name. He's putting a face to the contact in his phone. The player is doing the same — after six days of text-only interaction, すずき gains a sprite, a portrait, a voice. She is no longer just an email sender.)*

3. **すずき:** 「はい、すずきです。日本語の先生ですよ。」 — "Yes, I'm Suzuki. I'm the Japanese teacher." *(日本語の先生. She teaches Japanese. This is the first use of 日本語 as a subject name — something that can be taught, studied, tested. The language Rikizo has been speaking for 11 days finally has a name. And it's a school subject. And she teaches it. The meta-level is dizzying: a Japanese teacher in a Japanese game teaching Japanese to a character who learns Japanese so the player can learn Japanese.)*

4. **すずき:** 「新しい本がありますよ。これです。」 — "There are new books. These are them." *(She holds up textbooks. 本 — the "new books" from her Day 8 email. They're real now. Physical objects in the game world. The email said「新しい本がありますよ」 — the exact same sentence, word for word. She's been quoting reality before it existed.)*

5. **Rikizo:** 「おもしろそうですね。」 — "They look interesting." *(おもしろそうです — appearance_sou form. G11 active reinforcement. Rikizo's first impression of the textbooks uses the newly unlocked grammar. He's not saying they ARE interesting — he hasn't read them. He's saying they LOOK interesting. The distinction between appearance and reality, encoded in grammar, manifests naturally. Also: おもしろい is new today. The concept of "interesting" didn't exist until this lesson. Learning creates the capacity to find things interesting.)*

6. **すずき:** 「うれしいです！ノートとペンは持っていますか？」 — "I'm happy! Do you have a notebook and pen?" *(She asks about the ノート. This is the Day 9 email callback. She asked Rikizo to write his name in the notebook. He has the notebook. He has a pen now. He still can't write — 書く is N5.13. すずき will discover this gap in a moment.)*

**Design note — すずき先生's register:** すずき is warm but professional. Not as formal as the 校長 (no ございます) but more formal than Mom (no casual particles, no sentence-trailing ね without です). Her register sits precisely between institutional authority and personal warmth — she's a teacher who genuinely cares about her students. She uses ですよ (encouraging) more than ですか (interrogating). She ends sentences with ね (seeking agreement) more often than よ (asserting). She's the first NPC whose register communicates emotional intelligence rather than just social position.

**The ノート moment:**

After the greeting, すずき asks Rikizo to open his notebook.

1. **すずき:** 「ノートに名前を...」 — "In the notebook, your name..." *(She starts the sentence. She's about to say 書いてください — "please write." But 書く doesn't exist. The grammar is there (て-form + ください has been available since N5.5). The vocabulary is not. すずき hits the same wall as every NPC who has tried to reference writing.)*

2. **すずき:** 「名前を...」 — "Your name..." *(She tries again. The sentence won't complete. This is different from Yamakawa's broken 乗れな... on Day 10. Yamakawa was trying to use a conjugation form that didn't exist (potential). すずき is trying to use a verb that doesn't exist. The grammar is available. The word isn't. She can form the request — she just can't finish it because the core verb is missing from the world.)*

3. **すずき:** 「...だいじょうぶです。来週でいいですよ。」 — "...It's okay. Next week is fine." *(She recovers. 来週 — next week. Again. The woman who told Rikizo "from next week" on Day 6 is now pushing the deadline to next week again. It's 来週 all the way down. The task that couldn't be completed before this week can't be completed this week either. The notebook remains blank. 書く arrives tomorrow — N5.13. One. More. Day.)*

**Design note — 書く as the longest deferred action:** The notebook was purchased on Day 8. すずき asked Rikizo to write his name on Day 9. The player has been carrying an empty notebook for four game days. 書く arrives on Day 13 (N5.13). The total wait: five days from purchase to first use. This is the longest a game item has been in inventory without fulfilling its purpose. The pen (also Day 12) joins it — a writing instrument that can't write. Together they represent the most patient Chekhov's gun in the game.

---

### The Classroom

The classroom is a standard Japanese high school room. Desks in rows. A blackboard (チョーク is not a taught word — the chalk is just there, visual). Windows along one wall showing the school yard. すずき先生's desk at the front, covered in papers and books.

**Interactable objects:**

| Object | Interaction | Notes |
|---|---|---|
| すずき先生's desk | 「先生の本がたくさんあります。」 "The teacher has many books." | 本 reinforcement. The desk establishes すずき as an intellectual — she has more books than furniture. |
| Textbook (本) | 「日本語の本です。新しいです。」 "It's a Japanese language book. It's new." | The textbook is the physical manifestation of すずき's Day 8 email promise. 日本語 as a subject appears on the cover. |
| Blackboard | 「学校の...」 (trails off) | The blackboard exists but its purpose (writing/reading) is deferred — 書く/読む vocabulary isn't available. It's a blank surface. Another Chekhov's prop. |
| Empty desks | 「クラスの学生は...三人？」 "The class has... three students?" | Only three other desks are occupied. The class is impossibly small. Rikizo doesn't question this. The player should — where are the other students? Are there other students? Did they just not materialize? |
| Window | 「学校の外は...きれいですね。」 "Outside the school is... pretty." | Looking out the window shows the town from a new angle. The 花 from yesterday are visible. The station is in the distance. Rikizo's world, seen from above for the first time. |
| ノート (in inventory) | 「名前を...まだ...」 "My name... not yet..." | Rikizo tries to use the notebook. Can't. 書く is still missing. The notebook remains the game's most patient inventory item. |

**Design note — class size:** The class has exactly four students: Rikizo, けん, リー, and ミキ. This is absurdly small for a Japanese high school class (typically 30–40 students). The game doesn't explain this. Background NPCs could fill the desks — unnamed sprites sitting quietly — but the *named* class is four people. This parallels the town: a handful of named characters in a world that implies a population but never shows it. The school exists for these four students the way the コンビニ exists for Yamakawa.

**Design note — the blackboard as void:** The blackboard is the classroom's central feature, and it's blank. In a real school, it would have the date, the subject, notes from the previous class. Here, it's an empty surface — because filling it requires 書く. When writing arrives (Day 13), the blackboard will become the first surface in the game to display *written Japanese that the player can read*. The anticipation is built into the empty space.

---

### The Classmates

Three students are already seated when Rikizo enters. Each occupies a distinct position in the room, a distinct social niche, and a distinct relationship with the game's themes. Together with Rikizo, they form a class of four — an absurdly small cohort that nobody finds unusual.

---

#### けん — The One Who Doesn't Study

けん is loud. Not aggressive-loud — joyful-loud. He's the first person to talk to Rikizo, standing up from his desk before Rikizo even sits down. He radiates energy the way Yamakawa radiates appetite.

**けん introduction (5 lines — casual register):**

1. **けん:** 「おう！新しい学生？おれもこの学校だよ！」 — "Hey! New student? I'm at this school too!" *(Casual. けん speaks casually from the first word. おれ, not わたし. だよ, not です. He's the game's second casual NPC after the hotel guest on Day 10, but unlike the guest — a stranger being informally relaxed — けん is casual because he's a peer. Same age, same school, same class. The register communicates equality instantly.)*

2. **Rikizo:** 「はい、りきぞです。」 — "Yeah, I'm Rikizo." *(Rikizo defaults to neutral — not polite, not casual. He's calibrating. This is the player's first peer interaction outside of Yamakawa, and Yamakawa is a special case. けん is a classmate. The social dynamics are different.)*

3. **けん:** 「けんだ。よろしく！勉強はつまらないけど、学校はおもしろいよ。」 — "I'm Ken. Nice to meet you! Studying is boring, but school is interesting." *(つまらない and おもしろい in the same sentence — the two new opinion adjectives deployed as a personality statement. けん has opinions. Strong ones. He thinks studying is boring but school is interesting — meaning he's here for the social experience, not the academics. This one sentence tells the player everything they need to know about けん.)*

4. **Rikizo:** 「おもしろい？」 — "Interesting?"

5. **けん:** 「友だちがいるから！すずき先生もおもしろいよ。テストはつまらないけどね。」 — "Because there are friends! すずき先生 is interesting too. Tests are boring though." *(から as "because" — G9 reinforcement. けど — casual "but." ね — softening. けん's casual Japanese is natural — not a polite sentence with です removed, but genuinely informal speech patterns. He uses から for reasons, けど for contrast, ね for rapport. This is what real casual Japanese sounds like between classmates.)*

**Design note — けん's role:** けん is the game's comic relief at school, the way Dad is comic relief at home. He's not stupid — he's socially intelligent and emotionally generous. He just doesn't care about tests. His function in the narrative is threefold: (1) he makes school feel fun and accessible, countering any anxiety the player might feel about a new institutional environment; (2) he provides reliable casual-register dialogue for grammar reinforcement; (3) in later days, his indifference to studying creates comedy when すずき先生 calls on him and he doesn't know the answer. He's the friend who makes you laugh in class.

**Design note — けん and Yamakawa:** けん fills a similar emotional niche to Yamakawa — upbeat, friendly, always talking. But their relationship to Rikizo is different. Yamakawa is a town friend (outdoor, unstructured, food-centered). けん is a school friend (indoor, structured, socially-centered). The player will naturally compare them. In late N4, they meet each other, and the dynamic is explosive — two extroverts with completely different worlds discovering they have Rikizo in common.

---

#### リー — The One From Elsewhere

リー is sitting quietly, reading a book. She looks up when Rikizo enters but doesn't immediately speak. She waits for すずき先生 to introduce her — she's formal that way. When she does speak, her Japanese is careful, precise, and slightly slower than the other students. Not because she's bad at it — because she's *attentive* to it. She treats Japanese as something to be appreciated, not just used.

**すずき先生 introduces リー:**

1. **すずき:** 「りきぞさん、こちらはリーさんです。中国から来ました。」 — "Rikizo, this is Lee. She came from China." *(中国から — from China. The first mention of another country in the game. 中国 and から together — a person from somewhere that isn't here. The world has had an outside since Day 5 (外), but the outside was just the yard, the town, the area beyond the house. Now the outside includes other countries. Other nations. Places with their own names and their own people.)*

2. **リー:** 「はじめまして。リーです。中国人です。日本語を学んでいます。」 — "Nice to meet you. I'm Lee. I'm Chinese. I'm studying Japanese." *(中国人. 日本語を学んでいます — ている progressive, G8 reinforcement. リー identifies herself by nationality. She's 中国人. This is the first time any character has identified themselves by national origin. Mom is not "日本人" in conversation — she's just Mom. Dad doesn't say "I'm Japanese." The concept of nationality only becomes conversationally relevant when someone from a different nation is present. リー's existence makes nationality matter.)*

3. **Rikizo:** 「日本語がじょうずですね！」 — "Your Japanese is good!" *(The standard compliment. じょうず = skillful. Rikizo gives the expected response. But the player should notice something: Rikizo has been speaking Japanese for 12 days without ever calling it 日本語. He didn't know the language had a name. Now that it does, he can compliment someone's ability in it. The vocabulary creates the capacity for cultural interaction.)*

4. **リー:** 「ありがとうございます。日本語はおもしろいです。漢字はむずかしいですけど...」 — "Thank you. Japanese is interesting. But kanji is difficult..." *(おもしろい applied to the language itself. And 漢字はむずかしい — kanji is difficult. リー is a character who finds the same language the player is learning both interesting and hard. She is, in a very direct way, the player's mirror. She's studying the same thing. She struggles with the same things. The empathy is immediate and intentional.)*

5. **すずき:** 「リーさんは毎日学んでいますよ。いい学生ですね。」 — "Lee studies every day. She's a good student." *(学ぶ — to learn. Active verb. すずき praises リー's work ethic. This contrasts sharply with how she'll describe けん in future interactions.)*

**Design note — リー as 外国人:** リー is the game's first 外国人. Not as a political concept — as a narrative reality. She is from 中国. She is in 日本. She studies 日本語. The vocabulary for her existence — 外国, 外国人, 中国, 中国人, 日本語 — all arrived today. リー could not have been introduced on any earlier day because the words to describe her didn't exist. She materializes alongside the vocabulary that makes her describable. This is the ontological rule applied to identity: you can't be from another country until "other country" is a concept in the world.

**Design note — リー's register:** リー speaks polite Japanese. Not because she's formal — because she's a learner. Learners of Japanese almost universally learn polite forms first and casual forms later (exactly like the player in this game). リー's polite register is a mirror of the player's own skill level. As the game progresses into N4 and リー grows more comfortable, she'll occasionally use casual forms — and each time she does, it'll feel like a breakthrough, both for her character and for the player.

**Design note — リー and the meta:** リー is studying Japanese. The player is studying Japanese. リー finds kanji difficult. The player finds kanji difficult. リー uses polite forms because she learned them first. The player uses polite forms because they learned them first. The parallels are deliberate and unsubtle — but they're never *stated*. No character says "you're just like リー." The mirror works through experience, not exposition.

---

#### ミキ — The One Who Reads

ミキ doesn't look up from her book when Rikizo enters. She's aware — she glances briefly — but she doesn't stop reading. She's the only character in the game whose default state is *doing something other than waiting for the player to interact with them*. Every other NPC stands, walks, or sits idle until the player approaches. ミキ reads.

**ミキ introduction (4 lines):**

1. **すずき:** 「ミキさん。」 — "Miki." *(すずき has to call her name to get her attention. This is a tiny detail but an important characterization choice: ミキ doesn't respond to ambient social cues. She responds to direct address.)*

2. **ミキ:** 「...あ。はい。はじめまして。ミキです。」 — "...Oh. Yes. Nice to meet you. I'm Miki." *(The pause. The "oh." She was elsewhere — in the book. Now she's here. She's polite but brief. She doesn't volunteer information. She doesn't smile performatively. She gives exactly the amount of social interaction required and no more.)*

3. **Rikizo:** 「本が好きですか？」 — "Do you like books?" *(すき — available since N5.7. 本 — new today. Rikizo asks the obvious question. It's a good question — it gives ミキ an opening.)*

4. **ミキ:** 「本はおもしろいです。人より...おもしろいです。」 — "Books are interesting. More interesting than... people." *(She almost says something she shouldn't. The pause before おもしろい is her editing herself. She started to say 人よりおもしろい — "more interesting than people" — but caught herself and softened it to a separate sentence. The comparison grammar (より) isn't available yet (G15, N4.5+), so the sentence splits. Even if the grammar existed, ミキ would self-edit. She's honest but not rude. She just... prefers books.)*

**Design note — ミキ's book:** ミキ is always reading. On Day 12, the book has no visible title (the game can't render written text yet — 書く/読む arrive tomorrow). From Day 13 on, ミキ's book titles become readable and rotate — each one is a real Japanese book at the appropriate level, and talking to ミキ about her book is a recurring interaction that scales with vocabulary. In N4, ミキ's reading interests lead her toward texts about the town's history, which feeds into the larger mystery. She's the game's intellectual thread — the character who discovers things through research rather than observation (ゆき) or social connection (けん).

**Design note — ミキ vs ゆき:** Both are quiet female characters. Both observe things others don't. But their methods are completely different. ゆき notices through *feeling* — she senses that the flowers weren't there yesterday, that the rain changes something, that time works differently than it should. ミキ notices through *reading* — she finds inconsistencies in books, dates that don't add up, records that reference things before they existed. ゆき is intuitive. ミキ is analytical. In N4, they become reluctant allies in the investigation — each contributing evidence the other can't access.

**Design note — the four-student class as a narrative unit:**

| Student | Archetype | Register | Function | Future arc |
|---|---|---|---|---|
| りきぞ | Protagonist | Adaptive (polite default, casual with friends) | Player surrogate | Central to everything |
| けん | The social one | Casual from Day 1 | Comic relief, friendship, casual register practice | Social network expander — knows everyone, introduces new NPCs |
| リー | The learner | Polite (learner default) | Player mirror, cultural bridge, 外国 conceptualization | Grows in confidence, eventual casual speech breakthrough |
| ミキ | The reader | Polite (formal personality) | Mystery thread, intellectual content, book references | Discovers historical inconsistencies, investigator role in N4 |

---

### The First Lesson — 日本語

すずき先生 teaches a class. The subject: 日本語. The game's first formal lesson-within-a-lesson.

This is a meta moment the game doesn't call attention to but the player will feel. すずき先生 teaches Japanese vocabulary. The player is learning Japanese vocabulary. すずき writes words on the board — except she can't write yet (書く, N5.13), so she *says* them and the students repeat. The lesson is oral. It has to be.

**Class scene (brief — this is a montage, not a full conversation):**

すずき先生 stands at the front. The three classmates are seated. She begins.

1. **すずき:** 「今日は日本語の学校の一日目ですね。」 — "Today is the first day of Japanese language school." *(一日目 — first day. She frames the day as a beginning. For the characters, this is the start of the school year. For the player, it's Day 12 of the game. Both are correct.)*

2. **すずき:** 「日本語はおもしろい語ですよ。学ぶのが好きになりますよ。」 — "Japanese is an interesting language. You'll come to like studying it." *(学ぶ — to learn. 好きになる — to come to like. She's optimistic. She's also describing the player's journey.)*

3. **けん** (whispering to Rikizo): 「テストはないよね...？」 — "There's no test... right?" *(けん's first concern. Tests. Always tests. つまらない.)*

4. **すずき:** 「けんさん、聞いていますか？」 — "Ken, are you listening?" *(聞いている — te-form progressive. She caught him whispering. This is the start of a running gag: すずき calling on けん, けん not paying attention, the class quietly amused.)*

**Design note — class scenes in future days:** From Day 12 onward, school is a daily location with a class scene. These scenes serve multiple purposes: (1) they introduce or reinforce vocabulary from the day's lesson in a naturalistic context; (2) they advance classmate relationships; (3) they provide a structured environment for grammar reinforcement (すずき can explain grammar rules in-world, mirroring the lesson content). Class scenes are short — 3–5 dialogue lines — and optional to sit through. The player can arrive at school, attend class (gaining relationship points with すずき and classmates), or skip it and explore the school building. Skipping has no mechanical penalty on Day 12 but accumulates social consequences over time (すずき comments, けん asks where Rikizo was, etc.).

---

### Identity — The World Gets a Name

Sometime during the school day — during class, during break, or during a conversation with リー — the following concepts crystallize:

**日本 (Japan):** The world has a name. This town, this country, this place — it's 日本. For eleven days, Rikizo has been living in a town with no country. There was no nation. No map. No border. Just a town that expanded as vocabulary grew. Now the town is in a country, and that country is Japan, and that fact has always been true but has never been sayable.

**日本語 (Japanese):** The language has a name. Every word Rikizo has spoken — every sentence, every conversation, every email — has been in Japanese. But "Japanese" as a named, identifiable language didn't exist until today. It was just... how people talk. Now it's a subject. A thing you can study. A thing リー came from another country to learn. A thing すずき先生 teaches. The act of speaking has been retroactively categorized.

**日本人 (Japanese person):** Identity has a label. Mom, Dad, Rikizo, the shopkeepers, the station master — they're all 日本人. Not because anything about them changed, but because the word exists and it applies. Before today, there was no word for what they are. They were just... people. Now they're a *kind* of people. The kind that lives in 日本 and speaks 日本語.

**外国 (foreign country):** There is an *elsewhere*. This is the most conceptually radical word of the day. The game world has expanded from a room (Day 1) to a house to a town to a region with a station and hotel. But it has never had an *outside*. 外 (outside) existed since Day 9, but 外 was the yard. 外国 is different. 外国 is a country that isn't here. A place Rikizo has never seen, will probably never see, but that definitively exists. 中国 is a specific example — it's where リー is from. But 外国 as a concept opens the door to *everywhere else*.

**外国人 (foreigner):** And there are people from there. リー is 外国人. The word is polite — it means "person from an outside country," not a pejorative. But its existence implies a category boundary. There are 日本人 and there are 外国人. There is an inside and an outside. There is us and there is them. These categories materialized today, fully formed, along with a person who embodies the distinction.

**Design note — identity vocabulary as a theme:** This is the only lesson in the game where an entire vocabulary cluster is dedicated to national and cultural identity. The game doesn't moralize about this — it doesn't tell the player that categories are good or bad, that borders are real or artificial. It presents the vocabulary and lets the world react. リー is 外国人 and she's a classmate. She's from 中国 and she studies 日本語. The categories exist and the human reality is more nuanced than the categories. This is true of every vocabulary word in the game — the word "rain" doesn't capture the experience of rain — but it's most pointed here, where the words categorize *people*.

**リー and identity — optional conversation:**

If the player talks to リー during break:

1. **リー:** 「日本はきれいですね。中国も大きくてきれいですよ。」 — "Japan is beautiful. China is also big and beautiful." *(大きくて — adverbial te-form connector. G10 reinforcement. リー compares countries. She's not homesick — she's proud of both places. Her 中国 is large and beautiful. Her 日本 is beautiful too. She holds both.)*

2. **Rikizo:** 「中国はどんな国ですか？」 — "What kind of country is China?" *(どんな — what kind of. He asks because he can ask. The word 国 exists. The question is possible.)*

3. **リー:** 「大きい国です。人がたくさんいます。食べ物がおいしいですよ！」 — "It's a big country. There are many people. The food is delicious!" *(She describes her country in terms Rikizo — and the player — can understand. Big, lots of people, good food. Simple vocabulary, complex emotion. She's describing home to someone who has never been there, in a language neither of them was born speaking.)*

4. **Rikizo:** 「おもしろそうですね。」 — "It sounds interesting." *(appearance_sou again — G11 reinforcement. He can't see China. He can only imagine it based on what リー says. So he uses the appearance form: it *seems* interesting. The grammar captures the epistemic gap perfectly.)*

---

### After School — The Walk Home

School ends. Rikizo walks home. The town feels different now — not because anything has changed physically, but because Rikizo's relationship to it has changed. He has a schedule now. He has a place he goes in the morning and a place he returns to in the afternoon. The formless Golden Week life is over. Structure has arrived.

**On the walk home — ゆき encounter (optional):**

If the player takes the long way home (past the river), ゆき is there. She's not at school. She wasn't in the classroom. She doesn't seem to go to school. The player might not notice this today — there's too much else happening — but it should nag at them later. Every teenager in this world goes to school... except ゆき. She's always outside. Always somewhere natural. Never in an institution.

1. **ゆき:** 「学校に行きましたか？」 — "Did you go to school?" *(She asks. She knows about school. She doesn't go. She asks about it the way you'd ask about a foreign country — curious, distant.)*

2. **Rikizo:** 「うん。おもしろかったよ。」 — "Yeah. It was interesting." *(Casual register with ゆき — they're friends after Day 11. おもしろかった — plain past adjective. G10 sustained use.)*

3. **ゆき:** 「学校は...新しそうですね。」 — "The school... looks new." *(新しそう — appearance_sou. G11 reinforcement. She says the school looks new. Because it IS new. It materialized today. But every other character acts like it's always been there. ゆき is the only one who notices that it looks freshly created. She doesn't push the point. She never does. She just observes.)*

**Design note — ゆき doesn't go to school:** This is an intentional absence that will become significant. ゆき is a 高校生-age character who doesn't attend school. No one mentions this. No one asks her why. She exists in the natural spaces of the world — river, park, garden, roadside — never in institutional spaces. In N4, this absence becomes a clue: if ゆき is from another timeline (as her quest suggests), she may not *have* a school here. She may not be registered. She may not be real in the way the other characters are real. Her absence from school is the first structural evidence of this.

**Evening at home:**

Mom asks about school. Dad grunts approval. Standard evening routine — but now with a new topic of conversation.

1. **Mom:** 「学校はどうでしたか？」 — "How was school?" *(The most universal parent question. Mom has been waiting 12 days to ask this.)*

2. **Rikizo:** 「よかったです。すずき先生はやさしそうです。クラスに友だちがいます。」 — "It was good. すずき先生 seems kind. I have friends in the class." *(よかった — past adjective. やさしそう — appearance_sou. This brief report uses three grammar forms naturally: past adjective, appearance, and existential いる.)*

3. **Dad:** 「テストはあるか？」 — "Are there tests?" *(Dad cuts to the functional question. テスト — tests. Dad's concern is performance, not experience. His register is casual-authoritative: あるか without です. Standard Dad.)*

4. **Mom:** 「お父さん...まだ一日目ですよ。」 — "Dear... it's only the first day." *(Mom mediates. As always. The family dynamic holds even with new topics.)*

---

### Phone Updates

**Message from すずき先生:**
> 「今日はありがとう。明日も来てくださいね。本を読んでください。」 — "Thank you for today. Please come tomorrow too. Please read the books."

読む doesn't exist yet (N5.13, same lesson as 書く). すずき asks Rikizo to read the textbooks. He can't. Two verbs — 書く and 読む — both arriving tomorrow, both needed today, both deferred. The textbooks join the notebook as objects with purposes they can't fulfill yet.

**Message from けん:**
> 「今日はおもしろかったね！明日も学校で会おう！」 — "Today was fun, right! Let's meet at school tomorrow too!"

けん sends the first casual text message from a classmate. 会おう — plain volitional of 会う, "let's meet." G9 sustained use. His energy carries into text. He's already planning tomorrow.

**Message from Yamakawa:**
> 「学校？いいよ。おれはコンビニだ。」 — "School? Nah. I'm a convenience store guy."

Yamakawa confirms: he doesn't go to school. He knows it exists. He's chosen the コンビニ. だ — casual copula. G9 sustained use. He doesn't say he *can't* go or *won't* go — he just identifies with the コンビニ. おれはコンビニだ. I am convenience store. It's an identity statement, not an excuse.

**Design note — Yamakawa and school:** Yamakawa's refusal to attend school is played for comedy but has undertones. He's a teenager who spends all day at the convenience store instead of going to school. In a realistic context, this would be concerning. In the game world, it's just Yamakawa being Yamakawa — he's where he wants to be. But the player who thinks about it should wonder: *why* doesn't Yamakawa go to school? Is he a dropout? A truant? Does he have a different role in this world? The answer, like many things, will unfold slowly.

---

### Story Beats

| Moment | What Happens | What Rikizo Thinks | What the Player Should Feel |
|---|---|---|---|
| Mom says 学校 | The word exits her mouth. The building exists. | 「学校...」 | Eleven days of no school, and now it's the most normal thing in the world. Mom isn't even surprised. |
| The email thread resolves | Every すずき email suddenly makes sense | Clarity — and unease | She was describing a building that didn't exist, requesting actions that couldn't be done. And Rikizo said yes to all of it. |
| Walking to school | First mandatory destination | 「行きます。」 | The game has structure now. Freedom contracts. This is what growing up feels like. |
| The school is perfect | New building, no wear, no history | 「きれいですね。」 | Too clean. Too new. Nobody notices. |
| Meeting けん | Loud, casual, immediate friend | Surprised — this is easy | Social warmth. School might actually be fun. |
| Meeting リー | 中国から来ました | 「外国...」 | The world has an outside. Other countries exist. Other people come from them. |
| Meeting ミキ | She's reading. She barely looks up. | 「本が好きですね。」 | Intrigue. She's different from everyone else. What is she reading? |
| すずき can't say 書く | The verb doesn't exist mid-sentence | — | The teacher hit the same wall as every NPC. Even the authority figure can't complete her instructions. |
| ゆき says the school looks new | It does. It materialized today. | 「...うん。」 | She noticed. She always notices. Nobody else does. |
| Yamakawa's text | He's not going to school. コンビニ > 学校. | Amusement | Why doesn't he go to school? |

---

### Running Gags Updated

1. **Dad's "Do Your Best"** — 「がんばれ。」 Dad has graduated from long-winded vague warnings to single-word encouragement. He says it at the gate like a samurai sending his son to war. It's a normal school day.
2. **Mom's "Come Home"** — Now has a counterpart: 「学校に行ってね」 "Go to school." Mom's request portfolio has expanded from one direction (come home) to two (go to school, then come home). She's managing Rikizo's schedule.
3. **The Fridge** — Still accessible. Still opened triumphantly every morning. The fridge never gets old.
4. **Station Master** — Still at the station. Still waiting. School exists now, and the train still goes nowhere. The station master doesn't comment on school. He exists outside of institutional time.
5. **Yamakawa's Appetite** — ◻ やまかわのごはん persists. Yamakawa hasn't found new food. He hasn't gone to school. He's exactly where he was yesterday. The quest waits.
6. **けん and Tests** — NEW. けん's first question in class was about tests. This becomes a daily pattern: すずき announces something, けん asks if there's a test, the class has a moment. つまらない is けん's word. He owns it.
7. **ミキ's Book** — NEW. ミキ is always reading. The title is unreadable until 書く arrives (Day 13). After that, each day's book title is different and tappable. A small mystery: what is she reading, and does it matter?
8. **What Yuki Remembers** — ◻ ゆきのきおく continues. She noticed the school looks new. Another data point. Another quiet observation nobody else makes.
9. **The Empty Notebook** — Day 4 of carrying an empty notebook. すずき asked Rikizo to write his name. He can't. 書く arrives tomorrow. The most patient Chekhov's gun in the game enters its final day of waiting.

**Quest log state (end of Day 12):**
> 📋 Quest Log
> ✓ 水を飲む (Day 5 → Day 5)
> ✓ おにぎりを食べる (Day 5 → Day 8)
> ✓ お母さんの買い物 (Day 8 → Day 9)
> ◻ やまかわのごはん: 新しい食べ物をさがす (Day 10 → ???)
> ◻ ゆきのきおく: ゆきの話を聞く (Day 11 → N4) *(conditional — paranoia ≥ 6 only)*

No new quests on Day 12. The school introduces too many characters and concepts to also add a fetch quest. The narrative load is the quest itself — processing the social explosion of school, meeting three new people, learning that the world has an outside. Quest additions resume when the vocabulary supports mechanical objectives (書く on Day 13 is the obvious candidate: finally writing your name in the notebook).

---

### State Tracking (End of Day 12)

**New locations accessible:**
- 学校 (school) — new zone south of station. Interior: hallway, classroom 1-A, school yard (limited). Additional rooms unlock with future vocabulary (図書室/library = N4, 体育館/gym = N4).

**New NPCs:**
- すずき先生 (`char_suzuki`) — in person. Classroom. Japanese teacher. Warm, encouraging, formal-but-caring register.
- けん (`char_ken`) — classroom. Upbeat classmate. Casual register. Comic relief.
- リー (`char_lee`) — classroom. Exchange student from 中国. Polite register. Player mirror.
- ミキ (`char_miki`) — classroom. Always reading. Polite-minimal register. Mystery thread.
- 校長 — gate. Non-named NPC. Formal register.

**New items:**
- 本 (textbook) — given by すずき先生. In inventory. Can't be read yet (読む = N5.13).
- ペン (pen) — available at school. In inventory. Can't write yet (書く = N5.13).

**Inventory status:**
- ノート (notebook, Day 8) — still blank. 4 days waiting for 書く.
- 本 (textbook, Day 12) — new. Unreadable until 読む.
- ペン (pen, Day 12) — new. Unusable until 書く.
- Three items that require N5.13 vocabulary to use. Tomorrow.

**Flags set:**
- `school_visited` — Player entered the school building. Permanent unlock.
- `met_suzuki_sensei` — すずき先生 met in person (was phone-only since Day 4).
- `met_ken` — First classmate met.
- `met_lee` — First 外国人 character met.
- `met_miki` — Mystery-thread character introduced.
- `attended_class_day12` — Attended the first class scene. +1 relationship with すずき先生.
- `lee_china_talk` — (optional) Heard リー describe 中国. +1 curiosity.
- `yuki_school_new` — (optional) ゆき commented that the school looks new. +1 paranoia (if paranoia ≥ 4).
- `yamakawa_no_school` — Yamakawa's text confirming he doesn't attend school. Seeds future questions.

**Economy:**
- Wallet: unchanged. No new purchasable items. School is free (as it should be).

**Relationships available:**
```
char_suzuki:   +1 (attending class), +1 (talking after class)
char_ken:      +1 (first meeting), +1 (talking during break)
char_lee:      +1 (first meeting), +1 (identity conversation)
char_miki:     +1 (first meeting — this is the hardest +1 in the game; she barely engages)
char_yamakawa: +1 (daily talk, if visited コンビニ)
char_yuki:     +1 (river encounter, if taken)
char_taro:     +1 (daily talk)
char_sakura:   +1 (daily talk), +1 (school report conversation)
```

**Hidden stats:**
```
paranoia:       +1 (yuki_school_new, if paranoia ≥ 4 — she noticed the school is new)
curiosity:      +1 (lee_china_talk — first foreign country described)
                +1 (school_visited — new zone explored)
dad_annoyance:  -1 (daily cooling)
```

---

### Art Assets Required (Day 12)

| Asset | Type | Style | Priority | Notes |
|---|---|---|---|---|
| School exterior | Background | B (MP100) | **Critical** | Two-story building, gate, cherry trees (花 from Day 11), institutional but warm. Too clean — newly materialized. School name readable on gate. |
| School hallway | Background | B (MP100) | **Critical** | Clean hallway with lockers, classroom doors numbered. Bulletin board (content unreadable until 書く). Linoleum floors, fluorescent lights. |
| Classroom 1-A | Background | B (MP100) | **Critical** | Standard Japanese classroom: rows of desks (4 occupied, rest empty), blackboard (blank), windows along one wall showing school yard, teacher's desk at front piled with books. |
| すずき先生 sprite | Sprite | A (Pixel) | **Critical** | Woman, mid-thirties, cardigan over professional clothes. Warm posture. Standing at the front of the classroom or at her desk. |
| すずき先生 portrait | Portrait | B (MP100) | **Critical** | Kind eyes, genuine smile. Younger than expected. Professional but approachable. The face behind 6 days of emails. |
| けん sprite | Sprite | A (Pixel) | **Critical** | Teenage boy, energetic posture, leaning forward or gesturing. School uniform worn loosely. Radiates enthusiasm. |
| けん portrait | Portrait | B (MP100) | **Critical** | Big grin, slightly messy hair. Looks like he's about to say something loud. Friendly and open. |
| リー sprite | Sprite | A (Pixel) | **Critical** | Teenage girl, neat posture, holding a book or sitting attentively. School uniform worn properly. Calm and focused. |
| リー portrait | Portrait | B (MP100) | **Critical** | Thoughtful expression, gentle eyes. Looks like she's listening carefully. Foreign but at home. |
| ミキ sprite | Sprite | A (Pixel) | **Critical** | Teenage girl, always looking down at a book. Seated, slightly hunched over reading. School uniform, glasses optional. |
| ミキ portrait | Portrait | B (MP100) | **Critical** | Serious expression, eyes that suggest she's thinking about something else. Glasses if we go that route. Intellectual energy. |
| School yard | Background | B (MP100) | High | Visible through classroom windows and accessible during break. Small area: trees, bench, fence. |
| Textbook (本) | Sprite / Item | A | Medium | Japanese textbook prop. すずき先生 holds it. Player receives one. Title area intentionally blank (no 書く yet). |
| School gate close-up | BG detail | B | Medium | The gate moment — first mandatory passage. Cherry trees, school name, 校長 standing to one side. |

---

### Open Questions for Day 12

**All resolved:**

1. **Yamakawa's text** → RESOLVED: Simplify. No 方がいい. Use: 「学校？いいよ。おれはコンビニだ。」 Save comparison grammar for G15/N4.5+.

2. **Background students** → RESOLVED: No. Empty desks are the feature. A class of 4 in a school built for hundreds. Nobody mentions it. Mirrors the town — named characters in a world that implies population but doesn't show it.

3. **Skipping school (future days)** → RESOLVED: Subtle social consequences. すずき先生 sends a concerned email. けん asks where Rikizo was. ミキ doesn't notice (reading). リー noticed but says nothing (polite). 3 consecutive skips → Mom intervenes. 5 skips → Dad intervenes (rare serious moment). No game-over state — just relationship penalties and missed classroom scenes.

4. **ミキ's book becomes plot-relevant** → RESOLVED: N4.10+. N5 books are normal school texts / light novels. Shift to historical texts signals investigation. Players who talk to ミキ daily notice the change before any explicit plot flag.

5. **リー's register loosens over time** → RESOLVED: Yes, gradually. ~3–5 lessons behind the player in register comfort (lagging mirror). Mid-N4: occasionally drops です. Late N4: uses けど and plain negatives with friends.

6. **ゆき during school hours** → RESOLVED: Nobody knows. Absent during structured hours, appears in natural spaces during free time. N4 revelation: she gravitates toward newly-created parts of the world — drawn to fresh reality.

### School Schedule Rule

**School is open on weekdays only (Monday–Friday).** The gate is closed on Saturday and Sunday. On weekends, the school building is visible but inaccessible — the gate is shut, the 校長 is absent, and the windows are dark. This means:

- Day 12 (Thursday 5/8) — school open ✓
- Day 13 (Friday 5/9) — school open ✓
- Day 14 (Saturday 5/10) — school **closed** (gate locked, no class scene)
- Day 15 (Sunday 5/11) — school **closed**
- Day 16 (Monday 5/12) — school open ✓

On closed days, school classmates may appear elsewhere in town (けん at the コンビニ with Yamakawa, リー at the 図書室 if it exists, ミキ on a bench reading). すずき先生 is not seen on weekends — she has a life outside school that the player never witnesses.

This creates a natural weekly rhythm: weekdays have structure (school → home), weekends return to the formless exploration of Golden Week. The contrast reinforces that school changed the texture of Rikizo's life — but only five days a week.

---

## Day 13 — "Communication" (unlocked by N5.13)

**New kanji:** 手、言、読、書、話

**New vocabulary:**
- 書く (to write), 読む (to read), 話す (to speak), 言う (to say)
- 電話 (telephone)
- 手 (hand), 空手 (karate)
- ゆっくり (slowly / at ease)

**Calendar:** 五月九日 (May 9th, Friday). Second school day. Last weekday before the first weekend with school in Rikizo's life.

**Grammar context:** No new grammar lessons unlock. G11 (appearance ～そうです) in sustained reinforcement. All prior forms available. The grammar is stable — the vocabulary is the earthquake.

---

### The Day the World Became Literate

For twelve days, nobody in this world could read or write. Not because they were illiterate — because the verbs didn't exist. 書く and 読む arrive today, and they don't just add two actions to the world. They retroactively create the entire concept of written language.

Think about what has been waiting for this day:
- **The notebook** (Day 8) — purchased, carried for five days, blank. すずき先生 asked Rikizo to write his name in it on Day 9. He couldn't. She tried again on Day 12. She couldn't finish the sentence.
- **The textbook** (Day 12) — given by すずき先生. 「読んでください」she'll say today. Yesterday she couldn't.
- **The blackboard** (Day 12) — blank surface in the classroom. Today it gets writing.
- **ミキ's book** — she's been holding it, staring at it, turning pages. Today we learn she's been *reading* it. The action she's been performing has a name.
- **すずき先生's emails** — she's been writing to Rikizo since Day 4. The word for what she was doing didn't exist until now. She was 書く-ing before 書く.

This is the most anticipated vocabulary arrival in the game. Not because writing and reading are exciting actions — they're mundane. But because their absence has been *felt* across five days of accumulating props, deferred instructions, and incomplete sentences. The notebook has been the game's most patient Chekhov's gun. Today it fires.

---

### Morning — The Verb Arrives

Rikizo wakes up. Friday. Second school day. The morning routine is settling into structure — the post-Golden-Week rhythm is forming.

**Breakfast — brief (3 lines):**

1. **Mom:** 「おはよう。学校の本を読みましたか？」 — "Good morning. Did you read the school books?" *(読みました. She says it like she's always been able to say it. The verb exists now, deployed casually in a morning question. Mom doesn't marvel at the fact that she can suddenly reference reading. She just asks. The player, who has watched this family struggle around the absence of 読む for days, should feel the ground shift.)*

2. **Rikizo:** 「まだです...」 — "Not yet..." *(He hasn't. He couldn't — until this morning. But "not yet" implies he will. The verb's existence creates the obligation.)*

3. **Dad:** 「名前を書いたか？」 — "Did you write your name?" *(Dad, cutting to the point. 書いた — plain past. He's asking about the notebook. The task すずき assigned on Day 9. Five days ago. Dad remembers. Of course he does — he's been waiting for 書く as long as everyone else.)*

**The notebook moment — at home, before leaving:**

This can happen at the breakfast table or in Rikizo's room. The player opens the inventory. The notebook is there. It has been there since Day 8. For the first time, an interaction option appears that wasn't there yesterday:

> **[書く]**

The player taps it. The screen shows Rikizo holding the pen (Day 12), opening the notebook, and writing. What does he write? His name. りきぞ. In hiragana — because that's the writing system available. The notebook is no longer blank. After five days, the most patient item in the game has fulfilled its purpose.

**Design note — the weight of 書く:** This moment should feel significant without being melodramatic. No cutscene. No fanfare. Just a quiet interaction: open notebook, write name, close notebook. The weight comes from the accumulated absence — the player has tried to use this notebook before and couldn't. Every NPC who referenced writing hit a wall. Now the wall is gone, and the action is as simple as tapping a button. The gap between the buildup and the simplicity of the act IS the emotional beat. All that waiting, and it's just... writing your name. Of course it is. That's what writing is.

**Design note — what Rikizo writes:** Hiragana only. The game doesn't have a writing minigame (yet — this could be a future feature). The act is abstracted: player taps [書く], the notebook updates to show りきぞ written inside. Simple. Clean. The point isn't the mechanics of writing — it's the fact that writing is now *possible*.

---

### Walking to School — Friday Energy

The walk is shorter narratively today — school is no longer new. The route is established. The gate is open. 校長 is there.

- **校長:** 「おはようございます。今日もがんばってください。」 — "Good morning. Please do your best today too." *(Standard. The principal's dialogue is ritualistic and will vary only slightly day to day. He's furniture with a greeting.)*

**Hallway — the first readable text:**

On the way to the classroom, Rikizo passes the bulletin board. Yesterday it was a blur — shapes that might have been text but couldn't be processed. Today:

> 「お知らせ」 — "Notice"

It's readable. One word on a bulletin board. But it's the first piece of *environmental text* the player can decode. The school has written surfaces — signs, notices, labels on doors — and today they resolve from visual noise into language. Not all of it (many kanji aren't taught yet), but enough that the school feels like a place with *written communication*.

**Design note — environmental text as progressive revelation:** From Day 13 onward, signs and labels in the game world become partially readable. The taught-kanji set determines what the player can decode. A sign reading 「入り口」 (entrance) won't be readable until Day 17 (入, N5.17). A sign reading 「出口」 (exit) same. But 「本」 on a bookshelf label is readable now. The world's text resolves incrementally as the player learns — exactly like real Japan for a learner. This is one of the game's most powerful immersion tools, and it starts today.

---

### Classroom — The Blackboard Speaks

すずき先生 is at the front. The blackboard is no longer blank.

Written on it — for the first time in the game's history — are characters. Not all readable (some kanji are beyond the taught set), but the date is there: 「五月九日」. And the subject: 「日本語」. The blackboard has been activated. The classroom's central surface has been given its function.

**すずき先生 — class scene (5 lines):**

1. **すずき:** 「おはようございます。今日は読むことと書くことを学びましょう！」 — "Good morning. Today let's learn about reading and writing!" *(学びましょう — volitional, G8 sustained use. こと — nominalizer, available since N5.9. The meta is thick: the game is teaching reading and writing on the day the teacher teaches reading and writing.)*

2. **すずき:** 「りきぞさん、ノートに名前を書きましたか？」 — "Rikizo, did you write your name in the notebook?" *(The sentence she couldn't finish yesterday. Yesterday: 「ノートに名前を...」 — she trailed off. Today: 「書きましたか？」 — past tense. The grammar hasn't changed. The verb arrived. If the player wrote the name at home, Rikizo can say yes.)*

3. **Rikizo (if wrote name):** 「はい、書きました！」 — "Yes, I wrote it!" *(Quiet triumph. Five days of carrying a blank notebook. すずき先生 smiles — she assigned this task on Day 9.)*

3b. **Rikizo (if didn't write name):** 「まだ書いていません...」 — "I haven't written it yet..." *(ていません — negative progressive. すずき gives him a moment in class to write it.)*

4. **すずき:** 「みなさん、この本を読んでください。」 — "Everyone, please read this book." *(読んでください. The request she couldn't make yesterday. 読む has existed for approximately two hours and it's already homework.)*

5. **けん:** 「読む...？本はつまらないよ...」 — "Read...? Books are boring..." *(けん, on brand. ミキ, in the background, is already reading. She's been reading since before reading existed.)*

**Classmates — present but distant:**

After すずき's lesson, the player can approach each classmate. But it's the second day of school, and nobody has settled into easy friendships yet. The classroom is a formal space where students perform the role of "being a student." Real connection doesn't happen here — it happens outside.

- **ミキ:** Reading her book. If the player talks to her: 「...。」 *(She doesn't look up. Absorbed. Not rude — private. She has her book. She doesn't need a conversation. The player gets nothing — yet.)*

- **けん:** Slumped over his desk. 「ゲームしたい...」 — "I want to play games..." *(Plain desire form. He doesn't engage. He's not hostile — just bored and doesn't know Rikizo well enough to care. Class is his prison.)*

- **リー:** Polite but brief. 「こんにちは。」 *(That's it. A greeting. She's shy. She spoke yesterday for introductions because she had to. Without that obligation, she retreats.)*

**Design note — the classroom wall:** This is deliberate. Players who expect all classmates to open up immediately will feel the mild resistance of real social dynamics. You can't force friendship by walking up to people. The classroom gives you names and faces but not connection. Connection happens on the walk home — outside the institutional frame, in shared space, when people are going the same direction. This is the Persona pattern: school is the container, but the hallways and walks home are where bonds form.

---

### Communication — The Theme Expands

Beyond 書く and 読む, Day 13 introduces a full communication cluster:

**話す (to speak):** The act of speaking gains a name. Characters have been speaking for 13 days. Now they can talk *about* speaking. 「日本語を話します」— "I speak Japanese." The language that gained a name yesterday (日本語) can now be described as something people *do*.

**言う (to say):** Distinct from 話す. 話す is conversational — you 話す with someone. 言う is declarative — you 言う something specific. The distinction matters for Japanese and for the game: 話す is dialogue, 言う is quotation.

**電話 (telephone):** The phone in Rikizo's pocket has been a texting device. Email, messages, contacts. 電話 gives it a second function — voice calls.

**空手 (karate):** 空 (sky, Day 11) + 手 (hand, today). Empty hand. The martial art. A fun compound — the player knows 空 as "sky" and now learns 手 as "hand," and the combination means something entirely different. Does anyone in the game do karate? Not yet. But the word exists, and perhaps けん mentions it casually — he seems like the type.

**ゆっくり (slowly):** An adverb that transforms conversations. Before today, everything happened at one speed. Now actions can be slow. 「ゆっくり読んでいます」— "I'm reading slowly." 「ゆっくり話してください」— "Please speak slowly." The second phrase is possibly the most useful Japanese sentence for any learner.

**Design note — 「ゆっくり話してください」as a game mechanic:** This phrase could function as an actual game mechanic: when talking to an NPC whose dialogue moves too fast, the player can select ゆっくり話してください to slow the text speed. Both language reinforcement and accessibility. Tag for future implementation.

---

### After School — Walking Home

School ends. It's Friday. The bell rings and the institutional frame dissolves. Students pour out of the gates and scatter along the town's paths. The same classmates who were walls of silence in the classroom are now people walking the same direction as you. This is where connection happens.

**Design note — the after-school unlock pattern:** From Day 12 onward, the after-school walk home is where classmate interactions deepen. Students who blew you off in the classroom are more relaxed outside it. You're not "classmates" on the walk — you're just people heading the same direction. Proximity without obligation. The game teaches this rhythm: approach classmates in school → get minimal response → catch them after school → get the real conversation. This mirrors Persona's social link structure: the classroom shows you who exists, the walk home lets you connect.

**ミキ — at the school gate:**

ミキ is walking slowly, reading her book while she walks. For the first time, her book has a visible title — because 読む exists now and the concept of reading makes book titles displayable.

1. **Rikizo:** 「ミキさん、何を読んでいますか？」 — "Miki, what are you reading?" *(The most natural question in the world, impossible before today.)*

2. **ミキ:** 「...本です。」 — "...A book." *(Minimum answer. She's not rude — she's private.)*

3. **Rikizo:** 「おもしろいですか？」 — "Is it interesting?"

4. **ミキ:** 「おもしろいです。でも、ゆっくり読んでいます。むずかしいから。」 — "It's interesting. But I'm reading it slowly. Because it's difficult." *(ゆっくり — new adverb. から — because, G9. ミキ reads slowly because the book is difficult. First hint she reads above her level — she's reaching for material that challenges her. By N4, the difficulty of what she reads becomes plot-relevant: she's reading historical documents about the town.)*

**Design note — ミキ's book rotation:** From Day 13 onward, ミキ's book title changes every 2–3 game days. Early titles are simple: 「日本の話」(Stories of Japan), 「大きい山と小さい川」(Big Mountains and Small Rivers). By N4, the titles shift toward historical/investigative content: 「この町の前」(Before This Town), 「時間の間」(Between Times). The player who tracks ミキ's reading list will see her interests evolve from casual reading to active research.

**リー — on the path toward town:**

リー is walking home. Without the classroom's pressure, she relaxes.

1. **リー:** 「りきぞさんは日本語を話しますね。わたしも日本語を話します。でも、ゆっくり話します。」 — "Rikizo, you speak Japanese. I also speak Japanese. But I speak slowly." *(ゆっくり — she uses it to describe herself. Careful, not unskilled.)*

2. **Rikizo:** 「リーさんの日本語はじょうずですよ！」 — "Your Japanese is good!" *(A pattern forming — Rikizo encourages リー. This is what friends do.)*

3. **リー:** 「中国語も話しますよ。」 — "I also speak Chinese." *(リー is bilingual. She exists in two linguistic worlds. The player, learning Japanese, might relate.)*

4. **リー:** 「書くのがすきですか？」 — "Do you like writing?" *(She's asking about writing — the new verb — in a personal context. She wants to know if Rikizo writes. Not for school. For connection. This seeds a future interaction: when 手紙 [letter] becomes available, リー and Rikizo can exchange letters. Written communication between friends, in a world where writing just became possible.)*

**けん — running ahead, then waiting:**

けん is already outside. He left first. He's ahead of Rikizo on the road.

1. **けん:** 「ああ、りきぞ！学校はつまらない！」 — "Aaah, Rikizo! School is boring!" *(He's alive again. Free from his desk. Outside, けん is himself.)*

2. **Rikizo:** 「何をする？」 — "What will you do?" *(Plain form — their register is established casual.)*

3. **けん:** 「ゲームだよ！テレビゲーム！」 — "Games! Video games!"

4. **けん:** 「ああ！りきぞ、水を買ってよ！」 — "Hey! Rikizo, buy me some water!" *(買って — te-form of 買う as a casual request. けん wants Rikizo to get him water. He says it like it's nothing — no please, no apology, just an assumption that friends do this. This is the first instance of the BUY-ME-SOMETHING running gag.)*

**Player choice — yes or no:** The player gets a simple dialogue choice. If yes: Rikizo goes to the コンビニ, buys water, delivers it. けん: 「やった！ありがとう！」 (+1 relationship). If no: けん pouts. 「ええ〜。つまらない。」 — "Ehh. Boring." *(He uses his word. Everything he doesn't like is つまらない — books, school, and now Rikizo's refusal. He gets over it instantly. No hard feelings. No consequences. He just pouts for one line and moves on. This sets the tone for all future buy-requests: fulfilling is rewarding, refusing is free.)*

**Design note — the "buy me something" running gag:** From Day 13 onward, classmates and NPCs occasionally ask Rikizo to buy things for them. The pattern reinforces 買う (N5.8) and item vocabulary in a natural, repeatable context. It starts small — けん wants water — and escalates:
- **けん** asks for snacks, drinks, whatever. Always casual. Always unapologetic. Never says please.
- **リー** asks politely for something specific she can't find. Her requests are earnest and she thanks you properly.
- **ミキ** never asks. If you buy something and offer it to her, she's surprised and quietly pleased. (The inverse — she doesn't ask, so choosing to give is more meaningful.)
- **やまかわ** asks once, then insists on paying you back. (He treats it as a transaction, not a favor. He's the friend who never wants to owe anyone.)

The gag works because 買う is available, the コンビニ and デパート are always accessible, and the items use taught vocabulary (水, パン, おにぎり, etc.). The player can fulfill the request immediately or ignore it. No quest-log entry — this is ambient social texture, not a formal task. Small relationship boost (+1) for fulfilling, zero penalty for ignoring.

---

### The Station — The Fetch Quest That Waits

The player visits the station. The 駅長 is there, as always. But something is different today.

The day 読む arrived, the station master felt it. He stands near the bench in the waiting room. Beside him, where nothing was before, there is now an empty rack. A display stand. It looks like it's designed to hold something flat and folded — but it's empty. The station master stares at it.

**Station master interaction (3 lines):**

1. **駅長:** 「何かを読みたいです...でも、わかりません。」 — "I want to read something... but I don't know (what)." *(読みたい — he wants to read. The verb just arrived today and the desire hit him immediately. But わかりません — he literally doesn't know. Not "I can't explain it to you" but "I don't know what it is." The vocabulary gap is HIS, not just the player's. He can feel the want but can't name the object. He gestures at the empty rack.)*

2. **Rikizo:** 「何ですか？」 — "What is it?"

3. **駅長:** 「わかりません...何かがほしいです。ここに。」 — "I don't know... I want something. Here." *(He pats the empty rack. He can't name it because the word doesn't exist yet. But the desire is real. The interaction ends and a **trade window** opens.)*

**The trade window:** After the conversation, a give-item interface appears — the same UI used for delivering quest items. The player can offer anything in their inventory: 水, パン, おにぎり, 本. The station master examines each offering, then shakes his head gently:

- **Most items:** 「...いいえ。これじゃないです。」 — "No. It's not this."
- **本 (book):** 「本...いいえ。本じゃないです。でも...にていますね...」 — "A book... no. It's not a book. But... it's similar..." *(にている — te-form of 似る. The closest he can get to describing a newspaper without the word. A book is LIKE the thing he wants, but not it. This is the best hint the player gets — flat, readable, not a book. What else is there?)*

Nothing works. Nothing CAN work — the item doesn't exist in the game's vocabulary yet. Every subsequent visit, the player can re-open the trade window and try again. Same result until N5.18. The station master never gets frustrated. He never stops wanting. He just shakes his head gently and waits. He doesn't even look disappointed — he looks like a man who has been waiting his whole life and has made peace with it.

**Design note — the trade window as a teaching tool:** The trade window does two things simultaneously. First, it gives the player agency — you're not just watching a cutscene, you're actively trying to solve a problem. The failure feels interactive, not scripted. Second, it teaches item vocabulary through negative reinforcement: every item you offer, you see its name, you see the station master reject it, and you narrow the possibility space. By the time 新聞 appears at N5.18, the player has mentally catalogued everything it ISN'T. The word arrives into a shaped absence.

**Quest log entry:**

> ◻ 駅長の「???」: 駅長は何かを読みたいです。でも、何？ (Day 13 → ???)

The quest sits in the log. The player can't complete it because neither they nor the station master know what he wants. The word 新聞 doesn't exist until N5.18 — five days away. The quest marker stays, unresolvable. Every visit, the empty rack is there. The trade window is always available. The station master always shakes his head.

**Day 18 resolution (forward reference):** When 新聞 (newspaper) arrives at N5.18, the quest becomes completable. The player buys a 新聞 at the コンビニ (買う, N5.8) and brings it to the station. The station master receives it. He unfolds it. He sits down on the bench. He reads.

A man who has been waiting since Day 5. Who has said まだ to everything. Who watched the train arrive and couldn't ride it. Who sat in an empty waiting room through rain and sun. Now he has something to do while he waits. He reads the newspaper. It's the most mundane, human, beautiful completion of any quest in the game. The train still doesn't move. He still waits. But now he has something to read. The station feels less empty. A newspaper rack, filled. A bench, occupied by a man reading. The station has life.

**Design note — wait-to-complete quests:** This is the game's second major deferred quest (after the notebook, Day 9 → Day 13). But where the notebook quest was deferred by a missing VERB (書く), this one is deferred by a missing NOUN (新聞). The player has all the tools — 買う (buy), the コンビニ (store), the trade window (delivery interface). What they lack is the WORD for the object. The vocabulary gap IS the game mechanic. And unlike the notebook quest (which was passive — you just waited for 書く), this quest is ACTIVE. The trade window invites you to keep trying. You offer 水. No. パン. No. 本. "Similar, but no." Every failure teaches you what it isn't. When 新聞 finally unlocks at N5.18, the player doesn't learn a new action — they learn a new THING. And they already know exactly what to do with it, because they've been trying to do it for five days. Buy newspaper, open trade window, offer it. He takes it. He reads it. Done. The delay makes the completion feel earned — and the payoff is a man quietly reading the paper. No fanfare. Just life.

**Design note — the rack as environmental storytelling:** The empty newspaper rack persists in the station from Day 13 onward. It's the visual equivalent of the station master's まだ — something that should be full but isn't. Before Day 18, the player can examine it: 「何かのラック...でも、何もないです。」 ("Some kind of rack... but nothing.") After Day 18, the rack has newspapers in it. One small object, resolved. The station feels incrementally more like a real station.

---

### Evening

Standard evening routine. Rikizo reports his day using the new communication verbs.

1. **Mom:** 「今日は何を学びましたか？」 — "What did you learn today?"

2. **Rikizo:** 「読むことと書くことです。名前も書きました。」 — "Reading and writing. I also wrote my name." *(The notebook task — completed. Reported to Mom. The thread that started on Day 9 closes cleanly. Name → notebook → pen → 書く → done.)*

3. **Mom:** 「よかったですね！すずき先生に言ってくださいね。」 — "That's great! Please tell すずき先生." *(言って — te-form of 言う. Communication verbs in a communication chain: Mom → Rikizo → すずき.)*

**Phone updates:**

**すずき先生:**
> 「今日はよく読みましたね。来週もがんばりましょう！」 — "You read well today. Let's keep trying next week!"

来週 — next week. すずき先生's recurring temporal anchor. Benign this time — just "see you Monday."

**Design note — けん's Saturday invite deferred.** けん does NOT text tonight. He doesn't have the temporal vocabulary to invite Rikizo anywhere (no 明日). Instead, his Saturday invitation arrives at the start of Day 14 as a morning phone message: 「りきぞ！ゲームしない？」 — "Rikizo! Wanna play games?" This makes the invite a Day 14 hook rather than a Day 13 loose end.

---

### Story Beats

| Moment | What Happens | What the Player Should Feel |
|---|---|---|
| [書く] appears on the notebook | Five days of waiting. One tap. Name written. | Quiet satisfaction. The longest-deferred action, resolved simply. |
| Mom says 読みましたか | She uses the verb like it's always existed | The ground shifts — literacy is retroactive |
| Blackboard has writing | Date and subject visible for the first time | The classroom gained its purpose overnight |
| すずき finishes her sentence | 「名前を書きましたか？」 — yesterday she couldn't | Relief. She's been waiting too. |
| Classmates blow you off | In the classroom, they're distant | Mild frustration. You can see them but can't reach them. |
| Classmates open up outside | Walking home, they're themselves | Social reward. Connection happens in shared movement, not shared space. |
| ミキ was reading all along | The action has a name now | The action existed before the verb. Or did it? |
| Station master's empty rack | He wants something he can't name | Curiosity. A quest you can't solve. Yet. |
| けん asks you to buy water | Casual, unapologetic | Funny. Relatable. The start of a running gag. |
| Environmental text resolves | Signs, labels, book titles — partially readable | The world just got richer. |

---

### Running Gags Updated

1. **けん and Tests** — 「テストは？」 — he asks in class. すずき says not today. けん celebrates.
2. **ミキ's Book** — NOW READABLE. Title visible for the first time. Day 1 of the book rotation mechanic.
3. **The Empty Notebook** — ✓ RESOLVED. Five days, resolved with the quietest moment. The pen now works, opening future writing interactions.
4. **Buy Me Something** — NEW. けん asks Rikizo to buy water. First instance of the recurring buy-request gag. Will escalate across classmates.
5. **Station Master's ??? Quest** — NEW. He wants something to read. The word doesn't exist. The empty rack waits. Resolves at N5.18 (新聞).
6. **Station Master's まだ** — Continues, with a new dimension. He's not just waiting for the train — he's waiting for his newspaper. But he can't say that yet.

**Quest log state (end of Day 13):**
> 📋 Quest Log
> ✓ 水を飲む (Day 5 → Day 5)
> ✓ おにぎりを食べる (Day 5 → Day 8)
> ✓ お母さんの買い物 (Day 8 → Day 9)
> ◻ やまかわのごはん: 新しい食べ物をさがす (Day 10 → ???)
> ◻ ゆきのきおく: ゆきの話を聞く (Day 11 → N4)
> ✓ ノートに名前を書く (Day 9 → Day 13) ← RESOLVED
> ◻ 駅長の「???」: 駅長は何かを読みたいです。でも、何？ (Day 13 → N5.18) ← NEW

The notebook quest was the game's first *implicit* quest — one that existed in the player's mind before the game could articulate it. The station master quest is the game's first *wait-to-complete* quest — one where the player can see the problem but lacks the vocabulary to solve it. Two different kinds of deferred satisfaction, five days apart.

---

### Evergreen Locations & Time Mechanics

**コンビニ and デパート as evergreen locations:** From Day 8 (コンビニ) and Day 7 (デパート) onward, these locations are always available. They are the game's "shopping layer" — places where vocabulary becomes tangible through purchase. Items expand as vocabulary unlocks. The buy-me-something gag reinforces this loop: classmate asks → player visits store → buys item → delivers → relationship builds. These are infrastructure, not one-time events.

**Design note — Persona 5 time-slot mechanic (N4 design target):** In N4, when 朝 (morning), 昼 (afternoon), 晩 (evening), and 放課後 (after school) arrive as vocabulary, the game implements structured time management. Each slot allows visiting one location or doing one activity. Morning = school (mandatory). After school = free. Evening = home and nearby. This transforms the game from "walk everywhere in a single timeline" to "choose what to do with limited time." NOT implemented in N5 — time vocabulary doesn't exist yet (朝/晩 are N4). But the architecture should be designed now: every location and NPC interaction taggable with a time slot for N4 activation. Station master = all day. School = morning. Walk home = after school. コンビニ = any time. When the Persona time system goes live, existing content slots in without redesign.

---

### State Tracking (End of Day 13)

**No new locations.** School is still the newest zone.

**No new NPCs.** All school characters debuted yesterday.

**Inventory updates:**
- ノート — no longer blank. Contains りきぞ in hiragana. Status: fulfilled.
- 本 (textbook) — now readable (partially). すずき assigned reading.
- ペン — now usable. Writing is possible.

**Flags set:**
- `wrote_name_home` — (optional) Player wrote name before school. +1 relationship すずき.
- `wrote_name_school` — (fallback) Player wrote name during class.
- `notebook_complete` — Notebook quest resolved. 5-day thread closed.
- `blackboard_active` — Classroom blackboard now displays text.
- `miki_book_day1` — First readable ミキ book title logged.
- `miki_after_school` — (optional) Talked to ミキ on the walk home. +1 relationship ミキ.
- `lee_bilingual` — (optional) Learned リー speaks two languages. +1 curiosity.
- `lee_writing` — (optional) リー asked if Rikizo likes writing. Seeds letter exchange arc.
- `ken_buy_water` — (optional) けん asked Rikizo to buy water. First buy-request gag.
- `ken_buy_water_fulfilled` — (optional) Player bought and delivered water. +1 relationship けん.
- `ekichou_newspaper_quest` — Station master quest started. Empty rack observed. Resolves N5.18.
- `env_text_active` — Environmental text resolving. First readable sign seen.

**Hidden stats:**
```
curiosity:      +1 (lee_bilingual)
social:         +1 (any after-school classmate conversation)
```

---

### Art Assets Required (Day 13)

| Asset | Type | Style | Priority | Notes |
|---|---|---|---|---|
| Blackboard with text | BG variant | B (MP100) | **Critical** | Classroom 1-A blackboard with 「五月九日」and「日本語」in chalk. First written text in the game. |
| Notebook with name | UI / Item | A (Pixel) | **Critical** | Notebook interior showing りきぞ in hiragana. The payoff image. |
| Bulletin board (readable) | BG detail | B | Medium | Hallway bulletin board with partially readable notices. Some kanji clear, others blurred. |
| ミキ's book cover | Sprite detail | A | Medium | Book in ミキ's hands with a readable title. First of the rotating book covers. |
| Station newspaper rack (empty) | BG detail | A | Medium | Empty display rack beside the station bench. Sized for newspapers but visibly empty. Persists until Day 18 when it fills. |

Light asset day — most environments were built for Day 12. Day 13 is variant art (blackboard filled, notebook interior) plus one new prop (empty rack).

---

### Open Questions for Day 13

1. ✅ **Station master's rack — resolved.** He says わかりません (he doesn't know what he wants), then a trade window opens. Player can try offering any item. 本 gets the closest response: 「にていますね...」("it's similar..."). Everything else is a gentle 「これじゃないです」. Trade window reopens every visit until N5.18.

2. ✅ **Buy-me-something refusal — resolved.** Player can say no. けん pouts:「ええ〜。つまらない。」 Gets over it instantly. No consequences. Fulfilling = +1 relationship, refusing = nothing.

3. **けん's Saturday invite** — Deferred to Day 14 morning phone message: 「りきぞ！ゲームしない？」 Avoids temporal vocabulary (no 明日). Seeds Day 14 activity.

4. **Station master quest — intermediate hints?** Between Day 13 and Day 18, the trade window IS the hint. No additional dialogue needed. The player's repeated failures with the trade window build the shaped absence that 新聞 fills. His patience is the design.

---

## Day 14 — "Quantity & Space" (unlocked by N5.14)

**New kanji:** 少、多、白、間

**New vocabulary:**
- 多い (many), 少ない (few/scarce), 少し (a little), 多分 (probably)
- 白い (white), 白人 (caucasian)
- 時間 (time/duration), 間 (between/space)
- 少年 (boy), 少女 (girl)
- たいてい (usually), ぜんぜん (not at all)

**Calendar:** 五月十日 (May 10th, Saturday). First weekend since school started. School gate closed. No class scene. The world exhales.

**Grammar context:** No new unlocks. All forms in sustained reinforcement. Lean vocabulary day — expansion, not revolution.

---

### The First Weekend Off

Saturday. The gate is closed. The 校長 is not there. The windows are dark. The school exists but is inaccessible — the first time a location in the game has *visiting hours*. Everything else (コンビニ, 駅, デパート, river) is always open. School has boundaries. Institutions have schedules. The world just taught the player the concept of "closed."

This is a breathing day. After the narrative density of Days 12 (school explosion) and 13 (literacy revolution), Day 14 is intentionally lighter. The new vocabulary is descriptive — quantities, qualities, frequencies. Words that modify the world rather than restructure it. 多い doesn't create something new; it lets you say there's a lot of something that already exists. 少し doesn't build a building; it lets you say the portion is small.

The emotional tone is relaxation. けん's house. Yamakawa at the コンビニ. ゆき somewhere in nature. The formless weekend life that Rikizo lived during Golden Week, but now it feels different — because he knows it's temporary. Monday exists. School will reopen. The freedom has a frame.

---

### Morning — Slow Saturday

**Phone message from けん** (first thing):
> 「りきぞ！ゲームしない？」 — "Rikizo! Wanna play games?"

けん's Saturday invite. No temporal vocabulary needed — no 明日, no 朝. Just a direct question: do you want to play? The player can respond or ignore. This is the Day 14 activity hook.

1. **Mom:** 「今日は学校がありませんよ。ゆっくりしてくださいね。」 — "No school today. Please take it easy." *(ゆっくり — from yesterday. Mom uses it as an instruction: be slow. Relax. The word for slowness arrived yesterday; today it becomes a lifestyle instruction.)*

2. **Dad:** 「時間がたくさんある。」 — "There's lots of time." *(時間 — new. Dad's first philosophical observation. Time, which has been unnamed until today, exists as a measurable quantity. And today there's a lot of it. Dad says this plainly. It's either profound or incredibly lazy. With Dad, it's both.)*

---

### けん's House (optional but recommended)

If the player follows up on けん's phone invite, a new micro-location opens: けん's house. It's in the residential area near Rikizo's house — close, walking distance.

**Design note — private residences consume an action:** Entering someone's home is a commitment. Unlike the コンビニ (pop in and out freely) or the station (always open), visiting a friend's house **consumes your current time block**. You go in, you spend time, you come out and the day has moved forward. This is the game's first "action cost" — a precursor to the Persona time-slot system planned for N4. The player should feel this: choosing to visit けん means NOT visiting the station, NOT checking on ゆき, NOT exploring town. The opportunity cost makes the choice meaningful. For now this is soft (the game doesn't have formal time slots yet), but the feel should be: you go to けん's house, and when you leave, the afternoon light has shifted.

**Arrival — けん at the door:**

1. **けん:** 「来たね！ここだよ！」 — "You came! It's here!" *(He waves Rikizo toward his room. No verb for entering required — 入る is N5.17. Just demonstrative ここ and pure welcoming energy.)*

**けん's room — the reveal:**

The interior is messier than Rikizo's home. More color. More stuff. Posters on the walls (partially readable — some kanji taught, some not). Snack wrappers on the floor. A futon that hasn't been folded. And against the wall: a TV with a game console. Next to it, stacks of games.

The room IS けん. Every object characterizes him without dialogue. The mess says "I don't care about order." The game stacks say "this is what I care about." The snack wrappers say "I eat where I play." The unfolded futon says "I sleep where I eat where I play." けん's entire life happens in this room.

**Conversation (4 lines — casual):**

2. **けん:** 「ゲームがたくさんあるよ。多いでしょ？」 — "I have tons of games. A lot, right?" *(多い — new adjective. けん's room has too many games. 多い reinforced through pure enthusiasm. He's proud of the collection the way some people are proud of a library.)*

3. **Rikizo:** 「多いね...時間はある？」 — "That's a lot... do we have time?"

4. **けん:** 「時間？たくさんあるよ！学校はないから！」 — "Time? We've got tons! No school, so!" *(時間 — new. から — because. けん equates freedom with time. No school = unlimited time. His worldview is transparent and joyful.)*

**Design note — けん as host:** At his own house, けん does NOT ask Rikizo to buy things. The buy-me-something gag is an outdoor/ambient behavior — けん spots Rikizo on the street and makes casual demands because the コンビニ is right there. At home, he's the host. He has snacks. He has drinks. He offers, not asks. This distinction matters: けん has different social modes. Outside = shameless mooch. At home = generous host who shares everything he has. The player who visits けん's house sees a different side of him.

**Room exploration — after the conversation:**

After the initial dialogue, the player can move around けん's room and interact with objects. This is the game's first **free-roam interior exploration** of another person's space.

**Game stacks:** Piles of game cases next to the TV. The player can examine them. Each stack has 3–4 visible titles rendered as text on the spines:
- 「大きい山」 — "Big Mountain" *(Both kanji taught. Fully readable. Sounds like an adventure game.)*
- 「水と火」 — "Water and Fire" *(Both taught. An elemental RPG?)*
- 「たたかいの...」 — remaining kanji blurred *(たたかい = battle, but 戦 isn't taught. The player gets the hiragana but the kanji title is illegible. Partial reading — mirrors real life.)*
- Several titles are fully blurred — untaught kanji. The player can see they're text but can't decode them. The taught-kanji set determines what's readable, just like environmental text since Day 13.

**Design note — game titles as environmental text:** The game stacks are a microcosm of the broader environmental-text system. Some titles are fully readable (taught kanji), some partially (mix of taught and untaught), some completely opaque. This teaches the player that literacy is progressive — you can read MORE of the world with every lesson, but you can't read ALL of it yet. けん's room is a small library of unreadable texts, and the player will be able to read more of them every time they visit.

**The console — play game:**

The TV and console are interactable. When the player selects the console:

> **[ゲームをする]**

The screen transitions. A graphic shows two silhouettes — Rikizo and けん — sitting in front of the TV, controllers in hand. The art style shifts to something warm and simple: just outlines against the glow of the screen. They're playing. The player doesn't play a game-within-a-game — there's no minigame. Instead:

A clock appears on screen. It ticks forward. Time is visibly passing. The numbers advance — not in real time, but in accelerated jumps. The afternoon bleeds away. The light from the window behind the silhouettes shifts from bright to golden to dim. They're still playing. They don't talk. They don't need to. This is what friendship looks like at fifteen: sitting next to someone, doing the same thing, saying nothing. The clock keeps ticking.

When the transition ends, the player is either:
- **On the street outside けん's house** — if there's still time in the day
- **At home** — if the visit consumed the rest of the afternoon

けん waves from the door: 「またね！」 — "See you!" *(また — again. ね — right? He expects you'll come back. Of course he does.)*

**Design note — the silhouette time-skip:** This is the game's first time-skip that the player can *see*. Previous transitions between day segments are instant — you go from morning to afternoon and the light changes. This one shows time PASSING. The clock. The shifting light. The two still silhouettes. It communicates: you spent real time here. You chose this. It was worth it. The game doesn't judge (no lost quest progress, no missed NPC), but it shows the cost. Time is a resource. You spent it on friendship. That's the Persona philosophy: time management IS the gameplay, and how you spend your time defines your character.

**けん's parents:** Not seen. けん mentions in passing: 「お母さんは買い物。」 — "Mom's shopping." *(No verb needed. Just a noun and context. Parents are absent but real — they have lives offscreen. They may appear in future visits if けん's home becomes recurring.)*

---

### Town — Quantity Descriptors in Context

The new vocabulary layers onto the existing world:

- **Yamakawa** at the コンビニ: 「今日はお客さんが少ないよ。」 — "Few customers today." *(少ない — new. Weekends are slow at the コンビニ. Yamakawa notices. He's always there, so he tracks traffic patterns. This is the first time he's described a *quantity* of people.)*

- **Yamakawa follow-up:** 「たいてい週末は少ないんだ。ぜんぜんいない時もある。多分、みんな出かけているよ。」 — "Usually weekends are sparse. Sometimes nobody at all. Probably everyone's out." *(たいてい — usually. ぜんぜん — not at all. 多分 — probably. Three new adverbs in one observation. Yamakawa as a small-business observer, speculating about where his absent customers went. 多分 gives him uncertainty — the first time any character has hedged instead of stating facts. Yamakawa doesn't KNOW where they are. He guesses. It makes him feel more real.)*

- **コンビニ items:** The player can now describe quantities. Looking at the shelves: 「おにぎりが多いです。サンドイッチは少ないです。」 — "Lots of onigiri. Few sandwiches." The world's objects, which previously could only be named and located, can now be counted comparatively.

- **ゆき** (at the river, optional): 「今日は魚が少ないですね。いつもは多いのに。」 — "Few fish today. Usually there are lots." *(ゆき notices a change in quantity. She's tracking the world's details, as always. The fish — which materialized on Day 11 when 魚 arrived — are fewer today. Is that normal weekend variation, or is it meaningful? With ゆき, it could be either.)*

---

### 白 — Color and Identity

白い (white) is a simple color adjective. But 白 as a kanji combines with 人 to form 白人 (caucasian / white person). This is the second identity-categorization word after 外国人 (Day 12). The game doesn't need to force this into conversation, but it exists in the vocabulary set and the player will encounter it in the lesson content.

**Design note — handling 白人:** This word exists in Japanese and is standard vocabulary for JLPT N5. The game should present it neutrally — as a descriptive term, same as 日本人 or 中国人. No special emphasis. No moral framing. It's a word. The game world has words for categories of people. The categories exist. The player learns them. Done.

---

### State Tracking (End of Day 14)

**New locations:** けん's house (optional micro-location, residential area). First private residence. Consumes an action to visit.

**Flags:**
- `visited_ken_house` — (optional) First classmate home visit. +2 relationship けん.
- `played_games_ken` — (optional) Selected ゲームをする at the console. Saw silhouette time-skip. +1 relationship けん.
- `read_game_titles` — (optional) Examined game stacks. Environmental text encounter in a private space.
- `school_closed_saturday` — Player saw the closed gate. Weekday rule confirmed experientially.

**No new quest log entries.** やまかわのごはん, ゆきのきおく, and 駅長の「???」 continue.

**Station master trade window:** Available this visit. Same result — nothing in inventory matches. The rack is still empty.

**Art assets:**
| Asset | Type | Priority | Notes |
|---|---|---|---|
| School gate (closed) | BG variant | High | Same gate, locked. Dark windows. No 校長. Visual confirmation of the weekday rule. |
| けん's room | Background | **Critical** | Messy teenage room. Game console + TV against wall, game stacks with readable spines, snack wrappers, unfolded futon, posters (some readable). Warm colors. Anti-ミキ energy. |
| Game silhouette time-skip | Cutscene / transition | **Critical** | Two silhouettes (Rikizo + けん) sitting before TV glow. Controllers in hand. Window light shifts from bright → golden → dim. Clock overlay ticks forward. Simple, warm, wordless. |
| Game stack close-up | UI / interactable | Medium | Close-up of game case spines. 3–4 titles with mix of readable/blurred kanji. Same progressive-literacy system as environmental text. |

**Open questions (Day 14):**

1. ✅ **多分 placement — resolved.** Moved to Yamakawa's コンビニ follow-up line: 「多分、みんな出かけているよ。」 He speculates about where his absent weekend customers went. Natural, in-character, and introduces 多分 as hedging/uncertainty.

2. **Time-skip duration** — How long does the silhouette sequence play? Recommendation: 5–8 seconds. Long enough to feel like time passing, short enough to not bore. The clock advances through 3–4 visible jumps. No player input — it's a cutscene.

3. **Post-visit state** — Does the player end up on the street or at home? Recommendation: on the street outside けん's house. This lets the player still visit one more location (station, コンビニ, river) before the day ends, preserving some agency. If we put them at home, the visit consumed the ENTIRE day — too punishing for an optional activity.

---

## Day 15 — "Cardinal Directions" (unlocked by N5.15)

**New kanji:** 北、南、東、西

**New vocabulary:** 北/南/東/西 (compass directions), 北東/北西/南東/南西 (compounds)

**Calendar:** 五月十一日 (May 11th, Sunday). Second weekend day. School still closed.

**Grammar context:** No new unlocks. Sustained reinforcement of everything through G11.

---

### The Day the Map Got a Compass

Sunday. School still closed. Rikizo explores the town — but today, the town has directions.

Before today, the player knew locations: house, school, station, コンビニ, river. After today, the player knows where they are *relative to each other*: school is south of the station, the mountains are north, the コンビニ is east. The world gains spatial structure. Not new buildings — new labels on the buildings that already exist.

**The phone map unlocks:** Rikizo's phone gains a map feature. When the player opens it, the town is displayed with compass labels — 北、南、東、西 — at the edges. But most of the map is white. Blank. Empty. Like a real map of an area you haven't explored, the edges fade into nothing. The town Rikizo knows occupies a small cluster in the center: house, school, station, コンビニ, river, デパート. Beyond that — white. North has mountains drawn faintly at the edge. West is completely empty. The map tells you two things simultaneously: where things are, and how much you don't know.

**Design note — the white map:** This mirrors real-world mapping apps when you zoom into a rural area with sparse data. The white space isn't "error" — it's honest. The game world hasn't been built there yet, and the map reflects that. As N4 opens new locations, the white fills in. The map becomes a progress tracker: how much of the world has vocabulary made visible? On Day 15, the answer is: not much. The white is bigger than the drawn. That's the point.

---

### Town Exploration — Directional NPCs

The new vocabulary layers onto existing NPC conversations. Everyone suddenly has spatial opinions.

- **Station master:** 「北の方に山があります。南の方に学校があります。」 — "Mountains to the north. School to the south." *(The station master — who has been waiting at an empty station since Day 5 — finally has spatial information to share. He knows where things are. He's been watching the world materialize around him and he knows the compass.)*

- **Yamakawa:** 「コンビニは東だよ。西には何もないよ。」 — "The convenience store is east. Nothing to the west." *(Nothing to the west. Yet. The game world's western edge is undefined. Yamakawa says "nothing" because nothing has been built there. In N4, the western zone develops. Yamakawa's casual dismissal of the west becomes ironic later.)*

- **ゆき** (at the river, optional): 「北の山はきれいですね。」 — "The northern mountains are beautiful." *(ゆき looks north. The mountains are visible but distant. She stares at them a beat too long. What's up there? Nothing yet — but ゆき's gaze marks the north as significant. A seed for later.)*

**Station master trade window:** Still available. Still nothing works. The rack is still empty. Day 3 of 5.

---

### State Tracking (End of Day 15)

**Map upgrade:** Compass directions visible on the game map. Directional labels on key locations.

**No new locations.** The existing world gains labels, not new buildings.

**Flags:**
- `compass_learned` — Player has encountered all four cardinal directions in NPC dialogue.

**Art assets:**
| Asset | Type | Priority | Notes |
|---|---|---|---|
| Phone map screen | UI screen | **Critical** | Town map with 北/南/東/西 compass labels. Known locations clustered in center. Most of the map is white/blank — unexplored world. Mountains faintly sketched at northern edge. West completely empty. Fills in as N4 adds locations. |
| Directional street signs | BG detail set | Medium | Signs at intersections showing 北/南/東/西. Readable now because kanji are taught. |

---

## Day 16 — "Sides & Vertical" (unlocked by N5.16)

**New kanji:** 右、左、上、下

**New vocabulary:** 右/左/上/下 (relative directions), 上手/下手 (skilled/unskilled)

**Calendar:** 五月十二日 (May 12th, Monday). School reopens. The weekly rhythm resumes.

**Grammar context:** No new unlocks. Sustained reinforcement of everything through G11.

---

### The Day the World Got a Left and a Right

Monday. The gate is open. 校長 is back. The second week begins.

Yesterday the world got a compass — absolute directions that don't change. Today it gets relative directions — positions that depend on where you're standing. North is always north. But right depends on which way you're facing. This is a subtler vocabulary: it requires the player to think about perspective, not just geography.

And then there's 上手 and 下手. Skill adjectives built from spatial kanji. 上 (above) + 手 (hand, Day 13) = skilled. 下 (below) + 手 = unskilled. The metaphor is vertical — skill is up, lack of skill is down. These two words do more character work than any dialogue: once the player has 上手 and 下手, every NPC can be described by what they're good and bad at.

---

### Classroom — Right and Left

Today's vocabulary is physical. 右、左、上、下 — right, left, above, below. すずき先生 uses them in class.

1. **すずき:** 「右を見てください。左を見てください。」 — "Please look right. Please look left." *(Classroom instruction using て-form commands. すずき teaches directions through physical action — look right, look left. The students move. The classroom becomes interactive.)*

2. **けん** (looking the wrong way): 「こっち？」 — "This way?" *(けん gets it wrong. Comedy. すずき corrects him gently. 左 and 右 are notoriously confusable — けん's mistake mirrors what every learner experiences.)*

---

### After School — 上手 and 下手

The walk home. The pattern from Day 13 continues: classmates who were quiet in the classroom open up outside.

**リー conversation (walking home):**

1. **リー:** 「りきぞさんは日本語が上手ですね。」 — "You're good at Japanese, Rikizo." *(上手 — the compliment. リー gives it genuinely. She herself was complimented on Day 12 (じょうず). Now she returns it using a different word. 上手 and じょうず are near-synonyms, but 上手 has kanji the player can read — it feels more formal, more "real.")*

2. **Rikizo:** 「リーさんも上手ですよ！」 — "You're good too, Lee!"

3. **リー:** 「空手は下手です...」 — "I'm bad at karate..." *(下手 — unskilled. 空手 callback from Day 13. リー reveals she tried karate and wasn't good at it. Characterization through vocabulary: the same adjective pair applied to different domains reveals different facets of a character. リー is good at languages, bad at physical activities. ミキ is probably 上手 at reading, 下手 at socializing. けん is 上手 at games, 下手 at tests.)*

**Design note — 上手/下手 as character descriptors:** These adjectives become a recurring conversational tool. NPCs use them to describe each other: 「けんはゲームが上手だよ」(Ken is good at games), 「ミキさんは読むのが上手ですね」(Miki is good at reading). The player builds a mental map of each character's skills — a social version of the spatial map that compass directions created yesterday.

**Station master trade window:** Still available. Still nothing works. Day 4 of 5.

---

### The House Gets a Second Floor

上 and 下 don't just label positions — they unlock vertical space. Until today, every building in the game has been flat. The house has rooms on one level. The デパート has floor indicators you can read (一かい、二かい) but going "up" wasn't a verb you could enact spatially. Now it is.

**The staircase.** When the player returns home, there's a staircase that has been there since Day 1. It was always part of the house sprite — stairs going up, visible in the background. But there was no interaction prompt. No arrow. No way to go up. Today, an 上 arrow appears at the base of the stairs. The staircase just... became usable. Like everything else in this world, it existed before the word for it did.

**Going upstairs:**

> Rikizo: 「上に行きましょう！」 — "Let's go up!" *(He says "let's" to himself. The ましょう is self-directed enthusiasm. He's excited about stairs.)*

**The upstairs hallway.** A narrow corridor. Three doors.

1. **Door 1 (left) — Parents' room.** A closed door. The player can approach it, but it doesn't open.
   > 「お父さんとお母さんの...」 — "Dad and Mom's..." *(Rikizo trails off. He doesn't enter his parents' room. The door is simply closed. Not locked in a game-mechanic sense — just closed, the way a teenager's parents' bedroom door is always closed. It's not his space. There's nothing performative about it. He just doesn't open it.)*

2. **Door 2 (right) — The closed door.** Another door. Also closed. No name plate. No clue who lives here.
   > 「...」 *(Nothing. Rikizo looks at the door. He doesn't say anything. He doesn't try it. There is a beat — a pause that is slightly too long. Then the player regains control. The game offers no interaction prompt for this door.)*

   **Design note — the brother's door:** This is the fourth family member from Mom's 四人 count on Day 3. The player who noticed the gap (three named people, four counted) now has physical evidence: a door that belongs to nobody Rikizo will name. The door is not locked, barred, or decorated with mystery symbols. It's just a door that Rikizo won't interact with. The game's silence is louder than any cutscene. In N4, when 兄 (older brother) vocabulary arrives, this door opens. Until then, it's the most conspicuous nothing in the game.

3. **Door 3 (center/end of hall) — Rikizo's room... upstairs?** The door opens. It's a small storage room. Boxes. A window with a view of the town.
   > Rikizo: 「あ、上から町が見えますね。」 — "Ah, you can see the town from above." *(上から — from above. The view reinforces the spatial vocabulary. The player can see the town layout from a new angle — the same map that appeared on their phone yesterday, but now rendered as a window view.)*

   **If the player examines the boxes:**
   > 「何ですか...？わかりません。」 — "What is this...? I don't know." *(The boxes are the brother's things. Rikizo doesn't say this. He doesn't know whose they are, or maybe he does and won't say. The boxes are another silence.)*

---

### The デパート Gets Vertical

The デパート already had floor markers (一かい、二かい、三かい) since Day 9. But going up was just walking past decorative floor labels. Today, with 上/下 active, the spatial relationship becomes explicit. The escalator has 上 and 下 arrows. The elevator has 上 and 下 buttons. Going up and coming down are now navigable actions, not just observed labels.

**Basement (地下 — B1):**

Until today, the デパート only went up. Now 下 exists, and the building goes down too. A staircase near the entrance leads to B1.

> Rikizo: 「下にも何かありますか？」 — "Is there something below too?" *(も — "also/too." The building extends downward. Rikizo is genuinely surprised.)*

**The basement floor.** Dimmer lighting. A different feel from the polished upstairs. Two distinct zones:

1. **ゲーム corner.** Shelves of video game boxes. Console displays. This is けん's paradise — and the player's, because ゲーム has been vocabulary since N5.2.
   > Rikizo: 「ゲームがたくさんありますね！」 — "There are so many games!" *(たくさん — lots. The shelf is stacked. Some boxes have readable titles: simple katakana names the player can sound out. Others have kanji they can't read yet — blurred by the environmental text system.)*

   **If the player examines specific games:**
   > 「このゲームは...千円です。」 — "This game is... 1,000 yen." *(Expensive for Rikizo's wallet, but browseable. The basement is a place to want things you can't afford yet.)*

   > 「けんはゲームが上手です...このゲームもありますか？」 — "Ken is good at games... does he have this one too?" *(上手 callback from earlier today. Rikizo thinks of けん when he sees games. The social link is forming through shared vocabulary.)*

2. **カード corner.** Glass cases with collectible cards. Shiny foil. Organized by series. The player can see them but can't name most of what's displayed.
   > Rikizo: 「きれいですね...」 — "Pretty..." *(きれい — the same word he used on the clothing floor back on Day 9. The vocabulary for "I see something nice but can't describe it" is getting a workout.)*

   **If the player approaches the card displays:**
   > 「カード...ほしいです。」 — "Cards... I want them." *(ほしい from Day 8. Desire without vocabulary is a recurring theme. The player can want the cards but can't engage with the card game system until collectible-game vocabulary arrives — probably N4.)*

   **Design note — CCG as future system:** The card displays are a seed for a collectible card game mechanic in N4. When vocabulary for card game terms arrives (対戦 "match," デッキ "deck," etc.), the basement becomes an interactive space. For now it's a window into a future the player can't access — the same pattern as the clothing floor on Day 9, but nerdier.

**Clothing floor (二かい) — still decorative, now with 上/下 navigation:**

The clothing floor was browse-only since Day 9. That hasn't changed — there are still no clothing words (シャツ, ズボン, etc. are N4.1+). But now the player navigates there with explicit 上 movement rather than just wandering onto the floor.

> Rikizo: 「上の服は...名前がわかりません。」 — "The clothes upstairs... I don't know their names." *(服 isn't available as specific vocabulary yet, but the concept of "things you wear" is visible. The player is experiencing the vocabulary gap as a spatial experience: you can go up to the floor, but you can't shop there.)*

**Design note — the デパート as vertical vocabulary progression (updated):** Day 9 established the department store as a building where each floor represents a vocabulary tier. Day 16 makes this spatial: the player physically goes 上 and 下 between tiers. The basement (games, cards) is partially accessible because ゲーム exists. The ground floor (food) is fully shoppable. The second floor (clothing) is browse-only. The third floor (electronics) is still decorative. The building is a four-tier vocabulary meter. The player can literally see how far their Japanese reaches by how high they can interact.

---

### State Tracking (End of Day 16)

**New accessible areas:**
- Rikizo's house 2F: hallway with three doors (parents' room — closed, mystery door — sealed, storage room — open with town view)
- デパート B1: ゲーム corner (browseable, purchasable), カード corner (browse-only)

**No new NPCs.**

**Flags:**
- `jouzu_heta_unlocked` — 上手/下手 available as character descriptors.
- `school_week2_monday` — Attended school on the second Monday. Weekly rhythm confirmed.
- `lee_karate` — (optional) Learned リー tried karate. +1 curiosity.
- `house_upstairs_unlocked` — Accessed 2F of Rikizo's house. Discovered parents' room (closed) and mystery door.
- `mystery_door_seen` — Noticed the unnamed door on 2F. +1 curiosity. Seeds brother reveal in N4.
- `storage_room_boxes` — (optional) Examined boxes in storage room. +1 curiosity.
- `depato_basement_unlocked` — Accessed デパート B1. Browsed games and/or cards.

**Economy:**
- デパート B1 games available for purchase (~1,000¥). First non-food, non-gift purchasable items.

**Art assets:**
| Asset | Type | Priority | Notes |
|---|---|---|---|
| Classroom direction scene | BG variant | Medium | Students looking right/left on すずき's command. けん looking the wrong way. |
| House 2F hallway | Background | B (MP100) | **High** | Narrow corridor. Three doors. Soft lighting. Parents' door on left, mystery door on right, storage room at end. The mystery door should look identical to the others — no visual distinction. The absence of distinction IS the design. |
| Storage room / town view | Background | B (MP100) | Medium | Small room with stacked boxes. Window showing bird's-eye town view — callback to phone map from Day 15. |
| デパート B1 — game corner | Background | B (MP100) | High | Shelves of game boxes. Console display units. Slightly dim basement lighting. Neon accent lights on displays. けん would love it here. |
| デパート B1 — card corner | Background | B (MP100) | Medium | Glass display cases with foil cards. Organized, collectible feel. Shiny. Aspirational. |
| 上/下 navigation arrows | UI element | — | Medium | Appear at staircases/escalators when 上/下 vocabulary is active. Simple directional indicators. |

**Open questions:**
1. **Can the player buy games at the デパート B1?** Recommendation: Yes, but they're expensive (千円+). Buying a game is a significant wallet event. The purchased game could appear in Rikizo's room as a decorative object, or could be a gift for けん (social link fuel). If けん receives a game as a gift, it strengthens the friendship — a parallel to Mom's プレゼント quest from Day 8, but player-initiated rather than quest-driven.

2. **Should the mystery door have any interaction at all?** Recommendation: Minimal. The player can approach it. Rikizo says nothing. There is no interaction prompt. If the player repeatedly approaches, after the 3rd attempt: 「...」 (ellipsis only). The game acknowledges the player is trying. It gives nothing. This is more unsettling than a "locked door" message because locked doors imply a key exists. This door implies something else entirely.

3. **Does けん react if you tell him about the デパート basement?** Recommendation: Yes, if you visit けん after discovering B1: 「ゲーム！？下にゲームがありますか！？」 — "Games!? There are games downstairs!?" けん loses his mind. This could set up a future Day where けん is found browsing the B1 game corner instead of at his house — NPCs responding to the world the player has discovered.

---

## Day 17 — "Work & Society" (unlocked by N5.17)

**New kanji:** 午、口、出、入、会、社

**New vocabulary:**
- 午前 (morning/AM), 午後 (afternoon/PM)
- 出る (to exit), 出す (to take out), 出口 (exit)
- 入る (to enter), 入れる (to put in), 入り口 (entrance)
- 会う (to meet), 会社 (company), 会話 (conversation)
- 社長 (company president), 社会 (society)
- 口 (mouth/opening)
- アルバイト (part-time job)

**Calendar:** 五月十三日 (May 13th, Tuesday). Third school week. Routine established.

**Grammar context:** No new unlocks. All forms through G11 in sustained use. The grammar is stable — vocabulary continues to reshape the world.

---

### The Day the Adults Got Jobs

For sixteen days, the adults in Rikizo's world have been... present. Mom cooks and cleans. Dad sits around the house making observations. Yamakawa stands in front of the コンビニ. The hotel clerk waits at the front desk. Each adult occupies a space but none of them *go to work*. There has been no concept of employment because there has been no word for it.

Today, 会社 materializes. Company. Workplace. The place adults go when they're not at home. And with it: 午前 and 午後 — morning and afternoon. AM and PM. The day splits in half. Time, which has been a continuous blob (morning → daytime → evening → night), suddenly has structure. There is a before-noon and an after-noon, and the difference matters because adults go to 会社 in the 午前 and come home in the 午後.

This is a mirror of Day 12. Day 12 gave Rikizo an obligation (school). Day 17 gives the *adults* obligations. Mom doesn't just cook — she manages a household while Dad is at work. Dad doesn't just sit — he comes home from somewhere. The world gains an economy. People do things for reasons beyond the player's direct observation.

And then there's 出口 and 入り口. Exit and entrance. Every building in the game has had doors, but doors haven't had *labels*. Now they do. The school gate has an 入り口 side and an 出口 side. The コンビニ has an entrance. The station has exits. The world gains flow — directional movement through spaces. You enter, you exit. These aren't the same act.

---

### Morning — Dad Leaves

This is the morning Dad doesn't stay.

1. **Mom:** 「おはよう。お父さんはもう出ましたよ。」 — "Good morning. Dad already left." *(出ました — polite past of 出る. Dad has exited. He's gone. For the first time in 17 days, Dad is not at the breakfast table. The chair is empty. Mom says it casually — as if this has always been the routine. But the player has watched Dad eat breakfast every single morning. His absence is jarring.)*

2. **Rikizo:** 「お父さんは...どこに？」 — "Dad... where to?"

3. **Mom:** 「会社ですよ。午前は会社です。午後に帰ります。」 — "The company. He's at the company in the morning. He comes home in the afternoon." *(会社. Mom names it. Dad goes to a company. He works there. In the morning. He returns in the afternoon. This is the most matter-of-fact revelation in the game — Dad has a job. He's always had a job. He's been going to work since before Rikizo was born. It just hasn't been sayable until now. The player has been seeing Dad on vacation — Golden Week, then weekend, then the gap between weekday mornings and his return. Today the gap has a name: 会社.)*

4. **Mom:** 「りきぞも学校の時間ですよ。午前は学校、午後は...」 — "It's school time for you too, Rikizo. Mornings are school, afternoons are..." *(She structures the day. 午前 = school. 午後 = free. The split creates a framework. Rikizo's day, which has been "do whatever," is now divided. Morning: obligation. Afternoon: choice. This is how adults experience time — segmented, allocated, finite. Rikizo is learning time management through vocabulary.)*

**Design note — Dad's job:** What does Dad do? The game never says. He goes to 会社. He comes home. He's tired or not tired. He has opinions about things. His job is deliberately undefined — not because it doesn't matter, but because the vocabulary to describe specific jobs doesn't arrive for a while. The concept of "company" is enough for now. In N4, when professional vocabulary expands, Dad's role at the company may be specified — or it may remain vague, Dad's eternal mystery.

**Design note — Mom's role:** Mom doesn't go to 会社. She's at home. The game doesn't comment on this — it's a common Japanese family structure. Mom manages the household, the finances, the children. She is, in many ways, the most competent person in the game — she runs everything while Dad works and Rikizo goes to school. Whether the game eventually gives Mom her own professional arc (part-time work, community involvement) is a future decision. For now, she is the anchor of the household, and the household runs because of her.

---

### Walking to School — Exits and Entrances

The walk to school feels different today. Signs are appearing. Not new signs — the signs were always there. But today they're *labeled*.

The station, which Rikizo passes every day, now has visible text:
> 「出口」 — "Exit"
> 「入り口」 — "Entrance"

These are the first *functional* environmental texts — they tell you what to do. The bulletin board (Day 13) was informational. 出口 and 入り口 are *directional*. They organize movement. Enter here. Exit there. The world has flow.

**Station master interaction:**

1. **Station Master:** 「入り口はこちらです。出口はあちらです。」 — "The entrance is this way. The exit is that way." *(The station master — who has been standing at an empty station since Day 5 — now has directional information to share. He can guide people. He has a purpose beyond waiting. The entrance/exit distinction gives his station functional architecture even though no trains come.)*

**At the school gate:**

The school gate now has labels visible to the player:
> 「入り口」on the way in.

The concept of entering (入る) is formalized. Rikizo doesn't just walk through the gate — he *enters* the school. The verb gives the act intentionality.

---

### Classroom — 会う and 会話

Today's class has a theme: meeting and conversation.

1. **すずき:** 「今日は新しい言葉を学びましょう。"会う"は何ですか？」 — "Let's learn new words today. What is 'meeting'?" *(会う — to meet. すずき teaches it as a formal vocabulary item.)*

2. **すずき:** 「人に会います。友だちに会います。先生に会います。毎日、たくさんの人に会いますね。」 — "We meet people. We meet friends. We meet teachers. Every day, we meet many people." *(She builds from abstract to concrete. The grammar is simple — polite present. The concept is social: meeting is something humans do constantly, and now there's a word for it.)*

3. **けん:** 「おれは毎日りきぞに会うよ！」 — "I meet Rikizo every day!" *(けん, inserting himself. Casual register. He frames friendship through the verb — meeting someone daily IS friendship. Simple, true, very けん.)*

4. **すずき:** 「会話もしましょう。会話は"会う"と"話す"ですね。」 — "Let's practice conversation too. Conversation is 'meeting' and 'speaking.'" *(会話 — now writable because 会 is taught today. She breaks the compound down: 会 + 話 = conversation. Meeting + speaking. The etymology is exposed through the lesson. The player learns not just the word but why it's constructed the way it is.)*

**Design note — kanji etymology in classroom scenes:** すずき先生 occasionally breaks down compound words by their constituent kanji. This mirrors a real Japanese classroom technique and reinforces the player's kanji knowledge. 会話 = 会 + 話 is a clean example. Future candidates: 電話 = 電 + 話 (electric + speaking), 会社 = 会 + 社 (meeting + company/shrine). This technique works best when both kanji are recently taught.

---

### 社会 — A Word the World Isn't Ready For

社会 (society) is in the vocabulary list. It's a big word. 社 (company/community) + 会 (meeting/association). Together: society. The organized structure of human interaction.

The game doesn't force this word into a conversation. It exists in the lesson content — the player learns it — but its application in the game world is limited on Day 17. What does "society" mean in a town with a dozen named characters and no visible government, no police, no public services? The word exists before the thing it describes is fully developed.

This is different from 学校 (which materialized alongside the concept) or 書く (which completed deferred actions). 社会 is a word without a clear referent *yet*. It will gain meaning in N4 as the world's social structures become more visible — community meetings, local governance, historical context. For now, it's a vocabulary entry that sits quietly in the glossary, waiting.

**Design note — 社長 (company president):** Another word that implies a world larger than what the player sees. There's a 会社. There's a 社長. Who is the 社長? Not Dad — he goes to 会社 but his position is unspecified. The 社長 is unseen. Like the 校長 was before Day 12, the 社長 exists as a title before a character fills it. In N4, the 社長 may become a named NPC — or may remain a phantom, referenced but never encountered.

---

### After School — 午後

The afternoon. 午後. The new word gives the time of day a name, and with it a quality. 午前 was school, obligation, structure. 午後 is free, open, choice. The split redefines Rikizo's daily experience.

**Yamakawa (コンビニ, afternoon):**

1. **Yamakawa:** 「午後だね。会社の人がたくさん来るよ。」 — "It's afternoon. Lots of company people come." *(Yamakawa observes the afternoon rush — 会社 workers on break or heading home. He tracks the patterns of his customers. 午前 is quiet. 午後 is busy. The コンビニ has daily rhythms that Yamakawa has always known but couldn't describe until today.)*

2. **Yamakawa:** 「おれはアルバイトじゃないけどね。毎日ここにいるだけだよ。」 — "I'm not a part-timer though. I'm just here every day." *(アルバイト — part-time job. Yamakawa clarifies: he's not employed by the コンビニ. He just... is there. Every day. All day. This is the closest the game has come to addressing the Yamakawa question: why is this teenager always at the convenience store? His answer is simultaneously honest and evasive. He's not working. He's just existing. At the コンビニ. As he has since Day 5. The player might find this funny, or unsettling, or both.)*

**Evening — Dad comes home:**

Dad returns in the 午後, as Mom predicted. He's the same Dad — but now he's coming from somewhere. He has a context outside the house. The chair that was empty this morning is occupied again.

1. **Dad:** 「ただいま。」 — "I'm home." *(Standard greeting. But it hits different when the player knows he actually left. Before today, ただいま was just a thing people say. Now it's a return. He went to 会社. He came back. The word has weight.)*

2. **Mom:** 「おかえり。会社はどうでしたか？」 — "Welcome back. How was the company?"

3. **Dad:** 「...たくさん人に会った。」 — "...Met lots of people." *(会った — plain past of 会う. Dad describes his day in one sentence. Minimal, as always. He met people. At the company. It's the most Dad has ever said about his life outside the house, and it's almost nothing.)*

---

### Story Beats

| Moment | What Happens | What the Player Should Feel |
|---|---|---|
| Dad's chair is empty | He left for 会社 before Rikizo woke up | Disorientation — Dad has ALWAYS been there at breakfast |
| Mom structures the day | 午前 = school, 午後 = free | Time just got divided. Life has a schedule. |
| Exit/entrance signs appear | 出口、入り口 on every building | The world has flow — movement is directional |
| Yamakawa "I'm not part-time" | He's just... there | Funny? Unsettling? Why IS he always there? |
| Dad says ただいま | Coming home from somewhere | The word means something now. He actually left. |
| 社会 exists as a word | Society — but what society? | A vocabulary item waiting for a world to describe |

---

### State Tracking (End of Day 17)

**No new locations.** 会社 is referenced but not visitable (it's Dad's workplace, off-screen). Exits and entrances are labeled on existing buildings.

**No new NPCs.** 社長 referenced but not introduced.

**Vocabulary-driven world changes:**
- Buildings now have 出口/入り口 labels
- Time of day has names: 午前, 午後
- Dad has a commute cycle (leaves AM, returns PM)
- Environmental signage continues to expand with taught kanji

**Flags:**
- `dad_works` — Dad goes to 会社. Permanent world state change.
- `am_pm_unlocked` — Time can be described as 午前/午後.
- `exit_entrance_labeled` — Buildings gain directional signage.
- `yamakawa_not_baito` — Yamakawa confirmed: not a part-timer. He just exists at the コンビニ.

**Art assets:**
| Asset | Type | Priority | Notes |
|---|---|---|---|
| 出口/入り口 signs | BG detail set | High | Labels on station, school, コンビニ, デパート. Readable kanji. |
| Empty Dad chair (morning) | BG variant | Medium | Kitchen scene with Dad's usual seat empty. Small detail, big impact. |

---

## Day 18 — "Body & Senses" (unlocked by N5.18)

**New kanji:** 目、見、耳、聞、足、立

**New vocabulary:**
- 目 (eye), 耳 (ear), 足 (foot/leg)
- 見る (to see), 見える (to be visible), 見せる (to show)
- 聞く (to hear/ask), 新聞 (newspaper)
- 立つ (to stand)
- いたい (painful), かなしい (sad), こわい (scary)

**Calendar:** 五月十四日 (May 14th, Wednesday). Mid-week. School day. Routine.

**Grammar context:** No new unlocks. This is the **final N5 lesson**. After Day 18, the N5 vocabulary arc is complete. The game continues into N4, but this is the last day of the foundational layer.

---

### The Day the World Got a Body

For seventeen days, Rikizo has existed as a consciousness that moves through space, speaks, and acts — but has no body. He can eat (食べる, Day 5) but has no mouth (口 arrived yesterday, Day 17). He can walk but has no feet. He can look but has no eyes. The body has been implied by every physical action but never named.

Today, the body exists. Eyes, ears, feet. And with them: perception. 見る (to see), 聞く (to hear). These aren't just vocabulary — they're the senses that the player has been using since Day 1 without being able to name them. Every time the player looked at something in the game world, they were performing 見る. Every time they listened to an NPC, they were performing 聞く. The verbs arrive last, after the actions they describe have been performed thousands of times.

And then: emotions. いたい (painful), かなしい (sad), こわい (scary). For seventeen days, the game's emotional palette has been limited to positive descriptors — おもしろい (interesting), きれい (beautiful), おいしい (delicious), たのしい (fun). The negative emotions didn't exist. Characters couldn't be sad because sad wasn't a word. Things couldn't be scary because scary wasn't a concept. Today, the world gains its shadow side. Not dramatically — these are just adjectives. But their arrival means that the game's emotional range is no longer limited to happiness and interest. Rikizo can now be in pain. Things can be frightening. People can be sad.

For the final N5 lesson, this is exactly right. The foundational layer closes by giving the world a body and teaching it to feel.

---

### Morning — The Body Noticed

1. **Mom:** 「目が赤いですよ。大丈夫ですか？」 — "Your eyes are red. Are you okay?" *(目 — eyes. Mom notices Rikizo's eyes first thing in the morning. She's been looking at his face every day for 18 days, but today she can *name* what she sees. Eyes. And they're red — he was up late, maybe playing games at けん's, maybe reading. Mom observes through the new vocabulary.)*

2. **Rikizo:** 「だいじょうぶです。少し...」 — "I'm fine. Just a little..." *(少し — from Day 14. He trails off. He can't say 疲れた (tired) — it's not available. The concept of tiredness remains deferred. But the physical symptom — red eyes — is observable because 目 exists now.)*

3. **Dad** (if home — check: is it before his 会社 departure?): 「足で歩け。車じゃないぞ。」 — "Walk with your feet. No car." *(足 — feet. Dad, practical and blunt. He's telling Rikizo to walk to school. 車 (car, Day 5) exists but isn't for Rikizo. Dad names the body part — feet — and the action — walking. The body is functional equipment in Dad's worldview.)*

---

### Walking to School — Perception

The walk is different today. Not because the route changed — because Rikizo can now describe what he perceives.

> Rikizo walks south. He sees the school (学校が見えます — 見える, the visibility verb). He hears birds (鳥の声が聞こえます — 聞こえる... check: is 聞こえる in the glossary? If only 聞く, restructure to: 鳥の声を聞きます). He walks on his feet (足で歩きます). Every step is now a named physical act performed by a named body part through named senses.

The game world, which has been *experienced* through senses since Day 1, is now *described* through senses. The player has always seen the school, heard the river, walked the streets. Today, the game catches up to the player — the vocabulary for perception matches the experience of perception.

**Design note — 見る vs 見える vs 見せる:** Three verbs from one kanji, each with a different relationship to vision:
- 見る = to see (active — you choose to look)
- 見える = to be visible (passive — it appears in your field of vision)
- 見せる = to show (causative — you make something visible to someone)

This triad is one of the most elegant verb families in Japanese, and the game can demonstrate all three in a single school day: Rikizo 見る-s the blackboard (active looking), the school 見える-s from the hill (it's visible), すずき先生 見せる-s a new book to the class (showing). Three perspectives on the same sense.

---

### Classroom — The Senses Lesson

1. **すずき:** 「目で見ます。耳で聞きます。口で話します。手で書きます。足で歩きます。」 — "We see with our eyes. We hear with our ears. We speak with our mouths. We write with our hands. We walk with our feet." *(すずき lists the body-sense pairings. Each pair connects a body part (today's kanji) with a verb (previously learned or today). This is a pedagogical moment that doubles as a world-building moment: the body and its functions are enumerated. Rikizo is a complete organism. He has parts. They do things.)*

2. **すずき:** 「何が見えますか？」 — "What can you see?" *(She asks the class. 見える — what is visible. The classroom becomes an exercise in perception.)*

3. **けん:** 「窓が見えるよ。外も見える。」 — "I can see the window. And outside." *(けん looks out the window. He sees the world. This is characteristically けん — his answer is literal and immediate. He sees what's directly in front of him.)*

4. **リー:** 「本が見えます。すずき先生も見えます。」 — "I can see books. And I can see すずき先生." *(リー is more descriptive. She names multiple visible things. She's processing the classroom through the new verb.)*

5. **ミキ:** 「...」 *(ミキ doesn't answer. She's reading. What does ミキ see? The book. Always the book. Her perception is directed inward, toward text. She sees words. She hears words. The physical world is secondary.)*

---

### Emotional Adjectives — The Shadow Side Arrives

いたい (painful), かなしい (sad), こわい (scary). Three adjectives that break the game's emotional monotone.

**いたい — pain:**

1. **けん** (after PE or during break, rubbing his leg): 「いたい！足がいたい！」 — "Ow! My foot hurts!" *(けん, the first character to be in pain. Physical pain, trivially caused — he kicked something, tripped, ran too hard. いたい is deployed casually, comically. Pain exists, but it's not tragic. It's けん being けん.)*

This sets the tone: いたい is physical first. It can be emotional later (心がいたい — "my heart hurts" — but 心 isn't taught yet). For now, pain is a body thing. Feet hurt. That's enough.

**かなしい — sadness:**

This one is subtler. No character cries on Day 18. Nobody has a reason to be sad in the immediate narrative. But the word arrives, and it quietly changes the emotional possibilities.

**ゆき** (optional, river encounter):

1. **ゆき:** 「花が少なくなりましたね。少しかなしいです。」 — "The flowers have gotten fewer. I'm a little sad." *(少なくなりました — have become fewer. かなしい — sad. ゆき connects to the natural world through the new emotional vocabulary. The flowers from Day 11 are fading — it's mid-May, cherry blossom season is ending. ゆき feels their loss. She's the game's first character to express sadness, and she expresses it about nature, not people. This is perfectly in character: ゆき's emotional life is tied to the environment, not to social situations. She feels what the world feels.)*

**こわい — fear:**

1. **けん** (telling a story during break): 「昨日、こわい話を聞いたよ。夜、学校に...」 — "Yesterday, I heard a scary story. At night, at the school..." *(こわい話 — scary story. けん starts a ghost story about the school at night. He trails off — not because the vocabulary runs out, but because すずき interrupts him (「けんさん！」). The ghost story is never finished. But the seed is planted: the school at night is potentially scary. In N4, this becomes relevant — nighttime school exploration is a potential quest.)*

**Design note — emotional adjectives as world-expansion:** These three adjectives don't create physical things (no new buildings, no new NPCs). They create *possible states of being*. The world before Day 18 was pleasant — things were interesting, beautiful, delicious. The world after Day 18 can also be painful, sad, and scary. This isn't a tonal shift — the game doesn't suddenly become dark. But the palette widens. Characters can now have bad days. Things can go wrong. Stories can have tension. The emotional vocabulary is the final piece of the N5 foundation.

---

### 新聞 — The Object That Bridges Two Worlds

新聞 (newspaper). 新 (new, Day 10) + 聞 (hear, today). Literally: "new hearings." A newspaper.

**Dad reads the newspaper.** This is a new evening interaction. Dad, home from 会社, sits with a 新聞. He reads it (読む, Day 13). He's quiet. The newspaper is the first informational object in the game — it contains knowledge about the world outside the town. What does it say? The player can't read most of it (untaught kanji), but the fact that Dad reads a newspaper implies a world of events beyond what the player can see.

1. **Rikizo:** 「お父さん、何を読んでいますか？」 — "Dad, what are you reading?"
2. **Dad:** 「新聞だ。社会のことだ。」 — "The newspaper. About society." *(社会 — from yesterday. Dad reads about society. The newspaper connects yesterday's abstract word to today's concrete object. 社会 exists because people write about it and other people read about it.)*

**Design note — the newspaper as a mystery vehicle:** In N4, the 新聞 becomes a source of plot information. Headlines about strange events in the town, historical anniversaries that don't match the timeline, weather patterns that don't make sense. Dad reads the newspaper and occasionally mentions headlines. The player can check the newspaper themselves (if they walk to the コンビニ and find one) and discover articles that seed the larger mystery. The newspaper is a window into the world's inconsistencies, delivered in a format that requires 読む to access.

---

### Evening — N5 Complete

Day 18 is the final N5 lesson. The player has learned all 90 N5 kanji. Every N5 vocabulary word is available. The game world has:

- A house with rooms, furniture, appliances
- A family with roles, jobs, schedules
- A town with shops, a station, a school, a river, a park
- Classmates, a teacher, a principal
- Compass directions, relative positions, exits, entrances
- Weather, time (AM/PM), days of the week, dates
- Communication verbs (read, write, speak, hear, see)
- A body with eyes, ears, hands, feet
- Emotions ranging from happy/interested/delicious to painful/sad/scary
- An economy (money, shopping, food)
- An outside (foreign countries, languages, nationalities)
- A mystery thread (ゆき's observations, ミキ's reading, the town's inconsistencies)

This is the complete N5 game world. Everything from this point forward (N4) is expansion, complication, and deepening. The foundation is built.

**Design note — no "you completed N5!" fanfare:** The game doesn't announce that N5 is finished. There is no achievement popup, no credits, no summary screen. Day 18 ends like any other day — dinner, phone messages, bed. The transition to N4 is seamless. The player may not even realize they've crossed a threshold until they notice the lesson numbers have changed. This is intentional: language learning doesn't have a finish line. N5 is a milestone, not a destination. The game treats it as a Wednesday.

---

### Story Beats

| Moment | What Happens | What the Player Should Feel |
|---|---|---|
| Mom notices Rikizo's eyes | 目 as the first body-part observation | My character has a body now |
| すずき's body-sense list | Eyes see, ears hear, hands write, feet walk | The organism is complete — every part has a function |
| けん says いたい | First pain in the game | Lightness — pain is comic here, not tragic |
| ゆき is sad about flowers | かなしい — the first sadness | Tenderness. The world can feel loss. |
| けん's unfinished ghost story | こわい — the school at night... | Intrigue. What was he going to say? |
| Dad reads the newspaper | 新聞 — information about 社会 | The world is bigger than what we can see |
| Day ends normally | No fanfare. N5 is complete. | Wait... is that it? (Yes. That's the point.) |

---

### Running Gags Updated (End of N5 arc)

1. **The Fridge** — Eternal. 18 days and counting. The fridge will outlive the game.
2. **けん and Tests** — Recurring. Every class. 「テストは？」 This gag has legs through all of N4.
3. **ミキ's Book** — Rotating titles. Now into Day 6 of the readable-title mechanic. She's reading something about nature (Day 18 theme).
4. **Station Master** — Still waiting. No trains. The station has 出口 and 入り口 signs now. The exits lead to the same place. The entrances lead to the same place. The station master guards a loop.
5. **Yamakawa's Existence** — Not a part-timer. Not a student. Just... present. At the コンビニ. Every day. The game's most benign mystery.
6. **What Yuki Notices** — She noticed the school was new. She noticed the flowers fading. She notices everything nobody else does. The data accumulates.
7. **Dad's Job** — He goes to 会社. He comes home. He reads the 新聞. His life outside the house is a black box with a newspaper-shaped output.

**Quest log state (end of Day 18 / end of N5):**
> 📋 Quest Log
> ✓ 水を飲む (Day 5 → Day 5)
> ✓ おにぎりを食べる (Day 5 → Day 8)
> ✓ お母さんの買い物 (Day 8 → Day 9)
> ✓ ノートに名前を書く (Day 9 → Day 13)
> ◻ やまかわのごはん: 新しい食べ物をさがす (Day 10 → ???)
> ◻ ゆきのきおく: ゆきの話を聞く (Day 11 → N4)

Two open quests carry into N4. Everything else is resolved. The foundation supports what comes next.

---

### State Tracking (End of Day 18 / End of N5)

**Cumulative world state — full N5 summary:**

| Category | State |
|---|---|
| **Locations** | House (all rooms), コンビニ, デパート, 駅 (empty), 学校 (weekdays), river, park, けん's house, hotel |
| **Named NPCs** | Mom, Dad, Yamakawa, ゆき, すずき先生, けん, リー, ミキ, station master, hotel clerk, 校長 |
| **Economy** | Wallet active. Shopping at コンビニ and デパート. No income system yet. |
| **Time system** | Calendar (dates), day-of-week, 午前/午後 split, weekday/weekend rhythm |
| **School** | Weekdays only. Class scenes daily. すずき teaches, けん disrupts, リー studies, ミキ reads. |
| **Spatial** | Compass (N/S/E/W), relative (上下左右), exits/entrances labeled |
| **Communication** | Phone (email + text), writing (書く), reading (読む), speech verbs (話す/言う) |
| **Perception** | 見る/見える/見せる, 聞く. Body parts: 目/耳/手/足/口 |
| **Emotions** | Positive: おもしろい, きれい, おいしい, たのしい, うれしい. Negative: いたい, かなしい, こわい |
| **Mystery threads** | ゆき's observations (school new, flowers fading, writing remains). ミキ's reading. Station with no trains. Yamakawa's non-employment. |
| **Relationship max** | Most NPCs at 10–15 range depending on player engagement |

**Hidden stats (approximate end-of-N5 ranges):**
```
paranoia:       3–8 (depending on ゆき interactions)
curiosity:      5–12 (depending on exploration)
dad_annoyance:  0–3 (mostly cooled by daily decay)
```

---

### Art Assets Required (Day 18)

| Asset | Type | Priority | Notes |
|---|---|---|---|
| Dad with newspaper | Sprite variant | High | Evening Dad, seated, holding 新聞. New default evening pose. |
| けん rubbing leg | Sprite variant | Medium | いたい expression — comedic pain, not serious injury |
| Fading flowers (river) | BG variant | Medium | Cherry blossoms thinning compared to Day 11. Seasonal progression. ゆき notices. |

Light asset day — the final N5 lesson adds emotional range, not physical locations.

---

### Open Questions for Day 18

1. **聞こえる (to be audible) availability** — Is 聞こえる in the N5 glossary alongside 聞く? If yes, it mirrors the 見る/見える pair. If not, Day 18 only has active perception (聞く = choose to listen), not passive (聞こえる = sounds reach you). Check before implementation.

2. **けん's ghost story** — How much of the story does he tell before すずき interrupts? Recommendation: enough to establish "school at night is scary" as a concept, not enough to tell a complete narrative. The interruption IS the point — the story is unfinished, creating anticipation. In N4, けん can tell the full version during a nighttime school event (cultural festival preparation, etc.).

3. **N5 → N4 transition** — Is there any in-game marker? Recommendation: no explicit marker. Day 19 simply starts with new kanji and the lesson counter reads N4.1. The player might notice the level change in the app UI (lesson selection screen) but the game world is continuous. Maybe すずき says 「新しい本がありますよ」— same phrase as Day 12, but this time it's the N4 textbook. A quiet callback.

4. **Seasonal progression** — ゆき notices flowers fading. Should the game track real seasonal changes? Recommendation: yes, subtly. Cherry blossoms fade through mid-May. By June (N4 mid-range), rainy season begins. The background art and ゆき's commentary shift with the calendar. Weather affects NPC placement: rainy days move outdoor NPCs indoors or under awnings. This is a significant system investment but massively atmospheric.

---
