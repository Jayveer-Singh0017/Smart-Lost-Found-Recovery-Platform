package com.smartlostfound.service;

import com.smartlostfound.dto.auth.AuthResponse;
import com.smartlostfound.dto.auth.LoginRequest;
import com.smartlostfound.dto.auth.RegisterRequest;
import com.smartlostfound.entity.User;
import com.smartlostfound.exception.BadRequestException;
import com.smartlostfound.repository.UserRepository;
import com.smartlostfound.security.JwtTokenProvider;
import com.smartlostfound.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final AuditLogService auditLogService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtTokenProvider tokenProvider,
            AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("An account with this email address already exists");
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setPhoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null);
        user.setRole("ROLE_USER");
        user.setEnabled(true);

        User savedUser = userRepository.saveAndFlush(user);

        auditLogService.record("USER_REGISTERED", "User", savedUser.getId(), savedUser.getEmail(),
                "New user self-registered");

        // Generate token directly for the newly created user principal
        UserPrincipal userPrincipal = UserPrincipal.create(savedUser);
        String token = tokenProvider.generateTokenForUser(userPrincipal);

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getRole()
        );
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String token = tokenProvider.generateToken(authentication);

        String role = principal.getAuthorities().stream()
                .findFirst()
                .map(Object::toString)
                .orElse("ROLE_USER");

        auditLogService.record("USER_LOGIN", "User", principal.getId(), principal.getUsername(),
                "User successfully logged in");

        return new AuthResponse(
                token,
                principal.getId(),
                principal.getUsername(),
                principal.getFullName(),
                role
        );
    }
}
