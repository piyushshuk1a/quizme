import { AddCircle } from '@mui/icons-material';
import { Box, Stack, Tab, Tabs } from '@mui/material';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import { Button, Container } from '@/components';
import { Header, QuestionPanel, QuizInfo } from '@/containers';
import { QUESTION_TYPES } from '@/containers/CreateQuiz/QuestionPanel/QuestionPanel.config';
import { QuizProvider, useQuizContext } from '@/context';

export const TabPanel = ({
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

const CreateQuiz = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const { questions, addQuestion } = useQuizContext();
  const isQuestionAdded = useRef<boolean>(false);
  const maxOrder = useRef<number>(0);

  const addNewQuestion = useCallback(
    (order: number) => {
      addQuestion({
        order,
        options: [
          { id: '1', label: '', checked: false },
          { id: '2', label: '', checked: false },
        ],
        points: '1',
        questionText: '',
        questionType: QUESTION_TYPES.singleSelect,
      });

      // Keep track of the maximum value to ensure unique order
      maxOrder.current++;
    },
    [addQuestion],
  );

  useEffect(() => {
    if (questions.length === 0 && !isQuestionAdded.current) {
      isQuestionAdded.current = true;

      addNewQuestion(maxOrder.current);
    }
  }, [questions, addNewQuestion]);

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
            {questions.map((q, index) => (
              <QuestionPanel key={q.order} order={q.order} index={index} />
            ))}
            <Box display="flex" justifyContent="flex-end">
              <Button
                color="gradient"
                startIcon={<AddCircle />}
                onClick={() => addNewQuestion(maxOrder.current)}
              >
                Add New Question
              </Button>
            </Box>
          </Stack>
        </TabPanel>
        <TabPanel active={activeTab} index={1}>
          <h3>Tab Panel</h3>
        </TabPanel>
      </Container>
    </Stack>
  );
};

export const CreateQuizWithProvider = () => (
  <QuizProvider>
    <CreateQuiz />
  </QuizProvider>
);
