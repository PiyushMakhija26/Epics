const express = require('express');
const router = express.Router();

// Simple rule-based chatbot endpoint
// POST /api/chatbot
// body: { message: string }
router.post('/', (req, res) => {
  const { message } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid request: message is required' });
  }

  const text = message.trim().toLowerCase();

  // Basic rule responses
  if (text.includes('hello') || text.includes('hi')) {
    return res.json({ reply: 'Hello! How can I help you today?' });
  }

  if (text.includes('help')) {
    return res.json({ reply: 'You can ask about request status, how to raise a request, or who to contact.' });
  }

  if (text.includes('status')) {
    return res.json({ reply: 'To check status, go to your dashboard -> raised requests and search by request ID.' });
  }

  // Default echo-like reply
  return res.json({ reply: `I received: "${message}" — sorry, I\'m a simple bot and still learning.` });
});

// Health endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = router;
