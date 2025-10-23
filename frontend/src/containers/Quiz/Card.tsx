import { type CardProps, Card as MuiCard } from '@mui/material';

export const Card = ({ children, ...rest }: CardProps) => {
  return (
    <MuiCard
      {...rest}
      sx={{
        p: 16,
        background: '#1F2937',
        borderRadius: 2,
        width: '100%',
        ...rest?.sx,
      }}
      variant="outlined"
    >
      {children}
    </MuiCard>
  );
};
