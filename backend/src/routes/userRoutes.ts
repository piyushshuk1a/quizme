import express from 'express';

import {
  getAllQuizzesForUser,
  getInvitedQuizzes,
  updateRole,
} from '@/controllers';
import { checkJwt } from '@/middlewares';

const router = express.Router();

router.put('/:id', checkJwt, updateRole);

router.get('/quizzes', checkJwt, getAllQuizzesForUser); // Get all quizzes for a user

router.get('/invited', checkJwt, getInvitedQuizzes); // Get all quizzes a user is invited to

export default router;
