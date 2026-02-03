export interface User {
  id: string;
  displayName?: string;
  email?: string;
  currency: string;
  locale: string;
  createdAt?: string;
  monthlyBudgetLimit?: number;
  annualBudgetLimit?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  displayName?: string;
}
