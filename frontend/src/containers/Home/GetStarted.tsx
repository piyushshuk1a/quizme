import { useAuth0 } from '@auth0/auth0-react';
import { RocketLaunch } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router';

import { Button, Container } from '@/components';
import { CALLBACK_URL, ROUTES, USER_ROLES } from '@/constants';
import { useUserInfo } from '@/hooks';
import { setRedirectTo } from '@/utils';

export const GetStarted = () => {
  const { role = USER_ROLES.candidate, isAuthenticated } = useUserInfo();
  const { loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  const roleToTextMap = {
    [USER_ROLES.candidate]: {
      heading: 'Ready to Challenge Your Mind?',
      subtitle:
        'Join thousands of quiz enthusiasts and start your learning journey today.',
      btnLabel: 'Start Your First Quiz',
      destination: ROUTES.listQuiz,
    },
    [USER_ROLES.admin]: {
      heading: 'Ready to get started?',
      subtitle:
        'Join thousands of educators, trainers, and knowledge enthusiasts who are already using our platform.',
      btnLabel: 'Create Your First Quiz',
      destination: ROUTES.createQuiz,
    },
  };

  const { heading, subtitle, btnLabel, destination } = roleToTextMap[role];

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate(destination);
      return;
    }
    setRedirectTo();
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
        redirect_uri: CALLBACK_URL,
      },
    });
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      padding={80}
      sx={{
        background:
          'linear-gradient(to right, rgb(139, 92, 246), rgb(59, 130, 246), rgb(6, 182, 212))',
      }}
    >
      <Container
        display="flex"
        flexDirection="column"
        justifyContent="center"
        textAlign="center"
        gap={16}
      >
        <Typography component="h2" variant="h4">
          {heading}
        </Typography>
        <Typography>{subtitle}</Typography>
        <Box display="flex" justifyContent="center" gap={12} marginTop={20}>
          <Button
            color="white"
            startIcon={<RocketLaunch />}
            onClick={handleGetStarted}
          >
            {btnLabel}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};
