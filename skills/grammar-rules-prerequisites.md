# Grammar, Vocabulary & Prerequisite Rules (Part 1: Prerequisites)

> **Loaded by:** All agents for any content creation task.
> **Purpose:** Defines kanji prerequisites, vocabulary scope rules, lesson refresh guidelines, early-use vocabulary exceptions, and grammar usage gating (when forms become available).
> **See also:** `skills/grammar-rules-reinforcement.md` (reinforcement schedules + register requirements).

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

**Absent glossary entry = out-of-scope.** If the old lesson uses a vocab ID (e.g. `v_kouen`, `v_sanpo`) and that ID has no entry in either glossary file, the word has not been introduced in the curriculum. The correct action is to remove the word and restructure the content to use available vocabulary. **Never add a new glossary entry to accommodate old lesson content.** Refreshes are not an opportunity to expand the curriculum.

**Glossary entry with wrong `lesson_ids` = still out-of-scope.** If an ID exists in either glossary but its `lesson_ids` is later than the current lesson, it is out-of-scope and must be removed. The presence of a glossary entry does not make the word available.

**The Unregistered Word Report path does not apply during refreshes.** That escalation is for new content creation where a genuinely natural word might warrant a new glossary entry at an appropriate lesson. During a refresh, all vocabulary must already exist in the glossary at or before the current lesson — no exceptions, no escalations.

**Agent 1 scoping step for refreshes:** After reading the original lesson, run a targeted Grep for every vocab ID used in the original against **both** `data/N5/glossary.N5.json` **and** `data/N4/glossary.N4.json`. N4 lessons routinely use N5 vocab (pronouns, demonstratives, common words like 人々) — checking only the level-matching glossary will produce false "absent" flags. Flag any ID that either (a) doesn't exist in either glossary, or (b) has `lesson_ids` later than the current lesson. List these as "out-of-scope replacements needed" in the Content Brief, along with candidate replacement vocabulary from within scope.

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
| N4.25 | `conditional_ba`, `nakereba`, `conditional_tara` |
| N4.31 | `passive`, `polite_passive`, `polite_passive_past`, `plain_passive_past`, `causative`, `polite_causative`, `polite_causative_past`, `plain_causative_past`, `causative_passive`, `polite_causative_passive` |

Before N5.5, only `polite_adj` and dictionary forms are available. This means N5.1–N5.4 content is limited to noun-です sentences, い-adjective+です sentences, and verbs in dictionary form. Plan sentences accordingly.

**Desire expressions (N5.8+).** `plain_desire_tai` is available from N5.8. For polite desire sentences (〜たいです), use `plain_desire_tai` + `g_desu` (two chips). For plain/casual desire (〜たい without です), use `plain_desire_tai` alone. The deprecated `desire_tai` form must never be used — see desire_tai — deprecated in `skills/term-tagging-forms.md`. The reinforcement schedule expects desire expressions from N5.9 onward (G9 active window); N5.8 content may use `plain_desire_tai` but is not required to meet reinforcement minimums for it.

---
