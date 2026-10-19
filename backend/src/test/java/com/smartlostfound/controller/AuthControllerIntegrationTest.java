package com.smartlostfound.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlostfound.dto.auth.AuthResponse;
import com.smartlostfound.dto.auth.LoginRequest;
import com.smartlostfound.dto.auth.RegisterRequest;
import com.smartlostfound.exception.BadRequestException;
import com.smartlostfound.service.AuthService;
import com.smartlostfound.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private UserService userService;

    @Test
    @DisplayName("POST /api/v1/auth/register - Should return 201 on valid registration")
    void testRegisterSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "Jane Doe", "jane.doe@example.com", "Password@123", "+123456789"
        );

        AuthResponse authResponse = new AuthResponse(
                "mock.jwt.token", 1L, "jane.doe@example.com", "Jane Doe", "ROLE_USER"
        );

        when(authService.register(any(RegisterRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("mock.jwt.token"))
                .andExpect(jsonPath("$.data.email").value("jane.doe@example.com"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register - Should return 400 when validation fails")
    void testRegisterValidationFailure() throws Exception {
        RegisterRequest request = new RegisterRequest("", "invalid-email", "123", "");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.fieldErrors").exists());
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - Should return 401 when invalid credentials provided")
    void testLoginInvalidCredentials() throws Exception {
        LoginRequest request = new LoginRequest("user@example.com", "wrongpassword");

        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new BadCredentialsException("Invalid email or password"));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }
}
