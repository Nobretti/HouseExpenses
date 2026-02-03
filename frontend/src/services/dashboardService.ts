import { api } from './api';
import { DashboardSummary, ChartData, CategorySpending, BudgetPeriod } from '../types';

export interface DateFilter {
  year?: number;
  month?: number;
  day?: number;
}

export const dashboardService = {
  async getSummary(filter?: DateFilter): Promise<DashboardSummary | null> {
    const params: Record<string, number> = {};
    if (filter?.year) params.year = filter.year;
    if (filter?.month) params.month = filter.month;
    const response = await api.get<DashboardSummary>('/v1/dashboard/summary', params);
    return response.success ? response.data || null : null;
  },

  async getWeeklyData(filter?: DateFilter): Promise<ChartData | null> {
    const params: Record<string, number> = {};
    if (filter?.year) params.year = filter.year;
    if (filter?.month) params.month = filter.month;
    if (filter?.day) params.day = filter.day;
    const response = await api.get<ChartData>('/v1/dashboard/weekly', params);
    return response.success ? response.data || null : null;
  },

  async getMonthlyData(filter?: DateFilter): Promise<ChartData | null> {
    const params: Record<string, number> = {};
    if (filter?.year) params.year = filter.year;
    if (filter?.month) params.month = filter.month;
    const response = await api.get<ChartData>('/v1/dashboard/monthly', params);
    return response.success ? response.data || null : null;
  },

  async getAnnualData(filter?: DateFilter): Promise<ChartData | null> {
    const params: Record<string, number> = {};
    if (filter?.year) params.year = filter.year;
    const response = await api.get<ChartData>('/v1/dashboard/annual', params);
    return response.success ? response.data || null : null;
  },

  async getCategoryBreakdown(period: BudgetPeriod = 'monthly'): Promise<CategorySpending[]> {
    const response = await api.get<CategorySpending[]>('/v1/dashboard/category-breakdown', { period });
    return response.success ? response.data || [] : [];
  },
};
