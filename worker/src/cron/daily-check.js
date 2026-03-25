/**
 * Scheduled (cron) handler — runs daily, sends reminder emails to inactive students.
 */

import { getIndex, getStudent, putStudent, hasSentToday, markSent } from '../util/kv-helpers.js';
import { generateToken } from '../util/auth.js';
import { pickMessage, getSubjectLine } from '../email/message-picker.js';
import { buildReminderEmail } from '../email/templates.js';
import { sendEmail } from '../email/send.js';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  var da = new Date(a + 'T00:00:00Z');
  var db = new Date(b + 'T00:00:00Z');
  return Math.round(Math.abs(da - db) / 86400000);
}

// Stop emailing after this many consecutive emails with no activity
var MAX_CONSECUTIVE_EMAILS = 14;

// Leave headroom under Resend free tier (100/day)
var MAX_EMAILS_PER_RUN = 90;

export async function handleScheduled(env) {
  var today = todayStr();
  var index = await getIndex(env.RIKIZO_STUDENTS);
  var sent = 0;
  var skipped = 0;
  var errors = 0;

  for (var i = 0; i < index.length && sent < MAX_EMAILS_PER_RUN; i++) {
    var studentId = index[i];

    try {
      var record = await getStudent(env.RIKIZO_STUDENTS, studentId);
      if (!record) continue;
      if (!record.subscribed) { skipped++; continue; }
      if (!record.lastActive) { skipped++; continue; } // Never active — no reminder yet

      var daysAway = daysBetween(record.lastActive, today);
      if (daysAway === 0) { skipped++; continue; } // Active today

      // Stop emailing churned students
      if (record.consecutiveEmails >= MAX_CONSECUTIVE_EMAILS) { skipped++; continue; }

      // Don't double-send
      if (await hasSentToday(env.RIKIZO_STUDENTS, today, studentId)) { skipped++; continue; }

      var message = pickMessage(daysAway);
      var subject = getSubjectLine(daysAway, record.streak);
      var token = await generateToken(studentId, env.HMAC_SECRET);

      var workerUrl = new URL('/', 'https://' + env.WORKER_HOST || 'rikizo-reminders.workers.dev');
      var unsubscribeUrl = workerUrl.origin + '/unsubscribe?id=' + encodeURIComponent(studentId) + '&token=' + encodeURIComponent(token);
      var appUrl = env.APP_URL || 'https://yoursite.webflow.io';

      var html = buildReminderEmail({
        name: record.name,
        message: message,
        streakCount: record.streak || 0,
        daysAway: daysAway,
        appUrl: appUrl,
        unsubscribeUrl: unsubscribeUrl
      });

      await sendEmail({
        to: record.email,
        subject: subject,
        html: html,
        senderEmail: env.SENDER_EMAIL,
        apiKey: env.RESEND_API_KEY
      });

      // Update record
      record.lastEmailSent = today;
      record.consecutiveEmails = (record.consecutiveEmails || 0) + 1;
      await putStudent(env.RIKIZO_STUDENTS, studentId, record);
      await markSent(env.RIKIZO_STUDENTS, today, studentId);
      sent++;

    } catch (e) {
      console.error('Error processing student ' + studentId + ':', e.message);
      errors++;
    }
  }

  console.log('Daily reminder run: sent=' + sent + ' skipped=' + skipped + ' errors=' + errors + ' total=' + index.length);
}
