package com.whistledrop.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.whistledrop.dto.request.StatusUpdateRequest;
import com.whistledrop.dto.response.DashboardStatsResponse;
import com.whistledrop.dto.response.PageResponse;
import com.whistledrop.dto.response.ReportResponse;
import com.whistledrop.dto.response.ReportSummaryResponse;
import com.whistledrop.entity.ReportCategory;
import com.whistledrop.entity.ReportStatus;
import com.whistledrop.exception.GlobalExceptionHandler;
import com.whistledrop.exception.InvalidStatusTransitionException;
import com.whistledrop.service.ModeratorService;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ModeratorReportControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @Mock
    private ModeratorService moderatorService;

    @InjectMocks
    private ModeratorReportController moderatorReportController;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders.standaloneSetup(moderatorReportController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setValidator(validator)
                .build();
    }

    @Test
    @DisplayName("GET /api/moderator/reports - Should return reports list successfully")
    void getReports_Returns200() throws Exception {
        ReportSummaryResponse summary = new ReportSummaryResponse(
                "WD-K7M4P9X2",
                ReportCategory.SECURITY,
                ReportStatus.SUBMITTED,
                LocalDateTime.now(),
                LocalDateTime.now(),
                "Preview description"
        );
        PageResponse<ReportSummaryResponse> pageResponse = new PageResponse<>(
                Collections.singletonList(summary), 0, 10, 1, 1, true
        );

        when(moderatorService.getReports(any(), any(), any(), any())).thenReturn(pageResponse);

        mockMvc.perform(get("/api/moderator/reports"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].caseCode").value("WD-K7M4P9X2"));
    }

    @Test
    @DisplayName("PATCH /api/moderator/reports/{caseCode}/status - Should update status successfully")
    void updateReportStatus_Valid_Returns200() throws Exception {
        String caseCode = "WD-K7M4P9X2";
        StatusUpdateRequest request = new StatusUpdateRequest(
                ReportStatus.UNDER_REVIEW,
                "Under formal investigation."
        );

        ReportResponse response = new ReportResponse(
                caseCode,
                ReportCategory.SECURITY,
                "Full description",
                null,
                ReportStatus.UNDER_REVIEW,
                LocalDateTime.now(),
                LocalDateTime.now(),
                Collections.emptyList()
        );

        when(moderatorService.updateReportStatus(eq(caseCode), any(StatusUpdateRequest.class)))
                .thenReturn(response);

        mockMvc.perform(patch("/api/moderator/reports/" + caseCode + "/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("UNDER_REVIEW"));
    }

    @Test
    @DisplayName("PATCH /api/moderator/reports/{caseCode}/status - Should return 400 for invalid status transition")
    void updateReportStatus_InvalidTransition_Returns400() throws Exception {
        String caseCode = "WD-K7M4P9X2";
        StatusUpdateRequest request = new StatusUpdateRequest(
                ReportStatus.RESOLVED,
                "Premature transition"
        );

        when(moderatorService.updateReportStatus(eq(caseCode), any(StatusUpdateRequest.class)))
                .thenThrow(new InvalidStatusTransitionException("Invalid status transition"));

        mockMvc.perform(patch("/api/moderator/reports/" + caseCode + "/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("GET /api/moderator/dashboard/stats - Should return 200 OK with analytics metrics")
    void getDashboardStats_Returns200() throws Exception {
        DashboardStatsResponse stats = new DashboardStatsResponse(
                10, 3, 4, 2, 1, Collections.emptyMap(), Collections.emptyList()
        );

        when(moderatorService.getDashboardStats()).thenReturn(stats);

        mockMvc.perform(get("/api/moderator/dashboard/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalReports").value(10));
    }
}
