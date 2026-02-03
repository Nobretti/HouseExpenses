import { useCallback } from 'react';
import { useDashboardStore } from '../store';

export const useBudgets = () => {
  const store = useDashboardStore();

  const refresh = useCallback(() => {
    store.fetchBudgetStatuses();
  }, []);

  const refreshAlerts = useCallback(() => {
    store.fetchAlerts();
  }, []);

  const markAlertRead = useCallback(async (id: string) => {
    await store.markAlertAsRead(id);
  }, []);

  const markAllAlertsRead = useCallback(async () => {
    await store.markAllAlertsAsRead();
  }, []);

  return {
    budgetStatuses: store.budgetStatuses,
    alerts: store.alerts,
    unreadAlertCount: store.unreadAlertCount,
    isLoading: store.isLoading,
    refresh,
    refreshAlerts,
    markAlertRead,
    markAllAlertsRead,
  };
};
