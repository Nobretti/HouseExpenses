import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants';
import { useExpenseStore, useCategoryStore } from '../../store';
import { LoadingSpinner, Card } from '../../components/common';
import { Expense } from '../../types';

export const ExpenseDetailScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { expenses, deleteExpense, isLoading } = useExpenseStore();
  const { categories } = useCategoryStore();
  const [expense, setExpense] = useState<Expense | null>(null);

  useEffect(() => {
    if (id) {
      const found = expenses.find((e) => e.id === id);
      setExpense(found || null);
    }
  }, [id, expenses]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (id) {
              await deleteExpense(id);
              router.back();
            }
          },
        },
      ]
    );
  };

  if (isLoading || !expense) {
    return <LoadingSpinner fullScreen message="Loading expense..." />;
  }

  const category = expense.category || categories.find((c) => c.id === expense.category?.id);
  const formattedAmount = new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(expense.amount);

  const formattedDate = new Date(expense.date).toLocaleDateString('pt-PT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expense Details</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={24} color={colors.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Card variant="elevated" style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amount}>{formattedAmount}</Text>
        </Card>

        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="pricetag-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{category?.name || 'Unknown'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formattedDate}</Text>
            </View>
          </View>

          {expense.description && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Description</Text>
                  <Text style={styles.detailValue}>{expense.description}</Text>
                </View>
              </View>
            </>
          )}
        </Card>
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
  deleteButton: {
    padding: 8,
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
  amountCard: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
  },
  detailsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 68,
  },
});

export default ExpenseDetailScreen;
