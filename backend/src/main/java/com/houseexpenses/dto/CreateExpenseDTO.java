package com.houseexpenses.dto;

import com.houseexpenses.model.Expense.ExpenseType;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateExpenseDTO {

    @NotNull(message = "Category is required")
    private UUID categoryId;

    private UUID subCategoryId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    @Digits(integer = 8, fraction = 2, message = "Amount format is invalid")
    private BigDecimal amount;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @Builder.Default
    private ExpenseType expenseType = ExpenseType.monthly;
}
