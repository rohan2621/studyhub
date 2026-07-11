export const Colors = {
  // Brand
  navy:        '#0E2A4D',
  primary:     '#2F6FED',
  secondary:   '#5B8DEF',
  sky:         '#38BDF8',
  amber:       '#F5B843',

  // Backgrounds
  bgStart:     '#EAF1FF',
  bgEnd:       '#F7FAFF',

  // Glassmorphism
  glass:        'rgba(255,255,255,0.72)',
  glassBorder:  'rgba(47,111,237,0.12)',

  // Semantic
  error:        '#EF4444',
  warning:      '#F59E0B',
  success:      '#10B981',
  muted:        '#94A3B8',
  mutedFg:      '#64748B',

  // Due date chips
  dueRed:       '#FEE2E2',
  dueRedText:   '#DC2626',
  dueAmber:     '#FEF3C7',
  dueAmberText: '#D97706',
  dueGreen:     '#D1FAE5',
  dueGreenText: '#059669',

  // Surface
  white:        '#FFFFFF',
  surface:      '#F8FAFF',
  border:       'rgba(47,111,237,0.10)',

  // Text
  textPrimary:   '#0E2A4D',
  textSecondary: '#475569',
  textMuted:     '#94A3B8',
  textInverse:   '#FFFFFF',
} as const;

export const Radius = {
  xs:     4,
  sm:     8,
  md:     12,
  lg:     18,
  xl:     24,
  full:   9999,
} as const;

export const Spacing = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
} as const;

export const FontSize = {
  xs:   11,
  sm:   13,
  md:   15,
  lg:   17,
  xl:   20,
  xxl:  24,
  xxxl: 30,
  huge: 36,
} as const;

export const FontWeight = {
  normal:    '400' as const,
  medium:    '500' as const,
  semibold:  '600' as const,
  bold:      '700' as const,
  extrabold: '800' as const,
};

export const FontFamily = {
  heading: 'PlusJakartaSans_700Bold',
  body:    'Inter_400Regular',
  mono:    'JetBrainsMono_400Regular',
};

export const Shadows = {
  card: {
    shadowColor:   '#2F6FED',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius:  12,
    elevation:     5,
  },
  cardHover: {
    shadowColor:   '#2F6FED',
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius:  20,
    elevation:     10,
  },
} as const;

export const Timing = {
  fast:   150,
  medium: 300,
  slow:   500,
} as const;

/**
 * Typed as const tuples to satisfy expo-linear-gradient's
 *   readonly [ColorValue, ColorValue, ...ColorValue[]]
 * requirement. Do NOT widen to string[].
 */
export const Gradients = {
  background: ['#EAF1FF', '#F7FAFF'] as const,
  primary:    ['#2F6FED', '#5B8DEF'] as const,
  amber:      ['#F5B843', '#F59E0B'] as const,
  card:       ['rgba(255,255,255,0.9)', 'rgba(234,241,255,0.6)'] as const,
  navyToBlue: ['#0E2A4D', '#2F6FED'] as const,
} as const;
