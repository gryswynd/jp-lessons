/**
 * GET /unsubscribe?id=xxx&token=yyy — one-click email unsubscribe.
 * Returns a simple HTML confirmation page.
 */

import { getStudent, putStudent } from '../util/kv-helpers.js';
import { verifyToken } from '../util/auth.js';

export async function handleUnsubscribe(request, env) {
  var url = new URL(request.url);
  var studentId = url.searchParams.get('id');
  var token = url.searchParams.get('token');

  if (!studentId || !token) {
    return htmlResponse('Missing parameters. Check your unsubscribe link.', 400);
  }

  var valid = await verifyToken(studentId, token, env.HMAC_SECRET);
  if (!valid) {
    return htmlResponse('Invalid link. It may have expired or been tampered with.', 403);
  }

  var record = await getStudent(env.RIKIZO_STUDENTS, studentId);
  if (!record) {
    return htmlResponse('Student not found.', 404);
  }

  record.subscribed = false;
  await putStudent(env.RIKIZO_STUDENTS, studentId, record);

  return htmlResponse(
    '<h2>Unsubscribed</h2>' +
    '<p>You won\'t receive any more daily reminders from Rikizo.</p>' +
    '<p style="color:#888;font-size:14px;">You can re-subscribe anytime from the app settings.</p>' +
    '<p style="font-size:32px;">🦝💤</p>'
  );
}

function htmlResponse(body, status) {
  return new Response(
    '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Rikizo Reminders</title></head>' +
    '<body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:420px;margin:40px auto;padding:20px;text-align:center;">' +
    body + '</body></html>',
    { status: status || 200, headers: { 'Content-Type': 'text/html;charset=utf-8' } }
  );
}
