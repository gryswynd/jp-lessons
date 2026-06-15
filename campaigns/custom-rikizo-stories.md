# Custom Rikizo Stories — Campaign File

**Branch:** `claude/custom-rikizo-stories-1xKvL`
**Status:** Story 4 of 7 complete; Stories 5–7 pending

---

## What This Is

A set of 7 custom stories covering a student's 323 flagged vocabulary terms (weighted by flag count). Stories live in `data/custom/stories/[slug]/`. They are served by `CustomStories.js` and gated behind the `custom` module (unlocksAfter: N4.10 in manifest). The full vocabulary distribution plan and story premises are in the plan file at `/root/.claude/plans/you-will-find-a-effervescent-gadget.md`.

---

## Progress

| # | Slug | Title | Status |
|---|---|---|---|
| 1 | `keikaku-no-hi` | 計画の日 | ✅ Done |
| 2 | `unten-no-shinpo` | 運転の進歩 | ✅ Done |
| 3 | `kenkyuu-no-purezenteshon` | 研究のはっぴょう | ✅ Done (chip fixes applied) |
| 4 | `okujou-no-konsaato` | 屋上のコンサート | ✅ Done — pending chip audit fixes below |
| 5 | `mura-no-natsumatsuri` | 村の夏まつり | 🔲 Not started |
| 6 | `yatai-no-ichinichi` | 屋台の一日 | 🔲 Not started |
| 7 | `tokkyuu-no-tabi` | 特急の旅 | 🔲 Not started |

---

## Story 4 Chip Audit — Pending Fixes

A chip auditor found 21 bugs. Status:

### Fixable in terms.json (do these first):
- [ ] Bug #2: `でした` split into で+した — add `"でした": { "id": "g_desu", "form": "polite_past_copula" }`
- [ ] Bug #6: `みたいな` → p_na — add `"みたいな": { "id": "v_mitai", "form": null }`
- [ ] Bug #7: `中でも` → p_demo_but — add `"中でも": { "id": "p_demo", "form": null }`
- [ ] Bug #14: `弱` bare kanji — add `"弱く": { "id": "v_yowai", "form": "adverbial" }`
- [ ] Bug #4: `きれいで` → p_de — add `"きれいで": { "id": "v_kirei", "form": "te_form" }`

### Already fixed by recent commits (audit ran before):
- ✅ Bug #3: `まで` now tagged as p_made
- ✅ Bug #13: `待ちましょう` / `待った` now tagged correctly

### Need glossary entry/text fixes:
- [ ] Bug #1: `なくなる` — no glossary entry; add `v_nakunaru` to N4 glossary ("to disappear / run out / cease to exist")
- [ ] Bug #8: `あ` interjection — currently routes to v_aa (demonstrative ああ); needs separate interjection entry
- [ ] Bug #18: `v_sukoshi` meaning "few" → fix to "a little / slightly / a bit"
- [ ] Bug #19: `v_ensoku` meaning "hike" → fix to "field trip / school excursion / outing"
- [ ] Bug #20: `v_kuuki` meaning "atmosphere" only → add "air" as primary sense
- [ ] Bug #9: `p_hontou` framed as aizuchi → lead with "really / truly (intensifier)"
- [ ] Bug #10: `v_hou` only has comparison construction → add directional "direction / side / way"
- [ ] Bug #11: `v_dare` popup only explains だれ → add note: "だれも + negative = no one"
- [ ] Bug #12: `v_nani` popup only explains 何 → add note: "何も + negative = nothing"

### Not fixable in content (systemic/app-level):
- Bug #5: Unbracketed quotative と (e.g. `だと思った`) tagged as p_to not p_to_quote — needs app-level context awareness
- Bug #21: Conjugated chip popups never show dictionary root form — app popup template issue
- Bugs #15, 16, 17: `転びそうになった`, `見たくて`, `とまれ` — no imperative or そうになる form strings exist; form: null is the best available

---

## Hard-Won Pipeline Rules (learned during Stories 3–4)

These rules were NOT in the original pipeline docs. They've been added to `skills/pipeline-content-builder.md` and `skills/pipeline-reviewers.md` but bear repeating here:

### Grammar gating
- Each story has a **G-lock** (grammar ceiling) separate from its **N-lock** (manifest unlocksAfter).
- N-lock = when the module becomes visible to students.
- G-lock = highest grammar lesson whose patterns may appear in the story.
- Story 4 G-lock = **G21** (unlocks after N4.16). G30 patterns (ようとする, すぎる) are out of scope even though the story unlocks at N4.34.
- `と思う` (G27) is **allowed** by user decision — it's pervasively used in N4 story content and is effectively pre-taught.
- Always tell Agent 2 and Agent 3 the explicit G-lock for each story.

### Vocabulary scope
- A word in the glossary (`lesson_ids: "N4.X"`) is NOT necessarily taught if N4.X doesn't contain it. Always grep the actual lesson file.
- `はっぴょう` was in the N4 glossary (lesson_ids: N4.2) but N4.2.json never taught it — it was N3 vocabulary mistakenly added. It has been removed from the N4 glossary.
- Agent 2 must grep the actual lesson JSON, not just the glossary, to confirm a word is taught.

### Terms.json rules (postmortem from Story 3 + Story 4)
- **No compound key whose prefix is a registered verb form** — app tokenizer fails silently.
- **Te-form + いる ALWAYS splits** — never fuse [verb]て with います/いた/いない as one key.
- **Past potential negative**: use `plain_potential_past_negative` for 〜えなかった surfaces.
- **Compound verb root ID**: [verb]-なくなる must point to root verb, not v_naru.
- **Negative adverbial**: よくなく → `{ "id": "v_ii", "form": null }`.
- **Any story text edit requires a terms.json audit** — even a single sentence. Do not commit story.md edits without running `validate-story-tokenization.sh`.

### Story 4 specific known issues (chip audit)
- `でした` still splits into で+した in the app (terms.json fix pending above).
- `中でも` still shows p_demo_but not p_demo (terms.json fix pending above).
- `なくなる` surfaces route to v_aru (wrong lemma — pending glossary entry).

---

## Stories 5–7 Full Briefs

> **G-lock note:** Stories 5–7 G-locks are TBD — confirm with user before building each one. Story 4 G-lock was G21. Assume similar ceiling unless told otherwise. Always tell Agent 2 and Agent 3 the explicit G-lock.

---

### Story 5: 村の夏まつり (`mura-no-natsumatsuri`)

**Characters:** Rikizo, Yamakawa, Pochi  
**Unlock:** N4.34

**Premise:** Rikizo and Yamakawa visit a remote mountain village for Tanabata. Pochi comes along. A stray dog (野犬) causes chaos. The village elder (村長) has Very Strong Opinions about how things should be done. Rikizo tries to investigate (究明) the origin of the local tradition. Rikizo trips on festival steps — again.

**Humor:** Pochi and the stray dog immediately become best friends to everyone's inconvenience. Yamakawa keeps calling everything "basically fine" as controlled chaos unfolds. The village elder disapproves of everything about city people, especially Rikizo's shoes.

**Primary flagged vocab — first appearances:**
山林(4), 森林(4)(reinf), 野犬(4), 民族(4), 民家(2), 村長(3), 村人(2), 七夕(3), 地区(3), 地名(2), 建国(3), 正月(3), 正道(3), 門下(3), 正門(3)(reinf), 待合(3), 去来(6)(reinf)

**Secondary vocab to weave in:**
旅先(4)(reinf), 旅館(2), 旅(1), 旅人(1), 山村(7)(reinf×2), 低い(9)(reinf), 強風(7)(reinf), 明るい(3), 夕方(3), 今回(3)(reinf), 春夏秋冬(2)

**Reinforced high-flag terms:**
- 山村(×3 appearances — this is one of its main reinforcement stories)
- 転ぶ (reinf — Rikizo trips on festival steps)
- 試み (reinf — Rikizo attempts various festival tasks)
- 究明 (reinf — investigating the origin of the local tradition)

---

### Story 6: 屋台の一日 (`yatai-no-ichinichi`)

**Characters:** Rikizo, Ken, shop owner おじさん  
**Unlock:** N4.34

**Premise:** Rikizo and Ken help an old man run his food stall for a day. They are immediately overwhelmed. Ken takes orders wrong. Rikizo burns the first batch, undercooks the second, and somehow the third is perfect — he has absolutely no idea what he did differently. The old man has not changed a single thing about his stall in 30 years.

**Humor:** Ken takes an order for 一つ (one) and brings back 七つ (seven) — every single time, for a different reason. The old man watches everything silently with mild disapproval.

**Primary flagged vocab — first appearances:**
料理屋(3), 開店(4), 主人(3), 主に(3), 産業(1), 産物(1), 業者(1), 朝市(1), 使う(1), 売る(1), 売り物(1), 品名(1), 小屋(1), 台所(2), 貸す(2), 持ち出す(2), 持ち帰る(1), 工業(2), 木工(2), 人工(2)

**Secondary vocab to weave in (reinforcement):**
試食(8)(reinf×2), 注文(5)(reinf×2), 食事(5)(reinf×2), 作る(4)(reinf), 使用(5)(reinf), 計る(5)(reinf), 代金(3), 仕事(3), 仕える(2), 合う(2), 料理(2), 正す(2), 開く(2), 始まる(2)(reinf), 時計(2), 品物(2)(reinf), 洋食(2)(reinf)

**Reinforced high-flag terms:**
- 転ぶ (reinf — Ken slips on spilled oil)
- 運ぶ (reinf)
- 動く (reinf)
- 試み (reinf)
- 進歩 (reinf)

---

### Story 7: 特急の旅 (`tokkyuu-no-tabi`)

**Characters:** Rikizo, Lee, Miki, Yamakawa  
**Unlock:** N4.34

**Premise:** The group takes a long limited-express train trip for a school-affiliated event. Yamakawa falls asleep and misses every stop announcement. Lee takes meticulous notes about everything. Miki reads a novel the whole time. Rikizo watches the landscape and reflects on the year. Final sweep story — absorbs remaining 1-flag terms and hits final appearance targets for the highest-flag terms.

**Humor:** Yamakawa confidently sleeps through every station announcement. When woken up, he insists he was "just resting his eyes" and knew exactly where they were. He was wrong every time. Lee's "travel notes" have more pages than the trip had hours.

**Primary flagged vocab — first appearances (final sweep):**
東京(2), 京都(1), 北海道(1), 海外(1), 世界(2), 世界中(2), 大学院(2), 地図(1), 秋田県(1), 青森県(1), 帰り道(1), 切手(1), 借りる(1), 姉(1), お兄さん(1), 朝ご飯(1), 町(1), 病院(1), 今朝(1), 場合(1), 用事(1), 度合い(1), 引き出し(1), 引き出す(1), 時代(1), 思い出す(1), 高台(1), 会堂(1), 電池(1), 今度(1)

**Secondary 1-flag sweep:**
学究(1), 地下室(1), 短気(1), 短い(2), 意外(1), 見方(1), 考え方(1), 兄弟(1), 早口(1), 学者(1), 会社員(1), 手首(1), 死者(1), 銀行(1)(reinf), 不運(1), 真ん中(1), ローマ字(1), フリーマーケット(1)

**Secondary vocab (reinforcement):**
小説(4)(reinf), 体験(7)(reinf×2), 進歩(11)(reinf×3), 去る(9)(reinf), 低い(9)(reinf), 特急(5)(reinf×2), 旅館(2)(reinf), 旅人(1)(reinf), 説明(1)(reinf)

**Reinforced high-flag terms (hitting final appearance targets):**
- 転ぶ — 5th/final appearance (Yamakawa stumbles at the station)
- 究明 — 4th appearance (some mystery resolved)
- 中心 — 4th appearance
- 研究 — 3rd appearance
- 自転車 — 3rd appearance

---

## Build Process Reminder

1. Run the 4-agent pipeline (PM → CB → QA → CR) for each story
2. Tell each agent the explicit **G-lock** for the story
3. After any story.md edit: run `validate-story-tokenization.sh` before committing
4. Present full JP + EN text to user for review before committing
5. Apply chip audit fixes after user review if possible
6. Commit story files + manifest entry, then move to next story

Manifest custom stories section: `manifest.json` → `data.custom.stories[]`

---

## File Paths
- Stories: `data/custom/stories/[slug]/story.md` + `terms.json`
- Module: `CustomStories.js`
- Plan file: `/root/.claude/plans/you-will-find-a-effervescent-gadget.md`
- Student flags: `student-flags-filtered.json`
