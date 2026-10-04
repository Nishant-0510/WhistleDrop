package com.whistledrop.controller;

import com.whistledrop.dto.request.StatusUpdateRequest;
import com.whistledrop.dto.response.ApiResponse;
import com.whistledrop.dto.response.DashboardStatsResponse;
import com.whistledrop.dto.response.PageResponse;
import com.whistledrop.dto.response.ReportResponse;
import com.whistledrop.dto.response.ReportSummaryResponse;
import com.whistledrop.entity.ReportCategory;
import com.whistledrop.entity.ReportStatus;
import com.whistledrop.service.ModeratorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/moderator")
@PreAuthorize("hasRole('MODERATOR')")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Moderator Management API", description = "Protected moderator endpoints for review, filtering, and status updates")
public class ModeratorReportController {

    private final ModeratorService moderatorService;

    public ModeratorReportController(ModeratorService moderatorService) {
        this.moderatorService = moderatorService;
    }

    @GetMapping("/reports")
    @Operation(summary = "Get paginated and filtered reports", description = "Retrieve list of submitted reports with category, status, and search filters")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Reports retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized - Missing or invalid JWT"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - Insufficient permissions")
    })
    public ResponseEntity<ApiResponse<PageResponse<ReportSummaryResponse>>> getReports(
            @Parameter(description = "Filter by report category") @RequestParam(required = false) ReportCategory category,
            @Parameter(description = "Filter by report status") @RequestParam(required = false) ReportStatus status,
            @Parameter(description = "Search query for case code or description") @RequestParam(required = false) String search,
            @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort property") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, Math.min(size, 100)), sort);

        PageResponse<ReportSummaryResponse> reports = moderatorService.getReports(category, status, search, pageable);
        return ResponseEntity.ok(ApiResponse.success("Reports retrieved successfully", reports));
    }

    @GetMapping("/reports/{caseCode}")
    @Operation(summary = "Get full report details", description = "Retrieve full concern description, evidence URL, and complete status update history for a report")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Report details retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Report not found with given case code")
    })
    public ResponseEntity<ApiResponse<ReportResponse>> getReportDetails(@PathVariable String caseCode) {
        ReportResponse report = moderatorService.getReportDetails(caseCode);
        return ResponseEntity.ok(ApiResponse.success("Report details retrieved successfully", report));
    }

    @PatchMapping("/reports/{caseCode}/status")
    @Operation(summary = "Update report status", description = "Transition report status (UNDER_REVIEW, RESOLVED, DISMISSED) and log an explanatory status message")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Status updated successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid status transition or validation error"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Report not found")
    })
    public ResponseEntity<ApiResponse<ReportResponse>> updateReportStatus(
            @PathVariable String caseCode,
            @Valid @RequestBody StatusUpdateRequest request) {
        ReportResponse updatedReport = moderatorService.updateReportStatus(caseCode, request);
        return ResponseEntity.ok(ApiResponse.success("Report status updated successfully", updatedReport));
    }

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get dashboard analytics", description = "Retrieve aggregate statistics including status counts, category breakdown, and recent submissions")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Dashboard stats retrieved successfully")
    })
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        DashboardStatsResponse stats = moderatorService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Dashboard statistics retrieved successfully", stats));
    }
}
