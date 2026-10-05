import { ThemeProvider } from '@mui/material';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, expect, test, vi } from 'vitest';

import { TakeQuiz } from '@/containers/Quiz/TakeQuiz';
import { RenderQuizProvider } from '@/context';
import { THEME } from '@/theme';

const mocks = vi.hoisted(() => ({ submit: vi.fn(), failStart: false }));
vi.mock('@/hooks', () => ({
  useUserInfo: () => ({ id: 'candidate' }),
  useFetch: () => ({ mutate: vi.fn(), isValidating: false }),
  useMutation: ({
    path,
    onSuccess,
    onError,
  }: {
    path: string;
    onSuccess?: (data: object) => void;
    onError?: () => void;
  }) => ({
    isMutating: false,
    trigger: (body: object) => {
      if (path.endsWith('/start')) {
        if (mocks.failStart) onError?.();
        else
          onSuccess?.({
            startedAt: new Date(Date.now() - 59000).toISOString(),
          });
      } else if (path.endsWith('/submit')) mocks.submit(body);
    },
  }),
}));
const quiz = {
  id: 'quiz',
  title: 'Arithmetic quiz',
  description: 'Test arithmetic',
  complexity: 'Easy' as const,
  category: 'Mathematics',
  durationMinutes: 1,
  totalPoints: 1,
  totalQuestions: 1,
  questions: [
    {
      order: 7,
      points: 1,
      questionText: 'What is two plus two?',
      questionType: 'single-select' as const,
      options: [
        { id: 'a', label: 'Four' },
        { id: 'b', label: 'Five' },
      ],
    },
  ],
};
function mount() {
  return render(
    <MemoryRouter initialEntries={['/quiz/quiz']}>
      <Routes>
        <Route
          path="/quiz/:id"
          element={
            <SnackbarProvider>
              <ThemeProvider theme={THEME}>
                <RenderQuizProvider quizData={quiz}>
                  <TakeQuiz isOwner={false} isAdmin={false} />
                </RenderQuizProvider>
              </ThemeProvider>
            </SnackbarProvider>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  mocks.failStart = false;
});

test('resumed timer uses server start time and submits the latest selected answer once', () => {
  vi.useFakeTimers();
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'Start Quiz' }));
  fireEvent.click(screen.getByRole('radio', { name: 'Four' }));
  act(() => {
    vi.advanceTimersByTime(1000);
  });
  expect(mocks.submit).toHaveBeenCalledWith({
    data: [{ order: 7, selectedOptions: ['a'] }],
  });
  act(() => {
    vi.advanceTimersByTime(5000);
  });
  expect(mocks.submit).toHaveBeenCalledTimes(1);
});

test('failed start does not run a timer or submit an attempt', () => {
  vi.useFakeTimers();
  mocks.failStart = true;
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'Start Quiz' }));
  act(() => {
    vi.advanceTimersByTime(70000);
  });
  expect(mocks.submit).not.toHaveBeenCalled();
});
