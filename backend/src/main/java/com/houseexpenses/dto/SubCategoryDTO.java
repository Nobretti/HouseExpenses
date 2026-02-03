package com.houseexpenses.dto;

import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubCategoryDTO {
    private UUID id;
    private String name;
    private String icon;
    private Integer displayOrder;
    private Double budgetLimit;
    private Boolean isMandatory;
    private Double fixedAmount;
}
