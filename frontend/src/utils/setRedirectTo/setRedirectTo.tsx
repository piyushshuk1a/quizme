import { REDIRECT_TO_SESSION_KEY } from '@/constants';

export const setRedirectTo = () => {
  const currentPath = window.location.pathname + window.location.search;
  sessionStorage.setItem(REDIRECT_TO_SESSION_KEY, currentPath);
};
