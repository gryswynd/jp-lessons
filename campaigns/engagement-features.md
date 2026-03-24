# Engagement Features Campaign — Daily Reminders, Streaks & Widget

> **Status:** Planning (awaiting client direction on platform approach)
> **Started:** 2026-03-24
> **Last updated:** 2026-03-24

---

## What Clients Are Asking For

Clients switching from Duolingo miss three engagement features:

1. **Daily push reminders** — phone notification even when the app isn't open
2. **Streak tracking** — consecutive day counter with visual progression
3. **Home screen widget** — Rikizo's face + streak count visible on the phone's home screen without opening the app

---

## Platform Reality Check

The learning app is a web app embedded in Webflow. The Godot migration is for the game portion only, not the whole app. So the options for delivering phone-level engagement are:

| Feature | Current Web App | PWA (add service worker) | Native Wrapper (Capacitor/native shell) |
|---|---|---|---|
| **Streak tracking** | ✅ Yes (localStorage) | ✅ Yes | ✅ Yes |
| **Push reminders** | ❌ No | ⚠️ Android: full · iOS: only if user adds to home screen (16.4+) | ✅ Full support (FCM/APNs) |
| **Home screen widget** | ❌ Impossible | ❌ Impossible | ✅ Yes (native extensions) |

### Option 1: PWA Route

Convert the Webflow web app into a Progressive Web App by adding a manifest and service worker.

**Push notifications:**
- **Android:** Works fully. User gets prompted to install, grants notification permission, done.
- **iOS:** Only works if ALL of these are true:
  - iOS 16.4 or later
  - User manually taps Share → "Add to Home Screen"
  - User grants notification permission AFTER installing
  - There is no way to force or programmatically trigger the install — the user must do it themselves

**Widget:** Not possible. PWAs cannot create home screen widgets on any platform.

**Effort:** Small-medium. New JS module + manifest + service worker + one serverless function (Cloudflare Worker) for daily push cron.

### Option 2: Native Wrapper App (Capacitor or thin Swift/Kotlin shell)

Wrap the existing Webflow web app in a lightweight native app shell — NOT a full rebuild. The web app loads inside a WebView, but the native shell provides:
- Full push notification support via Firebase Cloud Messaging (both iOS and Android)
- Home screen widget via native extensions (WidgetKit on iOS, App Widgets on Android)
- App Store / Play Store distribution

**This is NOT the Godot migration.** Godot is for the game module. This is a thin native container around the existing web learning app.

**Options for the shell:**
- **Capacitor (Ionic):** Cross-platform. Wraps web app in native WebView. Has plugins for push notifications, background fetch, and can host widget extensions. One codebase for both platforms.
- **Native shell (Swift + Kotlin):** Two thin native apps, each just a WebView + push registration + widget extension. More control, slightly more effort.

**Effort:** Medium. The web app itself doesn't change. The shell handles push registration, token management, and widget rendering. Widget extensions require platform-specific code (Swift/Kotlin) regardless of approach.

**Pros:** Full Duolingo-parity. Push works on both platforms. Widget works. App Store presence.
**Cons:** Requires App Store / Play Store accounts. Two platform builds to maintain (though the shell is thin). Review process for updates.

### Option 3: Streak Engine Only (No Push, No Widget)

Build the streak tracking in the web app. Users see their streak when they open the app, but get no reminders when away.

**Pros:** Zero infrastructure. Ships immediately.
**Cons:** Doesn't solve the core ask — "remind me when I'm not using the app."

---

## Recommendation

**Option 2 (native wrapper)** is the cleanest path to full Duolingo-parity. The web app doesn't change — it just gets wrapped in a native shell that provides push and widget support. This is a common pattern (many "apps" in the App Store are WebView wrappers).

**Option 1 (PWA)** is a faster interim step if the client base is primarily Android. iOS push limitations make it unreliable for iPhone-heavy audiences.

**Key question for clients:** What phones are your students using?
- Mostly Android → PWA (Option 1) ships faster and covers them
- Mostly iPhone or mixed → Native wrapper (Option 2) is needed for reliable push
- Widget is important → Option 2 is the only path

---

## Technical Design

### Streak Engine (ships in all options)

New module: `app/shared/streak.js`

**localStorage keys:**
- `k-streak-current` — consecutive day count
- `k-streak-best` — all-time best
- `k-streak-last-active` — ISO date of last qualifying activity
- `k-streak-history` — last 30 active dates
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

### Push Notification Backend

Regardless of PWA or native wrapper, the backend is the same:
- **Serverless function** (Cloudflare Worker, Vercel Edge, or AWS Lambda)
- Stores push subscriptions + last-active timestamp (Cloudflare KV or DynamoDB)
- Daily cron: checks each user's last-active date, sends Rikizo reminder if inactive
- Message content from `data/shared/rikizo-messages.json`

**Transport differs:**
- PWA → Web Push API (VAPID keys)
- Native wrapper → Firebase Cloud Messaging (FCM)

### Widget (Native Wrapper Only)

- **iOS:** WidgetKit extension in Xcode project (Swift). Reads streak data from shared App Group UserDefaults. The WebView app writes to shared UserDefaults via a JavaScript-to-native bridge.
- **Android:** AppWidgetProvider (Kotlin). Reads from SharedPreferences. Same bridge pattern.
- **Displays:** Rikizo expression (mood-based), streak count, belt badge, tap to open app
- **Refresh:** Every 15-30 minutes (platform minimum). Sufficient since mood changes daily.

### Rikizo Reminder Messages — Escalating Drama

Messages escalate the longer the user is away, anime-style:

| Days Away | Rikizo Mood | Example Messages |
|---|---|---|
| 1 day | Calm | "Your streak is at 5 days! Come back and keep it going" |
| 2 days | Worried | "Rikizo is pacing back and forth... your streak is in danger!" |
| 3 days | Shocked | "RIKIZO GASPS. Your beautiful streak! There's still time!" |
| 5+ days | Dramatic | "Rikizo stares out the window... 'They haven't come back...'" |
| 7+ days | Over-the-top | "BREAKING: Local tanuki hasn't eaten in days. Claims student abandoned him." |
| 14+ days | Absurd | "Rikizo has started learning English out of spite. Please come back before it's too late." |

Tone: comedically dramatic, never mean. Think anime reaction faces, not guilt trips.

---

## Art Assets Needed

| Asset | Purpose | Priority |
|---|---|---|
| `rikizo_sad.png` | 3+ day absence notifications | High |
| `rikizo_happy.png` | Streak milestone celebrations | High |
| `rikizo_desperate.png` | 7+ day absence (comedic) | Medium |
| `rikizo_determined.png` | Streak stage visuals | Medium |
| `rikizo_icon_192.png` | Notification icon / PWA manifest | High |
| `rikizo_icon_512.png` | PWA manifest / App Store icon | High |

Process via `RikizoArtPipeline.md`.

---

## Integration Points in Current Codebase

The streak engine hooks into existing completion events:

| Module | Location | Event |
|---|---|---|
| Lesson.js | Line ~541 | `unlock.computeUnlocks()` returns `passed=true` |
| Review.js | Line ~1198 | `progress.setReviewScore()` called in `renderEnd()` |
| Practice.js | Lines ~796, 1019, 1293, 1575, 1683, 1831 | `progress.setBestScore()` per game mode |
| Compose.js | Line ~1071 | Score overlay appended on "Score" click |
| Story.js | — | No completion tracking yet (needs new event) |

Each module adds one call: `JPShared.streak.recordActivity()`

---

## Dependencies

- Streak engine: no dependencies, can start immediately
- PWA push: needs serverless function + VAPID key generation
- Native wrapper push: needs App Store/Play Store accounts + FCM project
- Widget: needs native wrapper app
- Art assets: independent, can commission anytime via art pipeline

---

## Open Questions (For Client Discussion)

1. **What phones are your students using?** (iPhone vs Android split determines Option 1 vs 2)
2. **Is the widget a must-have or nice-to-have?** (If must-have, Option 2 is the only path)
3. **Are you open to distributing via App Store / Play Store?** (Required for Option 2)
4. **What time of day should reminders arrive?** (Default: evening, when students typically study)
5. **How many reminders per day?** (Recommend: 1 per day max, only on inactive days)
