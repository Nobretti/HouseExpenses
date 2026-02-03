import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants';
import { useDashboardStore, useCategoryStore, useAuthStore } from '../../store';
import { LoadingSpinner, Card } from '../../components/common';
import { MandatoryExpensesCard, BudgetLimitCard } from '../../components/dashboard';
import { formatCurrency } from '../../utils';
import { MonthlyExpenseStatus, BudgetLimitStatus } from '../../types';

export const DashboardScreen: React.FC = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isWideScreen = width > 768;

  const {
    summary,
    weeklyData,
    monthlyData,
    annualData,
    isLoading,
    unreadAlertCount,
    unpaidAlerts,
    currentDate,
    refreshDashboard,
    selectedYear,
    selectedMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    checkMonthChange,
    dismissUnpaidAlert,
  } = useDashboardStore();

  const now = new Date();
  const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === now.getMonth() + 1;
  const isFirstMonth = selectedYear === 2026 && selectedMonth === 1; // Calendar starts at Jan 2026

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const displayMonth = monthNamesShort[selectedMonth - 1];
  const displayPeriod = isCurrentMonth ? 'This Month' : `${displayMonth} ${selectedYear}`;

  // Format current date display
  const formattedDate = useMemo(() => {
    const d = currentDate || now;
    return {
      dayName: dayNames[d.getDay()],
      day: d.getDate(),
      month: monthNames[d.getMonth()],
      year: d.getFullYear(),
    };
  }, [currentDate]);

  const { categories, fetchCategories } = useCategoryStore();
  const { user } = useAuthStore();

  // Compute mandatory unpaid expenses from categories
  // Only shows mandatory subcategories (fixed or isMandatory) that are unpaid
  // Includes both monthly and annual categories
  const monthlyExpenses = useMemo((): MonthlyExpenseStatus[] => {
    const result: MonthlyExpenseStatus[] = [];
    const currentMonth = selectedMonth - 1;
    const currentYear = selectedYear;

    categories.forEach((category) => {
      const isAnnual = category.expenseType === 'annual';

      category.subCategories?.forEach((subCategory) => {
        const isFixed = !!subCategory.fixedAmount;
        const isMandatory = isFixed || !!subCategory.isMandatory;

        // Only show mandatory subcategories
        if (!isMandatory) return;

        // For fixed expenses: use exact fixedAmount
        // For non-fixed: use 20% of budgetLimit as expected
        const expectedAmount = isFixed
          ? (subCategory.fixedAmount || 0)
          : ((subCategory.budgetLimit || 0) * 0.2);

        // Skip subcategories with no budget/fixed amount set
        if (expectedAmount === 0 && !subCategory.budgetLimit && !subCategory.fixedAmount) return;

        // For annual categories, check against the full year; for monthly, check the month
        const paidExpenses = summary?.recentExpenses.filter((expense) => {
          const expenseDate = new Date(expense.date);
          if (isAnnual) {
            return (
              expense.subCategory?.id === subCategory.id &&
              expenseDate.getFullYear() === currentYear
            );
          }
          return (
            expense.subCategory?.id === subCategory.id &&
            expenseDate.getMonth() === currentMonth &&
            expenseDate.getFullYear() === currentYear
          );
        }) || [];

        const totalPaidAmount = paidExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const lastPaymentDate = paidExpenses.length > 0
          ? paidExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
          : undefined;

        const isPaidThisMonth = totalPaidAmount >= expectedAmount;

        // Only include unpaid items
        if (isPaidThisMonth) return;

        result.push({
          subCategoryId: subCategory.id,
          subCategoryName: subCategory.name,
          categoryId: category.id,
          categoryName: category.name,
          categoryColor: category.color,
          expectedAmount: isFixed ? expectedAmount : (subCategory.budgetLimit || 0), // Show full budget limit for non-fixed
          isFixed,
          isPaidThisMonth: false,
          paidAmount: totalPaidAmount > 0 ? totalPaidAmount : undefined,
          paidDate: lastPaymentDate,
          paymentCount: paidExpenses.length,
        });
      });
    });

    return result;
  }, [categories, summary?.recentExpenses, selectedMonth, selectedYear]);

  // Compute budget limit status
  const budgetLimitStatus = useMemo((): BudgetLimitStatus | null => {
    if (!user?.monthlyBudgetLimit) return null;

    const currentSpending = monthlyData?.total || 0;
    const monthlyLimit = user.monthlyBudgetLimit;
    const remainingAmount = monthlyLimit - currentSpending;
    const utilizationPercentage = monthlyLimit > 0 ? (currentSpending / monthlyLimit) * 100 : 0;

    return {
      monthlyLimit,
      currentSpending,
      remainingAmount,
      utilizationPercentage,
      isExceeded: currentSpending > monthlyLimit,
    };
  }, [user?.monthlyBudgetLimit, monthlyData?.total]);

  useEffect(() => {
    refreshDashboard();
    fetchCategories();
  }, []);

  // Check for month change when categories and summary are loaded
  useEffect(() => {
    if (categories.length > 0 && summary?.recentExpenses) {
      checkMonthChange(categories, summary.recentExpenses);
    }
  }, [categories, summary?.recentExpenses]);

  const handleRefresh = () => {
    refreshDashboard();
    fetchCategories();
  };

  const handlePayMonthlyExpense = (expense: MonthlyExpenseStatus) => {
    router.push({
      pathname: '/add-expense',
      params: {
        presetSubCategoryId: expense.subCategoryId,
        presetCategoryId: expense.categoryId,
        presetAmount: expense.expectedAmount.toString(),
        presetIsFixed: expense.isFixed ? 'true' : 'false',
      },
    });
  };

  const handleViewExpenses = (expense: MonthlyExpenseStatus) => {
    // Navigate to expenses screen filtered by this subcategory
    router.push({
      pathname: '/(tabs)/expenses',
      params: {
        filterSubCategoryId: expense.subCategoryId,
        filterCategoryId: expense.categoryId,
      },
    });
  };

  if (isLoading && !summary) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.headerWrapper, isWeb && isWideScreen && styles.webHeader]}>
        <View style={styles.header}>
          <View style={styles.dateCard}>
            <View style={styles.dateIconContainer}>
              <Ionicons name="calendar" size={20} color={colors.primary} />
            </View>
            <View style={styles.dateTextContainer}>
              <Text style={styles.dateDayName}>{formattedDate.dayName}</Text>
              <Text style={styles.dateFullDate}>
                {formattedDate.day} {formattedDate.month} {formattedDate.year}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.alertButton}
            onPress={() => router.push('/alerts')}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            {(unreadAlertCount > 0 || unpaidAlerts.length > 0) && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {(unreadAlertCount + unpaidAlerts.length) > 9 ? '9+' : unreadAlertCount + unpaidAlerts.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          isWeb && isWideScreen && styles.webContent,
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
        <View style={[styles.mainContent, isWeb && isWideScreen && styles.webMainContent]}>
      
          {/* Period Selector */}
          <View style={styles.periodSelector}>
            <TouchableOpacity
              onPress={goToPreviousMonth}
              style={[styles.periodNavButton, isFirstMonth && styles.periodNavButtonDisabled]}
              disabled={isFirstMonth}
            >
              <Ionicons name="chevron-back" size={24} color={isFirstMonth ? colors.textLight : colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={goToCurrentMonth} style={styles.periodDisplay}>
              <Text style={styles.periodText}>{displayPeriod}</Text>
              {!isCurrentMonth && (
                <Text style={styles.periodHint}>Tap to go to current</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={goToNextMonth}
              style={[styles.periodNavButton, isCurrentMonth && styles.periodNavButtonDisabled]}
              disabled={isCurrentMonth}
            >
              <Ionicons name="chevron-forward" size={24} color={isCurrentMonth ? colors.textLight : colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Spending Overview Card */}
          <Card variant="elevated" style={styles.spendingCard}>
            <View style={styles.spendingMain}>
              <Text style={styles.spendingMainLabel}>
                {isCurrentMonth ? 'Spent this month' : `Spent in ${displayMonth}`}
              </Text>
              <Text style={styles.spendingMainAmount}>
                {formatCurrency(monthlyData?.total || 0)}
              </Text>
            </View>
            <View style={styles.spendingDivider} />
            <View style={styles.spendingRow}>
              {isCurrentMonth && (
                <>
                  <View style={styles.spendingItem}>
                    <View style={[styles.spendingIcon, { backgroundColor: `${colors.primary}15` }]}>
                      <Ionicons name="today-outline" size={18} color={colors.primary} />
                    </View>
                    <View style={styles.spendingItemInfo}>
                      <Text style={styles.spendingItemLabel}>This Week</Text>
                      <Text style={styles.spendingItemValue}>{formatCurrency(weeklyData?.total || 0)}</Text>
                    </View>
                  </View>
                  <View style={styles.spendingItemDivider} />
                </>
              )}
              <View style={styles.spendingItem}>
                <View style={[styles.spendingIcon, { backgroundColor: `${colors.success}15` }]}>
                  <Ionicons name="calendar-outline" size={18} color={colors.success} />
                </View>
                <View style={styles.spendingItemInfo}>
                  <Text style={styles.spendingItemLabel}>{isCurrentMonth ? 'This Year' : `${selectedYear} Total`}</Text>
                  <Text style={styles.spendingItemValue}>{formatCurrency(annualData?.total || 0)}</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Budget Limit Status */}
          {budgetLimitStatus && (
            <BudgetLimitCard budgetStatus={budgetLimitStatus} />
          )}

          {/* Monthly Expenses Status */}
          <MandatoryExpensesCard
            mandatoryExpenses={monthlyExpenses}
            onPayExpense={handlePayMonthlyExpense}
            onViewExpenses={handleViewExpenses}
          />

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerWrapper: {
    backgroundColor: colors.background,
    marginTop: 20
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
    paddingBottom: 16,
    width: '100%',
    maxWidth: 1200,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    flex: 1,
    marginRight: 12,
  },
  dateIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dateTextContainer: {
    flex: 1,
  },
  dateDayName: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateFullDate: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  alertButton: {
    position: 'relative',
    padding: 8,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
  },
  webContent: {
    alignItems: 'center',
  },
  mainContent: {
    width: '100%',
  },
  webMainContent: {
    maxWidth: 1200,
  },
  unpaidAlertCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: `${colors.danger}08`,
    borderWidth: 1,
    borderColor: `${colors.danger}30`,
  },
  unpaidAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  unpaidAlertIcon: {
    marginRight: 12,
  },
  unpaidAlertInfo: {
    flex: 1,
  },
  unpaidAlertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.danger,
  },
  unpaidAlertSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  unpaidAlertDismiss: {
    padding: 4,
  },
  unpaidAlertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: `${colors.danger}20`,
  },
  unpaidAlertItemLast: {
    paddingBottom: 0,
  },
  unpaidAlertName: {
    fontSize: 14,
    color: colors.text,
  },
  unpaidAlertAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.danger,
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  periodNavButton: {
    padding: 8,
    backgroundColor: colors.surface,
    borderRadius: 10,
  },
  periodNavButtonDisabled: {
    opacity: 0.4,
  },
  periodDisplay: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  periodText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  periodHint: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 2,
  },
  spendingCard: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  spendingMain: {
    alignItems: 'center',
    marginBottom: 20,
  },
  spendingMainLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  spendingMainAmount: {
    fontSize: 42,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -1,
  },
  spendingDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 18,
  },
  spendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spendingItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  spendingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spendingItemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  spendingItemLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  spendingItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  spendingItemDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  quickActions: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
});

export default DashboardScreen;
