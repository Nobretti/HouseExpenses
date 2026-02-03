package com.houseexpenses.dto;

import com.houseexpenses.model.Category.ExpenseType;
import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryDTO {
    private UUID id;
    private String name;
    private String icon;
    private String color;
    private ExpenseType expenseType;
    private Integer displayOrder;
    private List<SubCategoryDTO> subCategories;
}
