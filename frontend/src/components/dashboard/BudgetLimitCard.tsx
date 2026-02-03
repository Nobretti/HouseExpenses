import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants';
import { BudgetLimitStatus } from '../../types';
import { formatCurrency } from '../../utils';
import { Card } from '../common';

interface BudgetLimitCardProps {
  budgetStatus: BudgetLimitStatus;
}

export const BudgetLimitCard: React.FC<BudgetLimitCardProps> = ({ budgetStatus }) => {
  const { monthlyLimit, currentSpending, remainingAmount, utilizationPercentage, isExceeded } = budgetStatus;

  const getStatusColor = () => {
    if (isExceeded) return colors.danger;
    if (utilizationPercentage >= 90) return colors.danger;
    if (utilizationPercentage >= 75) return colors.warning;
    return colors.success;
  };

  const statusColor = getStatusColor();
  const progressWidth = Math.min(utilizationPercentage, 100);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="wallet-outline" size={20} color={statusColor} />
          <Text style={styles.title}>Budget Limit</Text>
        </View>
        {isExceeded && (
          <View style={styles.warningBadge}>
            <Ionicons name="warning" size={14} color={colors.danger} />
            <Text style={styles.warningText}>Exceeded</Text>
          </View>
        )}
      </View>

      <View style={styles.amountRow}>
        <View style={styles.spentSection}>
          <Text style={styles.spentLabel}>Spent</Text>
          <Text style={[styles.spentAmount, isExceeded && styles.spentAmountExceeded]}>
            {formatCurrency(currentSpending)}
          </Text>
        </View>
        <View style={styles.limitSection}>
          <Text style={styles.limitLabel}>of {formatCurrency(monthlyLimit)}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBar,
              { width: `${progressWidth}%`, backgroundColor: statusColor },
            ]}
          />
        </View>
        <Text style={[styles.percentageText, { color: statusColor }]}>
          {utilizationPercentage.toFixed(0)}%
        </Text>
      </View>

      <View style={styles.remainingRow}>
        <Ionicons
          name={isExceeded ? 'trending-up' : 'trending-down'}
          size={16}
          color={statusColor}
        />
        <Text style={[styles.remainingText, { color: statusColor }]}>
          {isExceeded
            ? `${formatCurrency(Math.abs(remainingAmount))} over budget`
            : `${formatCurrency(remainingAmount)} remaining`}
        </Text>
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
    marginBottom: 18,
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
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.danger}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.danger,
    marginLeft: 4,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  spentSection: {
    marginRight: 8,
  },
  spentLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  spentAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  spentAmountExceeded: {
    color: colors.danger,
  },
  limitSection: {
    paddingBottom: 4,
  },
  limitLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  remainingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  remainingText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
});
