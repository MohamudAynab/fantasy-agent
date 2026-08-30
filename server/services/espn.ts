import axios from 'axios';
import fs from 'fs';
import path from 'path';

const ESPN_API_BASE = 'https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons';

const TOKEN_FILE = path.join(process.cwd(), '.tokens.json');

interface TokenStore {
  swid: string;
  espnS2: string;
  leagueId: string;
  teamId: string;
  seasonId: string;
  pushToken?: string;
}

function loadTokens(): TokenStore | null {
  try {
    return JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8')) as TokenStore;
  } catch {
    return null;
  }
}

function saveTokens(store: TokenStore): void {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(store, null, 2));
}

export function setCredentials(creds: {
  swid: string;
  espnS2: string;
  leagueId: string;
  teamId: string;
  seasonId: string;
}): void {
  const existing = loadTokens();
  saveTokens({ ...existing, ...creds });
}

export function isAuthenticated(): boolean {
  return loadTokens() !== null;
}

export function savePushToken(token: string): void {
  const store = loadTokens();
  if (store) saveTokens({ ...store, pushToken: token });
}

export function getPushToken(): string | undefined {
  return loadTokens()?.pushToken;
}

function requireStore(): TokenStore {
  const store = loadTokens();
  if (!store) throw new Error('Not connected to ESPN. Enter your league credentials to connect.');
  return store;
}

async function get(view: string, extraHeaders?: Record<string, string>): Promise<any> {
  const store = requireStore();
  const { data } = await axios.get(`${ESPN_API_BASE}/${store.seasonId}/segments/0/leagues/${store.leagueId}`, {
    params: { view },
    headers: {
      Cookie: `SWID=${store.swid}; espn_s2=${store.espnS2}`,
      ...extraHeaders,
    },
  });
  return data;
}

export async function getRoster(): Promise<any> {
  const store = requireStore();
  const data = await get('mRoster');
  return (data.teams ?? []).find((t: any) => String(t.id) === String(store.teamId));
}

export async function getMatchup(): Promise<any> {
  const store = requireStore();
  const data = await get('mMatchup');
  const period = data.scoringPeriodId;
  const matchup = (data.schedule ?? []).find(
    (m: any) =>
      m.matchupPeriodId === period &&
      (String(m.home?.teamId) === String(store.teamId) || String(m.away?.teamId) === String(store.teamId))
  );
  return matchup;
}

export async function getAvailablePlayers(position?: string): Promise<any> {
  const filter = {
    players: {
      filterStatus: { value: ['FREEAGENT', 'WAIVERS'] },
      ...(position ? { filterSlotIds: { value: [positionToSlotId(position)] } } : {}),
      limit: 50,
      sortPercOwned: { sortAsc: false, sortPriority: 1 },
    },
  };
  return get('kona_player_info', { 'x-fantasy-filter': JSON.stringify(filter) });
}

export async function getPlayerStats(playerIds: string[]): Promise<any> {
  const filter = {
    players: {
      filterIds: { value: playerIds.map(Number) },
    },
  };
  return get('kona_player_info', { 'x-fantasy-filter': JSON.stringify(filter) });
}

export async function getLeagueSettings(): Promise<any> {
  return get('mSettings');
}

export async function getPlayerPool(): Promise<any> {
  const filter = {
    players: {
      limit: 300,
      sortDraftRanks: { sortPriority: 1, sortAsc: true, value: 'STANDARD' },
    },
  };
  return get('kona_player_info', { 'x-fantasy-filter': JSON.stringify(filter) });
}

function positionToSlotId(position: string): number {
  const slots: Record<string, number> = {
    QB: 0,
    RB: 2,
    WR: 4,
    TE: 6,
    FLEX: 23,
    DL: 8,
    DP: 10,
    DST: 16,
    K: 17,
  };
  return slots[position.toUpperCase()] ?? 23;
}
