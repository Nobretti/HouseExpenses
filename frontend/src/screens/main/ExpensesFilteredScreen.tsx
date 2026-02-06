import React, { useEffect, useMemo } from 'react';
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
import Ionicons from 'react-native-vector-icons/Ionicons';
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

  const {
    expenses,
    isLoading,
    pagination,
    fetchExpenses,
    deleteExpense,
  } = useExpenseStore();

  const { categories } = useCategoryStore();

  useEffect(() => {
    fetchExpenses(0);
  }, []);

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
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const period = params.period || 'monthly';

    return expenses.filter(expense => {
      // Period filter
      const expenseDate = new Date(expense.date);
      if (period === 'monthly') {
        if (expenseDate.getMonth() !== currentMonth || expenseDate.getFullYear() !== currentYear) {
          return false;
        }
      } else {
        if (expenseDate.getFullYear() !== currentYear) {
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
  }, [expenses, params.filterSubCategoryId, params.filterCategoryId, params.period]);

  const handleRefresh = () => {
    fetchExpenses(0);
  };

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages - 1) {
      fetchExpenses(pagination.page + 1);
    }
  };

  const handleExpensePress = (expense: Expense) => {
    router.push({
      pathname: '/expense-detail',
      params: { id: expense.id },
    });
  };

  const handleExpenseDelete = async (expense: Expense) => {
    await deleteExpense(expense.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.headerWrapper, isWeb && isWideScreen && styles.webHeader]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{filterName}</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={[styles.periodBanner, isWeb && isWideScreen && styles.webPeriodBanner]}>
          <Ionicons name="calendar-outline" size={16} color={colors.primary} />
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
          isLoading={isLoading}
          onRefresh={handleRefresh}
          onLoadMore={handleLoadMore}
          onExpensePress={handleExpensePress}
          onExpenseDelete={handleExpenseDelete}
          hasMore={pagination.page < pagination.totalPages - 1}
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
