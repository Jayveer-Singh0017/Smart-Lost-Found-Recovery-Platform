package com.smartlostfound.service;

import com.smartlostfound.dto.matching.MatchExplanationDto;
import com.smartlostfound.dto.matching.MatchResultDto;
import com.smartlostfound.entity.*;
import com.smartlostfound.repository.ItemReportRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MatchingServiceTest {

    @Mock
    private ItemReportRepository itemReportRepository;

    private MatchingService matchingService;

    private Category electronics;
    private Category wallets;
    private User user1;
    private User user2;

    @BeforeEach
    void setUp() {
        matchingService = new MatchingService(itemReportRepository, 35, 30, 20, 15, 35);

        electronics = new Category("Electronics", "Tech gadgets", "Smartphone");
        electronics.setId(1L);

        wallets = new Category("Wallets", "Leather goods", "Wallet");
        wallets.setId(2L);

        user1 = new User("user1@example.com", "hash", "User One", "123", "ROLE_USER");
        user1.setId(101L);

        user2 = new User("user2@example.com", "hash", "User Two", "456", "ROLE_USER");
        user2.setId(102L);
    }

    @Test
    @DisplayName("Should calculate high match score for compatible lost and found reports")
    void testHighMatchScore() {
        ItemReport lostItem = new ItemReport();
        lostItem.setId(1L);
        lostItem.setTitle("Lost iPhone 15 Pro Max Black");
        lostItem.setType(ItemType.LOST);
        lostItem.setCategory(electronics);
        lostItem.setUser(user1);
        lostItem.setDescription("Lost my black iPhone 15 Pro Max with a green silicone case near subway");
        lostItem.setDistinguishingCharacteristics("Small crack on camera glass");
        lostItem.setCity("New York");
        lostItem.setLocationAddress("Times Square 42nd St Station");
        lostItem.setIncidentDate(LocalDate.now().minusDays(1));
        lostItem.setStatus(ItemStatus.OPEN);
        lostItem.setModerationStatus(ModerationStatus.APPROVED);

        ItemReport foundItem = new ItemReport();
        foundItem.setId(2L);
        foundItem.setTitle("Found Apple iPhone 15 in green case");
        foundItem.setType(ItemType.FOUND);
        foundItem.setCategory(electronics);
        foundItem.setUser(user2);
        foundItem.setDescription("Found a black iPhone 15 with green silicone case at subway platform");
        foundItem.setDistinguishingCharacteristics("Minor scratch near camera lens");
        foundItem.setCity("New York");
        foundItem.setLocationAddress("42nd St Subway Platform");
        foundItem.setIncidentDate(LocalDate.now().minusDays(1));
        foundItem.setStatus(ItemStatus.OPEN);
        foundItem.setModerationStatus(ModerationStatus.APPROVED);

        MatchExplanationDto explanation = matchingService.calculateMatchScore(lostItem, foundItem);

        assertTrue(explanation.getTotalScore() >= 70, "Score should be high for matching items, was: " + explanation.getTotalScore());
        assertEquals(35, explanation.getCategoryScore(), "Category should match completely");
        assertEquals(20, explanation.getLocationScore(), "Location in same city should award points");
        assertEquals(15, explanation.getDateProximityScore(), "Dates within 1 day should get max proximity points");
        assertFalse(explanation.getMatchedKeywords().isEmpty(), "Matched keywords should be populated");
        assertFalse(explanation.getMatchReasons().isEmpty(), "Explanations reasons should be present");
    }

    @Test
    @DisplayName("Should return 0 score when matching item with itself")
    void testSelfMatchingReturnsZero() {
        ItemReport item = new ItemReport();
        item.setId(5L);
        item.setType(ItemType.LOST);
        item.setCategory(electronics);
        item.setTitle("My Phone");

        MatchExplanationDto explanation = matchingService.calculateMatchScore(item, item);
        assertEquals(0, explanation.getTotalScore());
    }

    @Test
    @DisplayName("Should return 0 score when matching same report types (LOST with LOST)")
    void testSameTypeMatchingReturnsZero() {
        ItemReport lost1 = new ItemReport();
        lost1.setId(10L);
        lost1.setType(ItemType.LOST);
        lost1.setCategory(electronics);

        ItemReport lost2 = new ItemReport();
        lost2.setId(11L);
        lost2.setType(ItemType.LOST);
        lost2.setCategory(electronics);

        MatchExplanationDto explanation = matchingService.calculateMatchScore(lost1, lost2);
        assertEquals(0, explanation.getTotalScore());
    }

    @Test
    @DisplayName("Should return 0 category score when categories differ")
    void testDifferentCategoriesScore() {
        ItemReport lostItem = new ItemReport();
        lostItem.setId(1L);
        lostItem.setType(ItemType.LOST);
        lostItem.setCategory(electronics);
        lostItem.setTitle("Black case");
        lostItem.setDescription("Lost something");
        lostItem.setCity("Chicago");
        lostItem.setIncidentDate(LocalDate.now());

        ItemReport foundItem = new ItemReport();
        foundItem.setId(2L);
        foundItem.setType(ItemType.FOUND);
        foundItem.setCategory(wallets);
        foundItem.setTitle("Black case");
        foundItem.setDescription("Found something");
        foundItem.setCity("Chicago");
        foundItem.setIncidentDate(LocalDate.now());

        MatchExplanationDto explanation = matchingService.calculateMatchScore(lostItem, foundItem);
        assertEquals(0, explanation.getCategoryScore(), "Categories differ so category score must be 0");
    }

    @Test
    @DisplayName("Should rank candidates and filter below minimum threshold")
    void testFindMatchesRankingAndThreshold() {
        ItemReport lostPhone = new ItemReport();
        lostPhone.setId(1L);
        lostPhone.setTitle("Lost Black iPhone 15");
        lostPhone.setType(ItemType.LOST);
        lostPhone.setCategory(electronics);
        lostPhone.setCity("Seattle");
        lostPhone.setIncidentDate(LocalDate.now());
        lostPhone.setStatus(ItemStatus.OPEN);

        ItemReport highMatch = new ItemReport();
        highMatch.setId(2L);
        highMatch.setTitle("Found Black iPhone 15");
        highMatch.setType(ItemType.FOUND);
        highMatch.setCategory(electronics);
        highMatch.setCity("Seattle");
        highMatch.setIncidentDate(LocalDate.now());
        highMatch.setStatus(ItemStatus.OPEN);

        ItemReport lowMatch = new ItemReport();
        lowMatch.setId(3L);
        lowMatch.setTitle("Found Umbrella");
        lowMatch.setType(ItemType.FOUND);
        lowMatch.setCategory(wallets);
        lowMatch.setCity("Miami");
        lowMatch.setIncidentDate(LocalDate.now().minusDays(50));
        lowMatch.setStatus(ItemStatus.OPEN);

        when(itemReportRepository.findById(1L)).thenReturn(Optional.of(lostPhone));
        when(itemReportRepository.findMatchingCandidates(eq(ItemType.FOUND), eq(ItemStatus.OPEN), eq(ModerationStatus.APPROVED), eq(1L)))
                .thenReturn(List.of(lowMatch, highMatch));

        List<MatchResultDto> matches = matchingService.findMatchesForItem(1L);

        assertFalse(matches.isEmpty());
        assertEquals(2L, matches.get(0).getMatchedItem().getId(), "Highest score match should be ranked first");
        assertTrue(matches.get(0).getScore() >= 35);
    }
}
