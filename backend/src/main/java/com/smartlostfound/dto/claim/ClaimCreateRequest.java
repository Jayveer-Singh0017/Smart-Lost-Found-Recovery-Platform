package com.smartlostfound.dto.claim;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ClaimCreateRequest {

    @NotNull(message = "Item Report ID is required")
    private Long itemReportId;

    @NotBlank(message = "Proof of ownership description is required")
    @Size(min = 10, message = "Proof description must be at least 10 characters long")
    private String proofDescription;

    private String secretIdentifiers;

    @Size(max = 30, message = "Contact phone cannot exceed 30 characters")
    private String contactPhone;

    public ClaimCreateRequest() {
    }

    public ClaimCreateRequest(Long itemReportId, String proofDescription, String secretIdentifiers, String contactPhone) {
        this.itemReportId = itemReportId;
        this.proofDescription = proofDescription;
        this.secretIdentifiers = secretIdentifiers;
        this.contactPhone = contactPhone;
    }

    public Long getItemReportId() {
        return itemReportId;
    }

    public void setItemReportId(Long itemReportId) {
        this.itemReportId = itemReportId;
    }

    public String getProofDescription() {
        return proofDescription;
    }

    public void setProofDescription(String proofDescription) {
        this.proofDescription = proofDescription;
    }

    public String getSecretIdentifiers() {
        return secretIdentifiers;
    }

    public void setSecretIdentifiers(String secretIdentifiers) {
        this.secretIdentifiers = secretIdentifiers;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }
}
