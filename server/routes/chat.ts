import { Router } from 'express';
import { z } from 'zod';
import { chat } from '../services/chat';

const router = Router();

const ChatSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    timestamp: z.string(),
  })).max(20).default([]),
});

router.post('/', async (req, res) => {
  const parsed = ChatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'validation_error', message: parsed.error.message } });
  }
  try {
    const reply = await chat(parsed.data.message, parsed.data.history);
    res.json({ success: true, data: { reply } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'chat_error', message: e.message } });
  }
});

export default router;
