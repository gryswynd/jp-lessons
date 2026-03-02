# Grammar Lesson Map Audit: PDF vs G1–G20

## 1. Missing Grammar Points

### 1A. あげる / もらう / くれる — Give & Receive System (MAJOR GAP)

The PDF has an entire dedicated section titled "Give/Receive" with a structured chart:

| | Give | Receive |
|---|---|---|
| **Insider/Familiar** | あげる | もらう |
| **Superior/Outsider** | さしあげる | いただく |
| **Give (to me)** | くれる | — |
| **Give (to me, honorific)** | くださる → ください | — |

This is one of the most structurally complex and uniquely Japanese grammar systems. It requires understanding:
- Directionality of giving/receiving (who gives to whom)
- In-group / out-group social dynamics
- Three levels of formality (plain, polite, humble/honorific)
- て-form + あげる/もらう/くれる (doing something as a favor)

**Current status:** Completely absent from G1–G20.

**Recommended placement:** New lesson **G12** (current G12–G20 shift to G13–G21).

**Prerequisites:** て-form (G7), polite/plain distinction (G6/G9). The vocabulary (あげる, もらう, くれる) would need to be either already in the glossary from a kanji lesson, or written in hiragana with inline glosses per the grammar content rules.

**Recommended `unlocksAfter`:** ~N4.3 (same as current G12/Potential). The give/receive system is traditionally taught at this stage in standard curricula (Genki Ch. 14, Minna no Nihongo L. 24).

**Proposed lesson brief:**

```
G12 — Give & Receive (あげる / もらう / くれる)
Icon: 🎁
Level: N4
unlocksAfter: ~N4.3
estimatedMinutes: 25

Sections:
1. grammarIntro — the Japanese "gift economy" of verbs
2. grammarRule — あげる (I/insider give to someone)
3. grammarRule — くれる (someone gives to me/insider)
4. grammarRule — もらう (I/insider receive from someone)
5. grammarComparison — あげる vs くれる (same action, different perspective)
6. grammarTable — full give/receive chart (plain + honorific/humble)
7. grammarRule — て-form + あげる/もらう/くれる (doing favors)
8. annotatedExample — give/receive in daily scenarios
9. conversation — gift-giving, asking for help, thanking
10. fillSlot — choose あげる/くれる/もらう
11. drills — mixed MCQ
```

---

### 1B. ～たり～たりする — Non-exhaustive Action Listing (MISSING)

The PDF lists this under "Verb Usages":
> +り+する → To do... and so on.

This is a common N4 pattern for listing example actions without being exhaustive: 食べたり飲んだりする (do things like eat and drink).

**Current status:** Absent from G1–G20.

**Recommended placement:** Add to **G16** (the revised "Connecting Actions" lesson, currently G15). It fits naturally with てから, まえに, ながら — all patterns for linking actions.

---

### 1C. Plain Command Forms (PARTIALLY MISSING)

The PDF covers:
- **Informal commands:** +ろ (RU-verbs), shift to え-column (U-verbs), しろ (する), こい (くる) — marked "usually considered rude"
- **Polite commands:** +ください, +なさい
- **Negative commands:** +な (informal), +ないでください (polite)

**Current status:** てください and ないでください are covered in G7. But ～なさい, plain commands (食べろ, 話せ), and the informal negative command ～な are never taught.

**Recommended placement:** Add a `grammarRule` section to **G9** (Plain Forms). Plain commands are part of the plain/informal register and fit naturally alongside plain negative and plain past. This keeps G9 focused on "everything about the informal register."

---

### 1D. でしょう / だろう — Conjecture / Probability (UNDERTREATED)

The PDF includes these in the copula table:
> でしょう (polite probable), だろう (plain probable)

And notes: "だろう is very direct. If you're unsure, it is safer to use でしょう."

**Current status:** Mentioned in the G1 copula conjugation table as row entries, but never explained as a grammar point. Students learn the form exists but not how or when to use it.

**Recommended placement:** Add a `grammarRule` to **G8** (which already covers ましょう/ましょうか — the volitional). でしょう/だろう for conjecture is a natural companion to the volitional forms, as both involve uncertainty/probability.

---

### 1E. ～とする — "To attempt / make an effort" (MISSING)

The PDF lists:
> +とする → to attempt & check the result / to make an effort (DOUBLE MEANING)

**Current status:** Absent from G1–G20.

**Recommended placement:** Add to **G21** (revised "Advanced Verb Usages," currently G19). It fits with てみる (try doing) as both involve attempting.

---

## 2. Ordering & Grouping Problems

### 2A. が (but) at G20 — THE BIGGEST ISSUE

**Problem:** が as a clause-linking conjunction ("but") is one of the top 5 most frequently encountered grammar structures in Japanese. Students hit it constantly in:
- Textbook dialogues from the earliest chapters
- Native materials at any level
- Polite requests and softening: すみませんが... (excuse me, but...)

Having it at G20 (after ALL of N4) means students go through 36 kanji lessons and 19 grammar lessons without formally learning one of the most common sentence connectors. They'll see it in conversation sections throughout the app and have no formal instruction on it.

**Root cause:** The GRAMMAR_CONTENT.md grouped が (but) with ALL mid-sentence conjunctions because that's how the PDF groups them — as a table under "Conjunctions (between phrases)." The PDF's layout is a reference sheet, not a curriculum. A reference sheet groups by category; a curriculum orders by frequency and necessity.

**Recommendation:** Move が (but) and けど/けれど to **G9** (Plain Forms). Here's why:
- Plain form + が is one of the first complex sentence patterns students need
- けど is the casual equivalent and pairs with the plain/informal register theme of G9
- Students need these connectors BEFORE they can build natural-sounding compound sentences
- This mirrors standard curricula: Genki teaches が (but) in Chapter 5, alongside plain forms

---

### 2B. から / ので (because) — SPLIT ACROSS TWO LESSONS

**Problem:** から (because) appears in THREE places:
1. G3 — as a particle meaning "from" (starting point)
2. G15 — as a connector meaning "because" (with てから "after")
3. G20 — again as a conjunction

This is confusing. The "because" meaning of から is extremely high-frequency and should be consolidated and taught earlier.

**Recommendation:** 
- G3 teaches から as "from" (starting point) — keep as-is
- Move から/ので (because) to the revised **G9** or a new **G12** "Basic Connectors" lesson
- Remove から/ので from G20 (they'll already be taught)
- G16 (revised Connecting Actions) keeps てから (after doing) — this is a different grammar pattern

---

### 2C. のに (even though) at G20 — TOO LATE

**Problem:** のに is common in everyday complaints and surprised observations: 勉強したのに、わからない (Even though I studied, I don't understand). It's a standard N4 grammar point in all curricula.

**Recommendation:** Move to **G17** (revised Permissions & Prohibitions, or create a "Contrast & Concession" section).

---

### 2D. G14 (Limiting Particles) at N4.14 — COULD BE EARLIER

**Problem:** だけ (only/just) and でも (even/any~) are very common particles that students need well before lesson 14 of N4. しか + negative is a bit more advanced but still standard early-N4.

**Recommendation:** Move to **~N4.7** area. Students need だけ for basic expressions like ちょっとだけ (just a little) and いつでも (anytime) early in their N4 studies.

---

### 2E. Potential Form (G12) Before Give/Receive

**Current order:** G12 Potential → G13 Comparison → G14 Limiting

**Issue:** This is fine pedagogically, but with the addition of Give/Receive, we need to decide priority. In standard curricula:
- Potential form: Genki Ch. 13
- Give/Receive: Genki Ch. 14
- So potential first is correct.

**Recommendation:** Keep potential before give/receive. New order: G12 Potential → G13 Give/Receive.

---

## 3. Additional Grouping Concerns

### 3A. G8 is overloaded

**Current G8 teaches:** ている (progressive), ている (resultant state), たい/たくない (desire), ましょう/ましょうか (suggestions), AND のです/なんです (explanatory).

That's 5 distinct grammar points in one lesson. The GRAMMAR_CONTENT.md itself warns: "Cap at 3-5 grammarRule sections per lesson."

**Recommendation:** Consider moving のです/なんです to a separate mini-lesson, or to the revised G9. The explanatory のです is closely tied to plain forms (which G9 teaches), since のです requires plain form before の/ん.

### 3B. Passive & Causative Together (G18) is Very Dense

Both passive AND causative in one lesson is a lot of conjugation. Each has:
- New conjugation rules for all verb types
- Multiple usage patterns
- Particle changes

**Recommendation:** If lesson count allows, split into G20 Passive and G21 Causative. If keeping 20-21 lessons, at minimum flag this as a 30-minute lesson and ensure the drill count is higher.

### 3C. Conditionals (G17) — Four Forms at Once

Teaching ば, と, たら, and なら simultaneously is standard but brutal. The PDF separates them visually. Consider whether to:
- Teach them all at once (current plan) with heavy comparison work
- Or introduce と and たら first (more common), then ば and なら later

**Recommendation:** Keep together but ensure the grammarComparison sections clearly distinguish the "Big 4" and provide memorable decision heuristics.

---

## 4. Proposed Revised Lesson Map

### N5 Grammar (G1–G11) — Minimal Changes

| ID | Title | After | Changes |
|---|---|---|---|
| G1 | です / だ — The Copula | N5.1 | No change |
| G2 | Core Particles I: は, が, の, か, を | N5.1 | No change |
| G3 | Core Particles II: も, と, や, から, まで, に (time) | N5.2 | No change |
| G4 | Core Particles III: に, で, へ | N5.5 | No change |
| G5 | Verb Types: RU vs U vs Irregulars | N5.5 | No change |
| G6 | Polite Verb Forms (ます System) | N5.5 | No change |
| G7 | て-Form & た-Form Construction | N5.5 | **Add ～なさい command form** alongside てください |
| G8 | Progressive, Desire & Suggestions | N5.8 | **Add でしょう/だろう** (conjecture). Move のです/なんです to G9 |
| G9 | Plain Forms & Basic Connectors | N5.9 | **EXPANDED:** Add が (but), けど, から (because), ので. Add plain command forms (～ろ/～え, ～な). Absorb のです/なんです from G8 |
| G10 | i-Adjective Conjugation | N5.10 | No change |
| G11 | na-Adjective Conjugation | N5.11 | No change |

**Key change:** G9 becomes the "real-world plain speech" lesson — not just conjugation tables, but actually using plain forms in compound sentences with connectors. This is where students learn to speak beyond single clauses.

### N4 Grammar (G12–G22) — Reordered + New Lesson

| ID | Title | After | Status |
|---|---|---|---|
| G12 | Potential Form | ~N4.3 | Was G12. No change |
| **G13** | **Give & Receive (あげる/もらう/くれる)** | **~N4.5** | **NEW LESSON** |
| G14 | Comparison & Degree (より, ほう, ほど, くらい) | ~N4.5 | Was G13. No change |
| G15 | Limiting Particles (だけ, しか, ばかり, でも) | **~N4.7** | Was G14. **Moved earlier** from N4.14 to ~N4.7 |
| G16 | Connecting Actions (てから, まえに, ながら, ために, **～たり**) | ~N4.10 | Was G15. **Add ～たり～たりする** |
| G17 | Contrast & Concession (**のに**, ても) | ~N4.14 | **RESTRUCTURED** from pieces of old G16 and G20. Teaches のに (even though) and ても (even if) together |
| G18 | Permissions & Prohibitions (てもいい, てはいけない) | ~N4.21 | Was G16. Adjusted numbering |
| G19 | Obligations & Conditionals (なければ, ば, たら, なら, と) | ~N4.25 | Was G17. No content change |
| G20 | Passive Form | ~N4.31 | **SPLIT from old G18** — passive only |
| G21 | Causative Form | ~N4.31 | **SPLIT from old G18** — causative only |
| G22 | Advanced Verb Usages (てみる, ておく, てしまう, すぎる, **とする**) | ~N4.34 | Was G19. **Add ～とする** |

**What happened to old G20 (Conjunctions Capstone)?**

It's been dissolved:
- が (but), けど → moved to G9 (Plain Forms & Basic Connectors)
- から/ので (because) → moved to G9
- のに (even though) → moved to new G17 (Contrast & Concession)
- なら, と (conditional) → already in G19
- そして, だから, しかし, でも, だけど, ただし → distributed as notes/examples across G9 and G17
- かどうか, について → moved to G22 (Advanced Verb Usages) as supplementary patterns

**Rationale for eliminating the capstone:** A "conjunctions dump" lesson has no teaching value. Connectors are tools students need incrementally as they build more complex sentences. Front-loading the common ones (が, けど, から, ので) into G9 means students can use them throughout all of N4, which is when they're building real conversational competence.

---

## 5. Changes Required to GRAMMAR_CONTENT.md

### 5A. New Lesson Brief: G13 — Give & Receive

Add a full lesson specification following the template for G13, covering:
- あげる/くれる/もらう base forms
- て-form + あげる/くれる/もらう (doing favors)
- Honorific/humble variants (さしあげる, いただく, くださる)
- The directional perspective system
- grammarComparison: あげる vs くれる
- grammarTable: full give/receive chart

### 5B. Revised G9 Brief

Expand the G9 specification to include:
- Current content: plain negative, plain past, plain past negative, when to use plain
- **New content:** が (but), けど/けれど, から (because), ので, plain commands (～ろ/～え/～な), のです/なんです
- Rename to "Plain Forms & Basic Connectors"
- This will be a larger lesson (~30 minutes) but it's the pivotal lesson where students transition from polite-only speech to real conversational Japanese

### 5C. New Lesson Brief: G17 — Contrast & Concession

Add specification for:
- のに (even though / despite)
- ても/てもいい → split: ても (even if) goes here, てもいい (permission) stays in G18
- Sentence-starting adverbs: しかし, でも, だけど, ただし (the formal/informal contrast words)

### 5D. Split G18 into G20 (Passive) and G21 (Causative)

Each needs its own:
- grammarTable for the conjugation chart
- grammarRule sections for different usage types
- Dedicated conjugationDrill
- Dedicated drills

### 5E. Revised G16 Brief

Add ～たり～たりする to the "Connecting Actions" lesson content.

### 5F. Revised G22 Brief (was G19)

Add ～とする and absorb かどうか + について from the dissolved G20.

### 5G. Update Lesson Map Tables

Both the "Full Lesson Map: N5 Grammar" and "Full Lesson Map: N4 Grammar" sections need to be rewritten to reflect the new ordering and content.

### 5H. Update manifest.json

The grammar array in manifest.json needs to be updated with:
- New G13 entry
- Renumbered G14–G22
- Updated titles for modified lessons
- Removed old G20 (Conjunctions Capstone)

---

## 6. Summary of All Missing Items from PDF

| PDF Item | Status in G1-G20 | Action |
|---|---|---|
| Give/Receive (あげる/もらう/くれる) | ❌ MISSING | New G13 |
| ～たり～たりする | ❌ MISSING | Add to G16 |
| Plain commands (～ろ/～え/～な) | ❌ MISSING | Add to G9 |
| ～なさい | ❌ MISSING | Add to G7 |
| でしょう/だろう (conjecture) | ⚠️ In table only | Add grammarRule to G8 |
| ～とする (attempt) | ❌ MISSING | Add to G22 |
| が (but) | ✅ In G20 | Move to G9 (much earlier) |
| けど/けれど | ✅ In G20 | Move to G9 |
| から (because) | ✅ In G15/G20 | Consolidate in G9 |
| ので (because, softer) | ✅ In G20 | Move to G9 |
| のに (even though) | ✅ In G20 | Move to new G17 |
| そして/だから/しかし/でも/だけど/ただし | ✅ In G20 | Distribute across G9, G17 |
| かどうか (whether or not) | ✅ In G20 | Move to G22 |
| について (about/regarding) | ✅ In G20 | Move to G22 |
| ほうが comparison | ✅ In G13/G14 | OK |
| Passive form | ✅ In G18 | Split to own lesson G20 |
| Causative form | ✅ In G18 | Split to own lesson G21 |
| All particles (は/が/を/の/か/も/と/や/に/で/へ/から/まで/より) | ✅ Covered | OK |
| All verb forms (ます/て/た/ない/potential/passive/causative) | ✅ Covered | OK |
| i-adjective conjugation | ✅ G10 | OK |
| na-adjective conjugation | ✅ G11 | OK |
| Copula (です/だ) | ✅ G1 | OK |
| Conditionals (ば/と/たら/なら) | ✅ G17→G19 | OK |
| てもいい/てはいけない | ✅ G16→G18 | OK |
| てみる/ておく/てしまう/すぎる | ✅ G19→G22 | OK |
| だけ/しか/ばかり/でも | ✅ G14→G15 | Move earlier |
| Hiragana/Katakana charts | N/A | Reference only, not grammar |
| JLPT N5 Kanji chart | N/A | Covered by kanji lessons |

---

## 7. Impact on Lesson Count

| Before | After |
|---|---|
| G1–G20 (20 lessons) | G1–G22 (22 lessons) |

**Added:** G13 (Give/Receive), G21 (Causative, split from Passive)
**Removed:** Old G20 (Conjunctions Capstone — dissolved and distributed)

Net change: +2 lessons. If 20 is a hard cap, the passive/causative split can be kept as one dense lesson (reverting to 21), or the contrast/concession lesson (G17) can be merged into G9 (reverting to 20, but G9 becomes very large).

**Recommendation:** Accept 22 lessons. The give/receive system absolutely requires its own lesson, and the passive/causative split significantly improves learning outcomes for two of the most error-prone grammar areas.
