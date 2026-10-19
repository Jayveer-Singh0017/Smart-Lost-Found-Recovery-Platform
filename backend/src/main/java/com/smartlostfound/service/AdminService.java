package com.smartlostfound.service;

import com.smartlostfound.dto.admin.*;
import com.smartlostfound.dto.common.PagedResponse;
import com.smartlostfound.entity.*;
import com.smartlostfound.exception.BadRequestException;
import com.smartlostfound.exception.ResourceNotFoundException;
import com.smartlostfound.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ItemReportRepository itemReportRepository;
    private final ClaimRepository claimRepository;
    private final ModerationReportRepository moderationReportRepository;
    private final AuditLogRepository auditLogRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public AdminService(
            UserRepository userRepository,
            ItemReportRepository itemReportRepository,
            ClaimRepository claimRepository,
            ModerationReportRepository moderationReportRepository,
            AuditLogRepository auditLogRepository,
            AuditLogService auditLogService,
            NotificationService notificationService) {
        this.userRepository = userRepository;
        this.itemReportRepository = itemReportRepository;
        this.claimRepository = claimRepository;
        this.moderationReportRepository = moderationReportRepository;
        this.auditLogRepository = auditLogRepository;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public AdminDashboardStatsDto getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalLost = itemReportRepository.countByType(ItemType.LOST);
        long totalFound = itemReportRepository.countByType(ItemType.FOUND);
        long openItems = itemReportRepository.countByStatus(ItemStatus.OPEN);
        long resolvedItems = itemReportRepository.countByStatus(ItemStatus.RESOLVED);
        long pendingClaims = claimRepository.countByStatus(ClaimStatus.PENDING);
        long pendingModeration = moderationReportRepository.countByStatus(ModerationReportStatus.PENDING);

        return new AdminDashboardStatsDto(
                totalUsers,
                totalLost,
                totalFound,
                openItems,
                resolvedItems,
                pendingClaims,
                pendingModeration
        );
    }

    @Transactional(readOnly = true)
    public PagedResponse<ModerationReportDto> getModerationReports(ModerationReportStatus status, Pageable pageable) {
        Page<ModerationReport> page = (status != null)
                ? moderationReportRepository.findByStatus(status, pageable)
                : moderationReportRepository.findAll(pageable);

        List<ModerationReportDto> dtos = page.getContent().stream()
                .map(this::mapToModerationDto)
                .toList();

        return PagedResponse.from(page, dtos);
    }

    @Transactional
    public void resolveModerationReport(Long reportId, ModerationActionRequest request, Long adminId) {
        ModerationReport mod = moderationReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("ModerationReport", "id", reportId));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", adminId));

        ItemReport item = mod.getItemReport();

        switch (request.getAction()) {
            case "APPROVE_ITEM" -> {
                item.setModerationStatus(ModerationStatus.APPROVED);
                mod.setStatus(ModerationReportStatus.ACTIONED);
                itemReportRepository.save(item);
                auditLogService.record("MODERATION_APPROVED", "ItemReport", item.getId(),
                        admin.getEmail(), "Admin confirmed item is approved. Notes: " + request.getNotes());
            }
            case "REJECT_ITEM" -> {
                item.setModerationStatus(ModerationStatus.REJECTED);
                item.setStatus(ItemStatus.WITHDRAWN);
                mod.setStatus(ModerationReportStatus.ACTIONED);
                itemReportRepository.save(item);

                notificationService.createNotification(
                        item.getUser(),
                        "Listing Removed by Moderation",
                        "Your item report '" + item.getTitle() + "' was removed by administrators. Reason: " + request.getNotes(),
                        NotificationType.MODERATION_ALERT,
                        item.getId(),
                        "ItemReport"
                );

                auditLogService.record("MODERATION_REJECTED", "ItemReport", item.getId(),
                        admin.getEmail(), "Admin rejected and removed item. Notes: " + request.getNotes());
            }
            case "DISMISS_REPORT" -> {
                mod.setStatus(ModerationReportStatus.DISMISSED);
                auditLogService.record("MODERATION_DISMISSED", "ModerationReport", mod.getId(),
                        admin.getEmail(), "Admin dismissed flag. Notes: " + request.getNotes());
            }
            default -> throw new BadRequestException("Unknown moderation action: " + request.getAction());
        }

        moderationReportRepository.save(mod);
    }

    @Transactional(readOnly = true)
    public PagedResponse<UserAdminDto> getUsers(String search, Pageable pageable) {
        Page<User> page = (search != null && !search.isBlank())
                ? userRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(search.trim(), search.trim(), pageable)
                : userRepository.findAll(pageable);

        List<UserAdminDto> dtos = page.getContent().stream()
                .map(u -> new UserAdminDto(
                        u.getId(),
                        u.getEmail(),
                        u.getFullName(),
                        u.getPhoneNumber(),
                        u.getRole(),
                        u.isEnabled(),
                        u.getCreatedAt()
                ))
                .toList();

        return PagedResponse.from(page, dtos);
    }

    @Transactional
    public void toggleUserActive(Long targetUserId, Long adminId) {
        if (targetUserId.equals(adminId)) {
            throw new BadRequestException("You cannot disable your own administrator account");
        }

        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", targetUserId));

        user.setEnabled(!user.isEnabled());
        userRepository.save(user);

        User admin = userRepository.findById(adminId).orElse(null);
        String adminEmail = admin != null ? admin.getEmail() : "admin";

        auditLogService.record("USER_STATUS_TOGGLED", "User", user.getId(), adminEmail,
                "User " + user.getEmail() + " status changed to enabled=" + user.isEnabled());
    }

    @Transactional
    public void updateUserRole(Long targetUserId, String newRole, Long adminId) {
        if (!newRole.equals("ROLE_USER") && !newRole.equals("ROLE_ADMIN")) {
            throw new BadRequestException("Role must be ROLE_USER or ROLE_ADMIN");
        }

        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", targetUserId));

        user.setRole(newRole);
        userRepository.save(user);

        User admin = userRepository.findById(adminId).orElse(null);
        String adminEmail = admin != null ? admin.getEmail() : "admin";

        auditLogService.record("USER_ROLE_CHANGED", "User", user.getId(), adminEmail,
                "User " + user.getEmail() + " role changed to " + newRole);
    }

    @Transactional(readOnly = true)
    public PagedResponse<AuditLogDto> getAuditLogs(Pageable pageable) {
        Page<AuditLog> page = auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
        List<AuditLogDto> dtos = page.getContent().stream()
                .map(l -> new AuditLogDto(
                        l.getId(),
                        l.getAction(),
                        l.getEntityName(),
                        l.getEntityId(),
                        l.getPerformedBy(),
                        l.getDetails(),
                        l.getIpAddress(),
                        l.getCreatedAt()
                ))
                .toList();
        return PagedResponse.from(page, dtos);
    }

    private ModerationReportDto mapToModerationDto(ModerationReport m) {
        ModerationReportDto dto = new ModerationReportDto();
        dto.setId(m.getId());
        if (m.getItemReport() != null) {
            dto.setItemReportId(m.getItemReport().getId());
            dto.setItemTitle(m.getItemReport().getTitle());
            dto.setItemType(m.getItemReport().getType());
        }
        if (m.getReporter() != null) {
            dto.setReporterId(m.getReporter().getId());
            dto.setReporterName(m.getReporter().getFullName());
        }
        dto.setReason(m.getReason());
        dto.setDetails(m.getDetails());
        dto.setStatus(m.getStatus());
        dto.setCreatedAt(m.getCreatedAt());
        return dto;
    }
}
