import { runAgent, AgentTool } from './agent';
import * as espn from './espn';
import type { LineupRecommendation } from '../../src/types';

const SYSTEM = `You are a fantasy football expert assistant. Your job is to analyze a user's roster and recommend the optimal starting lineup for the current week. Use the available tools to get current roster data, projected stats, injury reports, and matchup information. Be specific about your recommendations and explain your reasoning clearly. Always consider injuries, bye weeks, and projected points.`;

export async function optimizeLineup(): Promise<LineupRecommendation> {
  const tools: AgentTool[] = [
    {
      name: 'get_roster',
      description: 'Get the current roster including all players, their positions, projected points, and injury status.',
      input_schema: { type: 'object', properties: {}, required: [] },
      handler: async () => espn.getRoster(),
    },
    {
      name: 'get_matchup',
      description: 'Get the current week matchup details including the opponent and their projected score.',
      input_schema: { type: 'object', properties: {}, required: [] },
      handler: async () => espn.getMatchup(),
    },
    {
      name: 'get_player_stats',
      description: 'Get detailed stats and projections for specific players.',
      input_schema: {
        type: 'object',
        properties: {
          player_keys: { type: 'array', items: { type: 'string' }, description: 'ESPN player ids to look up' },
        },
        required: ['player_keys'],
      },
      handler: async ({ player_keys }) => espn.getPlayerStats(player_keys),
    },
  ];

  const raw = await runAgent(
    SYSTEM,
    'Analyze my roster and recommend the optimal lineup for this week. Return your response as JSON matching this shape: { starters: [{player: {id, name, position, team, status, projectedPoints}, slot: string, isStarting: true}], bench: [...], changes: string[], reasoning: string, matchup: {opponent: string, week: number, myProjected: number, opponentProjected: number} }',
    tools
  );

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]) as LineupRecommendation;
  } catch {}

  // Fallback if the model didn't return valid JSON
  return { starters: [], bench: [], changes: [], reasoning: raw };
}
