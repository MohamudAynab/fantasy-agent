// jest.mock is hoisted — factory must not reference outer-scope let/const.
jest.mock('@google/genai', () => ({
  __esModule: true,
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: { generateContent: jest.fn() },
  })),
}));

import { runAgent, AgentTool } from '../services/agent';

function mockGenerateContent(): jest.Mock {
  const ctor = jest.requireMock('@google/genai').GoogleGenAI as jest.Mock;
  return ctor.mock.results[0].value.models.generateContent as jest.Mock;
}

beforeEach(() => mockGenerateContent().mockReset());

describe('runAgent', () => {
  it('returns text when there are no function calls', async () => {
    mockGenerateContent().mockResolvedValue({
      functionCalls: undefined,
      text: 'Here is my answer.',
    });

    const result = await runAgent('system', 'user message', []);
    expect(result).toBe('Here is my answer.');
  });

  it('calls tool handler and returns final text', async () => {
    const handler = jest.fn().mockResolvedValue({ roster: [] });
    const tools: AgentTool[] = [{
      name: 'get_roster',
      description: 'get roster',
      input_schema: { type: 'object', properties: {}, required: [] },
      handler,
    }];

    mockGenerateContent()
      .mockResolvedValueOnce({
        functionCalls: [{ id: 'tu_1', name: 'get_roster', args: {} }],
        candidates: [{ content: { role: 'model', parts: [{ functionCall: { id: 'tu_1', name: 'get_roster', args: {} } }] } }],
      })
      .mockResolvedValueOnce({
        functionCalls: undefined,
        text: 'Roster looks good.',
      });

    const result = await runAgent('system', 'check my roster', tools);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(result).toBe('Roster looks good.');
  });

  it('returns empty string when max iterations exceeded', async () => {
    mockGenerateContent().mockResolvedValue({
      functionCalls: [{ id: 'tu_1', name: 'get_roster', args: {} }],
      candidates: [{ content: { role: 'model', parts: [{ functionCall: { id: 'tu_1', name: 'get_roster', args: {} } }] } }],
    });

    const tools: AgentTool[] = [{
      name: 'get_roster',
      description: 'get roster',
      input_schema: { type: 'object', properties: {}, required: [] },
      handler: jest.fn().mockResolvedValue({}),
    }];

    const result = await runAgent('system', 'loop forever', tools);
    expect(result).toBe('');
  });
});
