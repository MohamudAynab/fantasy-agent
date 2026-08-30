import { Router } from 'express';
import { z } from 'zod';
import { getDraftRecommendation } from '../services/draft';

const router = Router();

const DraftBoardSchema = z.object({
  draftedPlayerIds: z.array(z.string()),
  myPicks: z.array(z.string()),
});

router.post('/board', async (req, res) => {
  const parsed = DraftBoardSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'validation_error', message: parsed.error.message } });
  }
  try {
    const data = await getDraftRecommendation(parsed.data.draftedPlayerIds, parsed.data.myPicks);
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'draft_error', message: e.message } });
  }
});

export default router;
