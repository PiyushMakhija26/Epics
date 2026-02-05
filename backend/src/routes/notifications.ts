import { Router, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { subscribeSSE, sendNotificationToUser, sendAlarmToAdmins } from '../utils/notifications';
import { Profile } from '../db/models';

const router = Router();

// SSE endpoint for notifications - client should provide userId via token (authMiddleware sets req.user)
router.get('/sse', authMiddleware, (req: any, res: Response) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  subscribeSSE(userId, res);
});

// Send a notification to a specific user (admin or system)
router.post('/send', authMiddleware, async (req: any, res: Response) => {
  try {
    const { user_id, title, message, type } = req.body;
    if (!title || !message) return res.status(400).json({ error: 'title and message required' });

    await sendNotificationToUser(user_id, title, message, type || 'info');
    res.json({ message: 'Notification queued' });
  } catch (err) {
    console.error('Send notification error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Urgent alarm endpoint - broadcasts to all admins
router.post('/alarms', authMiddleware, async (req: any, res: Response) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) return res.status(400).json({ error: 'title and message required' });

    await sendAlarmToAdmins(title, message);
    res.json({ message: 'Alarm sent to admins' });
  } catch (err) {
    console.error('Alarm error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get admin list (for frontend) - basic profile
router.get('/admins', authMiddleware, async (_req: any, res: Response) => {
  try {
    const admins = await Profile.find({ user_type: 'admin' }).select('user_id full_name email department').lean();
    res.json({ data: admins });
  } catch (err) {
    console.error('Error fetching admins', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
