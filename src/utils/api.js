// src/utils/api.js — Frontend API helper
import { auth } from '../firebase';

const API_BASE = '/api';

/**
 * Send AI request to backend.
 * @param {Object} params - { text, mode, image, files, toggleModes }
 * @returns {Promise<Object>} - { ok, data, error, ... }
 */
export async function callAI({ text, mode = 'text', image = null, files = null, toggleModes = [] }) {
  // Get Firebase ID token
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Please sign in first');
  }

  const idToken = await user.getIdToken();

  // Build body
  const body = { text, mode, idToken };
  if (image) body.image = image;
  if (files) body.files = files;
  if (toggleModes?.length) body.toggleModes = toggleModes;

  // Send request
  const res = await fetch(`${API_BASE}/parse-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  // Safe JSON parse
  const rawText = await res.text();
  if (!rawText) {
    throw new Error(`API returned empty response (status ${res.status}). Is api-server running?`);
  }

  let data;
  try {
    data = JSON.parse(rawText);
  } catch (parseErr) {
    console.error('[api] Invalid JSON:', rawText.slice(0, 200));
    throw new Error(`API returned invalid JSON: ${rawText.slice(0, 100)}`);
  }

  if (!res.ok || !data.ok) {
    const errorMsg = data.message || data.error || `HTTP ${res.status}`;
    throw new Error(errorMsg);
  }

  return data;
}