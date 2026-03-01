import { Platform, Share } from 'react-native';
import { Expense } from '../types';

export type ExportFormat = 'csv' | 'json';

export function generateCSV(expenses: Expense[]): string {
  const headers = ['Date', 'Amount (EUR)', 'Category', 'Subcategory', 'Description', 'Type'];
  const rows = expenses.map(e => [
    e.date,
    e.amount.toFixed(2),
    e.category?.name || '',
    e.subCategory?.name || '',
    `"${(e.description || '').replace(/"/g, '""')}"`,
    e.expenseType || 'monthly',
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function generateJSON(
  expenses: Expense[],
  period: 'monthly' | 'annual',
  periodLabel: string,
  totalAmount: number,
): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      period,
      periodLabel,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      expenseCount: expenses.length,
      expenses: expenses.map(e => ({
        id: e.id,
        date: e.date,
        amount: e.amount,
        category: e.category?.name || null,
        subcategory: e.subCategory?.name || null,
        description: e.description || null,
        type: e.expenseType,
      })),
    },
    null,
    2,
  );
}

function buildFilename(periodLabel: string, format: ExportFormat): string {
  const safe = periodLabel
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  return `expenses_${safe}.${format}`;
}

export async function exportExpenses(
  expenses: Expense[],
  format: ExportFormat,
  period: 'monthly' | 'annual',
  periodLabel: string,
  totalAmount: number,
): Promise<void> {
  const content =
    format === 'csv'
      ? generateCSV(expenses)
      : generateJSON(expenses, period, periodLabel, totalAmount);
  const filename = buildFilename(periodLabel, format);
  const mimeType = format === 'csv' ? 'text/csv' : 'application/json';

  if (Platform.OS === 'web') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else {
    await Share.share({
      message: content,
      title: filename,
    });
  }
}
