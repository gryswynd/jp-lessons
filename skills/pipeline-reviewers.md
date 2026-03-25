# Content Pipeline — Agent 3 & Agent 4 (Part 2: Reviewers)

> **Loaded by:** Agent 3 (QA Reviewer) and Agent 4 (Consistency Reviewer) for review passes.
> **Purpose:** Defines Agent 3 (QA) and Agent 4 (CR) responsibilities, the Grammar Accuracy Gate, Grammar Scope Enforcement, Grammar Usage Validation, and Grammar Reinforcement Audit.
> **See also:** `skills/pipeline-overview.md` (Pipeline overview + Agents 1 & 2), `skills/pipeline-handoff.md` (handoff protocol + quick start).

---

### AGENT 3 — QA Reviewer (QA)

**Trigger:** Spawned by Agent 1 via the Agent tool. Receives the draft JSON and the Content Brief. Has no access to Agent 2's reasoning or the prior conversation — it approaches the draft cold, with no memory of having written any of it.

**Responsibilities:**
- **FIRST: Mechanical kanji scope audit.** Before any other check, perform this mandatory step:
  1. Read `manifest.json`.
  2. Compute the taught-kanji set: collect the `kanji` arrays from all N5 lessons + all lessons in the current level at or below the target lesson number. Flatten to a single character set.
  3. Extract every CJK character (Unicode range U+4E00–U+9FFF) from every `jp`, `passage`, `q`, `a`, and `answer` field in the draft.
  4. For each extracted character: if it is not in the taught-kanji set, it is an **immediate hard fail**. Record the character, the lesson it is introduced in (search `manifest.json`), the field it appeared in, and the full sentence.
  5. Report all kanji violations in the QA Failure Report before checking anything else.
  This check must use `manifest.json` as the sole source of truth. Do not rely on memory or glossary lookup to determine whether a kanji has been taught.
- Perform a systematic line-by-line audit. Do **not** skim.
- **Apply the Sentence Token Scan Protocol (STSP) to every `jp`, `passage`, and `q` field.** Read each sentence left to right, token by token. For every token (noun, verb, adjective, adverb, particle, conjunction, copula, sentence-final particle), verify it is either (a) tagged in `terms` with a matching ID, or (b) a permissible untagged pure-kana function word that has **no glossary entry**. Kana-only connectors and particles (e.g. でも, だから, だって, よ, ね, か) must be verified against `shared/particles.json` for their `introducedIn` lesson — do **not** assume they are permissible just because they are written in kana. The STSP applies equally to warmup items, reading passage sentences, reading `q` comprehension questions, and drills — no section or field is exempt. Q&A question fields (`q`) require the same completeness as `jp` fields: every content word must be tagged, and any `q` sentence ending with `か` must have `p_ka` in `terms`. During rewrites and refreshes, apply the STSP to every jp and q field including those carried forward from the original; no field gets a "previously passing" exemption.
- For every `terms` entry: verify the ID exists in the glossary (cross-reference the glossary file). Then verify the **surface form** of that glossary entry matches (or inflects from) the actual token in the `jp` field. A surface mismatch — e.g. tagging `だ` with `g_desu` whose glossary surface is `です` — is a **hard fail** even if the ID exists.
- For every verb/adjective term entry: verify the `form` string is a valid key in `conjugation_rules.json`.
- Verify all kanji in `jp` fields appear in the taught-kanji set (from `manifest.json`).
- **Compound surface spacing check.** For every `terms` entry whose glossary `surface` contains an internal particle or spans multiple morphemes (identifiable by a particle like が/の/を embedded in the middle of the surface string — e.g. `v_atamagaii` surface `"頭がいい"`), verify the jp text contains that surface as a **contiguous substring with no inserted spaces**. A space anywhere inside the compound (e.g. `頭が いい` vs surface `頭がいい`) breaks the text-processor match silently — no chip appears, no error is thrown. This is a **hard fail**: instruct Agent 2 to remove the space from the jp text. Do not accept a split into constituent terms as the fix — that changes the semantic unit.
- **Glossary-surface writing-form check.** For every word used in `jp` text, look up its glossary entry and check whether its `surface` field contains any kanji that are **not** in the taught-kanji set. If so, the word must appear in the hiragana/partial-kanji form from its `matches` field — never in the full-kanji `surface` form. This check catches cases like 一緒に (surface) written in jp text when the glossary's `matches` form is いっしょに and 緒 is not yet taught, or 大丈夫 written when だいじょうぶ is the required form. Grep the glossary for the word's ID, read both `surface` and `matches`, then verify the jp text uses the form consistent with the current taught-kanji set. Any mismatch is a **hard fail**.
- **New glossary entry kanji gate.** For any glossary entry created during this content-creation cycle (i.e. an entry that did not exist before Agent 1 began scoping), verify: (a) every kanji in the `surface` field is in the taught-kanji set at `lesson_ids`; (b) if the surface contains an untaught kanji, the entry must be on the approved partial-kanji list in skills/grammar-rules-prerequisites.md (permanent-hybrid case) — not an ad-hoc hybrid invented to work around a deferred compound. A new entry whose surface contains a kanji not taught until a later lesson, and which is not on the partial-kanji list, is a **hard fail**: flag it to Agent 1 with the lesson where the last required kanji unlocks.
- **Unregistered kana lexical word check.** For every pure-kana token in `jp` text that is a lexical word (not a particle or copula — use judgement: interjections like うん, confirmations like そう, casual words like だよ/だね count as lexical), verify it has an entry in `glossary.N5.json` or `glossary.N4.json`. If it does not, do **not** issue a standard FAIL — instead, produce an **Unregistered Word Report** (see below) and return it to Agent 1. Agent 1 presents the list to the user and asks whether to add each word to the glossary. This is not a content error by Agent 2 — it is a gap between natural conversational Japanese and the current glossary coverage.
- Verify the JSON schema matches the content type schema exactly (no extra/missing required fields).
- Verify answer fields match the correct answer choices.
- Verify drill distractors are plausible (wrong but not absurd; drawn from same lesson vocab where possible).

**QA Decision:**

- **PASS:** Attach a QA-PASS stamp and forward to Agent 4.
- **FAIL:** Produce an annotated failure report (see format below) and return to Agent 2. Agent 2 must fix every listed issue and resubmit; Agent 3 performs a full re-audit.
- **ESCALATE (unregistered words):** If the only issues are unregistered kana lexical words — no structural failures, no untaught kanji, no bad IDs — produce an Unregistered Word Report and return to Agent 1 rather than Agent 2. Agent 1 presents the words to the user for a glossary decision, then re-dispatches to Agent 2 with the result. If there are both structural failures AND unregistered words, report both but send back to Agent 2 for the structural fixes first; unregistered words are escalated in a separate pass once the draft is structurally clean.

**QA Failure Report format:**

```
QA FAILURE REPORT
═════════════════
Draft: [content ID]
Pass number: [1st | 2nd | ...]

ISSUES:
Line/Section | Issue Type          | Detail
─────────────┼─────────────────────┼───────────────────────────────────────
[conv line 3]│ Missing term tag     │ "学校" used but not tagged; expected id: v_gakkou
[drill 2 q1] │ Unknown ID           │ "v_futur" not found in glossary
[reading p2] │ Untaught kanji       │ "駅" not introduced until N5.4; current lesson is N5.3
[drill 3 q2] │ Wrong form           │ 飲みます should be { "id": "v_nomu", "form": "polite_masu" } not bare string
[json]       │ Schema error         │ Missing required field "context" on conversation section

Total issues: N
Status: FAIL — return to Agent 2
```

**Unregistered Word Report format** (used when escalating to Agent 1 for user decision):

```
UNREGISTERED WORD REPORT
════════════════════════
Draft: [content ID]

The following pure-kana lexical words appear in the draft but have no glossary entry.
These are not errors by Agent 2 — they represent natural Japanese that is not yet in the
glossary. Agent 1 must present this list to the user and ask whether to add each word.

Word  | First appears in          | Suggested entry
──────┼───────────────────────────┼────────────────────────────────────────────────────
うん  │ [conv 4 line 2]           │ v_un, surface "うん", gtype "interjection", lesson_ids "N5.10", meaning "yeah / uh-huh (casual affirmative)"
[word]│ [location]                │ [suggested id, surface, gtype, lesson_ids, meaning]

Status: ESCALATE — return to Agent 1 for user decision before re-dispatching to Agent 2
```

**Agent 1 user escalation format** (when presenting an Unregistered Word Report to the user):

```
GLOSSARY GAP FOUND
══════════════════
Agent 2 used the following natural Japanese words that are not yet in the glossary.
Please confirm whether to add them, and whether the suggested lesson_ids is correct.

Word  | Suggested entry                               | Add?
──────┼───────────────────────────────────────────────┼──────
うん  │ v_un / interjection / "yeah, uh-huh" / N5.10 │ [yes/no/modify]

For each "yes": Agent 1 will add the entry to the glossary before Agent 2 finalises the draft.
For each "no": Agent 2 must remove the word from the jp text or replace it with a registered alternative.
```

### Agent 3 — Grammar Accuracy Gate (grammar lessons only)

When the draft has `"type": "grammar"`, Agent 3 must perform an additional **Grammar Accuracy Audit** before issuing a pass. This audit checks linguistic correctness — something the structural checks cannot catch.

**Procedure:**

1. For every `grammarRule` section, read the `explanation` and `notes` fields and verify each claim is linguistically accurate. Apply the **Grammar Known-Pitfalls Checklist** (see below). Any claim that contradicts standard Japanese grammar pedagogy is a **hard blocker** — same severity as an untaught kanji.

2. For every `grammarTable` section, verify that every conjugated form in every cell is correct. Cross-reference against `conjugation_rules.json` where applicable. Pay special attention to irregular forms (する, くる, いい/よい).

3. For every `grammarComparison` section, verify that both items' `points` accurately describe the grammar difference. The most common error is oversimplifying は vs が or に vs で to the point of being misleading.

4. For every example sentence across all grammar-specific sections (`grammarRule`, `annotatedExample`, `grammarTable`, `grammarComparison`), verify the sentence is grammatically correct Japanese — not just structurally valid JSON.

**Grammar Known-Pitfalls Checklist:**

Agent 3 must specifically check for these known error patterns. If any are found, it is an automatic FAIL:

| Pitfall ID | Wrong Claim | Correct Rule |
|---|---|---|
| GP-01 | "い-adjectives do not take です" or "do NOT add です after an い-adjective" | い-adjectives DO take です in polite speech. やさしいです is correct and standard. What is wrong is やさしいだ — い-adjectives do NOT take だ in plain speech. |
| GP-02 | "は marks the subject" | は marks the TOPIC, not the subject. が marks the subject. These are different grammatical concepts. |
| GP-03 | "が is for emphasis" (stated without nuance) | が marks the subject and introduces NEW information. "Emphasis" is a side effect, not the core function. The explanation must mention new-information marking. |
| GP-04 | "に and へ are interchangeable" (stated without qualification) | に and へ overlap for destinations of motion verbs, but に has many other uses (time, existence location, indirect object) that へ cannot cover. へ emphasizes direction/orientation. |
| GP-05 | Passive and potential are "the same form" (without specifying verb type) | They are identical ONLY for ichidan (RU) verbs. Godan (U) verbs have distinct passive (あ-column + れる) and potential (え-column + る) forms. |
| GP-06 | "ない is a verb" or "ない is an auxiliary verb" | ない conjugates as an い-adjective (なかった, なくて, なければ). It is an auxiliary adjective. |
| GP-07 | "でも means 'but'" (stated without distinguishing from けど/が) | でも is a sentence-STARTING conjunction ('but/however'). けど and が are clause-ENDING conjunctions that connect within a sentence. These are structurally different. |
| GP-08 | Conditional forms presented as freely interchangeable | と (automatic/natural result), ば (general/hypothetical), たら (temporal/sequential), なら (contextual/hearsay) each have distinct usage constraints. Never present them as synonyms. |
| GP-09 | "を marks the object" (without mentioning movement-through usage) | を also marks the space traversed with movement verbs: 公園を歩く (walk through the park). This is a distinct usage from direct object marking. For N5 grammar, mentioning both is required. |
| GP-10 | Treating じゃ as "slang" or "incorrect" | じゃ is a standard spoken contraction of では. It is grammatically correct and appropriate in most non-formal-written contexts. |

**Maintaining this checklist:** When a new grammar error is discovered during content review (by any agent or by the user), add it to this table with a new GP-XX ID. This is a living document.

**QA Failure Report — grammar accuracy issues use this format:**

```
Line/Section | Issue Type            | Detail
─────────────┼───────────────────────┼──────────────────────────────────────
[rule sec 2] │ Grammar accuracy (GP-01) │ Note claims い-adj don't take です; must state they DO take です in polite, do NOT take だ in plain
[table sec 3]│ Incorrect conjugation │ Cell shows いかった for past of いい; correct form is よかった
```

---

### AGENT 4 — Consistency Reviewer (CR)

**Trigger:** Spawned by Agent 1 via the Agent tool. Receives the QA-approved draft and the Content Brief. Has no access to Agent 3's reasoning or the prior conversation.

**Responsibilities:**
- **Use the latest content as the reference standard.** Read the highest-numbered existing lesson file of the same content type and level — this represents the current structural standard. Optionally read one additional earlier file for comparison. When conventions differ between older and newer files, the newest file always takes precedence.
- Assess: **Natural language quality** — do conversations sound like real Japanese, not textbook recitations? Are the situations culturally plausible?
- Assess: **Redundancy** — read each scene as a sequence, not sentence by sentence. Flag any cluster of 2+ consecutive sentences that convey essentially the same information through different grammar. This pattern is the primary symptom of forced vocabulary insertion: Agent 2 added sentences not because the story needed them, but to check off a required vocab ID. Each sentence must add new information or advance the scene — restating the same fact in different words is a hard fail regardless of whether each sentence is individually grammatical. Example: "やまかわさんもいます。こちらはやまかわさんです。名前はやまかわです。" — three consecutive sentences that all communicate "this person is Yamakawa." Any one of them is fine; all three together is a redundancy fail.
- Assess: **Skill progression** — does difficulty increase appropriately from the previous lesson? Are new grammar points used naturally rather than force-fed? Are conjugation forms and grammar patterns appropriate for the lesson tier? See Agent 4 — Grammar Usage Validation (below).
- Assess: **Vocabulary density** — are too few or too many new vocab items packed into a single section?
- Assess: **Consistency** — character names, setting details, and vocabulary choices consistent with the rest of the series?
- Assess: **Scenario variety** — does this prompt/story/review cover scenarios not already covered by recent content?

**CR Decision:**

- **PASS:** Confirm approval and return the file to Agent 1 for writing.
- **FAIL:** Produce a Consistency Note and return to Agent 1 with a rewrite directive. Agent 1 updates the Content Brief and redispatches to Agent 2; the full pipeline restarts from Agent 2.

**CR Consistency Note format:**

```
CONSISTENCY NOTE
════════════════
Draft: [content ID]
Pass number: [1st | 2nd | ...]

ISSUES:
Category           | Detail
───────────────────┼───────────────────────────────────────────────────────
Natural language   | Conv line 4: nobody says 「わたしは行きますです」— drop です
Skill progression  | Reading passage introduces conditional ～たら which is N4 grammar
Vocabulary density | Section "vocabList" lists 28 items; cap is ~18 per section
Scenario variety   | Very similar to N5.4 lesson scenario (shopping at a station store)
Consistency        | Teacher named "やまもと先生" in N5.1; called "やまかわ先生" here
Rewrite directive  | [plain English instruction to Agent 1 describing the required change]

Total issues: N
Status: FAIL — return to Agent 1 for rewrite
```
### Agent 4 — Grammar Scope Enforcement (grammar lessons only)

When the draft has `"type": "grammar"`, Agent 4 must perform a **Scope Alignment Check** in addition to its standard consistency review.

**Procedure:**

1. **Brief-to-content alignment.** For every `grammarRule` section in the draft, verify that the grammar point it teaches appears in the Content Brief's "Grammar points" field. If a `grammarRule` teaches something NOT listed in the brief, it is a **hard fail** with a rewrite directive. The Content Builder does not have authority to substitute grammar points — only the Project Manager can change scope.

2. **Prerequisite concept check.** For each grammar point taught, assess whether students at the `unlocksAfter` level have been exposed to the prerequisite concepts. Apply this decision framework:

   | Grammar concept | Prerequisite concepts needed |
   |---|---|
   | Casual copula だ | Understanding of です (polite copula) — OK after N5.1 |
   | なんです / のです (explanatory) | Familiarity with の nominalizer, exposure to casual speech patterns — needs at minimum G1 (copula) + G2 (の particle) complete |
   | て-form usages (ている, てください) | て-form construction — needs G8 or equivalent |
   | Conditional forms (ば, たら, と, なら) | Plain form conjugation — needs G10 |
   | Passive / causative | Plain negative formation (あ-column shift) — needs G10 |
   | Potential form | Verb type identification — needs G6 |

   If a grammar point is taught before its prerequisites are available, flag it as a scope violation.

3. **Density check.** Count the `grammarRule` sections. Grammar lessons should have **2–5 grammarRule sections** depending on complexity. More than 5 indicates the lesson is trying to cover too much — recommend splitting. Fewer than 2 suggests the lesson may be too thin or that teaching content is hiding in non-rule sections where it's less effective.

4. **Section substitution detection.** Compare the draft's section list against the GRAMMAR_CONTENT.md spec for this lesson ID. If a section listed in the spec was replaced with a different section type or a different grammar point, flag it explicitly. Example:

   ```
   SCOPE ALERT: Spec calls for grammarRule on "casual copula だ" (section 4 in spec).
   Draft has grammarRule on "なんです nominalization" instead.
   This is a substitution — the Content Builder replaced a scoped grammar point with an unscoped one.
   → FAIL: Return to Agent 1 to restore original scope or formally revise the brief.
   ```

5. **Cross-lesson overlap check.** Read the two nearest grammar lessons (by ID number) if they exist. Verify that the current lesson does not substantially duplicate a grammar point already taught in an adjacent lesson. Minor overlap for reinforcement is acceptable; a full `grammarRule` section teaching the same pattern as an adjacent lesson is not.

**CR Consistency Note — scope issues use this category:**

```
Category            | Detail
────────────────────┼──────────────────────────────────────────────────────
Scope violation     | grammarRule "rule_nominalization" teaches なんです; not in Content Brief; prerequisite G3 (の) not yet available
Prerequisite gap    | Conditional ～たら requires plain form knowledge (G10); current lesson unlocks after N5.5
Section substitution| Spec section 4 (casual だ) replaced by nominalization rule — unauthorized scope change
Density             | 7 grammarRule sections; recommend splitting into two lessons
```

### Agent 4 — Grammar Usage Validation (all content types)

For **every** draft — not just grammar lessons — Agent 4 must perform a **Grammar Usage Validation** to verify that the grammar patterns used in Japanese sentences are appropriate for the lesson's position in the curriculum. This check complements kanji and vocabulary prerequisite enforcement with an equivalent gate for grammar.

**Why this matters:** Kanji and vocabulary have hard prerequisite checks (Agent 3 catches untaught kanji, fabricated IDs, out-of-scope vocab). But grammar patterns — conjugation forms, structural patterns like ～ている or ～てください, and particles — have historically relied on Agent 4's vague "skill progression" assessment. This section makes that check concrete and systematic.

**Procedure:**

1. **Conjugation form audit.** For every `terms` entry that uses a `form` field, look up that form in `conjugation_rules.json` and check its `introducedIn` value. If the form's `introducedIn` lesson is later than the current lesson, it is an out-of-scope grammar violation. Use this reference table for quick checks:

   | Form | `introducedIn` | Available from |
   |---|---|---|
   | `polite_adj` | N5.1 | N5.1+ |
   | `attributive_na` | N5.11 | N5.11+ |
   | `polite_masu`, `polite_mashita`, `polite_negative`, `polite_past_negative` | N5.5 | N5.5+ |
   | `te_form`, `polite_negative_te` | N5.5 | N5.5+ |
   | `plain_past` | N5.5 | N5.5+ |
   | `desire_tai_negative`, `polite_desire_tai_negative`, `polite_volitional_mashou` | N5.8 | N5.8+ |
   | `plain_volitional`, `plain_form` | G9 | N5.9+ |
   | `plain_negative`, `plain_past_negative` | N5.9 | N5.9+ |
   | `polite_past_adj`, `adverbial`, `desire_tai_past` | N5.10 | N5.10+ |
   | `plain_past_adj`, `plain_desire_tai`, `plain_appearance_sou`, `plain_desire_tai_past` | G9 | N5.9+ |
   | `appearance_sou` | N5.11 | N5.11+ |
   | `potential`, `polite_potential`, `potential_negative`, `plain_potential_negative`, `polite_potential_past`, `plain_potential_past` | N4.3 | N4.3+ |
   | `tari_form`, `nagara_form` | N4.10 | N4.10+ |
   | `sugiru_form`, `polite_sugiru_form`, `sugiru_past`, `polite_sugiru_past` | G25 | N4.34+ |
   | `conditional_ba` | G22 | N4.25+ |
   | `conditional_tara` | N4.25 | N4.25+ |
   | `passive`, `polite_passive`, `polite_passive_past`, `plain_passive_past`, `causative`, `polite_causative`, `polite_causative_past`, `plain_causative_past`, `causative_passive`, `polite_causative_passive` | N4.31 | N4.31+ |

2. **Structural grammar pattern scan.** Beyond tagged conjugation forms, scan the `jp` surface text for structural grammar patterns that imply knowledge of specific forms even when the individual verb tags might look in-scope. Common patterns to flag:

   | Pattern in `jp` text | Requires | Example violation |
   |---|---|---|
   | ～ている / ～ています | `te_form` (N5.5+) | Using ～ています in N5.3 content |
   | ～てください | `te_form` (N5.5+) | Using ～てください in N5.4 content |
   | ～たり～たりする | `tari_form` (N4.10+) | Using ～たりします in N4.8 content |
   | ～ながら | `nagara_form` (N4.10+) | Using ～ながら in N4.5 content |
   | ～たら | `conditional_tara` (N4.25+) | Using ～たら in N4.20 content |
   | ～ば / ～ければ | `conditional_ba` (G22 / N4.25+) | Using ～ば in N4.20 content |
   | ～すぎる | `sugiru_form` (G25 / N4.34+) | Using ～すぎます in N4.3 content |
   | ～られる (passive) | `passive` (N4.31+) | Using ～られます in N4.25 content |
   | ～させる (causative) | `causative` (N4.31+) | Using ～させます in N4.25 content |
   | ～たいです | `plain_desire_tai` + `g_desu` (N5.8+) | Using ～たいです in N5.6 content |
   | ～ましょう | `polite_volitional_mashou` (N5.8+) | Using ～ましょう in N5.6 content |
   | ～ない / ～なかった (plain neg) | `plain_negative` (N5.9+) | Using ～ない in N5.7 content |
   | ～そうです (appearance) | `appearance_sou` (N5.11+) | Using ～そうです in N5.9 content |

3. **Particle scope verification.** For all content types (not just compose), verify that particles used in `jp` text are within scope. Cross-reference each particle against `shared/particles.json`'s `introducedIn` field. This extends Agent 3's tagging check — Agent 3 verifies tagged particles have valid IDs; Agent 4 verifies that the grammar patterns those particles enable are age-appropriate for the lesson.

4. **Severity classification.**
   - **Hard fail:** A conjugation form with `introducedIn` later than the current lesson is used in a tagged `terms` entry. This is a concrete, verifiable violation equivalent to an untaught kanji.
   - **Hard fail:** A structural grammar pattern (from the table above) appears in `jp` text before the form is available.
   - **Soft fail (judgment):** A grammar pattern is technically available (the form's `introducedIn` ≤ current lesson) but has not been practiced or emphasized yet and appears complex for the lesson tier. Flag as a skill-progression concern, not a hard block.

**CR Consistency Note — grammar usage issues use this category:**

```
Category            | Detail
────────────────────┼──────────────────────────────────────────────────────
Grammar usage       | Conv line 3 uses te_form (introducedIn: N5.5) but lesson is N5.3 — out of scope
Grammar usage       | Reading passage contains ～たいです pattern (plain_desire_tai, N5.8+) in N5.6 content
Grammar usage       | jp text uses ～ている progressive but te_form not available until N5.5
Particle scope      | Particle でも (p_demo, introducedIn: N4.14) used in N4.10 conversation — out of scope
```

### Agent 4 — Grammar Reinforcement Audit (all content types)

For **every** draft, Agent 4 must perform a **Grammar Reinforcement Audit** to verify that recently-taught grammar forms are being actively used. This is the complement to the Grammar Usage Validation — that check catches **over-reach** (using forms too early); this check catches **under-use** (not using forms that should be practiced).

**Why this matters:** Without this check, content can pass all other QA gates while using only the most basic grammar (ます, ました, です) even when the student has learned te-form, desire expressions, volitional, negatives, and more. This creates a plateau where students learn rules in grammar lessons but never see them in practice.

**Procedure:**

1. **Identify the reinforcement context.** Read the Content Brief's "Grammar reinforcement" field. Identify which milestones are in the active window and which are in sustained use for this lesson.

2. **Count active-window forms.** For each milestone in the active reinforcement window, count the occurrences of its required patterns across all conversation and reading sections (excluding drills). Compare against the minimum counts in the Grammar Reinforcement Schedule in `skills/grammar-rules-reinforcement.md`.

   - **Hard fail:** An active-window minimum count is not met AND there are conversations/readings where the form could have been used naturally. Example: N5.7 lesson has 5 conversations and 2 readings, all verbs are in ます or ました, zero てください or ています — despite te-form being in the active window.
   - **Soft fail:** The count falls short by 1, and the lesson's theme makes it genuinely difficult to use the form naturally. Flag with a specific suggestion for where the form could be inserted.

3. **Check sustained-use forms.** For each milestone in sustained use, verify at least 1 instance of the milestone's forms appears somewhere in the lesson content (conversations + readings). Complete absence is a **soft fail** unless the lesson's theme genuinely has no natural context.

4. **Verb form diversity check.** Count the distribution of verb forms across all conversation and reading sections. If >80% of tagged verb forms are `polite_masu` or `polite_mashita` (excluding the introduction lesson N5.5 itself), flag as a diversity concern. The lesson should use the full range of available forms — negatives, te-form, desire, volitional — not default to affirmative present/past.

5. **Warmup reinforcement check.** Verify that at least 1 warmup item exercises a recently-unlocked grammar pattern (from the most recent active-window milestone) using prior-lesson vocabulary. Warmups that only use noun-です patterns after N5.5 are a missed reinforcement opportunity.

### Agent 4 — Content Clarity Audit (all content types)

Three checks that prevent confusing or punishing quiz/drill content:

1. **Quiz/drill answer ambiguity** — Test every MCQ, fillSlot, and drill choice against the question. If more than one choice is grammatically valid and contextually appropriate, the question is ambiguous. Fix options: (a) reword the question so only one answer works, (b) replace the question, or (c) add `also_accept` to give credit for valid alternatives while marking one as primary. The most common failure: connector exercises where から and ので are both valid, or where polite and casual forms are both acceptable.

2. **Explanation/hint redundancy** — Read all `notes` in a grammarRule and all `explanation` fields in a drill section as a set. No two notes should convey the same rule in different words. Each note must add unique pedagogical value (a new example, a new edge case, a contrasting form). Restating the same fact wastes the student's limited attention. Most common: noun/な-adjective attachment rules repeated across multiple notes.

3. **Unsupported claims** — Every grammar assertion in `explanation`, `notes`, or `points` fields must be paired with a concrete example sentence. Bare claims like "required in subordinate clauses" or "cannot be used with X" are a fail — the student reads a rule but cannot picture what it means. Fix: add an example immediately after the claim showing the rule in action. Most common: register restrictions, clause-type requirements, and particle usage rules.

6. **Structural pattern presence.** For lessons after N5.5, verify the following structural patterns appear at least once (where the lesson is past their availability point):

   **Conjugation-based patterns:**
   - N5.6+: Is there a てください somewhere? Is there a て-connector (AてB) somewhere?
   - N5.9+: Is there a ています somewhere? Is there a たいです somewhere? Is there a ましょう somewhere?
   - N5.10+: Is there a ない/なかった somewhere? Is there a のです/なんです (or casual んだ) somewhere?
   - N4.11+: Is there a たり pattern somewhere? Is there a てから, まえに, or ために somewhere?
   - N4.21+: Is there a てもいい or てはいけない somewhere?
   - N4.26+: Is there a なければいけない or ないといけない somewhere? Is there at least one of ～なら or ～と conditional somewhere?
   - N4.35+: Is there a くなる/になる or くする/にする somewhere?

   **Non-conjugation patterns (particle-based):**
   - N4.6+: Is there a より comparison or いちばん superlative somewhere?
   - N4.15+: Is there a だけ or しか somewhere?
   - N4.11+: Is there a ので somewhere?

   These are not rigid per-lesson requirements but cumulative expectations. If 3 consecutive lessons all lack てください despite being past N5.5, that is a pattern worth flagging. The same applies to non-conjugation patterns: if 3+ consecutive lessons after N4.5 never use comparison despite the theme supporting it (food, travel, preferences), that is a reinforcement gap.

   **Note on G8/G9 boundary:** てください and て-connector are G8 patterns (reinforce from N5.6+). ています, たいです, and ましょう are G9 patterns (reinforce from N5.9+ only). Do not flag the absence of ています in N5.6–N5.8 content — ている is not formally taught until G9.

**CR Consistency Note — reinforcement issues use this category:**

```
Category              | Detail
──────────────────────┼──────────────────────────────────────────────────────
Grammar reinforcement | Te/ta patterns in active window (N5.6): 0 てください instances across 5 conversations — need ≥1
Grammar reinforcement | Verb form distribution: 89% ます/ました, only 11% other forms — needs more variety
Grammar reinforcement | Sustained use: no polite_negative (ません) instance in entire lesson — add 1 natural negative context
Grammar reinforcement | Warmup uses only noun-です patterns; should exercise te-form with prior vocab
Grammar reinforcement | No ましょう in 3 consecutive lessons (N5.10-N5.12) despite availability since N5.8
Grammar reinforcement | No より/comparison in N4.7-N4.9 despite G15 teaching comparison at N4.5 — themes support preferences
Rewrite directive     | Add a てください request in conv 2 or 3; replace 1 ます sentence in reading with ています progressive
```

---

