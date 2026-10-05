import { ThemeProvider } from '@mui/material';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { MemoryRouter } from 'react-router';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { CreateQuizWithProvider } from '@/pages/CreateQuiz/CreateQuiz';
import { THEME } from '@/theme';

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: true,
    getAccessTokenSilently: async () => 'test-token',
    user: { sub: 'owner' },
  }),
}));

const quiz = {
  title: 'Photosynthesis knowledge quiz',
  description:
    'Explore how plants use sunlight, water, and carbon dioxide to make their own food.',
  complexity: 'Easy' as const,
  category: 'Biology',
  durationMinutes: 5,
  totalQuestions: 1,
  totalPoints: 1,
  questions: [
    {
      order: 0,
      questionText: 'Which pigment absorbs sunlight?',
      questionType: 'single-select' as const,
      points: 1,
      options: [
        { id: 'a', label: 'Chlorophyll' },
        { id: 'b', label: 'Hemoglobin' },
      ],
      correctOptions: ['a'],
    },
  ],
};
const api = vi.fn();
beforeEach(() => {
  vi.stubGlobal('fetch', api);
  api.mockResolvedValue(new Response(JSON.stringify(quiz), { status: 200 }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
function mount(existing = false) {
  return render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MemoryRouter initialEntries={['/create?mode=ai']}>
        <SnackbarProvider>
          <ThemeProvider theme={THEME}>
            <CreateQuizWithProvider
              quizData={existing ? { ...quiz, id: 'existing' } : undefined}
            />
          </ThemeProvider>
        </SnackbarProvider>
      </MemoryRouter>
    </SWRConfig>,
  );
}
async function generate() {
  fireEvent.change(screen.getByLabelText('Quiz prompt'), {
    target: { value: 'Photosynthesis for class 8' },
  });
  fireEvent.change(screen.getByLabelText('Number of questions'), {
    target: { value: '1' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Generate Quiz' }));
}

test('generates questions and selected answers into the editor, then saves a draft', async () => {
  mount();
  await generate();
  await screen.findByLabelText(/Quiz Title/);
  expect((screen.getByLabelText(/Quiz Title/) as HTMLInputElement).value).toBe(
    quiz.title,
  );
  expect(screen.getByText('1. Which pigment absorbs sunlight?')).toBeTruthy();
  expect((screen.getAllByRole('radio')[0] as HTMLInputElement).checked).toBe(
    true,
  );
  expect(api.mock.calls[0][0]).toContain('/api/quizzes/generate');
  expect(JSON.parse(api.mock.calls[0][1].body).prompt).toBe(
    'Photosynthesis for class 8',
  );
  expect(api).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: 'Add New Question' }));
  expect(screen.getByText('Question 2')).toBeTruthy();
  fireEvent.click(screen.getAllByRole('button', { name: 'Delete' }).at(-1)!);
  api.mockResolvedValueOnce(
    new Response(JSON.stringify({ status: 'Success' })),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save Draft' }));
  await waitFor(() => expect(api).toHaveBeenCalledTimes(2));
  const saved = JSON.parse(api.mock.calls[1][1].body);
  expect(saved.isPublished).toBe(false);
  expect(saved.questions[0].correctOptions).toEqual(['a']);
});

test('generation failure preserves the editor and displays the backend error', async () => {
  api.mockResolvedValueOnce(
    new Response(
      JSON.stringify({ message: 'AI generation is not configured.' }),
      { status: 503 },
    ),
  );
  mount(true);
  await generate();
  expect(
    await screen.findByText('AI generation is not configured.'),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole('tab', { name: 'Manual Creation' }));
  expect((screen.getByLabelText(/Quiz Title/) as HTMLInputElement).value).toBe(
    quiz.title,
  );
});

test('existing quiz requires replacement confirmation and retains its ID when published', async () => {
  mount(true);
  await generate();
  await screen.findByRole('dialog');
  fireEvent.click(screen.getByRole('button', { name: 'Keep Current Quiz' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  fireEvent.click(screen.getByRole('tab', { name: 'Manual Creation' }));
  expect((screen.getByLabelText(/Quiz Title/) as HTMLInputElement).value).toBe(
    quiz.title,
  );
  fireEvent.click(screen.getByRole('tab', { name: 'AI Generation' }));
  api.mockResolvedValueOnce(
    new Response(
      JSON.stringify({ ...quiz, title: 'New generated quiz title' }),
    ),
  );
  await generate();
  await screen.findByRole('dialog');
  fireEvent.click(screen.getByRole('button', { name: 'Use Generated Quiz' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  await screen.findByLabelText(/Quiz Title/);
  expect((screen.getByLabelText(/Quiz Title/) as HTMLInputElement).value).toBe(
    'New generated quiz title',
  );
  api.mockResolvedValueOnce(
    new Response(JSON.stringify({ status: 'Success' })),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Publish Quiz' }));
  await waitFor(() => expect(api).toHaveBeenCalledTimes(3));
  const saved = JSON.parse(api.mock.calls[2][1].body);
  expect(saved.id).toBe('existing');
  expect(saved.isPublished).toBe(true);
});

test('invalid question count does not call AI and loading prevents duplicate generation', async () => {
  mount();
  fireEvent.change(screen.getByLabelText('Quiz prompt'), {
    target: { value: 'A biology quiz' },
  });
  fireEvent.change(screen.getByLabelText('Number of questions'), {
    target: { value: '21' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Generate Quiz' }));
  expect(screen.getByText('Choose between 1 and 20 questions.')).toBeTruthy();
  expect(api).not.toHaveBeenCalled();
  let resolve!: (response: Response) => void;
  api.mockImplementationOnce(
    () =>
      new Promise<Response>((done) => {
        resolve = done;
      }),
  );
  await generate();
  await waitFor(() => expect(api).toHaveBeenCalledTimes(1));
  expect(
    (
      screen.getByRole('button', {
        name: 'Generating quiz…',
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  expect(
    (screen.getByRole('button', { name: 'Save Draft' }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  resolve(new Response(JSON.stringify(quiz)));
  await screen.findByLabelText(/Quiz Title/);
});

test('HTML auth errors show a useful message and preserve the current quiz', async () => {
  api.mockResolvedValueOnce(
    new Response('<!DOCTYPE html><html>Unauthorized</html>', { status: 401 }),
  );
  mount(true);
  await generate();
  expect(
    await screen.findByText(
      'Your session could not be verified. Please sign out and sign in again.',
    ),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole('tab', { name: 'Manual Creation' }));
  expect((screen.getByLabelText(/Quiz Title/) as HTMLInputElement).value).toBe(
    quiz.title,
  );
});
