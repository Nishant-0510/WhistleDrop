package com.whistledrop.dto.request;

import com.whistledrop.entity.ReportStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "Request body for moderator status update")
public class StatusUpdateRequest {

    @Schema(description = "Target status for the report", example = "UNDER_REVIEW", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Target status is required (UNDER_REVIEW, RESOLVED, DISMISSED)")
    private ReportStatus status;

    @Schema(description = "Status explanation message visible to the reporter", example = "The security team is actively investigating this report.", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Status update message cannot be empty")
    @Size(min = 3, max = 1000, message = "Status message must be between 3 and 1000 characters")
    private String message;

    public StatusUpdateRequest() {
    }

    public StatusUpdateRequest(ReportStatus status, String message) {
        this.status = status;
        this.message = message;
    }

    public ReportStatus getStatus() {
        return status;
    }

    public void setStatus(ReportStatus status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
