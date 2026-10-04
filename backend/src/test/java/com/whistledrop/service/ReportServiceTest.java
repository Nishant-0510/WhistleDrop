package com.whistledrop.service;

import com.whistledrop.dto.request.CreateReportRequest;
import com.whistledrop.dto.response.ReportResponse;
import com.whistledrop.entity.Report;
import com.whistledrop.entity.ReportCategory;
import com.whistledrop.entity.ReportStatus;
import com.whistledrop.exception.ResourceNotFoundException;
import com.whistledrop.repository.ReportRepository;
import com.whistledrop.repository.StatusUpdateRepository;
import com.whistledrop.util.CaseCodeGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private StatusUpdateRepository statusUpdateRepository;

    @Mock
    private CaseCodeGenerator caseCodeGenerator;

    @InjectMocks
    private ReportService reportService;

    private CreateReportRequest validRequest;

    @BeforeEach
    void setUp() {
        validRequest = new CreateReportRequest(
                ReportCategory.TECHNICAL,
                "Exposed database credentials on public branch.",
                "https://github.com/example/repo/issues/123"
        );
    }

    @Test
    @DisplayName("Should submit report, assign unique case code, and save initial SUBMITTED status")
    void submitReport_Success() {
        String expectedCaseCode = "WD-K7M4P9X2";
        when(caseCodeGenerator.generateUniqueCaseCode()).thenReturn(expectedCaseCode);

        Report savedReport = new Report(
                expectedCaseCode,
                validRequest.getCategory(),
                validRequest.getDescription(),
                validRequest.getEvidenceUrl(),
                ReportStatus.SUBMITTED
        );
        savedReport.setId(1L);
        savedReport.setCreatedAt(LocalDateTime.now());
        savedReport.setUpdatedAt(LocalDateTime.now());

        when(reportRepository.save(any(Report.class))).thenReturn(savedReport);

        ReportResponse response = reportService.submitReport(validRequest);

        assertNotNull(response);
        assertEquals(expectedCaseCode, response.getCaseCode());
        assertEquals(ReportCategory.TECHNICAL, response.getCategory());
        assertEquals(ReportStatus.SUBMITTED, response.getStatus());
        assertEquals("Exposed database credentials on public branch.", response.getDescription());
        assertEquals("https://github.com/example/repo/issues/123", response.getEvidenceUrl());

        verify(caseCodeGenerator, times(1)).generateUniqueCaseCode();
        verify(reportRepository, times(1)).save(any(Report.class));
    }

    @Test
    @DisplayName("Should retrieve report by valid case code")
    void getReportByCaseCode_Success() {
        String caseCode = "WD-K7M4P9X2";
        Report report = new Report(
                caseCode,
                ReportCategory.SECURITY,
                "Unauthorized API access discovered in backend gateway.",
                null,
                ReportStatus.SUBMITTED
        );
        report.setId(1L);
        report.setCreatedAt(LocalDateTime.now());
        report.setUpdatedAt(LocalDateTime.now());

        when(reportRepository.findByCaseCode(caseCode)).thenReturn(Optional.of(report));

        ReportResponse response = reportService.getReportByCaseCode(caseCode);

        assertNotNull(response);
        assertEquals(caseCode, response.getCaseCode());
        assertEquals(ReportCategory.SECURITY, response.getCategory());
        assertEquals(ReportStatus.SUBMITTED, response.getStatus());

        verify(reportRepository, times(1)).findByCaseCode(caseCode);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when tracking non-existent case code")
    void getReportByCaseCode_NotFound() {
        String unknownCode = "WD-UNKNOWN9";
        when(reportRepository.findByCaseCode(unknownCode)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            reportService.getReportByCaseCode(unknownCode);
        });

        verify(reportRepository, times(1)).findByCaseCode(unknownCode);
    }
}
