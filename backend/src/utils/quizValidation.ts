import Joi from 'joi';

import type { Question } from '@/models';

export const questionSchema = Joi.object<Question>({
  questionText: Joi.string().trim().min(1).max(5000).required(),
  questionType: Joi.string().valid('single-select', 'multi-select').required(),
  points: Joi.number().integer().min(1).max(1000000).required(),
  order: Joi.number().integer().min(0).required(),
  options: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().max(100).required(),
        label: Joi.string().trim().min(1).max(2000).required(),
      }),
    )
    .min(2)
    .max(20)
    .unique('id')
    .required(),
  correctOptions: Joi.array().items(Joi.string()).min(1).unique().required(),
}).custom((question: Question, helpers) => {
  if (
    question.correctOptions.some(
      (id) => !question.options.some((option) => option.id === id),
    ) ||
    (question.questionType === 'single-select' &&
      question.correctOptions.length !== 1)
  ) {
    return helpers.message({
      custom: 'Correct answers must match the question type and option IDs.',
    });
  }
  return question;
});

export const quizSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[^/]+$/)
    .max(200)
    .optional(),
  title: Joi.string().trim().min(10).max(200).required(),
  description: Joi.string().trim().min(50).max(5000).required(),
  complexity: Joi.string()
    .valid('Easy', 'Medium', 'Hard', 'Advanced')
    .required(),
  category: Joi.string().trim().min(1).max(100).required(),
  durationMinutes: Joi.number().integer().min(1).max(1440).required(),
  isPublished: Joi.boolean().default(false),
  questions: Joi.array()
    .items(questionSchema)
    .min(1)
    .max(100)
    .unique('order')
    .required(),
}).required();

const answersSchema = Joi.array()
  .items(
    Joi.object({
      order: Joi.number().integer().min(0).required(),
      selectedOptions: Joi.array().items(Joi.string()).unique().required(),
    }),
  )
  .max(100)
  .unique('order')
  .required();

export function scoreQuiz(questions: Question[], input: unknown) {
  const { value, error } = answersSchema.validate(input, { convert: false });
  if (error) throw new Error('Invalid answers.');
  const answers = value as { order: number; selectedOptions: string[] }[];
  for (const answer of answers) {
    const question = questions.find((q) => q.order === answer.order);
    if (
      !question ||
      answer.selectedOptions.some(
        (id) => !question.options.some((option) => option.id === id),
      ) ||
      (question.questionType === 'single-select' &&
        answer.selectedOptions.length > 1)
    ) {
      throw new Error('Invalid answers.');
    }
  }
  let score = 0;
  const answerData = questions.map((question) => {
    const selectedOptions =
      answers.find((a) => a.order === question.order)?.selectedOptions ?? [];
    const isCorrect =
      question.correctOptions.length > 0 &&
      selectedOptions.length === question.correctOptions.length &&
      question.correctOptions.every((id) => selectedOptions.includes(id));
    if (isCorrect) score += question.points;
    return { order: question.order, selectedOptions, isCorrect };
  });
  const maxPossibleScore = questions.reduce((total, q) => total + q.points, 0);
  return {
    score,
    maxPossibleScore,
    percentage:
      maxPossibleScore > 0 ? Math.trunc((score / maxPossibleScore) * 100) : 0,
    answers: answerData,
  };
}
