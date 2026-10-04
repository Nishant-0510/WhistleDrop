package com.whistledrop.dto.response;

import com.whistledrop.entity.ReportStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Status update entry representation")
public class StatusUpdateResponse {

    @Schema(description = "Update identifier", example = "1")
    private Long id;

    @Schema(description = "Report status at this update", example = "SUBMITTED")
    private ReportStatus status;

    @Schema(description = "Status description message", example = "Report received and queued for triage.")
    private String message;

    @Schema(description = "Timestamp when this status was recorded", example = "2026-10-04T18:00:00")
    private LocalDateTime createdAt;

    public StatusUpdateResponse() {
    }

    public StatusUpdateResponse(Long id, ReportStatus status, String message, LocalDateTime createdAt) {
        this.id = id;
        this.status = status;
        this.message = message;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
