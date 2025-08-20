import { Button } from './Button.component';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  component: Button,
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Button',
  },
  title: 'Components/Button',
} satisfies Meta<object>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    color: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    color: 'secondary',
  },
};

export const Gradient: Story = {
  args: {
    color: 'gradient',
  },
};

export const White: Story = {
  args: {
    color: 'white',
  },
};
