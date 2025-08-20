import { darken, Button as MuiButton } from '@mui/material';

import type { ButtonProps } from './Button.types';

export const Button = ({
  color,
  variant = 'contained',
  ...rest
}: ButtonProps) => {
  const gradientStyles = {
    background:
      'linear-gradient(to right, rgb(139, 92, 246), rgb(59, 130, 246))',
    border: 'none !important',

    '&:hover': {
      background: `linear-gradient(to right, ${darken('rgb(139, 92, 246)', 0.2)}, ${darken(`rgb(59, 130, 246)`, 0.2)})`,
      transition: 'background 2s ease',
    },
  };

  const whiteStyles = {
    color: '#222222',
    background: 'white',
    borderColor: 'white !important',

    '&:hover': {
      color: '#222222',
      background: 'white',
      boxShadow:
        'black 0px 0px 0px 0px, black 0px 0px 0px 0px, rgba(0, 0, 0, 0.25) 0px 25px 50px -12px',
      transform: 'matrix(1.05, 0, 0, 1.05, 0, 0)',
      transition: 'transform 300ms ease-out',
    },
  };

  return (
    <MuiButton
      {...rest}
      {...(color === 'gradient' || color === 'white' ? {} : { color })}
      variant={variant}
      sx={{
        fontWeight: 'bold',
        ...(color === 'gradient' && gradientStyles),
        ...(color === 'white' && whiteStyles),
      }}
    />
  );
};
