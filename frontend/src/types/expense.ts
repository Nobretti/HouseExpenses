import { Category, SubCategory, ExpenseType } from './category';

export interface Expense {
  id: string;
  category: Category;
  subCategory?: SubCategory;
  amount: number;
  description?: string;
  date: string;
  expenseType: ExpenseType;
  createdAt: string;
}

export interface CreateExpenseDTO {
  categoryId?: string;
  subCategoryId?: string;
  amount: number;
  description?: string;
  date: string;
  expenseType?: ExpenseType;
}

export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  subCategoryId?: string;
  minAmount?: number;
  maxAmount?: number;
}
