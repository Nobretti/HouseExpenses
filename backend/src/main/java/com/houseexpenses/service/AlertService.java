package com.houseexpenses.service;

import com.houseexpenses.dto.*;
import com.houseexpenses.exception.ResourceNotFoundException;
import com.houseexpenses.model.*;
import com.houseexpenses.model.Alert.AlertType;
import com.houseexpenses.model.Budget.BudgetPeriod;
import com.houseexpenses.repository.*;
import com.houseexpenses.util.DateUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
public class AlertService {

    private final AlertRepository alertRepository;
    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;

    @Transactional(readOnly = true)
    public Page<AlertDTO> getAlerts(UUID userId, Pageable pageable) {
        return alertRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public List<AlertDTO> getUnreadAlerts(UUID userId) {
        return alertRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return alertRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(UUID userId, UUID alertId) {
        int updated = alertRepository.markAsRead(alertId, userId);
        if (updated == 0) {
            throw new ResourceNotFoundException("Alert", "id", alertId);
        }
        log.info("Marked alert {} as read for user {}", alertId, userId);
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        int updated = alertRepository.markAllAsRead(userId);
        log.info("Marked {} alerts as read for user {}", updated, userId);
    }

    @Transactional
    public void checkBudgetAndCreateAlert(UUID userId, UUID categoryId, UUID subCategoryId, LocalDate expenseDate) {
        List<Budget> budgets = budgetRepository.findByUserId(userId).stream()
                .filter(b -> b.getCategory().getId().equals(categoryId))
                .filter(b -> subCategoryId == null || b.getSubCategory() == null ||
                        b.getSubCategory().getId().equals(subCategoryId))
                .collect(Collectors.toList());

        for (Budget budget : budgets) {
            checkAndCreateAlertForBudget(userId, budget, expenseDate);
        }
    }

    private void checkAndCreateAlertForBudget(UUID userId, Budget budget, LocalDate referenceDate) {
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

        BigDecimal percentage = BigDecimal.ZERO;
        if (budget.getLimitAmount().compareTo(BigDecimal.ZERO) > 0) {
            percentage = currentSpending
                    .multiply(BigDecimal.valueOf(100))
                    .divide(budget.getLimitAmount(), 2, RoundingMode.HALF_UP);
        }

        if (percentage.compareTo(BigDecimal.valueOf(100)) >= 0) {
            createAlert(userId, budget, AlertType.exceeded, percentage);
        } else if (percentage.compareTo(BigDecimal.valueOf(budget.getWarningThreshold())) >= 0) {
            createAlert(userId, budget, AlertType.warning, percentage);
        }
    }

    private void createAlert(UUID userId, Budget budget, AlertType type, BigDecimal percentage) {
        String categoryName = budget.getCategory().getName();
        String subCategoryName = budget.getSubCategory() != null ? budget.getSubCategory().getName() : null;

        String message;
        if (type == AlertType.exceeded) {
            message = String.format("Budget exceeded for %s%s! Currently at %.1f%%",
                    categoryName,
                    subCategoryName != null ? " - " + subCategoryName : "",
                    percentage);
        } else {
            message = String.format("Warning: %s%s is at %.1f%% of budget",
                    categoryName,
                    subCategoryName != null ? " - " + subCategoryName : "",
                    percentage);
        }

        Alert alert = Alert.builder()
                .userId(userId)
                .budget(budget)
                .alertType(type)
                .message(message)
                .percentage(percentage)
                .build();

        alertRepository.save(alert);
        log.info("Created {} alert for user {} - {}", type, userId, message);
    }

    private AlertDTO mapToDTO(Alert alert) {
        Budget budget = alert.getBudget();
        return AlertDTO.builder()
                .id(alert.getId())
                .alertType(alert.getAlertType())
                .message(alert.getMessage())
                .percentage(alert.getPercentage())
                .isRead(alert.getIsRead())
                .createdAt(alert.getCreatedAt())
                .category(CategoryDTO.builder()
                        .id(budget.getCategory().getId())
                        .name(budget.getCategory().getName())
                        .icon(budget.getCategory().getIcon())
                        .color(budget.getCategory().getColor())
                        .build())
                .subCategory(budget.getSubCategory() != null ? SubCategoryDTO.builder()
                        .id(budget.getSubCategory().getId())
                        .name(budget.getSubCategory().getName())
                        .icon(budget.getSubCategory().getIcon())
                        .build() : null)
                .build();
    }
}
