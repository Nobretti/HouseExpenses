import { useCallback } from 'react';
import { useExpenseStore } from '../store';
import { CreateExpenseDTO, ExpenseFilters } from '../types';

export const useExpenses = () => {
  const store = useExpenseStore();

  const refresh = useCallback(() => {
    store.fetchExpenses(0);
  }, []);

  const loadMore = useCallback(() => {
    if (store.pagination.page < store.pagination.totalPages - 1) {
      store.fetchExpenses(store.pagination.page + 1);
    }
  }, [store.pagination]);

  const create = useCallback(async (data: CreateExpenseDTO) => {
    return store.addExpense(data);
  }, []);

  const update = useCallback(async (id: string, data: CreateExpenseDTO) => {
    return store.updateExpense(id, data);
  }, []);

  const remove = useCallback(async (id: string) => {
    return store.deleteExpense(id);
  }, []);

  const filter = useCallback((filters: ExpenseFilters) => {
    store.setFilters(filters);
  }, []);

  const clearFilters = useCallback(() => {
    store.clearFilters();
  }, []);

  return {
    expenses: store.expenses,
    isLoading: store.isLoading,
    error: store.error,
    pagination: store.pagination,
    filters: store.filters,
    hasMore: store.pagination.page < store.pagination.totalPages - 1,
    refresh,
    loadMore,
    create,
    update,
    remove,
    filter,
    clearFilters,
  };
};
