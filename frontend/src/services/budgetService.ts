import { api } from './api';
import { Budget, CreateBudgetDTO, BudgetStatusDTO, Alert } from '../types';

export const budgetService = {
  async getBudgets(): Promise<Budget[]> {
    const response = await api.get<Budget[]>('/v1/budgets');
    return response.success ? response.data || [] : [];
  },

  async getBudget(id: string): Promise<Budget | null> {
    const response = await api.get<Budget>(`/v1/budgets/${id}`);
    return response.success ? response.data || null : null;
  },

  async createBudget(data: CreateBudgetDTO): Promise<Budget | null> {
    const response = await api.post<Budget>('/v1/budgets', data);
    return response.success ? response.data || null : null;
  },

  async updateBudget(id: string, data: CreateBudgetDTO): Promise<Budget | null> {
    const response = await api.put<Budget>(`/v1/budgets/${id}`, data);
    return response.success ? response.data || null : null;
  },

  async deleteBudget(id: string): Promise<boolean> {
    const response = await api.delete(`/v1/budgets/${id}`);
    return response.success;
  },

  async getBudgetStatus(id: string): Promise<BudgetStatusDTO | null> {
    const response = await api.get<BudgetStatusDTO>(`/v1/budgets/${id}/status`);
    return response.success ? response.data || null : null;
  },

  async getAllBudgetStatuses(): Promise<BudgetStatusDTO[]> {
    const response = await api.get<BudgetStatusDTO[]>('/v1/budgets/status');
    return response.success ? response.data || [] : [];
  },

  // Alert related
  async getAlerts(page = 0, size = 20): Promise<{ alerts: Alert[]; total: number }> {
    const response = await api.get<Alert[]>('/v1/alerts', { page, size });
    return {
      alerts: response.data || [],
      total: response.pagination?.totalElements || 0,
    };
  },

  async getUnreadAlerts(): Promise<Alert[]> {
    const response = await api.get<Alert[]>('/v1/alerts/unread');
    return response.success ? response.data || [] : [];
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get<number>('/v1/alerts/count');
    return response.success ? response.data || 0 : 0;
  },

  async markAlertAsRead(id: string): Promise<boolean> {
    const response = await api.put(`/v1/alerts/${id}/read`);
    return response.success;
  },

  async markAllAlertsAsRead(): Promise<boolean> {
    const response = await api.put('/v1/alerts/read-all');
    return response.success;
  },
};
