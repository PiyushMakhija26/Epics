import { Response } from 'express';
import EventEmitter from 'events';
import { Notification, Profile } from '../db/models';
import { sendStatusUpdateEmail } from './email';

// Simple in-memory SSE broadcaster. Keys: user_id -> Set<Response>
const clients: Map<string, Set<Response>> = new Map();

export function subscribeSSE(userId: string, res: Response) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('\n');

  let set = clients.get(userId);
  if (!set) {
    set = new Set();
    clients.set(userId, set);
  }
  set.add(res);

  const onClose = () => {
    set!.delete(res);
    try { res.end(); } catch (e) {}
  };

  res.on('close', onClose);
  res.on('finish', onClose);
}

export async function sendNotificationToUser(userId: string | undefined, title: string, message: string, type: 'info' | 'alarm' | 'status' | 'system' = 'info') {
  // Persist notification
  await Notification.create({ user_id: userId, title, message, type });

  // Send email if user has email (for alarms/status)
  if (userId) {
    const profile = await Profile.findOne({ user_id: userId });
    if (profile?.email && (type === 'alarm' || type === 'status' || type === 'system')) {
      // reuse existing email helper
      await sendStatusUpdateEmail(profile.email, title, type, message);
    }
  }

  // Broadcast via SSE to connected clients
  if (userId) {
    const set = clients.get(userId);
    if (set) {
      const payload = `event: notification\ndata: ${JSON.stringify({ title, message, type })}\n\n`;
      for (const res of set) {
        try { res.write(payload); } catch (e) { /* ignore */ }
      }
    }
  } else {
    // Broadcast to all connected clients (admins)
    for (const [_, set] of clients) {
      for (const res of set) {
        try { res.write(`event: notification\ndata: ${JSON.stringify({ title, message, type })}\n\n`); } catch (e) {}
      }
    }
  }
}

export async function sendAlarmToAdmins(title: string, message: string) {
  // find admins and create notifications + email
  const admins = await Profile.find({ user_type: 'admin' }).lean();
  for (const a of admins) {
    await sendNotificationToUser(a.user_id, title, message, 'alarm');
  }
}

export default { subscribeSSE, sendNotificationToUser, sendAlarmToAdmins };
