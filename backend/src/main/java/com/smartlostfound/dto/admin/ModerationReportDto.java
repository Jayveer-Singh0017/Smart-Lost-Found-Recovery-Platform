package com.smartlostfound.dto.admin;

import com.smartlostfound.entity.ItemType;
import com.smartlostfound.entity.ModerationReportStatus;
import java.time.LocalDateTime;

public class ModerationReportDto {
    private Long id;
    private Long itemReportId;
    private String itemTitle;
    private ItemType itemType;
    private Long reporterId;
    private String reporterName;
    private String reason;
    private String details;
    private ModerationReportStatus status;
    private LocalDateTime createdAt;

    public ModerationReportDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getItemReportId() {
        return itemReportId;
    }

    public void setItemReportId(Long itemReportId) {
        this.itemReportId = itemReportId;
    }

    public String getItemTitle() {
        return itemTitle;
    }

    public void setItemTitle(String itemTitle) {
        this.itemTitle = itemTitle;
    }

    public ItemType getItemType() {
        return itemType;
    }

    public void setItemType(ItemType itemType) {
        this.itemType = itemType;
    }

    public Long getReporterId() {
        return reporterId;
    }

    public void setReporterId(Long reporterId) {
        this.reporterId = reporterId;
    }

    public String getReporterName() {
        return reporterName;
    }

    public void setReporterName(String reporterName) {
        this.reporterName = reporterName;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public ModerationReportStatus getStatus() {
        return status;
    }

    public void setStatus(ModerationReportStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
