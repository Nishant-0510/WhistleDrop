package com.whistledrop.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Moderator authentication response containing JWT token")
public class LoginResponse {

    @Schema(description = "Bearer JWT token for authenticating subsequent requests", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String token;

    @Schema(description = "Token authentication scheme", example = "Bearer")
    private String tokenType = "Bearer";

    @Schema(description = "Authenticated username", example = "admin")
    private String username;

    @Schema(description = "User role authority", example = "ROLE_MODERATOR")
    private String role;

    @Schema(description = "Token validity duration in milliseconds", example = "86400000")
    private long expiresIn;

    public LoginResponse() {
    }

    public LoginResponse(String token, String username, String role, long expiresIn) {
        this.token = token;
        this.tokenType = "Bearer";
        this.username = username;
        this.role = role;
        this.expiresIn = expiresIn;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }
}
