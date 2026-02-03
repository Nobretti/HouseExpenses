package com.houseexpenses.dto;

import com.houseexpenses.model.Budget.BudgetPeriod;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetDTO {
    private UUID id;
    private CategoryDTO category;
    private SubCategoryDTO subCategory;
    private BigDecimal limitAmount;
    private Integer warningThreshold;
    private BudgetPeriod period;
}
