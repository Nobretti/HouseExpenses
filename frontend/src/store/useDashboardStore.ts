import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { DashboardSummary, ChartData, CategorySpending, BudgetPeriod, Alert, BudgetStatusDTO } from '../types';
import { dashboardService, budgetService, DateFilter } from '../services';

const LAST_CHECKED_MONTH_KEY = 'lastCheckedMonth';

// Storage helper that works on both web and native
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
};

interface UnpaidExpenseAlert {
  id: string;
  type: 'unpaid_expense';
  message: string;
  subCategoryName: string;
  categoryName: string;
  expectedAmount: number;
  month: number;
  year: number;
  createdAt: string;
}

interface DashboardState {
  summary: DashboardSummary | null;
  weeklyData: ChartData | null;
  monthlyData: ChartData | null;
  annualData: ChartData | null;
  categoryBreakdown: CategorySpending[];
  budgetStatuses: BudgetStatusDTO[];
  alerts: Alert[];
  unpaidAlerts: UnpaidExpenseAlert[];
  unreadAlertCount: number;
  isLoading: boolean;
  error: string | null;
  // Selected period for historical view
  selectedYear: number;
  selectedMonth: number;
  // Current date tracking
  currentDate: Date;

  // Actions
  fetchSummary: (filter?: DateFilter) => Promise<void>;
  fetchWeeklyData: (filter?: DateFilter) => Promise<void>;
  fetchMonthlyData: (filter?: DateFilter) => Promise<void>;
  fetchAnnualData: (filter?: DateFilter) => Promise<void>;
  fetchCategoryBreakdown: (period?: BudgetPeriod) => Promise<void>;
  fetchBudgetStatuses: () => Promise<void>;
  fetchAlerts: () => Promise<void>;
  markAlertAsRead: (id: string) => Promise<void>;
  markAllAlertsAsRead: () => Promise<void>;
  refreshDashboard: (filter?: DateFilter) => Promise<void>;
  setSelectedPeriod: (year: number, month: number) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToCurrentMonth: () => void;
  checkMonthChange: (categories: any[], expenses: any[]) => Promise<void>;
  dismissUnpaidAlert: (id: string) => void;
  reset: () => void;
}

const now = new Date();

export const useDashboardStore = create<DashboardState>((set, get) => ({
  summary: null,
  weeklyData: null,
  monthlyData: null,
  annualData: null,
  categoryBreakdown: [],
  budgetStatuses: [],
  alerts: [],
  unpaidAlerts: [],
  unreadAlertCount: 0,
  isLoading: false,
  error: null,
  selectedYear: now.getFullYear(),
  selectedMonth: now.getMonth() + 1,
  currentDate: now,

  fetchSummary: async (filter?: DateFilter) => {
    set({ isLoading: true, error: null });
    try {
      const summary = await dashboardService.getSummary(filter);
      set({
        summary,
        unreadAlertCount: summary?.unreadAlertCount || 0,
        isLoading: false,
      });
    } catch (error) {
      set({ error: 'Failed to load summary', isLoading: false });
    }
  },

  fetchWeeklyData: async (filter?: DateFilter) => {
    try {
      const weeklyData = await dashboardService.getWeeklyData(filter);
      set({ weeklyData });
    } catch (error) {
      console.error('Failed to load weekly data', error);
    }
  },

  fetchMonthlyData: async (filter?: DateFilter) => {
    try {
      const monthlyData = await dashboardService.getMonthlyData(filter);
      set({ monthlyData });
    } catch (error) {
      console.error('Failed to load monthly data', error);
    }
  },

  fetchAnnualData: async (filter?: DateFilter) => {
    try {
      const annualData = await dashboardService.getAnnualData(filter);
      set({ annualData });
    } catch (error) {
      console.error('Failed to load annual data', error);
    }
  },

  fetchCategoryBreakdown: async (period = 'monthly') => {
    try {
      const categoryBreakdown = await dashboardService.getCategoryBreakdown(period);
      set({ categoryBreakdown });
    } catch (error) {
      console.error('Failed to load category breakdown', error);
    }
  },

  fetchBudgetStatuses: async () => {
    try {
      const budgetStatuses = await budgetService.getAllBudgetStatuses();
      set({ budgetStatuses });
    } catch (error) {
      console.error('Failed to load budget statuses', error);
    }
  },

  fetchAlerts: async () => {
    try {
      const alerts = await budgetService.getUnreadAlerts();
      const unreadAlertCount = await budgetService.getUnreadCount();
      set({ alerts, unreadAlertCount });
    } catch (error) {
      console.error('Failed to load alerts', error);
    }
  },

  markAlertAsRead: async (id) => {
    await budgetService.markAlertAsRead(id);
    set({
      alerts: get().alerts.map((a) =>
        a.id === id ? { ...a, isRead: true } : a
      ),
      unreadAlertCount: Math.max(0, get().unreadAlertCount - 1),
    });
  },

  markAllAlertsAsRead: async () => {
    await budgetService.markAllAlertsAsRead();
    set({
      alerts: get().alerts.map((a) => ({ ...a, isRead: true })),
      unreadAlertCount: 0,
    });
  },

  refreshDashboard: async (filter?: DateFilter) => {
    set({ isLoading: true });
    const currentFilter = filter || { year: get().selectedYear, month: get().selectedMonth };
    await Promise.all([
      get().fetchSummary(currentFilter),
      get().fetchWeeklyData(currentFilter),
      get().fetchMonthlyData(currentFilter),
      get().fetchAnnualData({ year: currentFilter.year }),
      get().fetchBudgetStatuses(),
      get().fetchAlerts(),
    ]);
    set({ isLoading: false });
  },

  setSelectedPeriod: (year: number, month: number) => {
    set({ selectedYear: year, selectedMonth: month });
    get().refreshDashboard({ year, month });
  },

  goToPreviousMonth: () => {
    const { selectedYear, selectedMonth } = get();

    // Don't allow going before January 2026
    if (selectedYear === 2026 && selectedMonth <= 1) {
      return;
    }

    let newMonth = selectedMonth - 1;
    let newYear = selectedYear;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }

    // Additional check to not go before 2026
    if (newYear < 2026) {
      return;
    }

    get().setSelectedPeriod(newYear, newMonth);
  },

  goToNextMonth: () => {
    const { selectedYear, selectedMonth } = get();
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Don't allow going past current month
    if (selectedYear === currentYear && selectedMonth >= currentMonth) {
      return;
    }

    let newMonth = selectedMonth + 1;
    let newYear = selectedYear;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    get().setSelectedPeriod(newYear, newMonth);
  },

  goToCurrentMonth: () => {
    const now = new Date();
    get().setSelectedPeriod(now.getFullYear(), now.getMonth() + 1);
  },

  checkMonthChange: async (categories: any[], expenses: any[]) => {
    try {
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
      const lastChecked = await storage.getItem(LAST_CHECKED_MONTH_KEY);

      // Update current date
      set({ currentDate: now });

      if (lastChecked && lastChecked !== currentMonthKey) {
        // Month has changed! Check for unpaid fixed expenses from previous month
        const [lastYear, lastMonth] = lastChecked.split('-').map(Number);
        const unpaidAlerts: UnpaidExpenseAlert[] = [];

        categories.forEach((category: any) => {
          if (category.expenseType !== 'monthly') return;

          category.subCategories?.forEach((subCategory: any) => {
            // Only check fixed expenses for unpaid alerts
            if (!subCategory.fixedAmount) return;

            const expectedAmount = subCategory.fixedAmount;

            // Check if this was paid in the previous month
            // Parse date string directly to avoid timezone issues with new Date()
            const paidExpenses = expenses.filter((expense: any) => {
              if (expense.subCategory?.id !== subCategory.id) return false;
              const dateParts = String(expense.date).split('-');
              const expMonth = parseInt(dateParts[1], 10);
              const expYear = parseInt(dateParts[0], 10);
              return expMonth === lastMonth && expYear === lastYear;
            });

            const totalPaid = paidExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);

            if (totalPaid < expectedAmount) {
              unpaidAlerts.push({
                id: `unpaid-${subCategory.id}-${lastMonth}-${lastYear}`,
                type: 'unpaid_expense',
                message: `${subCategory.name} was not fully paid in ${lastMonth}/${lastYear}`,
                subCategoryName: subCategory.name,
                categoryName: category.name,
                expectedAmount,
                month: lastMonth,
                year: lastYear,
                createdAt: now.toISOString(),
              });
            }
          });
        });

        if (unpaidAlerts.length > 0) {
          set({ unpaidAlerts });
        }
      }

      // Save current month as last checked
      await storage.setItem(LAST_CHECKED_MONTH_KEY, currentMonthKey);
    } catch (error) {
      console.error('Error checking month change:', error);
    }
  },

  dismissUnpaidAlert: (id: string) => {
    set({ unpaidAlerts: get().unpaidAlerts.filter((a) => a.id !== id) });
  },

  reset: () => {
    const now = new Date();
    set({
      summary: null,
      weeklyData: null,
      monthlyData: null,
      annualData: null,
      categoryBreakdown: [],
      budgetStatuses: [],
      alerts: [],
      unpaidAlerts: [],
      unreadAlertCount: 0,
      isLoading: false,
      error: null,
      selectedYear: now.getFullYear(),
      selectedMonth: now.getMonth() + 1,
      currentDate: now,
    });
  },
}));
