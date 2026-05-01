# Grammar Vocab Gating Audit

Audited **31** G lessons (**26** have curated `targetVocab`). Gaps in **21** lessons.

## Target-vocab gaps
- Missing from unlocking N's vocabList (declaration): **0**
- Missing reinforcement in next 2 N lessons: **2**
- Missing reinforcement in window stories: **90**
- Misplaced (target term declared in an earlier N lesson): **0**

## Other gating gaps
- Late-introduced (term's `lesson_ids` after the gate): **0**
- Undeclared introductions (term's `lesson_ids` = gate but not in vocabList, and not a target): **0**
- Unknown term ids: **0**
- Character references skipped (no `lesson_ids` in `shared/characters.json`): **42**

## G1 — です / だ — The Copula

_unlocksAfter:_ `N5.1` → gating N lesson: `N5.1`
_targetVocab:_ `g_da`, `g_desu`
_reinforcement window:_ `N5.2`, `N5.3` + stories: `my-family`, `tanjoubi-no-keeki`
_file:_ `data/N5/grammar/G1.json`

**Missing reinforcement in next 2 N lessons (1):**
- `g_da` — not referenced in `N5.2`, `N5.3`

**Missing reinforcement in window stories (1):**
- `g_da` — not referenced in story `my-family`, `tanjoubi-no-keeki`

## G2 — Ko-so-a-do Demonstratives

_unlocksAfter:_ `N5.1` → gating N lesson: `N5.1`
_targetVocab:_ `v_kore`, `v_sore`, `v_are`, `v_dore`, `v_kono`, `v_sono`, `v_ano`, `v_dono`, `v_koko`, `v_soko`, `v_asoko`, `v_doko`, `v_kochira`, `v_sochira`, `v_achira`, `v_dochira`, `v_kou`, `v_sou`, `v_aa`, `v_dou`, `v_konna`, `v_sonna`, `v_anna`, `v_donna`
_reinforcement window:_ `N5.2`, `N5.3` + stories: `my-family`, `tanjoubi-no-keeki`
_file:_ `data/N5/grammar/G2.json`

**Missing reinforcement in window stories (24):**
- `v_kore` — not referenced in story `my-family`, `tanjoubi-no-keeki`
- `v_sore` — not referenced in story `my-family`, `tanjoubi-no-keeki`
- `v_are` — not referenced in story `my-family`, `tanjoubi-no-keeki`
- `v_dore` — not referenced in story `my-family`, `tanjoubi-no-keeki`
- `v_kono` — not referenced in story `my-family`
- `v_sono` — not referenced in story `my-family`, `tanjoubi-no-keeki`
- `v_ano` — not referenced in story `my-family`, `tanjoubi-no-keeki`
- `v_dono` — not referenced in story `my-family`, `tanjoubi-no-keeki`
- `v_koko` — not referenced in story `my-family`, `tanjoubi-no-keeki`
- `v_soko` — not referenced in story `my-family`, `tanjoubi-no-keeki`
- `v_asoko` — not referenced in story `my-family`, `tanjoubi-no-keeki`
- `v_doko` — not referenced in story `my-family`, `tanjoubi-no-keeki`
- `v_kochira` — not referenced in story `my-family`, `tanjoubi-no-keeki`
- `v_sochira` — not referenced in story `my-family`, `tanjoubi-no-keeki`
- `v_achira` — not referenced in story `my-family`, `tanjoubi-no-keeki`
- `v_dochira` — not referenced in story `my-family`, `tanjoubi-no-keeki`
- `v_kou` — not referenced in story `my-family`, `tanjoubi-no-keeki`
- `v_sou` — not referenced in story `my-family`, `tanjoubi-no-keeki`
- `v_aa` — not referenced in story `my-family`, `tanjoubi-no-keeki`
- `v_dou` — not referenced in story `my-family`, `tanjoubi-no-keeki`
- `v_konna` — not referenced in story `my-family`, `tanjoubi-no-keeki`
- `v_sonna` — not referenced in story `my-family`, `tanjoubi-no-keeki`
- `v_anna` — not referenced in story `my-family`, `tanjoubi-no-keeki`
- `v_donna` — not referenced in story `my-family`, `tanjoubi-no-keeki`

## G3 — Core Particles I: は, が, の, か, を

_unlocksAfter:_ `G1` → gating N lesson: `N5.1`
_targetVocab:_ `p_wa`, `p_ga`, `p_no`, `p_ka`, `p_wo`
_reinforcement window:_ `N5.2`, `N5.3` + stories: `my-family`, `tanjoubi-no-keeki`
_file:_ `data/N5/grammar/G3.json`

**Missing reinforcement in window stories (3):**
- `p_ga` — not referenced in story `my-family`
- `p_ka` — not referenced in story `my-family`, `tanjoubi-no-keeki`
- `p_wo` — not referenced in story `tanjoubi-no-keeki`

## G4 — Core Particles II: も, と, や, から, まで, に (time)

_unlocksAfter:_ `N5.2` → gating N lesson: `N5.2`
_targetVocab:_ `p_mo`, `p_to`, `p_ya`, `p_kara`, `p_made`, `p_made_ni`, `p_ni`
_reinforcement window:_ `N5.3`, `N5.4` + stories: `tanjoubi-no-keeki`
_file:_ `data/N5/grammar/G4.json`

**Missing reinforcement in window stories (7):**
- `p_mo` — not referenced in story `tanjoubi-no-keeki`
- `p_to` — not referenced in story `tanjoubi-no-keeki`
- `p_ya` — not referenced in story `tanjoubi-no-keeki`
- `p_kara` — not referenced in story `tanjoubi-no-keeki`
- `p_made` — not referenced in story `tanjoubi-no-keeki`
- `p_made_ni` — not referenced in story `tanjoubi-no-keeki`
- `p_ni` — not referenced in story `tanjoubi-no-keeki`

## G5 — Core Particles III — に, で, へ

_unlocksAfter:_ `N5.5` → gating N lesson: `N5.5`
_targetVocab:_ `p_ni`, `p_de`, `p_e`, `v_aru`, `v_iru`
_reinforcement window:_ `N5.6`, `N5.7` + stories: `kazoku-ga-kimasu`
_file:_ `data/N5/grammar/G5.json`

**Missing reinforcement in window stories (1):**
- `v_iru` — not referenced in story `kazoku-ga-kimasu`

## G9 — ている・たいです・ましょう — Progressive, Desire & Invitation

_unlocksAfter:_ `N5.Review.4` → gating N lesson: `N5.8`
_targetVocab:_ `v_iru`, `v_hoshii`, `g_deshou`, `g_darou`
_reinforcement window:_ `N5.9`, `N5.10` + stories: `kyuujitsu-no-rikizo`
_file:_ `data/N5/grammar/G9.json`

**Missing reinforcement in window stories (3):**
- `v_hoshii` — not referenced in story `kyuujitsu-no-rikizo`
- `g_deshou` — not referenced in story `kyuujitsu-no-rikizo`
- `g_darou` — not referenced in story `kyuujitsu-no-rikizo`

## G10 — Plain Forms & Basic Connectors

_unlocksAfter:_ `N5.9` → gating N lesson: `N5.9`
_targetVocab:_ `p_ga_but`, `p_kedo`, `p_kara_because`, `p_node`, `p_ndesu`, `p_nda`
_reinforcement window:_ `N5.10`, `N5.11` + stories: `kyuujitsu-no-rikizo`
_file:_ `data/N5/grammar/G10.json`

**Missing reinforcement in window stories (5):**
- `p_ga_but` — not referenced in story `kyuujitsu-no-rikizo`
- `p_kedo` — not referenced in story `kyuujitsu-no-rikizo`
- `p_node` — not referenced in story `kyuujitsu-no-rikizo`
- `p_ndesu` — not referenced in story `kyuujitsu-no-rikizo`
- `p_nda` — not referenced in story `kyuujitsu-no-rikizo`

## G13 — Potential Form — Can / Able to

_unlocksAfter:_ `N4.3` → gating N lesson: `N4.3`
_targetVocab:_ `v_dekiru`
_reinforcement window:_ `N4.4`, `N4.5` + stories: `watashi-no-iro`
_file:_ `data/N4/grammar/G13.json`

**Missing reinforcement in window stories (1):**
- `v_dekiru` — not referenced in story `watashi-no-iro`

## G14 — Give & Receive — あげる / もらう / くれる

_unlocksAfter:_ `N4.5` → gating N lesson: `N4.5`
_targetVocab:_ `v_ageru`, `v_morau`, `v_kureru`, `v_hoshii`
_reinforcement window:_ `N4.6`, `N4.7` + stories: `hirugohan-monogatari`
_file:_ `data/N4/grammar/G14.json`

**Missing reinforcement in window stories (3):**
- `v_morau` — not referenced in story `hirugohan-monogatari`
- `v_kureru` — not referenced in story `hirugohan-monogatari`
- `v_hoshii` — not referenced in story `hirugohan-monogatari`

## G15 — Comparison & Degree — より / ほう / ほど / くらい / すぎる

_unlocksAfter:_ `N4.5` → gating N lesson: `N4.5`
_targetVocab:_ `p_yori`, `p_hodo`, `p_kurai`, `v_hou`, `v_ichiban`, `v_dochira`
_reinforcement window:_ `N4.6`, `N4.7` + stories: `hirugohan-monogatari`
_file:_ `data/N4/grammar/G15.json`

**Missing reinforcement in window stories (3):**
- `p_hodo` — not referenced in story `hirugohan-monogatari`
- `p_kurai` — not referenced in story `hirugohan-monogatari`
- `v_dochira` — not referenced in story `hirugohan-monogatari`

## G16 — Manner & Similarity — のように / のような / みたいに / みたいな

_unlocksAfter:_ `N4.6` → gating N lesson: `N4.6`
_targetVocab:_ `v_you_manner`, `v_mitai`, `p_no`, `p_ni`
_reinforcement window:_ `N4.7`, `N4.8` + stories: `kazoku-no-kisetsu`
_file:_ `data/N4/grammar/G16.json`

**Missing reinforcement in window stories (2):**
- `v_you_manner` — not referenced in story `kazoku-no-kisetsu`
- `v_mitai` — not referenced in story `kazoku-no-kisetsu`

## G17 — Limiting Particles — だけ / しか / ばかり / でも

_unlocksAfter:_ `N4.7` → gating N lesson: `N4.7`
_targetVocab:_ `p_dake`, `p_shika`, `p_bakari`, `p_demo`
_reinforcement window:_ `N4.8`, `N4.9` + stories: `kazoku-no-kisetsu`
_file:_ `data/N4/grammar/G17.json`

**Missing reinforcement in window stories (4):**
- `p_dake` — not referenced in story `kazoku-no-kisetsu`
- `p_shika` — not referenced in story `kazoku-no-kisetsu`
- `p_bakari` — not referenced in story `kazoku-no-kisetsu`
- `p_demo` — not referenced in story `kazoku-no-kisetsu`

## G18 — Transitive & Intransitive Verb Pairs — 自動詞・他動詞

_unlocksAfter:_ `N4.10` → gating N lesson: `N4.10`
_targetVocab:_ `v_dasu`, `v_deru`, `v_hairu`, `v_ireru`, `v_hajimaru`, `v_hajimeru`
_reinforcement window:_ `N4.11`, `N4.12` + stories: `tabisaki-no-shashin`
_file:_ `data/N4/grammar/G18.json`

**Missing reinforcement in window stories (6):**
- `v_dasu` — not referenced in story `tabisaki-no-shashin`
- `v_deru` — not referenced in story `tabisaki-no-shashin`
- `v_hairu` — not referenced in story `tabisaki-no-shashin`
- `v_ireru` — not referenced in story `tabisaki-no-shashin`
- `v_hajimaru` — not referenced in story `tabisaki-no-shashin`
- `v_hajimeru` — not referenced in story `tabisaki-no-shashin`

## G19 — Connecting Actions — てから, まえに, ながら, ために, ～たり

_unlocksAfter:_ `N4.10` → gating N lesson: `N4.10`
_targetVocab:_ `p_tekara`, `p_nagara`, `v_mae`, `v_tame`
_reinforcement window:_ `N4.11`, `N4.12` + stories: `tabisaki-no-shashin`
_file:_ `data/N4/grammar/G19.json`

**Missing reinforcement in next 2 N lessons (1):**
- `p_nagara` — not referenced in `N4.11`, `N4.12`

**Missing reinforcement in window stories (3):**
- `p_nagara` — not referenced in story `tabisaki-no-shashin`
- `v_mae` — not referenced in story `tabisaki-no-shashin`
- `v_tame` — not referenced in story `tabisaki-no-shashin`

## G20 — Contrast, Concession & Listing Reasons — のに / ても / し

_unlocksAfter:_ `N4.14` → gating N lesson: `N4.14`
_targetVocab:_ `p_noni`, `p_shi`
_reinforcement window:_ `N4.15`, `N4.16` + stories: `hashiru-asa`
_file:_ `data/N4/grammar/G20.json`

**Missing reinforcement in window stories (2):**
- `p_noni` — not referenced in story `hashiru-asa`
- `p_shi` — not referenced in story `hashiru-asa`

## G21 — Conversation Mechanics — Hesitation, Aizuchi & Discourse Markers

_unlocksAfter:_ `N4.16` → gating N lesson: `N4.16`
_targetVocab:_ `v_eto`, `v_anou`, `v_uun`, `v_un`, `v_saa`, `v_naruhodo`, `v_hee`, `v_souso`, `v_jitsuwa`, `v_tsumari`, `v_nanka`, `v_maa`
_reinforcement window:_ `N4.17`, `N4.18` + stories: `jitensha-de-kyouto-e`
_file:_ `data/N4/grammar/G21.json`

**Missing reinforcement in window stories (11):**
- `v_eto` — not referenced in story `jitensha-de-kyouto-e`
- `v_anou` — not referenced in story `jitensha-de-kyouto-e`
- `v_uun` — not referenced in story `jitensha-de-kyouto-e`
- `v_un` — not referenced in story `jitensha-de-kyouto-e`
- `v_saa` — not referenced in story `jitensha-de-kyouto-e`
- `v_naruhodo` — not referenced in story `jitensha-de-kyouto-e`
- `v_hee` — not referenced in story `jitensha-de-kyouto-e`
- `v_souso` — not referenced in story `jitensha-de-kyouto-e`
- `v_tsumari` — not referenced in story `jitensha-de-kyouto-e`
- `v_nanka` — not referenced in story `jitensha-de-kyouto-e`
- `v_maa` — not referenced in story `jitensha-de-kyouto-e`

## G22 — そうだ: Appearance & Hearsay

_unlocksAfter:_ `N4.18` → gating N lesson: `N4.18`
_targetVocab:_ `p_sou_da`, `p_sou_da_hearsay`
_reinforcement window:_ `N4.19`, `N4.20` + stories: `library-book`
_file:_ `data/N4/grammar/G22.json`

**Missing reinforcement in window stories (1):**
- `p_sou_da` — not referenced in story `library-book`

## G23 — Permissions & Prohibitions — てもいい / てはいけない / なくてもいい

_unlocksAfter:_ `N4.21` → gating N lesson: `N4.21`
_targetVocab:_ `v_ii`, `v_ikeru`, `v_dame`
_reinforcement window:_ `N4.22`, `N4.23` + stories: `furima-no-hi`
_file:_ `data/N4/grammar/G23.json`

**Missing reinforcement in window stories (1):**
- `v_dame` — not referenced in story `furima-no-hi`

## G25 — Obligations & Conditionals — なければ / ば / たら / なら / と

_unlocksAfter:_ `N4.25` → gating N lesson: `N4.25`
_targetVocab:_ `p_to_conditional`, `p_nara`, `p_nakereba`, `p_hodo`, `v_ikeru`
_reinforcement window:_ `N4.26`, `N4.27` + stories: `kenkyuu-to-sakubun`
_file:_ `data/N4/grammar/G25.json`

**Missing reinforcement in window stories (4):**
- `p_to_conditional` — not referenced in story `kenkyuu-to-sakubun`
- `p_nara` — not referenced in story `kenkyuu-to-sakubun`
- `p_nakereba` — not referenced in story `kenkyuu-to-sakubun`
- `p_hodo` — not referenced in story `kenkyuu-to-sakubun`

## G30 — Advanced Verb Usages — てみる / ておく / てしまう / すぎる / とする

_unlocksAfter:_ `N4.34` → gating N lesson: `N4.34`
_targetVocab:_ `v_miru`, `v_oku`, `v_shimau`, `v_suru`, `p_kadouka`, `p_ni_tsuite`
_reinforcement window:_ `N4.35`, `N4.36` + stories: `factory-owner`
_file:_ `data/N4/grammar/G30.json`

**Missing reinforcement in window stories (4):**
- `v_oku` — not referenced in story `factory-owner`
- `v_shimau` — not referenced in story `factory-owner`
- `p_kadouka` — not referenced in story `factory-owner`
- `p_ni_tsuite` — not referenced in story `factory-owner`

## G31 — Advanced Adjective Patterns — Become, Make, Even If, Must Be

_unlocksAfter:_ `N4.34` → gating N lesson: `N4.34`
_targetVocab:_ `v_naru`, `v_suru`
_reinforcement window:_ `N4.35`, `N4.36` + stories: `factory-owner`
_file:_ `data/N4/grammar/G31.json`

**Missing reinforcement in window stories (1):**
- `v_naru` — not referenced in story `factory-owner`
