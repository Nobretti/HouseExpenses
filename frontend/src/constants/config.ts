export const config = {
  api: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api',
    timeout: 30000,
  },
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  pagination: {
    defaultPageSize: 20,
  },
  budget: {
    defaultWarningThreshold: 80,
  },
  currency: {
    default: 'EUR',
    symbol: '€',
    locale: 'pt-PT',
  },
} as const;
