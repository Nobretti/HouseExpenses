package com.houseexpenses.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingExpenseDTO {
    private UUID subCategoryId;
    private String subCategoryName;
    private UUID categoryId;
    private String categoryName;
    private String categoryColor;
    private String categoryExpenseType;
    private BigDecimal expectedAmount;
    private boolean isFixed;
    private boolean isPaidThisPeriod;
    private BigDecimal paidAmount;
    private LocalDate lastPaidDate;
    private int paymentCount;
}
