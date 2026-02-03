export const colors = {
  // Primary - Warm teal/green for family feel
  primary: '#2A9D8F',
  primaryDark: '#238B7E',
  primaryLight: '#4DB6AC',

  // Secondary - Warm coral accent
  secondary: '#E76F51',
  secondaryLight: '#F4A261',

  // Status
  success: '#52B788',
  warning: '#F4A261',
  danger: '#E63946',

  // Neutrals - Warmer tones
  background: '#FAF8F5',
  surface: '#FFFFFF',
  text: '#264653',
  textSecondary: '#6B7B8C',
  textLight: '#A8B5C2',
  border: '#E8E4DF',

  // Category Colors - Family-friendly palette
  categories: {
    casa: '#2A9D8F',
    educacao: '#9B5DE5',
    saude: '#F15BB5',
    alimentacao: '#52B788',
    seguros: '#F4A261',
    carros: '#00BBF9',
    filhos: '#FF6B9D',
    operadores: '#00C9C8',
    outros: '#8D99AE',
    viagens: '#06D6A0',
    festas: '#FD6F70',
  },

  // Transparent
  overlay: 'rgba(38, 70, 83, 0.5)',
  cardShadow: 'rgba(38, 70, 83, 0.08)',

  // Gradients support
  gradientStart: '#2A9D8F',
  gradientEnd: '#4DB6AC',
} as const;

export type ColorName = keyof typeof colors;
