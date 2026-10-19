package com.smartlostfound.controller;

import com.smartlostfound.dto.auth.ChangePasswordRequest;
import com.smartlostfound.dto.auth.UserProfileDto;
import com.smartlostfound.dto.common.ApiResponse;
import com.smartlostfound.security.SecurityUtils;
import com.smartlostfound.security.UserPrincipal;
import com.smartlostfound.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "User Management", description = "Endpoints for profile updates and account security")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    @Operation(summary = "Get user profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> getProfile() {
        UserPrincipal principal = SecurityUtils.getRequiredCurrentUserPrincipal();
        UserProfileDto profile = userService.getUserProfile(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update user full name and phone number")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateProfile(@RequestBody Map<String, String> body) {
        UserPrincipal principal = SecurityUtils.getRequiredCurrentUserPrincipal();
        String fullName = body.get("fullName");
        String phoneNumber = body.get("phoneNumber");
        UserProfileDto profile = userService.updateProfile(principal.getId(), fullName, phoneNumber);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", profile));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Secure password change with old password verification")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        UserPrincipal principal = SecurityUtils.getRequiredCurrentUserPrincipal();
        userService.changePassword(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }
}
