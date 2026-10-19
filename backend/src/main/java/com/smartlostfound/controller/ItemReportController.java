package com.smartlostfound.controller;

import com.smartlostfound.dto.common.ApiResponse;
import com.smartlostfound.dto.common.PagedResponse;
import com.smartlostfound.dto.item.*;
import com.smartlostfound.entity.ItemStatus;
import com.smartlostfound.entity.ItemType;
import com.smartlostfound.entity.ModerationStatus;
import com.smartlostfound.security.SecurityUtils;
import com.smartlostfound.security.UserPrincipal;
import com.smartlostfound.service.FileStorageService;
import com.smartlostfound.service.ItemReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/items")
@Tag(name = "Item Reports", description = "Endpoints for creating, managing, searching, and moderating lost and found listings")
public class ItemReportController {

    private final ItemReportService itemReportService;
    private final FileStorageService fileStorageService;

    public ItemReportController(ItemReportService itemReportService, FileStorageService fileStorageService) {
        this.itemReportService = itemReportService;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping
    @Operation(summary = "Create a new lost or found report")
    public ResponseEntity<ApiResponse<ItemReportResponse>> createReport(
            @Valid @RequestBody ItemReportCreateRequest request) {
        UserPrincipal principal = SecurityUtils.getRequiredCurrentUserPrincipal();
        ItemReportResponse response = itemReportService.createReport(request, principal.getId());
        return new ResponseEntity<>(ApiResponse.success("Report submitted successfully", response), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing report (reporter or admin only)")
    public ResponseEntity<ApiResponse<ItemReportResponse>> updateReport(
            @PathVariable Long id,
            @Valid @RequestBody ItemReportUpdateRequest request) {
        UserPrincipal principal = SecurityUtils.getRequiredCurrentUserPrincipal();
        ItemReportResponse response = itemReportService.updateReport(id, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Report updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Withdraw a report")
    public ResponseEntity<ApiResponse<Void>> withdrawReport(@PathVariable Long id) {
        UserPrincipal principal = SecurityUtils.getRequiredCurrentUserPrincipal();
        itemReportService.withdrawReport(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Report withdrawn successfully", null));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get report details by ID")
    public ResponseEntity<ApiResponse<ItemReportResponse>> getReportById(@PathVariable Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        ItemReportResponse response = itemReportService.getReportById(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/search")
    @Operation(summary = "Public search and filter for items with pagination")
    public ResponseEntity<ApiResponse<PagedResponse<ItemSummaryResponse>>> searchReports(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ItemType type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) ItemStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        ItemSearchCriteria criteria = new ItemSearchCriteria();
        criteria.setKeyword(keyword);
        criteria.setType(type);
        criteria.setCategoryId(categoryId);
        criteria.setCity(city);
        criteria.setStatus(status);
        criteria.setStartDate(startDate);
        criteria.setEndDate(endDate);

        Sort.Direction sortDir = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDir, sortBy));

        PagedResponse<ItemSummaryResponse> results = itemReportService.searchReports(criteria, pageable);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @GetMapping("/my")
    @Operation(summary = "Get reports created by the current user")
    public ResponseEntity<ApiResponse<PagedResponse<ItemSummaryResponse>>> getMyReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UserPrincipal principal = SecurityUtils.getRequiredCurrentUserPrincipal();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PagedResponse<ItemSummaryResponse> response = itemReportService.getUserReports(principal.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/recent")
    @Operation(summary = "Get recent items for public homepage showcase")
    public ResponseEntity<ApiResponse<List<ItemSummaryResponse>>> getRecentItems() {
        List<ItemSummaryResponse> items = itemReportService.getRecentShowcaseItems();
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload and attach an image to a report")
    public ResponseEntity<ApiResponse<ItemImageDto>> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        UserPrincipal principal = SecurityUtils.getRequiredCurrentUserPrincipal();
        ItemImageDto imageDto = itemReportService.addImageToReport(id, file, principal.getId());
        return new ResponseEntity<>(ApiResponse.success("Image uploaded successfully", imageDto), HttpStatus.CREATED);
    }

    @GetMapping("/images/{filename:.+}")
    @Operation(summary = "Serve an uploaded image file")
    public ResponseEntity<Resource> serveImage(@PathVariable String filename) {
        Resource file = fileStorageService.loadFileAsResource(filename);
        String contentType = "image/jpeg";
        if (filename.toLowerCase().endsWith(".png")) contentType = "image/png";
        else if (filename.toLowerCase().endsWith(".webp")) contentType = "image/webp";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFilename() + "\"")
                .body(file);
    }

    @DeleteMapping("/{id}/images/{imageId}")
    @Operation(summary = "Delete an image from an item report")
    public ResponseEntity<ApiResponse<Void>> deleteImage(
            @PathVariable Long id,
            @PathVariable Long imageId) {
        UserPrincipal principal = SecurityUtils.getRequiredCurrentUserPrincipal();
        itemReportService.deleteImageFromReport(id, imageId, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Image deleted successfully", null));
    }

    @PostMapping("/{id}/flag")
    @Operation(summary = "Report an item listing as suspicious or spam")
    public ResponseEntity<ApiResponse<Void>> flagReport(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        UserPrincipal principal = SecurityUtils.getRequiredCurrentUserPrincipal();
        String reason = body.getOrDefault("reason", "Suspicious content");
        String details = body.getOrDefault("details", "");
        itemReportService.flagReport(id, reason, details, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Report flagged for moderation review", null));
    }
}
