import { Navbar } from './Navbar.component';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  component: Navbar,
  title: 'Components/Navbar',
} satisfies Meta<object>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
