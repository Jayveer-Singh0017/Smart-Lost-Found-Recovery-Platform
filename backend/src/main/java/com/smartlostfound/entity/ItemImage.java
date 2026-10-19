package com.smartlostfound.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "item_images")
public class ItemImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_report_id", nullable = false)
    private ItemReport itemReport;

    @Column(name = "image_url", nullable = false, length = 255)
    private String imageUrl;

    @Column(name = "original_file_name", nullable = false, length = 255)
    private String originalFileName;

    @Column(name = "storage_file_name", nullable = false, length = 255)
    private String storageFileName;

    @Column(name = "file_size_bytes", nullable = false)
    private Long fileSizeBytes;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public ItemImage() {
    }

    public ItemImage(String imageUrl, String originalFileName, String storageFileName, Long fileSizeBytes, String contentType) {
        this.imageUrl = imageUrl;
        this.originalFileName = originalFileName;
        this.storageFileName = storageFileName;
        this.fileSizeBytes = fileSizeBytes;
        this.contentType = contentType;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ItemReport getItemReport() {
        return itemReport;
    }

    public void setItemReport(ItemReport itemReport) {
        this.itemReport = itemReport;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public String getStorageFileName() {
        return storageFileName;
    }

    public void setStorageFileName(String storageFileName) {
        this.storageFileName = storageFileName;
    }

    public Long getFileSizeBytes() {
        return fileSizeBytes;
    }

    public void setFileSizeBytes(Long fileSizeBytes) {
        this.fileSizeBytes = fileSizeBytes;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
