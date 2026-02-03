package com.houseexpenses.controller;

import com.houseexpenses.dto.*;
import com.houseexpenses.service.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/budgets")
@RequiredArgsConstructor
@Tag(name = "Budgets", description = "Budget management endpoints")
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    @Operation(summary = "List budgets", description = "Returns all budgets for the user")
    public ResponseEntity<ApiResponse<List<BudgetDTO>>> getBudgets(
            @AuthenticationPrincipal UUID userId) {
        List<BudgetDTO> budgets = budgetService.getAllBudgets(userId);
        return ResponseEntity.ok(ApiResponse.success(budgets));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get budget", description = "Returns a single budget by ID")
    public ResponseEntity<ApiResponse<BudgetDTO>> getBudget(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id) {
        BudgetDTO budget = budgetService.getBudget(userId, id);
        return ResponseEntity.ok(ApiResponse.success(budget));
    }

    @PostMapping
    @Operation(summary = "Create budget", description = "Creates a new budget")
    public ResponseEntity<ApiResponse<BudgetDTO>> createBudget(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody CreateBudgetDTO dto) {
        BudgetDTO budget = budgetService.createBudget(userId, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(budget, "Budget created successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update budget", description = "Updates an existing budget")
    public ResponseEntity<ApiResponse<BudgetDTO>> updateBudget(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id,
            @Valid @RequestBody CreateBudgetDTO dto) {
        BudgetDTO budget = budgetService.updateBudget(userId, id, dto);
        return ResponseEntity.ok(ApiResponse.success(budget, "Budget updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete budget", description = "Deletes a budget")
    public ResponseEntity<ApiResponse<Void>> deleteBudget(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id) {
        budgetService.deleteBudget(userId, id);
        return ResponseEntity.ok(ApiResponse.success(null, "Budget deleted successfully"));
    }

    @GetMapping("/{id}/status")
    @Operation(summary = "Get budget status", description = "Returns current spending status for a budget")
    public ResponseEntity<ApiResponse<BudgetStatusDTO>> getBudgetStatus(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id) {
        BudgetStatusDTO status = budgetService.getBudgetStatus(userId, id);
        return ResponseEntity.ok(ApiResponse.success(status));
    }

    @GetMapping("/status")
    @Operation(summary = "Get all budget statuses", description = "Returns current spending status for all budgets")
    public ResponseEntity<ApiResponse<List<BudgetStatusDTO>>> getAllBudgetStatuses(
            @AuthenticationPrincipal UUID userId) {
        List<BudgetStatusDTO> statuses = budgetService.getAllBudgetStatuses(userId);
        return ResponseEntity.ok(ApiResponse.success(statuses));
    }
}
