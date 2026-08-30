import { runAgent, AgentTool } from './agent';
import * as espn from './espn';
import { BAY_AREA_BLITZ_RULES } from './scoring';
import type { DraftRecommendation } from '../../src/types';

const SYSTEM = `You are a fantasy football draft assistant for a 12-team snake draft. Roster: 1 QB, 2 RB, 2 WR, 1 TE, 2 FLEX (RB/WR/TE), 1 OP (any), 1 DL, 4 DP, 1 D/ST, 1 K starting (23 total incl. bench). Scoring is custom PPR with distance and yardage bonuses: ${JSON.stringify(BAY_AREA_BLITZ_RULES)}. Given the players already drafted (by anyone) and the user's picks so far, recommend the best available players to target next, weighing scoring value and positional scarcity/need. Be concise and specific.`;

export async function getDraftRecommendation(
  draftedPlayerIds: string[],
  myPicks: string[]
): Promise<DraftRecommendation> {
  const tools: AgentTool[] = [
    {
      name: 'get_available_players',
      description: 'Get the draft-eligible player pool with rankings, ranked by ADP/projection.',
      input_schema: { type: 'object', properties: {}, required: [] },
      handler: async () => espn.getPlayerPool(),
    },
    {
      name: 'get_league_settings',
      description: 'Get league roster slot configuration and scoring settings.',
      input_schema: { type: 'object', properties: {}, required: [] },
      handler: async () => espn.getLeagueSettings(),
    },
  ];

  const raw = await runAgent(
    SYSTEM,
    `Players already drafted (exclude these): ${JSON.stringify(draftedPlayerIds)}. My picks so far: ${JSON.stringify(myPicks)}. Recommend who I should target next. Return as JSON: { available: [{id, name, position, team, status, projectedPoints, percentOwned, trend, addReason}], suggested: [{id, name, position, team, status, projectedPoints}], reasoning: string }`,
    tools
  );

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]) as DraftRecommendation;
  } catch {}

  return { available: [], suggested: [], reasoning: raw };
}
