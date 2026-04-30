# Grammar Vocab Gating Audit

Audited **31** G lessons (**0** have curated `targetVocab`). Gaps in **19** lessons.

## Target-vocab gaps
- Missing from unlocking N's vocabList (declaration): **0**
- Missing reinforcement in next 2 N lessons: **0**
- Missing reinforcement in window stories: **0**
- Misplaced (target term declared in an earlier N lesson): **0**

## Other gating gaps
- Late-introduced (term's `lesson_ids` after the gate): **32**
- Undeclared introductions (term's `lesson_ids` = gate but not in vocabList, and not a target): **28**
- Unknown term ids: **0**
- Character references skipped (no `lesson_ids` in `shared/characters.json`): **42**

## G1 — です / だ — The Copula

_unlocksAfter:_ `N5.1` → gating N lesson: `N5.1`
_targetVocab:_ _(not yet curated)_
_reinforcement window:_ `N5.2`, `N5.3` + stories: `my-family`, `tanjoubi-no-keeki`
_file:_ `data/N5/grammar/G1.json`

**Other terms in G referenced before introduction (2):**
- `v_ano` — introduced in `N5.4` (after gate `N5.1`)
- `v_watashi` — introduced in `N4.3` (after gate `N5.1`)

## G2 — Ko-so-a-do Demonstratives

_unlocksAfter:_ `N5.1` → gating N lesson: `N5.1`
_targetVocab:_ _(not yet curated)_
_reinforcement window:_ `N5.2`, `N5.3` + stories: `my-family`, `tanjoubi-no-keeki`
_file:_ `data/N5/grammar/G2.json`

**Other terms in G referenced before introduction (11):**
- `v_achira` — introduced in `N5.9` (after gate `N5.1`)
- `v_ano` — introduced in `N5.4` (after gate `N5.1`)
- `v_are` — introduced in `N5.3` (after gate `N5.1`)
- `v_doko` — introduced in `N5.5` (after gate `N5.1`)
- `v_dono` — introduced in `N5.4` (after gate `N5.1`)
- `v_kochira` — introduced in `N5.9` (after gate `N5.1`)
- `v_kono` — introduced in `N5.4` (after gate `N5.1`)
- `v_kore` — introduced in `N5.3` (after gate `N5.1`)
- `v_namae` — introduced in `N5.9` (after gate `N5.1`)
- `v_nan` — introduced in `N5.2` (after gate `N5.1`)
- `v_sore` — introduced in `N5.3` (after gate `N5.1`)

## G3 — Core Particles I: は, が, の, か, を

_unlocksAfter:_ `G1` → gating N lesson: `N5.1`
_targetVocab:_ _(not yet curated)_
_reinforcement window:_ `N5.2`, `N5.3` + stories: `my-family`, `tanjoubi-no-keeki`
_file:_ `data/N5/grammar/G3.json`

**Other terms in G referenced before introduction (3):**
- `v_nani` — introduced in `N5.2` (after gate `N5.1`)
- `v_nihongo` — introduced in `N5.12` (after gate `N5.1`)
- `v_oshieru` — introduced in `N4.24` (after gate `N5.1`)

## G5 — Core Particles III — に, で, へ

_unlocksAfter:_ `N5.5` → gating N lesson: `N5.5`
_targetVocab:_ _(not yet curated)_
_reinforcement window:_ `N5.6`, `N5.7` + stories: `kazoku-ga-kimasu`
_file:_ `data/N5/grammar/G5.json`

**Other terms in G referenced before introduction (1):**
- `v_watashi` — introduced in `N4.3` (after gate `N5.5`)

## G6 — Verb Types — RU-Verbs vs U-Verbs vs Irregulars

_unlocksAfter:_ `G5` → gating N lesson: `N5.5`
_targetVocab:_ _(not yet curated)_
_reinforcement window:_ `N5.6`, `N5.7` + stories: `kazoku-ga-kimasu`
_file:_ `data/N5/grammar/G6.json`

**Other terms in G referenced before introduction (1):**
- `v_watashi` — introduced in `N4.3` (after gate `N5.5`)

## G8 — て-form — Connecting, Requesting & Commanding

_unlocksAfter:_ `G7` → gating N lesson: `N5.5`
_targetVocab:_ _(not yet curated)_
_reinforcement window:_ `N5.6`, `N5.7` + stories: `kazoku-ga-kimasu`
_file:_ `data/N5/grammar/G8.json`

**Other terms in G referenced before introduction (3):**
- `v_hanasu` — introduced in `N5.13` (after gate `N5.5`)
- `v_kaku` — introduced in `N5.13` (after gate `N5.5`)
- `v_kiku` — introduced in `N5.18` (after gate `N5.5`)

## G9 — ている・たいです・ましょう — Progressive, Desire & Invitation

_unlocksAfter:_ `N5.Review.4` → gating N lesson: `N5.8`
_targetVocab:_ _(not yet curated)_
_reinforcement window:_ `N5.9`, `N5.10` + stories: `kyuujitsu-no-rikizo`
_file:_ `data/N5/grammar/G9.json`

**Other terms in G referenced before introduction (1):**
- `v_watashi` — introduced in `N4.3` (after gate `N5.8`)

**Other terms with `lesson_ids` = N5.8 but not in its vocabList (1):**
- `g_deshou`

## G10 — Plain Forms & Basic Connectors

_unlocksAfter:_ `N5.9` → gating N lesson: `N5.9`
_targetVocab:_ _(not yet curated)_
_reinforcement window:_ `N5.10`, `N5.11` + stories: `kyuujitsu-no-rikizo`
_file:_ `data/N5/grammar/G10.json`

**Other terms with `lesson_ids` = N5.9 but not in its vocabList (3):**
- `p_ga_but`
- `p_kara_because`
- `p_kedo`

## G14 — Give & Receive — あげる / もらう / くれる

_unlocksAfter:_ `N4.5` → gating N lesson: `N4.5`
_targetVocab:_ _(not yet curated)_
_reinforcement window:_ `N4.6`, `N4.7` + stories: `hirugohan-monogatari`
_file:_ `data/N4/grammar/G14.json`

**Other terms with `lesson_ids` = N4.5 but not in its vocabList (2):**
- `v_ageru`
- `v_morau`

## G15 — Comparison & Degree — より / ほう / ほど / くらい / すぎる

_unlocksAfter:_ `N4.5` → gating N lesson: `N4.5`
_targetVocab:_ _(not yet curated)_
_reinforcement window:_ `N4.6`, `N4.7` + stories: `hirugohan-monogatari`
_file:_ `data/N4/grammar/G15.json`

**Other terms in G referenced before introduction (1):**
- `v_dochira` — introduced in `N4.8` (after gate `N4.5`)

**Other terms with `lesson_ids` = N4.5 but not in its vocabList (4):**
- `p_hodo`
- `p_kurai`
- `p_yori`
- `v_hou`

## G16 — Manner & Similarity — のように / のような / みたいに / みたいな

_unlocksAfter:_ `N4.6` → gating N lesson: `N4.6`
_targetVocab:_ _(not yet curated)_
_reinforcement window:_ `N4.7`, `N4.8` + stories: `kazoku-no-kisetsu`
_file:_ `data/N4/grammar/G16.json`

**Other terms with `lesson_ids` = N4.6 but not in its vocabList (1):**
- `v_mitai`

## G17 — Limiting Particles — だけ / しか / ばかり / でも

_unlocksAfter:_ `N4.7` → gating N lesson: `N4.7`
_targetVocab:_ _(not yet curated)_
_reinforcement window:_ `N4.8`, `N4.9` + stories: `kazoku-no-kisetsu`
_file:_ `data/N4/grammar/G17.json`

**Other terms in G referenced before introduction (4):**
- `p_bakari` — introduced in `N4.14` (after gate `N4.7`)
- `p_dake` — introduced in `N4.14` (after gate `N4.7`)
- `p_demo` — introduced in `N4.14` (after gate `N4.7`)
- `p_shika` — introduced in `N4.14` (after gate `N4.7`)

## G19 — Connecting Actions — てから, まえに, ながら, ために, ～たり

_unlocksAfter:_ `N4.10` → gating N lesson: `N4.10`
_targetVocab:_ _(not yet curated)_
_reinforcement window:_ `N4.11`, `N4.12` + stories: `tabisaki-no-shashin`
_file:_ `data/N4/grammar/G19.json`

**Other terms in G referenced before introduction (1):**
- `v_yoku` — introduced in `N4.17` (after gate `N4.10`)

**Other terms with `lesson_ids` = N4.10 but not in its vocabList (2):**
- `p_tekara`
- `v_tame`

## G20 — Contrast, Concession & Listing Reasons — のに / ても / し

_unlocksAfter:_ `N4.14` → gating N lesson: `N4.14`
_targetVocab:_ _(not yet curated)_
_reinforcement window:_ `N4.15`, `N4.16` + stories: `hashiru-asa`
_file:_ `data/N4/grammar/G20.json`

**Other terms in G referenced before introduction (4):**
- `v_benkyou` — introduced in `N4.18` (after gate `N4.14`)
- `v_muzukashii` — introduced in `N4.17` (after gate `N4.14`)
- `v_shiken` — introduced in `N4.24` (after gate `N4.14`)
- `v_tsukareru` — introduced in `N4.15` (after gate `N4.14`)

**Other terms with `lesson_ids` = N4.14 but not in its vocabList (1):**
- `p_shi`

## G21 — Conversation Mechanics — Hesitation, Aizuchi & Discourse Markers

_unlocksAfter:_ `N4.16` → gating N lesson: `N4.16`
_targetVocab:_ _(not yet curated)_
_reinforcement window:_ `N4.17`, `N4.18` + stories: `jitensha-de-kyouto-e`
_file:_ `data/N4/grammar/G21.json`

**Other terms with `lesson_ids` = N4.16 but not in its vocabList (8):**
- `p_hontou`
- `v_hee`
- `v_jitsuwa`
- `v_maa`
- `v_nanka`
- `v_naruhodo`
- `v_souso`
- `v_tsumari`

## G22 — そうだ: Appearance & Hearsay

_unlocksAfter:_ `N4.18` → gating N lesson: `N4.18`
_targetVocab:_ _(not yet curated)_
_reinforcement window:_ `N4.19`, `N4.20` + stories: `library-book`
_file:_ `data/N4/grammar/G22.json`

**Other terms with `lesson_ids` = N4.18 but not in its vocabList (1):**
- `p_sou_da_hearsay`

## G25 — Obligations & Conditionals — なければ / ば / たら / なら / と

_unlocksAfter:_ `N4.25` → gating N lesson: `N4.25`
_targetVocab:_ _(not yet curated)_
_reinforcement window:_ `N4.26`, `N4.27` + stories: `kenkyuu-to-sakubun`
_file:_ `data/N4/grammar/G25.json`

**Other terms with `lesson_ids` = N4.25 but not in its vocabList (2):**
- `p_nara`
- `p_to_conditional`

## G30 — Advanced Verb Usages — てみる / ておく / てしまう / すぎる / とする

_unlocksAfter:_ `N4.34` → gating N lesson: `N4.34`
_targetVocab:_ _(not yet curated)_
_reinforcement window:_ `N4.35`, `N4.36` + stories: `factory-owner`
_file:_ `data/N4/grammar/G30.json`

**Other terms with `lesson_ids` = N4.34 but not in its vocabList (2):**
- `p_kadouka`
- `p_ni_tsuite`

## G31 — Advanced Adjective Patterns — Become, Make, Even If, Must Be

_unlocksAfter:_ `N4.34` → gating N lesson: `N4.34`
_targetVocab:_ _(not yet curated)_
_reinforcement window:_ `N4.35`, `N4.36` + stories: `factory-owner`
_file:_ `data/N4/grammar/G31.json`

**Other terms with `lesson_ids` = N4.34 but not in its vocabList (1):**
- `p_nakereba`
