package com.houseexpenses.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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

    @JsonProperty("isFixed")
    private boolean isFixed;

    @JsonProperty("isPaidThisPeriod")
    private boolean isPaidThisPeriod;

    private BigDecimal paidAmount;
    private LocalDate lastPaidDate;
    private int paymentCount;
}
