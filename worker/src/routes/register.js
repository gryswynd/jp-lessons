/**
 * POST /register — student self-service opt-in.
 * Body: { name, email, studentId }
 * Returns: { ok, studentId, token }
 *
 * Idempotent by email — if the same email registers again, updates the record.
 */

import { getStudent, putStudent, addToIndex, getIndex } from '../util/kv-helpers.js';
import { generateToken } from '../util/auth.js';

export async function handleRegister(request, env) {
  var body;
  try { body = await request.json(); } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  var { name, email, studentId } = body;
  if (!name || !email) {
    return new Response(JSON.stringify({ error: 'name and email are required' }), { status: 400 });
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Invalid email address' }), { status: 400 });
  }

  name = name.trim().slice(0, 100);
  email = email.trim().toLowerCase();

  // Check if this email already exists (scan index)
  if (!studentId) {
    var index = await getIndex(env.RIKIZO_STUDENTS);
    for (var i = 0; i < index.length; i++) {
      var existing = await getStudent(env.RIKIZO_STUDENTS, index[i]);
      if (existing && existing.email === email) {
        studentId = index[i];
        break;
      }
    }
  }

  // Generate new ID if needed
  if (!studentId) {
    var slug = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12);
    var hex = [...crypto.getRandomValues(new Uint8Array(4))].map(b => b.toString(16).padStart(2, '0')).join('');
    studentId = slug + '-' + hex;
  }

  var existing = await getStudent(env.RIKIZO_STUDENTS, studentId);
  var now = new Date().toISOString();

  var record = {
    name: name,
    email: email,
    studentId: studentId,
    lastActive: existing ? existing.lastActive : null,
    streak: existing ? existing.streak : 0,
    subscribed: true,
    createdAt: existing ? existing.createdAt : now,
    updatedAt: now,
    lastEmailSent: existing ? existing.lastEmailSent : null,
    consecutiveEmails: existing ? existing.consecutiveEmails : 0
  };

  await putStudent(env.RIKIZO_STUDENTS, studentId, record);
  await addToIndex(env.RIKIZO_STUDENTS, studentId);

  var token = await generateToken(studentId, env.HMAC_SECRET);

  return new Response(JSON.stringify({ ok: true, studentId: studentId, token: token }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
