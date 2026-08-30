import { Router } from 'express';
import { z } from 'zod';
import { setCredentials, isAuthenticated } from '../services/espn';

const router = Router();

const EspnCredentialsSchema = z.object({
  swid: z.string().min(1),
  espnS2: z.string().min(1),
  leagueId: z.string().min(1),
  teamId: z.string().min(1),
  seasonId: z.string().min(1),
});

router.post('/espn', (req, res) => {
  const parsed = EspnCredentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'validation_error', message: parsed.error.message } });
  }
  try {
    setCredentials(parsed.data);
    res.json({ success: true, data: { authenticated: true } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'auth_failed', message: e.message } });
  }
});

router.get('/status', (_req, res) => {
  res.json({ success: true, data: { authenticated: isAuthenticated() } });
});

export default router;
