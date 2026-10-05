import { Request, Response } from 'express';

import { config } from '@/config';
import {
  generateQuiz,
  GenerationError,
  generationRequestSchema,
  GenerationRequest,
} from '@/services/aiQuizService';

export const generateQuizController = async (req: Request, res: Response) => {
  const { value, error } = generationRequestSchema.validate(req.body, {
    convert: false,
  });
  if (error) return res.status(400).json({ message: error.details[0].message });
  try {
    const quiz = await generateQuiz(value as GenerationRequest, {
      apiKey: config.openaiApiKey,
      model: config.openaiModel,
    });
    return res.status(200).json(quiz);
  } catch (error) {
    if (error instanceof GenerationError)
      return res.status(error.status).json({ message: error.message });
    return res.status(500).json({ message: 'Could not generate quiz.' });
  }
};
