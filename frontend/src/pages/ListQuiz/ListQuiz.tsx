import { Box, Stack, Tab, Tabs } from '@mui/material';
import { useState } from 'react';

import { Container } from '@/components';
import { ListQuiz as ListQuizContainer } from '@/containers';

import { TabPanel } from '../CreateQuiz';

export const ListQuiz = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Stack width="100%" padding={24} alignItems="center">
      <Container width="100%">
        <Box width="100%">
          <Tabs
            value={activeTab}
            sx={{ mb: 20 }}
            onChange={(_e, index) => setActiveTab(index)}
          >
            <Tab label="Take a Quiz" />
            <Tab label="My Quizzes" />
          </Tabs>
          <TabPanel active={activeTab} index={0}>
            <ListQuizContainer />
          </TabPanel>
          <TabPanel active={activeTab} index={1}>
            <ListQuizContainer myQuizzes />
          </TabPanel>
        </Box>
      </Container>
    </Stack>
  );
};
