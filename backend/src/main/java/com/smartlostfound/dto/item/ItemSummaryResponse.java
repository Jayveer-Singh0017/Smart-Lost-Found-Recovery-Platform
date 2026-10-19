package com.smartlostfound.dto.item;

import com.smartlostfound.entity.ItemStatus;
import com.smartlostfound.entity.ItemType;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ItemSummaryResponse {
    private Long id;
    private String title;
    private ItemType type;
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private String city;
    private String locationAddress;
    private LocalDate incidentDate;
    private ItemStatus status;
    private String primaryImageUrl;
    private LocalDateTime createdAt;

    public ItemSummaryResponse() {
    }

    public ItemSummaryResponse(Long id, String title, ItemType type, Long categoryId, String categoryName,
                               String categoryIcon, String city, String locationAddress, LocalDate incidentDate,
                               ItemStatus status, String primaryImageUrl, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.type = type;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.categoryIcon = categoryIcon;
        this.city = city;
        this.locationAddress = locationAddress;
        this.incidentDate = incidentDate;
        this.status = status;
        this.primaryImageUrl = primaryImageUrl;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public ItemType getType() {
        return type;
    }

    public void setType(ItemType type) {
        this.type = type;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getCategoryIcon() {
        return categoryIcon;
    }

    public void setCategoryIcon(String categoryIcon) {
        this.categoryIcon = categoryIcon;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getLocationAddress() {
        return locationAddress;
    }

    public void setLocationAddress(String locationAddress) {
        this.locationAddress = locationAddress;
    }

    public LocalDate getIncidentDate() {
        return incidentDate;
    }

    public void setIncidentDate(LocalDate incidentDate) {
        this.incidentDate = incidentDate;
    }

    public ItemStatus getStatus() {
        return status;
    }

    public void setStatus(ItemStatus status) {
        this.status = status;
    }

    public String getPrimaryImageUrl() {
        return primaryImageUrl;
    }

    public void setPrimaryImageUrl(String primaryImageUrl) {
        this.primaryImageUrl = primaryImageUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
