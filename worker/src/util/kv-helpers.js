/**
 * KV helpers for student records and the student index.
 */

const INDEX_KEY = 'index:all';

export async function getStudent(kv, studentId) {
  const raw = await kv.get('student:' + studentId);
  return raw ? JSON.parse(raw) : null;
}

export async function putStudent(kv, studentId, data) {
  await kv.put('student:' + studentId, JSON.stringify(data));
}

export async function getIndex(kv) {
  const raw = await kv.get(INDEX_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function addToIndex(kv, studentId) {
  const index = await getIndex(kv);
  if (!index.includes(studentId)) {
    index.push(studentId);
    await kv.put(INDEX_KEY, JSON.stringify(index));
  }
}

export async function hasSentToday(kv, date, studentId) {
  return !!(await kv.get('sent:' + date + ':' + studentId));
}

export async function markSent(kv, date, studentId) {
  await kv.put('sent:' + date + ':' + studentId, '1', { expirationTtl: 172800 }); // 48h
}
