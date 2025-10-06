import { Request, Response } from 'express';

import { config, USER_ERROR_MESSAGES, USER_ROLES } from '@/config';
import { FieldValue } from '@/firebase';
import {
  getAllUserQuizzes,
  getInvitedQuizzesForUser,
  getUserById,
  updateUser,
} from '@/services';
import { getManagementApiToken } from '@/utils';

import { UpdateRoleRequest } from './userController.types';

export const updateRole = async (req: UpdateRoleRequest, res: Response) => {
  const { id } = req.params;
  const { role, email } = req.body;

  // Validate the role
  if (role !== USER_ROLES.admin && role !== USER_ROLES.candidate) {
    return res.status(400).json({ message: USER_ERROR_MESSAGES.invalidRole });
  }

  // Validate the email
  if (!email?.trim()) {
    return res.status(400).json({ message: USER_ERROR_MESSAGES.invalidEmail });
  }

  try {
    await updateUser(id, {
      email,
      role,
      userId: id,
      createdAt: FieldValue.serverTimestamp(),
    });

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
      const errorData = (await response.json()) as unknown as Record<
        string,
        unknown
      >;

      return res
        .status(response.status)
        .json({ message: errorData.message ?? 'Something went wrong' });
    }

    return res.status(200).json({ status: await response.json() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getInvitedQuizzes = async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.sub as string;

    const userData = await getUserById(userId);

    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    const invitedQuizzes = await getInvitedQuizzesForUser(userData.email);
    return res.status(200).json(invitedQuizzes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllQuizzesForUser = async (req: Request, res: Response) => {
  const userId = req.auth?.sub as string;

  try {
    const quizzes = await getAllUserQuizzes(userId);
    return res.status(200).json(quizzes);
  } catch (error) {
    console.error('Error fetching user quizzes:', error);
    return res.status(500).json({ message: 'Could not fetch user quizzes.' });
  }
};
