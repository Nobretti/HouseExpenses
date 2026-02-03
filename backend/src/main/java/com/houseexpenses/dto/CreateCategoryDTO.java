package com.houseexpenses.dto;

import com.houseexpenses.model.Category.ExpenseType;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCategoryDTO {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name cannot exceed 100 characters")
    private String name;

    @NotBlank(message = "Icon is required")
    @Size(max = 50, message = "Icon cannot exceed 50 characters")
    private String icon;

    @NotBlank(message = "Color is required")
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color must be a valid hex code")
    private String color;

    @NotNull(message = "Expense type is required")
    private ExpenseType expenseType;

    private Integer displayOrder;
}
