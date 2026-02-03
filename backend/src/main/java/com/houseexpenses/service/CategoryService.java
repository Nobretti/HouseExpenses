package com.houseexpenses.service;

import com.houseexpenses.dto.*;
import com.houseexpenses.exception.DuplicateResourceException;
import com.houseexpenses.exception.ResourceNotFoundException;
import com.houseexpenses.model.*;
import com.houseexpenses.model.Category.ExpenseType;
import com.houseexpenses.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllCategories(UUID userId) {
        return categoryRepository.findByUserIdWithSubCategories(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoryDTO> getCategoriesByType(UUID userId, ExpenseType expenseType) {
        return categoryRepository.findByUserIdAndExpenseTypeAndIsActiveTrueOrderByDisplayOrder(userId, expenseType)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryDTO getCategory(UUID userId, UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .filter(c -> c.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));
        return mapToDTO(category);
    }

    @Transactional
    public CategoryDTO createCategory(UUID userId, CreateCategoryDTO dto) {
        if (categoryRepository.existsByUserIdAndNameIgnoreCase(userId, dto.getName())) {
            throw new DuplicateResourceException("Category", "name", dto.getName());
        }

        // Auto-assign display order to next position if not specified
        int displayOrder;
        if (dto.getDisplayOrder() != null) {
            displayOrder = dto.getDisplayOrder();
        } else {
            List<Category> existingCategories = categoryRepository
                    .findByUserIdAndExpenseTypeAndIsActiveTrueOrderByDisplayOrder(userId, dto.getExpenseType());
            displayOrder = existingCategories.size();
        }

        Category category = Category.builder()
                .userId(userId)
                .name(dto.getName())
                .icon(dto.getIcon())
                .color(dto.getColor())
                .expenseType(dto.getExpenseType())
                .displayOrder(displayOrder)
                .build();

        category = categoryRepository.save(category);
        log.info("Created category {} for user {} at position {}", category.getId(), userId, displayOrder);

        return mapToDTO(category);
    }

    @Transactional
    public CategoryDTO updateCategory(UUID userId, UUID categoryId, CreateCategoryDTO dto) {
        Category category = categoryRepository.findById(categoryId)
                .filter(c -> c.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));

        category.setName(dto.getName());
        category.setIcon(dto.getIcon());
        category.setColor(dto.getColor());
        category.setExpenseType(dto.getExpenseType());
        if (dto.getDisplayOrder() != null) {
            category.setDisplayOrder(dto.getDisplayOrder());
        }

        category = categoryRepository.save(category);
        log.info("Updated category {} for user {}", categoryId, userId);

        return mapToDTO(category);
    }

    @Transactional
    public void deleteCategory(UUID userId, UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .filter(c -> c.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));

        category.setIsActive(false);
        categoryRepository.save(category);
        log.info("Soft deleted category {} for user {}", categoryId, userId);
    }

    @Transactional
    public SubCategoryDTO createSubCategory(UUID userId, UUID categoryId, CreateSubCategoryDTO dto) {
        Category category = categoryRepository.findById(categoryId)
                .filter(c -> c.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));

        if (subCategoryRepository.existsByCategoryIdAndNameIgnoreCase(categoryId, dto.getName())) {
            throw new DuplicateResourceException("SubCategory", "name", dto.getName());
        }

        SubCategory subCategory = SubCategory.builder()
                .category(category)
                .name(dto.getName())
                .icon(dto.getIcon())
                .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0)
                .budgetLimit(dto.getBudgetLimit())
                .isMandatory(dto.getIsMandatory() != null ? dto.getIsMandatory() : false)
                .fixedAmount(dto.getFixedAmount())
                .build();

        subCategory = subCategoryRepository.save(subCategory);
        log.info("Created subcategory {} for category {}", subCategory.getId(), categoryId);

        return mapSubCategoryToDTO(subCategory);
    }

    @Transactional
    public SubCategoryDTO updateSubCategory(UUID userId, UUID subCategoryId, CreateSubCategoryDTO dto) {
        SubCategory subCategory = subCategoryRepository.findById(subCategoryId)
                .filter(sc -> sc.getCategory().getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("SubCategory", "id", subCategoryId));

        subCategory.setName(dto.getName());
        subCategory.setIcon(dto.getIcon());
        if (dto.getDisplayOrder() != null) {
            subCategory.setDisplayOrder(dto.getDisplayOrder());
        }
        subCategory.setBudgetLimit(dto.getBudgetLimit());
        subCategory.setIsMandatory(dto.getIsMandatory() != null ? dto.getIsMandatory() : false);
        subCategory.setFixedAmount(dto.getFixedAmount());

        subCategory = subCategoryRepository.save(subCategory);
        log.info("Updated subcategory {}", subCategoryId);

        return mapSubCategoryToDTO(subCategory);
    }

    @Transactional
    public void deleteSubCategory(UUID userId, UUID subCategoryId) {
        SubCategory subCategory = subCategoryRepository.findById(subCategoryId)
                .filter(sc -> sc.getCategory().getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("SubCategory", "id", subCategoryId));

        subCategory.setIsActive(false);
        subCategoryRepository.save(subCategory);
        log.info("Soft deleted subcategory {}", subCategoryId);
    }

    @Transactional
    public CategoryDTO reorderCategory(UUID userId, UUID categoryId, int newOrder) {
        Category category = categoryRepository.findById(categoryId)
                .filter(c -> c.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));

        ExpenseType expenseType = category.getExpenseType();
        List<Category> sameTypeCategories = categoryRepository
                .findByUserIdAndExpenseTypeAndIsActiveTrueOrderByDisplayOrder(userId, expenseType);

        int oldOrder = category.getDisplayOrder();

        // Update orders for affected categories
        for (Category c : sameTypeCategories) {
            int currentOrder = c.getDisplayOrder();
            if (c.getId().equals(categoryId)) {
                c.setDisplayOrder(newOrder);
            } else if (oldOrder < newOrder) {
                // Moving down: shift categories between old and new positions up
                if (currentOrder > oldOrder && currentOrder <= newOrder) {
                    c.setDisplayOrder(currentOrder - 1);
                }
            } else if (oldOrder > newOrder) {
                // Moving up: shift categories between new and old positions down
                if (currentOrder >= newOrder && currentOrder < oldOrder) {
                    c.setDisplayOrder(currentOrder + 1);
                }
            }
        }

        categoryRepository.saveAll(sameTypeCategories);
        log.info("Reordered category {} to position {} for user {}", categoryId, newOrder, userId);

        return mapToDTO(category);
    }

    private CategoryDTO mapToDTO(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .icon(category.getIcon())
                .color(category.getColor())
                .expenseType(category.getExpenseType())
                .displayOrder(category.getDisplayOrder())
                .subCategories(category.getSubCategories().stream()
                        .filter(SubCategory::getIsActive)
                        .map(this::mapSubCategoryToDTO)
                        .collect(Collectors.toList()))
                .build();
    }

    private SubCategoryDTO mapSubCategoryToDTO(SubCategory subCategory) {
        return SubCategoryDTO.builder()
                .id(subCategory.getId())
                .name(subCategory.getName())
                .icon(subCategory.getIcon())
                .displayOrder(subCategory.getDisplayOrder())
                .budgetLimit(subCategory.getBudgetLimit())
                .isMandatory(subCategory.getIsMandatory())
                .fixedAmount(subCategory.getFixedAmount())
                .build();
    }
}
