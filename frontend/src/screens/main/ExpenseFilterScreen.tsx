import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../constants';
import { Button, Card } from '../../components/common';
import { useCategoryStore } from '../../store';

export const ExpenseFilterScreen: React.FC = () => {
  const router = useRouter();
  const { categories } = useCategoryStore();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year' | 'all'>('month');

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleApply = () => {
    // TODO: Apply filters to expense store
    router.back();
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setDateRange('month');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filter Expenses</Text>
        <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Date Range</Text>
        <Card style={styles.optionsCard}>
          {[
            { key: 'week', label: 'This Week' },
            { key: 'month', label: 'This Month' },
            { key: 'year', label: 'This Year' },
            { key: 'all', label: 'All Time' },
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={styles.optionRow}
              onPress={() => setDateRange(option.key as typeof dateRange)}
            >
              <Text style={styles.optionLabel}>{option.label}</Text>
              <Ionicons
                name={dateRange === option.key ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={dateRange === option.key ? colors.primary : colors.textLight}
              />
            </TouchableOpacity>
          ))}
        </Card>

        <Text style={styles.sectionTitle}>Categories</Text>
        <Card style={styles.categoriesCard}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryRow}
              onPress={() => toggleCategory(category.id)}
            >
              <View style={styles.categoryInfo}>
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: `${category.color || colors.primary}20` },
                  ]}
                >
                  <Ionicons
                    name={(category.icon as any) || 'folder-outline'}
                    size={18}
                    color={category.color || colors.primary}
                  />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </View>
              <Ionicons
                name={selectedCategories.includes(category.id) ? 'checkbox' : 'square-outline'}
                size={22}
                color={
                  selectedCategories.includes(category.id) ? colors.primary : colors.textLight
                }
              />
            </TouchableOpacity>
          ))}
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Apply Filters" onPress={handleApply} />
      </View>
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
  resetButton: {
    padding: 8,
  },
  resetText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionsCard: {
    padding: 0,
    marginBottom: 24,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionLabel: {
    fontSize: 16,
    color: colors.text,
  },
  categoriesCard: {
    padding: 0,
    marginBottom: 24,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    color: colors.text,
  },
  footer: {
    padding: 20,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...Platform.select({
      web: {
        maxWidth: 800,
        width: '100%',
        alignSelf: 'center',
      },
    }),
  },
});

export default ExpenseFilterScreen;
