package com.houseexpenses.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateSubCategoryDTO {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name cannot exceed 100 characters")
    private String name;

    @Size(max = 50, message = "Icon cannot exceed 50 characters")
    private String icon;

    private Integer displayOrder;

    @PositiveOrZero(message = "Budget limit must be zero or positive")
    private Double budgetLimit;

    private Boolean isMandatory;

    @PositiveOrZero(message = "Fixed amount must be zero or positive")
    private Double fixedAmount;
}
