package com.smartlostfound.service;

import com.smartlostfound.dto.common.PagedResponse;
import com.smartlostfound.dto.notification.NotificationDto;
import com.smartlostfound.entity.Notification;
import com.smartlostfound.entity.NotificationType;
import com.smartlostfound.entity.User;
import com.smartlostfound.exception.ResourceNotFoundException;
import com.smartlostfound.repository.NotificationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public void createNotification(User user, String title, String message, NotificationType type, Long referenceId, String referenceType) {
        Notification notification = new Notification(user, title, message, type, referenceId, referenceType);
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public PagedResponse<NotificationDto> getUserNotifications(Long userId, Pageable pageable) {
        Page<Notification> page = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        List<NotificationDto> dtos = page.getContent().stream()
                .map(this::mapToDto)
                .toList();
        return PagedResponse.from(page, dtos);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification", "id", notificationId);
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadForUser(userId);
    }

    private NotificationDto mapToDto(Notification entity) {
        return new NotificationDto(
                entity.getId(),
                entity.getTitle(),
                entity.getMessage(),
                entity.getType(),
                entity.getReferenceId(),
                entity.getReferenceType(),
                entity.isRead(),
                entity.getCreatedAt()
        );
    }
}
