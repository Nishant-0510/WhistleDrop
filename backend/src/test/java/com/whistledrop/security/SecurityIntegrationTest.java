package com.whistledrop.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @DisplayName("Public endpoint POST /api/reports should be accessible without authentication")
    void publicSubmission_Accessible() throws Exception {
        mockMvc.perform(post("/api/reports")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"category\":\"TECHNICAL\",\"description\":\"Testing public access endpoint without token.\"}"))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Protected endpoint GET /api/moderator/reports should reject unauthenticated request with 401")
    void protectedModeratorEndpoint_RejectsUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/moderator/reports"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Protected endpoint GET /api/moderator/reports should allow valid JWT token")
    void protectedModeratorEndpoint_AllowsValidToken() throws Exception {
        String token = jwtTokenProvider.generateTokenFromUsername("admin");

        mockMvc.perform(get("/api/moderator/reports")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }
}
