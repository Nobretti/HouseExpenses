package com.houseexpenses.dto;

import com.houseexpenses.model.Alert.AlertType;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertDTO {
    private UUID id;
    private AlertType alertType;
    private String message;
    private BigDecimal percentage;
    private Boolean isRead;
    private OffsetDateTime createdAt;
    private CategoryDTO category;
    private SubCategoryDTO subCategory;
}
