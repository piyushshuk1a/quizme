import { Response } from 'express';

import { config, USER_ERROR_MESSAGES, USER_ROLES } from '@/config';
import { getManagementApiToken } from '@/utils';

import { UpdateRoleRequest } from './userController.types';

export const updateRole = async (req: UpdateRoleRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  // Validate the role
  if (role !== USER_ROLES.admin && role !== USER_ROLES.candidate) {
    return res.status(400).json({ message: USER_ERROR_MESSAGES.invalidRole });
  }

  const token = await getManagementApiToken();
  const updateUrl = `https://${config.auth0Domain}/api/v2/users/${id}`;
  const response = await fetch(updateUrl, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      app_metadata: { role: role },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`,
    );
  }
};
