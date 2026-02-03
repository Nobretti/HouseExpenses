import { Category, SubCategory } from './category';

export interface Expense {
  id: string;
  category: Category;
  subCategory?: SubCategory;
  amount: number;
  description?: string;
  date: string;
  createdAt: string;
}

export interface CreateExpenseDTO {
  categoryId?: string;
  subCategoryId?: string;
  amount: number;
  description?: string;
  date: string;
}

export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  subCategoryId?: string;
  minAmount?: number;
  maxAmount?: number;
}
