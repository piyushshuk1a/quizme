import { useAuth0 } from '@auth0/auth0-react';
import { AdminPanelSettings, School } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';

import { Button, Container } from '@/components';
import { USER_ROLES } from '@/constants';
import { pxToRem } from '@/utils';

export const HeroSection = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

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
              color="gradient"
              startIcon={<AdminPanelSettings />}
              onClick={() =>
                loginWithRedirect({
                  authorizationParams: { screen_hint: 'signup' },
                  appState: { role: USER_ROLES.admin },
                })
              }
            >
              Start as Admin
            </Button>
            <Button
              color="secondary"
              startIcon={<School />}
              onClick={() =>
                loginWithRedirect({
                  authorizationParams: { screen_hint: 'signup' },
                  appState: { role: USER_ROLES.candidate },
                })
              }
            >
              Join as Candidate
            </Button>
          </Box>
        )}
        {isAuthenticated && (
          <Box display="flex" gap={40} marginTop={12}>
            <Button
              color="gradient"
              startIcon={<AdminPanelSettings />}
              onClick={() =>
                loginWithRedirect({
                  authorizationParams: { screen_hint: 'signup' },
                  appState: { role: USER_ROLES.admin },
                })
              }
            >
              Create a Quiz
            </Button>
            <Button
              color="secondary"
              startIcon={<School />}
              onClick={() =>
                loginWithRedirect({
                  authorizationParams: { screen_hint: 'signup' },
                  appState: { role: USER_ROLES.candidate },
                })
              }
            >
              Take a Quiz
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};
