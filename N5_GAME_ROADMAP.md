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

**New this day:** Currency system activates. Demonstrative pointing (これ/それ/あれ). Numbers appear on things.

### Location

**Same as Day 2 — house + yard.** No new areas unlock. The void boundary hasn't moved. The tree is still there.

**Interior changes:**
- The calendar now shows dates (日 numbers), not just days of the week
- A coin purse / wallet appears on Rikizo's desk in the bedroom (currency UI trigger)
- Objects in the house now have quantities when inspected (「三つです」etc.)
- Dad's 金 coin now has a stated value

**Exterior:** No changes from Day 2.

### NPCs

#### Mom (さくら) — Kitchen area

Mom introduces money. She gives Rikizo his first 円.

**Conversation — "Allowance" (4 lines):**
1. **Mom:** 「りきぞ、これはお金ですよ。」 — "Rikizo, this is money." *(Uses これ — first demonstrative in dialogue)*
2. **Rikizo:** 「いくらですか？」 — "How much is it?"
3. **Mom:** 「百円です。大切ですよ。」 — "100 yen. It's important."
4. **Mom:** 「毎日、百円ですからね。」 — "100 yen every day, okay?" *(Daily allowance established — から meaning "because that's the rule")*

**Mechanical result:** Player receives 100円. Balance appears in a UI element (coin purse icon?). **There is nothing to spend it on.** The allowance accumulates each day the player visits Mom — this becomes meaningful later when shops exist (Day 5+).

**Repeatable line:** 「今日のお金ですよ。百円です。」("Here's today's money. 100 yen.") — Collectible once per day-visit.

#### Dad (たろう) — Living room area

Dad's gold coin gag evolves. Now that numbers and money exist, the coin has a price.

**Conversation — "The Price of Gold" (4 lines):**
1. **Rikizo:** 「お父さん、金はいくらですか？」 — "Dad, how much is the gold?"
2. **Dad:** 「一万円です。」 — "10,000 yen." *(Absurdly high for one coin. Dad is either delusional or the coin is genuinely rare.)*
3. **Rikizo:** 「一万円！？」 — "10,000 yen!?"
4. **Dad:** 「お父さんの金です。」 — "It's Dad's gold." *(Same possessive energy as Day 2. Not for sale.)*

**Triggered — "Attempted Purchase" (if player interacts with the gold coin after learning its price):**

> Rikizo: 「百円...一万円...百円...」("100 yen... 10,000 yen... 100 yen...")
>
> *(He does the math. He has 100 yen. The coin costs 10,000 yen. This is going to take a hundred days.)*
>
> Dad (from across the room): 「だめですよ。」("No.")

**Running gag update:** The gold coin now has a PRICE, which makes it a long-term comedy goal. At 100円/day, the player needs 100 days of allowance to afford it. Whether Dad would actually sell it at that price is... unclear. He has never said he would sell it. He has only stated what it is worth.

### Interactive Objects

**Interior (updated):**

| Object | nameJp | Location | Interaction |
|---|---|---|---|
| Calendar | カレンダー | Kitchen wall | Now shows dates too: 「今日は[X]月[Y]日です。」Uses month + date vocab. |
| Gold coin | 金 | Living room shelf | 「一万円の金です。お父さんのです。」("10,000-yen gold. Dad's.") Touch attempt still triggers 「金！だめ！」 |
| Coin purse | — | Bedroom desk | 「お金です。百円です。」 Shows current balance. This is the currency UI anchor object. Player can check balance anytime by interacting with it. |
| Water bottle | 水 | Inventory | Already collected on Day 2. Still in inventory. Still useless. |
| Fridge | れいぞうこ | Kitchen | Updated: 「お母さんのれいぞうこです。中に何がありますか？」("Mom's fridge. What's inside?") — **Cannot open it.** Not because it's locked — Rikizo just doesn't open it. He asks what's inside, as if it's a philosophical question. He does not check. |

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

Numbers enable counting the family. This is a small moment but uses 何人 and the people counters.

**Triggered when talking to Mom after receiving allowance:**

1. **Rikizo:** 「かぞくは何人ですか？」 — "How many people are in the family?"
2. **Mom:** 「五人ですよ。お父さんとお母さんと、お兄さんとお姉さんと、りきぞ。」 — "Five. Dad, Mom, big brother, big sister, and Rikizo."
3. **Rikizo:** 「五人...それから、木-さんも！六人です！」 — "Five... and then, Tree-san too! Six people!"
4. **Mom:** 「...木は人ではないですよ。」 — "...A tree is not a person."

Uses: 何人, 五人, 六人, それから, も, と (listing).

### Birthday Mini-Scene

たんじょうび (birthday) is N5.3 vocab. Small optional conversation with Dad.

**Triggered if player talks to Dad after the gold coin conversation:**

1. **Rikizo:** 「お父さんのたんじょうびはいつですか？」 — "When is Dad's birthday?"
2. **Dad:** 「五月五日ですよ。」 — "May 5th."
3. **Rikizo:** 「五月五日...今月ではないですね。」 — "May 5th... not this month, huh."
4. **Dad:** 「それから、金はだめですよ。」 — "Also, the gold is off limits." *(Preemptive. He knows where this was going.)*

Uses: たんじょうび, いつ, 五月, 五日, 今月, それから.

### Story Beats

| Moment | What Happens | What Rikizo Thinks | What the Player Should Feel |
|---|---|---|---|
| Receiving 100円 | Mom hands over the first money | 「百円です！」(happy) | The world now has a currency. Weird that Rikizo is just getting his first money as if this is normal — was there no money before? |
| Learning the gold coin costs 10,000円 | Dad puts a number on the gold | Does the math. Realizes it'll take 100 days. | Long-term comedy hook. The player now has a distant goal that may or may not be achievable. |
| Counting the family | Five people — plus Tree-san | Counts the tree as a person | Charming. Rikizo genuinely considers the tree family. Mom's correction is gentle but firm. |
| Nothing to buy | Has money. World is: house, yard, tree, dirt, void. | Doesn't notice there's nothing to buy | The player notices. 100 yen and nowhere to spend it. The economy has no market. The yard has no shop. There is only void. |
| Greeting the tree | Daily ritual established | 「木-さん、今日もいい日ですね。」 | The tree is becoming a real character through repetition. Rikizo's commitment to this friendship is unreasonable and endearing. |

**Tone calibration for Day 3:** The comedy shifts from existential (void, things appearing from nothing) to absurdist-economic. Rikizo has money in a world with nothing to buy. He counts family members and includes a tree. Dad has assigned a price to gold that would take 100 days of allowance to reach. The number concepts are used immediately but the economy they imply doesn't exist yet — the gap between "knowing numbers" and "having things to count" is the joke.

### Running Gags Updated

1. **The Toilet Door** — Continues.
2. **Dad's Gold** — Evolves. Now has a price (一万円). The gag shifts from "don't touch" to "you can't afford it." Both are true. Neither helps Rikizo.
3. **Tree-san** — Becomes a daily greeting. 木-さん is now family (to Rikizo, not to Mom).

### Assets Required

| Asset | Type | Mode | Priority | Notes |
|---|---|---|---|---|
| Coin purse sprite | Object/UI sprite | A (Pixel) | Needed | Sits on bedroom desk. Also serves as the currency UI icon. |
| Currency UI overlay | UI element | — | Needed | Shows 円 balance. Minimal — just a number + 円 symbol. Appears when collecting money and when checking the coin purse. |
| Updated calendar UI | UI element | — | Low | Calendar now supports month + date display alongside day-of-week. Could be a tab or second interaction on the same object. |

### Non-Kanji Real-World Vocab Used

None new beyond existing game vocab (カレンダー, etc).

### Open Questions for Day 3

1. **Allowance persistence:** Does the 100円 accumulate daily (every time the player enters Day 3+), or is it a one-time Day 3 gift? Daily accumulation creates the long-term gold coin goal (100 days × 100円 = 10,000円). One-time is simpler. Recommendation: daily accumulation — it gives the player a reason to visit Mom every day and creates a passive savings mechanic.

2. **Siblings:** Mom counts 五人 including お兄さん and お姉さん, but neither sibling has appeared yet. They're referenced but absent — like they exist elsewhere and just haven't come home. Is this intentional? The siblings could appear later (when the world expands) or remain permanently off-screen as a running mystery.

3. **Fridge:** Rikizo asks what's inside but doesn't open it. Is this a permanent state (the fridge is an existential object you can never open), or does it open on a future day? If it never opens, that's funny. If it opens later with food items (Day 8 when food vocab arrives), that's a reveal.

---

*Pending approval before writing Day 4.*
