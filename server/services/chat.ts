import type { Content } from '@google/genai';
import { runAgent, AgentTool } from './agent';
import * as espn from './espn';
import type { AgentMessage } from '../../src/types';

const SYSTEM = `You are a knowledgeable fantasy football assistant with access to the user's team data. Answer questions about their roster, suggest strategies, analyze matchups, and give actionable advice. Be conversational but specific. Use tools to look up current data when needed.`;

export async function chat(message: string, history: AgentMessage[]): Promise<string> {
  const tools: AgentTool[] = [
    {
      name: 'get_roster',
      description: 'Get the current roster with player stats, projections, and injury status.',
      input_schema: { type: 'object', properties: {}, required: [] },
      handler: async () => espn.getRoster(),
    },
    {
      name: 'get_available_players',
      description: 'Get available players on the waiver wire.',
      input_schema: {
        type: 'object',
        properties: {
          position: { type: 'string', description: 'Optional position filter: QB, RB, WR, TE, K, DEF' },
        },
        required: [],
      },
      handler: async ({ position }) => espn.getAvailablePlayers(position),
    },
    {
      name: 'get_matchup',
      description: 'Get the current week matchup information.',
      input_schema: { type: 'object', properties: {}, required: [] },
      handler: async () => espn.getMatchup(),
    },
    {
      name: 'get_player_stats',
      description: 'Get detailed stats for specific players.',
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

  const priorMessages: Content[] = history.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  return runAgent(SYSTEM, message, tools, undefined, priorMessages);
}
