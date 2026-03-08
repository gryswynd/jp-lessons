# N5 Game Roadmap — "Golden Week"

## Core Premise

Rikizo is a high schooler on Golden Week vacation. The world outside his house is... not there yet (but he doesn't know that — it's just "foggy" or "I haven't been that way in a while"). As lessons unlock vocabulary, the corresponding things materialize in the game world. Rikizo never questions this. The player does.

**The comedy:** Rikizo is blissfully, heroically oblivious. A building materializes where empty lot was yesterday? "Oh, I never noticed that before!" The sky glitches? "Weird clouds today." Someone says something existentially terrifying? "Haha, you're funny, Yamakawa."

**The horror is for the player.** Rikizo is having a great Golden Week.

**Tone:** Somewhere between One Punch Man's comedic obliviousness and a slow-burn cosmic dread. The wasurebito are NOT visible in N5. No combat. No direct threats. Just a world that shouldn't exist, populated by people who don't remember not existing, observed by a protagonist who doesn't notice anything is wrong. The player notices everything.

## Structural Rules

- **One game day per lesson.** Completing lesson N5.X unlocks Day X.
- **Vocab/kanji from the lesson = what exists in that game day. Period.** If a kanji or word isn't taught yet, it doesn't exist in the world.
- **Can't leave the house/yard until Day 5** (N5.5 teaches 行/来/店/駅 — the verbs to go/come and the places to go to).
- **Can't enter buildings until Day 9** (N5.9 teaches 中/外 — inside/outside). Before that, shops use passthrough windows/counters.
- **School doesn't exist until Day 12** (N5.12 teaches 学/校).
- **Days 1–11 = Golden Week vacation.** Formally established in Day 10 when 休み unlocks.
- **Smartphone from Day 1.** Modern communication — texts, emails, photos. No mailbox quests.
- **RPG inventory system.** Items can be collected, bought, quest-rewarded.
- **Money = teaching payment.** Dad gives Rikizo money he earned from tutoring (the meta: Rikizo teaches Japanese). Running gag: if the player earns too much, Dad pockets the extra claiming it's "for university." In late N4, if the player has earned absurd amounts, Dad starts appearing with luxury items he claims he "found."
- **No combat in N5.** Still under consideration for late N5, but the current plan is combat-free. The threat is atmospheric only.

## Character Roster (N5)

| Character | ID | First Appears | Role |
|---|---|---|---|
| Mom (さくら) | `char_sakura` | Day 1 (in person) | Home base, emotional anchor |
| Dad (たろう) | `char_taro` | Day 1 (in person) | Home base, comic relief, money gag |
| すずき先生 | `char_suzuki` (TODO: add to characters.json) | Day 1 (smartphone only), Day 12 (in person) | School Japanese teacher |
| やまもと先生 | `char_yamamoto` | TBD | School teacher (different from Suzuki) |
| やまかわ | `char_yamakawa` | Day 1 (smartphone only), Day 5 (in person) | Best friend, exploration buddy, always eating |
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

### Location

**Rikizo's house — interior + fenced yard.** The front gate is locked. Beyond the fence: white haze. Not dark, not ominous — just... white. Like fog, but with nothing behind it. Rikizo doesn't think this is unusual. The player will.

**Rooms:**
- Rikizo's bedroom (ベッド, パソコン, window)
- Living room (テレビ, こたつ, window)
- Kitchen (れいぞうこ, table)
- Bathroom/toilet (トイレ, door that opens/closes)
- Genkan/entryway (げんかん, front door → yard)
- Yard (small, fenced, gate locked, tree visible from Day 2 prep)

### NPCs

#### Mom (さくら) — Kitchen area

Mom is the warm, supportive anchor of the early game. She greets Rikizo in the morning and has different dialogue depending on time of day (though time-of-day mechanics don't fully activate until Day 4).

**Conversation (5 lines):**
1. **Mom:** 「おはよう、りきぞう！」 — "Good morning, Rikizo!"
2. **Rikizo:** 「おはよう、お母さん。」 — "Good morning, Mom."
3. **Mom:** 「あなたはとてもいい先生ですよ。」 — "You are a very good teacher, you know."
4. **Rikizo:** 「そうですか？うれしいです！」 — "Really? That makes me happy!"
5. **Mom:** 「お母さんがいちばんうれしいですよ。」 — "Mom is the happiest of all."

*(Note: This conversation already exists in the current day.json and establishes the meta-narrative — Rikizo is a teacher. The player is his student.)*

**Repeatable line (after first conversation):** 「いい子ですね。」("You're a good kid.") — rotates through a few warm one-liners.

#### Dad (たろう) — Living room area

Dad is the comic relief anchor. He's slightly stern, protective of his stuff, but fundamentally kind. He has two running gags that persist across the entire game:

1. **The fridge.** Dad guards it. Every time you interact with the fridge, Dad has something to say. This escalates across days.
2. **The money.** Dad manages Rikizo's teaching income. He skims off the top "for university."

**Conversation (5 lines):**
1. **Dad:** 「よ、りきぞう！先生ですか？」 — "Hey, Rikizo! Are you a teacher?"
2. **Rikizo:** 「はい！わたしは先生です。」 — "Yes! I am a teacher."
3. **Dad:** 「やさしい先生ですか？」 — "Are you a kind teacher?"
4. **Rikizo:** 「はい、とてもやさしい先生です！」 — "Yes, a very kind teacher!"
5. **Dad:** 「そうか。りきぞうはいちばんいい先生です。」 — "Is that so. Rikizo is the best teacher."

*(Note: Also already exists in day.json.)*

**Repeatable line:** 「お父さんのれいぞうこです！」("That's Dad's fridge!") — triggered when interacting with the fridge.

### Interactive Objects

| Object | nameJp | Location | Interaction | Notes |
|---|---|---|---|---|
| Bed | ベッド | Bedroom | 「いいベッドです。」("A comfortable bed.") | Save point? Or just flavor. |
| Laptop | パソコン | Bedroom | 「わたしのパソコンです。」("My laptop.") | Could be used for email/messaging UI later. |
| TV | テレビ | Living room | 「テレビです。」("The TV.") | Static/white noise easter egg? Just shows white — like the outside. Rikizo doesn't notice the parallel. |
| Kotatsu | こたつ | Living room | 「こたつです。とてもいいです！」("The kotatsu. Very nice!") | Comfort object. Rikizo loves it. |
| Fridge | れいぞうこ | Kitchen | 「お母さんのれいぞうこです。」/ Dad yells | Dad's territory. |
| Toilet | トイレ | Bathroom | **DOOR GAG:** If you interact without closing the door first, Dad yells 「ドアです！ドアです！」("The door! The door!"). Close the door first → 「トイレです。」 | Running gag potential: Dad always knows. Even from across the house. |
| Bedroom door | ドア | Bedroom→hallway | Standard door transition | |
| Bathroom door | ドア | Hallway→bathroom | Opens/closes (relevant for toilet gag) | |
| Kitchen door | ドア | Hallway→kitchen | Standard door transition | |
| Front door | げんかん | Entryway→yard | Opens to yard | |
| Gate | もん/ゲート | Yard edge | **LOCKED.** 「ゴールデンウィークです！まだ出ません。」("It's Golden Week! Not going out yet.") | Presented as a normal vacation choice. Actually: the world doesn't exist. The gate is the first of many "totally normal" barriers that are actually the void. |
| Window (any) | まど | Various rooms | 「外は白いです。きりですね。」("Outside is white. It's foggy, huh.") | The casual description of the void. Rikizo says it like commenting on weather. The player should feel a chill. |

### Smartphone

Day 1 introduces the smartphone as the primary communication device. It sits in Rikizo's inventory from the start.

**Messages received on Day 1:**

1. **すずき先生:** 「りきぞうさん、ゴールデンウィークです！いい休みですよ。少し勉強もしてくださいね。」("Rikizo, it's Golden Week! Have a good break. Study a little too, okay.") — Classic teacher energy. Establishes Suzuki before meeting her in person on Day 12.

2. **やまかわ:** 「りきぞう！ゴールデンウィーク！いいですね！」("Rikizo! Golden Week! Nice!") — Yamakawa's text energy is pure enthusiasm. No substance. Establishes him as a friend before meeting in person on Day 5.

*(Note: These messages use some grammar/vocab slightly beyond strict N5.1 for naturalness — 休み, 勉強, してください. This is acceptable in passive smartphone content that the player reads but doesn't need to produce. The tappable terms still link to the glossary for any word the player wants to look up. Alternatively, we can restrict these to N5.1-only vocab if strict gating is preferred — your call.)*

### Quests

**No formal quests on Day 1.** This is a pure exploration/tutorial day. The player learns:
- How to move Rikizo around the house
- How to interact with objects (tap/approach)
- How to talk to NPCs
- How to read the smartphone
- How to access inventory

The "objective" is implicit: talk to Mom, talk to Dad, explore every room, check the phone. No quest log, no checkboxes. Just discovery.

### Story Beats & Foreshadowing

| Moment | What Happens | What Rikizo Thinks | What the Player Should Feel |
|---|---|---|---|
| Looking out any window | White haze everywhere outside the fence | 「きりですね。」("Foggy.") | Why is it white? Not grey like fog — white. Like nothing. |
| Trying the gate | Gate won't open | 「ゴールデンウィークです！」(cheerful) | He's... happy about being trapped? |
| Dad leaves/returns (if implemented) | Dad somehow passes through the gate | Rikizo doesn't comment | HOW. Dad can leave but Rikizo can't? Where does Dad GO? |
| TV static | TV shows white noise / white screen | 「テレビがおかしいです。」("TV's being weird.") | The static looks like the outside. Same white. |
| Talking to Mom about outside | Mom deflects cheerfully | 「ゴールデンウィークはうちがいちばんです！」("Home is the best during Golden Week!") | She's actively keeping him inside. Why? |

**Tone calibration:** None of these moments should feel horror-coded on their own. Each one is individually explainable (fog, vacation, broken TV). It's only the accumulation — across days, across the whole N5 arc — that builds dread. Day 1 should feel cozy with a single "huh" moment if the player is paying attention.

### Running Gags Established on Day 1

1. **Dad's Fridge** — Interact with fridge → Dad reacts. This escalates every day. Day 1: 「お父さんのれいぞうこです！」 Future days will add increasingly dramatic reactions.

2. **The Toilet Door** — Interact with toilet without closing bathroom door → Dad yells from wherever he is in the house. This persists as a background gag. Dad has a sixth sense for open bathroom doors.

3. **The Gate** — Every day until Day 5, interacting with the gate gets a different "nah, staying home" excuse. The excuses get thinner each day. Day 1: Golden Week. Day 2: "It's foggy." Day 3: "I have money but nowhere to go." Day 4: "It's too early/late." Day 5: It opens.

4. **Teaching Payment** — Established in concept (Dad mentions Rikizo's teaching earnings). The money mechanic activates properly on Day 3 when numbers/yen unlock.

### Assets Required

| Asset | Type | Mode | Priority | Notes |
|---|---|---|---|---|
| House interior map | Tilemap | A (Pixel) | **EXISTS** (map.png) | Current Day 1 asset. May need revision as rooms are fleshed out. |
| Collision map | Data | A (Pixel) | **EXISTS** (collision.png) | Current Day 1 asset. |
| Conversation background | Illustration | B (MP100) | **EXISTS** (convo-bg.png) | Current Day 1 asset. |
| Rikizo sprite | Sprite | A (Pixel) | **PARTIAL** (head exists) | Full walking sprite sheet needed. |
| Rikizo conversation portrait | Portrait | B (MP100) | Needed | Calm register. Friendly, open expression. |
| Mom sprite | Sprite | A (Pixel) | Needed | Kitchen/domestic pose. |
| Mom conversation portrait | Portrait | B (MP100) | Needed | Warm, gentle. At least 2 expressions (default, happy). |
| Dad sprite | Sprite | A (Pixel) | Needed | Living room pose. Slightly stern but kind. |
| Dad conversation portrait | Portrait | B (MP100) | Needed | At least 3 expressions (default, stern/yelling for fridge/toilet gags, proud). |
| Smartphone UI | UI element | B (MP100) | Needed | Message list, conversation view. Persistent across all days. |
| Gate sprite | Object sprite | A (Pixel) | Needed | Closed/locked state. Opens on Day 5. |
| Window overlay | Effect | A (Pixel) | Needed | White haze visible through windows. Subtle but present. |

### Non-Kanji Real-World Vocab Used

All items below are already in the N5.1 glossary:

| Word | Meaning | Glossary ID | Notes |
|---|---|---|---|
| ベッド | bed | v_beddo | Loanword |
| パソコン | computer | v_pasokon | Loanword |
| テレビ | TV | v_terebi | Loanword |
| トイレ | toilet | v_toire | Loanword |
| こたつ | kotatsu | (check) | May need adding |

**Potential additions needed for Day 1 game objects:**

| Word | Meaning | Needed for | Status |
|---|---|---|---|
| ドア | door | Interactive doors | Check glossary |
| まど | window | Window interaction | Check glossary — may be in later lesson |
| きり | fog/mist | Window dialogue | Check glossary — haze description |
| げんかん | entryway | Front door area | Check glossary |
| にわ | garden/yard | Yard area | Check glossary |

*(These may already exist in the glossary under later lessons. If so, they'd appear in jp text as pure hiragana since their kanji aren't taught yet. If they don't exist at all, we need to decide: add them to the glossary for N5.1, or restructure the interaction text to avoid them.)*

### Open Questions for Day 1

1. **Smartphone message gating:** Should smartphone messages strictly use only N5.1 vocab, or is passive reading content allowed to be slightly ahead (with tappable terms for lookup)? This affects how natural the texts feel.

2. **Dad leaving the house:** Do we show Dad passing through the gate that Rikizo can't open? This is a great subtle horror beat but requires implementing NPC movement scripting. Could be Day 4 instead (when time mechanics unlock and Dad has a "schedule").

3. **Save system:** Is the bed a save point? Or does the game auto-save? This affects whether the bed interaction has gameplay significance or is just flavor text.

4. **こたつ in glossary:** Need to verify こたつ has a glossary entry. If not, add it — it's a culturally important item and a running comfort gag.

5. **Rikizo's name spelling:** Characters.json has surface `りきぞ` with match `りきぞう`. The existing day.json uses `りきぞう` throughout. Which is canonical for in-game dialogue?

---

*Next: Day 2 — "The Yard" (N5.2: Days of the Week) — pending approval of Day 1.*
