import { Box, Link, Typography } from '@mui/material';

import { AppLogo } from '../AppLogo';

export const LogoLink = () => {
  return (
    <Link to="/" sx={{ display: 'inline-block', opacity: 1 }}>
      <Box display="flex" gap={6} alignItems="center">
        <AppLogo />
        <Typography
          component="span"
          variant="h5"
          sx={{
            color: 'white',
            lineHeight: 1,
            fontWeight: 900,
            textDecoration: 'none',
            background:
              'linear-gradient(to right, rgb(139, 92, 246), rgb(59, 130, 246))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            position: 'relative',
            top: 2,
          }}
        >
          QuizMaster
        </Typography>
      </Box>
    </Link>
  );
};
