import { type ButtonProps as MuiButtonProps } from '@mui/material';

export type ButtonProps = Omit<MuiButtonProps, 'color'> & {
  color?: NonNullable<MuiButtonProps['color']> | 'gradient' | 'white';
};
