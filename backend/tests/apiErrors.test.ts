import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

import express from 'express';
import {
  auth,
  InsufficientScopeError,
  InvalidTokenError,
} from 'express-oauth2-jwt-bearer';

import { apiErrorHandler, apiNotFound } from '../src/middlewares/apiErrors';

import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';

let server: Server;
let base: string;
let generated = false;
before(async () => {
  const app = express();
  app.use(express.json({ limit: '1kb' }));
  app.post(
    '/api/quizzes/generate',
    auth({
      audience: 'quizme',
      issuerBaseURL: 'https://example.invalid/',
      tokenSigningAlg: 'RS256',
    }),
    (_req, res) => {
      generated = true;
      res.json({ ok: true });
    },
  );
  app.get('/api/invalid-token', () => {
    throw new InvalidTokenError('private diagnostic');
  });
  app.get('/api/forbidden', () => {
    throw new InsufficientScopeError(['write:quiz']);
  });
  app.use('/api', apiNotFound);
  app.use(apiErrorHandler);
  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
after(
  () =>
    new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    ),
);

test('generation without credentials returns a JSON auth error and never runs generation', async () => {
  const response = await fetch(`${base}/api/quizzes/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  assert.ok([400, 401].includes(response.status));
  assert.match(response.headers.get('content-type') || '', /application\/json/);
  assert.match(response.headers.get('www-authenticate') || '', /Bearer/);
  const body = await response.text();
  assert.match(JSON.parse(body).message, /sign out and sign in again/);
  assert.doesNotMatch(body, /DOCTYPE|node_modules|stack/);
  assert.equal(generated, false);
});

test('invalid tokens and insufficient permissions retain their status and auth headers', async () => {
  for (const [path, status] of [
    ['invalid-token', 401],
    ['forbidden', 403],
  ] as const) {
    const response = await fetch(`${base}/api/${path}`);
    assert.equal(response.status, status);
    assert.ok(response.headers.get('www-authenticate'));
    const body = await response.text();
    assert.ok(JSON.parse(body).message);
    assert.doesNotMatch(body, /private diagnostic|DOCTYPE|node_modules/);
  }
});

test('malformed and oversized JSON bodies return JSON errors', async () => {
  for (const [body, status] of [
    ['{', 400],
    [JSON.stringify({ text: 'x'.repeat(2048) }), 413],
  ] as const) {
    const response = await fetch(`${base}/api/quizzes/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    assert.equal(response.status, status);
    assert.ok(((await response.json()) as { message: string }).message);
  }
});

test('unknown API routes return a JSON 404', async () => {
  const response = await fetch(`${base}/api/missing`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), {
    message: 'API endpoint not found.',
  });
});
