package com.houseexpenses.controller;

import com.houseexpenses.dto.*;
import com.houseexpenses.service.ExpenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/expenses")
@RequiredArgsConstructor
@Tag(name = "Expenses", description = "Expense management endpoints")
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    @Operation(summary = "List expenses", description = "Returns a paginated list of expenses with optional filters")
    public ResponseEntity<ApiResponse<List<ExpenseDTO>>> getExpenses(
            @AuthenticationPrincipal UUID userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) UUID subCategoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "expenseDate,desc") String sort) {

        String[] sortParams = sort.split(",");
        Sort sortObj = Sort.by(sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc") ?
                Sort.Direction.ASC : Sort.Direction.DESC, sortParams[0]);

        Page<ExpenseDTO> expenses = expenseService.getExpenses(
                userId, startDate, endDate, categoryId, subCategoryId,
                PageRequest.of(page, size, sortObj));

        ApiResponse.PaginationInfo pagination = ApiResponse.PaginationInfo.builder()
                .page(expenses.getNumber())
                .size(expenses.getSize())
                .totalElements(expenses.getTotalElements())
                .totalPages(expenses.getTotalPages())
                .hasNext(expenses.hasNext())
                .hasPrevious(expenses.hasPrevious())
                .build();

        return ResponseEntity.ok(ApiResponse.success(expenses.getContent(), pagination));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get expense", description = "Returns a single expense by ID")
    public ResponseEntity<ApiResponse<ExpenseDTO>> getExpense(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id) {
        ExpenseDTO expense = expenseService.getExpense(userId, id);
        return ResponseEntity.ok(ApiResponse.success(expense));
    }

    @PostMapping
    @Operation(summary = "Create expense", description = "Creates a new expense")
    public ResponseEntity<ApiResponse<ExpenseDTO>> createExpense(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody CreateExpenseDTO dto) {
        ExpenseDTO expense = expenseService.createExpense(userId, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(expense, "Expense created successfully"));
    }

    @PostMapping("/bulk")
    @Operation(summary = "Create bulk expenses", description = "Creates multiple expenses at once")
    public ResponseEntity<ApiResponse<List<ExpenseDTO>>> createBulkExpenses(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody List<CreateExpenseDTO> dtos) {
        List<ExpenseDTO> expenses = expenseService.createBulkExpenses(userId, dtos);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(expenses, "Expenses created successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update expense", description = "Updates an existing expense")
    public ResponseEntity<ApiResponse<ExpenseDTO>> updateExpense(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id,
            @Valid @RequestBody CreateExpenseDTO dto) {
        ExpenseDTO expense = expenseService.updateExpense(userId, id, dto);
        return ResponseEntity.ok(ApiResponse.success(expense, "Expense updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete expense", description = "Deletes an expense")
    public ResponseEntity<ApiResponse<Void>> deleteExpense(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id) {
        expenseService.deleteExpense(userId, id);
        return ResponseEntity.ok(ApiResponse.success(null, "Expense deleted successfully"));
    }
}
