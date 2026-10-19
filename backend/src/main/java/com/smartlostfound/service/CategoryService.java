package com.smartlostfound.service;

import com.smartlostfound.dto.category.CategoryCreateRequest;
import com.smartlostfound.dto.category.CategoryDto;
import com.smartlostfound.entity.Category;
import com.smartlostfound.exception.BadRequestException;
import com.smartlostfound.exception.ResourceNotFoundException;
import com.smartlostfound.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getAllActiveCategories() {
        return categoryRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategoriesAdmin() {
        return categoryRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public Category getCategoryEntity(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }

    @Transactional
    public CategoryDto createCategory(CategoryCreateRequest request) {
        if (categoryRepository.existsByName(request.getName().trim())) {
            throw new BadRequestException("Category with this name already exists");
        }

        Category category = new Category(
                request.getName().trim(),
                request.getDescription(),
                request.getIcon() != null ? request.getIcon().trim() : "Package"
        );
        Category saved = categoryRepository.save(category);
        return mapToDto(saved);
    }

    @Transactional
    public CategoryDto updateCategory(Long id, CategoryCreateRequest request) {
        Category category = getCategoryEntity(id);

        if (!category.getName().equalsIgnoreCase(request.getName().trim()) &&
                categoryRepository.existsByName(request.getName().trim())) {
            throw new BadRequestException("Another category with this name already exists");
        }

        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        if (request.getIcon() != null) {
            category.setIcon(request.getIcon().trim());
        }

        Category updated = categoryRepository.save(category);
        return mapToDto(updated);
    }

    @Transactional
    public void toggleCategoryStatus(Long id) {
        Category category = getCategoryEntity(id);
        category.setActive(!category.isActive());
        categoryRepository.save(category);
    }

    public CategoryDto mapToDto(Category entity) {
        return new CategoryDto(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getIcon(),
                entity.isActive()
        );
    }
}
