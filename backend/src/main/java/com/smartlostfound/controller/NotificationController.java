package com.smartlostfound.controller;

import com.smartlostfound.dto.common.ApiResponse;
import com.smartlostfound.dto.common.PagedResponse;
import com.smartlostfound.dto.notification.NotificationDto;
import com.smartlostfound.security.SecurityUtils;
import com.smartlostfound.security.UserPrincipal;
import com.smartlostfound.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notifications", description = "Endpoints for in-app alert delivery, tracking, and read statuses")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Operation(summary = "Get current user notifications with pagination")
    public ResponseEntity<ApiResponse<PagedResponse<NotificationDto>>> getMyNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        UserPrincipal principal = SecurityUtils.getRequiredCurrentUserPrincipal();
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<NotificationDto> notifications = notificationService.getUserNotifications(principal.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get count of unread notifications for notification badge")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        UserPrincipal principal = SecurityUtils.getRequiredCurrentUserPrincipal();
        long count = notificationService.getUnreadCount(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(Map.of("unreadCount", count)));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark a single notification as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        UserPrincipal principal = SecurityUtils.getRequiredCurrentUserPrincipal();
        notificationService.markAsRead(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark all notifications as read for current user")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        UserPrincipal principal = SecurityUtils.getRequiredCurrentUserPrincipal();
        notificationService.markAllAsRead(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }
}
