package com.houseexpenses.service;

import com.houseexpenses.dto.*;
import com.houseexpenses.exception.ResourceNotFoundException;
import com.houseexpenses.model.*;
import com.houseexpenses.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final AlertService alertService;

    @Transactional(readOnly = true)
    public Page<ExpenseDTO> getExpenses(UUID userId, LocalDate startDate, LocalDate endDate,
                                        UUID categoryId, UUID subCategoryId, Pageable pageable) {
        // Use unsorted pageable - the native query already has ORDER BY expense_date DESC
        Pageable unsortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
        Page<Expense> expenses = expenseRepository.findByFilters(
                userId, startDate, endDate, categoryId, subCategoryId, unsortedPageable);
        return expenses.map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public ExpenseDTO getExpense(UUID userId, UUID expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .filter(e -> e.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", expenseId));
        return mapToDTO(expense);
    }

    @Transactional
    public ExpenseDTO createExpense(UUID userId, CreateExpenseDTO dto) {
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", dto.getCategoryId()));

        SubCategory subCategory = null;
        if (dto.getSubCategoryId() != null) {
            subCategory = subCategoryRepository.findById(dto.getSubCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("SubCategory", "id", dto.getSubCategoryId()));
        }

        Expense expense = Expense.builder()
                .userId(userId)
                .category(category)
                .subCategory(subCategory)
                .amount(dto.getAmount())
                .description(dto.getDescription())
                .expenseDate(dto.getDate())
                .expenseType(dto.getExpenseType() != null ? dto.getExpenseType() : Expense.ExpenseType.monthly)
                .build();

        expense = expenseRepository.save(expense);
        log.info("Created expense {} for user {}", expense.getId(), userId);

        // Check budget and create alerts if necessary
        alertService.checkBudgetAndCreateAlert(userId, category.getId(),
                subCategory != null ? subCategory.getId() : null, dto.getDate());

        return mapToDTO(expense);
    }

    @Transactional
    public List<ExpenseDTO> createBulkExpenses(UUID userId, List<CreateExpenseDTO> dtos) {
        return dtos.stream()
                .map(dto -> createExpense(userId, dto))
                .collect(Collectors.toList());
    }

    @Transactional
    public ExpenseDTO updateExpense(UUID userId, UUID expenseId, CreateExpenseDTO dto) {
        Expense expense = expenseRepository.findById(expenseId)
                .filter(e -> e.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", expenseId));

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", dto.getCategoryId()));

        SubCategory subCategory = null;
        if (dto.getSubCategoryId() != null) {
            subCategory = subCategoryRepository.findById(dto.getSubCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("SubCategory", "id", dto.getSubCategoryId()));
        }

        expense.setCategory(category);
        expense.setSubCategory(subCategory);
        expense.setAmount(dto.getAmount());
        expense.setDescription(dto.getDescription());
        expense.setExpenseDate(dto.getDate());
        expense.setExpenseType(dto.getExpenseType() != null ? dto.getExpenseType() : Expense.ExpenseType.monthly);

        expense = expenseRepository.save(expense);
        log.info("Updated expense {} for user {}", expense.getId(), userId);

        return mapToDTO(expense);
    }

    @Transactional
    public void deleteExpense(UUID userId, UUID expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .filter(e -> e.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", expenseId));

        expenseRepository.delete(expense);
        log.info("Deleted expense {} for user {}", expenseId, userId);
    }

    private ExpenseDTO mapToDTO(Expense expense) {
        return ExpenseDTO.builder()
                .id(expense.getId())
                .category(mapCategoryToDTO(expense.getCategory()))
                .subCategory(expense.getSubCategory() != null ? mapSubCategoryToDTO(expense.getSubCategory()) : null)
                .amount(expense.getAmount())
                .description(expense.getDescription())
                .date(expense.getExpenseDate())
                .expenseType(expense.getExpenseType() != null ? expense.getExpenseType() : Expense.ExpenseType.monthly)
                .createdAt(expense.getCreatedAt())
                .build();
    }

    private CategoryDTO mapCategoryToDTO(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .icon(category.getIcon())
                .color(category.getColor())
                .expenseType(category.getExpenseType())
                .build();
    }

    private SubCategoryDTO mapSubCategoryToDTO(SubCategory subCategory) {
        return SubCategoryDTO.builder()
                .id(subCategory.getId())
                .name(subCategory.getName())
                .icon(subCategory.getIcon())
                .build();
    }
}
