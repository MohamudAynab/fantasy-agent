import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const secretManager = new SecretManagerServiceClient();

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function positiveNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export const serverConfig = {
  model: process.env.GEMINI_MODEL ?? 'gemini-3.7-flash',
  temperature: positiveNumber(process.env.GEMINI_TEMPERATURE, 0.2),
  maxOutputTokens: positiveInteger(process.env.GEMINI_MAX_OUTPUT_TOKENS, 4096),
  maxAgentIterations: positiveInteger(process.env.GEMINI_MAX_AGENT_ITERATIONS, 10),
  maxRetries: positiveInteger(process.env.GEMINI_MAX_RETRIES, 3),
  retryBaseDelayMs: positiveInteger(process.env.GEMINI_RETRY_BASE_DELAY_MS, 500),
};

export async function getGeminiApiKey(): Promise<string> {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;

  const secretName = process.env.GEMINI_API_KEY_SECRET;
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  if (!secretName || !projectId) {
    throw new Error('GEMINI_API_KEY is not set and Secret Manager configuration is incomplete.');
  }

  const [version] = await secretManager.accessSecretVersion({
    name: `projects/${projectId}/secrets/${secretName}/versions/latest`,
  });
  const key = version.payload?.data?.toString();
  if (!key) throw new Error(`Secret Manager secret "${secretName}" has no value.`);
  return key;
}
