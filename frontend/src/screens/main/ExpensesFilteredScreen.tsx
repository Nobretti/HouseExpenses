import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Icon } from '../../components/common';
import { colors } from '../../constants';
import { useExpenseStore, useCategoryStore } from '../../store';
import { ExpenseList } from '../../components/expenses';
import { Expense } from '../../types';

export const ExpensesFilteredScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    filterSubCategoryId?: string;
    filterCategoryId?: string;
    period?: string;
  }>();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isWideScreen = width > 768;

  // Track if we've loaded fresh data for this screen
  const [hasFreshData, setHasFreshData] = useState(false);

  const {
    expenses,
    isLoading,
    fetchAllExpenses,
    deleteExpense,
  } = useExpenseStore();

  const { categories } = useCategoryStore();

  // Reset fresh data flag when filter params change
  useEffect(() => {
    setHasFreshData(false);
  }, [params.filterSubCategoryId, params.filterCategoryId, params.period]);

  useEffect(() => {
    const loadFreshData = async () => {
      await fetchAllExpenses();
      setHasFreshData(true);
    };
    loadFreshData();
  }, [params.filterSubCategoryId, params.filterCategoryId, params.period]);

  // Determine the filter name for display
  const filterName = useMemo(() => {
    for (const cat of categories) {
      if (params.filterSubCategoryId) {
        const subCat = cat.subCategories?.find(s => s.id === params.filterSubCategoryId);
        if (subCat) return subCat.name;
      }
      if (params.filterCategoryId && cat.id === params.filterCategoryId) {
        return cat.name;
      }
    }
    return 'Filtered';
  }, [params.filterSubCategoryId, params.filterCategoryId, categories]);

  // Filter expenses by subcategory/category and period
  // Only show expenses after fresh data is loaded to avoid showing stale/deleted expenses
  const filteredExpenses = useMemo(() => {
    // Don't show stale data - wait for fresh fetch
    if (!hasFreshData) {
      return [];
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const period = params.period || 'monthly';

    return expenses.filter(expense => {
      // Skip expenses without valid IDs (could be stale/corrupted)
      if (!expense.id || !expense.date) {
        return false;
      }

      // Parse date safely to avoid timezone issues
      // expense.date format is "YYYY-MM-DD" from backend
      const dateParts = expense.date.split('-');
      let expenseYear: number;
      let expenseMonth: number;

      if (dateParts.length >= 3) {
        expenseYear = parseInt(dateParts[0], 10);
        expenseMonth = parseInt(dateParts[1], 10) - 1; // JS months are 0-indexed
      } else {
        // Fallback to Date parsing
        const expenseDate = new Date(expense.date);
        expenseYear = expenseDate.getFullYear();
        expenseMonth = expenseDate.getMonth();
      }

      // Period filter
      if (period === 'monthly') {
        if (expenseMonth !== currentMonth || expenseYear !== currentYear) {
          return false;
        }
      } else {
        if (expenseYear !== currentYear) {
          return false;
        }
      }

      // Category/subcategory filter
      if (params.filterSubCategoryId) {
        return expense.subCategory?.id === params.filterSubCategoryId;
      }
      if (params.filterCategoryId) {
        return expense.category?.id === params.filterCategoryId;
      }
      return true;
    });
  }, [expenses, params.filterSubCategoryId, params.filterCategoryId, params.period, hasFreshData]);

  const handleRefresh = useCallback(async () => {
    setHasFreshData(false);
    await fetchAllExpenses();
    setHasFreshData(true);
  }, [fetchAllExpenses]);

  const handleLoadMore = () => {
    // All expenses are now loaded at once, no pagination needed
  };

  const handleExpensePress = (expense: Expense) => {
    router.push({
      pathname: '/expense-detail',
      params: { id: expense.id },
    });
  };

  const handleExpenseDelete = useCallback(async (expense: Expense) => {
    const success = await deleteExpense(expense.id);
    // Refresh to ensure list is up to date after delete
    if (success) {
      await fetchAllExpenses();
    }
  }, [deleteExpense, fetchAllExpenses]);

  // Show loading when fetching fresh data
  const showLoading = isLoading || !hasFreshData;

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.headerWrapper, isWeb && isWideScreen && styles.webHeader]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{filterName}</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={[styles.periodBanner, isWeb && isWideScreen && styles.webPeriodBanner]}>
          <Icon name="calendar-outline" size={16} color={colors.primary} />
          <Text style={styles.periodText}>
            {params.period === 'annual'
              ? new Date().getFullYear().toString()
              : new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
          <Text style={styles.countText}>
            {filteredExpenses.length} {filteredExpenses.length === 1 ? 'expense' : 'expenses'}
          </Text>
        </View>
      </View>

      <View style={[styles.listContainer, isWeb && isWideScreen && styles.webListContainer]}>
        <ExpenseList
          expenses={filteredExpenses}
          isLoading={showLoading}
          onRefresh={handleRefresh}
          onLoadMore={handleLoadMore}
          onExpensePress={handleExpensePress}
          onExpenseDelete={handleExpenseDelete}
          hasMore={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 16,
  },
  headerWrapper: {
    backgroundColor: colors.background,
  },
  webHeader: {
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    width: '100%',
    maxWidth: 1200,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  periodBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 24,
    marginBottom: 8,
    borderRadius: 10,
  },
  webPeriodBanner: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: 8,
    flex: 1,
  },
  countText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 0,
  },
  webListContainer: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1200,
  },
});

export default ExpensesFilteredScreen;
