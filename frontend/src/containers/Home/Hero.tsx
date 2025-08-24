import { AdminPanelSettings, School } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';

import { Button, Container } from '@/components';
import { pxToRem } from '@/utils';

export const HeroSection = () => {
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
        <Box display="flex" gap={40} marginTop={12}>
          <Button color="gradient" startIcon={<AdminPanelSettings />}>
            Start as Admin
          </Button>
          <Button color="secondary" startIcon={<School />}>
            Join as Candidate
          </Button>
        </Box>
      </Container>
    </Box>
  );
};
