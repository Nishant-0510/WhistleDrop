package com.whistledrop.dto.response;

import com.whistledrop.entity.ReportCategory;
import com.whistledrop.entity.ReportStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Summary representation of a report for list and dashboard views")
public class ReportSummaryResponse {

    @Schema(description = "Secure case identifier", example = "WD-K7M4P9X2")
    private String caseCode;

    @Schema(description = "Category of concern", example = "TECHNICAL")
    private ReportCategory category;

    @Schema(description = "Current lifecycle status", example = "SUBMITTED")
    private ReportStatus status;

    @Schema(description = "Timestamp when report was created", example = "2026-10-04T18:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "Timestamp when report was last updated", example = "2026-10-04T18:00:00")
    private LocalDateTime updatedAt;

    @Schema(description = "Short preview of the description text", example = "Observed sensitive credentials committed...")
    private String descriptionSnippet;

    public ReportSummaryResponse() {
    }

    public ReportSummaryResponse(String caseCode, ReportCategory category, ReportStatus status, LocalDateTime createdAt, LocalDateTime updatedAt, String descriptionSnippet) {
        this.caseCode = caseCode;
        this.category = category;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.descriptionSnippet = descriptionSnippet;
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

    public String getDescriptionSnippet() {
        return descriptionSnippet;
    }

    public void setDescriptionSnippet(String descriptionSnippet) {
        this.descriptionSnippet = descriptionSnippet;
    }
}
