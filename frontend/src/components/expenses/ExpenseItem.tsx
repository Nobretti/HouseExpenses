import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Expense } from '../../types';
import { colors } from '../../constants';
import { formatCurrency, formatDate } from '../../utils';
import { CategoryIcon } from '../common';

interface ExpenseItemProps {
  expense: Expense;
  onPress: () => void;
  onDelete?: () => void;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  onPress,
  onDelete,
}) => {
  // Provide fallback values if category is missing
  const categoryIcon = expense.category?.icon || 'help-circle-outline';
  const categoryColor = expense.category?.color || colors.textSecondary;
  const categoryName = expense.category?.name || 'Unknown Category';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <CategoryIcon
        icon={categoryIcon}
        color={categoryColor}
        size="medium"
      />
      <View style={styles.content}>
        <Text style={styles.category}>{categoryName}</Text>
        {expense.subCategory && (
          <Text style={styles.subCategory}>{expense.subCategory.name}</Text>
        )}
        {expense.description && (
          <Text style={styles.description} numberOfLines={1}>
            {expense.description}
          </Text>
        )}
        <Text style={styles.date}>{formatDate(expense.date, 'relative')}</Text>
      </View>
      <View style={styles.rightContent}>
        <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
        {onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  content: {
    flex: 1,
    marginLeft: 14,
    marginRight: 12,
  },
  category: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  subCategory: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  deleteButton: {
    marginTop: 8,
    padding: 4,
  },
});
