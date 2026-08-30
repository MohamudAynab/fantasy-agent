import { runAgent, AgentTool } from './agent';
import * as espn from './espn';
import type { TradeAnalysis } from '../../src/types';

const SYSTEM = `You are a fantasy football trade analyst. Evaluate trades fairly, considering: current season stats, rest-of-season projections, injury history, age, bye weeks, roster needs, and positional scarcity. Give a clear verdict and explain the reasoning from both sides.`;

export async function analyzeTrade(give: string[], receive: string[]): Promise<TradeAnalysis> {
  const tools: AgentTool[] = [
    {
      name: 'get_roster',
      description: 'Get the current roster to understand positional needs.',
      input_schema: { type: 'object', properties: {}, required: [] },
      handler: async () => espn.getRoster(),
    },
    {
      name: 'get_player_stats',
      description: 'Get stats and projections for players involved in the trade.',
      input_schema: {
        type: 'object',
        properties: {
          player_keys: { type: 'array', items: { type: 'string' } },
        },
        required: ['player_keys'],
      },
      handler: async ({ player_keys }) => espn.getPlayerStats(player_keys),
    },
  ];

  const raw = await runAgent(
    SYSTEM,
    `Analyze this trade. I give: ${give.join(', ')}. I receive: ${receive.join(', ')}. Return as JSON: { verdict: "accept"|"decline"|"neutral", summary: string, give: [{id, name, position, team, status}], receive: [{id, name, position, team, status}] }`,
    tools
  );

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]) as TradeAnalysis;
  } catch {}

  return { verdict: 'neutral', summary: raw, give: [], receive: [] };
}
