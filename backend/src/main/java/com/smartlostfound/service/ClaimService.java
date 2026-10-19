package com.smartlostfound.service;

import com.smartlostfound.dto.claim.ClaimCreateRequest;
import com.smartlostfound.dto.claim.ClaimResponse;
import com.smartlostfound.dto.claim.ClaimReviewRequest;
import com.smartlostfound.dto.common.PagedResponse;
import com.smartlostfound.entity.*;
import com.smartlostfound.exception.BadRequestException;
import com.smartlostfound.exception.ForbiddenException;
import com.smartlostfound.exception.InvalidStateTransitionException;
import com.smartlostfound.exception.ResourceNotFoundException;
import com.smartlostfound.repository.ClaimRepository;
import com.smartlostfound.repository.ItemReportRepository;
import com.smartlostfound.security.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final ItemReportRepository itemReportRepository;
    private final UserService userService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public ClaimService(
            ClaimRepository claimRepository,
            ItemReportRepository itemReportRepository,
            UserService userService,
            NotificationService notificationService,
            AuditLogService auditLogService) {
        this.claimRepository = claimRepository;
        this.itemReportRepository = itemReportRepository;
        this.userService = userService;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public ClaimResponse submitClaim(ClaimCreateRequest request, Long claimantId) {
        User claimant = userService.getUserEntity(claimantId);
        ItemReport item = itemReportRepository.findById(request.getItemReportId())
                .orElseThrow(() -> new ResourceNotFoundException("ItemReport", "id", request.getItemReportId()));

        // Cannot claim own reported item
        if (item.getUser().getId().equals(claimantId)) {
            throw new BadRequestException("You cannot submit an ownership claim on your own report");
        }

        // Must be open or claim pending
        if (item.getStatus() == ItemStatus.RESOLVED) {
            throw new InvalidStateTransitionException("This item has already been recovered and resolved");
        }
        if (item.getStatus() == ItemStatus.WITHDRAWN) {
            throw new InvalidStateTransitionException("This report has been withdrawn and is not accepting claims");
        }

        // Prevent duplicate active pending claim by same claimant
        boolean hasPendingClaim = claimRepository.existsByItemReportIdAndClaimantIdAndStatus(
                item.getId(), claimantId, ClaimStatus.PENDING
        );
        if (hasPendingClaim) {
            throw new BadRequestException("You already have an active pending claim on this item");
        }

        Claim claim = new Claim();
        claim.setItemReport(item);
        claim.setClaimant(claimant);
        claim.setProofDescription(request.getProofDescription().trim());
        claim.setSecretIdentifiers(request.getSecretIdentifiers() != null ? request.getSecretIdentifiers().trim() : null);
        claim.setContactPhone(request.getContactPhone() != null ? request.getContactPhone().trim() : claimant.getPhoneNumber());
        claim.setStatus(ClaimStatus.PENDING);

        // Update item status if it was OPEN
        if (item.getStatus() == ItemStatus.OPEN) {
            item.setStatus(ItemStatus.CLAIM_PENDING);
            itemReportRepository.save(item);
        }

        Claim savedClaim = claimRepository.save(claim);

        // Notify item reporter
        notificationService.createNotification(
                item.getUser(),
                "New Claim Submitted",
                claimant.getFullName() + " submitted an ownership claim on your report '" + item.getTitle() + "'.",
                NotificationType.CLAIM_SUBMITTED,
                savedClaim.getId(),
                "Claim"
        );

        auditLogService.record("CLAIM_SUBMITTED", "Claim", savedClaim.getId(), claimant.getEmail(),
                "Submitted claim for item report #" + item.getId() + " (" + item.getTitle() + ")");

        return mapToResponse(savedClaim, true);
    }

    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public ClaimResponse reviewClaim(Long claimId, ClaimReviewRequest request, Long reviewerId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim", "id", claimId));

        if (claim.getStatus() != ClaimStatus.PENDING) {
            throw new InvalidStateTransitionException("Claim is already " + claim.getStatus() + " and cannot be reviewed again");
        }

        ItemReport item = claim.getItemReport();
        User reviewer = userService.getUserEntity(reviewerId);

        // Reviewer MUST be the item poster or an administrator
        boolean isOwner = item.getUser().getId().equals(reviewerId);
        boolean isAdmin = SecurityUtils.isAdmin();
        if (!isOwner && !isAdmin) {
            throw new ForbiddenException("Only the item poster or a platform administrator can review claims");
        }

        if (Boolean.TRUE.equals(request.getApproved())) {
            // Guard against concurrent resolution
            if (item.getStatus() == ItemStatus.RESOLVED) {
                throw new InvalidStateTransitionException("This item has already been resolved by another claim");
            }

            claim.setStatus(ClaimStatus.APPROVED);
            claim.setReviewer(reviewer);
            claim.setReviewerNotes(request.getReviewerNotes());
            claim.setResolvedAt(LocalDateTime.now());
            claimRepository.save(claim);

            // Mark item as RESOLVED
            item.setStatus(ItemStatus.RESOLVED);
            itemReportRepository.save(item);

            // Reject any other remaining pending claims on this item
            List<Claim> otherPendingClaims = claimRepository.findByItemReportIdAndStatus(item.getId(), ClaimStatus.PENDING);
            for (Claim other : otherPendingClaims) {
                if (!other.getId().equals(claim.getId())) {
                    other.setStatus(ClaimStatus.REJECTED);
                    other.setReviewer(reviewer);
                    other.setReviewerNotes("Automatically closed: Another verified claim was approved.");
                    other.setResolvedAt(LocalDateTime.now());
                    claimRepository.save(other);

                    notificationService.createNotification(
                            other.getClaimant(),
                            "Claim Closed",
                            "The item '" + item.getTitle() + "' was claimed and resolved by another verified owner.",
                            NotificationType.CLAIM_STATUS_UPDATE,
                            other.getId(),
                            "Claim"
                    );
                }
            }

            // Notify approved claimant
            notificationService.createNotification(
                    claim.getClaimant(),
                    "Claim Approved! 🎉",
                    "Your claim for '" + item.getTitle() + "' was approved by " + reviewer.getFullName() +
                            ". Please coordinate handoff.",
                    NotificationType.CLAIM_STATUS_UPDATE,
                    claim.getId(),
                    "Claim"
            );

            // Notify item owner if admin performed the approval
            if (isAdmin && !isOwner) {
                notificationService.createNotification(
                        item.getUser(),
                        "Claim Approved by Admin",
                        "An administrator approved a recovery claim on your report '" + item.getTitle() + "'.",
                        NotificationType.ITEM_RESOLVED,
                        item.getId(),
                        "ItemReport"
                );
            }

            auditLogService.record("CLAIM_APPROVED", "Claim", claim.getId(), reviewer.getEmail(),
                    "Approved claim #" + claim.getId() + " on item #" + item.getId() + " (" + item.getTitle() + ")");

        } else {
            // Rejection flow
            claim.setStatus(ClaimStatus.REJECTED);
            claim.setReviewer(reviewer);
            claim.setReviewerNotes(request.getReviewerNotes());
            claim.setResolvedAt(LocalDateTime.now());
            claimRepository.save(claim);

            // If no other pending claims remain on this item, reset item status back to OPEN
            List<Claim> remainingPending = claimRepository.findByItemReportIdAndStatus(item.getId(), ClaimStatus.PENDING);
            if (remainingPending.isEmpty() && item.getStatus() == ItemStatus.CLAIM_PENDING) {
                item.setStatus(ItemStatus.OPEN);
                itemReportRepository.save(item);
            }

            // Notify claimant of rejection
            notificationService.createNotification(
                    claim.getClaimant(),
                    "Claim Status Update",
                    "Your claim for '" + item.getTitle() + "' was rejected. Reason: " +
                            (request.getReviewerNotes() != null ? request.getReviewerNotes() : "Verification criteria not met."),
                    NotificationType.CLAIM_STATUS_UPDATE,
                    claim.getId(),
                    "Claim"
            );

            auditLogService.record("CLAIM_REJECTED", "Claim", claim.getId(), reviewer.getEmail(),
                    "Rejected claim #" + claim.getId() + " on item #" + item.getId() + ". Notes: " + request.getReviewerNotes());
        }

        return mapToResponse(claim, true);
    }

    @Transactional
    public void withdrawClaim(Long claimId, Long claimantId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim", "id", claimId));

        if (!claim.getClaimant().getId().equals(claimantId) && !SecurityUtils.isAdmin()) {
            throw new ForbiddenException("You can only withdraw your own claims");
        }

        if (claim.getStatus() != ClaimStatus.PENDING) {
            throw new InvalidStateTransitionException("Cannot withdraw a claim that is already " + claim.getStatus());
        }

        claim.setStatus(ClaimStatus.WITHDRAWN);
        claimRepository.save(claim);

        // Check if item status should return to OPEN
        ItemReport item = claim.getItemReport();
        List<Claim> remainingPending = claimRepository.findByItemReportIdAndStatus(item.getId(), ClaimStatus.PENDING);
        if (remainingPending.isEmpty() && item.getStatus() == ItemStatus.CLAIM_PENDING) {
            item.setStatus(ItemStatus.OPEN);
            itemReportRepository.save(item);
        }

        auditLogService.record("CLAIM_WITHDRAWN", "Claim", claim.getId(),
                claim.getClaimant().getEmail(), "Claim withdrawn by user");
    }

    @Transactional(readOnly = true)
    public ClaimResponse getClaimById(Long claimId, Long currentUserId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim", "id", claimId));

        boolean isClaimant = claim.getClaimant().getId().equals(currentUserId);
        boolean isItemOwner = claim.getItemReport().getUser().getId().equals(currentUserId);
        boolean isAdmin = SecurityUtils.isAdmin();

        if (!isClaimant && !isItemOwner && !isAdmin) {
            throw new ForbiddenException("You are not authorized to view this claim");
        }

        return mapToResponse(claim, true);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ClaimResponse> getMySubmittedClaims(Long claimantId, Pageable pageable) {
        Page<Claim> page = claimRepository.findByClaimantId(claimantId, pageable);
        List<ClaimResponse> dtos = page.getContent().stream()
                .map(c -> mapToResponse(c, true))
                .toList();
        return PagedResponse.from(page, dtos);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ClaimResponse> getClaimsOnMyItems(Long ownerId, Pageable pageable) {
        Page<Claim> page = claimRepository.findByItemReportUserId(ownerId, pageable);
        List<ClaimResponse> dtos = page.getContent().stream()
                .map(c -> mapToResponse(c, true))
                .toList();
        return PagedResponse.from(page, dtos);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ClaimResponse> getClaimsForItem(Long itemId, Long currentUserId, Pageable pageable) {
        ItemReport item = itemReportRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("ItemReport", "id", itemId));

        if (!item.getUser().getId().equals(currentUserId) && !SecurityUtils.isAdmin()) {
            throw new ForbiddenException("Only the item poster or an admin can view claims on this item");
        }

        Page<Claim> page = claimRepository.findByItemReportId(itemId, pageable);
        List<ClaimResponse> dtos = page.getContent().stream()
                .map(c -> mapToResponse(c, true))
                .toList();
        return PagedResponse.from(page, dtos);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ClaimResponse> getAllClaimsAdmin(Pageable pageable) {
        Page<Claim> page = claimRepository.findAll(pageable);
        List<ClaimResponse> dtos = page.getContent().stream()
                .map(c -> mapToResponse(c, true))
                .toList();
        return PagedResponse.from(page, dtos);
    }

    public ClaimResponse mapToResponse(Claim claim, boolean showPrivateDetails) {
        ClaimResponse response = new ClaimResponse();
        response.setId(claim.getId());
        if (claim.getItemReport() != null) {
            response.setItemReportId(claim.getItemReport().getId());
            response.setItemTitle(claim.getItemReport().getTitle());
            response.setItemType(claim.getItemReport().getType());
        }
        if (claim.getClaimant() != null) {
            response.setClaimantId(claim.getClaimant().getId());
            response.setClaimantName(claim.getClaimant().getFullName());
        }
        response.setProofDescription(claim.getProofDescription());
        if (showPrivateDetails) {
            response.setSecretIdentifiers(claim.getSecretIdentifiers());
            response.setContactPhone(claim.getContactPhone());
        }
        response.setStatus(claim.getStatus());
        if (claim.getReviewer() != null) {
            response.setReviewerId(claim.getReviewer().getId());
            response.setReviewerName(claim.getReviewer().getFullName());
        }
        response.setReviewerNotes(claim.getReviewerNotes());
        response.setResolvedAt(claim.getResolvedAt());
        response.setCreatedAt(claim.getCreatedAt());
        response.setUpdatedAt(claim.getUpdatedAt());
        return response;
    }
}
