package com.whistledrop.controller;

import com.whistledrop.dto.request.CreateReportRequest;
import com.whistledrop.dto.response.ApiResponse;
import com.whistledrop.dto.response.ReportResponse;
import com.whistledrop.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Public Reports API", description = "Public anonymous report submission and case code tracking")
public class PublicReportController {

    private final ReportService reportService;

    public PublicReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping
    @Operation(summary = "Submit an anonymous report", description = "Submit a confidential concern without creating an account or providing identifying data. Returns a unique tracking case code.")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Report submitted successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error on input fields")
    })
    public ResponseEntity<ApiResponse<ReportResponse>> submitReport(@Valid @RequestBody CreateReportRequest request) {
        ReportResponse report = reportService.submitReport(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Report submitted successfully. Please save your case code to track updates.", report));
    }

    @GetMapping("/{caseCode}")
    @Operation(summary = "Track a report by case code", description = "Retrieve report status, timestamps, and moderator updates using the secure case code.")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Report retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Report not found with given case code")
    })
    public ResponseEntity<ApiResponse<ReportResponse>> getReportByCaseCode(@PathVariable String caseCode) {
        ReportResponse report = reportService.getReportByCaseCode(caseCode);
        return ResponseEntity.ok(ApiResponse.success("Report retrieved successfully", report));
    }
}
