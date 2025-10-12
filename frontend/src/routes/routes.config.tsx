import React from 'react';

import { ROUTES } from '@/constants';

const Home = React.lazy(() => import('@/pages/Home'));
const CreateQuiz = React.lazy(() => import('@/pages/CreateQuiz'));
const Quiz = React.lazy(() => import('@/pages/Quiz'));
const ListQuiz = React.lazy(() => import('@/pages/ListQuiz'));

export const ROUTES_CONFIG: RouteConfigItem[] = [
  { path: '/', element: <Home />, isGuarded: false },
  {
    path: ROUTES.createQuiz,
    element: <CreateQuiz />,
    isGuarded: true,
  },
  {
    path: ROUTES.quiz,
    element: <Quiz />,
    isGuarded: true,
  },
  {
    path: ROUTES.listQuiz,
    element: <ListQuiz />,
    isGuarded: false,
  },
];
