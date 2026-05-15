# Content Pipeline — Agent 2 (Content Builder)

> **Loaded by:** Agent 2 (Content Builder) when spawned for any content creation task.
> **Purpose:** Agent 2 (CB) responsibilities, Sentence Token Scan Protocol, and CB Checklist.
> **See also:** `skills/pipeline-overview.md` (Pipeline overview + Agent 1), `skills/pipeline-reviewers.md` (Agents 3 & 4), `skills/pipeline-handoff.md` (handoff protocol + quick start).
---

### AGENT 2 — Content Builder (CB)

**Trigger:** Spawned by Agent 1 via the Agent tool. Receives a Content Brief and file paths. Has no access to Agent 1's conversation history or reasoning — only what was explicitly included in the spawn prompt.

**Responsibilities:**
- **Do not read the glossary in full.** Use targeted Grep queries only (see Glossary Access Pattern in `skills/quality-gates-criteria.md`). Reading the full file will exceed the 32k output token limit.
- Read any existing lesson or review JSON files listed in `Dependencies`.
- Write all JSON/MD content strictly according to the schemas defined in Content Types in `skills/content-schemas-core.md`.
- Every Japanese surface form that is used in `jp` fields, passages, or conversation lines **must** either be tagged in the `terms` array of that item, or be fully hiragana/katakana with no kanji content (pure kana items for basic particles/common function words may be untagged when they are not in the glossary).
- Do **not** invent vocabulary. Use only IDs that exist in the glossary.
- Do **not** use kanji that have not been introduced by the current lesson or earlier. See Kanji Prerequisite Rules in `skills/grammar-rules-prerequisites.md`.
- Do **not** use conjugation forms whose `introducedIn` lesson (in `conjugation_rules.json`) is later than the current lesson. For example, `te_form` has `introducedIn: "N5.5"` — a lesson targeting N5.3 must not contain any て-form usage. If a sentence requires a form that is not yet available, restructure the sentence to use only available forms. See Grammar Usage Prerequisite Rules in `skills/grammar-rules-prerequisites.md`.
- When a verb or adjective appears in a conjugated form, tag it with the correct `form` string. See Term Tagging Reference in `skills/term-tagging-forms.md`.
- **Use recently unlocked grammar actively.** Consult the Content Brief's "Grammar reinforcement" targets. Meet the minimum usage counts for forms in their active reinforcement window. Vary verb forms across conversations — do not default every verb to ます/ました when negative, te-form, and other unlocked forms would be natural. If a minimum count cannot be met without forcing awkward sentences, flag this in the CB Checklist and explain why.
- **Respect length targets and check progress mid-write.** When the Content Brief specifies a length target (e.g. "~3000 chars JP narration"), check actual progress AFTER EACH CHUNK using `wc -m` against the JP section, not by self-estimating from token counts. For stories, the canonical measurement is `sed -n '/### Story Text/,/おわり/p' file | wc -m` (or `awk '/^---$/{c++; next} c==1 && !/^### English/' file | wc -m` for the alternate format). **Hard cap: if a chunk pushes the total above the target ceiling, STOP and report to Agent 1 instead of continuing — do not "trust" your own running total.** Past CB runs have miscounted by 3× (counting only CJK and ignoring kana/punctuation), shipping stories at 8000+ chars when the target was 3000. The measurement is non-negotiable; self-estimation is unreliable.
- **One instance per target unless the brief says multiple.** When the brief lists a reinforcement target (vocab gap, particle, grammar pattern), include it ONCE in the natural slot — not 4+ times "for safety." Past CB runs have shipped 9 instances of a single vocab gap (e.g. 妹 in story 4) when 1-2 would have sufficed. Saturation reads as padding and triggers CR redundancy fails. If the brief explicitly says "at least N occurrences" or "narration AND dialog," honor that; otherwise, default to ONE clean placement.
- Output the draft as a single JSON (or MD + JSON pair for stories) in a clearly labelled code block.
- Attach a **CB Checklist** at the end of the output (see below).
- **Apply the Sentence Token Scan Protocol to every jp/passage field before submitting.** See the protocol definition immediately below. This step is not optional and is not skipped for warmup items, drills, or reading questions.

---

### Sentence Token Scan Protocol

**Definition:** The Sentence Token Scan Protocol (STSP) is a mandatory left-to-right audit of every `jp` or `passage` string. It must be applied to **every** jp field in every section — conversations, readings, warmup items, drills, and reading questions — without exception. This includes **reviews** (conversation lines, reading passages, question answers, scramble segments) and the **conversation and reading sections of Final Interactive Reviews** (game days). It does **not** apply to grammar-specific sections that use `parts[]` with `text`/`role`/`gloss` fields (`grammarRule`, `annotatedExample`, `grammarTable`, `grammarComparison`, `conjugationDrill`, `patternMatch`, `sentenceTransform`, `fillSlot`) — those are covered by the Grammar Accuracy Audit instead. However, **grammar `conversation` and `drills` sections DO require STSP** — they use `jp` + `terms[]` tagging identical to lesson content and must be audited the same way.

**Procedure (apply to each `jp` string individually):**

1. Read the Japanese sentence from left to right, mentally segmenting it into tokens: nouns, verbs, adjectives, adverbs, particles, conjunctions, copulas, sentence-final markers.
2. For each token, ask: **"Is this tagged in the `terms` array?"**
3. If the token is a particle or sentence-final marker, check `shared/particles.json` for its `p_*` ID — even if it "looks obvious." The following must always be tagged when present:
   - Mid-sentence particles: は (`p_wa`), が (`p_ga`/`p_ga_but`), を (`p_wo`), の (`p_no`), に (`p_ni`), で (`p_de`), も (`p_mo`), と (`p_to`/`p_to_quote`), へ (`p_he`), や (`p_ya`), より (`p_yori`), から (`p_kara`/`p_kara_because`), まで (`p_made`), けど (`p_kedo`)
   - Sentence-final particles: か (`p_ka`) — **required even in casual questions where the particle is written as ？ without explicit か**; ね (`p_ne`); よ (`p_yo`)
   - Copulas: です (`g_desu`), だ (`g_da`)
4. If the token is a lexical word (noun, verb, adjective, adverb — including kana-only words like `どこ`, `いつも`, `もう`, `まだ`), verify its ID in the glossary and add it to `terms`. **Search all ID prefixes — `v_*`, `p_*`, and `g_*` — not just `v_*`.** Set-phrases and interjections (e.g. はい, えっ, ただいま) are registered under `p_*` IDs in the glossary even though they are not particles; searching only for `v_*` will miss them. When a kana-only token is not found under `v_*`, re-run the lookup for `p_*` and `g_*` before concluding it is unregistered.
   - **For every い-adjective token:** determine its position **in this field**. Ask: "Does this adjective directly precede a noun in this sentence?" If yes → bare string. If it is sentence-final (before です/でした or in casual plain form) → `polite_adj`. Do not carry over the form from how this adjective was tagged in another field (e.g. a passage). Reading question answers frequently rephrase passage sentences in ways that shift an adjective from predicate to attributive position — always re-check.
   - **For every な-adjective token:** same per-field check. Precedes a noun → `attributive_na`. Sentence-final predicate → `polite_adj`. The form is determined by position in this sentence, not by position in any other sentence in the lesson.
5. If any token has no glossary/particles.json entry, list it in the "Unregistered words" section of the CB Checklist for Agent 3 to escalate.

**Warmup items are NOT exempt.** Warmup `jp` fields require exactly the same completeness as conversation lines. A warmup sentence like 「朝、何を食べますか。」needs `p_wo` and `p_ka` just as much as a conversation line does.

**The STSP applies to rewrites and refreshes too.** When rewriting existing content, every jp/passage field in the original — even those being carried forward unchanged — must be put through the STSP. Treat every original jp field as unaudited; the previous version may predate current tagging standards.

---

**CB Checklist (Agent 2 self-check before passing to Agent 3):**

```
CB CHECKLIST
════════════
[ ] Verified all needed vocab IDs via targeted Grep queries (not full glossary read)
[ ] Every character name in jp fields has the correct char_* ID in its terms array (see Character Name Tagging)
[ ] No char_* ID is used that is not registered in shared/characters.json
[ ] Every kanji used is in the taught-kanji set
[ ] For every word with a `matches` field in the glossary: verified the jp text uses the correct writing form for the current lesson tier — if any kanji in the glossary `surface` is untaught, the hiragana/partial-kanji form from `matches` was used instead (e.g. いっしょに not 一緒に, だいじょうぶ not 大丈夫, until their kanji are taught)
[ ] For every compound vocab entry whose `surface` contains an internal particle or spans multiple morphemes (e.g. `v_atamagaii` surface `"頭がいい"`): verified the jp text writes the compound WITHOUT any spaces between its components — the jp substring must match the `surface` field character-for-character. A readability space inserted anywhere inside the compound (e.g. `頭が いい`) breaks the text-processor substring match silently: no chip appears, no error is thrown. The compound surface is authoritative; the jp text must conform to it, not the other way around. Never split the compound into its constituent terms to work around a spacing mismatch — that changes the semantic unit the student sees (e.g. "head / subject / good" instead of "smart / intelligent").
[ ] Every content word in every jp/passage field has a corresponding terms entry
[ ] Every pure-kana lexical word (interjections, casual words, expressions not in particles.json) has a verified glossary entry — any that do not are listed in the CB Checklist under "Unregistered words" for Agent 3 to escalate. Search **all ID prefixes** (`v_*`, `p_*`, `g_*`) — set-phrases like はい (`p_hai`) are registered under `p_*` in the glossary, not `v_*`; searching only `v_*` will silently miss them
[ ] Question words and kana-only adverbs explicitly checked: for every jp field, scan for どう, どこ, どれ, どちら, いつ, なぜ, いくら, いくつ, いつも, もう, まだ, よく, たいてい, ぜんぜん, and any similar kana-only vocab — these have registered IDs and must appear in terms even though they look like plain kana
[ ] SENTENCE TOKEN SCAN completed for every jp/passage field: scanned left to right, token by token, using the Sentence Token Scan Protocol defined above — particles, sentence-final markers, and lexical words all verified
[ ] Particles tagged in warmup items: warmup jp fields have exactly the same particle completeness as conversations (は, が, を, の, に, で, も, と, etc. are all tagged where present)
[ ] Sentence-final か tagged as p_ka in every question sentence — applies to polite and casual questions equally; a sentence ending with ？ in casual speech still requires p_ka in terms
[ ] Adjacent single-char kana terms ordered correctly: wherever two single-char kana particles/copulas appear consecutively in jp text (e.g. だね, のは, かな, よね, には, では), the rightmost one is listed FIRST in the terms array — so it is wrapped in a <span> before the leftmost is processed, allowing the single-char lookahead regex to pass. Example: jp="ことだね" → put p_ne before g_da; jp="借りるのは" → put p_wa before p_no; jp="町には" → put p_wa before p_ni; jp="お店では" → put p_wa before p_de
[ ] For every い-adjective in jp text: verify position — bare string if attributive (precedes a noun); { "id": "...", "form": "polite_adj" } only if predicate (sentence-final before です/でした). Never use polite_adj for an attributive adjective.
[ ] For every な-adjective in jp text: { "form": "attributive_na" } if it precedes a noun (大切な こと); { "form": "polite_adj" } if sentence-final predicate (大切です)
[ ] For every desire expression (〜たい): ALWAYS use plain_desire_tai + g_desu (two chips) — desire_tai is deprecated. plain_desire_tai alone when the sentence is plain/casual (〜たい、〜たいから、〜たいよ)
[ ] For every verb in purpose-construction masu-stem + に (e.g. 買いに, 食べに, 借りに): use { "form": null } — this is the ONLY valid use of form: null on verbs in lesson content
[ ] Every { "form": null } verified as a genuine purpose construction: the verb is followed immediately by に in the jp text. Any form: null not meeting this test is a hard fail
[ ] If a needed form string does not exist in conjugation_rules.json: flag to Agent 1 to create the entry — never substitute form: null
[ ] Every form string used in terms verified to exist in conjugation_rules.json before use
[ ] For every な-adjective glossary entry used: verified the entry has BOTH gtype: "na-adjective" AND verb_class: "na_adj" — either field alone is insufficient for attributive_na to work
[ ] Verbs/adjectives use { "id": "...", "form": "..." } objects, never bare strings
[ ] No invented IDs — every ID was verified against the glossary or particles.json
[ ] Every vocab word used in jp text was Grep-verified to exist in the glossary BEFORE being written into the content — if a word lacks a glossary entry, it must be added (or flagged to Agent 1) before proceeding, never used speculatively
[ ] Conversation/reading terms use v_* vocab entries, NOT k_* kanji entries
[ ] が after a clause-final form (ます/です/plain form) is tagged p_ga_but, not p_ga (see disambiguation rules)
[ ] から after a verb/adjective/です is tagged p_kara_because, not p_kara (see disambiguation rules)
[ ] けど is tagged p_kedo (not untagged)
[ ] Sentence-initial でも is tagged p_demo_but, not p_demo (see disambiguation rules)
[ ] と after a closing 」or after a plain-form clause with 思う/知る is tagged p_to_quote, not p_to (N5.13+)
[ ] VocabList covers every glossary+particles.json entry with lesson_ids = this lesson
[ ] Counter references use { "counter": "...", "n": N } format
[ ] (N4+ lessons) Exactly 3 drill sections present: Drill 1 Kanji Readings (no terms), Drill 2 Vocabulary, Drill 3 Grammar & Forms
[ ] (N4+ lessons) Drill 1 items use `[漢字] の よみかたは？` format with 4 reading choices and NO terms array
[ ] Drill 1 (vocab MCQ) has NO terms array on items
[ ] Drill 2+ fill-in-the-blank / particle / conjugation items DO have terms arrays
[ ] Answer fields in reading questions match the passage text exactly
[ ] JSON is valid (no trailing commas, all brackets closed)
[ ] Warmup section has exactly 4 items
[ ] Warmup items use ONLY vocab from lessons prior to this one (lesson_ids < current lesson)
[ ] Lesson matches the reference template's conversation count (see Reference Template Rule)
[ ] meta.kanji array is present and matches the kanji list in manifest.json
[ ] Every kanji introduced this lesson that functions as a standalone noun has a v_* vocab entry, not only a k_* kanji entry
[ ] Every conjugation form used in jp/passage fields has introducedIn ≤ current lesson (checked against conjugation_rules.json)
[ ] Every structural grammar pattern in jp/passage fields (e.g. ～ている, ～てください, ～たり～たりする) is available at the current lesson tier
[ ] Active-window grammar reinforcement minimums are met (see Grammar Reinforcement Requirements)
[ ] Sustained-use grammar forms are not completely absent — at least 1 instance of each milestone's forms appears
[ ] Verb forms are varied across conversations (not all ます/ました — negatives, te-form, etc. are used where natural)
[ ] At least 1 warmup item exercises the most recently unlocked grammar pattern with prior-lesson vocabulary
[ ] Structural patterns (てください, ています, たいです, ましょう, etc.) appear where the lesson theme naturally supports them
[ ] (N5.10+) Casual conversation count matches the Register Requirements schedule
[ ] (N5.10+) Casual conversations use plain forms only — no ます/です in casual dialogue lines
[ ] (N5.10+) Casual conversation contexts justify informal register (friends, family, close peers)
[ ] (N5.10+) No register mixing within a single conversation — all lines use same register
[ ] (Pre-N5.10) No casual register appears — all conversations are 100% polite
[ ] (Reviews) Scramble items have segments, distractors (3 items), and explanation
[ ] (Reviews) Scramble sentences with floatable time expressions or adverbs include an alts array
[ ] (Reviews) Every review section has an instructions field
[ ] (Reviews) Conversation items include title, context, lines, question, choices, answer, explanation
[ ] (Reviews) Every MCQ and scramble drill item has an explanation field
[ ] (Compose) Every vocabPool ID exists in the glossary or particles.json
[ ] (Compose) Targets use only kanji-containing vocabulary (coverage is kanji-based)
[ ] (Compose) Model sentences use only taught kanji and approved vocabulary
[ ] (Compose) Particles array only includes particles with introducedIn ≤ current lesson
[ ] (Compose) Conjugation examples use vocabulary from the lesson
[ ] (Compose) Conjugations stay in polite/formal register (no plain forms unless lesson teaches casual)
[ ] (Compose) Conjugation irregular forms are correct (e.g. いい→よかったです, not いかったです)
[ ] (Compose) Prompts build one cohesive composition, not disconnected topics
[ ] (Compose) Narrative frame is consistent — either fully habitual (present-tense routine), fully specific-day (past-tense event), or a blend with explicit bridging text in the prompt at the transition point; no silent frame shift between consecutive prompts
[ ] (Compose) No regular prompt uses "close", "wrap up", "conclude", or "finish" wording when challengePrompts is non-empty
[ ] (Compose) Every model sentence uses natural Japanese collocations — every verb+object combination verified as real Japanese usage (e.g. 思い出を作る ✓, 運動を作る ✗)
[ ] (Compose) Challenge prompts are framed as a separate scenario from the regular arc ("during a different run…", "on another occasion…")
[ ] (Compose) Prompt count matches level guidelines (2-3 early N5, scaling to 7-10 late N4)
[ ] (Stories) Every particle with a p_* entry in particles.json with introducedIn ≤ lesson scope is tagged in terms.json
[ ] (Stories) g_desu (です) is tagged in terms.json when the story uses です
[ ] (Stories) terms.json keys match exactly how each word appears in story.md (including kana-only spellings of words with untaught kanji)
[ ] (Stories) No particle or copula occurrence is left untagged / unclickable
[ ] (Grammar) Every grammar-specific section uses the correct field names — annotatedExample uses `examples[]` not `parts[]`; grammarComparison uses `items[]` not `itemA`/`itemB` — verified against the Grammar JSON schema in Content Types
[ ] (Grammar) Every new conjugation form this lesson teaches has a verified entry in conjugation_rules.json — Grep-confirmed the form ID exists as a top-level key, its introducedIn value matches this lesson, and godan/ichidan/irregular rules are defined; if missing, flagged to Agent 1 before any terms array uses that form string
[ ] **(Length)** Brief's length target identified BEFORE writing (e.g. "3000 chars JP narration"). Floor + ceiling tolerance recorded.
[ ] **(Length)** After each chunk commit, ran the canonical measurement: `sed -n '/### Story Text/,/おわり/p' file | wc -m` (stories with that header format) OR `awk '/^---$/{c++; next} c==1 && !/^### English/' file | wc -m` (stories with the simple --- format). The running total is below the brief's ceiling — if not, STOPPED and reported to Agent 1 rather than continuing.
[ ] **(Length)** Final length is within the brief's specified range. Self-reported number matches the canonical `wc -m` measurement — not a CJK-only or token-only count.
[ ] **(Reinforcement)** Each vocab gap / particle / grammar target appears ONCE in its natural slot unless the brief explicitly requires multiple occurrences. No saturation (5+ instances of one term in adjacent paragraphs).
[ ] (Grammar) Every new connector word introduced by this lesson has a tappable glossary or particles.json entry — for each connector (e.g. ために, まえに, あとで, のに), Grep-verified that a v_* or p_* ID exists; if missing, flagged to Agent 1 BEFORE writing conversation content that uses it
[ ] (Grammar) Connector nouns written in correct form for the lesson tier — ため always hiragana (為 never taught); 前/後/事 etc. in hiragana if their kanji is not in the taught set at unlocksAfter, in kanji if it is
[ ] (Grammar) Every `grammarRule.pattern[]` chip uses `label`, `color`, and `text` fields — NOT `role`/`gloss` (those belong to example `parts[]` only). Missing `color` → chip renders grey. Missing `label` → chip shows no text. Verify each chip in every pattern array.
[ ] (Grammar) Every `meta.particles[]` entry is a **character string** (e.g. `"のに"`, `"から"`) — NOT a particle ID (e.g. `"p_noni"`, `"p_kara"`). IDs never match `span.textContent` of Japanese text, so particle highlighting is silently broken when IDs are used.
[ ] (Grammar) Every `sentenceTransform` item has a `choices[]` array with 4 strings (correct answer + 3 plausible distractors). Missing `choices` crashes the renderer and leaves the entire screen blank.
[ ] (Grammar) Every `conjugationDrill` and `sentenceTransform` section has `"manualProgression": true` set at the section level (not on individual items). Missing this flag causes the drill to auto-advance after ~1.5s — too fast for students to read the hint.
[ ] (Grammar) Conversation `jp` fields are tagged via `terms[]` using the same rules as lesson content (every lexical token, particle, and copula must be tagged). Terms generate tappable `.jp-term` spans; without tags, the text is unclickable (no visual highlight, no modal).
[ ] (Grammar) `meta.grammarForms[]` lists the conjugation form strings this lesson introduces or exercises — used to power the unlock display on lesson completion.
[ ] manifest.json updated: a new entry for this content has been added to the correct array (lessons / stories / grammar / reviews / compose) with the correct `id`, `title`, `dir` or `file`, and `unlocksAfter` fields — verified by Grep that the entry is present before submitting to Agent 3
```

---

## Custom Story Rules (additional to standard CB Checklist)

### Grammar scope (G-lesson ceiling — enforced per story, told in brief)

- Never use まま (〜たまま/〜のまま) — not taught through N3, never valid in any story
- について — G30+. Never valid within G19 ceiling.
- と-conditional (〜ると) — G25. Not valid within G19 ceiling. Use 〜た時 instead.
- のに (concessive "even though") — G20. Not valid within G19 ceiling. Use が instead.
- These are the most commonly misused patterns. When the G ceiling is G19, all four are banned.

### Kanji — words always written in hiragana regardless of scope

- 次 → always write つぎ (kanji not taught until N3)
- 番 → 一番 always write いちばん (番 kanji not taught until N3)
- 的 suffix → write as てき until 的 kanji is introduced (currently N3 only)

### Vocabulary — transitive/intransitive verb accuracy

- 動く (v_ugoku) = intransitive (thing moves on its own). If story needs "to move something", use 動かす (v_ugokasu) — different verb, different ID.
- 上げる (v_ageru_raise) = to raise/lift. 上げる (giving verb v_ageru) = to give. Do not conflate. Check the story's intended meaning before assigning the ID.
- General rule: when a verb appears in transitive form (を + verb), verify the glossary entry is the transitive verb, not its intransitive partner.

### terms.json — mandatory entries for every story

- `"いい": { "id": "v_ii", "form": null }` — always required
- `"よ": { "id": "p_yo", "form": null }` — sentence final particle, always needed in dialog
- `"ね": { "id": "p_ne", "form": null }` — always needed in dialog
- `"じゃ": { "id": "p_ja", "form": null }` — always needed in dialog
- `"な": { "id": "p_na", "form": null }` — na-adjective marker, always needed
- `"でも": { "id": "p_demo_but", "form": null }` — needed whenever でも appears
- `"ない": { "id": "v_aru", "form": "plain_negative" }` — standalone negative
- `"なかった": { "id": "v_aru", "form": "plain_past_negative" }` — standalone negative past
- `"した": { "id": "v_suru", "form": "plain_past" }` — universal suru past
- `"して": { "id": "v_suru", "form": "te_form" }` — universal suru te-form
- `"だった": { "id": "g_da", "form": null }` — copula past

### terms.json — form field correctness

- い-adjective past forms must use `plain_past_adj`, NOT `plain_past`. Example: 正しかった → `"form": "plain_past_adj"`
- Desire past: したかった → `"form": "plain_desire_tai_past"`, NOT `form: null`
- `form: null` is only valid for: plain nouns, na-adjectives in base form, compound surfaces with no clean form mapping

### terms.json — conjunctive が disambiguation

- が after a plain past or desire form means "but" (p_ga_but), not subject marker (p_ga)
- Common patterns: 〜たが, 〜したかったが, 〜だったが → all should be tagged with p_ga_but
- Add explicit surface entries for these conjunctive が occurrences rather than relying on single-char が match

### terms.json — single-char surface theft prevention

- Any story word beginning with: だ, し, な, か must have its FULL SURFACE in terms.json
- Otherwise the 1-char autoSurface (g_da, p_shi, p_na, p_ka) consumes just the first character
- Run a prefix audit: for every content word starting with these chars, confirm the full surface is an explicit terms.json key

### Naturalness checklist (run before finalizing Japanese text)

- 正体 is for living beings / creatures with hidden identities. Never use for inanimate objects (documents, plans, machines).
- 有力者 is for genuinely powerful figures (executives, politicians). Not for middle schoolers being dramatic.
- 問答する is literary/formal dialectic debate language. Use 言い返す, 反論する, or simpler alternatives in casual story contexts.
- 住所 is postal address. Never use for "location of X" within a space. Use 場所 or 位置.
- Naturalness test: for each sentence containing a flagged vocabulary word, ask "would a native speaker say this exact sentence naturally?" If the vocabulary word is driving the sentence structure rather than the story, rewrite.

