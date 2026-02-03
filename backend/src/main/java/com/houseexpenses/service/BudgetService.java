package com.houseexpenses.service;

import com.houseexpenses.dto.*;
import com.houseexpenses.exception.ResourceNotFoundException;
import com.houseexpenses.model.*;
import com.houseexpenses.model.Budget.BudgetPeriod;
import com.houseexpenses.repository.*;
import com.houseexpenses.util.DateUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final ExpenseRepository expenseRepository;

    @Transactional(readOnly = true)
    public List<BudgetDTO> getAllBudgets(UUID userId) {
        return budgetRepository.findByUserIdWithDetails(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BudgetDTO getBudget(UUID userId, UUID budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .filter(b -> b.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Budget", "id", budgetId));
        return mapToDTO(budget);
    }

    @Transactional
    public BudgetDTO createBudget(UUID userId, CreateBudgetDTO dto) {
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", dto.getCategoryId()));

        SubCategory subCategory = null;
        if (dto.getSubCategoryId() != null) {
            subCategory = subCategoryRepository.findById(dto.getSubCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("SubCategory", "id", dto.getSubCategoryId()));
        }

        Budget budget = Budget.builder()
                .userId(userId)
                .category(category)
                .subCategory(subCategory)
                .limitAmount(dto.getLimitAmount())
                .warningThreshold(dto.getWarningThreshold() != null ? dto.getWarningThreshold() : 80)
                .period(dto.getPeriod())
                .build();

        budget = budgetRepository.save(budget);
        log.info("Created budget {} for user {}", budget.getId(), userId);

        return mapToDTO(budget);
    }

    @Transactional
    public BudgetDTO updateBudget(UUID userId, UUID budgetId, CreateBudgetDTO dto) {
        Budget budget = budgetRepository.findById(budgetId)
                .filter(b -> b.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Budget", "id", budgetId));

        budget.setLimitAmount(dto.getLimitAmount());
        if (dto.getWarningThreshold() != null) {
            budget.setWarningThreshold(dto.getWarningThreshold());
        }

        budget = budgetRepository.save(budget);
        log.info("Updated budget {} for user {}", budgetId, userId);

        return mapToDTO(budget);
    }

    @Transactional
    public void deleteBudget(UUID userId, UUID budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .filter(b -> b.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Budget", "id", budgetId));

        budgetRepository.delete(budget);
        log.info("Deleted budget {} for user {}", budgetId, userId);
    }

    @Transactional(readOnly = true)
    public BudgetStatusDTO getBudgetStatus(UUID userId, UUID budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .filter(b -> b.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Budget", "id", budgetId));

        return calculateBudgetStatus(userId, budget, LocalDate.now());
    }

    @Transactional(readOnly = true)
    public List<BudgetStatusDTO> getAllBudgetStatuses(UUID userId) {
        LocalDate now = LocalDate.now();
        return budgetRepository.findByUserIdWithDetails(userId).stream()
                .map(budget -> calculateBudgetStatus(userId, budget, now))
                .collect(Collectors.toList());
    }

    public BudgetStatusDTO calculateBudgetStatus(UUID userId, Budget budget, LocalDate referenceDate) {
        LocalDate[] dateRange = DateUtils.getDateRangeForPeriod(budget.getPeriod(), referenceDate);
        LocalDate startDate = dateRange[0];
        LocalDate endDate = dateRange[1];

        BigDecimal currentSpending;
        if (budget.getSubCategory() != null) {
            currentSpending = expenseRepository.sumBySubCategoryAndDateRange(
                    userId, budget.getSubCategory().getId(), startDate, endDate);
        } else {
            currentSpending = expenseRepository.sumByCategoryAndDateRange(
                    userId, budget.getCategory().getId(), startDate, endDate);
        }

        BigDecimal remainingAmount = budget.getLimitAmount().subtract(currentSpending);
        BigDecimal utilizationPercentage = BigDecimal.ZERO;
        if (budget.getLimitAmount().compareTo(BigDecimal.ZERO) > 0) {
            utilizationPercentage = currentSpending
                    .multiply(BigDecimal.valueOf(100))
                    .divide(budget.getLimitAmount(), 2, RoundingMode.HALF_UP);
        }

        BudgetStatusDTO.Status status = BudgetStatusDTO.Status.ok;
        if (utilizationPercentage.compareTo(BigDecimal.valueOf(100)) >= 0) {
            status = BudgetStatusDTO.Status.exceeded;
        } else if (utilizationPercentage.compareTo(BigDecimal.valueOf(budget.getWarningThreshold())) >= 0) {
            status = BudgetStatusDTO.Status.warning;
        }

        int daysRemaining = DateUtils.getDaysRemaining(budget.getPeriod(), referenceDate);

        return BudgetStatusDTO.builder()
                .budget(mapToDTO(budget))
                .currentSpending(currentSpending)
                .remainingAmount(remainingAmount)
                .utilizationPercentage(utilizationPercentage)
                .status(status)
                .daysRemaining(daysRemaining)
                .build();
    }

    private BudgetDTO mapToDTO(Budget budget) {
        return BudgetDTO.builder()
                .id(budget.getId())
                .category(mapCategoryToDTO(budget.getCategory()))
                .subCategory(budget.getSubCategory() != null ? mapSubCategoryToDTO(budget.getSubCategory()) : null)
                .limitAmount(budget.getLimitAmount())
                .warningThreshold(budget.getWarningThreshold())
                .period(budget.getPeriod())
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
