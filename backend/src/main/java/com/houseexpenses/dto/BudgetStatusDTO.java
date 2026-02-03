package com.houseexpenses.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetStatusDTO {
    private BudgetDTO budget;
    private BigDecimal currentSpending;
    private BigDecimal remainingAmount;
    private BigDecimal utilizationPercentage;
    private Status status;
    private Integer daysRemaining;

    public enum Status {
        ok, warning, exceeded
    }
}
