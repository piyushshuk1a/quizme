import { useAuth0 } from '@auth0/auth0-react';
import { AdminPanelSettings, School } from '@mui/icons-material';
import { Box, Link, Typography } from '@mui/material';

import { Button, Container } from '@/components';
import { CALLBACK_URL, ROUTES, USER_ROLES } from '@/constants';
import { useUserInfo } from '@/hooks';
import { pxToRem, setRedirectTo } from '@/utils';

export const HeroSection = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const { role } = useUserInfo();

  return (
    <Box
      sx={{
        // Take one screen height (-72px to reduce nav height)
        height: 'calc(100vh - 72px)',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(to right bottom, rgba(139, 92, 246, 0.2), rgba(0, 0, 0, 0), rgba(59, 130, 246, 0.2))',
      }}
    >
      <Container
        height="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={18}
      >
        <Typography
          variant="h2"
          style={{
            maxWidth: '800px',
            textAlign: 'center',
            background:
              'linear-gradient(to right, rgb(59, 130, 246), rgb(99, 102, 241))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          AI-Powered Quiz Platform
        </Typography>
        <Typography
          color="textSecondary"
          sx={{ maxWidth: pxToRem(800), textAlign: 'center' }}
        >
          Create, share, and take quizzes on any topic with our intelligent quiz
          platform. Perfect for educators, teams, and anyone looking to test
          their knowledge.
        </Typography>
        {!isAuthenticated && (
          <Box display="flex" gap={40} marginTop={12}>
            <Button
              size="large"
              color="gradient"
              startIcon={<AdminPanelSettings />}
              onClick={() => (
                setRedirectTo(),
                loginWithRedirect({
                  authorizationParams: {
                    screen_hint: 'signup',
                    redirect_uri: CALLBACK_URL,
                  },
                  appState: { role: USER_ROLES.admin },
                })
              )}
            >
              Start as Admin
            </Button>
            <Button
              size="large"
              color="secondary"
              startIcon={<School />}
              onClick={() => (
                setRedirectTo(),
                loginWithRedirect({
                  authorizationParams: {
                    screen_hint: 'signup',
                    redirect_uri: CALLBACK_URL,
                  },
                  appState: { role: USER_ROLES.candidate },
                })
              )}
            >
              Join as Candidate
            </Button>
          </Box>
        )}
        {isAuthenticated && (
          <Link to={ROUTES.createQuiz}>
            <Button
              size="large"
              color="gradient"
              startIcon={<AdminPanelSettings />}
            >
              {role === USER_ROLES.admin ? 'Create a Quiz' : 'Take a Quiz'}
            </Button>
          </Link>
        )}
      </Container>
    </Box>
  );
};
