import { useCallback, useMemo } from 'react';
import { useCategoryStore } from '../store';
import { CreateCategoryDTO, CreateSubCategoryDTO, ExpenseType } from '../types';

export const useCategories = () => {
  const store = useCategoryStore();

  const monthlyCategories = useMemo(() => {
    return store.categories.filter((c) => c.expenseType === 'monthly');
  }, [store.categories]);

  const annualCategories = useMemo(() => {
    return store.categories.filter((c) => c.expenseType === 'annual');
  }, [store.categories]);

  const refresh = useCallback(() => {
    store.fetchCategories();
  }, []);

  const createCategory = useCallback(async (data: CreateCategoryDTO) => {
    return store.addCategory(data);
  }, []);

  const updateCategory = useCallback(async (id: string, data: CreateCategoryDTO) => {
    return store.updateCategory(id, data);
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    return store.deleteCategory(id);
  }, []);

  const createSubCategory = useCallback(async (categoryId: string, data: CreateSubCategoryDTO) => {
    return store.addSubCategory(categoryId, data);
  }, []);

  const getCategoryById = useCallback((id: string) => {
    return store.categories.find((c) => c.id === id);
  }, [store.categories]);

  return {
    categories: store.categories,
    monthlyCategories,
    annualCategories,
    isLoading: store.isLoading,
    error: store.error,
    refresh,
    createCategory,
    updateCategory,
    deleteCategory,
    createSubCategory,
    getCategoryById,
  };
};
