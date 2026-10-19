package com.smartlostfound.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CategoryCreateRequest {

    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 80, message = "Category name must be between 2 and 80 characters")
    private String name;

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    private String description;

    @Size(max = 50, message = "Icon name cannot exceed 50 characters")
    private String icon;

    public CategoryCreateRequest() {
    }

    public CategoryCreateRequest(String name, String description, String icon) {
        this.name = name;
        this.description = description;
        this.icon = icon;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }
}
