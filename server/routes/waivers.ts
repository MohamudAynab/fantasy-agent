import { Router } from 'express';
import { getWaiverRecommendations } from '../services/waivers';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const data = await getWaiverRecommendations();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'waiver_error', message: e.message } });
  }
});

export default router;
