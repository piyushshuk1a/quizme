export const MAX_HORIZONTAL_WIDTH = 1280;

export const USER_ROLES = {
  admin: 'ADMIN',
  candidate: 'CANDIDATE',
} as const;

export const SIGNUP_ROLE_ACTIONS = {
  update: 'update/selectedRole',
};

export const API_REQUEST_TYPES = {
  post: 'POST',
  put: 'PUT',
  get: 'GET',
  patch: 'PATCH',
  delete: 'DELETE',
} as const;

export const API_ENDPOINTS = {
  userRole: '/api/users/:id',
  createQuiz: '/api/quizzes',
  generateQuiz: '/api/quizzes/generate',
  getQuiz: '/api/quizzes/:id',
  listQuizzes: '/api/quizzes',
  startQuiz: '/api/quizzes/:id/start',
  submitQuiz: '/api/quizzes/:id/submit',
  quizAttempt: '/api/quizzes/:id/attempt',
  inviteCandidates: '/api/quizzes/:id/invite',
} as const;

export const ROLE_NAMESPACE = 'https://myapp.com/role';

export const REDIRECT_TO_SESSION_KEY = 'returnTo';

/**
 * Base URL of the frontend. Falls back to the current origin so that the
 * Auth0 callback/logout URLs never become "undefined/callback" when the
 * optional VITE_APP_BASE_URL variable is not configured.
 */
export const APP_BASE_URL = (
  (import.meta.env.VITE_APP_BASE_URL as string | undefined) ||
  window.location.origin
).replace(/\/$/, '');

export const CALLBACK_URL = `${APP_BASE_URL}/callback`;
