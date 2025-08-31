import { Request } from 'express';

import { USER_ROLES } from '@/config/user';

type UserIdParam = {
  id: string;
};

export type UpdateRoleRequest = Request<
  UserIdParam,
  unknown,
  { role: ObjectValuesUnion<typeof USER_ROLES> }
>;
