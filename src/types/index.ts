export interface Player {
  id: string;
  name: string;
  position: string;
  team: string;
  status: 'active' | 'injured' | 'questionable' | 'out' | 'bye';
  points?: number;
  projectedPoints?: number;
  percentOwned?: number;
}

export interface RosterSlot {
  player: Player;
  slot: string;
  isStarting: boolean;
}

export interface Matchup {
  opponent: string;
  week: number;
  myProjected: number;
  opponentProjected: number;
}

export interface WaiverPlayer extends Player {
  trend: 'up' | 'down' | 'neutral';
  addReason?: string;
}

export interface InjuryReport {
  player: Player;
  injury: string;
  practiceStatus: string;
  gameStatus: string;
  updatedAt: string;
}

export interface TradeAnalysis {
  verdict: 'accept' | 'decline' | 'neutral';
  summary: string;
  give: Player[];
  receive: Player[];
}

export interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

export interface LineupRecommendation {
  starters: RosterSlot[];
  bench: RosterSlot[];
  reasoning: string;
  changes: string[];
  matchup?: Matchup;
}

export interface WaiverRecommendations {
  pickups: WaiverPlayer[];
  drops: Player[];
  reasoning: string;
}

export interface DraftRecommendation {
  available: WaiverPlayer[];
  suggested: Player[];
  reasoning: string;
}
