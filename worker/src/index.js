/**
 * Rikizo Reminders — Cloudflare Worker
 * Lightweight email reminder system for Japanese Master.
 *
 * Routes:
 *   POST /register     — student opt-in (name, email)
 *   POST /heartbeat    — activity ping from web app
 *   GET  /unsubscribe  — one-click email unsubscribe
 *
 * Cron:
 *   Daily check — send Rikizo reminders to inactive students via Resend
 */

import { handleRegister } from './routes/register.js';
import { handleHeartbeat } from './routes/heartbeat.js';
import { handleUnsubscribe } from './routes/unsubscribe.js';
import { handleScheduled } from './cron/daily-check.js';

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function withCors(response, env) {
  var headers = corsHeaders(env);
  var newHeaders = new Headers(response.headers);
  for (var key in headers) newHeaders.set(key, headers[key]);
  return new Response(response.body, { status: response.status, headers: newHeaders });
}

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    var url = new URL(request.url);
    var path = url.pathname;

    try {
      var response;

      if (path === '/register' && request.method === 'POST') {
        response = await handleRegister(request, env);
      } else if (path === '/heartbeat' && request.method === 'POST') {
        response = await handleHeartbeat(request, env);
      } else if (path === '/unsubscribe' && request.method === 'GET') {
        response = await handleUnsubscribe(request, env);
      } else {
        response = new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
      }

      return withCors(response, env);

    } catch (e) {
      console.error('Unhandled error:', e);
      return withCors(
        new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 }),
        env
      );
    }
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleScheduled(env));
  }
};
