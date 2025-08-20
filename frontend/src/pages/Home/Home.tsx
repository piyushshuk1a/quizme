import { Link, Stack } from '@mui/material';

import { AppLogo, Button } from '@/components';

export const Home = () => {
  return (
    <div>
      <Stack gap={10} padding={12}>
        <AppLogo />
        <AppLogo size={80} />
      </Stack>
      <Link to="/about">Go to About</Link>
      <Stack gap={10} padding={12}>
        <h1>Hello Quizme</h1>
        <div>
          <Button variant="contained">Primary</Button>
        </div>
        <div>
          <Button variant="contained" color="secondary">
            Secondary
          </Button>
        </div>
        <div>
          <Button variant="text">Primary</Button>
        </div>
        <div>
          <Button variant="text" color="secondary">
            Secondary
          </Button>
        </div>
        <div>
          <Button variant="outlined">Primary</Button>
        </div>
        <div>
          <Button variant="outlined" color="secondary">
            Secondary
          </Button>
        </div>
        <div>
          <Button color="gradient">Secondary</Button>
        </div>
        <div>
          <Button color="white">Secondary</Button>
        </div>
      </Stack>
    </div>
  );
};
