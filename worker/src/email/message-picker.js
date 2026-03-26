/**
 * Pick a Rikizo reminder message based on days away.
 * Escalation tiers match rikizo-messages.json structure.
 */

import messages from './rikizo-messages.json';

const TIERS = [
  { maxDays: 1, key: 'streakAlive' },
  { maxDays: 2, key: 'streakAtRisk' },
  { maxDays: 4, key: 'streakBroken' },
  { maxDays: 6, key: 'streakGone' },
  { maxDays: 13, key: 'streakDesperate' },
  { maxDays: Infinity, key: 'streakAbsurd' }
];

export function pickMessage(daysAway) {
  let tier = TIERS.find(t => daysAway <= t.maxDays);
  if (!tier) tier = TIERS[TIERS.length - 1];

  let pool = messages[tier.key];
  // Fallback to streakBroken if tier is empty or missing
  if (!pool || pool.length === 0) pool = messages.streakBroken;
  if (!pool || pool.length === 0) return { text: "Rikizo misses you! Come back and train.", jp: "もどってきて！" };

  return pool[Math.floor(Math.random() * pool.length)];
}

export function getSubjectLine(daysAway, streakCount) {
  if (daysAway <= 1) return "Your streak is waiting! 🔥";
  if (daysAway <= 2) return "Rikizo is getting worried... 😟";
  if (daysAway <= 4) return "Your streak broke! Start fresh today 💪";
  if (daysAway <= 6) return "Rikizo hasn't seen you in " + daysAway + " days...";
  if (daysAway <= 13) return "BREAKING: Local tanuki missing student 🦝";
  return "Rikizo started a diary about you 📖";
}
