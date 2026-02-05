'use client';

import { useState, useEffect } from 'react';

export function useAuthToken() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setToken(stored);
    setIsLoading(false);
  }, []);

  return { token, isLoading };
}
