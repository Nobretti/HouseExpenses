package com.houseexpenses.dto;

import com.houseexpenses.model.Budget.BudgetPeriod;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBudgetDTO {

    @NotNull(message = "Category is required")
    private UUID categoryId;

    private UUID subCategoryId;

    @NotNull(message = "Limit amount is required")
    @DecimalMin(value = "0.01", message = "Limit must be greater than 0")
    @Digits(integer = 8, fraction = 2, message = "Limit format is invalid")
    private BigDecimal limitAmount;

    @Min(value = 1, message = "Warning threshold must be at least 1")
    @Max(value = 100, message = "Warning threshold cannot exceed 100")
    private Integer warningThreshold = 80;

    @NotNull(message = "Period is required")
    private BudgetPeriod period;
}
