import React from 'react';
import { FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Expense } from '../../types';
import { colors } from '../../constants';
import { ExpenseItem } from './ExpenseItem';
import { EmptyState, LoadingSpinner } from '../common';

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  onExpensePress: (expense: Expense) => void;
  onExpenseDelete?: (expense: Expense) => void;
  hasMore?: boolean;
  ListHeaderComponent?: React.ReactElement;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  isLoading,
  onRefresh,
  onLoadMore,
  onExpensePress,
  onExpenseDelete,
  hasMore = false,
  ListHeaderComponent,
}) => {
  const renderItem = ({ item }: { item: Expense }) => (
    <ExpenseItem
      expense={item}
      onPress={() => onExpensePress(item)}
      onDelete={onExpenseDelete ? () => onExpenseDelete(item) : undefined}
    />
  );

  return (
    <FlatList
      data={expenses}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
      onEndReached={hasMore ? onLoadMore : undefined}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        !isLoading ? (
          <EmptyState
            icon="receipt-outline"
            title="No expenses yet"
            description="Start tracking your expenses by adding your first one"
          />
        ) : null
      }
      ListFooterComponent={
        hasMore && isLoading ? <LoadingSpinner size="small" /> : null
      }
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
    flexGrow: 1,
  },
});
