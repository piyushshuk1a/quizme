import { Stack, Tab, Tabs } from '@mui/material';
import { useState, type PropsWithChildren } from 'react';

import { Container } from '@/components';
import { Header, QuestionPanel, QuizInfo } from '@/containers';

const TabPanel = ({
  index,
  active,
  children,
}: PropsWithChildren<{ index: number; active: number }>) => {
  return (
    <div role="tabpanel" hidden={index != active}>
      {index === active ? children : null}
    </div>
  );
};

export const CreateQuiz = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  return (
    <Stack gap={12} style={{ padding: 24 }} alignItems="center">
      <Container width="100%">
        <Header />
        <Tabs
          value={activeTab}
          sx={{ mb: 20 }}
          onChange={(_e, index) => setActiveTab(index)}
        >
          <Tab label="Manual Creation" />
          <Tab label="AI Generation" />
        </Tabs>
        <TabPanel active={activeTab} index={0}>
          <Stack gap={24}>
            <QuizInfo />
            <QuestionPanel order={0} />
          </Stack>
        </TabPanel>
        <TabPanel active={activeTab} index={1}>
          <h3>Tab Panel</h3>
        </TabPanel>
      </Container>
    </Stack>
  );
};
