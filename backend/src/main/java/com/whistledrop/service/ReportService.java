package com.whistledrop.service;

import com.whistledrop.dto.request.CreateReportRequest;
import com.whistledrop.dto.response.ReportResponse;
import com.whistledrop.dto.response.StatusUpdateResponse;
import com.whistledrop.entity.Report;
import com.whistledrop.entity.ReportStatus;
import com.whistledrop.entity.StatusUpdate;
import com.whistledrop.exception.ResourceNotFoundException;
import com.whistledrop.repository.ReportRepository;
import com.whistledrop.repository.StatusUpdateRepository;
import com.whistledrop.util.CaseCodeGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private static final Logger logger = LoggerFactory.getLogger(ReportService.class);

    private final ReportRepository reportRepository;
    private final StatusUpdateRepository statusUpdateRepository;
    private final CaseCodeGenerator caseCodeGenerator;

    public ReportService(ReportRepository reportRepository,
                         StatusUpdateRepository statusUpdateRepository,
                         CaseCodeGenerator caseCodeGenerator) {
        this.reportRepository = reportRepository;
        this.statusUpdateRepository = statusUpdateRepository;
        this.caseCodeGenerator = caseCodeGenerator;
    }

    @Transactional
    public ReportResponse submitReport(CreateReportRequest request) {
        String caseCode = caseCodeGenerator.generateUniqueCaseCode();

        String trimmedEvidenceUrl = (request.getEvidenceUrl() != null && !request.getEvidenceUrl().isBlank())
                ? request.getEvidenceUrl().trim()
                : null;

        Report report = new Report(
                caseCode,
                request.getCategory(),
                request.getDescription().trim(),
                trimmedEvidenceUrl,
                ReportStatus.SUBMITTED
        );

        StatusUpdate initialUpdate = new StatusUpdate(
                report,
                ReportStatus.SUBMITTED,
                "Report received and queued for review."
        );
        report.addStatusUpdate(initialUpdate);

        Report savedReport = reportRepository.save(report);
        logger.info("Successfully created anonymous report with case code '{}' and category '{}'",
                savedReport.getCaseCode(), savedReport.getCategory());

        return mapToReportResponse(savedReport);
    }

    @Transactional(readOnly = true)
    public ReportResponse getReportByCaseCode(String caseCode) {
        if (caseCode == null || caseCode.trim().isEmpty()) {
            throw new ResourceNotFoundException("Please provide a valid case code.");
        }

        String sanitizedCaseCode = caseCode.trim().toUpperCase();

        Report report = reportRepository.findByCaseCode(sanitizedCaseCode)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Report with case code '" + sanitizedCaseCode + "' was not found. Please verify your case code."));

        return mapToReportResponse(report);
    }

    public ReportResponse mapToReportResponse(Report report) {
        List<StatusUpdateResponse> history = report.getStatusUpdates().stream()
                .map(update -> new StatusUpdateResponse(
                        update.getId(),
                        update.getStatus(),
                        update.getMessage(),
                        update.getCreatedAt()
                ))
                .collect(Collectors.toList());

        return new ReportResponse(
                report.getCaseCode(),
                report.getCategory(),
                report.getDescription(),
                report.getEvidenceUrl(),
                report.getStatus(),
                report.getCreatedAt(),
                report.getUpdatedAt(),
                history
        );
    }
}
