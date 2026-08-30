import { Router } from 'express';
import { getInjuryReport } from '../services/injuries';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const data = await getInjuryReport();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'injury_error', message: e.message } });
  }
});

export default router;
