package com.houseexpenses.controller;

import com.houseexpenses.dto.*;
import com.houseexpenses.model.Category.ExpenseType;
import com.houseexpenses.service.CategoryService;
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
@RequestMapping("/v1/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Category management endpoints")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "List categories", description = "Returns all categories for the user")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getCategories(
            @AuthenticationPrincipal UUID userId,
            @RequestParam(required = false) ExpenseType type) {
        List<CategoryDTO> categories;
        if (type != null) {
            categories = categoryService.getCategoriesByType(userId, type);
        } else {
            categories = categoryService.getAllCategories(userId);
        }
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category", description = "Returns a single category with its subcategories")
    public ResponseEntity<ApiResponse<CategoryDTO>> getCategory(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id) {
        CategoryDTO category = categoryService.getCategory(userId, id);
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    @PostMapping
    @Operation(summary = "Create category", description = "Creates a new category")
    public ResponseEntity<ApiResponse<CategoryDTO>> createCategory(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody CreateCategoryDTO dto) {
        CategoryDTO category = categoryService.createCategory(userId, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(category, "Category created successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update category", description = "Updates an existing category")
    public ResponseEntity<ApiResponse<CategoryDTO>> updateCategory(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id,
            @Valid @RequestBody CreateCategoryDTO dto) {
        CategoryDTO category = categoryService.updateCategory(userId, id, dto);
        return ResponseEntity.ok(ApiResponse.success(category, "Category updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete category", description = "Soft deletes a category")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id) {
        categoryService.deleteCategory(userId, id);
        return ResponseEntity.ok(ApiResponse.success(null, "Category deleted successfully"));
    }

    @PostMapping("/{id}/subcategories")
    @Operation(summary = "Create subcategory", description = "Creates a new subcategory under a category")
    public ResponseEntity<ApiResponse<SubCategoryDTO>> createSubCategory(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id,
            @Valid @RequestBody CreateSubCategoryDTO dto) {
        SubCategoryDTO subCategory = categoryService.createSubCategory(userId, id, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(subCategory, "Subcategory created successfully"));
    }

    @PutMapping("/subcategories/{id}")
    @Operation(summary = "Update subcategory", description = "Updates an existing subcategory")
    public ResponseEntity<ApiResponse<SubCategoryDTO>> updateSubCategory(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id,
            @Valid @RequestBody CreateSubCategoryDTO dto) {
        SubCategoryDTO subCategory = categoryService.updateSubCategory(userId, id, dto);
        return ResponseEntity.ok(ApiResponse.success(subCategory, "Subcategory updated successfully"));
    }

    @DeleteMapping("/subcategories/{id}")
    @Operation(summary = "Delete subcategory", description = "Soft deletes a subcategory")
    public ResponseEntity<ApiResponse<Void>> deleteSubCategory(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id) {
        categoryService.deleteSubCategory(userId, id);
        return ResponseEntity.ok(ApiResponse.success(null, "Subcategory deleted successfully"));
    }

    @PutMapping("/{id}/reorder")
    @Operation(summary = "Reorder category", description = "Updates the display order of a category")
    public ResponseEntity<ApiResponse<CategoryDTO>> reorderCategory(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id,
            @RequestBody java.util.Map<String, Integer> body) {
        Integer newOrder = body.get("displayOrder");
        if (newOrder == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("VALIDATION_ERROR", "displayOrder is required"));
        }
        CategoryDTO category = categoryService.reorderCategory(userId, id, newOrder);
        return ResponseEntity.ok(ApiResponse.success(category, "Category reordered successfully"));
    }
}
