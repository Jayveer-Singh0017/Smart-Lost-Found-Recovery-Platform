package com.smartlostfound.service;

import com.smartlostfound.dto.item.ItemSummaryResponse;
import com.smartlostfound.dto.matching.MatchExplanationDto;
import com.smartlostfound.dto.matching.MatchResultDto;
import com.smartlostfound.entity.ItemReport;
import com.smartlostfound.entity.ItemStatus;
import com.smartlostfound.entity.ItemType;
import com.smartlostfound.entity.ModerationStatus;
import com.smartlostfound.exception.ResourceNotFoundException;
import com.smartlostfound.repository.ItemReportRepository;
import com.smartlostfound.util.TextSimilarityUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class MatchingService {

    private final ItemReportRepository itemReportRepository;

    private final int categoryWeight;
    private final int textSimilarityWeight;
    private final int locationWeight;
    private final int dateProximityWeight;
    private final int minScoreThreshold;

    public MatchingService(
            ItemReportRepository itemReportRepository,
            @Value("${app.matching.weights.category:35}") int categoryWeight,
            @Value("${app.matching.weights.text-similarity:30}") int textSimilarityWeight,
            @Value("${app.matching.weights.location:20}") int locationWeight,
            @Value("${app.matching.weights.date-proximity:15}") int dateProximityWeight,
            @Value("${app.matching.min-score-threshold:35}") int minScoreThreshold) {
        this.itemReportRepository = itemReportRepository;
        this.categoryWeight = categoryWeight;
        this.textSimilarityWeight = textSimilarityWeight;
        this.locationWeight = locationWeight;
        this.dateProximityWeight = dateProximityWeight;
        this.minScoreThreshold = minScoreThreshold;
    }

    @Transactional(readOnly = true)
    public List<MatchResultDto> findMatchesForItem(Long itemId) {
        ItemReport source = itemReportRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("ItemReport", "id", itemId));

        // Incompatible / inactive reports cannot match
        if (source.getStatus() == ItemStatus.WITHDRAWN || source.getStatus() == ItemStatus.RESOLVED) {
            return Collections.emptyList();
        }

        // Opposite type: LOST compares with FOUND, FOUND compares with LOST
        ItemType targetType = (source.getType() == ItemType.LOST) ? ItemType.FOUND : ItemType.LOST;

        List<ItemReport> candidates = itemReportRepository.findMatchingCandidates(
                targetType, ItemStatus.OPEN, ModerationStatus.APPROVED, source.getId()
        );

        List<MatchResultDto> results = new ArrayList<>();

        for (ItemReport candidate : candidates) {
            MatchExplanationDto explanation = calculateMatchScore(source, candidate);
            if (explanation.getTotalScore() >= minScoreThreshold) {
                ItemSummaryResponse candidateSummary = mapToSummary(candidate);
                results.add(new MatchResultDto(source.getId(), candidateSummary, explanation.getTotalScore(), explanation));
            }
        }

        // Rank by total score descending
        results.sort(Comparator.comparingInt(MatchResultDto::getScore).reversed());
        return results;
    }

    public MatchExplanationDto calculateMatchScore(ItemReport source, ItemReport candidate) {
        // Prevent self-matching or identical-type matching
        if (source.getId() != null && source.getId().equals(candidate.getId())) {
            return new MatchExplanationDto(0, 0, 0, 0, 0);
        }
        if (source.getType() == candidate.getType()) {
            return new MatchExplanationDto(0, 0, 0, 0, 0);
        }

        List<String> reasons = new ArrayList<>();
        List<String> matchedKeywords = new ArrayList<>();

        // 1. Category Compatibility
        int catScore = 0;
        if (source.getCategory() != null && candidate.getCategory() != null
                && source.getCategory().getId().equals(candidate.getCategory().getId())) {
            catScore = categoryWeight;
            reasons.add("Exact category match: " + source.getCategory().getName());
        }

        // 2. Text Keyword Overlap & Similarity (Title, Description, Distinguishing Characteristics)
        String sourceFullText = buildSearchableText(source);
        String candidateFullText = buildSearchableText(candidate);

        double jaccard = TextSimilarityUtil.calculateJaccardSimilarity(sourceFullText, candidateFullText);
        matchedKeywords = TextSimilarityUtil.findOverlappingKeywords(sourceFullText, candidateFullText);

        int textScore = (int) Math.round(jaccard * textSimilarityWeight);
        // Boost slightly if multiple distinctive keywords overlap
        if (!matchedKeywords.isEmpty() && textScore < 8) {
            textScore = Math.min(textSimilarityWeight, Math.max(textScore, Math.min(matchedKeywords.size() * 4, 15)));
        }
        if (!matchedKeywords.isEmpty()) {
            reasons.add("Key descriptive terms match: " + String.join(", ", matchedKeywords.subList(0, Math.min(matchedKeywords.size(), 5))));
        }

        // 3. Location & City Compatibility
        int locScore = 0;
        boolean cityMatch = source.getCity() != null && candidate.getCity() != null
                && source.getCity().trim().equalsIgnoreCase(candidate.getCity().trim());
        if (cityMatch) {
            locScore += 15;
            reasons.add("Same incident city: " + source.getCity().trim());

            // Address token overlap check
            if (source.getLocationAddress() != null && candidate.getLocationAddress() != null) {
                List<String> addressOverlap = TextSimilarityUtil.findOverlappingKeywords(
                        source.getLocationAddress(), candidate.getLocationAddress());
                if (!addressOverlap.isEmpty()) {
                    locScore += 5;
                    reasons.add("Specific location proximity: " + String.join(", ", addressOverlap));
                }
            }
        }
        locScore = Math.min(locScore, locationWeight);

        // 4. Incident Date Proximity
        int dateScore = 0;
        if (source.getIncidentDate() != null && candidate.getIncidentDate() != null) {
            long daysDiff = Math.abs(ChronoUnit.DAYS.between(source.getIncidentDate(), candidate.getIncidentDate()));
            if (daysDiff <= 2) {
                dateScore = dateProximityWeight;
                reasons.add("Reported within " + (daysDiff == 0 ? "the same day" : daysDiff + " days"));
            } else if (daysDiff <= 5) {
                dateScore = (int) Math.round(dateProximityWeight * 0.7);
                reasons.add("Reported within " + daysDiff + " days");
            } else if (daysDiff <= 10) {
                dateScore = (int) Math.round(dateProximityWeight * 0.4);
                reasons.add("Reported within " + daysDiff + " days");
            } else if (daysDiff <= 21) {
                dateScore = (int) Math.round(dateProximityWeight * 0.2);
            }
        }

        int total = catScore + textScore + locScore + dateScore;
        total = Math.min(100, Math.max(0, total));

        MatchExplanationDto explanation = new MatchExplanationDto(catScore, textScore, locScore, dateScore, total);
        explanation.setMatchedKeywords(matchedKeywords);
        explanation.setMatchReasons(reasons);
        return explanation;
    }

    private String buildSearchableText(ItemReport item) {
        StringBuilder sb = new StringBuilder();
        if (item.getTitle() != null) sb.append(item.getTitle()).append(" ");
        if (item.getDescription() != null) sb.append(item.getDescription()).append(" ");
        if (item.getDistinguishingCharacteristics() != null) sb.append(item.getDistinguishingCharacteristics()).append(" ");
        return sb.toString();
    }

    private ItemSummaryResponse mapToSummary(ItemReport item) {
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
}
