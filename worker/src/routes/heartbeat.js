/**
 * POST /heartbeat — activity ping from the web app.
 * Body: { studentId, date, streak }
 * Fire-and-forget from the client side — always returns 200.
 */

import { getStudent, putStudent } from '../util/kv-helpers.js';

export async function handleHeartbeat(request, env) {
  var body;
  try { body = await request.json(); } catch (e) {
    return new Response(JSON.stringify({ ok: false }), { status: 400 });
  }

  var { studentId, date, streak } = body;
  if (!studentId) {
    return new Response(JSON.stringify({ ok: false }), { status: 400 });
  }

  var record = await getStudent(env.RIKIZO_STUDENTS, studentId);
  if (!record) {
    return new Response(JSON.stringify({ ok: false, error: 'unknown student' }), { status: 404 });
  }

  record.lastActive = date || new Date().toISOString().slice(0, 10);
  record.streak = typeof streak === 'number' ? streak : record.streak;
  record.consecutiveEmails = 0; // Reset — they're active again

  await putStudent(env.RIKIZO_STUDENTS, studentId, record);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
