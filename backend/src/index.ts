import cors from 'cors';
import 'dotenv/config';
import express from 'express';

import { config } from '@/config';
import { userRoutes } from '@/routes';

const app = express();

app.use(
  cors({
    origin: ['http://localhost:5173'],
  }),
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});
app.use('/api/users', userRoutes);

app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
});
