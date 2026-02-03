package com.houseexpenses.exception;

import lombok.Getter;
import java.math.BigDecimal;
import java.util.UUID;

@Getter
public class BudgetExceededException extends RuntimeException {

    private final UUID categoryId;
    private final BigDecimal limit;
    private final BigDecimal currentAmount;
    private final BigDecimal exceededBy;

    public BudgetExceededException(UUID categoryId, BigDecimal limit, BigDecimal currentAmount) {
        super("Budget limit exceeded for category");
        this.categoryId = categoryId;
        this.limit = limit;
        this.currentAmount = currentAmount;
        this.exceededBy = currentAmount.subtract(limit);
    }
}
