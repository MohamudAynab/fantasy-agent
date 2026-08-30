export const Colors = {
  bg:          '#0f172a',
  surface:     '#1e293b',
  surfaceHigh: '#263348',
  border:      '#334155',
  accent:      '#22c55e',
  muted:       '#64748b',
  text:        '#f1f5f9',
  textSub:     '#94a3b8',
  textDim:     '#475569',

  success: { DEFAULT: '#22c55e', light: '#22c55e1a', dark: '#16a34a' },
  warning: { DEFAULT: '#f59e0b', light: '#f59e0b1a', dark: '#d97706' },
  error:   { DEFAULT: '#ef4444', light: '#ef44441a', dark: '#dc2626' },
  info:    { DEFAULT: '#3b82f6', light: '#3b82f61a', dark: '#2563eb' },

  position: {
    QB:   { bg: '#4f46e5', text: '#c7d2fe' },
    RB:   { bg: '#059669', text: '#a7f3d0' },
    WR:   { bg: '#d97706', text: '#fde68a' },
    TE:   { bg: '#7c3aed', text: '#ddd6fe' },
    FLEX: { bg: '#475569', text: '#cbd5e1' },
    K:    { bg: '#52525b', text: '#d4d4d8' },
    DEF:  { bg: '#1d4ed8', text: '#bfdbfe' },
  } as Record<string, { bg: string; text: string }>,

  severity: {
    out:          '#ef4444',
    questionable: '#f59e0b',
    doubtful:     '#f97316',
    active:       '#22c55e',
    bye:          '#64748b',
  } as Record<string, string>,

  verdict: {
    accept:  '#22c55e',
    decline: '#ef4444',
    neutral: '#f59e0b',
  } as Record<string, string>,
};

export const Typography = {
  display:  { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.5 },
  heading:  { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.3 },
  subhead:  { fontSize: 17, fontWeight: '600' as const },
  body:     { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyBold: { fontSize: 15, fontWeight: '600' as const },
  label:    { fontSize: 13, fontWeight: '600' as const, letterSpacing: 0.8 },
  caption:  { fontSize: 12, fontWeight: '400' as const },
  micro:    { fontSize: 10, fontWeight: '700' as const, letterSpacing: 1, textTransform: 'uppercase' as const },
};

export const Spacing = {
  xs:  2,
  sm:  4,
  md:  8,
  lg:  12,
  xl:  16,
  xl2: 20,
  xl3: 24,
  xl4: 32,
  xl5: 40,
  xl6: 48,
};

export const Radius = {
  sm:   6,
  md:   12,
  lg:   16,
  xl:   24,
  full: 9999,
};

export const Elevation = {
  low: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  high: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
};
