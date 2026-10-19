package com.smartlostfound.dto.item;

import com.smartlostfound.entity.ItemStatus;
import com.smartlostfound.entity.ItemType;
import com.smartlostfound.entity.ModerationStatus;
import java.time.LocalDate;

public class ItemSearchCriteria {
    private String keyword;
    private ItemType type;
    private Long categoryId;
    private String city;
    private ItemStatus status;
    private ModerationStatus moderationStatus;
    private LocalDate startDate;
    private LocalDate endDate;

    public ItemSearchCriteria() {
    }

    public String getKeyword() {
        return keyword;
    }

    public void setKeyword(String keyword) {
        this.keyword = keyword;
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

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public ItemStatus getStatus() {
        return status;
    }

    public void setStatus(ItemStatus status) {
        this.status = status;
    }

    public ModerationStatus getModerationStatus() {
        return moderationStatus;
    }

    public void setModerationStatus(ModerationStatus moderationStatus) {
        this.moderationStatus = moderationStatus;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
}
