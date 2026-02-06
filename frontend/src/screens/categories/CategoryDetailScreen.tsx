import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Icon } from '../../components/common';
import { colors } from '../../constants';
import { Card, LoadingSpinner, ProgressBar } from '../../components/common';
import { useCategoryStore, useExpenseStore } from '../../store';
import { Category } from '../../types';

export const CategoryDetailScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { categories } = useCategoryStore();
  const { expenses } = useExpenseStore();
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (id) {
      const found = categories.find((c) => c.id === id);
      setCategory(found || null);
    }
  }, [id, categories]);

  if (!category) {
    return <LoadingSpinner fullScreen message="Loading category..." />;
  }

  const categoryExpenses = expenses.filter((e) => e.category?.id === id);
  const totalSpent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Calculate expected total from all subcategories:
  // - Fixed expenses: use exact fixedAmount
  // - Non-fixed expenses: use 20% of budgetLimit
  const expectedTotal = category.subCategories?.reduce((sum, sub) => {
    if (sub.fixedAmount) {
      return sum + sub.fixedAmount;
    }
    if (sub.budgetLimit) {
      return sum + (sub.budgetLimit * 0.2);
    }
    return sum;
  }, 0) || 0;

  // Also calculate max budget for reference
  const maxBudget = category.subCategories?.reduce((sum, sub) => {
    return sum + (sub.fixedAmount || sub.budgetLimit || 0);
  }, 0) || 0;

  const utilizationPercentage = expectedTotal > 0 ? (totalSpent / expectedTotal) * 100 : 0;

  const formattedTotal = new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(totalSpent);

  const formattedExpected = new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(expectedTotal);

  const formattedMaxBudget = new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(maxBudget);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category.name}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Card variant="elevated" style={styles.summaryCard}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${category.color || colors.primary}20` },
            ]}
          >
            <Icon
              name={(category.icon as any) || 'folder-outline'}
              size={32}
              color={category.color || colors.primary}
            />
          </View>
          <Text style={styles.categoryName}>{category.name}</Text>
          <Text style={styles.totalSpent}>{formattedExpected}</Text>
          <Text style={styles.budgetText}>Expected Monthly</Text>
          {maxBudget > 0 && maxBudget !== expectedTotal && (
            <Text style={styles.maxBudgetText}>Max: {formattedMaxBudget}</Text>
          )}
          {expectedTotal > 0 && (
            <>
              <View style={styles.spentInfo}>
                <Text style={styles.spentLabel}>Spent: </Text>
                <Text style={[
                  styles.spentValue,
                  totalSpent > expectedTotal ? styles.spentOverBudget : styles.spentUnderBudget
                ]}>
                  {formattedTotal}
                </Text>
              </View>
              <View style={styles.progressContainer}>
                <ProgressBar
                  progress={Math.min(utilizationPercentage, 100)}
                  color={
                    utilizationPercentage > 100
                      ? colors.danger
                      : utilizationPercentage > 80
                      ? colors.warning
                      : colors.success
                  }
                />
              </View>
            </>
          )}
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Recent Expenses ({categoryExpenses.length})
          </Text>
          {categoryExpenses.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No expenses in this category yet</Text>
            </Card>
          ) : (
            categoryExpenses.slice(0, 10).map((expense) => (
              <Card key={expense.id} style={styles.expenseCard}>
                <TouchableOpacity
                  style={styles.expenseRow}
                  onPress={() =>
                    router.push({ pathname: '/expense-detail', params: { id: expense.id } })
                  }
                >
                  <View style={styles.expenseInfo}>
                    <Text style={styles.expenseDescription}>
                      {expense.description || 'No description'}
                    </Text>
                    <Text style={styles.expenseDate}>
                      {new Date(expense.date).toLocaleDateString('pt-PT')}
                    </Text>
                  </View>
                  <Text style={styles.expenseAmount}>
                    {new Intl.NumberFormat('pt-PT', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(expense.amount)}
                  </Text>
                </TouchableOpacity>
              </Card>
            ))
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...Platform.select({
      web: {
        maxWidth: 800,
        width: '100%',
        alignSelf: 'center',
      },
    }),
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    ...Platform.select({
      web: {
        maxWidth: 800,
        width: '100%',
        alignSelf: 'center',
      },
    }),
  },
  summaryCard: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 24,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  categoryName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  totalSpent: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  budgetText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  maxBudgetText: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  spentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  spentLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  spentValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  spentUnderBudget: {
    color: colors.success,
  },
  spentOverBudget: {
    color: colors.danger,
  },
  progressContainer: {
    width: '80%',
    marginTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  expenseCard: {
    marginBottom: 8,
    padding: 0,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});

export default CategoryDetailScreen;
