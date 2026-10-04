package com.whistledrop.config;

import com.whistledrop.entity.Moderator;
import com.whistledrop.entity.Report;
import com.whistledrop.entity.ReportCategory;
import com.whistledrop.entity.ReportStatus;
import com.whistledrop.entity.StatusUpdate;
import com.whistledrop.repository.ModeratorRepository;
import com.whistledrop.repository.ReportRepository;
import com.whistledrop.repository.StatusUpdateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final ModeratorRepository moderatorRepository;
    private final ReportRepository reportRepository;
    private final StatusUpdateRepository statusUpdateRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${whistledrop.security.default-moderator.username:admin}")
    private String defaultUsername;

    @Value("${whistledrop.security.default-moderator.password:WhistleDrop2026!Secure}")
    private String defaultPassword;

    public DataInitializer(ModeratorRepository moderatorRepository,
                           ReportRepository reportRepository,
                           StatusUpdateRepository statusUpdateRepository,
                           PasswordEncoder passwordEncoder) {
        this.moderatorRepository = moderatorRepository;
        this.reportRepository = reportRepository;
        this.statusUpdateRepository = statusUpdateRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        initializeModerator();
        initializeSampleReportsIfEmpty();
    }

    private void initializeModerator() {
        if (!moderatorRepository.existsByUsername(defaultUsername)) {
            Moderator moderator = new Moderator(
                    defaultUsername,
                    passwordEncoder.encode(defaultPassword),
                    "ROLE_MODERATOR"
            );
            moderatorRepository.save(moderator);
            logger.info("Initialized default moderator account with username '{}'", defaultUsername);
        }
    }

    private void initializeSampleReportsIfEmpty() {
        if (reportRepository.count() == 0) {
            logger.info("Database is empty. Initializing initial demonstration reports...");

            // Report 1: Technical (RESOLVED)
            Report r1 = new Report("WD-A8K2M4P9", ReportCategory.TECHNICAL,
                    "Discovered an open API endpoint exposing test database credentials in build artifacts.",
                    "https://github.com/example/repo/issues/404",
                    ReportStatus.RESOLVED);
            r1.setCreatedAt(LocalDateTime.now().minusDays(5));
            r1.setUpdatedAt(LocalDateTime.now().minusDays(1));
            reportRepository.save(r1);

            StatusUpdate u1_1 = new StatusUpdate(r1, ReportStatus.SUBMITTED, "Report received and queued for triage.");
            u1_1.setCreatedAt(LocalDateTime.now().minusDays(5));
            statusUpdateRepository.save(u1_1);

            StatusUpdate u1_2 = new StatusUpdate(r1, ReportStatus.UNDER_REVIEW, "Technical infrastructure team has verified the leak and revoked exposed tokens.");
            u1_2.setCreatedAt(LocalDateTime.now().minusDays(3));
            statusUpdateRepository.save(u1_2);

            StatusUpdate u1_3 = new StatusUpdate(r1, ReportStatus.RESOLVED, "Artifact repository permissions restricted and CI/CD secret scanning enforced. Issue fully resolved.");
            u1_3.setCreatedAt(LocalDateTime.now().minusDays(1));
            statusUpdateRepository.save(u1_3);

            // Report 2: Security (UNDER_REVIEW)
            Report r2 = new Report("WD-E3T7Y9B2", ReportCategory.SECURITY,
                    "Potential IDOR vulnerability found in user profile update endpoint allowing unauthorized data modification.",
                    "https://gist.github.com/security-poc-example",
                    ReportStatus.UNDER_REVIEW);
            r2.setCreatedAt(LocalDateTime.now().minusDays(2));
            r2.setUpdatedAt(LocalDateTime.now().minusHours(4));
            reportRepository.save(r2);

            StatusUpdate u2_1 = new StatusUpdate(r2, ReportStatus.SUBMITTED, "Report received and queued for security triage.");
            u2_1.setCreatedAt(LocalDateTime.now().minusDays(2));
            statusUpdateRepository.save(u2_1);

            StatusUpdate u2_2 = new StatusUpdate(r2, ReportStatus.UNDER_REVIEW, "Security team reproduced the vulnerability in staging. Fix is currently in code review.");
            u2_2.setCreatedAt(LocalDateTime.now().minusHours(4));
            statusUpdateRepository.save(u2_2);

            // Report 3: Corruption (SUBMITTED)
            Report r3 = new Report("WD-H4N6X8C1", ReportCategory.CORRUPTION,
                    "Vendor selection process for campus event hardware procurement bypassed standard competitive bidding thresholds.",
                    null,
                    ReportStatus.SUBMITTED);
            r3.setCreatedAt(LocalDateTime.now().minusHours(12));
            r3.setUpdatedAt(LocalDateTime.now().minusHours(12));
            reportRepository.save(r3);

            StatusUpdate u3_1 = new StatusUpdate(r3, ReportStatus.SUBMITTED, "Report received. Audit committee has been notified.");
            u3_1.setCreatedAt(LocalDateTime.now().minusHours(12));
            statusUpdateRepository.save(u3_1);

            // Report 4: Harassment (DISMISSED)
            Report r4 = new Report("WD-R5W9Z3D7", ReportCategory.HARASSMENT,
                    "Non-actionable message without contextual details or event occurrence information.",
                    null,
                    ReportStatus.DISMISSED);
            r4.setCreatedAt(LocalDateTime.now().minusDays(6));
            r4.setUpdatedAt(LocalDateTime.now().minusDays(4));
            reportRepository.save(r4);

            StatusUpdate u4_1 = new StatusUpdate(r4, ReportStatus.SUBMITTED, "Report received.");
            u4_1.setCreatedAt(LocalDateTime.now().minusDays(6));
            statusUpdateRepository.save(u4_1);

            StatusUpdate u4_2 = new StatusUpdate(r4, ReportStatus.DISMISSED, "Insufficient detail provided to initiate an investigation under institutional policy.");
            u4_2.setCreatedAt(LocalDateTime.now().minusDays(4));
            statusUpdateRepository.save(u4_2);

            logger.info("Sample demonstration reports successfully initialized.");
        }
    }
}
