package com.smartlostfound.controller;

import com.smartlostfound.dto.admin.*;
import com.smartlostfound.dto.claim.ClaimResponse;
import com.smartlostfound.dto.common.ApiResponse;
import com.smartlostfound.dto.common.PagedResponse;
import com.smartlostfound.entity.ModerationReportStatus;
import com.smartlostfound.security.SecurityUtils;
import com.smartlostfound.security.UserPrincipal;
import com.smartlostfound.service.AdminService;
import com.smartlostfound.service.ClaimService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Tag(name = "Administration", description = "Endpoints for platform oversight, metrics, moderation, and user management")
public class AdminController {

    private final AdminService adminService;
    private final ClaimService claimService;

    public AdminController(AdminService adminService, ClaimService claimService) {
        this.adminService = adminService;
        this.claimService = claimService;
    }

    @GetMapping("/stats")
    @Operation(summary = "Get aggregate operational statistics for admin dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardStatsDto>> getDashboardStats() {
        AdminDashboardStatsDto stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/moderation")
    @Operation(summary = "Get flagged items moderation queue")
    public ResponseEntity<ApiResponse<PagedResponse<ModerationReportDto>>> getModerationQueue(
            @RequestParam(required = false) ModerationReportStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PagedResponse<ModerationReportDto> queue = adminService.getModerationReports(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(queue));
    }

    @PostMapping("/moderation/{id}/action")
    @Operation(summary = "Take moderation decision on flagged listing")
    public ResponseEntity<ApiResponse<Void>> takeModerationAction(
            @PathVariable Long id,
            @Valid @RequestBody ModerationActionRequest request) {
        UserPrincipal principal = SecurityUtils.getRequiredCurrentUserPrincipal();
        adminService.resolveModerationReport(id, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Moderation decision executed successfully", null));
    }

    @GetMapping("/users")
    @Operation(summary = "Get paginated user directory with search")
    public ResponseEntity<ApiResponse<PagedResponse<UserAdminDto>>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PagedResponse<UserAdminDto> users = adminService.getUsers(search, pageable);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PatchMapping("/users/{id}/toggle-status")
    @Operation(summary = "Enable or disable a user account")
    public ResponseEntity<ApiResponse<Void>> toggleUserStatus(@PathVariable Long id) {
        UserPrincipal principal = SecurityUtils.getRequiredCurrentUserPrincipal();
        adminService.toggleUserActive(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("User status changed", null));
    }

    @PatchMapping("/users/{id}/role")
    @Operation(summary = "Update user authority role")
    public ResponseEntity<ApiResponse<Void>> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        UserPrincipal principal = SecurityUtils.getRequiredCurrentUserPrincipal();
        String role = body.get("role");
        adminService.updateUserRole(id, role, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("User role updated successfully", null));
    }

    @GetMapping("/claims")
    @Operation(summary = "Get all platform claims for administrative oversight")
    public ResponseEntity<ApiResponse<PagedResponse<ClaimResponse>>> getAllClaims(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PagedResponse<ClaimResponse> claims = claimService.getAllClaimsAdmin(pageable);
        return ResponseEntity.ok(ApiResponse.success(claims));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Get immutable system audit trail")
    public ResponseEntity<ApiResponse<PagedResponse<AuditLogDto>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<AuditLogDto> logs = adminService.getAuditLogs(pageable);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }
}
