import express from 'express';
const router = express.Router();

// POST /api/chatbot
// Body: { message: string }
// This route proxies a message to a configured generative API (Gemini or other)
// The implementation reads `GEMINI_API_KEY` and optional `GENERATIVE_API_URL`
// from env. For security, do NOT commit your API key to source control.

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Missing message in request body' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log('[Chatbot] No API key, using demo mode');
      const demoReply = getDemoResponse(message);
      return res.json({ reply: demoReply, isDemoMode: true });
    }

    // Try multiple model endpoints in order of preference
    const models = [
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite', 
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-pro',
    ];

    let reply = null;
    let lastError = null;

    for (const model of models) {
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        console.log(`[Chatbot] Trying model: ${model}`);

        const payload = {
          contents: [
            {
              parts: [
                {
                  text: message,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        };

        const resp = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const responseData: any = await resp.json();

        if (resp.ok && responseData?.candidates?.[0]?.content?.parts?.[0]?.text) {
          reply = responseData.candidates[0].content.parts[0].text;
          console.log(`[Chatbot] ✓ Success with ${model}!`);
          res.json({ reply, data: responseData, model });
          return;
        } else {
          lastError = responseData?.error?.message || `Status ${resp.status}`;
          console.log(`[Chatbot] ✗ ${model} failed: ${lastError}`);
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'Unknown error';
        console.log(`[Chatbot] ✗ ${model} error: ${lastError}`);
      }
    }

    // All models failed, use demo mode
    console.log(`[Chatbot] All API models exhausted, using demo mode`);
    const demoReply = getDemoResponse(message);
    res.json({
      reply: demoReply,
      isDemoMode: true,
      error: `API unavailable. Using demo mode.`
    });
  } catch (err) {
    console.error('[Chatbot] Outer catch error:', err);
    const message = (req.body?.message || 'hello').toString();
    const demoReply = getDemoResponse(message);
    res.json({ 
      reply: demoReply, 
      isDemoMode: true,
      error: err instanceof Error ? err.message : 'Error' 
    });
  }
});

// Demo responses for when API is unavailable
function getDemoResponse(message: string): string {
  const msg = message.toLowerCase();
  
  if (msg.includes('how') || msg.includes('help') || msg.includes('what')) {
    return 'CivicServe is a platform to report and track civic service requests like water, electricity, sanitation, and medical issues. You can file requests, track their status, and rate the services received.';
  }
  if (msg.includes('register') || msg.includes('sign up')) {
    return 'To register, click Sign Up, select your role (Citizen or Authority), enter your email and password, provide your location, and set security questions.';
  }
  if (msg.includes('request') || msg.includes('file')) {
    return 'You can file a service request by logging in, selecting a category (Electricity, Water, Sanitation, Medical, Services, or Others), describing the issue, and submitting.';
  }
  if (msg.includes('status') || msg.includes('track')) {
    return 'You can track your requests in your dashboard. Each request shows its current status (raised, assigned, in progress, or completed).';
  }
  if (msg.includes('password') || msg.includes('forgot')) {
    return 'Click "Forgot Password" on the login page, answer your security questions, and set a new password.';
  }
  
  return 'I\'m a demo chatbot. I can help you with: how to use CivicServe, registration, filing requests, tracking status, or resetting your password. What would you like to know?';
}

export default router;
