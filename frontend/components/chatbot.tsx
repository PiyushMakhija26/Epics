"use client";

import React, { useState } from 'react';

type Message = { role: 'user' | 'assistant'; text: string };

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const apiBase = process.env.NEXT_PUBLIC_API_URL || '';

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', text: input };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`${apiBase}/api/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const botReply = data?.reply?.trim() || (data.data && JSON.stringify(data.data)) || 'No response received';
      const botMsg: Message = { role: 'assistant', text: botReply };
      setMessages((m) => [...m, botMsg]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to reach chatbot';
      setMessages((m) => [...m, { role: 'assistant', text: `❌ Error: ${msg}` }]);
      console.error('Chatbot error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 flex items-center justify-center text-xl"
          title="Open chat"
        >
          💬
        </button>
      )}
      
      {isOpen && (
        <div className="w-96 bg-white border border-gray-200 rounded-lg shadow-2xl flex flex-col max-h-96">
          <div className="p-4 border-b bg-blue-600 text-white rounded-t-lg flex justify-between items-center">
            <strong>CivicServe Assistant</strong>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:opacity-75"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 p-4 overflow-auto space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-gray-500">👋 Hi! Ask me anything about CivicServe, registration, or how to use the platform.</p>
            )}
            {messages.map((m, idx) => (
              <div key={idx} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div className={`inline-block px-4 py-2 rounded-lg text-sm max-w-xs ${m.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-left">
                <div className="inline-block px-4 py-2 rounded-lg bg-gray-100 text-gray-800">
                  <span className="text-sm">⏳ Thinking...</span>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border-t flex gap-2">
            <input
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !isLoading) sendMessage(); }}
              placeholder="Type a message..."
              disabled={isLoading}
            />
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700 text-sm font-medium"
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
