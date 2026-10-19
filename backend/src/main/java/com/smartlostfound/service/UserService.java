package com.smartlostfound.service;

import com.smartlostfound.dto.auth.ChangePasswordRequest;
import com.smartlostfound.dto.auth.UserProfileDto;
import com.smartlostfound.entity.User;
import com.smartlostfound.exception.BadRequestException;
import com.smartlostfound.exception.ResourceNotFoundException;
import com.smartlostfound.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public UserProfileDto getUserProfile(Long userId) {
        User user = getUserEntity(userId);
        return mapToProfileDto(user);
    }

    @Transactional(readOnly = true)
    public User getUserEntity(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    @Transactional
    public UserProfileDto updateProfile(Long userId, String fullName, String phoneNumber) {
        User user = getUserEntity(userId);

        if (fullName != null && !fullName.isBlank()) {
            user.setFullName(fullName.trim());
        }
        if (phoneNumber != null) {
            user.setPhoneNumber(phoneNumber.trim());
        }

        User saved = userRepository.save(user);
        auditLogService.record("USER_PROFILE_UPDATED", "User", user.getId(), user.getEmail(), "Profile details updated");
        return mapToProfileDto(saved);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = getUserEntity(userId);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password does not match");
        }

        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new BadRequestException("New password cannot be identical to current password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        auditLogService.record("PASSWORD_CHANGED", "User", user.getId(), user.getEmail(), "Password changed successfully");
    }

    public UserProfileDto mapToProfileDto(User user) {
        return new UserProfileDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhoneNumber(),
                user.getRole(),
                user.isEnabled(),
                user.getCreatedAt()
        );
    }
}
