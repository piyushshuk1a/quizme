import { Route, Routes } from 'react-router';

import { ROUTES_CONFIG } from '../routes.config';

import { RouteRenderer } from './subComponents';

export const AppRoutes = () => (
  <Routes>
    {ROUTES_CONFIG.map(({ path, ...restConfig }) => (
      <Route
        path={path}
        key={path}
        element={<RouteRenderer {...restConfig} />}
      />
    ))}
  </Routes>
);
