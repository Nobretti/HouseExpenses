import { api } from './api';
import { Category, SubCategory, CreateCategoryDTO, CreateSubCategoryDTO, ExpenseType } from '../types';

export const categoryService = {
  async getCategories(type?: ExpenseType): Promise<Category[]> {
    const params = type ? { type } : {};
    const response = await api.get<Category[]>('/v1/categories', params);
    return response.success ? response.data || [] : [];
  },

  async getCategory(id: string): Promise<Category | null> {
    const response = await api.get<Category>(`/v1/categories/${id}`);
    return response.success ? response.data || null : null;
  },

  async createCategory(data: CreateCategoryDTO): Promise<Category | null> {
    const response = await api.post<Category>('/v1/categories', data);
    return response.success ? response.data || null : null;
  },

  async updateCategory(id: string, data: CreateCategoryDTO): Promise<Category | null> {
    const response = await api.put<Category>(`/v1/categories/${id}`, data);
    return response.success ? response.data || null : null;
  },

  async deleteCategory(id: string): Promise<boolean> {
    const response = await api.delete(`/v1/categories/${id}`);
    return response.success;
  },

  async createSubCategory(categoryId: string, data: CreateSubCategoryDTO): Promise<SubCategory | null> {
    const response = await api.post<SubCategory>(`/v1/categories/${categoryId}/subcategories`, data);
    return response.success ? response.data || null : null;
  },

  async updateSubCategory(id: string, data: CreateSubCategoryDTO): Promise<SubCategory | null> {
    const response = await api.put<SubCategory>(`/v1/categories/subcategories/${id}`, data);
    return response.success ? response.data || null : null;
  },

  async deleteSubCategory(id: string): Promise<boolean> {
    const response = await api.delete(`/v1/categories/subcategories/${id}`);
    return response.success;
  },

  async reorderCategory(id: string, newOrder: number): Promise<Category | null> {
    const response = await api.put<Category>(`/v1/categories/${id}/reorder`, { displayOrder: newOrder });
    return response.success ? response.data || null : null;
  },
};
