package com.houseexpenses.service;

import com.houseexpenses.dto.*;
import com.houseexpenses.model.*;
import com.houseexpenses.repository.*;
import com.houseexpenses.util.DateUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final BudgetRepository budgetRepository;
    private final AlertService alertService;
    private final BudgetService budgetService;

    @Transactional(readOnly = true)
    public DashboardDTO getSummary(UUID userId, Integer year, Integer month) {
        LocalDate referenceDate = getReferenceDateForMonth(year, month);
        LocalDate[] monthRange = DateUtils.getDateRangeForPeriod(Budget.BudgetPeriod.monthly, referenceDate);

        BigDecimal totalSpending = expenseRepository.sumByUserIdAndDateRange(
                userId, monthRange[0], monthRange[1]);

        BigDecimal budgetLimit = budgetRepository.findByUserIdAndPeriod(userId, Budget.BudgetPeriod.monthly)
                .stream()
                .map(Budget::getLimitAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal utilizationPercentage = BigDecimal.ZERO;
        if (budgetLimit.compareTo(BigDecimal.ZERO) > 0) {
            utilizationPercentage = totalSpending
                    .multiply(BigDecimal.valueOf(100))
                    .divide(budgetLimit, 2, RoundingMode.HALF_UP);
        }

        List<CategorySpendingDTO> topCategories = getTopCategoriesSpending(userId, monthRange[0], monthRange[1], 5);

        List<ExpenseDTO> recentExpenses = expenseRepository
                .findByUserIdAndExpenseDateBetweenOrderByExpenseDateDesc(userId, monthRange[0], monthRange[1])
                .stream()
                .map(this::mapExpenseToDTO)
                .collect(Collectors.toList());

        List<AlertDTO> alerts = alertService.getUnreadAlerts(userId);
        int unreadAlertCount = (int) alertService.getUnreadCount(userId);

        List<PendingExpenseDTO> pendingExpenses = computePendingExpenses(userId, referenceDate);

        return DashboardDTO.builder()
                .totalSpending(totalSpending)
                .budgetLimit(budgetLimit)
                .utilizationPercentage(utilizationPercentage)
                .topCategories(topCategories)
                .recentExpenses(recentExpenses)
                .alerts(alerts)
                .unreadAlertCount(unreadAlertCount)
                .pendingExpenses(pendingExpenses)
                .build();
    }

    private LocalDate getReferenceDateForMonth(Integer year, Integer month) {
        LocalDate now = LocalDate.now();
        if (year != null && month != null) {
            return LocalDate.of(year, month, 15);
        }
        return now;
    }

    private LocalDate getReferenceDateForYear(Integer year) {
        LocalDate now = LocalDate.now();
        if (year != null) {
            return LocalDate.of(year, 6, 15);
        }
        return now;
    }

    private LocalDate getReferenceDateForDay(Integer year, Integer month, Integer day) {
        LocalDate now = LocalDate.now();
        if (year != null && month != null && day != null) {
            return LocalDate.of(year, month, day);
        }
        return now;
    }

    @Transactional(readOnly = true)
    public ChartDataDTO getWeeklyData(UUID userId, Integer year, Integer month, Integer day) {
        LocalDate referenceDate = getReferenceDateForDay(year, month, day);
        LocalDate[] weekRange = DateUtils.getDateRangeForPeriod(Budget.BudgetPeriod.weekly, referenceDate);

        List<ChartDataDTO.DataPoint> dataPoints = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (LocalDate date = weekRange[0]; !date.isAfter(weekRange[1]); date = date.plusDays(1)) {
            BigDecimal dayTotal = expenseRepository.sumByUserIdAndDateRange(userId, date, date);
            dataPoints.add(ChartDataDTO.DataPoint.builder()
                    .label(date.format(DateTimeFormatter.ofPattern("EEE")))
                    .value(dayTotal)
                    .build());
            total = total.add(dayTotal);
        }

        BigDecimal average = dataPoints.isEmpty() ? BigDecimal.ZERO :
                total.divide(BigDecimal.valueOf(dataPoints.size()), 2, RoundingMode.HALF_UP);

        return ChartDataDTO.builder()
                .dataPoints(dataPoints)
                .total(total)
                .average(average)
                .build();
    }

    @Transactional(readOnly = true)
    public ChartDataDTO getMonthlyData(UUID userId, Integer year, Integer month) {
        LocalDate referenceDate = getReferenceDateForMonth(year, month);
        LocalDate[] monthRange = DateUtils.getDateRangeForPeriod(Budget.BudgetPeriod.monthly, referenceDate);

        List<ChartDataDTO.DataPoint> dataPoints = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        LocalDate weekStart = monthRange[0];
        int weekNumber = 1;

        while (!weekStart.isAfter(monthRange[1])) {
            LocalDate weekEnd = weekStart.plusDays(6);
            if (weekEnd.isAfter(monthRange[1])) {
                weekEnd = monthRange[1];
            }

            BigDecimal weekTotal = expenseRepository.sumByUserIdAndDateRange(userId, weekStart, weekEnd);
            dataPoints.add(ChartDataDTO.DataPoint.builder()
                    .label("Week " + weekNumber)
                    .value(weekTotal)
                    .build());
            total = total.add(weekTotal);

            weekStart = weekEnd.plusDays(1);
            weekNumber++;
        }

        BigDecimal average = dataPoints.isEmpty() ? BigDecimal.ZERO :
                total.divide(BigDecimal.valueOf(dataPoints.size()), 2, RoundingMode.HALF_UP);

        return ChartDataDTO.builder()
                .dataPoints(dataPoints)
                .total(total)
                .average(average)
                .build();
    }

    @Transactional(readOnly = true)
    public ChartDataDTO getAnnualData(UUID userId, Integer year) {
        LocalDate referenceDate = getReferenceDateForYear(year);
        int targetYear = referenceDate.getYear();
        LocalDate now = LocalDate.now();
        LocalDate[] yearRange = DateUtils.getDateRangeForPeriod(Budget.BudgetPeriod.annual, referenceDate);

        List<ChartDataDTO.DataPoint> dataPoints = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (int month = 1; month <= 12; month++) {
            LocalDate monthStart = LocalDate.of(targetYear, month, 1);
            LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);

            // For historical years, show all months; for current year, only up to now
            if (targetYear == now.getYear() && monthStart.isAfter(now)) {
                break;
            }

            BigDecimal monthTotal = expenseRepository.sumByUserIdAndDateRange(userId, monthStart, monthEnd);
            dataPoints.add(ChartDataDTO.DataPoint.builder()
                    .label(monthStart.format(DateTimeFormatter.ofPattern("MMM")))
                    .value(monthTotal)
                    .build());
            total = total.add(monthTotal);
        }

        BigDecimal average = dataPoints.isEmpty() ? BigDecimal.ZERO :
                total.divide(BigDecimal.valueOf(dataPoints.size()), 2, RoundingMode.HALF_UP);

        return ChartDataDTO.builder()
                .dataPoints(dataPoints)
                .total(total)
                .average(average)
                .build();
    }

    @Transactional(readOnly = true)
    public List<CategorySpendingDTO> getCategoryBreakdown(UUID userId, Budget.BudgetPeriod period) {
        LocalDate now = LocalDate.now();
        LocalDate[] dateRange = DateUtils.getDateRangeForPeriod(period, now);

        return getTopCategoriesSpending(userId, dateRange[0], dateRange[1], Integer.MAX_VALUE);
    }

    private List<CategorySpendingDTO> getTopCategoriesSpending(UUID userId, LocalDate startDate,
                                                                LocalDate endDate, int limit) {
        List<Object[]> categoryTotals = expenseRepository.sumByCategory(userId, startDate, endDate);
        Map<UUID, Category> categoriesMap = categoryRepository.findByUserIdAndIsActiveTrueOrderByDisplayOrder(userId)
                .stream()
                .collect(Collectors.toMap(Category::getId, c -> c));

        Map<UUID, BigDecimal> budgetLimits = budgetRepository.findByUserIdAndPeriod(userId, Budget.BudgetPeriod.monthly)
                .stream()
                .filter(b -> b.getSubCategory() == null)
                .collect(Collectors.toMap(b -> b.getCategory().getId(), Budget::getLimitAmount,
                        (existing, replacement) -> existing));

        BigDecimal totalSpending = categoryTotals.stream()
                .map(row -> (BigDecimal) row[1])
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return categoryTotals.stream()
                .map(row -> {
                    UUID categoryId = (UUID) row[0];
                    BigDecimal amount = (BigDecimal) row[1];
                    Category category = categoriesMap.get(categoryId);

                    BigDecimal budgetLimit = budgetLimits.getOrDefault(categoryId, BigDecimal.ZERO);
                    BigDecimal percentage = totalSpending.compareTo(BigDecimal.ZERO) > 0 ?
                            amount.multiply(BigDecimal.valueOf(100))
                                    .divide(totalSpending, 2, RoundingMode.HALF_UP) :
                            BigDecimal.ZERO;

                    return CategorySpendingDTO.builder()
                            .categoryId(categoryId)
                            .categoryName(category != null ? category.getName() : "Unknown")
                            .icon(category != null ? category.getIcon() : "help-circle")
                            .color(category != null ? category.getColor() : "#95A5A6")
                            .amount(amount)
                            .budgetLimit(budgetLimit)
                            .percentage(percentage)
                            .build();
                })
                .sorted((a, b) -> b.getAmount().compareTo(a.getAmount()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    private List<PendingExpenseDTO> computePendingExpenses(UUID userId, LocalDate referenceDate) {
        List<Category> categories = categoryRepository.findByUserIdWithSubCategories(userId);

        // Compute date ranges for monthly and annual
        LocalDate[] monthRange = DateUtils.getDateRangeForPeriod(Budget.BudgetPeriod.monthly, referenceDate);
        LocalDate[] yearRange = DateUtils.getDateRangeForPeriod(Budget.BudgetPeriod.annual, referenceDate);

        // Get all subcategory payment summaries for both monthly and annual ranges in bulk
        Map<UUID, Object[]> monthlyPayments = expenseRepository
                .sumBySubCategoryGrouped(userId, monthRange[0], monthRange[1])
                .stream()
                .collect(Collectors.toMap(row -> (UUID) row[0], row -> row));

        Map<UUID, Object[]> annualPayments = expenseRepository
                .sumBySubCategoryGrouped(userId, yearRange[0], yearRange[1])
                .stream()
                .collect(Collectors.toMap(row -> (UUID) row[0], row -> row));

        List<PendingExpenseDTO> pendingExpenses = new ArrayList<>();

        for (Category category : categories) {
            boolean isAnnual = category.getExpenseType() == Category.ExpenseType.annual;
            Map<UUID, Object[]> relevantPayments = isAnnual ? annualPayments : monthlyPayments;

            for (SubCategory subCategory : category.getSubCategories()) {
                if (!subCategory.getIsActive()) continue;

                boolean isFixed = subCategory.getFixedAmount() != null && subCategory.getFixedAmount() > 0;
                boolean isMandatory = isFixed || Boolean.TRUE.equals(subCategory.getIsMandatory());

                if (!isMandatory) continue;

                // Determine expected amount
                BigDecimal expectedAmount;
                if (isFixed) {
                    expectedAmount = BigDecimal.valueOf(subCategory.getFixedAmount());
                } else {
                    // Non-fixed mandatory: use budget limit as expected
                    Double bl = subCategory.getBudgetLimit();
                    expectedAmount = bl != null ? BigDecimal.valueOf(bl) : BigDecimal.ZERO;
                }

                // For fixed expenses, skip if no amount set
                if (isFixed && expectedAmount.compareTo(BigDecimal.ZERO) == 0) continue;

                // Check payments from grouped query
                Object[] paymentData = relevantPayments.get(subCategory.getId());
                BigDecimal paidAmount = BigDecimal.ZERO;
                long paymentCount = 0;
                LocalDate lastPaidDate = null;

                if (paymentData != null) {
                    paidAmount = (BigDecimal) paymentData[1];
                    paymentCount = (Long) paymentData[2];
                    lastPaidDate = (LocalDate) paymentData[3];
                }

                // For fixed expenses, check if paid amount meets expected
                // For mandatory non-fixed, check if any payment was made
                boolean isPaid;
                if (isFixed) {
                    isPaid = paidAmount.compareTo(expectedAmount) >= 0;
                } else {
                    // Mandatory non-fixed: consider paid if any payment was made
                    isPaid = paidAmount.compareTo(BigDecimal.ZERO) > 0;
                }

                if (isPaid) continue;

                pendingExpenses.add(PendingExpenseDTO.builder()
                        .subCategoryId(subCategory.getId())
                        .subCategoryName(subCategory.getName())
                        .categoryId(category.getId())
                        .categoryName(category.getName())
                        .categoryColor(category.getColor())
                        .categoryExpenseType(category.getExpenseType().name())
                        .expectedAmount(expectedAmount)
                        .isFixed(isFixed)
                        .isPaidThisPeriod(false)
                        .paidAmount(paidAmount)
                        .lastPaidDate(lastPaidDate)
                        .paymentCount((int) paymentCount)
                        .build());
            }
        }

        return pendingExpenses;
    }

    private ExpenseDTO mapExpenseToDTO(Expense expense) {
        return ExpenseDTO.builder()
                .id(expense.getId())
                .category(CategoryDTO.builder()
                        .id(expense.getCategory().getId())
                        .name(expense.getCategory().getName())
                        .icon(expense.getCategory().getIcon())
                        .color(expense.getCategory().getColor())
                        .expenseType(expense.getCategory().getExpenseType())
                        .build())
                .subCategory(expense.getSubCategory() != null ? SubCategoryDTO.builder()
                        .id(expense.getSubCategory().getId())
                        .name(expense.getSubCategory().getName())
                        .icon(expense.getSubCategory().getIcon())
                        .build() : null)
                .amount(expense.getAmount())
                .description(expense.getDescription())
                .date(expense.getExpenseDate())
                .createdAt(expense.getCreatedAt())
                .build();
    }
}
