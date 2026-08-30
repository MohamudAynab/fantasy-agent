import { runAgent, AgentTool } from './agent';
import * as espn from './espn';
import type { WaiverRecommendations } from '../../src/types';

const SYSTEM = `You are a fantasy football waiver wire expert. Analyze the user's roster and available players to recommend the best waiver pickups and drops. Consider: bye weeks, injuries, recent performance trends, upcoming schedule strength, and roster needs by position. Be specific and prioritize high-impact moves.`;

export async function getWaiverRecommendations(): Promise<WaiverRecommendations> {
  const tools: AgentTool[] = [
    {
      name: 'get_roster',
      description: 'Get the current roster with player stats and injury status.',
      input_schema: { type: 'object', properties: {}, required: [] },
      handler: async () => espn.getRoster(),
    },
    {
      name: 'get_available_players',
      description: 'Get available (unowned) players on the waiver wire, optionally filtered by position.',
      input_schema: {
        type: 'object',
        properties: {
          position: { type: 'string', description: 'Optional: QB, RB, WR, TE, K, DEF' },
        },
        required: [],
      },
      handler: async ({ position }) => espn.getAvailablePlayers(position),
    },
  ];

  const raw = await runAgent(
    SYSTEM,
    'Analyze my roster and the waiver wire. Return recommendations as JSON: { pickups: [{id, name, position, team, status, percentOwned, trend, addReason}], drops: [{id, name, position, team, status}], reasoning: string }',
    tools
  );

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]) as WaiverRecommendations;
  } catch {}

  return { pickups: [], drops: [], reasoning: raw };
}
