package com.smartlostfound.service;

import com.smartlostfound.dto.common.PagedResponse;
import com.smartlostfound.dto.item.*;
import com.smartlostfound.dto.matching.MatchResultDto;
import com.smartlostfound.entity.*;
import com.smartlostfound.exception.BadRequestException;
import com.smartlostfound.exception.ForbiddenException;
import com.smartlostfound.exception.ResourceNotFoundException;
import com.smartlostfound.repository.ItemImageRepository;
import com.smartlostfound.repository.ItemReportRepository;
import com.smartlostfound.repository.ModerationReportRepository;
import com.smartlostfound.security.SecurityUtils;
import jakarta.persistence.criteria.Predicate;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
public class ItemReportService {

    private final ItemReportRepository itemReportRepository;
    private final ItemImageRepository itemImageRepository;
    private final ModerationReportRepository moderationReportRepository;
    private final CategoryService categoryService;
    private final UserService userService;
    private final FileStorageService fileStorageService;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final MatchingService matchingService;

    public ItemReportService(
            ItemReportRepository itemReportRepository,
            ItemImageRepository itemImageRepository,
            ModerationReportRepository moderationReportRepository,
            CategoryService categoryService,
            UserService userService,
            FileStorageService fileStorageService,
            AuditLogService auditLogService,
            NotificationService notificationService,
            @Lazy MatchingService matchingService) {
        this.itemReportRepository = itemReportRepository;
        this.itemImageRepository = itemImageRepository;
        this.moderationReportRepository = moderationReportRepository;
        this.categoryService = categoryService;
        this.userService = userService;
        this.fileStorageService = fileStorageService;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
        this.matchingService = matchingService;
    }

    @Transactional
    public ItemReportResponse createReport(ItemReportCreateRequest request, Long userId) {
        User user = userService.getUserEntity(userId);
        Category category = categoryService.getCategoryEntity(request.getCategoryId());

        ItemReport report = new ItemReport();
        report.setTitle(request.getTitle().trim());
        report.setType(request.getType());
        report.setCategory(category);
        report.setUser(user);
        report.setDescription(request.getDescription().trim());
        report.setDistinguishingCharacteristics(request.getDistinguishingCharacteristics());
        report.setCity(request.getCity().trim());
        report.setLocationAddress(request.getLocationAddress().trim());
        report.setIncidentDate(request.getIncidentDate());
        report.setStatus(ItemStatus.OPEN);
        report.setModerationStatus(ModerationStatus.APPROVED);

        // Fall back to user's registered contact if not provided
        report.setContactEmail(request.getContactEmail() != null && !request.getContactEmail().isBlank()
                ? request.getContactEmail().trim() : user.getEmail());
        report.setContactPhone(request.getContactPhone() != null && !request.getContactPhone().isBlank()
                ? request.getContactPhone().trim() : user.getPhoneNumber());

        ItemReport saved = itemReportRepository.save(report);

        auditLogService.record("ITEM_CREATED", "ItemReport", saved.getId(), user.getEmail(),
                "Created " + saved.getType() + " report: " + saved.getTitle());

        // Check for potential matches and alert the user
        try {
            List<MatchResultDto> potentialMatches = matchingService.findMatchesForItem(saved.getId());
            if (!potentialMatches.isEmpty()) {
                MatchResultDto topMatch = potentialMatches.get(0);
                if (topMatch.getScore() >= 60) {
                    notificationService.createNotification(
                            user,
                            "High Probability Match Detected!",
                            "Your report '" + saved.getTitle() + "' matched with '" +
                                    topMatch.getMatchedItem().getTitle() + "' (" + topMatch.getScore() + "% confidence).",
                            NotificationType.POTENTIAL_MATCH,
                            topMatch.getMatchedItem().getId(),
                            "ItemReport"
                    );
                }
            }
        } catch (Exception e) {
            // Non-blocking matching notification error
        }

        return mapToResponse(saved, true);
    }

    @Transactional
    public ItemReportResponse updateReport(Long id, ItemReportUpdateRequest request, Long userId) {
        ItemReport report = getItemReportEntity(id);

        boolean isOwner = (userId != null && userId.equals(report.getUser().getId())) || SecurityUtils.isCurrentUserOrAdmin(report.getUser().getId());
        if (!isOwner) {
            throw new ForbiddenException("You do not have permission to modify this report");
        }

        if (report.getStatus() == ItemStatus.RESOLVED || report.getStatus() == ItemStatus.WITHDRAWN) {
            throw new BadRequestException("Cannot edit report that is already " + report.getStatus());
        }

        Category category = categoryService.getCategoryEntity(request.getCategoryId());
        report.setTitle(request.getTitle().trim());
        report.setCategory(category);
        report.setDescription(request.getDescription().trim());
        report.setDistinguishingCharacteristics(request.getDistinguishingCharacteristics());
        report.setCity(request.getCity().trim());
        report.setLocationAddress(request.getLocationAddress().trim());
        report.setIncidentDate(request.getIncidentDate());
        if (request.getContactEmail() != null) report.setContactEmail(request.getContactEmail().trim());
        if (request.getContactPhone() != null) report.setContactPhone(request.getContactPhone().trim());

        ItemReport updated = itemReportRepository.save(report);

        auditLogService.record("ITEM_UPDATED", "ItemReport", updated.getId(),
                report.getUser().getEmail(), "Updated report: " + updated.getTitle());

        return mapToResponse(updated, true);
    }

    @Transactional
    public void withdrawReport(Long id, Long userId) {
        ItemReport report = getItemReportEntity(id);

        boolean isOwner = (userId != null && userId.equals(report.getUser().getId())) || SecurityUtils.isCurrentUserOrAdmin(report.getUser().getId());
        if (!isOwner) {
            throw new ForbiddenException("You do not have permission to withdraw this report");
        }

        if (report.getStatus() == ItemStatus.RESOLVED) {
            throw new BadRequestException("Cannot withdraw a report that has already been resolved");
        }

        report.setStatus(ItemStatus.WITHDRAWN);
        itemReportRepository.save(report);

        auditLogService.record("ITEM_WITHDRAWN", "ItemReport", report.getId(),
                report.getUser().getEmail(), "Report marked as withdrawn");
    }

    @Transactional(readOnly = true)
    public ItemReportResponse getReportById(Long id, Long currentUserId) {
        ItemReport report = getItemReportEntity(id);
        boolean isOwner = currentUserId != null && SecurityUtils.isCurrentUserOrAdmin(report.getUser().getId());
        return mapToResponse(report, isOwner);
    }

    @Transactional(readOnly = true)
    public ItemReport getItemReportEntity(Long id) {
        return itemReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ItemReport", "id", id));
    }

    @Transactional(readOnly = true)
    public PagedResponse<ItemSummaryResponse> searchReports(ItemSearchCriteria criteria, Pageable pageable) {
        Specification<ItemReport> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // By default, only show approved moderation items
            if (criteria.getModerationStatus() != null) {
                predicates.add(cb.equal(root.get("moderationStatus"), criteria.getModerationStatus()));
            } else {
                predicates.add(cb.equal(root.get("moderationStatus"), ModerationStatus.APPROVED));
            }

            // Status filter (defaults to active items: OPEN or CLAIM_PENDING unless specified)
            if (criteria.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), criteria.getStatus()));
            } else {
                predicates.add(root.get("status").in(ItemStatus.OPEN, ItemStatus.CLAIM_PENDING));
            }

            // Type filter (LOST or FOUND)
            if (criteria.getType() != null) {
                predicates.add(cb.equal(root.get("type"), criteria.getType()));
            }

            // Category filter
            if (criteria.getCategoryId() != null) {
                predicates.add(cb.equal(root.get("category").get("id"), criteria.getCategoryId()));
            }

            // City filter
            if (criteria.getCity() != null && !criteria.getCity().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("city")), "%" + criteria.getCity().trim().toLowerCase() + "%"));
            }

            // Date range filter
            if (criteria.getStartDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("incidentDate"), criteria.getStartDate()));
            }
            if (criteria.getEndDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("incidentDate"), criteria.getEndDate()));
            }

            // Text search keyword (matches title, description, or distinguishing characteristics)
            if (criteria.getKeyword() != null && !criteria.getKeyword().isBlank()) {
                String pattern = "%" + criteria.getKeyword().trim().toLowerCase() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), pattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), pattern);
                Predicate charMatch = cb.like(cb.lower(root.get("distinguishingCharacteristics")), pattern);
                predicates.add(cb.or(titleMatch, descMatch, charMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<ItemReport> page = itemReportRepository.findAll(spec, pageable);
        List<ItemSummaryResponse> dtos = page.getContent().stream()
                .map(this::mapToSummary)
                .toList();

        return PagedResponse.from(page, dtos);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ItemSummaryResponse> getUserReports(Long userId, Pageable pageable) {
        Page<ItemReport> page = itemReportRepository.findByUserId(userId, pageable);
        List<ItemSummaryResponse> dtos = page.getContent().stream()
                .map(this::mapToSummary)
                .toList();
        return PagedResponse.from(page, dtos);
    }

    @Transactional
    public ItemImageDto addImageToReport(Long reportId, MultipartFile file, Long userId) {
        ItemReport report = getItemReportEntity(reportId);

        boolean isOwner = (userId != null && userId.equals(report.getUser().getId())) || SecurityUtils.isCurrentUserOrAdmin(report.getUser().getId());
        if (!isOwner) {
            throw new ForbiddenException("You cannot upload images to another user's report");
        }

        String storageFileName = fileStorageService.storeFile(file);
        String imageUrl = "/api/v1/items/images/" + storageFileName;

        ItemImage image = new ItemImage(
                imageUrl,
                file.getOriginalFilename(),
                storageFileName,
                file.getSize(),
                file.getContentType()
        );

        report.addImage(image);
        ItemImage savedImage = itemImageRepository.save(image);
        itemReportRepository.save(report);

        return new ItemImageDto(
                savedImage.getId(),
                savedImage.getImageUrl(),
                savedImage.getOriginalFileName(),
                savedImage.getFileSizeBytes()
        );
    }

    @Transactional
    public void deleteImageFromReport(Long reportId, Long imageId, Long userId) {
        ItemReport report = getItemReportEntity(reportId);

        boolean isOwner = (userId != null && userId.equals(report.getUser().getId())) || SecurityUtils.isCurrentUserOrAdmin(report.getUser().getId());
        if (!isOwner) {
            throw new ForbiddenException("You cannot delete images from another user's report");
        }

        ItemImage image = itemImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("ItemImage", "id", imageId));

        if (!image.getItemReport().getId().equals(report.getId())) {
            throw new BadRequestException("Image does not belong to this report");
        }

        report.getImages().remove(image);
        itemImageRepository.delete(image);
        fileStorageService.deleteFile(image.getStorageFileName());

        auditLogService.record("ITEM_IMAGE_DELETED", "ItemReport", reportId,
                report.getUser().getEmail(), "Deleted image #" + imageId + " from report #" + reportId);
    }

    @Transactional
    public void flagReport(Long reportId, String reason, String details, Long reporterId) {
        ItemReport report = getItemReportEntity(reportId);
        User reporter = userService.getUserEntity(reporterId);

        ModerationReport mod = new ModerationReport(report, reporter, reason, details);
        moderationReportRepository.save(mod);

        auditLogService.record("ITEM_FLAGGED", "ItemReport", reportId, reporter.getEmail(),
                "Listing flagged as suspicious: " + reason);
    }

    @Transactional(readOnly = true)
    public List<ItemSummaryResponse> getRecentShowcaseItems() {
        return itemReportRepository.findTop8ByModerationStatusAndStatusOrderByCreatedAtDesc(
                ModerationStatus.APPROVED, ItemStatus.OPEN
        ).stream().map(this::mapToSummary).toList();
    }

    public ItemSummaryResponse mapToSummary(ItemReport item) {
        String primaryImage = (item.getImages() != null && !item.getImages().isEmpty())
                ? item.getImages().get(0).getImageUrl()
                : null;

        return new ItemSummaryResponse(
                item.getId(),
                item.getTitle(),
                item.getType(),
                item.getCategory() != null ? item.getCategory().getId() : null,
                item.getCategory() != null ? item.getCategory().getName() : null,
                item.getCategory() != null ? item.getCategory().getIcon() : null,
                item.getCity(),
                item.getLocationAddress(),
                item.getIncidentDate(),
                item.getStatus(),
                primaryImage,
                item.getCreatedAt()
        );
    }

    public ItemReportResponse mapToResponse(ItemReport item, boolean isAuthorizedViewer) {
        ItemReportResponse response = new ItemReportResponse();
        response.setId(item.getId());
        response.setTitle(item.getTitle());
        response.setType(item.getType());
        if (item.getCategory() != null) {
            response.setCategoryId(item.getCategory().getId());
            response.setCategoryName(item.getCategory().getName());
            response.setCategoryIcon(item.getCategory().getIcon());
        }
        if (item.getUser() != null) {
            response.setUserId(item.getUser().getId());
            response.setReporterName(item.getUser().getFullName());
        }
        response.setDescription(item.getDescription());
        response.setDistinguishingCharacteristics(item.getDistinguishingCharacteristics());
        response.setCity(item.getCity());
        response.setLocationAddress(item.getLocationAddress());
        response.setIncidentDate(item.getIncidentDate());
        response.setStatus(item.getStatus());
        response.setModerationStatus(item.getModerationStatus());
        response.setOwner(isAuthorizedViewer);

        // Privacy protection: only reveal direct email/phone to the owner, admin, or in approved recovery
        if (isAuthorizedViewer) {
            response.setContactEmail(item.getContactEmail());
            response.setContactPhone(item.getContactPhone());
        }

        if (item.getImages() != null) {
            List<ItemImageDto> imageDtos = item.getImages().stream()
                    .map(img -> new ItemImageDto(img.getId(), img.getImageUrl(), img.getOriginalFileName(), img.getFileSizeBytes()))
                    .toList();
            response.setImages(imageDtos);
        }

        response.setCreatedAt(item.getCreatedAt());
        response.setUpdatedAt(item.getUpdatedAt());
        return response;
    }
}
