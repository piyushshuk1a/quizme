import { AppLogo } from './AppLogo.component';
import { type AppLogoProps } from './AppLogo.types';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  component: AppLogo,
  parameters: {
    layout: 'centered',
  },
  title: 'Components/AppLogo',
} satisfies Meta<AppLogoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const CustomSize: Story = {
  args: {
    size: 80,
  },
};
