# Engagement Features Campaign — Daily Reminders, Streaks & Widget

> **Status:** Active — Phase 1 (Streak Engine) ready to build, Capacitor wrapper planned
> **Started:** 2026-03-24
> **Last updated:** 2026-03-24
> **Decision:** Capacitor native wrapper (Option 2). Client base is primarily iPhone.

---

## What Clients Are Asking For

Clients switching from Duolingo miss three engagement features:

1. **Daily push reminders** — phone notification even when the app isn't open
2. **Streak tracking** — consecutive day counter with visual progression
3. **Home screen widget** — Rikizo's face + streak count visible on the phone's home screen without opening the app

---

## Strategic Direction: Wrapper Now, Full Rebuild Later

The learning app is a web app embedded in Webflow. The Godot migration is for the game portion only. The long-term goal is to be a real contender against Duolingo and similar apps.

**Why wrapper now, not a full native rebuild:**

1. **Content library is still growing.** N4 isn't complete, N3 is in planning, 17 game days to build. The web stack + 4-agent content pipeline lets us iterate on content fast. A full rebuild would freeze content development for months.
2. **Product-market fit isn't proven yet.** We need users testing the differentiated product (Rikizo, Training Arc, story-driven learning) before locking into a native architecture.
3. **The Godot game isn't ready.** It's in Phase 1 planning. A full native app that houses the game needs the game to exist first.
4. **Clients want push notifications now**, not in 6+ months.
5. **A Capacitor wrapper is not throwaway work:**
   - Streak engine (JS) carries forward to any future stack
   - Push notification backend (serverless + FCM) is the same regardless of frontend
   - Widget extensions (Swift/Kotlin) are native code that stays native in any future app
   - App Store presence (listing, reviews, downloads) carries forward
   - Content pipeline doesn't change at all — JSON files are JSON files

**When to evaluate a full native rebuild:**
- WebView performance becomes a bottleneck (complex animations, offline, large datasets)
- Godot game is shipping and needs seamless transitions with the learning app
- Enough users/revenue to justify 6+ months of pure engineering
- Users request features that web tech can't deliver (AR, heavy offline, native gestures)

---

## Platform Capability Matrix

| Feature | Current Web App | PWA | Capacitor Wrapper (chosen) |
|---|---|---|---|
| **Streak tracking** | ✅ localStorage | ✅ | ✅ |
| **Push reminders** | ❌ | ⚠️ iOS limited | ✅ Full (FCM/APNs) |
| **Home screen widget** | ❌ | ❌ | ✅ Native extensions |
| **App Store presence** | ❌ | ❌ | ✅ |
| **Godot game embed** | ❌ | ❌ | ✅ Native module |
| **Content iteration speed** | ✅ Fast | ✅ Fast | ✅ Fast (web content unchanged) |

---

## Phased Roadmap

### Phase 1: Streak Engine (Web App — Build Now)

No infrastructure changes. Works on the current web app immediately. Carries forward into the Capacitor wrapper unchanged.

**New module:** `app/shared/streak.js`

**localStorage keys:**
- `k-streak-current` — consecutive day count
- `k-streak-best` — all-time best
- `k-streak-last-active` — ISO date of last qualifying activity
- `k-streak-history` — last 30 active dates (for calendar/widget display)
- `k-streak-freezes` — available streak freezes (earn 1 per 7-day streak, max 2)

**Qualifying activity:** Completing any lesson, review, practice session, compose submission, or story.

**"Rikizo's Training Arc" — streak stages:**

| Days | Stage | Belt |
|---|---|---|
| 1-2 | しょしんしゃ (Beginner's Path) | White |
| 3-6 | まいにち (Daily Discipline) | Yellow |
| 7-13 | いっしゅうかん (Week Warrior) | Green |
| 14-29 | にしゅうかん (Fortnight Force) | Blue |
| 30-59 | いっかげつ (Monthly Master) | Purple |
| 60-89 | きせつ (Season Sage) | Brown |
| 90+ | でんせつ (Living Legend) | Black |

**Streak freeze mechanic:** Earn 1 freeze per 7-day streak achieved (max 2 stockpiled). Auto-activates on a missed day, preserving the streak. Gentler than Duolingo — avoids anxiety of losing long streaks to one bad day.

**Menu display:** Streak count + stage name in Japanese + 7-day activity dots in the main menu header.

**Integration points (one `JPShared.streak.recordActivity()` call each):**

| Module | Location | Event |
|---|---|---|
| Lesson.js | Line ~541 | `unlock.computeUnlocks()` returns `passed=true` |
| Review.js | Line ~1198 | `progress.setReviewScore()` called in `renderEnd()` |
| Practice.js | Lines ~796, 1019, 1293, 1575, 1683, 1831 | `progress.setBestScore()` per game mode |
| Compose.js | Line ~1071 | Score overlay appended on "Score" click |
| Story.js | — | No completion tracking yet (needs new event) |

**Deliverables:**
- [ ] `app/shared/streak.js` — streak engine module
- [ ] `data/shared/rikizo-messages.json` — escalating drama message pool
- [ ] `webflow-embed.html` — add streak.js to load order, streak display in menu
- [ ] Feature module edits — add `recordActivity()` calls at completion points

---

### Phase 2: Capacitor Wrapper + Push Notifications

Wrap the existing Webflow web app in a Capacitor native shell for App Store / Play Store distribution.

**What Capacitor provides:**
- Native WebView container loading the existing web app
- `@capacitor/push-notifications` plugin — FCM on Android, APNs on iOS
- JavaScript-to-native bridge for writing streak data to shared storage (for widget)
- `@capacitor/app` plugin — lifecycle events, deep linking
- `@capacitor/preferences` plugin — native shared storage (UserDefaults / SharedPreferences)

**Push notification backend (serverless):**
- Cloudflare Worker (or Vercel Edge / AWS Lambda)
- Stores FCM device tokens + last-active timestamp in Cloudflare KV
- Daily cron job: checks each user's last-active date, sends Rikizo reminder if inactive today
- Message content from `data/shared/rikizo-messages.json`
- Notification includes Rikizo expression icon matching the escalation tier

**App-side push flow:**
1. App registers for push on first launch → gets FCM token
2. Token + user identifier sent to serverless backend
3. On each app visit, `streak.recordActivity()` also pings the backend with "last seen" update
4. If user hasn't opened the app today, cron sends a push with escalating Rikizo drama

**Deliverables:**
- [ ] Capacitor project scaffolding (`capacitor/` directory)
- [ ] iOS Xcode project configuration (provisioning, signing)
- [ ] Android Gradle project configuration (keystore)
- [ ] Push notification plugin integration
- [ ] Serverless function for daily push cron (Cloudflare Worker + KV)
- [ ] JavaScript bridge: streak data → native shared storage
- [ ] App Store / Play Store developer accounts
- [ ] App Store / Play Store initial submission

---

### Phase 3: Home Screen Widget

Native widget extensions that display Rikizo's mood + streak data on the phone's home screen.

**iOS (WidgetKit — Swift):**
- Widget Extension target added to the Capacitor-generated Xcode project
- Reads streak data from shared App Group UserDefaults (written by the JS bridge in Phase 2)
- Small widget: Rikizo face expression + streak count + belt badge
- Medium widget: adds 7-day activity calendar + stage name in Japanese
- Tap anywhere opens the app

**Android (App Widgets — Kotlin):**
- AppWidgetProvider added to the Capacitor-generated Gradle project
- Reads from SharedPreferences (same bridge pattern)
- Same display layout as iOS

**Rikizo mood engine:**
- Mood calculated from days since last activity + current streak length
- Delighted (active today, streak 7+) → Happy (active today) → Neutral (1 day) → Concerned (2 days) → Sad (3-5 days) → Desperate (6+ days)
- Widget refreshes every 15-30 minutes (platform minimum). Sufficient since mood changes daily.

**Deliverables:**
- [ ] iOS WidgetKit extension (Swift)
- [ ] Android AppWidgetProvider (Kotlin)
- [ ] Rikizo mood engine (`app/shared/mood.js`)
- [ ] New Rikizo expression assets (see Art Assets section)

---

### Phase 4: Godot Game Integration

When the Godot game (from `campaigns/godot-migration.md`) reaches a shippable state, embed it into the Capacitor app as a native module.

**How this works:**
- Godot exports to iOS framework / Android AAR
- Capacitor plugin wraps the Godot view and manages transitions
- User taps "Rikizo's Adventures" in the web menu → bridge launches the Godot game view
- Game reads the same JSON content files
- Game writes progress to the same shared storage (streak, scores, unlocks)

**This phase is blocked on:** Godot migration campaign reaching Phase 4-5.

**Deliverables:**
- [ ] Capacitor plugin for Godot view embedding
- [ ] Shared storage bridge (Godot GDScript ↔ native UserDefaults/SharedPreferences)
- [ ] Transition animations between web learning app and Godot game
- [ ] Unified progress system across both engines

---

### Phase 5: Evaluate Full Native Rebuild (Future)

**Trigger conditions (need most/all of these):**
- WebView performance is a user-visible bottleneck
- Content library is mature (N5 complete, N4 complete, N3 in progress)
- Godot game is shipping and transitions feel janky in the hybrid setup
- User base is large enough to justify the investment
- Revenue model is established (subscriptions, IAP)

**Options at that point:**
- **Full Godot for everything** — learning app + game in one engine. Maximum coherence, biggest port effort.
- **React Native / Flutter** — modern cross-platform with native feel. Game still embeds as a module.
- **Stay hybrid** — if the Capacitor wrapper is performing well, maybe a full rebuild is never needed.

**This is a decision to make later, not now.** The Capacitor wrapper is the right architecture for the current stage of the product.

---

## Rikizo Reminder Messages — Escalating Drama

Messages escalate the longer the user is away, anime-style. Comedically dramatic, never mean. Think anime reaction faces, not guilt trips.

| Days Away | Rikizo Mood | Example Messages |
|---|---|---|
| 1 day | Calm | "Your streak is at 5 days! Come back and keep it going" |
| | | "Rikizo left you a note: 'See you tomorrow, right? ...RIGHT?'" |
| | | "Day 5! You're on the path of まいにち now." |
| 2 days | Worried | "Rikizo is pacing back and forth... your streak is in danger!" |
| | | "Rikizo checked the door 47 times today. Just saying." |
| | | "Your streak is wobbling like a jenga tower..." |
| 3 days | Shocked | "RIKIZO GASPS. Your beautiful streak! There's still time!" |
| | | "Rikizo dropped his おにぎり in shock. Three whole days?!" |
| | | "*Record scratch* You haven't studied in 3 days." |
| 5+ days | Dramatic | "Rikizo stares out the window... 'They haven't come back...'" |
| | | "Rikizo has been wearing the same headband for 5 days. In solidarity." |
| | | "The dojo is quiet. Too quiet. Rikizo sweeps the floor alone." |
| 7+ days | Over-the-top | "BREAKING: Local tanuki hasn't eaten in days. Claims student abandoned him." |
| | | "Rikizo started a diary. Day 7: 'I wonder if they found another sensei...'" |
| | | "Rikizo put up a 'MISSING STUDENT' poster. It's very dramatic." |
| 14+ days | Absurd | "Rikizo has started learning English out of spite. Please come back before it's too late." |
| | | "Rikizo auditioned for Duolingo. They said his guilt trips weren't aggressive enough." |
| | | "URGENT: Rikizo has formed a one-tanuki protest outside your phone. He has tiny signs." |

---

## Art Assets Needed

| Asset | Phase | Purpose | Priority |
|---|---|---|---|
| `rikizo_happy.png` | 1 | Streak milestone celebrations, widget delighted state | High |
| `rikizo_sad.png` | 1 | 3+ day absence notifications | High |
| `rikizo_icon_192.png` | 2 | Notification icon | High |
| `rikizo_icon_512.png` | 2 | App Store icon source | High |
| `rikizo_icon_1024.png` | 2 | App Store listing icon | High |
| `rikizo_desperate.png` | 3 | 7+ day absence widget/notifications (comedic) | Medium |
| `rikizo_determined.png` | 1 | Streak stage visuals (Week Warrior+) | Medium |
| `rikizo_celebrating.png` | 1 | Belt promotion moments | Medium |

Process via `RikizoArtPipeline.md`. The pipeline already has "4 calm + 4-5 intense expressions" planned which aligns with this need.

---

## Infrastructure Requirements

| Component | Service | Cost | Phase |
|---|---|---|---|
| Push notification backend | Cloudflare Worker + KV | Free tier (100k requests/day) | 2 |
| Firebase project | Firebase Cloud Messaging | Free (unlimited push) | 2 |
| Apple Developer account | developer.apple.com | $99/year | 2 |
| Google Play Developer account | play.google.com/console | $25 one-time | 2 |

---

## Dependencies Between Campaigns

| This campaign needs | From campaign | Status |
|---|---|---|
| Rikizo expression assets | `RikizoArtPipeline.md` | Can commission anytime |
| Godot game (Phase 4) | `campaigns/godot-migration.md` | Planning, Phase 1 not started |
| Content library growth | `campaigns/n4-completion.md`, `campaigns/n3-production.md` | Active |

| Other campaigns affected | Impact |
|---|---|
| `campaigns/godot-migration.md` | Phase 4 here depends on Godot reaching Phase 4-5. Add Capacitor integration notes to Godot campaign. |
