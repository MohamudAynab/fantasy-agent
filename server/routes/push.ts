import { Router } from 'express';
import { z } from 'zod';
import { registerPushToken } from '../services/push';

const router = Router();

const RegisterBody = z.object({ token: z.string().min(1) });

router.post('/register', (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'token is required' } });
    return;
  }
  registerPushToken(parsed.data.token);
  res.json({ success: true });
});

export default router;
