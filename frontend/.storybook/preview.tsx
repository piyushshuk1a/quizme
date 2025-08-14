import { CssBaseline, ThemeProvider } from '@mui/material';
import { type Preview } from '@storybook/react-vite';
import React from 'react';

import { THEME, THEME_COLORS } from '../src/theme';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: THEME_COLORS.background.default,
        },
      ],
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
};

export const decorators = [
  (Story) => (
    <ThemeProvider theme={THEME}>
      <CssBaseline />
      <Story />
    </ThemeProvider>
  ),
];

export default preview;
