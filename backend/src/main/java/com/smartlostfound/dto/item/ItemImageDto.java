package com.smartlostfound.dto.item;

public class ItemImageDto {
    private Long id;
    private String imageUrl;
    private String originalFileName;
    private Long fileSizeBytes;

    public ItemImageDto() {
    }

    public ItemImageDto(Long id, String imageUrl, String originalFileName, Long fileSizeBytes) {
        this.id = id;
        this.imageUrl = imageUrl;
        this.originalFileName = originalFileName;
        this.fileSizeBytes = fileSizeBytes;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Long getFileSizeBytes() {
        return fileSizeBytes;
    }

    public void setFileSizeBytes(Long fileSizeBytes) {
        this.fileSizeBytes = fileSizeBytes;
    }
}
