import { Alert } from './budget';
import { Expense } from './expense';

export interface PendingExpense {
  subCategoryId: string;
  subCategoryName: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryExpenseType: 'monthly' | 'annual';
  expectedAmount: number;
  isFixed: boolean;
  isPaidThisPeriod: boolean;
  paidAmount: number;
  lastPaidDate?: string;
  paymentCount: number;
}

export interface DashboardSummary {
  totalSpending: number;
  budgetLimit: number;
  utilizationPercentage: number;
  topCategories: CategorySpending[];
  recentExpenses: Expense[];
  alerts: Alert[];
  unreadAlertCount: number;
  pendingExpenses: PendingExpense[];
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  icon: string;
  color: string;
  amount: number;
  budgetLimit: number;
  percentage: number;
}

export interface ChartData {
  dataPoints: DataPoint[];
  total: number;
  average: number;
}

export interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface MonthlyExpenseStatus {
  subCategoryId: string;
  subCategoryName: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryExpenseType?: 'monthly' | 'annual';
  expectedAmount: number; // fixedAmount if fixed, 20% of budgetLimit if not
  isFixed: boolean;
  isPaidThisMonth: boolean;
  paidAmount?: number; // total amount paid this month (sum of all payments)
  paidDate?: string; // date of the last payment
  paymentCount?: number; // number of payments made this month
}

export interface BudgetLimitStatus {
  monthlyLimit: number;
  currentSpending: number;
  remainingAmount: number;
  utilizationPercentage: number;
  isExceeded: boolean;
}
