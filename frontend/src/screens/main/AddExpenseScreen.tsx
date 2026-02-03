import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ViewStyle,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants';
import { useExpenseStore, useCategoryStore, useDashboardStore } from '../../store';
import { Button, Card, CategoryIcon, Toast } from '../../components/common';
import { Category, SubCategory } from '../../types';
import { toISODateString } from '../../utils';

export const AddExpenseScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    presetSubCategoryId?: string;
    presetCategoryId?: string;
    presetAmount?: string;
    presetIsFixed?: string;
  }>();
  const { addExpense, isLoading } = useExpenseStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { refreshDashboard } = useDashboardStore();

  const hasPreset = !!params.presetSubCategoryId;
  const isFixedExpense = params.presetIsFixed === 'true';

  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [isExtraordinary, setIsExtraordinary] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, []);

  // Pre-fill for preset expense (from dashboard monthly expenses card)
  useEffect(() => {
    if (hasPreset && categories.length > 0) {
      const category = categories.find((c) => c.id === params.presetCategoryId);
      if (category) {
        setSelectedCategory(category);
        const subCategory = category.subCategories?.find((s) => s.id === params.presetSubCategoryId);
        if (subCategory) {
          setSelectedSubCategory(subCategory);
        }
      }
      // Only pre-fill amount for fixed expenses
      // For non-fixed expenses, leave empty so user can enter the actual amount
      if (params.presetAmount && isFixedExpense) {
        setAmount(params.presetAmount);
      }
    }
  }, [categories, params, isFixedExpense]);

  // Show all categories when extraordinary or all, otherwise just monthly
  const availableCategories = isExtraordinary
    ? categories
    : categories.filter((c) => c.expenseType === 'monthly');

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    // Category is optional for extraordinary expenses
    if (!selectedCategory && !isExtraordinary) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const expense = await addExpense({
      amount: parseFloat(amount),
      categoryId: selectedCategory?.id,
      subCategoryId: selectedSubCategory?.id,
      description: description.trim() || undefined,
      date: toISODateString(date),
    });

    if (expense) {
      // Refresh dashboard data after adding expense
      refreshDashboard();
      setToast({ visible: true, message: 'Expense added successfully!', type: 'success' });
      setTimeout(() => router.back(), 1000);
    } else {
      setToast({ visible: true, message: 'Failed to create expense. Please try again.', type: 'error' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {hasPreset ? 'Add Monthly Expense' : 'Add Expense'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Preset Expense Notice */}
        {hasPreset && (
          <View style={styles.presetNotice}>
            <Ionicons name="calendar" size={18} color={colors.primary} />
            <Text style={styles.presetNoticeText}>
              {isFixedExpense
                ? `Fixed expense: ${selectedSubCategory?.name}`
                : `Adding expense for: ${selectedSubCategory?.name}`}
            </Text>
          </View>
        )}

        {/* Amount Input */}
        <Card style={isFixedExpense ? StyleSheet.flatten([styles.amountCard, styles.amountCardLocked]) as ViewStyle : styles.amountCard}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currency}>€</Text>
            <TextInput
              style={[styles.amountInput, isFixedExpense && styles.amountInputLocked]}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={colors.textLight}
              keyboardType="decimal-pad"
              editable={!isFixedExpense}
            />
          </View>
          {isFixedExpense && (
            <View style={styles.lockedBadge}>
              <Ionicons name="lock-closed" size={14} color={colors.textSecondary} />
              <Text style={styles.lockedBadgeText}>Fixed amount</Text>
            </View>
          )}
          {hasPreset && !isFixedExpense && params.presetAmount && (
            <View style={styles.budgetHint}>
              <Ionicons name="information-circle-outline" size={14} color={colors.primary} />
              <Text style={styles.budgetHintText}>
                Budget limit: €{params.presetAmount}
              </Text>
            </View>
          )}
          {errors.amount && <Text style={styles.error}>{errors.amount}</Text>}
        </Card>

        {/* Category Selection */}
        <Text style={styles.sectionTitle}>
          Category{isExtraordinary ? ' (Optional)' : ''}
        </Text>
        {errors.category && <Text style={styles.error}>{errors.category}</Text>}
        <View style={styles.categoriesGrid}>
          {availableCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                selectedCategory?.id === category.id && styles.categoryItemSelected,
              ]}
              onPress={() => {
                setSelectedCategory(category);
                setSelectedSubCategory(null);
              }}
            >
              <CategoryIcon
                icon={category.icon}
                color={category.color}
                size="medium"
              />
              <Text style={styles.categoryName} numberOfLines={2}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SubCategory Selection */}
        {selectedCategory && selectedCategory.subCategories && selectedCategory.subCategories.length > 0 && (
          <Card style={styles.subCategoryCard}>
            <View style={styles.subCategoryHeader}>
              <Ionicons name="pricetag-outline" size={20} color={colors.primary} />
              <Text style={styles.subCategorySectionTitle}>Select Subcategory</Text>
            </View>
            <Text style={styles.subCategoryHint}>
              Choose a specific subcategory for better expense tracking
            </Text>
            <View style={styles.subCategoryGrid}>
              {selectedCategory.subCategories.map((sub) => (
                <TouchableOpacity
                  key={sub.id}
                  style={[
                    styles.subCategoryItem,
                    selectedSubCategory?.id === sub.id && styles.subCategoryItemSelected,
                  ]}
                  onPress={() => setSelectedSubCategory(
                    selectedSubCategory?.id === sub.id ? null : sub
                  )}
                >
                  <View style={[
                    styles.subCategoryDot,
                    { backgroundColor: selectedSubCategory?.id === sub.id ? colors.surface : selectedCategory.color }
                  ]} />
                  <Text
                    style={[
                      styles.subCategoryText,
                      selectedSubCategory?.id === sub.id && styles.subCategoryTextSelected,
                    ]}
                  >
                    {sub.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}

        {/* Extraordinary Expense Toggle */}
        {!hasPreset && (
          <TouchableOpacity
            style={styles.extraordinaryToggle}
            onPress={() => setIsExtraordinary(!isExtraordinary)}
          >
            <View style={styles.extraordinaryLeft}>
              <View style={[styles.extraordinaryIcon, isExtraordinary && styles.extraordinaryIconActive]}>
                <Ionicons
                  name="flash"
                  size={18}
                  color={isExtraordinary ? colors.surface : colors.warning}
                />
              </View>
              <View>
                <Text style={styles.extraordinaryLabel}>Extraordinary Expense</Text>
                <Text style={styles.extraordinaryHint}>Unexpected or one-time expense</Text>
              </View>
            </View>
            <View style={[styles.toggleSwitch, isExtraordinary && styles.toggleSwitchActive]}>
              <View style={[styles.toggleKnob, isExtraordinary && styles.toggleKnobActive]} />
            </View>
          </TouchableOpacity>
        )}

        {/* Description */}
        <Text style={styles.sectionTitle}>Description {isExtraordinary ? '' : '(Optional)'}</Text>
        <TextInput
          style={styles.descriptionInput}
          value={description}
          onChangeText={setDescription}
          placeholder={isExtraordinary ? "Describe this extraordinary expense..." : "What was this expense for?"}
          placeholderTextColor={colors.textLight}
          multiline
          numberOfLines={3}
        />

        <Button
          title={isExtraordinary ? "Save Extraordinary Expense" : "Save Expense"}
          onPress={handleSubmit}
          loading={isLoading}
          style={styles.submitButton}
        />
      </ScrollView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  amountCard: {
    marginBottom: 28,
    alignItems: 'center',
    paddingVertical: 28,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currency: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.text,
    marginRight: 4,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text,
    minWidth: 100,
    textAlign: 'center',
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 18,
    marginTop: 16,
    letterSpacing: -0.2,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 20,
  },
  categoryItem: {
    width: '23%',
    margin: '1%',
    paddingVertical: 14,
    paddingHorizontal: 8,
    backgroundColor: colors.surface,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryItemSelected: {
    borderColor: colors.primary,
  },
  categoryName: {
    fontSize: 11,
    color: colors.text,
    marginTop: 10,
    textAlign: 'center',
  },
  subCategoryCard: {
    marginBottom: 24,
    paddingVertical: 20,
  },
  subCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subCategorySectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 10,
  },
  subCategoryHint: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  subCategoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  subCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: colors.background,
    borderRadius: 14,
    margin: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  subCategoryItemSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  subCategoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  subCategoryText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  subCategoryTextSelected: {
    color: colors.surface,
    fontWeight: '600',
  },
  descriptionInput: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 18,
    fontSize: 16,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 32,
  },
  submitButton: {
    marginBottom: 60,
  },
  presetNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}15`,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  presetNoticeText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: 10,
    flex: 1,
  },
  amountCardLocked: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
  },
  amountInputLocked: {
    color: colors.textSecondary,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  lockedBadgeText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  budgetHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 8,
  },
  budgetHintText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 6,
    flex: 1,
  },
  extraordinaryToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  extraordinaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  extraordinaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.warning}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  extraordinaryIconActive: {
    backgroundColor: colors.warning,
  },
  extraordinaryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  extraordinaryHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: colors.warning,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  toggleKnobActive: {
    marginLeft: 22,
  },
});

export default AddExpenseScreen;
