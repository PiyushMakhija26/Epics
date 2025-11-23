import express from 'express';
import { ConversationMessage } from '../db/models';

const router = express.Router();

// POST /api/chatbot
// Body: { message: string, user_id?: string }
// Proxies message to Gemini with conversation history context
router.post('/', async (req, res) => {
  try {
    const { message, user_id } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Missing message in request body' });
    }

    // Retrieve conversation history (last 10 messages) for context if user_id provided
    let conversationContext = '';
    if (user_id) {
      try {
        const history = await ConversationMessage.find({ user_id })
          .sort({ created_at: -1 })
          .limit(10);
        
        // Build context string from recent messages (oldest first)
        if (history.length > 0) {
          conversationContext = '\n\nRecent conversation:\n';
          history.reverse().forEach((msg) => {
            const role = msg.role === 'user' ? 'User' : 'Assistant';
            conversationContext += `${role}: ${msg.message}\n`;
          });
        }
      } catch (err) {
        console.warn('[Chatbot] Could not retrieve conversation history:', err);
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    // Try LLM if API key available
    if (apiKey) {
      const systemPrompt = `You are CivicServe Expert Assistant — a knowledgeable, friendly, and professional helper for the CivicServe civic issue reporting platform.

Your responsibilities:
- Help users report and track civic issues (water, electricity, sanitation, medical, public services, etc.)
- Guide users through registration, login, and account management
- Explain how to file requests, track status, rate services, and request changes
- Provide clear, step-by-step instructions
- Be empathetic and supportive

Guidelines:
- Provide detailed, thorough answers (aim for 2-4 sentences minimum, longer when appropriate)
- Include numbered steps for multi-step processes
- Offer examples when helpful
- Ask clarifying questions if information is unclear
- Be conversational but professional
- If a user asks about multiple topics, address each one clearly
- Suggest next actions the user can take
- For technical issues, provide troubleshooting steps`;

      const models = ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'];

      for (const model of models) {
        try {
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          console.log(`[Chatbot] Trying model: ${model}`);

          const userPrompt = `${systemPrompt}${conversationContext}\n\nUser: ${message}`;

          const payload = {
            contents: [
              {
                parts: [{ text: userPrompt }],
              },
            ],
            generationConfig: {
              temperature: 0.7, // Higher for more conversational tone
              topK: 50,
              topP: 0.9,
              maxOutputTokens: 1500, // Allow longer responses
            },
          };

          const resp = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          const responseData: any = await resp.json();
          const textReply = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;

          if (resp.ok && textReply) {
            console.log(`[Chatbot] ✓ Success with ${model}`);

            // Store both user and assistant messages in history if user_id provided
            if (user_id) {
              try {
                await ConversationMessage.create([
                  { user_id, role: 'user', message },
                  { user_id, role: 'assistant', message: textReply },
                ]);
              } catch (err) {
                console.warn('[Chatbot] Could not save conversation history:', err);
              }
            }

            return res.json({ reply: textReply, model, isDemoMode: false });
          }
          console.log(`[Chatbot] ${model} returned no text, trying next`);
        } catch (err) {
          console.warn('[Chatbot] model error:', err instanceof Error ? err.message : err);
        }
      }

      console.log('[Chatbot] All LLM models failed, falling back to demo mode');
    }

    // Demo mode fallback
    const demoReply = getDemoResponse(message);
    
    if (user_id) {
      try {
        await ConversationMessage.create([
          { user_id, role: 'user', message },
          { user_id, role: 'assistant', message: demoReply },
        ]);
      } catch (err) {
        console.warn('[Chatbot] Could not save demo conversation to history:', err);
      }
    }

    res.json({ reply: demoReply, isDemoMode: true });
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

// Demo responses for when API is unavailable — expanded and more detailed
function getDemoResponse(message: string): string {
  const msg = message.toLowerCase();
  
  if (msg.includes('how') && msg.includes('use')) {
    return `CivicServe is a comprehensive platform designed to empower citizens to report and track civic service issues efficiently. Here's how it works:

1. **Register/Login**: Create an account with your email, set a password, and provide your location details.
2. **File a Request**: Navigate to "Raise Request," select a category (Electricity, Water, Sanitation, Medical, Public Services, or Other), describe the issue with details, and submit.
3. **Track Status**: View all your requests in your dashboard. Admins will assign specialists and update the status as they work on your issue.
4. **Rate & Provide Feedback**: Once completed, rate the service (Excellent, Good, or Request Changes).
5. **Request Changes**: If you need modifications to your request or aren't satisfied, you can request changes and discuss with the assigned admin.

Is there a specific part of the process you'd like to know more about?`;
  }

  if (msg.includes('register') || msg.includes('sign up')) {
    return `To register with CivicServe, follow these steps:

1. Click on **Sign Up** on the homepage.
2. Choose your role: **Citizen** (to report issues) or **Authority** (to manage issues).
3. Enter a valid email address and create a strong password.
4. Fill in your profile: full name, phone number, select your state and city.
5. Set **security questions** (for password recovery).
6. Click **Create Account**.

You'll then log in with your credentials. Is there anything specific about registration that's unclear?`;
  }

  if (msg.includes('request') && msg.includes('file')) {
    return `Here's how to file a service request on CivicServe:

1. Log in to your account.
2. Go to **User Dashboard** → **Raise Request**.
3. Fill in the form:
   - **Title**: A brief summary (e.g., "Broken water pipe on Main Street")
   - **Description**: Detailed explanation of the issue
   - **Category**: Choose from Electricity, Water, Sanitation, Medical, Public Services, or Other
   - **Location**: Confirm your city or select a nearby location
   - **Priority**: Mark as low, medium, high, or critical (based on urgency)
4. Optionally attach photos/documents.
5. Click **Submit Request**.

Your request will be assigned to a specialist who will work on resolving it. You'll receive updates on the status. What category of issue do you need to report?`;
  }

  if (msg.includes('status') || msg.includes('track')) {
    return `To track your requests in CivicServe:

1. Log in to your account.
2. Navigate to **User Dashboard** → **My Requests** (or **Raise Request** page).
3. You'll see a list of all your requests with their current status:
   - **Raised**: Your request has been submitted and is waiting to be assigned.
   - **Assigned**: A specialist has been assigned to your request.
   - **In Progress**: The specialist is actively working on resolving your issue.
   - **Completed**: The work has been finished and your request is marked done.
   - **Closed**: The request has been finalized.

Click on any request to view full details, see status history, and leave comments. Once a request is completed, you can rate the service. Would you like help with anything else?`;
  }

  if (msg.includes('password') || msg.includes('forgot') || msg.includes('reset')) {
    return `If you've forgotten your password, here's how to reset it:

1. Go to the login page and click **Forgot Password**.
2. You'll be asked to answer your **security questions** (the ones you set during registration).
3. Once verified, you can enter a **new password**. Make it strong (mix of letters, numbers, and symbols).
4. Confirm your new password and click **Reset**.
5. Return to the login page and log in with your new credentials.

If you can't remember your security answers, contact the support team. They'll help verify your identity and reset your account.`;
  }

  if (msg.includes('rating') || msg.includes('rate') || msg.includes('feedback')) {
    return `Once your request is completed, you can rate the service and provide feedback:

1. Go to **User Dashboard** → **My Requests**.
2. Find the completed request and click to view details.
3. You'll see a **Rate Request** button or form.
4. Choose a rating:
   - **Excellent**: The issue was resolved perfectly and you're very satisfied.
   - **Good**: The issue was resolved but there's room for improvement.
   - **Open Again**: You're not satisfied; the issue needs more work.
5. Optionally add comments explaining your rating.
6. Submit your feedback.

Your feedback helps admins and specialists improve their service. Thank you for helping CivicServe improve!`;
  }

  if (msg.includes('change') || msg.includes('modify') || msg.includes('edit')) {
    return `If you need to make changes to a request or aren't satisfied with the result:

1. Go to **User Dashboard** → **My Requests**.
2. Find the request you want to modify.
3. Look for **Request Changes** button.
4. Describe what changes or clarifications you need.
5. Submit your change request.
6. An admin will review your request and either:
   - **Approve**: Grant you edit rights to modify the request details.
   - **Reject**: Provide feedback on why changes can't be made.

If approved, you'll be able to edit the original request. This helps ensure your issue gets the right attention!`;
  }

  return `Hi there! 👋 I'm the CivicServe Assistant. I can help you with:

• **How to use CivicServe** — platform overview and getting started
• **Registration & Login** — creating and securing your account
• **Filing a request** — reporting civic issues step-by-step
• **Tracking status** — monitoring your requests
• **Rating & Feedback** — sharing your experience
• **Password reset** — recovering your account
• **Requesting changes** — modifying requests after submission

What would you like help with today?`;
}

export default router;

