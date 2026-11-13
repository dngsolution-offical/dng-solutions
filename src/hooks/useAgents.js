import { useState, useEffect } from 'react';

const CACHE_KEY = 'dng_agents_cache_v2';
const CACHE_TTL = 5 * 60 * 1000;

export default function useAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL && Array.isArray(data)) {
          setAgents(data); setLoading(false);
        }
      } catch {}
    }
    fetch('/api/agent/list')
      .then(r => r.json())
      .then(d => {
        if (d.ok && Array.isArray(d.agents)) {
          setAgents(d.agents);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data: d.agents, ts: Date.now() }));
        } else setError(d.error || 'Failed to load');
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { agents, loading, error };
}