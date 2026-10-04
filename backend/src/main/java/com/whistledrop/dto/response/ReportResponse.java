package com.whistledrop.dto.response;

import com.whistledrop.entity.ReportCategory;
import com.whistledrop.entity.ReportStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Schema(description = "Detailed report information response (public tracking and moderator detail)")
public class ReportResponse {

    @Schema(description = "Cryptographically secure public case tracking code", example = "WD-K7M4P9X2")
    private String caseCode;

    @Schema(description = "Category of concern", example = "TECHNICAL")
    private ReportCategory category;

    @Schema(description = "Detailed concern explanation", example = "Observed sensitive credentials committed to a public repository branch.")
    private String description;

    @Schema(description = "Optional reference URL provided by reporter", example = "https://github.com/example/repo/commit/123")
    private String evidenceUrl;

    @Schema(description = "Current lifecycle status of the report", example = "SUBMITTED")
    private ReportStatus status;

    @Schema(description = "Timestamp when report was submitted", example = "2026-10-04T18:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "Timestamp when report was last modified/status updated", example = "2026-10-04T18:00:00")
    private LocalDateTime updatedAt;

    @Schema(description = "Chronological history of status updates and moderator notes")
    private List<StatusUpdateResponse> statusHistory = new ArrayList<>();

    public ReportResponse() {
    }

    public ReportResponse(String caseCode, ReportCategory category, String description, String evidenceUrl, ReportStatus status, LocalDateTime createdAt, LocalDateTime updatedAt, List<StatusUpdateResponse> statusHistory) {
        this.caseCode = caseCode;
        this.category = category;
        this.description = description;
        this.evidenceUrl = evidenceUrl;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.statusHistory = statusHistory != null ? statusHistory : new ArrayList<>();
    }

    public String getCaseCode() {
        return caseCode;
    }

    public void setCaseCode(String caseCode) {
        this.caseCode = caseCode;
    }

    public ReportCategory getCategory() {
        return category;
    }

    public void setCategory(ReportCategory category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getEvidenceUrl() {
        return evidenceUrl;
    }

    public void setEvidenceUrl(String evidenceUrl) {
        this.evidenceUrl = evidenceUrl;
    }

    public ReportStatus getStatus() {
        return status;
    }

    public void setStatus(ReportStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<StatusUpdateResponse> getStatusHistory() {
        return statusHistory;
    }

    public void setStatusHistory(List<StatusUpdateResponse> statusHistory) {
        this.statusHistory = statusHistory;
    }
}
