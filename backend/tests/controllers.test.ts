import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { after, before, test } from 'node:test';

import express from 'express';

import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';

// Isolated Firestore adapter: no real credentials or network/database writes.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const records = new Map<string, any>();
let delayCommit: (() => Promise<void>) | undefined;
let sequence = 0;
const collection = (path: string) => {
  const filters: [string, string, unknown][] = [];
  const ref = {
    doc: (id = `new-${++sequence}`) => document(`${path}/${id}`),
    where: (field: string, operator: string, value: unknown) => {
      filters.push([field, operator, value]);
      return ref;
    },
    orderBy: () => ref,
    get: async () => {
      const docs = [...records.keys()]
        .filter(
          (key) =>
            key.startsWith(`${path}/`) &&
            key.split('/').length === path.split('/').length + 1,
        )
        .filter((key) =>
          filters.every(([field, operator, value]) =>
            operator === '!='
              ? records.get(key)[field] !== value
              : records.get(key)[field] === value,
          ),
        )
        .map((key) => snapshot(key));
      return {
        docs,
        forEach: (fn: (doc: ReturnType<typeof snapshot>) => void) =>
          docs.forEach(fn),
      };
    },
  };
  return ref;
};
const snapshot = (path: string) => ({
  id: path.split('/').at(-1),
  exists: records.has(path),
  data: () => records.get(path),
  ref: document(path),
});
const document = (path: string) => ({
  path,
  id: path.split('/').at(-1),
  get: async () => snapshot(path),
  collection: (child: string) => collection(`${path}/${child}`),
});
const batch = () => {
  const writes: (() => void)[] = [];
  return {
    set: (ref: { path: string }, value: object, options?: { merge: boolean }) =>
      writes.push(() =>
        records.set(ref.path, {
          ...(options?.merge ? records.get(ref.path) : {}),
          ...value,
        }),
      ),
    update: (ref: { path: string }, value: object) =>
      writes.push(() =>
        records.set(ref.path, { ...records.get(ref.path), ...value }),
      ),
    delete: (ref: { path: string }) =>
      writes.push(() => records.delete(ref.path)),
    commit: async () => {
      await delayCommit?.();
      writes.forEach((write) => write());
    },
  };
};
let server: Server;
let base: string;
let db: typeof import('../src/firebase').db;
let constants: typeof import('../src/config').FIRESTORE_COLLECTIONS;
let upsert: typeof import('../src/services/quizAttempts').upsertQuizAttempt;
const sample = {
  title: 'Arithmetic test quiz',
  description:
    'A simple quiz that checks basic addition and arithmetic skills.',
  complexity: 'Easy',
  category: 'Mathematics',
  durationMinutes: 5,
  isPublished: true,
  questions: [
    {
      questionText: '2 + 2?',
      questionType: 'single-select',
      points: 1,
      order: 0,
      options: [
        { id: 'a', label: '4' },
        { id: 'b', label: '5' },
      ],
      correctOptions: ['a'],
    },
  ],
};
const request = (
  path: string,
  method = 'GET',
  body?: unknown,
  user = 'owner',
) =>
  fetch(`${base}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(user ? { 'X-Test-User': user } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
function seed(id = 'quiz', published = true, isPublic = true) {
  for (const key of records.keys()) {
    if (key.startsWith(`${constants.quizzes}/${id}/${constants.questions}/`))
      records.delete(key);
  }
  records.set(`${constants.quizzes}/${id}`, {
    ...sample,
    questions: undefined,
    publishedBy: 'owner',
    isPublic,
    isPublished: published,
  });
  records.set(
    `${constants.quizzes}/${id}/${constants.questions}/q`,
    sample.questions[0],
  );
}

before(async () => {
  Object.assign(process.env, {
    NODE_ENV: 'test',
    FIRESTORE_PRIVATE_KEY: generateKeyPairSync('rsa', {
      modulusLength: 2048,
    }).privateKey.export({ type: 'pkcs8', format: 'pem' }),
    FIRESTORE_CLIENT_EMAIL: 'test@example.com',
    FIRESTORE_PROJECT_ID: 'test',
    JWT_SECRET: 'test',
    AUTH0_DOMAIN: 'example.com',
    AUTH0_M2M_CLIENT_ID: 'test',
    AUTH0_M2M_CLIENT_SECRET: 'test',
    AUTH0_AUDIENCE: 'https://example.com/api',
    AUTH0_ISSUER: 'https://example.com/',
  });
  ({ db } = await import('../src/firebase'));
  ({ FIRESTORE_COLLECTIONS: constants } = await import('../src/config'));
  db.collection = collection as unknown as typeof db.collection;
  db.batch = batch as unknown as typeof db.batch;
  db.runTransaction = (async (fn: (tx: object) => Promise<unknown>) => {
    const tx = batch();
    const value = await fn({
      ...tx,
      get: (ref: ReturnType<typeof document>) => ref.get(),
    });
    await tx.commit();
    return value;
  }) as typeof db.runTransaction;
  ({ upsertQuizAttempt: upsert } =
    await import('../src/services/quizAttempts'));
  const controllers =
    await import('../src/controllers/quizController/quizController');
  const { createUser } =
    await import('../src/controllers/userController/userController');
  const { createAiRateLimit } = await import('../src/middlewares/aiRateLimit');
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    const user = req.get('X-Test-User');
    if (user)
      req.auth = {
        payload: { sub: user, 'https://myapp.com/role': 'CANDIDATE' },
      } as NonNullable<typeof req.auth>;
    next();
  });
  app.post('/generate', createAiRateLimit(), (_req, res) =>
    res.json({ ok: true }),
  );
  app.get('/quizzes', controllers.getAllPublicQuizzesController);
  app.post('/quizzes', controllers.createQuizController);
  app.put('/quizzes/:id', controllers.createQuizController);
  app.get('/quizzes/:id', controllers.getQuizByIdController);
  app.post('/quizzes/:id/start', controllers.startQuizController);
  app.post('/quizzes/:id/submit', controllers.submitQuizController);
  app.get('/quizzes/:id/invited', controllers.listInvitedCandidatesController);
  app.put('/quizzes/:id/invite', controllers.inviteCandidatesController);
  app.put('/users/:id', createUser);
  server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
after(() => server?.close());

test('save validation and ownership block bad requests without writes', async () => {
  seed();
  assert.equal((await request('/quizzes', 'POST', {})).status, 400);
  assert.equal(
    (await request('/quizzes', 'POST', { ...sample, id: 'quiz' }, 'stranger'))
      .status,
    403,
  );
  assert.equal(
    (await request('/quizzes/quiz', 'PUT', { ...sample, id: 'different' }))
      .status,
    400,
  );
  assert.equal((await request('/quizzes/missing', 'PUT', sample)).status, 404);
  assert.equal(
    (await request('/users/owner', 'PUT', {}, 'stranger')).status,
    403,
  );
});

test('quiz update responds only after atomic write completes', async () => {
  seed();
  let release!: () => void;
  let entered!: () => void;
  const started = new Promise<void>((resolve) => {
    entered = resolve;
  });
  delayCommit = () => {
    entered();
    return new Promise<void>((resolve) => {
      release = resolve;
    });
  };
  let responded = false;
  const pending = request('/quizzes/quiz', 'PUT', {
    ...sample,
    title: 'Updated arithmetic quiz',
  }).then((response) => {
    responded = true;
    return response;
  });
  await started;
  assert.equal(responded, false);
  release();
  assert.equal((await pending).status, 200);
  delayCommit = undefined;
  assert.equal(
    records.get(`${constants.quizzes}/quiz`).title,
    'Updated arithmetic quiz',
  );
});

test('drafts and private quizzes are hidden from other users', async () => {
  seed('draft', false);
  seed('private', true, false);
  seed();
  assert.equal(
    (await request('/quizzes/draft', 'GET', undefined, 'stranger')).status,
    404,
  );
  assert.equal(
    (await request('/quizzes/private', 'GET', undefined, 'stranger')).status,
    404,
  );
  assert.equal((await request('/quizzes/draft')).status, 200);
  const listing = (await (
    await request('/quizzes', 'GET', undefined, 'stranger')
  ).json()) as { id: string }[];
  assert.ok(
    !listing.some((q: { id: string }) => ['draft', 'private'].includes(q.id)),
  );
  assert.equal(
    (await request('/quizzes/quiz/invited', 'GET', undefined, 'stranger'))
      .status,
    403,
  );
  assert.equal(
    (
      await request(
        '/quizzes/quiz/invite',
        'PUT',
        { candidates: [{ userEmail: 'test@example.com' }] },
        'stranger',
      )
    ).status,
    403,
  );
});

test('answers stay hidden until submission and attempts cannot inflate or overwrite scores', async () => {
  seed();
  assert.equal(
    (await request('/quizzes/quiz/submit', 'POST', { data: [] }, 'candidate'))
      .status,
    409,
  );
  assert.equal(
    (await request('/quizzes/missing/start', 'POST', {}, 'candidate')).status,
    404,
  );
  const first = (await (
    await request('/quizzes/quiz/start', 'POST', {}, 'candidate')
  ).json()) as { startedAt: string };
  const second = (await (
    await request('/quizzes/quiz/start', 'POST', {}, 'candidate')
  ).json()) as { startedAt: string };
  assert.equal(first.startedAt, second.startedAt);
  const quiz = (await (
    await request('/quizzes/quiz', 'GET', undefined, 'candidate')
  ).json()) as { questions: { correctOptions?: string[] }[] };
  assert.equal(quiz.questions[0].correctOptions, undefined);
  const answer = { order: 0, selectedOptions: ['a'] };
  assert.equal(
    (
      await request(
        '/quizzes/quiz/submit',
        'POST',
        { data: [answer, answer] },
        'candidate',
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await request(
        '/quizzes/quiz/submit',
        'POST',
        { data: [answer] },
        'candidate',
      )
    ).status,
    200,
  );
  assert.equal(
    (await request('/quizzes/quiz/submit', 'POST', { data: [] }, 'candidate'))
      .status,
    409,
  );
  const reviewed = (await (
    await request('/quizzes/quiz', 'GET', undefined, 'candidate')
  ).json()) as { questions: { correctOptions?: string[] }[] };
  assert.deepEqual(reviewed.questions[0].correctOptions, ['a']);
  assert.equal(
    records.get(`${constants.quizAttempts}/candidate_quiz`).score,
    1,
  );
});

test('late submissions get zero credit and transaction preserves completed scores', async () => {
  seed();
  await upsert({
    userId: 'late',
    quizId: 'quiz',
    startedAt: new Date(0).toISOString(),
  });
  assert.equal(
    (
      await request(
        '/quizzes/quiz/submit',
        'POST',
        { data: [{ order: 0, selectedOptions: ['a'] }] },
        'late',
      )
    ).status,
    200,
  );
  await upsert({
    userId: 'late',
    quizId: 'quiz',
    status: 'completed',
    score: 999,
  });
  assert.equal(records.get(`${constants.quizAttempts}/late_quiz`).score, 0);
  await upsert({ userId: 'new', quizId: 'quiz' });
  assert.ok(records.get(`${constants.quizAttempts}/new_quiz`).startedAt);
});

test('AI limiter rejects unauthenticated and excessive requests', async () => {
  assert.equal((await request('/generate', 'POST', {}, '')).status, 401);
  for (let i = 0; i < 5; i++)
    assert.equal(
      (await request('/generate', 'POST', {}, 'ai-user')).status,
      200,
    );
  const limited = await request('/generate', 'POST', {}, 'ai-user');
  assert.equal(limited.status, 429);
  assert.ok(limited.headers.get('Retry-After'));
});
