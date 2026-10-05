import { AddCircle } from '@mui/icons-material';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Tab,
  Tabs,
} from '@mui/material';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { useSearchParams } from 'react-router';

import { Button, Container } from '@/components';
import {
  Header,
  QuestionPanel,
  QuizInfo,
  type QuizDataWithCorrectOptions,
} from '@/containers';
import { AiGeneration } from '@/containers/CreateQuiz/AiGeneration';
import type { CreateQuizPayload } from '@/containers/CreateQuiz/Header/Header.types';
import { QUESTION_TYPES } from '@/containers/CreateQuiz/QuestionPanel/QuestionPanel.config';
import { QuizProvider, useQuizContext } from '@/context';

export type CreateQuizProps = {
  quizData?: QuizDataWithCorrectOptions;
};

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

const CreateQuiz = ({ quizData }: CreateQuizProps) => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<number>(
    searchParams.get('mode') === 'ai' ? 1 : 0,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<CreateQuizPayload | null>(
    null,
  );
  const { quizInfo, questions, addQuestion, initCreateForm } = useQuizContext();
  const isQuestionAdded = useRef<boolean>(false);
  const maxOrder = useRef<number>(0);

  useEffect(() => {
    if (quizData) {
      const maxOrderInData = quizData.questions.reduce(
        (maxOrder, current) => Math.max(maxOrder, current.order),
        0,
      );
      maxOrder.current = maxOrderInData + 1;
      initCreateForm(quizData);
    }
  }, [quizData, initCreateForm]);

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
    if (!quizData && questions.length === 0 && !isQuestionAdded.current) {
      isQuestionAdded.current = true;

      addNewQuestion(maxOrder.current);
    }
  }, [questions, addNewQuestion, quizData]);

  const applyGeneratedQuiz = (data: CreateQuizPayload) => {
    initCreateForm({
      ...data,
      id: quizInfo.id,
      totalQuestions: data.questions.length,
      totalPoints: data.questions.reduce((total, q) => total + q.points, 0),
    });
    maxOrder.current = Math.max(...data.questions.map((q) => q.order)) + 1;
    isQuestionAdded.current = true;
    setGeneratedQuiz(null);
    setActiveTab(0);
  };

  const handleGenerated = (data: CreateQuizPayload) => {
    const hasContent =
      !!(
        quizInfo.title ||
        quizInfo.description ||
        quizInfo.category ||
        quizInfo.complexity ||
        quizInfo.duration
      ) ||
      questions.some(
        (q) => q.questionText || q.options.some((o) => o.label || o.checked),
      );
    if (hasContent) setGeneratedQuiz(data);
    else applyGeneratedQuiz(data);
  };

  return (
    <Stack gap={12} style={{ padding: 24 }} alignItems="center">
      <Container width="100%">
        <Header
          isEditing={!!quizData}
          disabled={isGenerating || !!generatedQuiz}
        />
        <Tabs
          value={activeTab}
          sx={{ mb: 20 }}
          onChange={(_e, index) => setActiveTab(index)}
        >
          <Tab label="Manual Creation" disabled={isGenerating} />
          <Tab label="AI Generation" disabled={isGenerating} />
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
          <AiGeneration
            onGenerated={handleGenerated}
            onBusyChange={setIsGenerating}
          />
        </TabPanel>
        <Dialog open={!!generatedQuiz} onClose={() => setGeneratedQuiz(null)}>
          <DialogTitle>Replace the current quiz content?</DialogTitle>
          <DialogContent>
            The generated quiz will replace the questions and details currently
            in the editor. Nothing is saved until you choose Save Draft or
            Publish Quiz.
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={() => setGeneratedQuiz(null)}>
              Keep Current Quiz
            </Button>
            <Button
              onClick={() => generatedQuiz && applyGeneratedQuiz(generatedQuiz)}
            >
              Use Generated Quiz
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Stack>
  );
};

export const CreateQuizWithProvider = ({ quizData }: CreateQuizProps) => (
  <QuizProvider>
    <CreateQuiz quizData={quizData} />
  </QuizProvider>
);
