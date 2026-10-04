package com.whistledrop.service;

import com.whistledrop.dto.request.StatusUpdateRequest;
import com.whistledrop.dto.response.DashboardStatsResponse;
import com.whistledrop.dto.response.PageResponse;
import com.whistledrop.dto.response.ReportResponse;
import com.whistledrop.dto.response.ReportSummaryResponse;
import com.whistledrop.entity.Report;
import com.whistledrop.entity.ReportCategory;
import com.whistledrop.entity.ReportStatus;
import com.whistledrop.exception.InvalidStatusTransitionException;
import com.whistledrop.repository.ReportRepository;
import com.whistledrop.repository.StatusUpdateRepository;
import com.whistledrop.util.CaseCodeGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ModeratorServiceTest {

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private StatusUpdateRepository statusUpdateRepository;

    @Mock
    private CaseCodeGenerator caseCodeGenerator;

    private ReportService reportService;
    private ModeratorService moderatorService;
    private Report testReport;

    @BeforeEach
    void setUp() {
        reportService = new ReportService(reportRepository, statusUpdateRepository, caseCodeGenerator);
        moderatorService = new ModeratorService(reportRepository, statusUpdateRepository, reportService);

        testReport = new Report(
                "WD-K7M4P9X2",
                ReportCategory.CORRUPTION,
                "Vendor selection bribery allegations in department.",
                null,
                ReportStatus.SUBMITTED
        );
        testReport.setId(1L);
        testReport.setCreatedAt(LocalDateTime.now());
        testReport.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Should retrieve paginated and filtered reports")
    void getReports_Filtered() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Report> reportPage = new PageImpl<>(Collections.singletonList(testReport), pageable, 1);

        when(reportRepository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(reportPage);

        PageResponse<ReportSummaryResponse> response = moderatorService.getReports(
                ReportCategory.CORRUPTION, ReportStatus.SUBMITTED, null, pageable);

        assertNotNull(response);
        assertEquals(1, response.getTotalElements());
        assertEquals(1, response.getContent().size());
        assertEquals("WD-K7M4P9X2", response.getContent().get(0).getCaseCode());
        assertEquals(ReportCategory.CORRUPTION, response.getContent().get(0).getCategory());
        assertEquals(ReportStatus.SUBMITTED, response.getContent().get(0).getStatus());
    }

    @Test
    @DisplayName("Should successfully transition status from SUBMITTED to UNDER_REVIEW")
    void updateReportStatus_ValidTransition() {
        String caseCode = "WD-K7M4P9X2";
        StatusUpdateRequest request = new StatusUpdateRequest(
                ReportStatus.UNDER_REVIEW,
                "Investigation initiated by integrity board."
        );

        when(reportRepository.findByCaseCode(caseCode)).thenReturn(Optional.of(testReport));
        when(reportRepository.save(any(Report.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReportResponse response = moderatorService.updateReportStatus(caseCode, request);

        assertNotNull(response);
        assertEquals(ReportStatus.UNDER_REVIEW, response.getStatus());
        assertEquals(1, response.getStatusHistory().size());
        assertEquals("Investigation initiated by integrity board.", response.getStatusHistory().get(0).getMessage());

        verify(reportRepository, times(1)).save(testReport);
    }

    @Test
    @DisplayName("Should reject invalid direct status transition from SUBMITTED to RESOLVED")
    void updateReportStatus_InvalidTransition() {
        String caseCode = "WD-K7M4P9X2";
        StatusUpdateRequest request = new StatusUpdateRequest(
                ReportStatus.RESOLVED,
                "Premature transition"
        );

        when(reportRepository.findByCaseCode(caseCode)).thenReturn(Optional.of(testReport));

        assertThrows(InvalidStatusTransitionException.class, () -> {
            moderatorService.updateReportStatus(caseCode, request);
        });

        verify(reportRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should return aggregate dashboard metrics from database")
    void getDashboardStats_Aggregates() {
        when(reportRepository.count()).thenReturn(10L);
        when(reportRepository.countByStatus(ReportStatus.SUBMITTED)).thenReturn(4L);
        when(reportRepository.countByStatus(ReportStatus.UNDER_REVIEW)).thenReturn(3L);
        when(reportRepository.countByStatus(ReportStatus.RESOLVED)).thenReturn(2L);
        when(reportRepository.countByStatus(ReportStatus.DISMISSED)).thenReturn(1L);
        when(reportRepository.findTop5ByOrderByCreatedAtDesc()).thenReturn(Collections.singletonList(testReport));

        DashboardStatsResponse stats = moderatorService.getDashboardStats();

        assertNotNull(stats);
        assertEquals(10L, stats.getTotalReports());
        assertEquals(4L, stats.getSubmittedCount());
        assertEquals(3L, stats.getUnderReviewCount());
        assertEquals(2L, stats.getResolvedCount());
        assertEquals(1L, stats.getDismissedCount());
        assertEquals(1, stats.getRecentReports().size());
    }
}
