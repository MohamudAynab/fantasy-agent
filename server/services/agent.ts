import { GoogleGenAI, FunctionDeclaration, Content } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const DEFAULT_MODEL = 'gemini-3.7-flash';

export interface AgentTool {
  name: string;
  description: string;
  input_schema: { type: 'object'; properties: Record<string, any>; required: string[] };
  handler: (input: Record<string, any>) => Promise<any>;
}

export async function runAgent(
  systemPrompt: string,
  userMessage: string,
  tools: AgentTool[],
  model = DEFAULT_MODEL,
  history: Content[] = []
): Promise<string> {
  const functionDeclarations: FunctionDeclaration[] = tools.map(({ name, description, input_schema }) => ({
    name,
    description,
    parametersJsonSchema: input_schema,
  }));

  const contents: Content[] = [...history, { role: 'user', parts: [{ text: userMessage }] }];

  for (let i = 0; i < 10; i++) {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: systemPrompt,
        tools: functionDeclarations.length ? [{ functionDeclarations }] : undefined,
        maxOutputTokens: 4096,
      },
    });

    const calls = response.functionCalls;
    if (!calls || calls.length === 0) {
      return response.text ?? '';
    }

    const modelContent: Content = response.candidates?.[0]?.content ?? {
      role: 'model',
      parts: calls.map((call) => ({ functionCall: call })),
    };
    contents.push(modelContent);

    const responseParts = [];
    for (const call of calls) {
      const tool = tools.find((t) => t.name === call.name);
      if (!tool) throw new Error(`Unknown tool: ${call.name}`);
      try {
        const result = await tool.handler((call.args ?? {}) as Record<string, any>);
        responseParts.push({ functionResponse: { id: call.id, name: call.name, response: { output: result } } });
      } catch (e: any) {
        responseParts.push({ functionResponse: { id: call.id, name: call.name, response: { error: e.message } } });
      }
    }
    contents.push({ role: 'user', parts: responseParts });
  }

  return '';
}
