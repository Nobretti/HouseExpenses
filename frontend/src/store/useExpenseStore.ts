import { create } from 'zustand';
import { Expense, CreateExpenseDTO, ExpenseFilters } from '../types';
import { expenseService } from '../services';

interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  filters: ExpenseFilters;
  pagination: {
    page: number;
    totalPages: number;
    totalElements: number;
  };

  // Actions
  fetchExpenses: (page?: number) => Promise<void>;
  fetchAllExpenses: () => Promise<void>;
  addExpense: (data: CreateExpenseDTO) => Promise<Expense | null>;
  addBulkExpenses: (data: CreateExpenseDTO[]) => Promise<boolean>;
  updateExpense: (id: string, data: CreateExpenseDTO) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;
  setFilters: (filters: ExpenseFilters) => void;
  clearFilters: () => void;
  reset: () => void;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    page: 0,
    totalPages: 0,
    totalElements: 0,
  },

  fetchExpenses: async (page = 0) => {
    set({ isLoading: true, error: null });
    try {
      const { expenses, pagination } = await expenseService.getExpenses(
        get().filters,
        { page, size: 20 }
      );
      set({
        expenses: page === 0 ? expenses : [...get().expenses, ...expenses],
        pagination: {
          page,
          totalPages: pagination.totalPages,
          totalElements: pagination.totalElements,
        },
        isLoading: false,
      });
    } catch (error) {
      set({ error: 'Failed to load expenses', isLoading: false });
    }
  },

  fetchAllExpenses: async () => {
    set({ isLoading: true, error: null });
    try {
      // Fetch ALL expenses without any filters to ensure we get everything
      const { expenses, pagination } = await expenseService.getExpenses(
        {}, // Empty filters - get all expenses
        { page: 0, size: 1000 }
      );
      set({
        expenses,
        pagination: {
          page: 0,
          totalPages: pagination.totalPages,
          totalElements: pagination.totalElements,
        },
        isLoading: false,
      });
    } catch (error) {
      set({ error: 'Failed to load expenses', isLoading: false });
    }
  },

  addExpense: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const expense = await expenseService.createExpense(data);
      if (expense) {
        set({ expenses: [expense, ...get().expenses], isLoading: false });
        return expense;
      }
      set({ error: 'Failed to create expense', isLoading: false });
      return null;
    } catch (error) {
      set({ error: 'Failed to create expense', isLoading: false });
      return null;
    }
  },

  addBulkExpenses: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const expenses = await expenseService.createBulkExpenses(data);
      set({ expenses: [...expenses, ...get().expenses], isLoading: false });
      return true;
    } catch (error) {
      set({ error: 'Failed to create expenses', isLoading: false });
      return false;
    }
  },

  updateExpense: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const expense = await expenseService.updateExpense(id, data);
      if (expense) {
        set({
          expenses: get().expenses.map((e) => (e.id === id ? expense : e)),
          isLoading: false,
        });
        return true;
      }
      set({ error: 'Failed to update expense', isLoading: false });
      return false;
    } catch (error) {
      set({ error: 'Failed to update expense', isLoading: false });
      return false;
    }
  },

  deleteExpense: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const success = await expenseService.deleteExpense(id);
      if (success) {
        set({
          expenses: get().expenses.filter((e) => e.id !== id),
          isLoading: false,
        });
        return true;
      }
      set({ error: 'Failed to delete expense', isLoading: false });
      return false;
    } catch (error) {
      set({ error: 'Failed to delete expense', isLoading: false });
      return false;
    }
  },

  setFilters: (filters) => {
    set({ filters });
    get().fetchExpenses(0);
  },

  clearFilters: () => {
    set({ filters: {} });
    get().fetchExpenses(0);
  },

  reset: () => {
    set({
      expenses: [],
      isLoading: false,
      error: null,
      filters: {},
      pagination: {
        page: 0,
        totalPages: 0,
        totalElements: 0,
      },
    });
  },
}));
