package com.whistledrop.util;

import com.whistledrop.exception.CaseCodeGenerationException;
import com.whistledrop.repository.ReportRepository;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

/**
 * Generates cryptographically secure, unpredictable case codes for anonymous reports.
 * Example format: WD-K7M4P9X2
 * Uses an unambiguous alphabet (excluding 0, O, 1, I, L) to prevent human reading mistakes.
 */
@Component
public class CaseCodeGenerator {

    private static final String PREFIX = "WD-";
    private static final String ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
    private static final int CODE_LENGTH = 8;
    private static final int MAX_RETRIES = 10;

    private final SecureRandom secureRandom = new SecureRandom();
    private final ReportRepository reportRepository;

    public CaseCodeGenerator(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    /**
     * Generates a raw case code string (e.g., WD-K7M4P9X2).
     */
    public String generateRawCode() {
        StringBuilder sb = new StringBuilder(PREFIX);
        for (int i = 0; i < CODE_LENGTH; i++) {
            int index = secureRandom.nextInt(ALPHABET.length());
            sb.append(ALPHABET.charAt(index));
        }
        return sb.toString();
    }

    /**
     * Generates a guaranteed unique case code by checking against the database,
     * retrying up to MAX_RETRIES in the astronomically unlikely event of a collision.
     */
    public String generateUniqueCaseCode() {
        for (int attempt = 0; attempt < MAX_RETRIES; attempt++) {
            String candidateCode = generateRawCode();
            if (!reportRepository.existsByCaseCode(candidateCode)) {
                return candidateCode;
            }
        }
        throw new CaseCodeGenerationException("Failed to generate a unique case code after " + MAX_RETRIES + " attempts.");
    }
}
