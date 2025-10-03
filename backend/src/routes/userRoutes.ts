import express from 'express';

import { updateRole } from '@/controllers';
import { checkJwt } from '@/middlewares';

const router = express.Router();

router.put('/:id', checkJwt, updateRole);

export default router;
