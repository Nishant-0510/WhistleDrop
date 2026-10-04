package com.whistledrop.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.whistledrop.dto.request.CreateReportRequest;
import com.whistledrop.dto.response.ReportResponse;
import com.whistledrop.entity.ReportCategory;
import com.whistledrop.entity.ReportStatus;
import com.whistledrop.exception.GlobalExceptionHandler;
import com.whistledrop.exception.ResourceNotFoundException;
import com.whistledrop.service.ReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.time.LocalDateTime;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class PublicReportControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @Mock
    private ReportService reportService;

    @InjectMocks
    private PublicReportController publicReportController;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders.standaloneSetup(publicReportController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setValidator(validator)
                .build();
    }

    @Test
    @DisplayName("POST /api/reports - Should return 201 Created and case code on valid submission")
    void submitReport_ValidInput_Returns201() throws Exception {
        CreateReportRequest request = new CreateReportRequest(
                ReportCategory.SECURITY,
                "Security vulnerability in backend session generation mechanism.",
                "https://example.com/proof"
        );

        ReportResponse mockResponse = new ReportResponse(
                "WD-K7M4P9X2",
                ReportCategory.SECURITY,
                request.getDescription(),
                request.getEvidenceUrl(),
                ReportStatus.SUBMITTED,
                LocalDateTime.now(),
                LocalDateTime.now(),
                Collections.emptyList()
        );

        when(reportService.submitReport(any(CreateReportRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/reports")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.caseCode").value("WD-K7M4P9X2"))
                .andExpect(jsonPath("$.data.category").value("SECURITY"))
                .andExpect(jsonPath("$.data.status").value("SUBMITTED"));
    }

    @Test
    @DisplayName("POST /api/reports - Should return 400 Bad Request when description is too short")
    void submitReport_TooShortDescription_Returns400() throws Exception {
        CreateReportRequest request = new CreateReportRequest(
                ReportCategory.SECURITY,
                "Short",
                null
        );

        mockMvc.perform(post("/api/reports")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("POST /api/reports - Should return 400 Bad Request when category is null")
    void submitReport_MissingCategory_Returns400() throws Exception {
        String invalidJson = "{\"description\": \"Valid length description about security.\"}";

        mockMvc.perform(post("/api/reports")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("GET /api/reports/{caseCode} - Should return 200 OK for existing case code")
    void trackReport_ExistingCaseCode_Returns200() throws Exception {
        String caseCode = "WD-K7M4P9X2";
        ReportResponse mockResponse = new ReportResponse(
                caseCode,
                ReportCategory.TECHNICAL,
                "Database connection pool exhaustion on high load.",
                null,
                ReportStatus.SUBMITTED,
                LocalDateTime.now(),
                LocalDateTime.now(),
                Collections.emptyList()
        );

        when(reportService.getReportByCaseCode(caseCode)).thenReturn(mockResponse);

        mockMvc.perform(get("/api/reports/" + caseCode))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.caseCode").value(caseCode))
                .andExpect(jsonPath("$.data.status").value("SUBMITTED"));
    }

    @Test
    @DisplayName("GET /api/reports/{caseCode} - Should return 404 Not Found for non-existent case code")
    void trackReport_NonExistentCaseCode_Returns404() throws Exception {
        String unknownCode = "WD-NOTFOUND";
        when(reportService.getReportByCaseCode(unknownCode))
                .thenThrow(new ResourceNotFoundException("Report not found"));

        mockMvc.perform(get("/api/reports/" + unknownCode))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }
}
