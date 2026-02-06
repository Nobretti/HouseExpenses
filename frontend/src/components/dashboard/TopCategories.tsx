import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from '../common';
import { CategorySpending } from '../../types';
import { colors } from '../../constants';
import { formatCurrency } from '../../utils';
import { Card, CategoryIcon } from '../common';

interface TopCategoriesProps {
  categories: CategorySpending[];
  onSeeAll?: () => void;
}

export const TopCategories: React.FC<TopCategoriesProps> = ({
  categories,
  onSeeAll,
}) => {
  if (categories.length === 0) {
    return (
      <Card style={styles.card}>
        <Text style={styles.title}>Top Categories</Text>
        <View style={styles.emptyContainer}>
          <Icon name="pie-chart-outline" size={40} color={colors.textLight} />
          <Text style={styles.emptyText}>No expenses this month</Text>
          <Text style={styles.emptySubtext}>Add your first expense to see insights</Text>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Top Categories</Text>
        {onSeeAll && (
          <TouchableOpacity style={styles.seeAllButton} onPress={onSeeAll}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        )}
      </View>

      {categories.slice(0, 4).map((category, index) => {
        const categoryColor = category.color || colors.textSecondary;
        return (
          <View
            key={category.categoryId || index}
            style={[
              styles.categoryItem,
              index === Math.min(categories.length - 1, 3) && styles.lastItem
            ]}
          >
            <CategoryIcon
              icon={category.icon}
              color={categoryColor}
              size="small"
            />
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName} numberOfLines={1}>
                {category.categoryName || 'Unknown'}
              </Text>
              <View style={styles.progressContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(category.percentage || 0, 100)}%`,
                      backgroundColor: categoryColor
                    }
                  ]}
                />
              </View>
            </View>
            <Text style={styles.categoryAmount}>
              {formatCurrency(category.amount || 0)}
            </Text>
          </View>
        );
      })}
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
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  seeAllButton: {
    flexShrink: 0,
    paddingLeft: 12,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastItem: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  categoryInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 16,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  progressContainer: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  categoryAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
});
