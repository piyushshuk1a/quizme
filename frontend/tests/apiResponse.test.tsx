import { expect, test } from 'vitest';

import { readApiResponse } from '@/hooks/swr/apiResponse';

test.each([
  [400, 'HTTP 400'],
  [401, 'sign out and sign in again'],
  [403, 'permission'],
  [404, 'latest deployment'],
  [429, 'Too many requests'],
  [502, 'temporarily unavailable'],
  [503, 'temporarily unavailable'],
  [200, 'unexpected response'],
])(
  'handles HTML with HTTP %i without a JSON parsing error',
  async (status, message) => {
    const response = new Response(
      '<!DOCTYPE html><html>Internal stack trace</html>',
      {
        status,
        headers: { 'Content-Type': 'text/html' },
      },
    );
    await expect(readApiResponse(response)).rejects.toThrow(message);
  },
);

test('preserves JSON API error messages', async () => {
  await expect(
    readApiResponse(
      new Response(
        JSON.stringify({ message: 'AI generation is not configured.' }),
        { status: 503 },
      ),
    ),
  ).rejects.toThrow('AI generation is not configured.');
});

test('accepts JSON and no-content responses', async () => {
  await expect(readApiResponse(new Response('{"ok":true}'))).resolves.toEqual({
    ok: true,
  });
  await expect(
    readApiResponse(new Response(null, { status: 204 })),
  ).resolves.toBeUndefined();
});
