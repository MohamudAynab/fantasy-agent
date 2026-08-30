import express from 'express';
import request from 'supertest';
import tradeRouter from '../routes/trades';
import chatRouter from '../routes/chat';
import authRouter from '../routes/auth';
import draftRouter from '../routes/draft';

jest.mock('../services/trades', () => ({
  analyzeTrade: jest.fn().mockResolvedValue({
    verdict: 'neutral',
    summary: 'test',
    give: [],
    receive: [],
  }),
}));

jest.mock('../services/chat', () => ({
  chat: jest.fn().mockResolvedValue('test reply'),
}));

jest.mock('../services/espn', () => ({
  setCredentials: jest.fn(),
  isAuthenticated: jest.fn().mockReturnValue(false),
}));

jest.mock('../services/draft', () => ({
  getDraftRecommendation: jest.fn().mockResolvedValue({
    available: [],
    suggested: [],
    reasoning: 'test',
  }),
}));

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/trades', tradeRouter);
  app.use('/api/chat', chatRouter);
  app.use('/auth', authRouter);
  app.use('/api/draft', draftRouter);
  return app;
}

describe('POST /api/trades/analyze', () => {
  const app = makeApp();

  it('rejects missing give array', async () => {
    const res = await request(app).post('/api/trades/analyze').send({ receive: ['Player B'] });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects empty give array', async () => {
    const res = await request(app).post('/api/trades/analyze').send({ give: [], receive: ['Player B'] });
    expect(res.status).toBe(400);
  });

  it('accepts valid trade payload', async () => {
    const res = await request(app)
      .post('/api/trades/analyze')
      .send({ give: ['Player A'], receive: ['Player B'] });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.verdict).toBe('neutral');
  });
});

describe('POST /api/chat', () => {
  const app = makeApp();

  it('rejects empty message', async () => {
    const res = await request(app).post('/api/chat').send({ message: '' });
    expect(res.status).toBe(400);
  });

  it('rejects history longer than 20 items', async () => {
    const history = Array.from({ length: 21 }, (_, i) => ({
      role: 'user' as const,
      content: `msg ${i}`,
      timestamp: new Date().toISOString(),
    }));
    const res = await request(app).post('/api/chat').send({ message: 'hi', history });
    expect(res.status).toBe(400);
  });

  it('accepts valid chat request', async () => {
    const res = await request(app).post('/api/chat').send({ message: 'Who should I start?' });
    expect(res.status).toBe(200);
    expect(res.body.data.reply).toBe('test reply');
  });
});

describe('POST /auth/espn', () => {
  const app = makeApp();

  it('rejects a request missing required fields', async () => {
    const res = await request(app).post('/auth/espn').send({ swid: '{ABC}' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('accepts a complete credentials payload', async () => {
    const res = await request(app).post('/auth/espn').send({
      swid: '{ABC}',
      espnS2: 'cookie-value',
      leagueId: '1991826081',
      teamId: '10',
      seasonId: '2026',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.authenticated).toBe(true);
  });
});

describe('POST /api/draft/board', () => {
  const app = makeApp();

  it('rejects non-array fields', async () => {
    const res = await request(app).post('/api/draft/board').send({ draftedPlayerIds: 'not-an-array', myPicks: [] });
    expect(res.status).toBe(400);
  });

  it('accepts a valid draft board request', async () => {
    const res = await request(app).post('/api/draft/board').send({ draftedPlayerIds: [], myPicks: [] });
    expect(res.status).toBe(200);
    expect(res.body.data.reasoning).toBe('test');
  });
});
