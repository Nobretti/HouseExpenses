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
                .limit(5)
                .map(this::mapExpenseToDTO)
                .collect(Collectors.toList());

        List<AlertDTO> alerts = alertService.getUnreadAlerts(userId);
        int unreadAlertCount = (int) alertService.getUnreadCount(userId);

        return DashboardDTO.builder()
                .totalSpending(totalSpending)
                .budgetLimit(budgetLimit)
                .utilizationPercentage(utilizationPercentage)
                .topCategories(topCategories)
                .recentExpenses(recentExpenses)
                .alerts(alerts)
                .unreadAlertCount(unreadAlertCount)
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

    private ExpenseDTO mapExpenseToDTO(Expense expense) {
        return ExpenseDTO.builder()
                .id(expense.getId())
                .category(CategoryDTO.builder()
                        .id(expense.getCategory().getId())
                        .name(expense.getCategory().getName())
                        .icon(expense.getCategory().getIcon())
                        .color(expense.getCategory().getColor())
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
