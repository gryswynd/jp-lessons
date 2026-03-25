/**
 * HMAC token generation and validation for unsubscribe/settings links.
 * Uses Web Crypto API (available in Cloudflare Workers).
 */

async function getKey(secret) {
  const enc = new TextEncoder();
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function generateToken(studentId, secret) {
  const key = await getKey(secret);
  const enc = new TextEncoder();
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(studentId));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyToken(studentId, token, secret) {
  const expected = await generateToken(studentId, secret);
  return expected === token;
}
