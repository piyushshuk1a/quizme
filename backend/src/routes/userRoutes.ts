import express from 'express';

import { updateRole } from '@/controllers';

const router = express.Router();

router.put('/:id/role', updateRole);

export default router;
