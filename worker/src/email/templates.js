/**
 * HTML email template for Rikizo daily reminders.
 * Inline CSS for maximum email client compatibility.
 */

export function buildReminderEmail({ name, message, streakCount, daysAway, appUrl, unsubscribeUrl }) {
  var streakText = streakCount > 0
    ? '<p style="font-size:14px;color:#888;margin:0 0 20px;">Your last streak: <strong>' + streakCount + ' days</strong></p>'
    : '';

  var daysText = daysAway === 1
    ? "It's been a day since your last lesson."
    : "It's been " + daysAway + " days since your last lesson.";

  return '<!DOCTYPE html>' +
    '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>' +
    '<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:20px 0;">' +
    '<tr><td align="center">' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="max-width:420px;background:white;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">' +

    // Header
    '<tr><td style="background:linear-gradient(135deg,#4e54c8,#8f94fb);padding:24px;text-align:center;">' +
    '<img src="https://rikizo-reminders.gryswynd.workers.dev/assets/rikizo-head.png" alt="Rikizo" width="60" height="60" style="border-radius:50%;border:2px solid white;">' +
    '<h1 style="color:white;margin:8px 0 0;font-size:20px;font-weight:700;">Rikizo says...</h1>' +
    '</td></tr>' +

    // Body
    '<tr><td style="padding:24px;">' +
    '<p style="font-size:13px;color:#999;margin:0 0 8px;">' + daysText + '</p>' +
    '<div style="background:#f8f8ff;border-radius:12px;padding:16px;margin:0 0 16px;">' +
    '<p style="font-size:16px;color:#333;margin:0 0 6px;line-height:1.5;">' + escapeHtml(message.text) + '</p>' +
    '<p style="font-size:14px;color:#4e54c8;margin:0;font-style:italic;">「' + escapeHtml(message.jp) + '」</p>' +
    '</div>' +
    streakText +

    // CTA
    '<a href="' + escapeHtml(appUrl) + '" style="display:block;text-align:center;background:#4e54c8;color:white;text-decoration:none;padding:14px 24px;border-radius:10px;font-size:16px;font-weight:600;">' +
    '🔥 Open Japanese Master' +
    '</a>' +
    '</td></tr>' +

    // Footer
    '<tr><td style="padding:16px 24px;border-top:1px solid #eee;text-align:center;">' +
    '<p style="font-size:12px;color:#aaa;margin:0;">' +
    'Hi ' + escapeHtml(name) + '! You\'re getting this because you signed up for Rikizo\'s daily reminders.' +
    '</p>' +
    '<p style="font-size:12px;margin:6px 0 0;">' +
    '<a href="' + escapeHtml(unsubscribeUrl) + '" style="color:#aaa;text-decoration:underline;">Unsubscribe</a>' +
    '</p>' +
    '</td></tr>' +

    '</table>' +
    '</td></tr></table>' +
    '</body></html>';
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
