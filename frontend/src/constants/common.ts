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
  userRole: '/api/users/:id/role',
} as const;

export const ROLE_NAMESPACE = 'https://myapp.com/role';
