package com.houseexpenses.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseDTO {
    private UUID id;
    private CategoryDTO category;
    private SubCategoryDTO subCategory;
    private BigDecimal amount;
    private String description;
    private LocalDate date;
    private OffsetDateTime createdAt;
}
