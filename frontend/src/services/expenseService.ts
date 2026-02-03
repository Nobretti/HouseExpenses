import { api } from './api';
import { Expense, CreateExpenseDTO, ExpenseFilters, PaginatedRequest } from '../types';

export const expenseService = {
  async getExpenses(
    filters?: ExpenseFilters,
    pagination?: PaginatedRequest
  ): Promise<{ expenses: Expense[]; pagination: { totalElements: number; totalPages: number } }> {
    const params: Record<string, unknown> = {
      ...filters,
      page: pagination?.page || 0,
      size: pagination?.size || 20,
      sort: pagination?.sort || 'expenseDate,desc',
    };

    const response = await api.get<Expense[]>('/v1/expenses', params);

    return {
      expenses: response.data || [],
      pagination: {
        totalElements: response.pagination?.totalElements || 0,
        totalPages: response.pagination?.totalPages || 0,
      },
    };
  },

  async getExpense(id: string): Promise<Expense | null> {
    const response = await api.get<Expense>(`/v1/expenses/${id}`);
    return response.success ? response.data || null : null;
  },

  async createExpense(data: CreateExpenseDTO): Promise<Expense | null> {
    const response = await api.post<Expense>('/v1/expenses', data);
    return response.success ? response.data || null : null;
  },

  async createBulkExpenses(data: CreateExpenseDTO[]): Promise<Expense[]> {
    const response = await api.post<Expense[]>('/v1/expenses/bulk', data);
    return response.success ? response.data || [] : [];
  },

  async updateExpense(id: string, data: CreateExpenseDTO): Promise<Expense | null> {
    const response = await api.put<Expense>(`/v1/expenses/${id}`, data);
    return response.success ? response.data || null : null;
  },

  async deleteExpense(id: string): Promise<boolean> {
    const response = await api.delete(`/v1/expenses/${id}`);
    return response.success;
  },
};
