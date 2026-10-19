package com.smartlostfound.dto.matching;

import com.smartlostfound.dto.item.ItemSummaryResponse;

public class MatchResultDto {
    private Long sourceItemId;
    private ItemSummaryResponse matchedItem;
    private int score;
    private MatchExplanationDto explanation;

    public MatchResultDto() {
    }

    public MatchResultDto(Long sourceItemId, ItemSummaryResponse matchedItem, int score, MatchExplanationDto explanation) {
        this.sourceItemId = sourceItemId;
        this.matchedItem = matchedItem;
        this.score = score;
        this.explanation = explanation;
    }

    public Long getSourceItemId() {
        return sourceItemId;
    }

    public void setSourceItemId(Long sourceItemId) {
        this.sourceItemId = sourceItemId;
    }

    public ItemSummaryResponse getMatchedItem() {
        return matchedItem;
    }

    public void setMatchedItem(ItemSummaryResponse matchedItem) {
        this.matchedItem = matchedItem;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public MatchExplanationDto getExplanation() {
        return explanation;
    }

    public void setExplanation(MatchExplanationDto explanation) {
        this.explanation = explanation;
    }
}
