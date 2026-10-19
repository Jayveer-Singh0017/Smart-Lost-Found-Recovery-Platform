package com.smartlostfound.controller;

import com.smartlostfound.dto.category.CategoryCreateRequest;
import com.smartlostfound.dto.category.CategoryDto;
import com.smartlostfound.dto.common.ApiResponse;
import com.smartlostfound.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@Tag(name = "Categories", description = "Endpoints for item categories and taxonomy management")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    @Operation(summary = "Get all active categories for item classification")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getActiveCategories() {
        List<CategoryDto> categories = categoryService.getAllActiveCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/all")
    @Operation(summary = "Get all categories including inactive (admin only)")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getAllCategoriesAdmin() {
        List<CategoryDto> categories = categoryService.getAllCategoriesAdmin();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @PostMapping
    @Operation(summary = "Create a new category (admin only)")
    public ResponseEntity<ApiResponse<CategoryDto>> createCategory(@Valid @RequestBody CategoryCreateRequest request) {
        CategoryDto category = categoryService.createCategory(request);
        return new ResponseEntity<>(ApiResponse.success("Category created successfully", category), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing category (admin only)")
    public ResponseEntity<ApiResponse<CategoryDto>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryCreateRequest request) {
        CategoryDto category = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", category));
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Toggle category active status (admin only)")
    public ResponseEntity<ApiResponse<Void>> toggleCategoryStatus(@PathVariable Long id) {
        categoryService.toggleCategoryStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Category status updated", null));
    }
}
