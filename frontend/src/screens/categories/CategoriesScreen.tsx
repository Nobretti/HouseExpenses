// Categories screen
import React, { useEffect, useState, useCallback } from 'react';
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
import { useRouter } from 'expo-router';
import { Icon } from '../../components/common';
import { colors } from '../../constants';
import { useCategoryStore } from '../../store';
import { Card, CategoryIcon, LoadingSpinner, EmptyState } from '../../components/common';
import { Category } from '../../types';

export const CategoriesScreen: React.FC = () => {
  const router = useRouter();
  const { categories, isLoading, fetchCategories, reorderCategory } = useCategoryStore();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(true);
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isWideScreen = width > 768;

  // Toggle individual category expansion
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

  // Toggle all categories expansion
  const toggleAllCategories = useCallback(() => {
    if (allExpanded) {
      setExpandedCategories(new Set());
    } else {
      setExpandedCategories(new Set(categories.map(c => c.id)));
    }
    setAllExpanded(!allExpanded);
  }, [categories, allExpanded]);

  // Initialize expanded state when categories load
  useEffect(() => {
    if (allExpanded) {
      setExpandedCategories(new Set(categories.map(c => c.id)));
    }
  }, [categories]);

  // Move category up or down
  const moveCategory = useCallback(async (categoryId: string, direction: 'up' | 'down') => {
    const sortedCategories = [...categories].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    const currentIndex = sortedCategories.findIndex(c => c.id === categoryId);

    if (direction === 'up' && currentIndex > 0) {
      const newOrder = currentIndex - 1;
      await reorderCategory(categoryId, newOrder);
    } else if (direction === 'down' && currentIndex < sortedCategories.length - 1) {
      const newOrder = currentIndex + 1;
      await reorderCategory(categoryId, newOrder);
    }
  }, [categories, reorderCategory]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Show all categories sorted by display order
  const sortedCategories = [...categories]
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const handleCategoryPress = (category: Category) => {
    router.push({
      pathname: '/category-detail',
      params: { id: category.id },
    });
  };

  const isCategoryExpanded = (categoryId: string) => expandedCategories.has(categoryId);

  if (isLoading && categories.length === 0) {
    return <LoadingSpinner fullScreen message="Loading categories..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.headerWrapper, isWeb && isWideScreen && styles.webHeader]}>
        <View style={styles.header}>
          <Text style={styles.title}>Categories</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.expandAllButton}
              onPress={toggleAllCategories}
            >
              <Icon
                name={allExpanded ? 'contract-outline' : 'expand-outline'}
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/manage-category')}
            >
              <Icon name="add-circle" size={32} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          isWeb && isWideScreen && styles.webContent,
          sortedCategories.length === 0 && styles.emptyContent,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchCategories}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {sortedCategories.length === 0 ? (
          <EmptyState
            icon="folder-outline"
            title="No categories"
            description="Tap the + button to create your first category"
          />
        ) : sortedCategories.map((category, categoryIndex) => {
          const isExpanded = isCategoryExpanded(category.id);
          const hasSubCategories = category.subCategories && category.subCategories.length > 0;
          const isFirst = categoryIndex === 0;
          const isLast = categoryIndex === sortedCategories.length - 1;

          return (
            <Card key={category.id} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                {/* Expand/Collapse Toggle */}
                <TouchableOpacity
                  style={styles.expandButton}
                  onPress={() => toggleCategory(category.id)}
                  disabled={!hasSubCategories}
                >
                  <Icon
                    name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                    size={20}
                    color={hasSubCategories ? colors.textSecondary : 'transparent'}
                  />
                </TouchableOpacity>

                {/* Category Icon and Info */}
                <TouchableOpacity
                  style={styles.categoryMainContent}
                  onPress={() => handleCategoryPress(category)}
                >
                  <CategoryIcon
                    icon={category.icon}
                    color={category.color}
                    size="medium"
                  />
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <View style={styles.categoryMeta}>
                      <Text style={styles.subCategoryCount}>
                        {category.subCategories?.length || 0} subcategories
                      </Text>
                      {category.subCategories && category.subCategories.length > 0 && (
                        <Text style={styles.categoryExpected}>
                          €{(category.subCategories.reduce((sum, sub) => {
                            if (sub.fixedAmount) return sum + sub.fixedAmount;
                            if (sub.budgetLimit) return sum + (sub.budgetLimit * 0.2);
                            return sum;
                          }, 0)).toFixed(0)}/mo
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Action Buttons */}
                <View style={styles.categoryActions}>
                  {/* Reorder Buttons */}
                  <View style={styles.reorderButtons}>
                    <TouchableOpacity
                      style={[styles.reorderButton, isFirst && styles.reorderButtonDisabled]}
                      onPress={() => moveCategory(category.id, 'up')}
                      disabled={isFirst}
                    >
                      <Icon
                        name="chevron-up"
                        size={18}
                        color={isFirst ? colors.border : colors.textSecondary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.reorderButton, isLast && styles.reorderButtonDisabled]}
                      onPress={() => moveCategory(category.id, 'down')}
                      disabled={isLast}
                    >
                      <Icon
                        name="chevron-down"
                        size={18}
                        color={isLast ? colors.border : colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Edit Button */}
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => router.push({ pathname: '/manage-category', params: { id: category.id } })}
                  >
                    <Icon name="create-outline" size={22} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Subcategories List - Collapsible */}
              {hasSubCategories && isExpanded && (
                <View style={styles.subCategoriesList}>
                  {category.subCategories!.map((sub, index) => (
                    <View key={sub.id} style={styles.subCategoryRow}>
                      <View style={styles.subCategoryLeft}>
                        <View style={[styles.subCategoryDot, { backgroundColor: category.color }]} />
                        <View style={styles.subCategoryContent}>
                          <View style={styles.subCategoryNameRow}>
                            <Text style={styles.subCategoryName}>{sub.name}</Text>
                            {sub.fixedAmount ? (
                              <View style={styles.fixedBadge}>
                                <Text style={styles.fixedBadgeText}>Fixed</Text>
                              </View>
                            ) : sub.isMandatory ? (
                              <View style={styles.mandatoryBadge}>
                                <Text style={styles.mandatoryBadgeText}>Mandatory</Text>
                              </View>
                            ) : (
                              <View style={styles.incrementalBadge}>
                                <Text style={styles.incrementalBadgeText}>Incremental</Text>
                              </View>
                            )}
                          </View>
                          {sub.fixedAmount ? (
                            <Text style={styles.subCategoryFixedAmount}>€{sub.fixedAmount.toFixed(2)}/mo (fixed)</Text>
                          ) : sub.budgetLimit && sub.budgetLimit > 0 ? (
                            <Text style={styles.subCategoryBudget}>
                              ~€{(sub.budgetLimit * 0.2).toFixed(2)}/mo (max €{sub.budgetLimit.toFixed(2)})
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      {index < category.subCategories!.length - 1 && <View style={styles.subCategoryDivider} />}
                    </View>
                  ))}
                </View>
              )}
            </Card>
          );
        })}
        {sortedCategories.length > 0 && (
          <View style={styles.bottomSpacing} />
        )}
      </ScrollView>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandAllButton: {
    padding: 8,
    marginRight: 8,
  },
  addButton: {
    padding: 4,
  },
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
  categoryCard: {
    marginBottom: 16,
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
  expandButton: {
    padding: 4,
    marginRight: 4,
  },
  categoryMainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 12,
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reorderButtons: {
    marginRight: 8,
  },
  reorderButton: {
    padding: 2,
  },
  reorderButtonDisabled: {
    opacity: 0.3,
  },
  categoryName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  categoryMeta: {
    marginTop: 4,
  },
  subCategoryCount: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  categoryExpected: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  editButton: {
    padding: 8,
  },
  subCategoriesList: {
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  subCategoryRow: {
    paddingVertical: 12,
  },
  subCategoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subCategoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 14,
    marginLeft: 4,
  },
  subCategoryContent: {
    flex: 1,
  },
  subCategoryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subCategoryName: {
    fontSize: 15,
    color: colors.text,
  },
  subCategoryBudget: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 4,
  },
  subCategoryFixedAmount: {
    fontSize: 13,
    color: colors.warning,
    fontWeight: '500',
    marginTop: 4,
  },
  subCategoryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: 12,
    marginLeft: 26,
  },
  fixedBadge: {
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  fixedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  mandatoryBadge: {
    backgroundColor: `${colors.warning}15`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  mandatoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.warning,
  },
  incrementalBadge: {
    backgroundColor: `${colors.success}15`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  incrementalBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.success,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default CategoriesScreen;
