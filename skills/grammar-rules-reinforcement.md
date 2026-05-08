# Grammar Reinforcement & Register Requirements (Part 2)

> **Loaded by:** All agents for any content creation task.
> **Purpose:** Defines grammar reinforcement schedules (minimum usage after unlock), structural pattern reinforcement, warmup reinforcement, and register requirements (polite vs casual).
> **See also:** `skills/grammar-rules-prerequisites.md` (kanji prerequisites, vocabulary scope, grammar gating).

---

## Grammar Reinforcement Requirements

The prerequisite rules above define when a grammar form **may** be used (the ceiling). This section defines when a grammar form **should** be used (the floor). Without both rules, content can technically pass all QA gates while never actually practicing the grammar students have learned — defeating the purpose of teaching it.

### The reinforcement principle

> Once a grammar form is unlocked, subsequent content must **actively use** it. Students learn through repeated, natural exposure — not by seeing a form once in a grammar lesson and never encountering it again.

### Story reinforcement rule

A story's **primary G grammar reinforcement** consists of every G whose `unlocksAfter` lesson is contained in the story's lesson coverage — i.e., every G that gets taught between the previous story and this one. Equivalently: a story is the primary reinforcement venue for grammar `G` iff it is the first story whose `unlocksAfter` ≥ `G.unlocksAfter`.

The student must complete G's grammar lesson before the story unlocks, so by the time they reach the story they have learned G — and the story is the natural place to see it used in context. Earlier G grammars are **ambient** (use if natural, not enforced).

Examples:
- G17 unlocks after N4.7 → primary story is **kazoku-no-kisetsu** (unlocksAfter N4.8). Story 4 must reinforce all of G17's targetVocab (だけ / しか / ばかり / でも).
- G18, G19 unlock after N4.10 → primary story is **machi-no-eigakan** (unlocksAfter N4.10).
- G14, G15 unlock after N4.5 → primary story is **hirugohan-monogatari** (unlocksAfter N4.6).
- G20 unlocks after N4.14 → primary story is **uta-to-shigoto** (unlocksAfter N4.14).

### Grammar milestones and reinforcement schedule

Each milestone groups forms that unlock together. The **active reinforcement window** is the 2–3 lessons immediately after unlock, where minimum usage counts apply. After the window, forms enter **sustained use** where complete absence is flagged.

**Important — grammar lessons vs content lessons.** Grammar lessons (G1–G49) teach concepts and unlock after specific content lessons. The reinforcement schedule must respect this: a form may be *mechanically available* (its `introducedIn` lesson has passed) before the grammar lesson that *formally teaches the concept* has unlocked. For example, `te_form` is available from N5.5, and G8 (て-form mechanics + てください preview) unlocks after N5.5, but G9 (ている progressive, たいです, ましょう) doesn't unlock until after N5.8. The schedule below groups milestones by the grammar lesson that teaches them, not just the conjugation form availability.

| Milestone | Available from | Active window | Required patterns (per lesson, across convs + readings) | Sustained use (after window) |
|---|---|---|---|---|
| **Polite verbs** (G7) | N5.5 | N5.6–N5.7 | ≥3 `polite_masu`, ≥2 `polite_mashita`, ≥1 `polite_negative` or `polite_past_negative` | All four polite verb forms appear regularly; no lesson should use only ます/ました |
| **Te-form as connector + requests** (G8) | N5.5 | N5.6–N5.7 | ≥1 `てください` request, ≥2 te-form sequential connectors (AてB) | てください appears naturally where context calls for requests; て as connector used in multi-action sentences |
| **Progressive + desire + volitional** (G9) | N5.9 | N5.9–N5.10 | ≥1 `ている/ています` progressive or state, ≥1 `～たいです` desire expression, ≥1 `～ましょう` suggestion/invitation | All three patterns appear where thematically appropriate |
| **Plain forms & connectors** (G10) | N5.9 | N5.10–N5.11 | ≥1 `～ない` or `～なかった` in context; ≥1 `のです/なんです` explanatory form; ≥1 `けど` or clause-final `から`/`ので` connector | Plain negatives, explanatory のです, and clause connectors (が/けど/から/ので) all appear in varied natural contexts; not limited to drills |
| **Adj past + adverbial** (G11) | N5.10 | N5.11–N5.12 | ≥1 past-tense adjective (`polite_past_adj`), ≥1 adverbial form (`adverbial`) | Both used naturally in descriptions and narratives |
| **Appearance** (N5.11) | N5.11 | N5.12–N5.13 | ≥1 `～そうです` appearance pattern | Appears where observations or impressions are natural |
| **Potential** (G13) | N4.3 | N4.4–N4.6 | ≥1 potential form (affirmative or negative) | Ability/possibility expressions used where natural |
| **Give & receive** (G14) | N4.5 | N4.6–N4.8 | ≥1 `あげる`, `もらう`, or `くれる` in a natural exchange | All three verbs appear regularly; distinguish direction of giving/receiving in varied scenes |
| **Comparison + degree** (G15) | N4.5 | N4.6–N4.8 | ≥1 `より` comparison, ≥1 `いちばん` superlative or `ほど` degree pattern | Comparison/degree expressions appear where natural (describing preferences, rankings, qualities) |
| **Manner & similarity** (G16) | N4.6 | N4.7–N4.9 | ≥1 `ように` or `みたいに` manner/similarity expression | Manner expressions appear where actions are described by how they resemble something else |
| **Transitive & intransitive pairs** (G18) | N4.10 | N4.11–N4.13 | ≥1 transitive/intransitive pair used contrastively (e.g. 開ける vs 開く) | Transitive/intransitive verbs selected correctly for the subject/object role in each sentence |
| **Action connectors** (G19) | N4.10 | N4.11–N4.13 | ≥1 `てから` sequential (after doing), ≥1 `まえに` anticipatory (before doing), ≥1 `ために` purposive (in order to), ≥1 `～たり～たりする` listing, ≥1 `～ながら` simultaneous action | All five connector patterns appear where natural; てから/まえに/ために are high-frequency in daily narration and should not be absent for more than 2 consecutive lessons |
| **Contrast, concession & listing** (G20) | N4.14 | N4.15–N4.17 | ≥1 `のに` (despite/unexpectedly), ≥1 `ても` (even if/even though), ≥1 `し` (and what's more) | All three patterns appear where contrast, concession, or additive reasoning is natural |
| **Conversation mechanics** (G28) | N4.14 | N4.15–N4.17 | ≥1 floor-holding or hesitation filler (あのう, ええと, そうですね), ≥1 back-channel response (あいづち: そうですか, なるほど, へえ) | Conversation fillers and responses appear in casual or semi-formal dialogue naturally; not every conversation needs them, but prolonged absence across multiple lessons is a gap |
| **Appearance & hearsay** (G29) | N4.14 | N4.15–N4.17 | ≥1 `～そうだ` appearance (looks like) or `～そうだ` hearsay (I heard that) | Both usages appear where observation or reported information is natural; distinguish the two by context |
| **Limiting particles** (G17) | N4.14 | N4.15–N4.17 | ≥1 `だけ` or `しか～ない` limiting expression | Limiting particles appear where context calls for restriction or exclusion |
| **Permission + prohibition** (G21) | N4.20 | N4.21–N4.23 | ≥1 `てもいい` permission or ≥1 `てはいけない` prohibition | Both patterns appear where rules, permissions, or social norms are discussed |
| **Directional て-form** (G30) | N4.21 | N4.22–N4.24 | ≥1 `てくる` (coming toward/change toward speaker), ≥1 `ていく` (going away/continuing change) | Both directions appear; distinguish movement toward vs away, and resultant-state usage (てある) where natural |
| **Obligation & conditionals** (G22) | N4.25 | N4.26–N4.28 | ≥1 `なければいけない` or `ないといけない` obligation; ≥1 `～たら` or `～ば` conditional; ≥1 `～なら` contextual conditional or `～と` natural-result conditional | Obligation form appears where necessity is expressed; all four conditional types used across lessons — avoid defaulting exclusively to たら; ～と natural-result is especially useful in instructions and routines |
| **ように patterns** (G31) | N4.25 | N4.26–N4.28 | ≥1 `ようにする` (make effort to) or `ようになる` (come to be able to / come to do) | Both patterns appear where expressing goal-oriented effort or gradual change is natural |
| **Passive + causative** (G23/G24) | N4.31 | N4.32–N4.34 | ≥1 passive, ≥1 causative across the lesson | Both voice patterns appear where natural |
| **Thoughts & experience** (G27) | N4.30 | N4.31–N4.33 | ≥1 `と思う` (I think / I thought), ≥1 `たことがある` (have done) | Both patterns appear where expressing opinion or past experience is natural |
| **Auxiliary compounds** (G25) | N4.34 | N4.35–N4.36 | ≥1 `てみる` (try) or `ておく` (prepare) or `てしまう` (complete/regret) | Auxiliary verb compounds appear where experimentation, preparation, or completion is discussed |
| **Excessive degree** (G25) | N4.34 | N4.35–N4.36 | ≥1 `～すぎる` excessive expression | ～すぎる appears where overabundance or excess is natural (eating too much, too expensive, too noisy) |
| **Adjective change** (G26) | N4.34 | N4.35–N4.36 | ≥1 `～くなる/～になる` spontaneous state change, ≥1 `～くする/～にする` deliberate state change | Both patterns appear where describing changes of state or making deliberate adjustments is natural (seasons changing, improving skills, making a room quieter) |

**N3 milestones (planned — activate when N3 content lessons are built):**

The following grammar lessons unlock after N3 content lessons that do not yet exist. These milestone rows are documented here so they are in place when N3 content creation begins. They follow the same schedule format but are not enforced until the corresponding N3 lessons exist.

| Milestone | Available from | Active window | Required patterns (per lesson, across convs + readings) | Sustained use (after window) |
|---|---|---|---|---|
| **Relative clauses** (G32) | N3.2 | N3.3–N3.6 | ≥2 plain-form relative clause modifying a noun (e.g. 昨日買った本, 行ったことがある場所) | Relative clauses appear consistently — this is a core structural pattern in natural Japanese and should be present in nearly every lesson after N3.2 |
| **Nominalizers** (G33) | N3.4 | N3.5–N3.8 | ≥1 `〜のが好き/得意/下手` or `〜のは〜だ` nominalization; ≥1 `〜ことができる/〜ことがある` こと nominalization | Both の and こと nominalizations appear; distinguish contexts where each is required (の for perceptions/preferences, こと for facts/ability) |
| **Plain volitional & intentions** (G34) | N3.6 | N3.7–N3.10 | ≥1 `〜うとする/〜ようとする` (try to / attempt), ≥1 `〜うと思う/〜ようと思う` (intend to) | Plain volitional in intention contexts; distinguish from ましょう (suggestion) and たい (desire) |
| **Conjecture & inference** (G35) | N3.10 | N3.11–N3.14 | ≥1 `ようだ/ようです` (it seems — evidence-based), ≥1 `みたいだ/みたいです` (looks like — casual), ≥1 `らしい/らしいです` (apparently — hearsay) | All three inference patterns appear and are distinguished by their evidence source; do not use interchangeably |
| **Expectation & reasoning** (G36) | N3.14 | N3.15–N3.18 | ≥1 `はずだ/はずです` (should be / expected to be), ≥1 `わけだ/わけです` (that's why / it means that) | Both patterns appear where expectations or logical reasoning are expressed; distinguish はずだ (expected state) from わけだ (logical conclusion) |

### How to read the schedule

- **Active window counts are minimums**, not targets. Natural content will typically exceed them. The counts exist to prevent the common failure where all verbs default to ます/ました and recently taught forms never appear.
- **Sustained use** means the form should appear at least once per lesson (across all conversations and readings combined) unless the lesson's theme genuinely has no natural context for it. Complete absence of a sustained-use form triggers an Agent 4 soft fail with an explanation of why the form was omitted.
- **Counts apply to lesson content only** (conversations, readings, warmups). Drill items are excluded from the count because drills test specific knowledge rather than providing natural reinforcement exposure.
- **Compose files** are exempt from minimum counts but should include recently-unlocked forms in their `conjugations` array and use them in model sentences.
- **Stories** should use the full available grammar set naturally. Agent 4 flags stories that use only basic forms when richer grammar is available.
- **Reviews** draw from their full lesson range, so reinforcement is inherent — but Agent 4 should verify that conversations in reviews exercise recently-taught forms, not just the earliest ones.

### Structural pattern reinforcement

Beyond individual conjugation forms, these **structural patterns** combine forms into practical constructions that students must encounter repeatedly. The table is divided into conjugation-based patterns and non-conjugation patterns (particle-based and structural grammar).

**Conjugation-based patterns:**

| Pattern | Taught in | Reinforce from | How to reinforce |
|---|---|---|---|
| `Verb-てください` (polite request) | G8 | N5.6+ | Use in at least 1 conversation per lesson. Natural contexts: giving directions, asking for help, making requests. |
| `Verb-て Verb` (sequential connector) | G8 | N5.6+ | Use in at least 2 multi-action sentences per lesson during active window (N5.6–N5.7); at least 1 per lesson after. Natural contexts: describing routines, narrating sequences. |
| `Verb-ないでください` (negative request) | G8 | N5.6+ | Use occasionally. Natural contexts: classroom rules, polite prohibitions. Should not be absent across 3+ consecutive lessons. |
| `Verb-ている/ています` (progressive/state) | G9 | N5.9+ | Use in at least 1 conversation or reading per lesson. Natural contexts: describing ongoing actions, states (住んでいます, 知っています). **Note:** te_form is mechanically available from N5.5, but ている as a *concept* is taught in G9 (unlocks after N5.8). Do not require ている in N5.6–N5.8 content. |
| `Verb-たいです` (desire) | G9 | N5.9+ | Use in at least 1 conversation per lesson. Natural contexts: discussing plans, preferences, wishes. |
| `Verb-ましょう` (let's/shall we) | G9 | N5.9+ | Use in at least 1 conversation per lesson. Natural contexts: making plans together, suggestions, invitations. |
| `あげる / もらう / くれる` (give & receive) | G14 | N4.6+ | Use in at least 1 exchange per lesson. Natural contexts: gifts, favours, teaching, lending. Vary which verb is used — don't default to あげる every time. |
| `ように / みたいに` (manner, similarity) | G16 | N4.7+ | Use occasionally. Natural contexts: describing how someone acts, what something resembles, role-modelling behaviour. |
| `Verb-てくる / ていく` (directional te-form) | G30 | N4.22+ | Use in at least 1 conversation or reading per lesson. Natural contexts: arriving with something, gradual change over time, continuing a habit going forward. |
| `ようにする / ようになる` (goal/change) | G31 | N4.26+ | Use occasionally. Natural contexts: habit-forming, improvement goals, gradual ability gain. |
| `と思う` (I think / thought) | G27 | N4.31+ | Use in at least 1 conversation per lesson. Natural contexts: expressing opinions, hedging a statement, reporting someone's thought. |
| `たことがある` (have done / experience) | G27 | N4.31+ | Use occasionally. Natural contexts: discussing past experiences, travel, food, activities. |
| `Verb-たり Verb-たりする` (listing actions) | G19 | N4.11+ | Use in at least 1 conversation or reading per lesson. Natural contexts: describing weekends, hobbies, routines. |
| `Verb-ながら` (while doing) | G19 | N4.11+ | Use occasionally. Natural contexts: multitasking descriptions, daily routines. |
| `～すぎる` (excessive degree) | G25 | N4.35+ | Use occasionally. Natural contexts: eating too much, too expensive, too loud, overwork. |
| `～ば / ～ければ` (ba conditional) | G22 | N4.26+ | Use occasionally. Natural contexts: general conditions, advice, logical consequences. |
| `～たら` (if/when conditional) | G22 | N4.26+ | Use in at least 1 context per lesson. Natural contexts: plans, hypotheticals, advice. |
| `Verb-てもいい` (permission) | G21 | N4.21+ | Use occasionally. Natural contexts: asking permission, stating what's allowed. |
| `Verb-てはいけない` (prohibition) | G21 | N4.21+ | Use occasionally. Natural contexts: rules, warnings, social norms. |
| `Verb-てみる` (try doing) | G25 | N4.35+ | Use occasionally. Natural contexts: trying new foods, experiences, suggestions. |
| `Verb-ておく` (prepare/do in advance) | G25 | N4.35+ | Use occasionally. Natural contexts: planning ahead, preparations. |
| `Verb-てしまう` (completion/regret) | G25 | N4.35+ | Use occasionally. Natural contexts: accidents, finishing something, unintended results. |
| `Verb-てから` (after doing) | G19 | N4.11+ | Use occasionally. Natural contexts: sequencing daily activities, describing order of events ("I'll eat and then go out"). Pair with まえに in the same lesson to contrast both directions. |
| `まえに` (before doing) | G19 | N4.11+ | Use occasionally. Natural contexts: preparation steps, warnings, sequences. Pair with てから to practice both sequential patterns. |
| `ために` (in order to) | G19 | N4.11+ | Use occasionally. Natural contexts: explaining purpose or motivation ("studying in order to pass"), goals, self-improvement. |
| `のです / なんです` (explanatory) | G10 | N5.10+ | Use in at least 1 conversation per lesson. Natural contexts: explaining a situation, providing context for a request, softening a statement. Casual form んだ/んだけど appears in casual conversations. |
| `なければいけない / ないといけない` (must) | G22 | N4.26+ | Use occasionally. Natural contexts: obligations, rules, deadlines, necessity. Distinguish なきゃ as its casual spoken contraction. |
| `～なら` (contextual conditional) | G22 | N4.26+ | Use occasionally. Natural contexts: responding to what someone has said ("if that's the case"), giving advice based on stated plans ("if you're going to Tokyo…"). |
| `～と` (natural-result conditional) | G22 | N4.26+ | Use occasionally. Natural contexts: instructions ("if you press this, it opens"), directions, recipes, natural sequences. Distinguished from たら by its automatic/non-volitional result. |
| `Adj-くなる / になる` (become ~) | G26 | N4.35+ | Use occasionally. Natural contexts: seasonal change, skill improvement, changing situations. Contrast with くする/にする — なる is spontaneous, する is deliberate. |
| `Adj-くする / にする` (make ~ / cause to be ~) | G26 | N4.35+ | Use occasionally. Natural contexts: requests to change conditions (静かにしてください), decisions, improvements. |

**Non-conjugation patterns (particle-based and structural grammar):**

| Pattern | Taught in | Particles/tracking | Reinforce from | How to reinforce |
|---|---|---|---|---|
| `X の方が Y より ～` (comparison) | G15 | `p_yori` | N4.6+ | Use in at least 1 context per lesson. Natural contexts: comparing food, places, seasons, preferences. |
| `X で いちばん ～` (superlative) | G15 | `v_ichiban` (vocab) | N4.6+ | Use occasionally alongside comparison. Natural contexts: "the most ～ in ～". |
| `X は Y ほど ～ない` (negative degree) | G15 | `p_hodo` | N4.6+ | Use occasionally. Natural contexts: "X is not as ～ as Y". |
| `～だけ` (only/just) | G17 | `p_dake` | N4.15+ | Use occasionally. Natural contexts: limitations, quantities. |
| `～しか～ない` (nothing but) | G17 | `p_shika` | N4.15+ | Use occasionally. Natural contexts: scarcity, emphasis on limits. |
| `～ので` (because — polite) | G10 | `p_node` | N4.11+ | Use occasionally as an alternative to から. Natural contexts: giving reasons in polite speech. |
| `のに` (despite / unexpectedly) | G20 | `p_noni` | N4.15+ | Use occasionally. Natural contexts: expressing surprise or frustration that a result contradicts an expectation. |
| `ても` (even if / even though) | G20 | `p_temo` | N4.15+ | Use occasionally. Natural contexts: conceding a condition while maintaining the conclusion ("even if it rains, we'll go"). |
| `し` (and what's more / listing reasons) | G20 | `p_shi` | N4.15+ | Use occasionally. Natural contexts: listing supporting reasons for a conclusion or opinion. |
| `～そうだ` appearance / hearsay | G29 | `p_sou_da` (appearance) / `p_sou_da_hearsay` | N4.15+ | Use occasionally. Natural contexts: commenting on how something looks (appearance そうだ) or reporting something heard (hearsay そうだ). Distinguish the two by context. |
| `～んです / のです` (explanatory) | G10 | `p_ndesu` (or tagged via `g_da` + nominalizer) | N5.10+ | Use in at least 1 conversation per lesson. Natural contexts: explaining reasons, providing background context, softening requests. The casual んだ/んだけど form should appear in casual conversations. Prolonged absence across 3+ consecutive lessons after N5.10 is a reinforcement gap. |

### Reinforcement in warmups

Warmup items are an ideal place to reinforce recently-unlocked grammar because they draw exclusively from prior-lesson vocabulary. Agent 1 should plan warmup items that exercise the most recently unlocked grammar milestone. For example:

- N5.6–N5.7 warmups should include at least 1 item using G8 patterns (てください requests, て-connector sequences) with N5.1–N5.5 vocabulary
- N5.9–N5.10 warmups should include at least 1 item using G9 patterns (ています, ～たいです, or ～ましょう) with prior vocabulary
- N5.10–N5.11 warmups should include at least 1 item using plain negative forms with prior vocabulary, and at least 1 item using のです/なんです explanatory form to provide context for a simple statement
- N4.4–N4.6 warmups should include at least 1 item exercising potential form (できる or verb potential) with prior vocabulary
- N4.6–N4.8 warmups should include at least 1 item using give/receive (あげる/もらう/くれる) and 1 item using comparison patterns (より, いちばん) with prior vocabulary
- N4.7–N4.9 warmups should include at least 1 item using ように/みたいに manner expression with prior vocabulary
- N4.11–N4.13 warmups should include at least 1 item using たり pattern or ながら with prior vocabulary, and at least 1 item using てから, まえに, or ために to sequence two actions
- N4.15–N4.17 warmups should include at least 1 item using のに/ても/し contrast-concession or そうだ with prior vocabulary
- N4.22–N4.24 warmups should include at least 1 item using てくる/ていく directional pattern with prior vocabulary
- N4.26–N4.28 warmups should include at least 1 item using ようにする/ようになる or a conditional (たら/ば/なら) with prior vocabulary, and at least 1 item using なければいけない obligation in a natural necessity context
- N4.31–N4.33 warmups should include at least 1 item using と思う or たことがある with prior vocabulary
- N4.35–N4.36 warmups should include at least 1 item using ～くなる/～になる or ～くする/～にする with prior vocabulary (e.g. describing a season changing or making a room quieter)

This ensures students engage with new grammar patterns using familiar words, reducing cognitive load.

### Enforcement summary

| Agent | Reinforcement responsibility |
|---|---|
| **Agent 1** | Includes "Grammar reinforcement targets" in the Content Brief. Identifies which milestone(s) are in the active window and which are in sustained use. Plans warmup items that exercise recently unlocked grammar. |
| **Agent 2** | Writes content that meets the minimum counts in the active window. Checks usage in the CB Checklist. If a minimum cannot be met naturally, flags it for Agent 1 rather than forcing awkward sentences. |
| **Agent 3** | Counts tagged forms and verifies active-window minimums are met. Reports under-counts in the QA Failure Report the same way as missing terms. |
| **Agent 4** | Performs the Grammar Reinforcement Audit (see below). Flags sustained-use forms that are completely absent. Verifies structural patterns appear where context naturally supports them. |

---

## Register Requirements (Polite vs Casual)

### The register principle

> G10 (plain forms & basic connectors) formally teaches when and how to use casual speech — with friends, family, and in relaxed settings. From the first content lesson after G10 unlocks (**N5.10**), lessons must include casual conversations to reinforce plain forms, connectors, and commands/prohibition in natural context. The majority of content remains polite to maintain the student's strongest register.

### Register schedule by lesson range

| Lesson range | Casual conversations per lesson | Register balance | Notes |
|---|---|---|---|
| N5.1–N5.9 | 0 | 100% polite | G10 not yet available. All conversations use です/ます register. |
| N5.10–N5.13 | 1 | ~75% polite, ~25% casual | First casual conversations. Keep them simple — friends/family contexts. |
| N5.14–N5.18 | 1–2 | ~60% polite, ~40% casual | Expand casual contexts: classmates, siblings, close colleagues. |
| N4.1–N4.12 | 1 | ~75% polite, ~25% casual | Early N4 grammar (potential, passive, conditionals) is cognitively demanding — keep casual light so new forms are modeled in polite register first. |
| N4.13–N4.24 | 1–2 | ~60% polite, ~40% casual | Grammar becoming familiar; ramp casual gradually. Context drives register. |
| N4.25–N4.36 | 2 | ~50% polite, ~50% casual | Balanced exposure by late N4. Casual in personal contexts, polite in service/formal contexts. |

### Casual conversation rules

1. **Context signals register.** Every conversation has a `context` field. Casual conversations must have a context that justifies informal speech — friends, family, roommates, close classmates, etc. Example: `"context": "Two college friends discussing weekend plans"`. Never use casual register in service encounters, workplaces with superiors, or stranger interactions.

1b. **Casual conversations go last and are labelled.** Within a lesson, casual conversations must be the final conversation(s) — after all polite conversations. Their `title` must include `(Casual)` at the end, e.g. `"Conversation 4: Weekend Plans (Casual)"`. This makes the register shift explicit so students know what to expect.

2. **Do not mix registers within a conversation.** A character should not switch between ます and plain form mid-dialogue unless there is a clear in-story reason (e.g. a character talks to their teacher politely, then turns to a friend and speaks casually — but this would be two conversations, not one).

3. **Casual conversations use plain forms naturally.** This means:
   - Verbs in dictionary form, plain negative (～ない), plain past (～た), plain past negative (～なかった)
   - だ instead of です for nouns and な-adjectives (but note: だ is often dropped in casual questions and feminine speech)
   - い-adjectives without です (おいしい rather than おいしいです)
   - Casual connectors: けど, から (clause-final), し, のに
   - Sentence-final particles used more freely: よ, ね, な, かな
   - Questions without ですか — rising intonation or の/かな instead

4. **Casual ≠ rude.** Plain commands (～ろ/～え) and prohibition (～な) are blunt. Use them sparingly and only in appropriate contexts:
   - Commands: sports coaching, very close male friends, playful/teasing tone, signs/instructions
   - Prohibition: warning signs (触るな "don't touch"), urgent warnings, parental scolding
   - For polite casual requests, use ～て (without ください) — this is the most common casual request form

5. **Casual conversations should not be the hardest conversation in the lesson.** The new grammar being practiced is the plain forms themselves, so the casual conversations should feel accessible and natural — not packed with advanced vocabulary.

6. **Tag plain forms correctly.** In casual conversations, verbs will use `plain_negative`, `plain_past`, `plain_past_negative`, and dictionary form (no form tag needed). Do not tag casual speech verbs with polite form tags. The copula だ should be tagged as `g_da` (not `g_desu`). See Term Tagging Reference in `skills/term-tagging-forms.md` for all valid form strings.

### What to prioritize in early casual conversations (N5.10–N5.11)

Focus on these patterns first — they are the core G10 concepts:

| Pattern | Example | Priority |
|---|---|---|
| Plain negative (～ない) | 食べない、行かない、わからない | High — core G10 |
| Plain past (～た) | 食べた、行った、見た | High — reinforces ta-form |
| けど connector | 行きたいけど、お金がない | High — natural casual connector |
| から as "because" | おいしいから食べる | High — clause-linking |
| だ copula | これは本だ / 元気だ | Medium — dropped in questions |
| Sentence-final の | どこに行くの？ | Medium — casual question form |
| Plain command (～ろ) | Only in appropriate contexts | Low — use sparingly |
| Prohibition (～な) | Signs/warnings only at first | Low — use sparingly |

### What to avoid in early casual conversations

- Don't use advanced casual patterns (んだけど, ちゃう/じゃう contractions, っぽい, etc.) before they are formally taught
- Don't drop particles aggressively — casual speech drops は and を sometimes, but lessons should keep particle usage clear for learning purposes
- Don't have all characters suddenly speaking casually — maintain a realistic social landscape where register depends on relationship

### Register in other content types

| Content type | Register rules |
|---|---|
| **Reviews** | Conversations may use either register. Mark context clearly so the student knows why. |
| **Compose** | Stay in polite register by default. From N5.10+, include one challenge prompt in casual register if the theme supports it (e.g. "Now write a casual version for a friend"). |
| **Stories** | Narrative prose uses plain past (standard for Japanese storytelling). Dialogue within stories follows the same register rules as lesson conversations — context determines register. |
| **Drills** | MCQ items may test register awareness from N5.10+: "Which is the casual form of 食べます?" Scramble items may use either register. |

### Enforcement summary

| Agent | Register responsibility |
|---|---|
| **Agent 1** | Includes "Register plan" in the Content Brief. Identifies how many casual vs polite conversations to build. Plans casual conversation contexts. For lessons before N5.10, confirms register = 100% polite. |
| **Agent 2** | Writes casual conversations using only available plain forms. Does not use casual register before N5.10. Tags plain forms correctly. Checks register in the CB Checklist. |
| **Agent 3** | Verifies casual conversations only appear in N5.10+ lessons. Verifies plain forms used in casual conversations have `introducedIn` ≤ current lesson. Verifies no register mixing within a single conversation. |
| **Agent 4** | Assesses naturalness of casual dialogue — does it sound like friends talking, not like a textbook exercise with です replaced by だ? Verifies the casual/polite ratio matches the schedule. Flags lessons that are 100% polite after N5.10 as a register reinforcement gap. |

---

