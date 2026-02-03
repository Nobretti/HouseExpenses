import React, { useEffect, useState, useMemo } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants';
import { useExpenseStore, useDashboardStore, useCategoryStore } from '../../store';
import { ExpenseList } from '../../components/expenses';
import { TopCategories } from '../../components/dashboard';
import { Expense } from '../../types';

export const ExpensesScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    filterSubCategoryId?: string;
    filterCategoryId?: string;
  }>();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isWideScreen = width > 768;

  const [activeFilter, setActiveFilter] = useState<{
    subCategoryId?: string;
    categoryId?: string;
  } | null>(null);

  const {
    expenses,
    isLoading,
    pagination,
    fetchExpenses,
    deleteExpense,
  } = useExpenseStore();

  const { categories } = useCategoryStore();

  const {
    categoryBreakdown,
    isLoading: dashboardLoading,
    fetchCategoryBreakdown,
  } = useDashboardStore();

  // Set filter from params
  useEffect(() => {
    if (params.filterSubCategoryId || params.filterCategoryId) {
      setActiveFilter({
        subCategoryId: params.filterSubCategoryId,
        categoryId: params.filterCategoryId,
      });
    }
  }, [params.filterSubCategoryId, params.filterCategoryId]);

  useEffect(() => {
    fetchExpenses(0);
    fetchCategoryBreakdown('monthly');
  }, []);

  // Get filter name for display
  const filterName = useMemo(() => {
    if (!activeFilter) return null;

    for (const cat of categories) {
      if (activeFilter.subCategoryId) {
        const subCat = cat.subCategories?.find(s => s.id === activeFilter.subCategoryId);
        if (subCat) return subCat.name;
      }
      if (activeFilter.categoryId && cat.id === activeFilter.categoryId) {
        return cat.name;
      }
    }
    return 'Filtered';
  }, [activeFilter, categories]);

  // Filter expenses based on active filter
  const filteredExpenses = useMemo(() => {
    if (!activeFilter) return expenses;

    return expenses.filter(expense => {
      if (activeFilter.subCategoryId) {
        return expense.subCategory?.id === activeFilter.subCategoryId;
      }
      if (activeFilter.categoryId) {
        return expense.category?.id === activeFilter.categoryId;
      }
      return true;
    });
  }, [expenses, activeFilter]);

  const handleRefresh = () => {
    fetchExpenses(0);
    fetchCategoryBreakdown('monthly');
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
    // Refresh dashboard after deleting
    fetchCategoryBreakdown('monthly');
  };

  const clearFilter = () => {
    setActiveFilter(null);
    router.setParams({ filterSubCategoryId: undefined, filterCategoryId: undefined });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.headerWrapper, isWeb && isWideScreen && styles.webHeader]}>
        <View style={styles.header}>
          <Text style={styles.title}>Expenses</Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => router.push('/expense-filter')}
          >
            <Ionicons name="filter-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Active Filter Banner */}
        {activeFilter && (
          <View style={styles.filterBanner}>
            <View style={styles.filterBannerLeft}>
              <Ionicons name="funnel" size={16} color={colors.primary} />
              <Text style={styles.filterBannerText}>Showing: {filterName}</Text>
            </View>
            <TouchableOpacity onPress={clearFilter} style={styles.clearFilterButton}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={[styles.listContainer, isWeb && isWideScreen && styles.webListContainer]}>
        <ExpenseList
          expenses={filteredExpenses}
          isLoading={isLoading || dashboardLoading}
          onRefresh={handleRefresh}
          onLoadMore={handleLoadMore}
          onExpensePress={handleExpensePress}
          onExpenseDelete={handleExpenseDelete}
          hasMore={!activeFilter && pagination.page < pagination.totalPages - 1}
          ListHeaderComponent={
            !activeFilter ? (
              <TopCategories
                categories={categoryBreakdown}
                onSeeAll={() => router.push('/(tabs)/categories')}
              />
            ) : undefined
          }
        />
      </View>

      <TouchableOpacity
        style={[styles.fab, isWeb && isWideScreen && styles.webFab]}
        onPress={() => router.push('/add-expense')}
      >
        <Ionicons name="add" size={28} color={colors.surface} />
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    width: '100%',
    maxWidth: 1200,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  filterButton: {
    padding: 8,
    backgroundColor: colors.surface,
    borderRadius: 10,
  },
  filterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 24,
    marginBottom: 12,
    borderRadius: 10,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  filterBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  filterBannerText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: 8,
  },
  clearFilterButton: {
    padding: 4,
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  webFab: {
    bottom: 32,
    right: 32,
    width: 64,
    height: 64,
    borderRadius: 32,
  },
});

export default ExpensesScreen;
