import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchLiveSignal } from '../services/liveSignal';
import type { WorldSignal } from '../types';

const MAX_HISTORY = 24;

export interface LiveSignalState {
  signal: WorldSignal | null;
  history: WorldSignal[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  refresh: () => void;
}

/** 轮询拉取城市环境数据，保留历史用于展示波动 */
export function useLiveSignal(city: string, pollMs = 30_000): LiveSignalState {
  const [signal, setSignal] = useState<WorldSignal | null>(null);
  const [history, setHistory] = useState<WorldSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const busyRef = useRef(false);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!city || busyRef.current) return;
    busyRef.current = true;
    setLoading(prev => prev || signal === null);
    try {
      const next = await fetchLiveSignal(city);
      if (!mountedRef.current) return;
      setSignal(next);
      setHistory(prev => [...prev, next].slice(-MAX_HISTORY));
      setLastUpdated(Date.now());
      setError(null);
    } catch (e) {
      if (!mountedRef.current) return;
      setError(e instanceof Error ? e.message : '拉取实时数据失败');
    } finally {
      if (mountedRef.current) setLoading(false);
      busyRef.current = false;
    }
  }, [city, signal]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    setSignal(null);
    setHistory([]);
    setError(null);
    setLoading(true);
    void refresh();
  }, [city]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!city) return;
    const id = window.setInterval(() => void refresh(), pollMs);
    return () => window.clearInterval(id);
  }, [city, pollMs, refresh]);

  return { signal, history, loading, error, lastUpdated, refresh };
}
