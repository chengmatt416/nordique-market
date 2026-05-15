'use client';

import { useState, useEffect, useCallback } from 'react';

// Check if Firebase API routes are responding
// Falls back gracefully so the app always shows something
export function useFirebaseStatus() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'not-configured'>('loading');

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/products', { signal: AbortSignal.timeout(3000) });
        if (res.ok || res.status === 404) {
          setStatus('connected');
        } else {
          setStatus('not-configured');
        }
      } catch {
        setStatus('not-configured');
      }
    };
    check();
  }, []);

  return status;
}

// Generic data-fetching hook for API routes
export function useApi<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}