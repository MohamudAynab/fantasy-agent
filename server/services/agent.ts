import { GoogleGenAI, FunctionDeclaration, Content } from '@google/genai';
import { getGeminiApiKey, serverConfig } from '../config';

let aiPromise: Promise<GoogleGenAI> | undefined = process.env.GEMINI_API_KEY_SECRET
  ? undefined
  : Promise.resolve(new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }));

function getAi(): Promise<GoogleGenAI> {
  aiPromise ??= getGeminiApiKey().then((apiKey) => new GoogleGenAI({ apiKey }));
  return aiPromise;
}

function isRetryable(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const status = (error as { status?: number; code?: number })?.status ?? (error as { code?: number })?.code;
  return status === 429 || (typeof status === 'number' && status >= 500) ||
    /429|resource exhausted|temporarily unavailable|timeout|network|socket/i.test(message);
}

async function withRetry<T>(operation: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (!isRetryable(error) || attempt >= serverConfig.maxRetries) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, serverConfig.retryBaseDelayMs * 2 ** attempt)
      );
    }
  }
}

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
  model = serverConfig.model,
  history: Content[] = []
): Promise<string> {
  const functionDeclarations: FunctionDeclaration[] = tools.map(({ name, description, input_schema }) => ({
    name,
    description,
    parametersJsonSchema: input_schema,
  }));

  const contents: Content[] = [...history, { role: 'user', parts: [{ text: userMessage }] }];

  for (let i = 0; i < serverConfig.maxAgentIterations; i++) {
    const response = await withRetry(async () =>
      (await getAi()).models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: systemPrompt,
          tools: functionDeclarations.length ? [{ functionDeclarations }] : undefined,
          temperature: serverConfig.temperature,
          maxOutputTokens: serverConfig.maxOutputTokens,
        },
      })
    );

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
