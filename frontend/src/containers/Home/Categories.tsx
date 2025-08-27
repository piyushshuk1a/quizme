import { BusinessCenter, Code, Palette, Science } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';

import { Container } from '@/components';
import { pxToRem } from '@/utils';

import type { ReactNode } from 'react';

export const Card = ({
  icon,
  color,
  title,
  subtitle,
}: {
  icon: ReactNode;
  color: string;
  title: string;
  subtitle: string;
}) => (
  <Box
    padding={pxToRem(24)}
    borderRadius={pxToRem(12)}
    bgcolor="#1E293B"
    sx={{ border: '1px solid #1E293B', '&:hover': { borderColor: color } }}
    gap={6}
  >
    {icon}
    <Typography>{title}</Typography>
    <Typography
      color="textDisabled"
      sx={{ fontSize: pxToRem(12), marginTop: 4 }}
    >
      {subtitle}
    </Typography>
  </Box>
);

export const Categories = () => {
  return (
    <Box display="flex" justifyContent="center" padding={pxToRem(48, 0)}>
      <Container>
        <Stack gap={12}>
          <Typography component="h2" variant="h4" align="center">
            Explore Quiz Categories
          </Typography>
          <Typography textAlign="center">
            Discover quizzes across various topics and subjects
          </Typography>
        </Stack>
        <Box display="flex" gap={16} justifyContent="center" marginTop={48}>
          <Card
            icon={<Code sx={{ color: '#6366F1' }} />}
            color="#6366F1"
            title="Technology"
            subtitle="Programming, AI, Web Development"
          />
          <Card
            icon={<Science sx={{ color: '#8B5CF6' }} />}
            color="#8B5CF6"
            title="Science"
            subtitle="Physics, Chemistry, Biology"
          />
          <Card
            icon={<BusinessCenter sx={{ color: '#4ADE80' }} />}
            color="#4ADE80"
            title="Business"
            subtitle="Management, Finance, Marketing"
          />
          <Card
            icon={<Palette sx={{ color: '#F472B6' }} />}
            color="#F472B6"
            title="Arts"
            subtitle="History, Liberation, Music"
          />
        </Box>
      </Container>
    </Box>
  );
};
