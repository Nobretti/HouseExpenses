package com.houseexpenses.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChartDataDTO {
    private List<DataPoint> dataPoints;
    private BigDecimal total;
    private BigDecimal average;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DataPoint {
        private String label;
        private BigDecimal value;
        private String color;
    }
}
