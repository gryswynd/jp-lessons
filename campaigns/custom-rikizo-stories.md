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

## Stories 5–7 Premises (from plan file)

### Story 5: 村の夏まつり (`mura-no-natsumatsuri`)
**Characters:** Rikizo, Yamakawa, Pochi
**Premise:** Village summer festival / Tanabata. Stray dog causes chaos. Village elder has Very Strong Opinions. Pochi immediately befriends the stray dog to everyone's inconvenience. Yamakawa calls everything "basically fine."
**Primary vocab:** 山村(reinf×3), 民族, 野犬, 村長, 七夕, 地区, 建国, 正月, 正道, 強風(reinf), 去来

### Story 6: 屋台の一日 (`yatai-no-ichinichi`)
**Characters:** Rikizo, Ken, shop owner (おじさん)
**Premise:** Help an old man run his food stall. Ken takes orders wrong every time for different reasons. Rikizo burns then undercooks then somehow perfects, with no idea what changed.
**Primary vocab:** 試食(reinf), 注文(reinf), 料理, 開店, 主人, 使用, 計る, 台所

### Story 7: 特急の旅 (`tokkyuu-no-tabi`)
**Characters:** Rikizo, Lee, Miki, Yamakawa
**Premise:** Long limited-express train trip. Yamakawa sleeps through every stop and insists he was "just resting his eyes." Lee takes more notes than the trip had hours. Final sweep of remaining 1-flag terms.
**Primary vocab:** 特急(reinf), 体験(reinf×2), 進歩(reinf×3), 去る(reinf), 小説(reinf), final 1-flag terms sweep

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
