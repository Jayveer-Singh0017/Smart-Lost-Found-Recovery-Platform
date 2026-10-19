package com.smartlostfound.service;

import com.smartlostfound.dto.auth.AuthResponse;
import com.smartlostfound.dto.auth.LoginRequest;
import com.smartlostfound.dto.auth.RegisterRequest;
import com.smartlostfound.entity.User;
import com.smartlostfound.exception.BadRequestException;
import com.smartlostfound.repository.UserRepository;
import com.smartlostfound.security.JwtTokenProvider;
import com.smartlostfound.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private AuditLogService auditLogService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                passwordEncoder,
                authenticationManager,
                tokenProvider,
                auditLogService
        );
    }

    @Test
    @DisplayName("Should successfully register new user with hashed password and return token")
    void testRegisterSuccess() {
        RegisterRequest request = new RegisterRequest(
                "Jordan Lee", "jordan.lee@example.com", "Password@123", "+1555123456"
        );

        when(userRepository.existsByEmail("jordan.lee@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password@123")).thenReturn("bcrypt_hashed_string");

        User savedUser = new User("jordan.lee@example.com", "bcrypt_hashed_string", "Jordan Lee", "+1555123456", "ROLE_USER");
        savedUser.setId(55L);
        when(userRepository.saveAndFlush(any(User.class))).thenReturn(savedUser);
        when(tokenProvider.generateTokenForUser(any(UserPrincipal.class))).thenReturn("mock_jwt_token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mock_jwt_token", response.getToken());
        assertEquals("jordan.lee@example.com", response.getEmail());
        assertEquals(55L, response.getUserId());
        assertEquals("ROLE_USER", response.getRole());
        verify(userRepository).saveAndFlush(any(User.class));
    }

    @Test
    @DisplayName("Should reject registration with duplicate email")
    void testRegisterDuplicateEmailFails() {
        RegisterRequest request = new RegisterRequest(
                "Jordan Lee", "existing@example.com", "Password@123", null
        );

        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should authenticate valid credentials and issue JWT")
    void testLoginSuccess() {
        LoginRequest request = new LoginRequest("jordan.lee@example.com", "Password@123");

        UserPrincipal principal = new UserPrincipal(
                55L, "jordan.lee@example.com", "hash", "Jordan Lee", true, Collections.emptyList()
        );

        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(principal);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("valid_jwt_token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("valid_jwt_token", response.getToken());
        assertEquals(55L, response.getUserId());
        assertEquals("jordan.lee@example.com", response.getEmail());
    }
}
