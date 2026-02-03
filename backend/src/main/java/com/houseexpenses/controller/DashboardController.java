package com.houseexpenses.controller;

import com.houseexpenses.dto.*;
import com.houseexpenses.model.Budget.BudgetPeriod;
import com.houseexpenses.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Dashboard and analytics endpoints")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @Operation(summary = "Get dashboard summary", description = "Returns overall spending summary for specified or current month")
    public ResponseEntity<ApiResponse<DashboardDTO>> getSummary(
            @AuthenticationPrincipal UUID userId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        DashboardDTO summary = dashboardService.getSummary(userId, year, month);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/weekly")
    @Operation(summary = "Get weekly data", description = "Returns daily spending breakdown for specified or current week")
    public ResponseEntity<ApiResponse<ChartDataDTO>> getWeeklyData(
            @AuthenticationPrincipal UUID userId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer day) {
        ChartDataDTO data = dashboardService.getWeeklyData(userId, year, month, day);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/monthly")
    @Operation(summary = "Get monthly data", description = "Returns weekly spending breakdown for specified or current month")
    public ResponseEntity<ApiResponse<ChartDataDTO>> getMonthlyData(
            @AuthenticationPrincipal UUID userId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        ChartDataDTO data = dashboardService.getMonthlyData(userId, year, month);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/annual")
    @Operation(summary = "Get annual data", description = "Returns monthly spending breakdown for specified or current year")
    public ResponseEntity<ApiResponse<ChartDataDTO>> getAnnualData(
            @AuthenticationPrincipal UUID userId,
            @RequestParam(required = false) Integer year) {
        ChartDataDTO data = dashboardService.getAnnualData(userId, year);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/category-breakdown")
    @Operation(summary = "Get category breakdown", description = "Returns spending breakdown by category")
    public ResponseEntity<ApiResponse<List<CategorySpendingDTO>>> getCategoryBreakdown(
            @AuthenticationPrincipal UUID userId,
            @RequestParam(defaultValue = "monthly") BudgetPeriod period) {
        List<CategorySpendingDTO> breakdown = dashboardService.getCategoryBreakdown(userId, period);
        return ResponseEntity.ok(ApiResponse.success(breakdown));
    }
}
