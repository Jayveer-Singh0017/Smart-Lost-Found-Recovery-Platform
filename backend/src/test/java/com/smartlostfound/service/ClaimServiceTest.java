package com.smartlostfound.service;

import com.smartlostfound.dto.claim.ClaimCreateRequest;
import com.smartlostfound.dto.claim.ClaimResponse;
import com.smartlostfound.dto.claim.ClaimReviewRequest;
import com.smartlostfound.entity.*;
import com.smartlostfound.exception.BadRequestException;
import com.smartlostfound.exception.ForbiddenException;
import com.smartlostfound.exception.InvalidStateTransitionException;
import com.smartlostfound.repository.ClaimRepository;
import com.smartlostfound.repository.ItemReportRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClaimServiceTest {

    @Mock
    private ClaimRepository claimRepository;

    @Mock
    private ItemReportRepository itemReportRepository;

    @Mock
    private UserService userService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private AuditLogService auditLogService;

    private ClaimService claimService;

    private User owner;
    private User claimant;
    private User intruder;
    private ItemReport item;

    @BeforeEach
    void setUp() {
        claimService = new ClaimService(
                claimRepository,
                itemReportRepository,
                userService,
                notificationService,
                auditLogService
        );

        owner = new User("owner@example.com", "pass", "Item Owner", "111", "ROLE_USER");
        owner.setId(1L);

        claimant = new User("claimant@example.com", "pass", "Claimant User", "222", "ROLE_USER");
        claimant.setId(2L);

        intruder = new User("intruder@example.com", "pass", "Intruder User", "333", "ROLE_USER");
        intruder.setId(3L);

        item = new ItemReport();
        item.setId(10L);
        item.setTitle("Found Gold Watch");
        item.setType(ItemType.FOUND);
        item.setUser(owner);
        item.setStatus(ItemStatus.OPEN);
        item.setModerationStatus(ModerationStatus.APPROVED);
    }

    @Test
    @DisplayName("Should submit claim and transition item status to CLAIM_PENDING")
    void testSubmitClaimSuccess() {
        ClaimCreateRequest request = new ClaimCreateRequest(
                10L, "I lost my watch yesterday at the gym", "Serial #987654", "222"
        );

        when(userService.getUserEntity(2L)).thenReturn(claimant);
        when(itemReportRepository.findById(10L)).thenReturn(Optional.of(item));
        when(claimRepository.existsByItemReportIdAndClaimantIdAndStatus(10L, 2L, ClaimStatus.PENDING)).thenReturn(false);
        when(claimRepository.save(any(Claim.class))).thenAnswer(i -> {
            Claim c = i.getArgument(0);
            c.setId(100L);
            return c;
        });

        ClaimResponse response = claimService.submitClaim(request, 2L);

        assertNotNull(response);
        assertEquals(ClaimStatus.PENDING, response.getStatus());
        assertEquals(ItemStatus.CLAIM_PENDING, item.getStatus(), "Item status should transition to CLAIM_PENDING");
        verify(itemReportRepository).save(item);
        verify(notificationService).createNotification(eq(owner), anyString(), anyString(), eq(NotificationType.CLAIM_SUBMITTED), anyLong(), anyString());
    }

    @Test
    @DisplayName("Should prevent user from claiming their own reported item")
    void testCannotClaimOwnReport() {
        ClaimCreateRequest request = new ClaimCreateRequest(10L, "My item", null, null);

        when(userService.getUserEntity(1L)).thenReturn(owner);
        when(itemReportRepository.findById(10L)).thenReturn(Optional.of(item));

        assertThrows(BadRequestException.class, () -> claimService.submitClaim(request, 1L));
    }

    @Test
    @DisplayName("Should prevent duplicate pending claims on same item by same claimant")
    void testPreventDuplicatePendingClaims() {
        ClaimCreateRequest request = new ClaimCreateRequest(10L, "My item", null, null);

        when(userService.getUserEntity(2L)).thenReturn(claimant);
        when(itemReportRepository.findById(10L)).thenReturn(Optional.of(item));
        when(claimRepository.existsByItemReportIdAndClaimantIdAndStatus(10L, 2L, ClaimStatus.PENDING)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> claimService.submitClaim(request, 2L));
    }

    @Test
    @DisplayName("Should approve claim, resolve item, and reject other pending claims")
    void testApproveClaimSuccess() {
        Claim targetClaim = new Claim();
        targetClaim.setId(100L);
        targetClaim.setItemReport(item);
        targetClaim.setClaimant(claimant);
        targetClaim.setStatus(ClaimStatus.PENDING);

        User secondClaimant = new User("other@example.com", "pass", "Other Claimant", "999", "ROLE_USER");
        secondClaimant.setId(4L);

        Claim otherClaim = new Claim();
        otherClaim.setId(101L);
        otherClaim.setItemReport(item);
        otherClaim.setClaimant(secondClaimant);
        otherClaim.setStatus(ClaimStatus.PENDING);

        when(claimRepository.findById(100L)).thenReturn(Optional.of(targetClaim));
        when(userService.getUserEntity(1L)).thenReturn(owner);
        when(claimRepository.findByItemReportIdAndStatus(10L, ClaimStatus.PENDING))
                .thenReturn(List.of(targetClaim, otherClaim));

        ClaimReviewRequest reviewRequest = new ClaimReviewRequest(true, "Serial number matched perfectly");
        ClaimResponse response = claimService.reviewClaim(100L, reviewRequest, 1L);

        assertEquals(ClaimStatus.APPROVED, response.getStatus());
        assertEquals(ItemStatus.RESOLVED, item.getStatus(), "Item must become RESOLVED upon approval");
        assertEquals(ClaimStatus.REJECTED, otherClaim.getStatus(), "Competing pending claims must be REJECTED");
        verify(itemReportRepository).save(item);
    }

    @Test
    @DisplayName("Should reject unauthorized reviewer")
    void testRejectUnauthorizedReviewer() {
        Claim claim = new Claim();
        claim.setId(100L);
        claim.setItemReport(item);
        claim.setClaimant(claimant);
        claim.setStatus(ClaimStatus.PENDING);

        when(claimRepository.findById(100L)).thenReturn(Optional.of(claim));
        when(userService.getUserEntity(3L)).thenReturn(intruder);

        ClaimReviewRequest reviewRequest = new ClaimReviewRequest(true, "Approved");

        assertThrows(ForbiddenException.class, () -> claimService.reviewClaim(100L, reviewRequest, 3L));
    }

    @Test
    @DisplayName("Should return item to OPEN when rejecting sole pending claim")
    void testRejectSoleClaimResetsItemStatus() {
        item.setStatus(ItemStatus.CLAIM_PENDING);

        Claim claim = new Claim();
        claim.setId(100L);
        claim.setItemReport(item);
        claim.setClaimant(claimant);
        claim.setStatus(ClaimStatus.PENDING);

        when(claimRepository.findById(100L)).thenReturn(Optional.of(claim));
        when(userService.getUserEntity(1L)).thenReturn(owner);
        when(claimRepository.findByItemReportIdAndStatus(10L, ClaimStatus.PENDING)).thenReturn(Collections.emptyList());

        ClaimReviewRequest reviewRequest = new ClaimReviewRequest(false, "Serial number did not match");
        ClaimResponse response = claimService.reviewClaim(100L, reviewRequest, 1L);

        assertEquals(ClaimStatus.REJECTED, response.getStatus());
        assertEquals(ItemStatus.OPEN, item.getStatus(), "Item status should reset to OPEN when no pending claims remain");
        verify(itemReportRepository).save(item);
    }
}
