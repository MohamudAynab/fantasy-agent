import { Router } from 'express';
import { z } from 'zod';
import { analyzeTrade } from '../services/trades';

const router = Router();

const TradeSchema = z.object({
  give: z.array(z.string().min(1)).min(1),
  receive: z.array(z.string().min(1)).min(1),
});

router.post('/analyze', async (req, res) => {
  const parsed = TradeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'validation_error', message: parsed.error.message } });
  }
  try {
    const data = await analyzeTrade(parsed.data.give, parsed.data.receive);
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'trade_error', message: e.message } });
  }
});

export default router;
