export type PracticeStatusLevel = 'full' | 'limited' | 'dnp' | 'unknown';

export function parsePracticeStatus(status: string): PracticeStatusLevel {
  const s = status.toLowerCase();
  if (s.includes('full'))                             return 'full';
  if (s.includes('limited') || s.includes('partial')) return 'limited';
  if (s.includes('did not') || s.includes('dnp') || s.includes('out')) return 'dnp';
  return 'unknown';
}
