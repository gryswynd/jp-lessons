# Grammar, Vocabulary & Register Rules

> **Loaded by:** All agents for any content creation task.
> **Purpose:** Defines kanji prerequisites, vocabulary scope rules, grammar gating (when forms become available), reinforcement schedules (minimum usage after unlock), register requirements (polite vs casual), and early-use vocabulary exceptions.

---

## Kanji Prerequisite Rules

### Source of truth: `manifest.json`

Each lesson entry in `manifest.json` has a `kanji` array listing characters introduced in that lesson:

```json
{ "id": "N5.4", "title": "Places & Transport", "kanji": ["行","来","店","駅","山","川","家","道","車"] }
```

### How to compute the taught-kanji set

1. Read `manifest.json`.
2. Collect the `kanji` arrays from all lesson entries at or before the current lesson number, within the same level.
3. Flatten to a single set.
4. For multi-level content (N4 lessons): also include all N5 kanji.

### Enforcement

- Any kanji character that appears in a `jp` field and is **not** in the taught-kanji set is a **hard blocker**. Agent 2 must not use it. Agent 3 must reject any draft containing it.
- Exception: pure hiragana/katakana renderings of any word are always permitted.
- Compounds: a compound word is only permitted if **every** kanji in the compound has been taught. Example: 学校 requires both 学 (N5.7) and 校 (N5.7) to be in the taught set.
- **Watch for false-safe compounds.** A compound can look safe because one of its kanji is new to this lesson, while the other kanji is actually from a later lesson. Example: 先 is taught in N5.1, but 先週 cannot be used until N5.6 when 週 is taught. Check every character of every compound individually — never assume the compound is safe because the "focus" kanji is available.

---

## Approved Vocabulary Rules

### Where to find approved vocabulary

All permitted terms live in the glossary files:
- `data/N5/glossary.N5.json`
- `data/N4/glossary.N4.json`

Each entry has a `lesson` (for kanji type) or `lesson_ids` (for vocab type) field that specifies when it is introduced.

### Lesson scope

For a lesson or compose prompt targeting lesson `N5.X`, only terms with `lesson` / `lesson_ids` ≤ `N5.X` may be used. Terms from later lessons are **not permitted** even if the word is common Japanese.

### What "using vocab" means in practice

- Agent 2 must build the Japanese sentences from the available approved vocabulary.
- If a concept cannot be expressed with approved vocabulary, the sentence must be restructured or simplified until it can be.
- **Do not introduce vocabulary that isn't in the glossary.** If a concept genuinely requires a word that isn't in the glossary, flag this in the CB Checklist with a note: `"Word X not in glossary — restructured sentence to avoid it"`.

### Grammar patterns

Grammar patterns (particles, sentence-final forms, conjunctions like ～て) are governed by what has been taught, but they do not need to be explicitly listed in the glossary. Each conjugation form has an `introducedIn` field in `conjugation_rules.json` and each particle has an `introducedIn` field in `shared/particles.json` — these are the source of truth for when a grammar pattern becomes available. A form or particle whose `introducedIn` is later than the current lesson is **not permitted**, even if the result would be natural Japanese. See Grammar Usage Prerequisite Rules (below) for enforcement details.

---

## Lesson Refresh / Rewrite Guidelines

When the user requests a rewrite of an existing lesson (rather than creating new content from scratch), the pipeline runs identically — but Agent 1 must apply this additional rule during scoping:

**Treat every vocabulary item in the original lesson as unverified.** Do not assume that because a word appeared in an old lesson it is in scope. The original content may have been written before the current glossary discipline existed.

**Absent glossary entry = out-of-scope.** If the old lesson uses a vocab ID (e.g. `v_kouen`, `v_sanpo`) and that ID has no entry in the glossary, the word has not been introduced in the curriculum. The correct action is to remove the word and restructure the content to use available vocabulary. **Never add a new glossary entry to accommodate old lesson content.** Refreshes are not an opportunity to expand the curriculum.

**Glossary entry with wrong `lesson_ids` = still out-of-scope.** If an ID exists in the glossary but its `lesson_ids` is later than the current lesson, it is out-of-scope and must be removed. The presence of a glossary entry does not make the word available.

**The Unregistered Word Report path does not apply during refreshes.** That escalation is for new content creation where a genuinely natural word might warrant a new glossary entry at an appropriate lesson. During a refresh, all vocabulary must already exist in the glossary at or before the current lesson — no exceptions, no escalations.

**Agent 1 scoping step for refreshes:** After reading the original lesson, run a targeted Grep for every vocab ID used in the original against the glossary. Flag any ID that either (a) doesn't exist in the glossary, or (b) has `lesson_ids` later than the current lesson. List these as "out-of-scope replacements needed" in the Content Brief, along with candidate replacement vocabulary from within scope.

**Sentence Token Scan Protocol applies to all rewrites.** When Agent 2 builds the refreshed content, the STSP must be applied to every jp/passage field — including fields carried forward from the original file unchanged. Treat every jp string in the original as unaudited; the previous version may predate current tagging standards. Agent 3 must perform the STSP during QA of all refreshed content and may not give the original a "previously passing" exemption. This applies equally to lesson, review, and game day (Final Interactive Review) rewrites — anywhere jp + terms[] tagging is used. Grammar garden rewrites are governed by the Grammar Accuracy Audit, not the STSP.

---

## Early-Use Vocabulary Rules

### The problem

Some vocabulary is essential for natural conversations long before its kanji is formally taught. For example, わたし (私) is the most basic pronoun in Japanese and is needed from lesson 1, but the kanji 私 is not introduced until N4.3. Without an exception mechanism, agents cannot use these words in early content.

### How the glossary handles this

Each early-use word has its glossary entry set up with:
- **`surface`**: The kanji form (e.g. 私, 家族, 好き)
- **`matches`**: An array containing the hiragana writing (e.g. ["わたし", "かぞく", "すき"])
- **`lesson_ids`**: Set to the lesson where ALL constituent kanji are taught

The `matches` field allows the app to recognize the hiragana form when students type it (compose mode) or when it appears in content. The `lesson_ids` field controls when the full kanji form becomes available.

### Rules for agents

1. **Before the kanji lesson:** Write the word using its hiragana form (from the `matches` field). Tag it in `terms` using the same vocab ID — the ID is valid regardless of writing form.
2. **From the kanji lesson onward:** Write the word using its full kanji surface form.
3. **Only words on the approved list below may be used before their `lesson_ids` lesson.** This is a closed list — do not extend it without user approval.

### Approved early-use vocabulary

These words may be written in hiragana and used in content **from the listed lesson onward**, even though their `lesson_ids` (kanji introduction) is later.

| ID | Write as | Use from | Kanji form | Kanji available | Notes |
|---|---|---|---|---|---|
| `v_watashi` | わたし | N5.1 | 私 | N4.3 | Essential first-person pronoun |
| `v_nani` | なに | N5.1 | 何 | N5.2 | Question word (before を/が or standalone) |
| `v_nan` | なん | N5.1 | 何 | N5.2 | Question word (before です/の/counters/d-n-t sounds) |
| `v_kazoku` | かぞく | N5.1 | 家族 | N4.7 | Essential for family-themed content from lesson 1 |
| `v_suki` | すき | N5.7 | 好き | N4.4 | Na-adjective "like" — needed for food/preference conversations |
| `v_tsugi` | つぎ | N5.4 | 次 | (not taught) | "Next" — needed for sequencing and time expressions. 次 kanji is not formally introduced in any lesson; always write in hiragana. |
| `v_koto` | こと | N5.9 | 事 | N4.14 | Nominalizer "thing/fact" — needed for ～ことがある, ～ことにする patterns. Write as こと before N4.14. |
| `v_kinou` | きのう | N5.4 | 昨日 | (not taught) | "Yesterday" — essential time word paired with きょう. 昨 kanji is not formally introduced in any lesson; always write in hiragana. |
| `v_namae` | 名まえ | N5.1 | 名前 | N5.9 | Essential noun for introductions ("what is your name?"). 名 is N5.1 kanji; 前 is N5.9. Write as 名まえ until N5.9, then 名前. |

**Example usage in N5.1 content:**
```json
{
  "jp": "わたしのかぞくは四人です。",
  "en": "My family has four people.",
  "terms": ["v_watashi", "v_kazoku", ...]
}
```

The term ID `v_watashi` is used normally — the only difference is the surface text is written in hiragana instead of kanji.

### Partial-kanji vocabulary (hybrid writing)

Some compound words contain kanji from different lessons. When the word is introduced at a lesson where only SOME of its kanji have been taught, agents must write the word using partial kanji — available characters in kanji, unavailable characters in hiragana. The `matches` field contains these partial-kanji forms.

Unlike early-use vocabulary, these words are available at their `lesson_ids` lesson through normal rules. The only special instruction is the **writing form**.

| ID | Partial form | Use from | Full kanji form | Full kanji available |
|---|---|---|---|---|
| `v_daisuki` | 大すき | N5.7 | 大好き | N4.4 |
| `v_asagohan` | 朝ごはん | N4.3 | 朝ご飯 | N4.6 |
| `v_bangohan` | 晩ごはん | N4.3 | 晩ご飯 | N4.6 |
| `v_nichiyoubi` | 日ようび | N5.2 | 日曜日 | N4.14 |
| `v_getsuyoubi` | 月ようび | N5.2 | 月曜日 | N4.14 |
| `v_kayoubi` | 火ようび | N5.2 | 火曜日 | N4.14 |
| `v_suiyoubi` | 水ようび | N5.2 | 水曜日 | N4.14 |
| `v_mokuyoubi` | 木ようび | N5.2 | 木曜日 | N4.14 |
| `v_kinyoubi` | 金ようび | N5.2 | 金曜日 | N4.14 |
| `v_doyoubi` | 土ようび | N5.2 | 土曜日 | N4.14 |
| `v_nanyoubi` | 何よう日 | N5.2 | 何曜日 | N4.14 |
| `v_shuumatsu` | 週まつ | N5.4 | 週末 | *(末 never taught — permanent hybrid)* |

**Writing form decision rule:** For any word with a `matches` field, check whether ALL kanji in the surface are in the taught-kanji set for the current lesson. If yes, use the full kanji surface. If no, use the partial-kanji or hiragana form from `matches` that matches the available kanji.

### Maintaining these lists

- **Adding to the early-use list** requires user approval. Do not add words without explicit permission — the list is intentionally small (essential pronouns, question words, and high-frequency words only).
- **Adding partial-kanji entries** happens naturally when a compound word's constituent kanji are taught in different lessons. Agent 1 should check for this during scoping and ensure the `matches` field includes the appropriate partial form.
- **The partial-kanji table is a closed list.** Do not invent a new hybrid writing form for any compound not on it. If a compound's kanji are all eventually taught, the compound must be deferred to the lesson where the last kanji unlocks — it is not a partial-kanji candidate. The partial-kanji mechanism is only for compounds where at least one constituent kanji is **never introduced in any lesson** (永遠に未導入). Adding a word to this list requires explicit user approval.
- **Ad-hoc hybrid forms are prohibited.** Writing `おもい出` (hiragana substituted for an untaught-but-eventually-taught kanji) to introduce a compound before its kanji are ready is a scope violation, not a partial-kanji entry. Agent 1 must catch this during scoping; Agent 3 must reject any draft that uses a hybrid form for a word not on the approved partial-kanji list.
- When a word on either list reaches its full-kanji lesson, no special handling is needed — agents simply start writing the kanji form.

### Agent responsibilities

| Agent | Responsibility |
|---|---|
| **Agent 1** | When scoping a lesson, check the early-use list to identify which words are available in hiragana. Include them in the Content Brief's vocabulary scope. |
| **Agent 2** | Write early-use words in hiragana. Write partial-kanji words using the form appropriate for the lesson tier. Tag with the standard vocab ID regardless of writing form. |
| **Agent 3** | Verify that any word written in hiragana in a `jp` field either (a) has no kanji in the glossary surface, or (b) is on the early-use list and its kanji is not yet taught. Flag words written in hiragana that SHOULD be written in kanji (because the kanji is already taught). Also verify that early-use words are not used before their "Use from" lesson. |
| **Agent 4** | No additional checks beyond standard consistency review. |

---

## Grammar Usage Prerequisite Rules

### Source of truth: `conjugation_rules.json` and `shared/particles.json`

Each conjugation form in `conjugation_rules.json` has an `introducedIn` field specifying the lesson that formally teaches it. Each particle in `shared/particles.json` has an equivalent field. These are hard gates — not guidelines.

### How to compute the available grammar set

1. Read `conjugation_rules.json`.
2. Collect all form entries whose `introducedIn` lesson is ≤ the current lesson.
3. Read `shared/particles.json`.
4. Collect all particle entries whose `introducedIn` lesson is ≤ the current lesson.
5. The union of these two sets defines the grammar available for the content.

### Enforcement

- Any conjugation form whose `introducedIn` is later than the current lesson is a **hard blocker**. Agent 2 must not use it. Agent 3 must reject any draft containing it. Agent 4 must flag it as a grammar usage violation.
- Structural grammar patterns (e.g. ～ている, ～てください, ～たり～たりする) inherit the prerequisite of their constituent forms. If `te_form` has `introducedIn: "N5.5"`, then ～ている is not available before N5.5.
- Particles follow the same rule: a particle whose `introducedIn` is later than the current lesson must not appear in `jp` text.
- Exception: dictionary/base forms of verbs and adjectives have no `introducedIn` gate — they are available whenever the vocabulary item itself is available.
- When a sentence requires a grammar pattern that is not yet available, restructure the sentence to use only available forms. For example, in an N5.3 lesson, instead of 「行って食べました」(requires te_form, N5.5), write 「行きました。食べました。」(uses polite_mashita, N5.5 — or if that's also unavailable, use dictionary form or restructure further).

### Quick reference: form availability by lesson

| Lesson | Newly available forms |
|---|---|
| N5.1 | `polite_adj` |
| N5.5 | `polite_masu`, `polite_mashita`, `polite_negative`, `polite_past_negative`, `te_form`, `polite_negative_te`, `plain_past` |
| N5.8 | `plain_desire_tai`, `desire_tai_negative`, `polite_desire_tai_negative`, `polite_volitional_mashou` |
| N5.9 | `plain_negative`, `plain_past_negative` |
| G9 (N5.9+) | `plain_volitional`, `plain_past_adj`, `plain_appearance_sou`, `plain_desire_tai_past` |
| N5.10 | `polite_past_adj`, `adverbial`, `desire_tai_past` |
| N5.11 | `appearance_sou` |
| N4.3 | `potential`, `polite_potential`, `potential_negative`, `plain_potential_negative`, `polite_potential_past`, `plain_potential_past` |
| N4.10 | `tari_form`, `nagara_form` |
| G25 (~N4.34) | `sugiru_form`, `polite_sugiru_form`, `sugiru_past`, `polite_sugiru_past` |
| G25 (~N4.34) | `conditional_ba` |
| N4.25 | `conditional_tara` |
| N4.31 | `passive`, `polite_passive`, `polite_passive_past`, `plain_passive_past`, `causative`, `polite_causative`, `polite_causative_past`, `plain_causative_past`, `causative_passive`, `polite_causative_passive` |

Before N5.5, only `polite_adj` and dictionary forms are available. This means N5.1–N5.4 content is limited to noun-です sentences, い-adjective+です sentences, and verbs in dictionary form. Plan sentences accordingly.

**Desire expressions (N5.8+).** `plain_desire_tai` is available from N5.8. For polite desire sentences (〜たいです), use `plain_desire_tai` + `g_desu` (two chips). For plain/casual desire (〜たい without です), use `plain_desire_tai` alone. The deprecated `desire_tai` form must never be used — see desire_tai — deprecated in `skills/term-tagging.md`. The reinforcement schedule expects desire expressions from N5.9 onward (G9 active window); N5.8 content may use `plain_desire_tai` but is not required to meet reinforcement minimums for it.

---

## Grammar Reinforcement Requirements

The prerequisite rules above define when a grammar form **may** be used (the ceiling). This section defines when a grammar form **should** be used (the floor). Without both rules, content can technically pass all QA gates while never actually practicing the grammar students have learned — defeating the purpose of teaching it.

### The reinforcement principle

> Once a grammar form is unlocked, subsequent content must **actively use** it. Students learn through repeated, natural exposure — not by seeing a form once in a grammar lesson and never encountering it again.

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

6. **Tag plain forms correctly.** In casual conversations, verbs will use `plain_negative`, `plain_past`, `plain_past_negative`, and dictionary form (no form tag needed). Do not tag casual speech verbs with polite form tags. The copula だ should be tagged as `g_da` (not `g_desu`). See Term Tagging Reference in `skills/term-tagging.md` for all valid form strings.

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

