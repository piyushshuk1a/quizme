import express from 'express';

import {
  createQuizController,
  getAllPublicQuizzesController,
  getQuizByIdController,
  startQuizController,
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
router.put('/:id/submit', checkJwt, () => {}); // Submit a quiz

export default router;
