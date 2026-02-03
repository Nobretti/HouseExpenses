export type ExpenseType = 'monthly' | 'annual';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  expenseType: ExpenseType;
  displayOrder?: number;
  subCategories?: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
  icon?: string;
  budgetLimit?: number;
  displayOrder?: number;
  fixedAmount?: number;
  isMandatory?: boolean;
}

export interface CreateCategoryDTO {
  name: string;
  icon: string;
  color: string;
  expenseType: ExpenseType;
  displayOrder?: number;
}

export interface CreateSubCategoryDTO {
  name: string;
  icon?: string;
  budgetLimit?: number;
  displayOrder?: number;
  fixedAmount?: number;
  isMandatory?: boolean;
}
