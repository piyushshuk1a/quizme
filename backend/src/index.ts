import cors from 'cors';
import 'dotenv/config';
import express from 'express';

import { config, FIRESTORE_COLLECTIONS } from '@/config';
import { db } from '@/firebase';
import { apiErrorHandler, apiNotFound } from '@/middlewares/apiErrors';
import { quizzesRoutes, userRoutes } from '@/routes';

const app = express();

app.use(cors());

// Quizzes may contain up to 100 long questions; the default 100kb limit
// rejected large (but valid) quiz payloads with HTTP 413.
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

app.use('/api/users', userRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api', apiNotFound);
app.use(apiErrorHandler);

app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
  db.collection(FIRESTORE_COLLECTIONS.users)
    .limit(1)
    .get()
    .then(() => {
      console.log('Firestore connection successful.');
    })
    .catch((error) => {
      console.error('Firestore connection error:', error);
    });
});
