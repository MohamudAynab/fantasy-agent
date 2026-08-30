import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';

import authRouter from './routes/auth';
import lineupRouter from './routes/lineup';
import waiverRouter from './routes/waivers';
import tradeRouter from './routes/trades';
import injuryRouter from './routes/injuries';
import chatRouter from './routes/chat';
import pushRouter from './routes/push';
import draftRouter from './routes/draft';
import { startMonitor } from './jobs/monitor';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(helmet());
app.use(cors({ origin: ['http://localhost:8081', 'http://localhost:19006'] }));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 60 });
app.use('/api', limiter);

app.use('/auth', authRouter);
app.use('/api/lineup', lineupRouter);
app.use('/api/waivers', waiverRouter);
app.use('/api/trades', tradeRouter);
app.use('/api/injuries', injuryRouter);
app.use('/api/chat', chatRouter);
app.use('/api/push', pushRouter);
app.use('/api/draft', draftRouter);

app.listen(PORT, () => {
  console.log(`Fantasy Agent server running on http://localhost:${PORT}`);
  startMonitor();
});
