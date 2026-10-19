package com.smartlostfound.dto.claim;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ClaimReviewRequest {

    @NotNull(message = "Review decision (approved true/false) is required")
    private Boolean approved;

    @Size(max = 1000, message = "Reviewer notes cannot exceed 1000 characters")
    private String reviewerNotes;

    public ClaimReviewRequest() {
    }

    public ClaimReviewRequest(Boolean approved, String reviewerNotes) {
        this.approved = approved;
        this.reviewerNotes = reviewerNotes;
    }

    public Boolean getApproved() {
        return approved;
    }

    public void setApproved(Boolean approved) {
        this.approved = approved;
    }

    public String getReviewerNotes() {
        return reviewerNotes;
    }

    public void setReviewerNotes(String reviewerNotes) {
        this.reviewerNotes = reviewerNotes;
    }
}
