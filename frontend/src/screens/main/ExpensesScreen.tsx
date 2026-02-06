import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Icon } from '../../components/common';
import { colors } from '../../constants';
import { useExpenseStore, useCategoryStore } from '../../store';
import { Card, CategoryIcon, LoadingSpinner, EmptyState } from '../../components/common';
import { Expense, Category } from '../../types';

interface GroupedSubCategory {
  subCategoryId: string;
  subCategoryName: string;
  totalAmount: number;
  paymentCount: number;
}

interface GroupedCategory {
  category: Category;
  totalAmount: number;
  subCategories: GroupedSubCategory[];
}

export const ExpensesScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    filterSubCategoryId?: string;
    filterCategoryId?: string;
  }>();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isWideScreen = width > 768;

  const [activeTab, setActiveTab] = useState<'monthly' | 'annual'>('monthly');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const {
    expenses,
    isLoading,
    fetchExpenses,
  } = useExpenseStore();

  const { categories, fetchCategories } = useCategoryStore();

  // If we navigated here with a filter, redirect to the filtered list view
  useEffect(() => {
    if (params.filterSubCategoryId || params.filterCategoryId) {
      // Clear params and stay on this screen - the old filter behavior
      // is now handled by tapping subcategories in the collapsible view
    }
  }, [params.filterSubCategoryId, params.filterCategoryId]);

  useEffect(() => {
    fetchExpenses(0);
    fetchCategories();
  }, []);

  // Filter expenses by tab (category type) and current period
  const periodFilteredExpenses = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Build a lookup of category expenseType from the categories store
    const categoryTypeMap = new Map<string, string>();
    for (const cat of categories) {
      categoryTypeMap.set(cat.id, cat.expenseType);
    }

    return expenses.filter(expense => {
      // Determine category type: prefer store data, fallback to expense's embedded category
      const catId = expense.category?.id;
      const catType = (catId && categoryTypeMap.get(catId)) || (expense.category as any)?.expenseType;

      // Filter by category type matching the active tab
      if (catType && catType !== activeTab) return false;

      // Date filter: monthly tab = current month, annual tab = current year
      const expenseDate = new Date(expense.date);
      if (activeTab === 'monthly') {
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      } else {
        return expenseDate.getFullYear() === currentYear;
      }
    });
  }, [expenses, activeTab, categories]);

  // Group expenses by category → subcategory
  const groupedExpenses = useMemo((): GroupedCategory[] => {
    const categoryMap = new Map<string, {
      category: Category | null;
      totalAmount: number;
      subCategoryMap: Map<string, GroupedSubCategory>;
    }>();

    for (const expense of periodFilteredExpenses) {
      const catId = expense.category?.id || 'uncategorized';

      if (!categoryMap.has(catId)) {
        categoryMap.set(catId, {
          category: expense.category || null,
          totalAmount: 0,
          subCategoryMap: new Map(),
        });
      }

      const group = categoryMap.get(catId)!;
      group.totalAmount += expense.amount;

      const subCatId = expense.subCategory?.id || 'no-subcategory';
      const subCatName = expense.subCategory?.name || 'Other';

      if (!group.subCategoryMap.has(subCatId)) {
        group.subCategoryMap.set(subCatId, {
          subCategoryId: subCatId,
          subCategoryName: subCatName,
          totalAmount: 0,
          paymentCount: 0,
        });
      }

      const subGroup = group.subCategoryMap.get(subCatId)!;
      subGroup.totalAmount += expense.amount;
      subGroup.paymentCount += 1;
    }

    // Convert to array and sort by total amount descending
    const result: GroupedCategory[] = [];
    for (const [, group] of categoryMap) {
      // Find the full category from the store (has icon/color)
      const fullCategory = group.category
        ? categories.find(c => c.id === group.category!.id) || group.category
        : null;

      if (!fullCategory) continue;

      result.push({
        category: fullCategory,
        totalAmount: group.totalAmount,
        subCategories: Array.from(group.subCategoryMap.values())
          .sort((a, b) => b.totalAmount - a.totalAmount),
      });
    }

    return result.sort((a, b) => b.totalAmount - a.totalAmount);
  }, [periodFilteredExpenses, categories]);

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  const handleRefresh = () => {
    fetchExpenses(0);
    fetchCategories();
  };

  const handleSubCategoryPress = (categoryId: string, subCategoryId: string) => {
    if (subCategoryId === 'no-subcategory') {
      router.push({
        pathname: '/expenses-filtered',
        params: { filterCategoryId: categoryId, period: activeTab },
      });
    } else {
      router.push({
        pathname: '/expenses-filtered',
        params: { filterSubCategoryId: subCategoryId, period: activeTab },
      });
    }
  };

  // Total spent in the period
  const totalSpent = useMemo(() => {
    return periodFilteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [periodFilteredExpenses]);

  const periodLabel = activeTab === 'monthly'
    ? new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
    : new Date().getFullYear().toString();

  if (isLoading && expenses.length === 0) {
    return <LoadingSpinner fullScreen message="Loading expenses..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.headerWrapper, isWeb && isWideScreen && styles.webHeader]}>
        <View style={styles.header}>
          <Text style={styles.title}>Expenses</Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => router.push('/expense-filter')}
          >
            <Icon name="filter-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Monthly / Annual Tabs */}
      <View style={[styles.tabsWrapper, isWeb && isWideScreen && styles.webTabsWrapper]}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'monthly' && styles.tabActive]}
            onPress={() => setActiveTab('monthly')}
          >
            <Text style={[styles.tabText, activeTab === 'monthly' && styles.tabTextActive]}>
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'annual' && styles.tabActive]}
            onPress={() => setActiveTab('annual')}
          >
            <Text style={[styles.tabText, activeTab === 'annual' && styles.tabTextActive]}>
              Annual
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          isWeb && isWideScreen && styles.webContent,
          groupedExpenses.length === 0 && styles.emptyContent,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Period Summary */}
        {groupedExpenses.length > 0 && (
          <View style={styles.periodSummary}>
            <Text style={styles.periodLabel}>{periodLabel}</Text>
            <Text style={styles.periodTotal}>
              {'\u20AC'}{totalSpent.toFixed(2)}
            </Text>
          </View>
        )}

        {/* Grouped Categories */}
        {groupedExpenses.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title={`No expenses this ${activeTab === 'monthly' ? 'month' : 'year'}`}
            description="Tap the + button to add your first expense"
          />
        ) : (
          groupedExpenses.map((group) => {
            const isExpanded = expandedCategories.has(group.category.id);
            const hasSubCategories = group.subCategories.length > 0;

            return (
              <Card key={group.category.id} style={styles.categoryCard}>
                <TouchableOpacity
                  style={styles.categoryHeader}
                  onPress={() => toggleCategory(group.category.id)}
                  activeOpacity={0.7}
                >
                  {/* Expand/Collapse Toggle */}
                  <Icon
                    name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                    size={20}
                    color={hasSubCategories ? colors.textSecondary : 'transparent'}
                    style={styles.expandIcon}
                  />

                  {/* Category Icon */}
                  <CategoryIcon
                    icon={group.category.icon}
                    color={group.category.color}
                    size="medium"
                  />

                  {/* Category Name & Total */}
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{group.category.name}</Text>
                    <Text style={styles.categorySubCount}>
                      {group.subCategories.length} {group.subCategories.length === 1 ? 'subcategory' : 'subcategories'}
                    </Text>
                  </View>

                  {/* Category Total */}
                  <Text style={styles.categoryTotal}>
                    {'\u20AC'}{group.totalAmount.toFixed(2)}
                  </Text>
                </TouchableOpacity>

                {/* Subcategories List - Collapsible */}
                {hasSubCategories && isExpanded && (
                  <View style={styles.subCategoriesList}>
                    {group.subCategories.map((sub, index) => (
                      <View key={sub.subCategoryId}>
                        <TouchableOpacity
                          style={styles.subCategoryRow}
                          onPress={() => handleSubCategoryPress(group.category.id, sub.subCategoryId)}
                          activeOpacity={0.6}
                        >
                          <View style={styles.subCategoryLeft}>
                            <View style={[styles.subCategoryDot, { backgroundColor: group.category.color }]} />
                            <View style={styles.subCategoryInfo}>
                              <Text style={styles.subCategoryName}>{sub.subCategoryName}</Text>
                              <Text style={styles.subCategoryPayments}>
                                {sub.paymentCount} {sub.paymentCount === 1 ? 'payment' : 'payments'}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.subCategoryRight}>
                            <Text style={styles.subCategoryAmount}>
                              {'\u20AC'}{sub.totalAmount.toFixed(2)}
                            </Text>
                            <Icon name="chevron-forward" size={16} color={colors.textLight} />
                          </View>
                        </TouchableOpacity>
                        {index < group.subCategories.length - 1 && (
                          <View style={styles.subCategoryDivider} />
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            );
          })
        )}

        {groupedExpenses.length > 0 && <View style={styles.bottomSpacing} />}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, isWeb && isWideScreen && styles.webFab]}
        onPress={() => router.push('/add-expense')}
      >
        <Icon name="add" size={28} color={colors.surface} />
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
  // Tabs
  tabsWrapper: {
    paddingHorizontal: 24,
  },
  webTabsWrapper: {
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    width: '100%',
    maxWidth: 1200,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.surface,
    fontWeight: '600',
  },
  // ScrollView
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  webContent: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1200,
  },
  // Period Summary
  periodSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  periodLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  periodTotal: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  // Category Card
  categoryCard: {
    marginBottom: 12,
    paddingVertical: 0,
    paddingHorizontal: 0,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingLeft: 12,
  },
  expandIcon: {
    marginRight: 4,
  },
  categoryInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  categorySubCount: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  categoryTotal: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  // Subcategories
  subCategoriesList: {
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  subCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  subCategoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subCategoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 14,
    marginLeft: 4,
  },
  subCategoryInfo: {
    flex: 1,
  },
  subCategoryName: {
    fontSize: 15,
    color: colors.text,
  },
  subCategoryPayments: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  subCategoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subCategoryAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    marginRight: 8,
  },
  subCategoryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 26,
  },
  // Bottom spacing
  bottomSpacing: {
    height: 80,
  },
  // FAB
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
