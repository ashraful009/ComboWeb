import { useState, useEffect, useCallback } from 'react';

export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiClient = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `/api${endpoint}`;
  
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...options, headers });
  
  let data: { success: boolean; data?: unknown; error?: { code: string; message: string; fieldErrors?: Record<string, string> } };
  try {
    data = await response.json();
  } catch {
    throw new ApiError('NETWORK_ERROR', 'Failed to parse response from server.');
  }

  if (!data.success) {
    throw new ApiError(
      data.error?.code || 'UNKNOWN_ERROR',
      data.error?.message || 'An unknown error occurred.',
      data.error?.fieldErrors
    );
  }

  return data.data as T;
};

export function useFetch<T>(endpoint: string, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient<T>(endpoint, options);
      setData(result);
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError('UNKNOWN_ERROR', String(err)));
    } finally {
      setLoading(false);
    }
  }, [endpoint]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
