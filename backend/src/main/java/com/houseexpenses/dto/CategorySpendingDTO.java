package com.houseexpenses.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategorySpendingDTO {
    private UUID categoryId;
    private String categoryName;
    private String icon;
    private String color;
    private BigDecimal amount;
    private BigDecimal budgetLimit;
    private BigDecimal percentage;
}
