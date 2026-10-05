import { Add, TipsAndUpdates } from '@mui/icons-material';
import { Box, Stack, Tab, Tabs } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { Button, Container } from '@/components';
import { ROUTES } from '@/constants';
import { ListQuiz as ListQuizContainer } from '@/containers';

import { TabPanel } from '../CreateQuiz';

const TAB_INDEX_TO_TAB_QUERY = {
  0: 'explore',
  1: 'myQuizzes',
  2: 'invitations',
};

const TAB_QUERY_TO_TAB_INDEX = {
  explore: 0,
  myQuizzes: 1,
  invitations: 2,
};

export const ListQuiz = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabQuery = searchParams.get(
    'tab',
  ) as keyof typeof TAB_QUERY_TO_TAB_INDEX;
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTabQuery) {
      setActiveTab(TAB_QUERY_TO_TAB_INDEX[activeTabQuery] ?? 0);
    }
  }, [activeTabQuery]);

  const handleTabChange = (index: number) => {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.set('tab', TAB_INDEX_TO_TAB_QUERY[index as 0 | 1 | 2]);
    setSearchParams(urlSearchParams);
  };

  return (
    <Stack width="100%" padding={24} pt={40} alignItems="center">
      <Container sx={{ position: 'relative' }} width="100%">
        {activeTab === 1 && (
          <Button
            sx={{ position: 'absolute', right: 0, zIndex: 1 }}
            startIcon={<Add />}
            onClick={() => navigate(ROUTES.createQuiz)}
          >
            Create New Quiz
          </Button>
        )}
        {activeTab === 0 && (
          <Button
            color="gradient"
            sx={{ position: 'absolute', right: 0, zIndex: 1 }}
            startIcon={<TipsAndUpdates />}
            onClick={() => navigate(`${ROUTES.createQuiz}?mode=ai`)}
          >
            AI-Powered Quiz
          </Button>
        )}
        <Box width="100%">
          <Tabs
            value={activeTab}
            sx={{ mb: 20, alignItems: 'center' }}
            onChange={(_e, index) => handleTabChange(index)}
          >
            <Tab label="Take a Quiz" />
            <Tab label="My Quizzes" />
            <Tab label="Invitation" />
          </Tabs>
          <TabPanel active={activeTab} index={0}>
            <ListQuizContainer />
          </TabPanel>
          <TabPanel active={activeTab} index={1}>
            <ListQuizContainer myQuizzes />
          </TabPanel>
          <TabPanel active={activeTab} index={2}>
            <ListQuizContainer invited />
          </TabPanel>
        </Box>
      </Container>
    </Stack>
  );
};
