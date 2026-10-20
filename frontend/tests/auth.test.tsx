import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { CALLBACK_URL, REDIRECT_TO_SESSION_KEY } from '@/constants';
import { CallbackHandler } from '@/pages/CallbackHandler/CallbackHandler';
import { GuardedRoute } from '@/routes/AppRoutes/subComponents/GuardedRoute';

const auth = vi.hoisted(() => ({
  isAuthenticated: false,
  isLoading: true,
  error: undefined as Error | undefined,
  loginWithRedirect: vi.fn(),
}));
vi.mock('@auth0/auth0-react', () => ({ useAuth0: () => auth }));

beforeEach(() => {
  auth.isAuthenticated = false;
  auth.isLoading = true;
  auth.error = undefined;
  auth.loginWithRedirect = vi.fn();
  sessionStorage.clear();
});
afterEach(cleanup);

function mountGuarded() {
  return render(
    <MemoryRouter initialEntries={['/quiz/create']}>
      <GuardedRoute>
        <div>Protected content</div>
      </GuardedRoute>
    </MemoryRouter>,
  );
}

test('guarded route waits for the session to load instead of redirecting', () => {
  mountGuarded();
  expect(auth.loginWithRedirect).not.toHaveBeenCalled();
  expect(screen.queryByText('Protected content')).toBeNull();
  expect(screen.getByRole('progressbar')).toBeTruthy();
});

test('guarded route renders its content for a signed-in user', () => {
  auth.isLoading = false;
  auth.isAuthenticated = true;
  mountGuarded();
  expect(auth.loginWithRedirect).not.toHaveBeenCalled();
  expect(screen.getByText('Protected content')).toBeTruthy();
});

test('guarded route redirects a signed-out user to login once', async () => {
  auth.isLoading = false;
  mountGuarded();
  await waitFor(() => expect(auth.loginWithRedirect).toHaveBeenCalledTimes(1));
  expect(
    auth.loginWithRedirect.mock.calls[0][0].authorizationParams.redirect_uri,
  ).toBe(CALLBACK_URL);
  expect(screen.queryByText('Protected content')).toBeNull();
});

function mountCallback() {
  return render(
    <MemoryRouter initialEntries={['/callback?code=abc&state=xyz']}>
      <Routes>
        <Route path="/callback" element={<CallbackHandler />} />
        <Route path="/" element={<div>Home page</div>} />
        <Route path="/quiz" element={<div>Quiz list</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

test('callback returns to the stored page once Auth0 has finished', async () => {
  sessionStorage.setItem(REDIRECT_TO_SESSION_KEY, '/quiz?tab=myQuizzes');
  const view = mountCallback();
  expect(screen.getByRole('progressbar')).toBeTruthy();
  auth.isLoading = false;
  auth.isAuthenticated = true;
  view.rerender(
    <MemoryRouter initialEntries={['/callback?code=abc&state=xyz']}>
      <Routes>
        <Route path="/callback" element={<CallbackHandler />} />
        <Route path="/" element={<div>Home page</div>} />
        <Route path="/quiz" element={<div>Quiz list</div>} />
      </Routes>
    </MemoryRouter>,
  );
  await screen.findByText('Quiz list');
  expect(sessionStorage.getItem(REDIRECT_TO_SESSION_KEY)).toBeNull();
});

test('callback falls back to home for missing or unsafe return paths', async () => {
  sessionStorage.setItem(REDIRECT_TO_SESSION_KEY, 'https://evil.example');
  auth.isLoading = false;
  mountCallback();
  await screen.findByText('Home page');
});
