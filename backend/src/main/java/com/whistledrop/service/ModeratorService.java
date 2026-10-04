package com.whistledrop.service;

import com.whistledrop.dto.request.StatusUpdateRequest;
import com.whistledrop.dto.response.DashboardStatsResponse;
import com.whistledrop.dto.response.PageResponse;
import com.whistledrop.dto.response.ReportResponse;
import com.whistledrop.dto.response.ReportSummaryResponse;
import com.whistledrop.entity.Report;
import com.whistledrop.entity.ReportCategory;
import com.whistledrop.entity.ReportStatus;
import com.whistledrop.entity.StatusUpdate;
import com.whistledrop.exception.InvalidStatusTransitionException;
import com.whistledrop.exception.ResourceNotFoundException;
import com.whistledrop.repository.ReportRepository;
import com.whistledrop.repository.StatusUpdateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ModeratorService {

    private static final Logger logger = LoggerFactory.getLogger(ModeratorService.class);

    private final ReportRepository reportRepository;
    private final StatusUpdateRepository statusUpdateRepository;
    private final ReportService reportService;

    public ModeratorService(ReportRepository reportRepository,
                            StatusUpdateRepository statusUpdateRepository,
                            ReportService reportService) {
        this.reportRepository = reportRepository;
        this.statusUpdateRepository = statusUpdateRepository;
        this.reportService = reportService;
    }

    @Transactional(readOnly = true)
    public PageResponse<ReportSummaryResponse> getReports(ReportCategory category,
                                                         ReportStatus status,
                                                         String search,
                                                         Pageable pageable) {
        Specification<Report> spec = (root, query, cb) -> cb.conjunction();

        if (category != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("category"), category));
        }

        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }

        if (search != null && !search.trim().isEmpty()) {
            String pattern = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("caseCode")), pattern),
                cb.like(cb.lower(root.get("description")), pattern)
            ));
        }

        Page<Report> page = reportRepository.findAll(spec, pageable);

        Page<ReportSummaryResponse> summaryPage = page.map(this::mapToSummary);
        return PageResponse.from(summaryPage);
    }

    @Transactional(readOnly = true)
    public ReportResponse getReportDetails(String caseCode) {
        String sanitized = caseCode.trim().toUpperCase();
        Report report = reportRepository.findByCaseCode(sanitized)
                .orElseThrow(() -> new ResourceNotFoundException("Report with case code '" + sanitized + "' was not found."));

        return reportService.mapToReportResponse(report);
    }

    @Transactional
    public ReportResponse updateReportStatus(String caseCode, StatusUpdateRequest request) {
        String sanitized = caseCode.trim().toUpperCase();
        Report report = reportRepository.findByCaseCode(sanitized)
                .orElseThrow(() -> new ResourceNotFoundException("Report with case code '" + sanitized + "' was not found."));

        ReportStatus currentStatus = report.getStatus();
        ReportStatus targetStatus = request.getStatus();

        if (!currentStatus.canTransitionTo(targetStatus)) {
            throw new InvalidStatusTransitionException(
                    "Invalid status transition from " + currentStatus + " to " + targetStatus + ". " +
                    "Allowed transitions: SUBMITTED -> (UNDER_REVIEW, DISMISSED), " +
                    "UNDER_REVIEW -> (RESOLVED, DISMISSED, UNDER_REVIEW), " +
                    "RESOLVED/DISMISSED -> UNDER_REVIEW.");
        }

        report.setStatus(targetStatus);

        StatusUpdate statusUpdate = new StatusUpdate(
                report,
                targetStatus,
                request.getMessage().trim()
        );
        report.addStatusUpdate(statusUpdate);

        Report updatedReport = reportRepository.save(report);
        logger.info("Moderator updated report '{}' status from {} to {}", caseCode, currentStatus, targetStatus);

        return reportService.mapToReportResponse(updatedReport);
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        long total = reportRepository.count();
        long submitted = reportRepository.countByStatus(ReportStatus.SUBMITTED);
        long underReview = reportRepository.countByStatus(ReportStatus.UNDER_REVIEW);
        long resolved = reportRepository.countByStatus(ReportStatus.RESOLVED);
        long dismissed = reportRepository.countByStatus(ReportStatus.DISMISSED);

        Map<ReportCategory, Long> categoryMap = new EnumMap<>(ReportCategory.class);
        for (ReportCategory cat : ReportCategory.values()) {
            categoryMap.put(cat, reportRepository.countByCategory(cat));
        }

        List<ReportSummaryResponse> recentReports = reportRepository.findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToSummary)
                .collect(Collectors.toList());

        return new DashboardStatsResponse(
                total,
                submitted,
                underReview,
                resolved,
                dismissed,
                categoryMap,
                recentReports
        );
    }

    private ReportSummaryResponse mapToSummary(Report report) {
        String snippet = report.getDescription();
        if (snippet != null && snippet.length() > 120) {
            snippet = snippet.substring(0, 117) + "...";
        }
        return new ReportSummaryResponse(
                report.getCaseCode(),
                report.getCategory(),
                report.getStatus(),
                report.getCreatedAt(),
                report.getUpdatedAt(),
                snippet
        );
    }
}
