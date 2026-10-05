import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  generateQuiz,
  GenerationError,
  generationRequestSchema,
} from '../src/services/aiQuizService';
import { quizSchema, scoreQuiz } from '../src/utils/quizValidation';

const request = {
  prompt: 'Basic arithmetic',
  questionCount: 1,
  complexity: 'Easy',
};
const generated = {
  title: 'Basic arithmetic quiz',
  description:
    'Test your understanding of simple addition and arithmetic facts.',
  category: 'Mathematics',
  durationMinutes: 5,
  questions: [
    {
      questionText: 'What is 2 + 2?',
      questionType: 'single-select',
      options: [
        { id: 'a', label: '4' },
        { id: 'b', label: '5' },
      ],
      correctOptions: ['a'],
    },
  ],
};
const settings = { apiKey: 'test-only-key', model: 'test-model' };
const reply =
  (body: unknown, status = 200): typeof fetch =>
  async () =>
    new Response(JSON.stringify(body), { status });
const completed = (quiz: unknown) => ({
  status: 'completed',
  output: [
    {
      type: 'message',
      content: [{ type: 'output_text', text: JSON.stringify(quiz) }],
    },
  ],
});
const hasStatus = (status: number) => (error: unknown) =>
  error instanceof GenerationError && error.status === status;

test('prompt validation rejects bad input and provides sensible defaults', () => {
  for (const body of [
    undefined,
    {},
    { prompt: ' ' },
    { prompt: 'x'.repeat(4001) },
    { ...request, questionCount: 0 },
    { ...request, questionCount: 21 },
    { ...request, questionCount: 1.5 },
    { ...request, complexity: 'invalid' },
  ]) {
    assert.ok(generationRequestSchema.validate(body, { convert: false }).error);
  }
  assert.deepEqual(
    generationRequestSchema.validate({ prompt: 'Topic' }).value,
    { prompt: 'Topic', questionCount: 5, complexity: 'Medium' },
  );
});

test('AI request keeps credentials server-side and returns an editable, unsaved quiz', async () => {
  const quiz = await generateQuiz(request, settings, async (url, options) => {
    assert.equal(url, 'https://api.openai.com/v1/responses');
    const body = JSON.parse(options?.body as string);
    assert.equal(body.input, request.prompt);
    assert.equal(body.store, false);
    assert.equal(body.text.format.strict, true);
    assert.equal(body.model, settings.model);
    assert.ok(options?.signal);
    return new Response(JSON.stringify(completed(generated)));
  });
  assert.equal(quiz.isPublished, false);
  assert.equal(quiz.questions[0].order, 0);
  assert.equal(quiz.questions[0].points, 1);
  assert.deepEqual(quiz.questions[0].correctOptions, ['a']);
  assert.equal(quizSchema.validate(quiz).error, undefined);
});

test('missing key does not call the provider', async () => {
  await assert.rejects(
    generateQuiz(request, { model: 'test' }, async () => {
      throw new Error('Must not call');
    }),
    hasStatus(503),
  );
});

test('provider failures, refusals and incomplete output have useful safe errors', async () => {
  await assert.rejects(
    generateQuiz(request, settings, reply({ error: 'secret' }, 429)),
    hasStatus(429),
  );
  await assert.rejects(
    generateQuiz(request, settings, reply({ error: 'secret' }, 401)),
    (error) =>
      hasStatus(502)(error) && !(error as Error).message.includes('secret'),
  );
  await assert.rejects(
    generateQuiz(
      request,
      settings,
      reply({
        status: 'completed',
        output: [{ type: 'message', content: [{ type: 'refusal' }] }],
      }),
    ),
    hasStatus(422),
  );
  await assert.rejects(
    generateQuiz(request, settings, reply({ status: 'incomplete' })),
    hasStatus(502),
  );
  await assert.rejects(
    generateQuiz(request, settings, async () => {
      throw new DOMException('timeout', 'TimeoutError');
    }),
    hasStatus(504),
  );
  await assert.rejects(
    generateQuiz(request, settings, async () => {
      throw new TypeError('network error');
    }),
    hasStatus(502),
  );
});

test('malformed AI output never reaches the editor', async () => {
  for (const invalid of [
    null,
    {},
    { ...generated, questions: [] },
    {
      ...generated,
      questions: [{ ...generated.questions[0], correctOptions: ['missing'] }],
    },
    {
      ...generated,
      questions: [{ ...generated.questions[0], correctOptions: ['a', 'b'] }],
    },
  ]) {
    await assert.rejects(
      generateQuiz(request, settings, reply(completed(invalid))),
      hasStatus(502),
    );
  }
  await assert.rejects(
    generateQuiz(
      request,
      settings,
      reply({
        status: 'completed',
        output: [
          { type: 'message', content: [{ type: 'output_text', text: '{bad' }] },
        ],
      }),
    ),
    hasStatus(502),
  );
});

test('saving rejects empty quizzes, duplicate orders, bad answers and fractional points', async () => {
  const quiz = await generateQuiz(
    request,
    settings,
    reply(completed(generated)),
  );
  for (const questions of [
    [],
    [quiz.questions[0], quiz.questions[0]],
    [{ ...quiz.questions[0], points: 1.5 }],
    [{ ...quiz.questions[0], correctOptions: ['missing'] }],
  ]) {
    assert.ok(quizSchema.validate({ ...quiz, questions }).error);
  }
});

test('scoring rejects score inflation and counts unanswered questions as incorrect', async () => {
  const { questions } = await generateQuiz(
    request,
    settings,
    reply(completed(generated)),
  );
  const answer = { order: 0, selectedOptions: ['a'] };
  assert.equal(scoreQuiz(questions, [answer]).score, 1);
  assert.equal(scoreQuiz(questions, []).answers[0].isCorrect, false);
  for (const answers of [
    [answer, answer],
    [{ order: 99, selectedOptions: ['a'] }],
    [{ order: 0, selectedOptions: ['missing'] }],
    [{ order: 0, selectedOptions: ['a', 'a'] }],
    undefined,
    {},
  ])
    assert.throws(() => scoreQuiz(questions, answers));
  assert.equal(scoreQuiz([], []).percentage, 0);
  assert.equal(
    scoreQuiz(
      [
        {
          ...questions[0],
          questionType: 'multi-select',
          correctOptions: ['a', 'b'],
        },
      ],
      [{ order: 0, selectedOptions: ['b', 'a'] }],
    ).score,
    1,
  );
});
