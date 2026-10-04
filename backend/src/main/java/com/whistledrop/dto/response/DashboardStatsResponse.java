package com.whistledrop.dto.response;

import com.whistledrop.entity.ReportCategory;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Schema(description = "Aggregated dashboard statistics calculated from database")
public class DashboardStatsResponse {

    @Schema(description = "Total number of reports across all statuses", example = "42")
    private long totalReports;

    @Schema(description = "Count of reports in SUBMITTED status", example = "12")
    private long submittedCount;

    @Schema(description = "Count of reports currently UNDER_REVIEW", example = "15")
    private long underReviewCount;

    @Schema(description = "Count of RESOLVED reports", example = "10")
    private long resolvedCount;

    @Schema(description = "Count of DISMISSED reports", example = "5")
    private long dismissedCount;

    @Schema(description = "Breakdown of reports by category")
    private Map<ReportCategory, Long> categoryBreakdown = new HashMap<>();

    @Schema(description = "Recent report submissions for quick overview")
    private List<ReportSummaryResponse> recentReports;

    public DashboardStatsResponse() {
    }

    public DashboardStatsResponse(long totalReports, long submittedCount, long underReviewCount, long resolvedCount, long dismissedCount, Map<ReportCategory, Long> categoryBreakdown, List<ReportSummaryResponse> recentReports) {
        this.totalReports = totalReports;
        this.submittedCount = submittedCount;
        this.underReviewCount = underReviewCount;
        this.resolvedCount = resolvedCount;
        this.dismissedCount = dismissedCount;
        this.categoryBreakdown = categoryBreakdown;
        this.recentReports = recentReports;
    }

    public long getTotalReports() {
        return totalReports;
    }

    public void setTotalReports(long totalReports) {
        this.totalReports = totalReports;
    }

    public long getSubmittedCount() {
        return submittedCount;
    }

    public void setSubmittedCount(long submittedCount) {
        this.submittedCount = submittedCount;
    }

    public long getUnderReviewCount() {
        return underReviewCount;
    }

    public void setUnderReviewCount(long underReviewCount) {
        this.underReviewCount = underReviewCount;
    }

    public long getResolvedCount() {
        return resolvedCount;
    }

    public void setResolvedCount(long resolvedCount) {
        this.resolvedCount = resolvedCount;
    }

    public long getDismissedCount() {
        return dismissedCount;
    }

    public void setDismissedCount(long dismissedCount) {
        this.dismissedCount = dismissedCount;
    }

    public Map<ReportCategory, Long> getCategoryBreakdown() {
        return categoryBreakdown;
    }

    public void setCategoryBreakdown(Map<ReportCategory, Long> categoryBreakdown) {
        this.categoryBreakdown = categoryBreakdown;
    }

    public List<ReportSummaryResponse> getRecentReports() {
        return recentReports;
    }

    public void setRecentReports(List<ReportSummaryResponse> recentReports) {
        this.recentReports = recentReports;
    }
}
