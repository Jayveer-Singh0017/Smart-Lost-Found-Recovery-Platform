package com.smartlostfound.service;

import com.smartlostfound.dto.item.ItemReportCreateRequest;
import com.smartlostfound.dto.item.ItemReportResponse;
import com.smartlostfound.dto.item.ItemReportUpdateRequest;
import com.smartlostfound.entity.*;
import com.smartlostfound.exception.BadRequestException;
import com.smartlostfound.exception.ForbiddenException;
import com.smartlostfound.repository.ItemImageRepository;
import com.smartlostfound.repository.ItemReportRepository;
import com.smartlostfound.repository.ModerationReportRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ItemReportServiceTest {

    @Mock
    private ItemReportRepository itemReportRepository;

    @Mock
    private ItemImageRepository itemImageRepository;

    @Mock
    private ModerationReportRepository moderationReportRepository;

    @Mock
    private CategoryService categoryService;

    @Mock
    private UserService userService;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private MatchingService matchingService;

    private ItemReportService itemReportService;

    private User owner;
    private Category category;

    @BeforeEach
    void setUp() {
        itemReportService = new ItemReportService(
                itemReportRepository,
                itemImageRepository,
                moderationReportRepository,
                categoryService,
                userService,
                fileStorageService,
                auditLogService,
                notificationService,
                matchingService
        );

        owner = new User("owner@example.com", "pass", "Report Owner", "555-1234", "ROLE_USER");
        owner.setId(10L);

        category = new Category("Electronics", "Phones and laptops", "Smartphone");
        category.setId(1L);
    }

    @Test
    @DisplayName("Should create report successfully and log audit record")
    void testCreateReportSuccess() {
        ItemReportCreateRequest request = new ItemReportCreateRequest();
        request.setTitle("Lost Sony Headphones");
        request.setType(ItemType.LOST);
        request.setCategoryId(1L);
        request.setDescription("Black Sony WH-1000XM5 wireless noise cancelling headphones");
        request.setCity("San Francisco");
        request.setLocationAddress("Montgomery BART station");
        request.setIncidentDate(LocalDate.now());

        when(userService.getUserEntity(10L)).thenReturn(owner);
        when(categoryService.getCategoryEntity(1L)).thenReturn(category);
        when(itemReportRepository.save(any(ItemReport.class))).thenAnswer(inv -> {
            ItemReport r = inv.getArgument(0);
            r.setId(101L);
            return r;
        });
        when(matchingService.findMatchesForItem(101L)).thenReturn(Collections.emptyList());

        ItemReportResponse response = itemReportService.createReport(request, 10L);

        assertNotNull(response);
        assertEquals(101L, response.getId());
        assertEquals("Lost Sony Headphones", response.getTitle());
        assertEquals(ItemStatus.OPEN, response.getStatus());
        verify(itemReportRepository).save(any(ItemReport.class));
        verify(auditLogService).record(eq("ITEM_CREATED"), eq("ItemReport"), eq(101L), eq(owner.getEmail()), anyString());
    }

    @Test
    @DisplayName("Should hide private contact details from public viewers")
    void testPrivacyShieldingForPublicViewers() {
        ItemReport report = new ItemReport();
        report.setId(101L);
        report.setTitle("Lost Laptop");
        report.setType(ItemType.LOST);
        report.setUser(owner);
        report.setCategory(category);
        report.setCity("Seattle");
        report.setLocationAddress("Library");
        report.setIncidentDate(LocalDate.now());
        report.setContactEmail("private.email@example.com");
        report.setContactPhone("555-999-0000");

        // Public viewer (different user ID, e.g. 99L)
        ItemReportResponse publicView = itemReportService.mapToResponse(report, false);
        assertNull(publicView.getContactEmail(), "Contact email must be hidden from public viewer");
        assertNull(publicView.getContactPhone(), "Contact phone must be hidden from public viewer");

        // Owner viewer
        ItemReportResponse ownerView = itemReportService.mapToResponse(report, true);
        assertEquals("private.email@example.com", ownerView.getContactEmail());
        assertEquals("555-999-0000", ownerView.getContactPhone());
    }

    @Test
    @DisplayName("Should prevent withdrawing an already resolved report")
    void testCannotWithdrawResolvedReport() {
        ItemReport report = new ItemReport();
        report.setId(200L);
        report.setUser(owner);
        report.setStatus(ItemStatus.RESOLVED);

        when(itemReportRepository.findById(200L)).thenReturn(Optional.of(report));

        // When current user is the owner, but item is already RESOLVED
        assertThrows(BadRequestException.class, () -> itemReportService.withdrawReport(200L, 10L));
    }

    @Test
    @DisplayName("Should successfully update report fields by owner")
    void testUpdateReportSuccess() {
        ItemReport report = new ItemReport();
        report.setId(300L);
        report.setUser(owner);
        report.setTitle("Old Title");
        report.setStatus(ItemStatus.OPEN);
        report.setCategory(category);
        report.setCity("Old City");
        report.setLocationAddress("Old Address");
        report.setDescription("Old description longer than ten chars");
        report.setIncidentDate(LocalDate.now());

        Category newCategory = new Category("Wallets", "Wallets and purses", "Wallet");
        newCategory.setId(2L);

        ItemReportUpdateRequest updateReq = new ItemReportUpdateRequest();
        updateReq.setTitle("Updated New Title");
        updateReq.setCategoryId(2L);
        updateReq.setDescription("Updated description with enough length");
        updateReq.setDistinguishingCharacteristics("New scratch marks");
        updateReq.setCity("New City");
        updateReq.setLocationAddress("New Address 123");
        updateReq.setIncidentDate(LocalDate.now());
        updateReq.setContactPhone("555-4321");

        when(itemReportRepository.findById(300L)).thenReturn(Optional.of(report));
        when(categoryService.getCategoryEntity(2L)).thenReturn(newCategory);
        when(itemReportRepository.save(any(ItemReport.class))).thenAnswer(inv -> inv.getArgument(0));

        ItemReportResponse updated = itemReportService.updateReport(300L, updateReq, 10L);

        assertNotNull(updated);
        assertEquals("Updated New Title", updated.getTitle());
        assertEquals("New City", updated.getCity());
        assertEquals("New Address 123", updated.getLocationAddress());
        verify(itemReportRepository).save(report);
        verify(auditLogService).record(eq("ITEM_UPDATED"), eq("ItemReport"), eq(300L), eq(owner.getEmail()), anyString());
    }

    @Test
    @DisplayName("Should prevent non-owner from updating a report")
    void testUpdateReportForbiddenForNonOwner() {
        ItemReport report = new ItemReport();
        report.setId(301L);
        report.setUser(owner);
        report.setStatus(ItemStatus.OPEN);

        when(itemReportRepository.findById(301L)).thenReturn(Optional.of(report));

        ItemReportUpdateRequest updateReq = new ItemReportUpdateRequest();
        updateReq.setTitle("Unauthorized Edit");

        assertThrows(ForbiddenException.class, () -> itemReportService.updateReport(301L, updateReq, 999L));
    }

    @Test
    @DisplayName("Should delete image from report when requested by owner")
    void testDeleteImageSuccess() {
        ItemReport report = new ItemReport();
        report.setId(400L);
        report.setUser(owner);
        report.setStatus(ItemStatus.OPEN);

        ItemImage image = new ItemImage("/api/v1/items/images/test.jpg", "test.jpg", "test-uuid.jpg", 1024L, "image/jpeg");
        image.setId(50L);
        image.setItemReport(report);
        report.addImage(image);

        when(itemReportRepository.findById(400L)).thenReturn(Optional.of(report));
        when(itemImageRepository.findById(50L)).thenReturn(Optional.of(image));

        itemReportService.deleteImageFromReport(400L, 50L, 10L);

        assertFalse(report.getImages().contains(image));
        verify(itemImageRepository).delete(image);
        verify(fileStorageService).deleteFile("test-uuid.jpg");
        verify(auditLogService).record(eq("ITEM_IMAGE_DELETED"), eq("ItemReport"), eq(400L), eq(owner.getEmail()), anyString());
    }

    @Test
    @DisplayName("Should prevent non-owner from deleting an image")
    void testDeleteImageForbiddenForNonOwner() {
        ItemReport report = new ItemReport();
        report.setId(401L);
        report.setUser(owner);

        when(itemReportRepository.findById(401L)).thenReturn(Optional.of(report));

        assertThrows(ForbiddenException.class, () -> itemReportService.deleteImageFromReport(401L, 50L, 999L));
    }
}
