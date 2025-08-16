import { CircularProgress } from '@mui/material';
import { Suspense } from 'react';

import { GuardedRoute } from './GuardedRoute';

export const RouteRenderer = ({
  element,
  isGuarded,
}: Omit<RouteConfigItem, 'path'>) => {
  return (
    <Suspense fallback={<CircularProgress />}>
      {isGuarded ? <GuardedRoute>{element}</GuardedRoute> : element}
    </Suspense>
  );
};
