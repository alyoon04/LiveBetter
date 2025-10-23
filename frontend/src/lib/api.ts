// API client for LiveBetter backend
import axios from 'axios';
import type { RankRequest, RankResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

export const rankMetros = async (request: RankRequest): Promise<RankResponse & { _responseTime?: number }> => {
  const startTime = performance.now();
  const response = await api.post<RankResponse>('/api/rank', request);
  const endTime = performance.now();
  const responseTime = Math.round(endTime - startTime);

  return {
    ...response.data,
    _responseTime: responseTime,
  };
};

export const healthCheck = async (): Promise<{ status: string; version: string }> => {
  const response = await api.get('/health');
  return response.data;
};
