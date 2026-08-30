import axios from 'axios';
import type { ApiResponse, LineupRecommendation, WaiverRecommendations, TradeAnalysis, InjuryReport, AgentMessage, DraftRecommendation } from '../types';

const BASE_URL = __DEV__ ? 'http://localhost:3001' : 'https://your-production-url.com';

const http = axios.create({ baseURL: BASE_URL, timeout: 30000 });

http.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error?.message ?? err.message;
    return Promise.reject(new Error(message));
  }
);

export async function getAuthStatus(): Promise<{ authenticated: boolean }> {
  const { data } = await http.get<ApiResponse<{ authenticated: boolean }>>('/auth/status');
  return data.data!;
}

export interface EspnCredentials {
  swid: string;
  espnS2: string;
  leagueId: string;
  teamId: string;
  seasonId: string;
}

export async function connectEspn(credentials: EspnCredentials): Promise<void> {
  await http.post('/auth/espn', credentials);
}

export async function getLineupRecommendation(): Promise<LineupRecommendation> {
  const { data } = await http.get<ApiResponse<LineupRecommendation>>('/api/lineup/optimize');
  return data.data!;
}

export async function getWaiverRecommendations(): Promise<WaiverRecommendations> {
  const { data } = await http.get<ApiResponse<WaiverRecommendations>>('/api/waivers');
  return data.data!;
}

export async function analyzeTrade(give: string[], receive: string[]): Promise<TradeAnalysis> {
  const { data } = await http.post<ApiResponse<TradeAnalysis>>('/api/trades/analyze', { give, receive });
  return data.data!;
}

export async function getInjuryReport(): Promise<InjuryReport[]> {
  const { data } = await http.get<ApiResponse<InjuryReport[]>>('/api/injuries');
  return data.data!;
}

export async function sendChatMessage(message: string, history: AgentMessage[]): Promise<string> {
  const { data } = await http.post<ApiResponse<{ reply: string }>>('/api/chat', { message, history });
  return data.data!.reply;
}

export async function registerPushToken(token: string): Promise<void> {
  await http.post('/api/push/register', { token });
}

export async function getDraftBoard(draftedPlayerIds: string[], myPicks: string[]): Promise<DraftRecommendation> {
  const { data } = await http.post<ApiResponse<DraftRecommendation>>('/api/draft/board', { draftedPlayerIds, myPicks });
  return data.data!;
}
