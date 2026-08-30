import { Router } from 'express';
import { optimizeLineup } from '../services/lineup';

const router = Router();

router.get('/optimize', async (_req, res) => {
  try {
    const data = await optimizeLineup();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'lineup_error', message: e.message } });
  }
});

export default router;
