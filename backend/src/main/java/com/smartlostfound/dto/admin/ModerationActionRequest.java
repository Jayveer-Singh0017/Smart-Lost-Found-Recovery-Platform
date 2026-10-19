package com.smartlostfound.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ModerationActionRequest {

    @NotBlank(message = "Action is required")
    @Pattern(regexp = "APPROVE_ITEM|REJECT_ITEM|DISMISS_REPORT",
             message = "Action must be APPROVE_ITEM, REJECT_ITEM, or DISMISS_REPORT")
    private String action;

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;

    public ModerationActionRequest() {
    }

    public ModerationActionRequest(String action, String notes) {
        this.action = action;
        this.notes = notes;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
