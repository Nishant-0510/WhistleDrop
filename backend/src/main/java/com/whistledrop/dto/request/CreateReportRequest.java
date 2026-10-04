package com.whistledrop.dto.request;

import com.whistledrop.entity.ReportCategory;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Request body for submitting an anonymous report")
public class CreateReportRequest {

    @Schema(description = "Category of concern", example = "TECHNICAL", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Category is required and must be one of: SECURITY, HARASSMENT, CORRUPTION, TECHNICAL, OTHER")
    private ReportCategory category;

    @Schema(description = "Detailed description of the concern", example = "Observed sensitive credentials committed to a public repository branch.", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Description cannot be empty")
    @Size(min = 10, max = 5000, message = "Description must be between 10 and 5000 characters")
    private String description;

    @Schema(description = "Optional reference URL for supporting evidence", example = "https://github.com/example/repo/commit/123", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @Pattern(regexp = "^(https?://.+)?$", message = "Evidence URL must be a valid HTTP or HTTPS URL if provided")
    private String evidenceUrl;

    public CreateReportRequest() {
    }

    public CreateReportRequest(ReportCategory category, String description, String evidenceUrl) {
        this.category = category;
        this.description = description;
        this.evidenceUrl = evidenceUrl;
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
}
