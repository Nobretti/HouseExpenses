import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants';
import { formatCurrency } from '../../utils';
import { Card } from '../common';

interface SpendingTotalsCardProps {
  weeklyTotal: number;
  monthlyTotal: number;
  annualTotal: number;
}

export const SpendingTotalsCard: React.FC<SpendingTotalsCardProps> = ({
  weeklyTotal,
  monthlyTotal,
  annualTotal,
}) => {
  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.mainSection}>
        <Text style={styles.mainLabel}>Spent this month</Text>
        <Text style={styles.mainAmount}>{formatCurrency(monthlyTotal)}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons name="today-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>This Week</Text>
            <Text style={styles.statValue}>{formatCurrency(weeklyTotal)}</Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: `${colors.success}15` }]}>
            <Ionicons name="calendar-outline" size={18} color={colors.success} />
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>This Year</Text>
            <Text style={styles.statValue}>{formatCurrency(annualTotal)}</Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  mainSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mainAmount: {
    fontSize: 38,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 18,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
});
