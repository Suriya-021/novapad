export type BookTheme = 'dark' | 'paper' | 'sepia';
export type BookFontSize = 'normal' | 'large' | 'xlarge';
export type BookFontFamily = 'sans' | 'serif';

export interface BookThemeTokens {
  pageBg: string;
  textPrimary: string;
  textBody: string;
  textMuted: string;
  borderSubtle: string;
  codeBg: string;
  codeHeaderBg: string;
  codeTextColor: string;
  tableHeaderBg: string;
  tableBorder: string;
  tableAltRow: string;
  quoteBorder: string;
  quoteBg: string;
  bulletColor: string;
  spineShadow: string;
}

export const BOOK_THEMES: Record<BookTheme, BookThemeTokens> = {
  dark: {
    pageBg: '#12151f',
    textPrimary: '#ffffff',
    textBody: '#f8fafc', // Ultra-crisp slate-50 with maximum contrast
    textMuted: '#94a3b8',
    borderSubtle: 'rgba(255, 255, 255, 0.08)',
    codeBg: '#080b12',
    codeHeaderBg: '#1a2233',
    codeTextColor: '#38bdf8',
    tableHeaderBg: 'rgba(59, 130, 246, 0.14)',
    tableBorder: 'rgba(255, 255, 255, 0.12)',
    tableAltRow: 'rgba(255, 255, 255, 0.03)',
    quoteBorder: '#3b82f6',
    quoteBg: 'rgba(59, 130, 246, 0.1)',
    bulletColor: '#38bdf8',
    spineShadow: 'rgba(0, 0, 0, 0.5)',
  },
  paper: {
    pageBg: '#fbfbf9', // Pure clean warm paper
    textPrimary: '#0f172a', // Bold, deep slate-900
    textBody: '#1e293b', // Deep charcoal slate-800, perfectly legible
    textMuted: '#64748b',
    borderSubtle: 'rgba(0, 0, 0, 0.08)',
    codeBg: '#1e293b',
    codeHeaderBg: '#0f172a',
    codeTextColor: '#38bdf8',
    tableHeaderBg: 'rgba(59, 130, 246, 0.08)',
    tableBorder: 'rgba(0, 0, 0, 0.08)',
    tableAltRow: 'rgba(0, 0, 0, 0.02)',
    quoteBorder: '#2563eb',
    quoteBg: 'rgba(37, 99, 235, 0.06)',
    bulletColor: '#2563eb',
    spineShadow: 'rgba(0, 0, 0, 0.12)',
  },
  sepia: {
    pageBg: '#f6efe0', // Gentle warm sepia
    textPrimary: '#261b14',
    textBody: '#35251c',
    textMuted: '#7c6858',
    borderSubtle: 'rgba(60, 40, 20, 0.1)',
    codeBg: '#2d241d',
    codeHeaderBg: '#1f1812',
    codeTextColor: '#f59e0b',
    tableHeaderBg: 'rgba(180, 130, 60, 0.12)',
    tableBorder: 'rgba(60, 40, 20, 0.1)',
    tableAltRow: 'rgba(60, 40, 20, 0.03)',
    quoteBorder: '#b45309',
    quoteBg: 'rgba(180, 83, 9, 0.06)',
    bulletColor: '#d97706',
    spineShadow: 'rgba(60, 40, 20, 0.15)',
  },
};

export interface FontSizeTokens {
  body: string;
  lineHeight: number;
  h2: string;
  h3: string;
  h4: string;
  code: string;
  table: string;
  callout: string;
  list: string;
  meta: string;
}

export const FONT_SIZE_TOKENS: Record<BookFontSize, FontSizeTokens> = {
  normal: {
    body: '16.5px',
    lineHeight: 1.75,
    h2: '25px',
    h3: '19.5px',
    h4: '16.5px',
    code: '14.5px',
    table: '14.5px',
    callout: '15.5px',
    list: '16.5px',
    meta: '12px',
  },
  large: {
    body: '19px',
    lineHeight: 1.8,
    h2: '29px',
    h3: '23px',
    h4: '19px',
    code: '16.5px',
    table: '16.5px',
    callout: '17.5px',
    list: '19px',
    meta: '13px',
  },
  xlarge: {
    body: '22px',
    lineHeight: 1.85,
    h2: '33px',
    h3: '26px',
    h4: '22px',
    code: '18.5px',
    table: '18.5px',
    callout: '20px',
    list: '22px',
    meta: '14px',
  },
};

export const FONT_FAMILY_STACKS: Record<BookFontFamily, string> = {
  sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif",
  serif: "'Merriweather', 'Charter', 'Source Serif Pro', Georgia, 'Times New Roman', serif",
};
