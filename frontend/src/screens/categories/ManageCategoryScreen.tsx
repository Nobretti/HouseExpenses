import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../constants';
import { useCategoryStore } from '../../store';
import { Button, Card, Toast, ConfirmDialog } from '../../components/common';
import { Category, SubCategory, CreateSubCategoryDTO } from '../../types';

const CATEGORY_ICONS = [
  'home-outline', 'car-outline', 'cart-outline', 'restaurant-outline',
  'medical-outline', 'school-outline', 'airplane-outline', 'gift-outline',
  'game-controller-outline', 'fitness-outline', 'paw-outline', 'shirt-outline',
  'cafe-outline', 'bus-outline', 'water-outline', 'flash-outline',
  'wifi-outline', 'phone-portrait-outline', 'tv-outline', 'desktop-outline',
];

const CATEGORY_COLORS = [
  '#2A9D8F', '#E76F51', '#F4A261', '#E63946', '#9B5DE5',
  '#00BBF9', '#52B788', '#FF6B9D', '#00C9C8', '#06D6A0',
];

export const ManageCategoryScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubCategory,
    updateSubCategory,
    deleteSubCategory,
    isLoading
  } = useCategoryStore();

  const isEditing = !!id;
  const existingCategory = isEditing ? categories.find(c => c.id === id) : null;

  const [name, setName] = useState(existingCategory?.name || '');
  const [selectedIcon, setSelectedIcon] = useState(existingCategory?.icon || 'home-outline');
  const [selectedColor, setSelectedColor] = useState(existingCategory?.color || CATEGORY_COLORS[0]);
  const [expenseType, setExpenseType] = useState<'monthly' | 'annual'>(existingCategory?.expenseType || 'monthly');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Subcategory state
  const [subCategories, setSubCategories] = useState<SubCategory[]>(existingCategory?.subCategories || []);
  const [newSubCategoryName, setNewSubCategoryName] = useState('');
  const [newSubCategoryBudget, setNewSubCategoryBudget] = useState('');
  const [newSubCategoryIsFixed, setNewSubCategoryIsFixed] = useState(false);
  const [newSubCategoryIsMandatory, setNewSubCategoryIsMandatory] = useState(false);
  const [isAddingSubCategory, setIsAddingSubCategory] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);

  // Toast and dialog state
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' });
  const [deleteDialog, setDeleteDialog] = useState({ visible: false, subCategory: null as SubCategory | null });
  const [deleteCategoryDialog, setDeleteCategoryDialog] = useState(false);

  // Update subcategories when category changes
  useEffect(() => {
    if (existingCategory?.subCategories) {
      setSubCategories(existingCategory.subCategories);
    }
  }, [existingCategory]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = 'Category name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ visible: true, message, type });
  };

  const handleSave = async () => {
    if (!validate()) return;

    const categoryData = {
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor,
      expenseType,
    };

    try {
      if (isEditing && id) {
        await updateCategory(id, categoryData);
        showToast('Category updated successfully', 'success');
      } else {
        // Create the category first
        const newCategory = await addCategory(categoryData);
        if (newCategory) {
          // Create any local subcategories that were added
          const tempSubCategories = subCategories.filter(sc => sc.id.startsWith('temp-'));
          for (const tempSub of tempSubCategories) {
            await addSubCategory(newCategory.id, {
              name: tempSub.name,
              budgetLimit: tempSub.budgetLimit,
              fixedAmount: tempSub.fixedAmount,
              isMandatory: tempSub.isMandatory,
            });
          }
          showToast('Category created successfully', 'success');
        } else {
          showToast('Failed to create category', 'error');
          return;
        }
      }
      setTimeout(() => router.back(), 1000);
    } catch (error) {
      showToast('Failed to save category. Please try again.', 'error');
    }
  };

  const handleDelete = () => {
    setDeleteCategoryDialog(true);
  };

  const confirmDeleteCategory = async () => {
    setDeleteCategoryDialog(false);
    try {
      if (id) {
        await deleteCategory(id);
        showToast('Category deleted successfully', 'success');
        setTimeout(() => router.back(), 1000);
      }
    } catch (error) {
      showToast('Failed to delete category. Please try again.', 'error');
    }
  };

  const resetSubCategoryForm = () => {
    setNewSubCategoryName('');
    setNewSubCategoryBudget('');
    setNewSubCategoryIsFixed(false);
    setNewSubCategoryIsMandatory(false);
    setIsAddingSubCategory(false);
    setEditingSubCategory(null);
  };

  const startEditingSubCategory = (subCategory: SubCategory) => {
    setEditingSubCategory(subCategory);
    setNewSubCategoryName(subCategory.name);
    // Use fixedAmount as budget if it exists (for fixed expenses), otherwise use budgetLimit
    const budgetValue = subCategory.fixedAmount || subCategory.budgetLimit;
    setNewSubCategoryBudget(budgetValue?.toString() || '');
    // It's fixed if there's a fixedAmount set
    setNewSubCategoryIsFixed(!!subCategory.fixedAmount);
    // Fixed expenses are always mandatory; for non-fixed, use the saved value
    setNewSubCategoryIsMandatory(!!subCategory.fixedAmount || !!subCategory.isMandatory);
    setIsAddingSubCategory(true);
  };

  const handleSaveSubCategory = async () => {
    if (!newSubCategoryName.trim()) {
      showToast('Please enter a subcategory name', 'error');
      return;
    }

    // Validate: if fixed, budget is required
    if (newSubCategoryIsFixed && (!newSubCategoryBudget || parseFloat(newSubCategoryBudget) <= 0)) {
      showToast('Please enter a fixed amount', 'error');
      return;
    }

    // Build the subcategory data
    // - If fixed: fixedAmount = budget value (exact amount each month)
    // - If not fixed: budgetLimit = budget value (max budget)
    const parsedBudget = newSubCategoryBudget ? parseFloat(newSubCategoryBudget) : NaN;
    const budgetValue = !isNaN(parsedBudget) && parsedBudget > 0 ? parsedBudget : undefined;

    // Fixed expenses are always mandatory; for non-fixed, use the toggle value
    const isMandatory = newSubCategoryIsFixed ? true : newSubCategoryIsMandatory;

    const subCategoryData: CreateSubCategoryDTO = {
      name: newSubCategoryName.trim(),
      // If fixed, use fixedAmount; otherwise use budgetLimit
      ...(newSubCategoryIsFixed && budgetValue !== undefined && { fixedAmount: budgetValue }),
      ...(!newSubCategoryIsFixed && budgetValue !== undefined && { budgetLimit: budgetValue }),
      isMandatory,
    };

    // Handle editing an existing subcategory
    if (editingSubCategory) {
      if (editingSubCategory.id.startsWith('temp-')) {
        // Update local temp subcategory
        setSubCategories(subCategories.map(sc =>
          sc.id === editingSubCategory.id
            ? { ...sc, ...subCategoryData }
            : sc
        ));
        resetSubCategoryForm();
        showToast('Subcategory updated', 'success');
        return;
      }

      try {
        const success = await updateSubCategory(editingSubCategory.id, subCategoryData);
        if (success) {
          setSubCategories(subCategories.map(sc =>
            sc.id === editingSubCategory.id
              ? { ...sc, ...subCategoryData }
              : sc
          ));
          resetSubCategoryForm();
          showToast('Subcategory updated successfully', 'success');
        } else {
          showToast('Failed to update subcategory', 'error');
        }
      } catch (error) {
        showToast('Failed to update subcategory', 'error');
      }
      return;
    }

    // Handle adding a new subcategory
    if (!id) {
      // For new categories, just add to local state
      const tempSubCategory: SubCategory = {
        id: `temp-${Date.now()}`,
        name: newSubCategoryName.trim(),
        categoryId: '',
        ...(newSubCategoryIsFixed && budgetValue !== undefined && { fixedAmount: budgetValue }),
        ...(!newSubCategoryIsFixed && budgetValue !== undefined && { budgetLimit: budgetValue }),
        isMandatory,
      };
      setSubCategories([...subCategories, tempSubCategory]);
      resetSubCategoryForm();
      showToast('Subcategory will be saved when you save the category', 'info');
      return;
    }

    try {
      const result = await addSubCategory(id, subCategoryData);

      if (result) {
        setSubCategories([...subCategories, result]);
        resetSubCategoryForm();
        showToast('Subcategory added successfully', 'success');
      } else {
        showToast('Failed to add subcategory', 'error');
      }
    } catch (error) {
      showToast('Failed to add subcategory', 'error');
    }
  };

  const handleDeleteSubCategory = (subCategory: SubCategory) => {
    setDeleteDialog({ visible: true, subCategory });
  };

  const confirmDeleteSubCategory = async () => {
    const subCategory = deleteDialog.subCategory;
    setDeleteDialog({ visible: false, subCategory: null });

    if (!subCategory) return;

    if (subCategory.id.startsWith('temp-')) {
      // Remove from local state only
      setSubCategories(subCategories.filter(sc => sc.id !== subCategory.id));
      showToast('Subcategory removed', 'success');
      return;
    }

    try {
      const success = await deleteSubCategory(subCategory.id);
      if (success) {
        setSubCategories(subCategories.filter(sc => sc.id !== subCategory.id));
        showToast('Subcategory deleted successfully', 'success');
      } else {
        showToast('Failed to delete subcategory', 'error');
      }
    } catch (error) {
      showToast('Failed to delete subcategory', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Category' : 'New Category'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category Name */}
        <Text style={styles.label}>Category Name</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          value={name}
          onChangeText={setName}
          placeholder="Enter category name"
          placeholderTextColor={colors.textLight}
        />
        {errors.name && <Text style={styles.error}>{errors.name}</Text>}

        {/* Expense Type */}
        <Text style={styles.label}>Expense Type</Text>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeButton, expenseType === 'monthly' && styles.typeButtonSelected]}
            onPress={() => setExpenseType('monthly')}
          >
            <Text style={[styles.typeButtonText, expenseType === 'monthly' && styles.typeButtonTextSelected]}>
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, expenseType === 'annual' && styles.typeButtonSelected]}
            onPress={() => setExpenseType('annual')}
          >
            <Text style={[styles.typeButtonText, expenseType === 'annual' && styles.typeButtonTextSelected]}>
              Annual
            </Text>
          </TouchableOpacity>
        </View>

        {/* Icon Selection */}
        <Text style={styles.label}>Icon</Text>
        <Card style={styles.iconGrid}>
          {CATEGORY_ICONS.map((icon) => (
            <TouchableOpacity
              key={icon}
              style={[
                styles.iconItem,
                selectedIcon === icon && { backgroundColor: `${selectedColor}20`, borderColor: selectedColor },
              ]}
              onPress={() => setSelectedIcon(icon)}
            >
              <Ionicons
                name={icon as any}
                size={24}
                color={selectedIcon === icon ? selectedColor : colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </Card>

        {/* Color Selection */}
        <Text style={styles.label}>Color</Text>
        <View style={styles.colorGrid}>
          {CATEGORY_COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorItem,
                { backgroundColor: color },
                selectedColor === color && styles.colorItemSelected,
              ]}
              onPress={() => setSelectedColor(color)}
            >
              {selectedColor === color && (
                <Ionicons name="checkmark" size={20} color={colors.surface} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Subcategories Section */}
        <View style={styles.subCategorySection}>
          <View style={styles.subCategoryHeader}>
            <Text style={styles.label}>Subcategories</Text>
            <TouchableOpacity
              style={styles.addSubButton}
              onPress={() => setIsAddingSubCategory(true)}
            >
              <Ionicons name="add-circle" size={28} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.hint}>
            Add subcategories with individual budget limits for detailed tracking
          </Text>

          {/* Add/Edit Subcategory Form */}
          {isAddingSubCategory && (
            <Card style={styles.addSubCategoryCard}>
              <Text style={styles.addSubCategoryTitle}>
                {editingSubCategory ? 'Edit Subcategory' : 'New Subcategory'}
              </Text>
              <TextInput
                style={styles.subCategoryInput}
                value={newSubCategoryName}
                onChangeText={setNewSubCategoryName}
                placeholder="Subcategory name"
                placeholderTextColor={colors.textLight}
                autoFocus
              />
              {/* Fixed Amount Toggle */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>Fixed Amount</Text>
                  <Text style={styles.toggleHint}>
                    {newSubCategoryIsFixed
                      ? 'Exact same amount, single payment each period'
                      : newSubCategoryIsMandatory
                        ? 'Variable amount, multiple payments allowed up to max budget'
                        : 'Incremental - accumulates multiple payments over time'}
                  </Text>
                </View>
                <Switch
                  value={newSubCategoryIsFixed}
                  onValueChange={(value) => {
                    setNewSubCategoryIsFixed(value);
                    if (value) {
                      // Fixed expenses are always mandatory
                      setNewSubCategoryIsMandatory(true);
                    }
                  }}
                  trackColor={{ false: colors.border, true: `${colors.primary}50` }}
                  thumbColor={newSubCategoryIsFixed ? colors.primary : colors.textLight}
                />
              </View>

              {/* Mandatory Toggle - only shown for non-fixed */}
              {!newSubCategoryIsFixed && (
                <View style={styles.toggleRow}>
                  <View style={styles.toggleInfo}>
                    <Text style={styles.toggleLabel}>Mandatory</Text>
                    <Text style={styles.toggleHint}>
                      Whether this expense repeats every period
                    </Text>
                  </View>
                  <Switch
                    value={newSubCategoryIsMandatory}
                    onValueChange={setNewSubCategoryIsMandatory}
                    trackColor={{ false: colors.border, true: `${colors.warning}50` }}
                    thumbColor={newSubCategoryIsMandatory ? colors.warning : colors.textLight}
                  />
                </View>
              )}

              <View style={[styles.subCategoryBudgetRow, { marginTop: 16 }]}>
                <Text style={styles.subCategoryBudgetLabel}>
                  {newSubCategoryIsMandatory && newSubCategoryIsFixed ? 'Fixed Amount:' : 'Max Budget:'}
                </Text>
                <View style={styles.subCategoryBudgetInput}>
                  <Text style={styles.subCurrencySymbol}>€</Text>
                  <TextInput
                    style={styles.subBudgetField}
                    value={newSubCategoryBudget}
                    onChangeText={setNewSubCategoryBudget}
                    placeholder="0.00"
                    placeholderTextColor={colors.textLight}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={[styles.addSubCategoryActions, { marginTop: 16 }]}>
                <Button
                  title="Cancel"
                  variant="outline"
                  size="small"
                  onPress={resetSubCategoryForm}
                  style={styles.actionButton}
                />
                <Button
                  title={editingSubCategory ? 'Save' : 'Add'}
                  size="small"
                  onPress={handleSaveSubCategory}
                  style={styles.actionButton}
                />
              </View>
            </Card>
          )}

          {/* Existing Subcategories List */}
          {subCategories.length > 0 ? (
            <Card style={styles.subCategoriesList}>
              {subCategories.map((sub, index) => (
                <View key={sub.id}>
                  <View style={styles.subCategoryItem}>
                    <View style={styles.subCategoryInfo}>
                      <View style={[styles.subCategoryDot, { backgroundColor: selectedColor }]} />
                      <View style={styles.subCategoryDetails}>
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
                          <Text style={styles.subCategoryFixedAmount}>
                            Fixed: €{sub.fixedAmount.toFixed(2)}
                          </Text>
                        ) : sub.budgetLimit && sub.budgetLimit > 0 ? (
                          <Text style={styles.subCategoryBudget}>
                            Max: €{sub.budgetLimit.toFixed(2)}
                          </Text>
                        ) : (
                          <Text style={styles.subCategoryNoBudget}>No budget set</Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.subCategoryActions}>
                      <TouchableOpacity
                        style={styles.editSubButton}
                        onPress={() => startEditingSubCategory(sub)}
                      >
                        <Ionicons name="create-outline" size={20} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteSubButton}
                        onPress={() => handleDeleteSubCategory(sub)}
                      >
                        <Ionicons name="trash-outline" size={20} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {index < subCategories.length - 1 && <View style={styles.subCategoryDivider} />}
                </View>
              ))}
            </Card>
          ) : (
            <Card style={styles.emptySubCategories}>
              <Ionicons name="layers-outline" size={32} color={colors.textLight} />
              <Text style={styles.emptySubText}>No subcategories yet</Text>
              <Text style={styles.emptySubHint}>
                Tap the + button to add subcategories
              </Text>
            </Card>
          )}
        </View>

        {/* Preview */}
        <Text style={styles.label}>Preview</Text>
        <Card style={styles.previewCard}>
          <View style={[styles.previewIcon, { backgroundColor: `${selectedColor}20` }]}>
            <Ionicons name={selectedIcon as any} size={28} color={selectedColor} />
          </View>
          <Text style={styles.previewName}>{name || 'Category Name'}</Text>
          {subCategories.length > 0 && (
            <Text style={styles.previewSubCount}>{subCategories.length} subcategories</Text>
          )}
        </Card>

        {/* Actions */}
        <Button
          title={isEditing ? 'Save Changes' : 'Create Category'}
          onPress={handleSave}
          loading={isLoading}
          style={styles.saveButton}
        />

        {isEditing && (
          <Button
            title="Delete Category"
            onPress={handleDelete}
            variant="danger"
            style={styles.deleteButton}
          />
        )}
      </ScrollView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      <ConfirmDialog
        visible={deleteDialog.visible}
        title="Delete Subcategory"
        message={`Are you sure you want to delete "${deleteDialog.subCategory?.name}"?`}
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteSubCategory}
        onCancel={() => setDeleteDialog({ visible: false, subCategory: null })}
      />

      <ConfirmDialog
        visible={deleteCategoryDialog}
        title="Delete Category"
        message={`Are you sure you want to delete "${name}"? This will also remove all associated subcategories and expenses.`}
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteCategory}
        onCancel={() => setDeleteCategoryDialog(false)}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    marginTop: 24,
  },
  hint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 18,
    fontSize: 16,
    color: colors.text,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    marginTop: 6,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 10,
  },
  typeButtonSelected: {
    backgroundColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  typeButtonTextSelected: {
    color: colors.surface,
    fontWeight: '600',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  iconItem: {
    width: '20%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    margin: '2.5%',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorItemSelected: {
    borderWidth: 3,
    borderColor: colors.text,
  },
  // Subcategory styles
  subCategorySection: {
    marginTop: 8,
  },
  subCategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addSubButton: {
    padding: 4,
  },
  addSubCategoryCard: {
    marginTop: 16,
    paddingVertical: 20,
  },
  addSubCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  subCategoryInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  subCategoryBudgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  subCategoryBudgetLabel: {
    fontSize: 14,
    color: colors.text,
    marginRight: 12,
  },
  subCategoryBudgetInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    flex: 1,
  },
  subCurrencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 6,
  },
  subBudgetField: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  addSubCategoryActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: 12,
  },
  subCategoriesList: {
    marginTop: 16,
    paddingVertical: 8,
  },
  subCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  subCategoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subCategoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 14,
  },
  subCategoryDetails: {
    flex: 1,
  },
  subCategoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  subCategoryBudget: {
    fontSize: 13,
    color: colors.primary,
    marginTop: 4,
  },
  subCategoryNoBudget: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 4,
    fontStyle: 'italic',
  },
  subCategoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editSubButton: {
    padding: 8,
    marginRight: 4,
  },
  deleteSubButton: {
    padding: 8,
  },
  subCategoryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 24,
  },
  emptySubCategories: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptySubText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginTop: 12,
  },
  emptySubHint: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
  },
  previewCard: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  previewIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  previewName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  previewSubCount: {
    fontSize: 13,
    color: colors.primary,
    marginTop: 6,
  },
  saveButton: {
    marginTop: 32,
    marginBottom: 40,
  },
  deleteButton: {
    marginTop: 16,
    marginBottom: 100,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  toggleHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  subCategoryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
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
  subCategoryFixedAmount: {
    fontSize: 13,
    color: colors.primary,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default ManageCategoryScreen;
