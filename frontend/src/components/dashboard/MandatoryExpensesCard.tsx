import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from '../common';
import { colors } from '../../constants';
import { MonthlyExpenseStatus } from '../../types';
import { formatCurrency } from '../../utils';
import { Card } from '../common';

interface MandatoryExpensesCardProps {
  mandatoryExpenses: MonthlyExpenseStatus[];
  onPayExpense: (expense: MonthlyExpenseStatus) => void;
  onViewExpenses?: (expense: MonthlyExpenseStatus) => void;
  activeTab: 'monthly' | 'annual';
  onTabChange: (tab: 'monthly' | 'annual') => void;
}

export const MandatoryExpensesCard: React.FC<MandatoryExpensesCardProps> = ({
  mandatoryExpenses,
  onPayExpense,
  onViewExpenses,
  activeTab,
  onTabChange,
}) => {
  const tabSelector = (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.miniTab, activeTab === 'monthly' && styles.miniTabActive]}
        onPress={() => onTabChange('monthly')}
      >
        <Text style={[styles.miniTabText, activeTab === 'monthly' && styles.miniTabTextActive]}>
          This Month
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.miniTab, activeTab === 'annual' && styles.miniTabActive]}
        onPress={() => onTabChange('annual')}
      >
        <Text style={[styles.miniTabText, activeTab === 'annual' && styles.miniTabTextActive]}>
          This Year
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (mandatoryExpenses.length === 0) {
    return (
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Icon name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.title}>Pending Payments</Text>
          </View>
        </View>
        {tabSelector}
        <View style={styles.allPaidContainer}>
          <Icon name="checkmark-done" size={32} color={colors.success} />
          <Text style={styles.allPaidText}>All caught up!</Text>
          <Text style={styles.allPaidHint}>No pending mandatory payments</Text>
        </View>
      </Card>
    );
  }

  // Calculate total remaining amounts
  const totalRemaining = mandatoryExpenses.reduce((sum, e) => {
    return sum + e.expectedAmount - (e.paidAmount || 0);
  }, 0);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Icon
            name="alert-circle-outline"
            size={20}
            color={colors.warning}
          />
          <Text style={styles.title}>Pending Payments</Text>
        </View>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>
            {mandatoryExpenses.length} pending
          </Text>
        </View>
      </View>

      {tabSelector}

      {/* Total Remaining Summary */}
      <View style={styles.totalSummary}>
        <View style={styles.totalItem}>
          <Text style={styles.totalLabel}>Total Remaining</Text>
          <Text style={[styles.totalValue, styles.totalRemaining]}>{formatCurrency(totalRemaining)}</Text>
        </View>
      </View>

      <View style={styles.expensesList}>
        {mandatoryExpenses.map((expense, index) => (
          <View
            key={expense.subCategoryId}
            style={[
              styles.expenseItem,
              index < mandatoryExpenses.length - 1 && styles.expenseItemBorder,
            ]}
          >
            <View style={styles.expenseInfo}>
              <View
                style={[styles.categoryDot, { backgroundColor: expense.categoryColor }]}
              />
              <View style={styles.expenseDetails}>
                <View style={styles.expenseNameRow}>
                  <Text style={styles.expenseName} numberOfLines={1}>
                    {expense.subCategoryName}
                  </Text>
                  {expense.isFixed && (
                    <View style={styles.fixedBadge}>
                      <Text style={styles.fixedBadgeText}>Fixed</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.categoryName} numberOfLines={1}>
                  {expense.categoryName}
                </Text>
              </View>
            </View>
            <View style={styles.expenseRight}>
              <Text style={styles.expenseAmount}>
                {expense.isFixed ? '' : '≤ '}{formatCurrency(expense.expectedAmount)}
              </Text>
              {expense.isPaidThisMonth ? (
                <TouchableOpacity
                  style={styles.paidBadgeContainer}
                  onPress={() => onViewExpenses?.(expense)}
                >
                  <View style={styles.paidBadge}>
                    <Icon name="checkmark-circle" size={16} color={colors.success} />
                    <Text style={styles.paidText}>
                      {expense.paidAmount ? formatCurrency(expense.paidAmount) : 'Paid'}
                      {expense.paymentCount && expense.paymentCount > 1 ? ` (${expense.paymentCount}x)` : ''}
                    </Text>
                  </View>
                  {onViewExpenses && (
                    <Icon name="chevron-forward" size={14} color={colors.textSecondary} style={styles.viewIcon} />
                  )}
                </TouchableOpacity>
              ) : expense.paidAmount && expense.paidAmount > 0 ? (
                <View style={styles.partialPaymentContainer}>
                  <TouchableOpacity
                    style={styles.partialBadge}
                    onPress={() => onViewExpenses?.(expense)}
                  >
                    <Text style={styles.partialText}>
                      {formatCurrency(expense.paidAmount)} / {formatCurrency(expense.expectedAmount)}
                    </Text>
                  </TouchableOpacity>
                  {/* Only show add button for non-fixed expenses */}
                  {!expense.isFixed && (
                    <TouchableOpacity
                      style={styles.addPaymentButton}
                      onPress={() => onPayExpense(expense)}
                    >
                      <Icon name="add" size={14} color={colors.surface} />
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={() => onPayExpense(expense)}
                >
                  <Text style={styles.payButtonText}>Pay Now</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 10,
  },
  progressBadge: {
    backgroundColor: `${colors.warning}20`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.warning,
  },
  // Mini tabs
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  miniTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  miniTabActive: {
    backgroundColor: colors.primary,
  },
  miniTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  miniTabTextActive: {
    color: colors.surface,
    fontWeight: '600',
  },
  allPaidContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  allPaidText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
    marginTop: 8,
  },
  allPaidHint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  totalSummary: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  totalItem: {
    flex: 1,
    alignItems: 'center',
  },
  totalDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  totalLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  totalPaid: {
    color: colors.success,
  },
  totalRemaining: {
    color: colors.warning,
  },
  expensesList: {
    // Container for expense items
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  expenseItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  expenseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    flexShrink: 1,
  },
  fixedBadge: {
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  fixedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },
  categoryName: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  paidBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewIcon: {
    marginLeft: 4,
  },
  paidText: {
    fontSize: 13,
    color: colors.success,
    fontWeight: '500',
    marginLeft: 4,
  },
  payButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  payButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.surface,
  },
  partialPaymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partialBadge: {
    backgroundColor: `${colors.warning}20`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  partialText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.warning,
  },
  addPaymentButton: {
    backgroundColor: colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
