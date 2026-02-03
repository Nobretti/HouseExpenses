import { config } from '../constants/config';

export const formatCurrency = (amount: number, currency = config.currency.default): string => {
  return new Intl.NumberFormat(config.currency.locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (dateString: string, format: 'short' | 'long' | 'relative' = 'short'): string => {
  const date = new Date(dateString);

  if (format === 'relative') {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
  }

  if (format === 'long') {
    return new Intl.DateTimeFormat(config.currency.locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }

  return new Intl.DateTimeFormat(config.currency.locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat(config.currency.locale).format(value);
};

export const toISODateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};
