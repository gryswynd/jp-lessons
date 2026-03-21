# Term Tagging & Character Names — Complete Reference

> **Loaded by:** Agent 2 (Content Builder) and Agent 3 (QA Reviewer) for any content with jp + terms[] fields.
> **Purpose:** Defines how to tag every token type (nouns, verbs, adjectives, particles, counters, character names) in terms arrays. Includes disambiguation rules for particles with multiple roles.

---

## Term Tagging Reference

### The fundamental rule

> **Nouns, adverbs, particles, question words** → bare string: `"v_foo"` or `"k_foo"`
>
> **Verbs and い/な adjectives** → object with form: `{ "id": "v_foo", "form": "te_form" }`

Use the form that matches the **surface text** of the specific sentence. If the same verb appears in two sentences in different forms, tag each with its own form.

### Valid form strings (from `conjugation_rules.json`)

| Form string | Meaning |
|---|---|
| `polite_masu` | ～ます |
| `polite_mashita` | ～ました |
| `polite_negative` | ～ません |
| `polite_past_negative` | ～ませんでした |
| `polite_adj` | adjective + です |
| `attributive_na` | na-adjective + な (before a noun, e.g. きれいな花) |
| `polite_past_adj` | adjective past + です (polite: かったです / でした) |
| `plain_past_adj` | adjective past plain (かった / だった — casual speech) |
| `plain_past` | ～た / ～だった |
| `plain_negative` | ～ない |
| `plain_past_negative` | ～なかった |
| `te_form` | ～て / ～で |
| `potential` | ～られる / ～える (plain potential — can do) |
| `polite_potential` | ～られます / ～えます (polite potential — can do) |
| `potential_negative` | ～られません / ～えません (polite potential negative — cannot do) |
| `plain_potential_negative` | ～られない / ～えない (plain potential negative — casual "can't do") |
| `polite_potential_past` | ～られました / ～えました (polite past potential — was able to do) |
| `plain_potential_past` | ～られた / ～えた (plain past potential — casual "could do") |
| `adverbial` | ～く / ～に |
| `plain_desire_tai` | ～たい (plain desire — casual speech and subordinate clauses; for polite ～たいです, use `plain_desire_tai` + `g_desu`) |
| `desire_tai_negative` | ～たくない (plain negative desire — I don't want to) |
| `polite_desire_tai_negative` | ～たくないです (polite negative desire — I don't want to) |
| `desire_tai_past` | ～たかったです (polite past desire — I wanted to) |
| `plain_desire_tai_past` | ～たかった (plain past desire — casual "I wanted to") |
| `appearance_sou` | ～そうです (polite appearance) |
| `plain_appearance_sou` | ～そうだ (plain appearance — casual speech) |
| `polite_volitional_mashou` | ～ましょう |
| `plain_volitional` | ～おう / ～よう (plain "let's" / intention) |
| `plain_form` | verb in dictionary/base form — plain present affirmative predicate and nominalisations (のは/のが) |
| `conditional_ba` | ～ば / ～ければ |
| `tari_form` | ～たり (listing representative actions: ～たり～たりする) |
| `polite_negative_te` | ～ないで (negative te-form: "without doing"; ないでください = "please don't") |
| `sugiru_form` | ～すぎる (plain excessive degree — too much / excessively) |
| `polite_sugiru_form` | ～すぎます (polite excessive degree — too much / excessively) |
| `nagara_form` | ～ながら (while doing — simultaneous actions) |
| `conditional_tara` | ～たら / ～だったら (if / when — completed-action conditional) |
| `passive` | ～られる / ～れる (plain passive — being acted upon) |
| `polite_passive` | ～られます / ～れます (polite passive) |
| `polite_passive_past` | ～られました / ～れました (polite past passive) |
| `plain_passive_past` | ～られた / ～れた (plain past passive — for stories/casual) |
| `causative` | ～させる / ～せる (plain causative — making/letting someone do) |
| `polite_causative` | ～させます / ～せます (polite causative) |
| `polite_causative_past` | ～させました / ～せました (polite past causative) |
| `plain_causative_past` | ～させた / ～せた (plain past causative — for stories/casual) |
| `causative_passive` | ～させられる / ～せられる (plain causative-passive — "being made to do") |
| `polite_causative_passive` | ～させられます / ～せられます (polite causative-passive — "being made to do") |
| `polite_potential_negative` | ～られません / ～えません (polite potential negative — properly-named alias for `potential_negative`) |
| `sugiru_past` | ～すぎた (plain past excessive — "was too much") |
| `polite_sugiru_past` | ～すぎました (polite past excessive — "was too much") |

**Unlock schedule.** Each form is available from the grammar lesson that formally teaches it. The `introducedIn` field in `conjugation_rules.json` records this, using grammar lesson IDs (e.g. `"G6"`) or content lesson IDs (e.g. `"N5.1"`). All forms have this field. Similarly, particles in `shared/particles.json` carry an `introducedIn` field using lesson or grammar IDs.

**Note on `potential_negative` naming.** Despite the name, `potential_negative` produces the **polite** negative potential form (～られません / ～えません). Use `plain_potential_negative` for the plain/casual form (～られない / ～えない). This asymmetry is a legacy naming issue — do not rename to avoid breaking existing content.

**Godan euphonic note.** `tari_form` and `conditional_tara` use `godan_euphonic` map types (`"map": "tari_form"` and `"map": "tara_form"`) that parallel `ta_form` but produce たり/だり and たら/だら endings respectively. Both maps are defined in `GODAN_MAPS` in `app/shared/text-processor.js`. All ichidan, irregular, and adjective rules are fully defined in data. If a future form adds a new `godan_euphonic` map name, that name must be added to `GODAN_MAPS` — see the Agent 1 godan_euphonic engine map check above.

### い-adjective form selection — attributive vs predicate

い-adjectives have two distinct syntactic positions that require different tagging:

| Position | Example | Form | Tag |
|---|---|---|---|
| **Attributive** — modifies a noun (〜い + noun) | 長い 一日、大きい 魚、小さい 声 | dictionary form | bare string: `"v_nagai"` |
| **Predicate** — sentence-final before です/でした | 一日が 長いです、魚が 大きいです | adjective + です | `{ "id": "v_nagai", "form": "polite_adj" }` |

**The critical distinction:** `polite_adj` means the adjective IS the predicate of a sentence ending `〜いです`. It does **not** mean "used politely." An い-adjective that precedes a noun is in attributive position and takes a **bare string** regardless of the surrounding sentence's register.

**Common error:** Seeing 「長い 一日でした」and tagging `長い` as `polite_adj` because the sentence is polite. Wrong — `長い` here modifies 一日 (attributive), so it is a bare string. The copula でした carries the polite register, not the adjective.

**Quick test:** "Is this adjective the main predicate before a です/でした?" → `polite_adj`. "Does it appear before a noun?" → bare string.

な-adjectives follow the same pattern with a dedicated form string:
- **Attributive** (before a noun): `{ "id": "v_taisetsu", "form": "attributive_na" }` — e.g. 大切な こと、きれいな 花
- **Predicate** (sentence-final): `{ "id": "v_taisetsu", "form": "polite_adj" }` — e.g. 大切です、きれいです

### Purpose construction (masu-stem + に)

The masu-stem + に construction expresses purpose ("in order to ~"). Examples: 買いに、食べに、借りに、送りに. There is **no form string** for this construction in `conjugation_rules.json` — it is a grammatical construction, not a conjugated form. Tag purpose verbs with `form: null`:

```json
{ "id": "v_kau", "form": null }
```

Do not use `polite_masu` (which implies the verb is the sentence predicate in ます form) or `te_form` (which implies a て-connector or request). The `form: null` tag makes the verb chip tappable with its dictionary-form gloss, which is correct for this construction.

**`form: null` is only valid for purpose construction and story `terms.json` keys.** For all other verbs, a form string is required. If a plain dictionary-form verb appears as a predicate or in a nominalisation (のは/のが), use `plain_form`. If the required form string does not exist in `conjugation_rules.json`, flag it to Agent 1 to create the entry — never fall back to `form: null` as a substitute.

### desire_tai — deprecated; always use plain_desire_tai + g_desu

**`desire_tai` is deprecated.** Do not use it. It was designed with `たいです` as the chip suffix, making it a single monolithic chip — the `です` is not separately tappable. This conflicts with the architecture principle that `g_desu` should always be independently tappable.

**Always use `plain_desire_tai` + `g_desu` for polite 〜たいです sentences:**

```json
{ "jp": "日本に 行きたいです。", "terms": [
  "v_nihon",
  "p_ni",
  { "id": "v_iku", "form": "plain_desire_tai" },
  "g_desu"
]}
```

The `plain_desire_tai` chip surface covers `行きたい`; the `g_desu` chip separately covers `です`. Both are independently tappable.

| Sentence ending | Form | Chip pattern |
|---|---|---|
| 〜たいです (polite) | `plain_desire_tai` + `g_desu` | two tappable chips |
| 〜たい (plain/casual, subordinate clause) | `plain_desire_tai` alone | one chip |
| 〜たいですか (polite question) | `plain_desire_tai` + `g_desu` + `p_ka` | three chips |

The same two-chip principle applies to other `たい` family forms in polite speech. `desire_tai_negative` (〜たくない) and `desire_tai_past` (〜たかった) are **plain** forms — they do not contain です. For polite sentences, pair them with `g_desu`: `desire_tai_negative` + `g_desu` for 〜たくないです, `desire_tai_past` + `g_desu` for 〜たかったです. In casual speech, they stand alone without `g_desu`. Note: `polite_desire_tai_negative` (〜たくないです) exists as a convenience form that bundles です, but `desire_tai_negative` + `g_desu` is preferred for consistency with the two-chip pattern.

### 何 (nani/nan) pronunciation tagging

何 has two distinct pronunciations that require different vocab IDs:

| Context | Pronunciation | Tag | Examples |
|---|---|---|---|
| Before を or が | なに | `v_nani` | 何を食べますか、何がいい |
| Standalone / isolation | なに | `v_nani` | 何？ |
| Before です | なん | `v_nan` | 何ですか |
| Before の | なん | `v_nan` | 何の本 |
| Before counters | なん | `v_nan` | 何人、何時 (but use compound IDs: `v_nannin`, `v_nanji`) |
| Before d/n/t sounds | なん | `v_nan` | 何で (by what means) |
| 何か (something) | なに | `v_nani` + `p_ka` | 何か食べませんか |

**Never use `k_nani`** in conversation, reading, or drill `terms` arrays. The `k_nani` entry is only for the kanjiGrid display. Using it makes 何 non-tappable.

**Compound words** like 何人 (`v_nannin`), 何時 (`v_nanji`), 何曜日 (`v_nanyoubi`), 何回 (`v_nankai`), 何度 (`v_nando`) have their own dedicated IDs — use those instead of `v_nan` + a separate counter/noun tag.

### 後 (ushiro/ato) orthographic disambiguation

後 has two **completely distinct words** (not pronunciation variants of the same word) that happen to share the same kanji:

| Written form | Reading | Meaning | Tag | Notes |
|---|---|---|---|---|
| 後ろ (with ろ) | うしろ | behind / in back of | `v_ushiro` | Spatial position word — always written with ろ appended |
| 後 (standalone) | あと | after / later | `v_ato` | Temporal word — standalone 後 with no kana suffix |

**Unlike 何/なに/なん, the written form alone disambiguates — no phonological context rules needed:**

- Token is `後ろ` → always `v_ushiro`
- Token is `後` (standalone, not followed by ろ) → always `v_ato`

**Never use `k_ushiro`** in conversation, reading, or drill `terms` arrays. It is only for the kanjiGrid display.

**Common temporal usages** to watch for: 後で (later/afterwards — tag `v_ato` + `p_de`), ～の後で (after ~), 三時間後 (three hours later — compounds have their own IDs when introduced).

**Compounds** that use the こう/ご on-reading (e.g. 午後, 後半) have their own dedicated vocab IDs and are not tagged as `v_ato`.

### が (ga) — subject marker vs clause connector disambiguation

が has two **completely distinct grammatical roles** that share the same surface form:

| Context | Role | Tag | Examples |
|---|---|---|---|
| After a noun/pronoun (marks subject) | Subject marker | `p_ga` | カレー**が**おいしい、お金**が**ない |
| After a clause-final verb/adjective/です (connects contrasting clauses) | Conjunction "but" | `p_ga_but` | 行きたいです**が**、お金がありません |

**Disambiguation rule — position determines role:**

- **が immediately after a noun/pronoun** → `p_ga` (subject marker)
- **が after a clause-ending form (ます/ました/ません/です/plain form)** → `p_ga_but` (conjunction "but")

**Both can appear in the same sentence:** 「行きたいですが、お金がありません。」 — first が = `p_ga_but` (after ですが = "but"), second が = `p_ga` (after お金 = subject marker). Tagging both as `p_ga` would show "subject marker" when the student taps the conjunctive が, which is actively misleading.

`p_ga_but` is available from G10. Before G10, all が in content should be `p_ga` (subject marker) — if が appears as "but" before G10, it is an out-of-scope grammar violation.

### から (kara) — "from" vs "because" disambiguation

から has two **distinct grammatical roles**:

| Context | Role | Tag | Examples |
|---|---|---|---|
| After a noun (starting point) | "From" | `p_kara` | 東京**から**、月曜日**から** |
| After a clause-final verb/adjective/です (gives reason) | "Because" | `p_kara_because` | おいしい**から**食べます、高いです**から**買いません |

**Disambiguation rule — what precedes から determines role:**

- **から after a noun** (place, time, person) → `p_kara` ("from")
- **から after a verb/adjective/です** (clause ending) → `p_kara_because` ("because")

`p_kara_because` is available from G10. Before G10, all から should be `p_kara` ("from"). If から appears as "because" before G10, it is an out-of-scope grammar violation.

**Note:** `p_kara` ("from") was introduced in G4/N5.2. The GRAMMAR_CONTENT.md spec for G10 explicitly states: "Note: から was taught in G4 as a starting-point particle ('from'). This is a different role — teach the distinction explicitly."

### けど (kedo) — casual "but"

けど is a casual clause-linking conjunction ("but") introduced in G10. It has no other grammatical role, so no disambiguation is needed. Tag all instances as `p_kedo`.

けれど is a slightly more formal variant of けど. Both are tagged as `p_kedo`.

### でも (demo) — "even/any~" vs sentence-initial "but"

でも has two distinct roles depending on position:

| Context | Role | Tag | Available from |
|---|---|---|---|
| After a noun ("even X") or in compounds (何でも, いつでも) | Inclusive particle "even / any~" | `p_demo` | N4.14 |
| At the start of a sentence ("But..." / "However...") | Conjunction "but" | `p_demo_but` | G19 |

**Disambiguation rule — position determines role:**

- **でも after a noun** → `p_demo` (子どもでもわかる = "even a child understands")
- **でも at the start of a sentence/clause** → `p_demo_but` (でも、行きます = "But I'll go")

### と (to) — connective vs quotation disambiguation

と has two **completely distinct grammatical roles** that share the same surface form:

| Context | Role | Tag | Available from |
|---|---|---|---|
| Between nouns (A and B) or with action verbs (do X with Y) | Connective "and / with" | `p_to` | N5.2 |
| After quoted speech or thought content (「...」と) | Quotation marker | `p_to_quote` | N5.13 |
| After a plain-form verb/adjective expressing automatic result (AとB) | Conditional "if/when → natural result" | `p_to_conditional` | G25 (N4.34+) |

**Disambiguation rule — what precedes と determines role:**

- **と between/after nouns** → `p_to` (レンとミキ = "Ren and Miki")
- **と after a closing 」quotation mark** → `p_to_quote` (「おいしい」と言いました = said "it's delicious")
- **と after a plain-form clause with 思う/知る** → `p_to_quote` (いいと思います = "I think it's good")
- **と after a plain-form clause expressing automatic/natural result** → `p_to_conditional` (ボタンを押すと開く = "push the button and it opens") — **hard blocker before G25**

Before N5.13, と appears only as `p_to`. From N5.13, `p_to` and `p_to_quote` are both in scope. `p_to_conditional` is not available until G25 (N4.34+) — any sentence using the AとB natural-result pattern (including wishful expressions like あるといいね) before G25 is an out-of-scope grammar violation and must be rewritten. Tagging quotation と as `p_to` displays "and / with" when the student taps it, which is actively misleading.

### Counter references

When a counter expression appears in a `terms` array:

```json
{ "counter": "nin", "n": 4 }
```

Valid counter keys: `ji`, `fun`, `hon`, `mai`, `ko`, `hiki`, `hai`, `satsu`, `nin`, `dai`, `kai`, `sai`, `nen`, `kagetsu`, `shu`, `tsu`, `gatsu`

**Always use the counter engine.** All number + counter expressions in `terms` arrays must use the `{ "counter": ..., "n": N }` object format — never a hardcoded compound vocab ID like `v_yonin` or `v_sannin`. The counter engine handles reading generation, irregular readings (e.g. 四人 → よにん), and display formatting automatically. Hardcoded compound counter IDs are legacy entries that should be scrubbed from the glossary when encountered.

**Question-word counters** (何時, 何人, 何曜日, etc.) are the one exception — these use their dedicated compound ID (`v_nanji`, `v_nannin`, `v_nanyoubi`) because they are question words, not numeric counter expressions.

### Example — correct tagging

```json
{
  "jp": "母は毎日学校に行って、生徒を教えています。",
  "en": "My mother goes to school every day and teaches students.",
  "terms": [
    "k_haha",
    "v_mainichi",
    "v_gakkou",
    { "id": "v_iku", "form": "te_form" },
    "v_seito",
    { "id": "v_oshieru", "form": "te_form" },
    { "id": "v_iru", "form": "polite_masu" }
  ]
}
```

Note: every kanji-containing word is tagged. Particles (は, に, を) are not tagged. The verb いる that forms ～ています is also tagged even though it is a supporting verb.

---

## Character Name Tagging

### Overview

Character names (proper nouns for recurring people in the story world) receive special visual treatment in the app: they render in **sakura pink** and, when tapped, show a **character card popup** with a chibi portrait, the name in Japanese, and its hiragana reading. This is distinct from vocabulary terms (blue underline + vocab modal) and requires its own tagging system.

### The registry: `shared/characters.json`

All character entries live in `shared/characters.json`. This file is loaded by every module (Lesson.js, Game.js, Story.js) and merged into the shared termMap at startup. To add a new character, add an entry here — no other infrastructure changes are needed.

**Entry format:**

```json
{
  "id": "char_rikizo",
  "type": "character",
  "surface": "りきぞ",
  "reading": "りきぞ",
  "meaning": "Rikizo",
  "description": "The protagonist — a cheerful, curious learner navigating everyday life in Japan.",
  "portrait": "assets/characters/rikizo/rikizo_head.png",
  "matches": ["りきぞう"]
}
```

| Field | Required | Description |
|---|---|---|
| `id` | Yes | Always prefixed `char_`. Convention: `char_` + romanized name (lowercase, no spaces). |
| `type` | Yes | Always `"character"`. This is what triggers the pink highlight and portrait popup. |
| `surface` | Yes | The primary hiragana/katakana form used in most content. |
| `reading` | Yes | Hiragana reading — shown under the portrait even if already hiragana. |
| `meaning` | Yes | Romanized name (for display). |
| `description` | Yes | One-sentence description of the character's role. Shown in the popup. |
| `portrait` | Yes | Path to the chibi PNG asset (relative to repo root). If no portrait exists yet, use `""` — the popup will still show name + reading. |
| `matches` | No | Alternate surface spellings (e.g. a longer form, katakana variant). The text processor matches these alongside `surface`. |

**`portrait` is required in the entry even when no asset exists yet.** Use `""` as a placeholder — the popup gracefully omits the image. When the asset is ready, update the path.

### ID convention

This table is the authoritative list of every registered character. It must stay in sync with `shared/characters.json`. **Never use a `char_*` ID that does not appear in both this table and the JSON file.**

| Character | ID | Surface | Matches |
|---|---|---|---|
| Rikizo | `char_rikizo` | `りきぞ` | `["りきぞう"]` |
| Yamakawa | `char_yamakawa` | `やまかわ` | `[]` |
| Suzuki-sensei | `char_suzuki` | `すずき` | `["すずきせんせい"]` |
| Yamamoto-sensei | `char_yamamoto` | `やまもと` | `["やまもとせんせい"]` |
| Ken | `char_ken` | `けん` | `["ケン"]` |
| Yuki | `char_yuki` | `ゆき` | `[]` |
| Lee | `char_lee` | `リー` | `["リーさん"]` |
| Taro | `char_taro` | `たろう` | `[]` |
| Sakura | `char_sakura` | `さくら` | `[]` |
| Miki | `char_miki` | `ミキ` | `[]` |
| Nana | `char_nana` | `ナナ` | `[]` |
| Ren | `char_ren` | `レン` | `[]` |
| Joel | `char_joel` | `ジョエル` | `["ジョエルせんせい", "ジョエル先生"]` |
| Conor | `char_conor` | `コナー` | `["コナーさん"]` |
| Pochi | `char_pochi` | `ポチ` | `[]` |

### Adding a new character — required steps

When a new recurring character is introduced in a lesson, story, or grammar file, the following steps are **all mandatory** before Agent 2 writes any content that references the character. Skipping any step means the character's name will silently render as plain text with no pink highlight or popup.

**Step 1 — Add to `shared/characters.json`**

Append a new entry to the `"characters"` array:

```json
{
  "id": "char_newname",
  "type": "character",
  "surface": "にゅーねーむ",
  "reading": "にゅーねーむ",
  "meaning": "New Name",
  "description": "One-sentence description of the character's role in the story world.",
  "portrait": "",
  "matches": ["にゅーねーむさん"]
}
```

Rules for each field:
- `id`: Always `char_` + romanized lowercase name. No spaces or special characters.
- `surface`: The primary hiragana/katakana form as it will appear in `jp` fields. This is what the text processor matches.
- `reading`: The hiragana reading, shown under the portrait in the popup. If `surface` is already hiragana, `reading` equals `surface`.
- `meaning`: The romanized display name — shown in the popup header.
- `description`: One sentence. Describes who this person is in Rikizo's world.
- `portrait`: Set to `""` if no sprite asset exists yet. The popup renders gracefully without an image.
- `matches`: Any alternate spellings that appear in content — e.g. the name followed by さん, or a katakana variant. The text processor checks these alongside `surface`. **Omit name + title combos that use kanji** (e.g. `"先生"`) unless that kanji has been taught — the text processor is surface-literal.

**Step 2 — Add to the ID convention table in this file**

Add a row to the table above. If this step is skipped, future agents will see the table is out of sync with `shared/characters.json` and may treat the ID as unregistered.

**Step 3 — Tag the name in all lesson content**

In every `jp` field that contains the new character's name, add the `char_*` ID to the `terms` array. See Tagging in lesson/review/grammar/game content (below) below.

**Step 4 (stories only) — Add a surface key to `terms.json`**

Add the name as a key in the story's `terms.json`, pointing to `{ "id": "char_newname", "form": null }`. If the story uses multiple spellings, add one key per spelling.

### Tagging in lesson/review/grammar/game content

In lesson JSON files, whenever a `jp` field contains a character's name, add the character's `char_*` ID to the `terms` array of that item. Place it roughly where the name appears in the sentence (position ordering helps readability of the terms array, though the text processor matches by surface form).

```json
{
  "jp": "おはよう、りきぞさん。",
  "en": "Good morning, Rikizo!",
  "terms": ["p_ohayou_casual", "char_rikizo", "v_san"]
}
```

**When a name is followed by さん:** Tag the name and さん separately. `char_rikizo` covers `りきぞ` and `v_san` covers `さん` — the text processor matches longest-first, so りきぞ is highlighted in pink, then さん picks up the suffix.

**Warmup items:** Tag character names the same way — they are conversational context, not new vocabulary.

**Drill `q` fields:** Do **not** add character terms to drill MCQ `q` fields or `choices` arrays. Drill question text is not processed through the standard term-span system.

**Drill `scramble` items:** Do tag character names that appear in scramble `segments` — students need to recognise the name chip.

### Tagging in story content

Stories use a different system. The `terms.json` file maps surface strings (exactly as they appear in the markdown) to `{ "id": "...", "form": null }` pairs. Add the character's name as a key:

```json
{
  "terms": {
    "りきぞ": { "id": "char_rikizo", "form": null },
    "は": { "id": "p_wa", "form": null },
    ...
  }
}
```

The story processor performs longest-match, so `"りきぞ"` as a key will highlight every occurrence of `りきぞ` in the story markdown — including inside phrases like `りきぞのカレー`.

**If the story uses an alternate spelling** (e.g. `りきぞう`), add a second key for that spelling pointing to the same ID.

### What character tags are NOT

- Character terms are **not** vocabulary — they are **not** added to `vocabList` sections.
- Character terms are **not** added to the practice queue (no flagging behaviour).
- Character terms are **not** listed in `glossary.N5.json` or `glossary.N4.json` — the registry is `shared/characters.json` only.
- The `char_*` entries do **not** have kanji prerequisite rules — names are always written the same way regardless of which kanji have been taught.

### Agent responsibilities

| Agent | Responsibility |
|---|---|
| **Agent 1** | When scoping a lesson, identify which recurring characters appear in the planned conversations and readings. List their `char_*` IDs in the Content Brief so Agent 2 knows to include them in terms arrays. |
| **Agent 2** | Add the appropriate `char_*` ID to every `terms` array whose `jp` field contains a character name. For stories, add the surface key to `terms.json`. Check the CB Checklist item for character tagging. |
| **Agent 3** | For every `jp` field containing a name from the character registry, verify the correct `char_*` ID is present in `terms`. A missing character tag is flagged the same as a missing vocabulary term — the name is non-tappable without it. |
| **Agent 4** | Verify that character names used in conversations are consistent with the established roster (e.g. the teacher is not called やまかわ in one lesson and やまもと in another within the same narrative arc). Flag name inconsistencies under the "Consistency" category. |

### CB Checklist additions (character-specific)

```
[ ] Every jp field containing a character name has the correct char_* ID in its terms array
[ ] No char_* ID is used that is not registered in shared/characters.json and the ID table above
[ ] Character names are NOT added to vocabList sections
[ ] Character names are NOT added to drill MCQ q fields or choices arrays
[ ] Story terms.json includes a surface key for every character name that appears in story.md
[ ] Character name consistency checked — same character referred to by the same name throughout
```

### Common failures

| Failure | Description |
|---|---|
| Untagged character name | `りきぞ` appears in a `jp` field but `char_rikizo` is missing from `terms`. The name renders as plain text with no pink highlight or popup. |
| Wrong ID type | Using `v_san` or a bare string `"りきぞ"` instead of `char_rikizo`. The ID must match the `shared/characters.json` registry. |
| Missing story surface key | `りきぞ` appears throughout the story markdown but no `"りきぞ"` key exists in `terms.json`. Every occurrence is dead text. |
| Invented `char_*` ID | Agent 2 writes `char_yamakawa` in a terms array but the character is not yet registered in `shared/characters.json` and the ID table. The term modal will silently fail to open. |
| Character in vocabList | Agent 2 adds `char_rikizo` to a vocabList group. Characters are not study vocabulary — they should never appear in vocabList sections. |

