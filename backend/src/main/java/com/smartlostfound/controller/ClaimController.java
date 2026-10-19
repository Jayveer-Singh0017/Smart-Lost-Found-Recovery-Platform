package com.smartlostfound.controller;

import com.smartlostfound.dto.claim.ClaimCreateRequest;
import com.smartlostfound.dto.claim.ClaimResponse;
import com.smartlostfound.dto.claim.ClaimReviewRequest;
import com.smartlostfound.dto.common.ApiResponse;
import com.smartlostfound.dto.common.PagedResponse;
import com.smartlostfound.security.SecurityUtils;
import com.smartlostfound.security.UserPrincipal;
import com.smartlostfound.service.ClaimService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/claims")
@Tag(name = "Claims", description = "Endpoints for submitting, reviewing, approving, rejecting, and tracking recovery claims")
public class ClaimController {

    private final ClaimService claimService;

    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @PostMapping
    @Operation(summary = "Submit an ownership claim on a found item")
    public ResponseEntity<ApiResponse<ClaimResponse>> submitClaim(@Valid @RequestBody ClaimCreateRequest request) {
        UserPrincipal principal = SecurityUtils.getRequiredCurrentUserPrincipal();
        ClaimResponse response = claimService.submitClaim(request, principal.getId());
        return new ResponseEntity<>(ApiResponse.success("Claim submitted successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get claim details (claimant, item reporter, or admin)")
    public ResponseEntity<ApiResponse<ClaimResponse>> getClaimById(@PathVariable Long id) {
        UserPrincipal principal = SecurityUtils.getRequiredCurrentUserPrincipal();
        ClaimResponse response = claimService.getClaimById(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{id}/review")
    @Operation(summary = "Approve or reject a claim (item owner or admin)")
    public ResponseEntity<ApiResponse<ClaimResponse>> reviewClaim(
            @PathVariable Long id,
            @Valid @RequestBody ClaimReviewRequest request) {
        UserPrincipal principal = SecurityUtils.getRequiredCurrentUserPrincipal();
        ClaimResponse response = claimService.reviewClaim(id, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Claim review processed successfully", response));
    }

    @PostMapping("/{id}/withdraw")
    @Operation(summary = "Withdraw a submitted claim")
    public ResponseEntity<ApiResponse<Void>> withdrawClaim(@PathVariable Long id) {
        UserPrincipal principal = SecurityUtils.getRequiredCurrentUserPrincipal();
        claimService.withdrawClaim(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Claim withdrawn successfully", null));
    }

    @GetMapping("/my-claims")
    @Operation(summary = "Get claims submitted by the current user")
    public ResponseEntity<ApiResponse<PagedResponse<ClaimResponse>>> getMySubmittedClaims(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UserPrincipal principal = SecurityUtils.getRequiredCurrentUserPrincipal();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PagedResponse<ClaimResponse> response = claimService.getMySubmittedClaims(principal.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/on-my-items")
    @Operation(summary = "Get claims submitted on items reported by current user")
    public ResponseEntity<ApiResponse<PagedResponse<ClaimResponse>>> getClaimsOnMyItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UserPrincipal principal = SecurityUtils.getRequiredCurrentUserPrincipal();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PagedResponse<ClaimResponse> response = claimService.getClaimsOnMyItems(principal.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/item/{itemId}")
    @Operation(summary = "Get all claims submitted on a specific item (reporter or admin)")
    public ResponseEntity<ApiResponse<PagedResponse<ClaimResponse>>> getClaimsForItem(
            @PathVariable Long itemId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UserPrincipal principal = SecurityUtils.getRequiredCurrentUserPrincipal();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PagedResponse<ClaimResponse> response = claimService.getClaimsForItem(itemId, principal.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
