package com.whistledrop.util;

import com.whistledrop.exception.CaseCodeGenerationException;
import com.whistledrop.repository.ReportRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CaseCodeGeneratorTest {

    @Mock
    private ReportRepository reportRepository;

    private CaseCodeGenerator caseCodeGenerator;

    @BeforeEach
    void setUp() {
        caseCodeGenerator = new CaseCodeGenerator(reportRepository);
    }

    @Test
    @DisplayName("Should generate code with prefix WD- and correct 11-char length")
    void generateRawCode_FormatAndLength() {
        String code = caseCodeGenerator.generateRawCode();

        assertNotNull(code);
        assertTrue(code.startsWith("WD-"), "Code should start with WD-");
        assertEquals(11, code.length(), "Code format should be WD- followed by 8 chars (total 11)");
        assertTrue(code.matches("^WD-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{8}$"),
                "Code must only contain unambiguous characters");
    }

    @Test
    @DisplayName("Should generate distinct random codes on multiple invocations")
    void generateRawCode_Unpredictability() {
        Set<String> generatedCodes = new HashSet<>();
        for (int i = 0; i < 50; i++) {
            String code = caseCodeGenerator.generateRawCode();
            generatedCodes.add(code);
        }
        assertEquals(50, generatedCodes.size(), "All 50 generated codes should be unique");
    }

    @Test
    @DisplayName("Should return code on first try when no collision exists")
    void generateUniqueCaseCode_FirstAttemptSuccess() {
        when(reportRepository.existsByCaseCode(anyString())).thenReturn(false);

        String code = caseCodeGenerator.generateUniqueCaseCode();

        assertNotNull(code);
        assertTrue(code.startsWith("WD-"));
    }

    @Test
    @DisplayName("Should retry if a collision occurs and return a unique code")
    void generateUniqueCaseCode_RetryOnCollision() {
        when(reportRepository.existsByCaseCode(anyString()))
                .thenReturn(true)  // Collision on first try
                .thenReturn(false); // Success on second try

        String code = caseCodeGenerator.generateUniqueCaseCode();

        assertNotNull(code);
        assertTrue(code.startsWith("WD-"));
    }

    @Test
    @DisplayName("Should throw CaseCodeGenerationException when max retries exceeded")
    void generateUniqueCaseCode_MaxRetriesExceeded() {
        when(reportRepository.existsByCaseCode(anyString())).thenReturn(true);

        assertThrows(CaseCodeGenerationException.class, () -> {
            caseCodeGenerator.generateUniqueCaseCode();
        });
    }
}
