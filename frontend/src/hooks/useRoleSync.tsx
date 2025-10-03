import { useAuth0 } from '@auth0/auth0-react';
import { ManageAccounts, School } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { generatePath } from 'react-router';

import {
  API_ENDPOINTS,
  API_REQUEST_TYPES,
  ROLE_NAMESPACE,
  USER_ROLES,
} from '@/constants';
import { NAVY_BLUE } from '@/theme';

import { useMutation } from './swr';
import { useSignupRole, type UserRoles } from './useSignupRole';

type UpdateRolePayload = { role: UserRoles; email: string };

export const useRoleSync = () => {
  const { isAuthenticated, user, getAccessTokenWithPopup } = useAuth0();
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRoles>();
  const { trigger: updateRole, isMutating: isUpdatingRole } =
    useMutation<UpdateRolePayload>({
      path: user
        ? generatePath(API_ENDPOINTS.userRole, { id: user.sub ?? '' })
        : '',
      method: API_REQUEST_TYPES.put,
      onSuccess: async () => {
        await getAccessTokenWithPopup({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        }); // Force token refresh to get the updated role in the ID token
      },
    });
  const { role: signUpRole } = useSignupRole();

  const handleUpdateRole = useCallback(
    (role: UserRoles) => {
      return updateRole({ role, email: user?.email as string });
    },
    [updateRole, user],
  );

  const syncUser = useCallback(async () => {
    // Return if not authenticated or role is already assigned
    if (!isAuthenticated || user?.[ROLE_NAMESPACE]) return;

    // If role available from the sign-up flow
    if (signUpRole) {
      handleUpdateRole(signUpRole);
    } else {
      setIsRoleDialogOpen(true);
    }
  }, [isAuthenticated, user, signUpRole, handleUpdateRole]);

  useEffect(() => {
    syncUser();
  }, [syncUser]);

  const handleRoleSelection = (role: UserRoles) => {
    handleUpdateRole(role).then(() => setIsRoleDialogOpen(false));
  };

  const activeBorderCandidate = '1px solid #8B5CF6';
  const activeBorderAdmin = '1px solid #6366F1';

  const roleConfirmation = (
    <Dialog open={isRoleDialogOpen}>
      {isUpdatingRole && (
        <LinearProgress
          sx={{ position: 'absolute', top: 0, left: 0, right: 0 }}
        />
      )}
      <DialogTitle>
        <Typography component="span" variant="h5">
          Complete Your Sign Up
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Before we setup your account, please choose how you'll be using
          QuizMaster. This helps us give you the right experience.
        </DialogContentText>
        <Box display="flex" gap={16} marginTop={24}>
          <Card
            onClick={() => setSelectedRole(USER_ROLES.candidate)}
            tabIndex={1}
            variant="outlined"
            sx={{
              background: NAVY_BLUE[700],
              cursor: 'pointer',
              flexGrow: 1,
              '&:hover': { border: activeBorderCandidate },
              ...(selectedRole === USER_ROLES.candidate && {
                border: activeBorderAdmin,
              }),
            }}
          >
            <CardContent>
              <School sx={{ color: '#8B5CF6', fontSize: 28 }} />
              <Typography component="h3" variant="h6">
                Candidate
              </Typography>
              <Typography fontSize={12}>
                I want to take quizzes and track my progress.
              </Typography>
            </CardContent>
          </Card>
          <Card
            onClick={() => setSelectedRole(USER_ROLES.admin)}
            tabIndex={1}
            variant="outlined"
            sx={{
              cursor: 'pointer',
              background: NAVY_BLUE[700],
              flexGrow: 1,
              '&:hover': { border: activeBorderAdmin },
              ...(selectedRole === USER_ROLES.admin && {
                border: activeBorderAdmin,
              }),
            }}
          >
            <CardContent>
              <ManageAccounts sx={{ color: '#6366F1', fontSize: 28 }} />
              <Typography component="h3" variant="h6">
                Admin
              </Typography>
              <Typography fontSize={12}>
                I want to create and manage quizzes for candidates.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          disabled={!selectedRole || isUpdatingRole}
          onClick={() => handleRoleSelection(selectedRole as UserRoles)}
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );

  return { roleConfirmation };
};
