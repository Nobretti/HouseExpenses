import { create } from 'zustand';
import { Category, CreateCategoryDTO, CreateSubCategoryDTO, SubCategory } from '../types';
import { categoryService } from '../services';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCategories: () => Promise<void>;
  getMonthlyCategories: () => Category[];
  getAnnualCategories: () => Category[];
  addCategory: (data: CreateCategoryDTO) => Promise<Category | null>;
  updateCategory: (id: string, data: CreateCategoryDTO) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  addSubCategory: (categoryId: string, data: CreateSubCategoryDTO) => Promise<SubCategory | null>;
  updateSubCategory: (id: string, data: CreateSubCategoryDTO) => Promise<boolean>;
  deleteSubCategory: (id: string) => Promise<boolean>;
  reorderCategory: (id: string, newOrder: number) => Promise<boolean>;
  reset: () => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const categories = await categoryService.getCategories();
      set({ categories, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load categories', isLoading: false });
    }
  },

  getMonthlyCategories: () => {
    return get().categories.filter((c) => c.expenseType === 'monthly');
  },

  getAnnualCategories: () => {
    return get().categories.filter((c) => c.expenseType === 'annual');
  },

  addCategory: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const category = await categoryService.createCategory(data);
      if (category) {
        set({ categories: [...get().categories, category], isLoading: false });
        return category;
      }
      set({ error: 'Failed to create category', isLoading: false });
      return null;
    } catch (error) {
      set({ error: 'Failed to create category', isLoading: false });
      return null;
    }
  },

  updateCategory: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const category = await categoryService.updateCategory(id, data);
      if (category) {
        set({
          categories: get().categories.map((c) => (c.id === id ? category : c)),
          isLoading: false,
        });
        return true;
      }
      set({ error: 'Failed to update category', isLoading: false });
      return false;
    } catch (error) {
      set({ error: 'Failed to update category', isLoading: false });
      return false;
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const success = await categoryService.deleteCategory(id);
      if (success) {
        set({
          categories: get().categories.filter((c) => c.id !== id),
          isLoading: false,
        });
        return true;
      }
      set({ error: 'Failed to delete category', isLoading: false });
      return false;
    } catch (error) {
      set({ error: 'Failed to delete category', isLoading: false });
      return false;
    }
  },

  addSubCategory: async (categoryId, data) => {
    try {
      const subCategory = await categoryService.createSubCategory(categoryId, data);
      if (subCategory) {
        set({
          categories: get().categories.map((c) => {
            if (c.id === categoryId) {
              return {
                ...c,
                subCategories: [...(c.subCategories || []), subCategory],
              };
            }
            return c;
          }),
        });
        return subCategory;
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  updateSubCategory: async (id, data) => {
    try {
      const subCategory = await categoryService.updateSubCategory(id, data);
      if (subCategory) {
        set({
          categories: get().categories.map((c) => ({
            ...c,
            subCategories: c.subCategories?.map((sc) =>
              sc.id === id ? subCategory : sc
            ),
          })),
        });
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  deleteSubCategory: async (id) => {
    try {
      const success = await categoryService.deleteSubCategory(id);
      if (success) {
        set({
          categories: get().categories.map((c) => ({
            ...c,
            subCategories: c.subCategories?.filter((sc) => sc.id !== id),
          })),
        });
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  reorderCategory: async (id, newOrder) => {
    // Get the category being moved
    const category = get().categories.find((c) => c.id === id);
    if (!category) return false;

    const expenseType = category.expenseType;
    const sameTypeCategories = get().categories
      .filter((c) => c.expenseType === expenseType)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    const oldIndex = sameTypeCategories.findIndex((c) => c.id === id);
    if (oldIndex === -1 || oldIndex === newOrder) return false;

    // Optimistic UI update - rearrange categories locally
    const reordered = [...sameTypeCategories];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newOrder, 0, moved);

    const updatedCategories = get().categories.map((c) => {
      if (c.expenseType !== expenseType) return c;
      const newIndex = reordered.findIndex((r) => r.id === c.id);
      return { ...c, displayOrder: newIndex };
    });
    set({ categories: updatedCategories });

    // Persist to backend, then refresh to ensure sync
    try {
      await categoryService.reorderCategory(id, newOrder);
      // Refetch to ensure frontend matches backend state
      await get().fetchCategories();
      return true;
    } catch (error) {
      // Revert on error by refetching
      await get().fetchCategories();
      return false;
    }
  },

  reset: () => {
    set({
      categories: [],
      isLoading: false,
      error: null,
    });
  },
}));
