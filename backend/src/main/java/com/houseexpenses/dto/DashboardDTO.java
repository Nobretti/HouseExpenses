package com.houseexpenses.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDTO {
    private BigDecimal totalSpending;
    private BigDecimal budgetLimit;
    private BigDecimal utilizationPercentage;
    private List<CategorySpendingDTO> topCategories;
    private List<ExpenseDTO> recentExpenses;
    private List<AlertDTO> alerts;
    private Integer unreadAlertCount;
    private List<PendingExpenseDTO> pendingExpenses;
}
