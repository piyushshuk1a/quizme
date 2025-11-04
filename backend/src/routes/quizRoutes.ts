import express from 'express';

import {
  createQuizController,
  getAllPublicQuizzesController,
  getQuizAttemptController,
  getQuizByIdController,
  startQuizController,
  submitQuizController,
} from '@/controllers';
import { checkJwt, decodeToken } from '@/middlewares';

const router = express.Router();

router.get('/', decodeToken, getAllPublicQuizzesController); // Get all public quizzes
router.post('/', checkJwt, createQuizController); // Create Quiz

router.get('/:id', checkJwt, getQuizByIdController); // Get Quiz
router.put('/:id', checkJwt, createQuizController); // Update Quiz
router.get('/:id/invited', checkJwt, () => {}); // Get invited candidates for a quiz
router.put('/:id/invite', checkJwt, () => {}); // Invite candidates for a quiz

router.post('/:id/start', checkJwt, startQuizController); // Start a quiz
router.post('/:id/submit', checkJwt, submitQuizController); // Submit a quiz

router.get('/:id/attempt', checkJwt, getQuizAttemptController);
export default router;
