/**
 * app/shared/streak.js
 * Streak tracking engine: consecutive-day activity counting, training arc stages,
 * streak freezes, and return-message selection.
 *
 * localStorage keys:
 *   k-streak-current      — number   consecutive day count
 *   k-streak-best         — number   all-time best streak
 *   k-streak-last-active  — string   YYYY-MM-DD of last qualifying activity
 *   k-streak-history      — string   JSON array of last 30 active dates
 *   k-streak-freezes      — number   available streak freezes (max 2)
 *
 * Load this file after progress.js and before unlock.js in webflow-embed.html.
 */

(function () {
  'use strict';

  window.JPShared = window.JPShared || {};

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /** YYYY-MM-DD in user's local timezone. */
  function todayStr() {
    return new Date().toLocaleDateString('en-CA');
  }

  /** YYYY-MM-DD for yesterday in user's local timezone. */
  function yesterdayStr() {
    var d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toLocaleDateString('en-CA');
  }

  /** Days between two YYYY-MM-DD strings (absolute). */
  function daysBetween(a, b) {
    var da = new Date(a + 'T00:00:00');
    var db = new Date(b + 'T00:00:00');
    return Math.round(Math.abs(da - db) / 86400000);
  }

  // ---------------------------------------------------------------------------
  // Training Arc Stages
  // ---------------------------------------------------------------------------

  var STAGES = [
    { min: 90, key: 'legend',    jp: 'でんせつ',         en: 'Living Legend',   color: '#FFD700' },
    { min: 60, key: 'season',    jp: 'きせつ',           en: 'Season Sage',     color: '#F44336' },
    { min: 30, key: 'month',     jp: 'いっかげつ',       en: 'Monthly Master',  color: '#FF9800' },
    { min: 14, key: 'fortnight', jp: 'にしゅうかん',     en: 'Fortnight',       color: '#9C27B0' },
    { min:  7, key: 'week',      jp: 'いっしゅうかん',   en: 'Week Warrior',    color: '#2196F3' },
    { min:  3, key: 'daily',     jp: 'まいにち',         en: 'Daily',           color: '#4CAF50' },
    { min:  0, key: 'beginner',  jp: 'しょしんしゃ',     en: 'Beginner',        color: '#888888' }
  ];

  function getStage(days) {
    for (var i = 0; i < STAGES.length; i++) {
      if (days >= STAGES[i].min) return STAGES[i];
    }
    return STAGES[STAGES.length - 1];
  }

  // ---------------------------------------------------------------------------
  // Core read/write
  // ---------------------------------------------------------------------------

  function getInt(key, fallback) {
    var v = localStorage.getItem(key);
    return v !== null ? parseInt(v, 10) : fallback;
  }

  function setInt(key, val) {
    localStorage.setItem(key, val);
  }

  function getHistory() {
    try { return JSON.parse(localStorage.getItem('k-streak-history') || '[]'); }
    catch (e) { return []; }
  }

  function setHistory(arr) {
    localStorage.setItem('k-streak-history', JSON.stringify(arr));
  }

  // ---------------------------------------------------------------------------
  // Server heartbeat (for email reminders)
  // ---------------------------------------------------------------------------

  /** Fire-and-forget POST to the reminder Worker. Only runs if opted in. */
  function pingServer(date, streak) {
    try {
      var studentId = localStorage.getItem('k-reminder-student-id');
      if (!studentId) return;
      var workerUrl = (window.JPShared.reminderSettings && window.JPShared.reminderSettings.WORKER_URL)
        || 'https://rikizo-reminders.YOURDOMAIN.workers.dev';
      fetch(workerUrl + '/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: studentId, date: date, streak: streak })
      }).catch(function () {}); // Silently ignore errors
    } catch (e) { /* non-critical */ }
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  window.JPShared.streak = {

    /**
     * Record a qualifying activity for today. Idempotent — safe to call
     * multiple times per day. Updates streak, best, history, and freezes.
     */
    recordActivity: function () {
      var today = todayStr();
      var lastActive = localStorage.getItem('k-streak-last-active');

      // Already recorded today — nothing to do
      if (lastActive === today) return;

      var current = getInt('k-streak-current', 0);
      var best    = getInt('k-streak-best', 0);
      var freezes = getInt('k-streak-freezes', 0);

      if (!lastActive) {
        // First ever activity
        current = 1;
      } else if (lastActive === yesterdayStr()) {
        // Consecutive day — extend streak
        current++;
      } else {
        // Missed at least one day
        var gap = daysBetween(lastActive, today);
        if (gap === 2 && freezes > 0) {
          // Exactly one missed day + freeze available — bridge the gap
          freezes--;
          current++;
        } else {
          // Streak broken — start fresh
          current = 1;
        }
      }

      // Update best
      if (current > best) best = current;

      // Award a freeze every 7-day milestone (max 2 stockpiled)
      if (current > 0 && current % 7 === 0 && freezes < 2) {
        freezes++;
      }

      // Update history (keep last 30 dates)
      var history = getHistory();
      if (history[history.length - 1] !== today) {
        history.push(today);
        if (history.length > 30) history = history.slice(-30);
      }

      // Persist
      setInt('k-streak-current', current);
      setInt('k-streak-best', best);
      localStorage.setItem('k-streak-last-active', today);
      setHistory(history);
      setInt('k-streak-freezes', freezes);

      // Ping reminder server (fire-and-forget, non-critical)
      pingServer(today, current);
    },

    /**
     * Return the full streak state for UI consumption.
     * @returns {{ current: number, best: number, lastActive: string|null,
     *             history: string[], freezes: number, stage: Object,
     *             daysAway: number }}
     */
    getState: function () {
      var current    = getInt('k-streak-current', 0);
      var best       = getInt('k-streak-best', 0);
      var lastActive = localStorage.getItem('k-streak-last-active');
      var freezes    = getInt('k-streak-freezes', 0);
      var history    = getHistory();
      var stage      = getStage(current);
      var daysAway   = lastActive ? daysBetween(lastActive, todayStr()) : -1;

      return {
        current: current,
        best: best,
        lastActive: lastActive,
        history: history,
        freezes: freezes,
        stage: stage,
        daysAway: daysAway
      };
    },

    /**
     * Get the training arc stage for a given streak length.
     * @param {number} days
     * @returns {{ min: number, key: string, jp: string, en: string, color: string }}
     */
    getStage: getStage,

    /**
     * Pick a random return message for the given days-away bracket.
     * Requires rikizo-messages.json to have been loaded into
     * window.JPShared._rikizo_messages.
     * @param {number} daysAway
     * @returns {{ text: string, jp: string }|null}
     */
    getReturnMessage: function (daysAway) {
      var pool = window.JPShared._rikizo_messages;
      if (!pool) return null;

      var bracket;
      if (daysAway <= 0)      bracket = pool.sameDay;
      else if (daysAway === 1) bracket = pool.streakAlive;
      else if (daysAway === 2) bracket = pool.streakAtRisk;
      else                     bracket = pool.streakBroken;

      if (!bracket || bracket.length === 0) return null;
      return bracket[Math.floor(Math.random() * bracket.length)];
    }
  };

})();
