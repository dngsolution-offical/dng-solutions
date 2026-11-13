// src/hooks/useChatHistory.js
// LocalStorage-based chat history per user + agent
import { useState, useEffect, useCallback } from 'react';

const MAX_MESSAGES = 50;

export function useChatHistory(uid, agentId = 'default') {
  const storageKey = uid ? `dng_chat_${uid}_${agentId}` : null;

  const [messages, setMessages] = useState(() => {
    if (!storageKey) return [];
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist on change
  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages.slice(-MAX_MESSAGES)));
    } catch (e) {
      console.warn('[useChatHistory] save failed:', e.message);
    }
  }, [messages, storageKey]);

  const addMessage = useCallback((msg) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  const clear = useCallback(() => {
    setMessages([]);
    if (storageKey) {
      try { localStorage.removeItem(storageKey); } catch {}
    }
  }, [storageKey]);

  return { messages, setMessages, addMessage, clear };
}