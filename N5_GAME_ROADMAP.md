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
| ドア | door | v_doa | Check | Needed for door interactions and toilet gag |
| こたつ | kotatsu | v_kotatsu | Check | Culturally important. Needs a lesson assignment — TBD which lesson. |

### Resolved Design Decisions

1. **Save system:** Bed = save point. Laptop auto-saves before exiting to lesson menu.
2. **Day transition:** Days unlock via lesson completion (passing score required), not from within the game. The laptop is the exit point. No in-game day/night cycle on Day 1.
3. **Void visual:** Pure nothing. White. No ground, no sky, no texture, no particles, no sound. Empty.
4. **Rikizo spelling:** りきぞ is canonical. Updated in day.json.

### Open Questions for Day 1

1. **こたつ lesson assignment:** こたつ needs a formal glossary entry with a lesson_ids. N5.1 is already vocab-heavy (40+ entries). Options: (a) add it to N5.1 anyway since it's present from Day 1, (b) assign it to a later lesson like N5.7 (Size & Food — domestic items feel at home there) and treat it as a visible-but-not-formally-introduced background object until then, or (c) add it to a new "game vocab" category that exists outside the lesson progression. Your call.

---

*Pending approval before writing Day 2.*
