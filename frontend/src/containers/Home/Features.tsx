import {
  AccessTime,
  AddCircle,
  Devices,
  Email,
  EmojiEvents,
  FormatListBulleted,
  Group,
  Insights,
  ManageAccounts,
  School,
} from '@mui/icons-material';
import { Box, Card as MuiCard, Stack, Typography } from '@mui/material';
import { type PropsWithChildren, type ReactNode } from 'react';

import { Container } from '@/components';
import { pxToRem } from '@/utils';

const CardHeading = ({ text, icon }: { text: string; icon: ReactNode }) => (
  <Box display="flex" gap={10}>
    {icon}
    <Typography component="h3" variant="h6">
      {text}
    </Typography>
  </Box>
);

const Card = ({
  children,
  hoverColor,
}: PropsWithChildren<{ hoverColor: string }>) => (
  <MuiCard
    sx={{
      padding: pxToRem(32),
      border: '1px solid #26364b',
      borderRadius: pxToRem(16),
      background: '#0F172A',
      display: 'flex',
      gap: 12,
      flexDirection: 'column',
      minWidth: pxToRem(290),

      '&:hover': { borderColor: hoverColor },
    }}
  >
    {children}
  </MuiCard>
);

const CardItem = ({ text, icon }: { text: string; icon: ReactNode }) => (
  <Box display="flex" alignItems="center" gap={6}>
    {icon}
    <Typography sx={{ fontSize: 'smaller' }}>{text}</Typography>
  </Box>
);

export const Features = () => {
  return (
    <Box
      id="features"
      display="flex"
      justifyContent="center"
      padding={80}
      bgcolor="#1E293B"
    >
      <Container display="flex" flexDirection="column" gap={60}>
        <Stack sx={{ textAlign: 'center', gap: 12 }}>
          <Typography component="h2" variant="h4">
            Powerful Features for Everyone
          </Typography>
          <Typography sx={{ opacity: 0.9 }}>
            Whether you're an admin or candidate, we've got you covered
          </Typography>
        </Stack>
        <Box
          display="flex"
          justifyContent="space-between"
          gap={32}
          marginBottom={80}
        >
          <Card hoverColor="#6366F1">
            <CardHeading
              icon={<ManageAccounts sx={{ color: '#6366F1', fontSize: 28 }} />}
              text="For Admins"
            />
            <Stack gap={6}>
              <CardItem
                text="Create unlimited quizzes"
                icon={<AddCircle sx={{ color: '#4ADE80', fontSize: 14 }} />}
              />
              <CardItem
                text="Invite candidates via email"
                icon={<Group sx={{ fontSize: 14, color: '#60A5FA' }} />}
              />
              <CardItem
                text="Track performance analytics"
                icon={<Insights sx={{ fontSize: 14, color: '#C084FC' }} />}
              />
              <CardItem
                text="Set time limits and deadlines"
                icon={<AccessTime sx={{ fontSize: 14, color: '#FB923C' }} />}
              />
            </Stack>
          </Card>
          <Card hoverColor="#8B5CF6">
            <CardHeading
              icon={<School sx={{ color: '#8B5CF6', fontSize: 28 }} />}
              text="For Candidates"
            />
            <Stack gap={6}>
              <CardItem
                text="Receive quiz invitations"
                icon={<Email sx={{ fontSize: 14, color: '#4ADE80' }} />}
              />
              <CardItem
                text="Browse public quizzes"
                icon={
                  <FormatListBulleted sx={{ fontSize: 14, color: '#60A5FA' }} />
                }
              />
              <CardItem
                text="View scores and rankings"
                icon={<EmojiEvents sx={{ fontSize: 14, color: '#FACC15' }} />}
              />
              <CardItem
                text="Take quizzes on any device"
                icon={<Devices sx={{ fontSize: 14, color: '#C084FC' }} />}
              />
            </Stack>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};
