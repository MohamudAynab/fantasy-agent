import { runAgent, AgentTool } from './agent';
import * as espn from './espn';
import type { InjuryReport } from '../../src/types';

const SYSTEM = `You are a fantasy football injury analyst. Review the user's roster and identify any players with injury concerns. Summarize each player's injury status, practice participation, and expected game-day availability. Flag high-priority situations where the user should consider alternatives.`;

export async function getInjuryReport(): Promise<InjuryReport[]> {
  const tools: AgentTool[] = [
    {
      name: 'get_roster',
      description: 'Get the current roster with injury designations and practice status.',
      input_schema: { type: 'object', properties: {}, required: [] },
      handler: async () => espn.getRoster(),
    },
  ];

  const raw = await runAgent(
    SYSTEM,
    'Review my roster for injury concerns. Return only players with injury issues as JSON array: [{ player: {id, name, position, team, status}, injury: string, practiceStatus: string, gameStatus: string, updatedAt: string }]',
    tools
  );

  try {
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]) as InjuryReport[];
  } catch {}

  return [];
}
