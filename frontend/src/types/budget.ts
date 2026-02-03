import { Category, SubCategory } from './category';

export type BudgetPeriod = 'weekly' | 'monthly' | 'annual';
export type BudgetStatus = 'ok' | 'warning' | 'exceeded';

export interface Budget {
  id: string;
  category: Category;
  subCategory?: SubCategory;
  limitAmount: number;
  warningThreshold: number;
  period: BudgetPeriod;
}

export interface CreateBudgetDTO {
  categoryId: string;
  subCategoryId?: string;
  limitAmount: number;
  warningThreshold?: number;
  period: BudgetPeriod;
}

export interface BudgetStatusDTO {
  budget: Budget;
  currentSpending: number;
  remainingAmount: number;
  utilizationPercentage: number;
  status: BudgetStatus;
  daysRemaining: number;
}

export type AlertType = 'warning' | 'exceeded';

export interface Alert {
  id: string;
  alertType: AlertType;
  message: string;
  percentage: number;
  isRead: boolean;
  createdAt: string;
  category: Category;
  subCategory?: SubCategory;
}
