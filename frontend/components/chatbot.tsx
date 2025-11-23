"use client";

import React, { useState, useEffect, useRef } from 'react';

type Message = { role: 'user' | 'assistant'; text: string; timestamp?: Date };

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const apiBase = process.env.NEXT_PUBLIC_API_URL || '';

  // Extract user_id from JWT token stored in localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const decoded = JSON.parse(atob(parts[1]));
          if (decoded.sub) {
            setUserId(decoded.sub);
          }
        }
      } catch (err) {
        console.warn('Could not decode JWT:', err);
      }
    }
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { role: 'user', text: input, timestamp: new Date() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Send message with user_id for conversation context
      const payload: any = { message: userMsg.text };
      if (userId) {
        payload.user_id = userId;
      }

      const res = await fetch(`${apiBase}/api/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const botReply = data?.reply?.trim() || (data.data && JSON.stringify(data.data)) || 'No response received';
      const botMsg: Message = { role: 'assistant', text: botReply, timestamp: new Date() };
      setMessages((m) => [...m, botMsg]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to reach chatbot';
      setMessages((m) => [...m, { role: 'assistant', text: `❌ Error: ${msg}`, timestamp: new Date() }]);
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
          className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 flex items-center justify-center text-2xl transition-all hover:scale-110"
          title="Open CivicServe Assistant"
        >
          💬
        </button>
      )}
      
      {isOpen && (
        <div className="w-96 bg-white border border-gray-200 rounded-lg shadow-2xl flex flex-col max-h-[500px] animate-fadeIn">
          {/* Header */}
          <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg flex justify-between items-center">
            <div>
              <strong className="text-lg">CivicServe Assistant</strong>
              <p className="text-xs text-blue-100 mt-1">Online • Always here to help</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:opacity-75 text-xl transition"
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-auto space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <p className="text-2xl mb-2">👋</p>
                <p className="text-sm font-medium">Hi! I'm here to help.</p>
                <p className="text-xs mt-2">Ask me about:</p>
                <ul className="text-xs mt-2 space-y-1">
                  <li>📝 Filing requests</li>
                  <li>🔍 Tracking status</li>
                  <li>⭐ Rating services</li>
                  <li>🔑 Account help</li>
                </ul>
              </div>
            )}
            {messages.map((m, idx) => (
              <div key={idx} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div
                  className={`inline-block px-4 py-2 rounded-lg text-sm max-w-xs break-words whitespace-pre-wrap transition-all ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                      : 'bg-gray-200 text-gray-900 rounded-bl-none shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-left">
                <div className="inline-block px-4 py-2 rounded-lg bg-gray-200 text-gray-800 rounded-bl-none">
                  <span className="text-sm">✨ Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t bg-white rounded-b-lg flex gap-2">
            <input
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !isLoading) sendMessage(); }}
              placeholder="Type your question..."
              disabled={isLoading}
            />
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700 text-sm font-medium transition active:scale-95"
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

