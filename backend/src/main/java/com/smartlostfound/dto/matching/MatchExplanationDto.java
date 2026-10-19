package com.smartlostfound.dto.matching;

import java.util.ArrayList;
import java.util.List;

public class MatchExplanationDto {
    private int categoryScore;
    private int textScore;
    private int locationScore;
    private int dateProximityScore;
    private int totalScore;
    private List<String> matchedKeywords = new ArrayList<>();
    private List<String> matchReasons = new ArrayList<>();

    public MatchExplanationDto() {
    }

    public MatchExplanationDto(int categoryScore, int textScore, int locationScore, int dateProximityScore, int totalScore) {
        this.categoryScore = categoryScore;
        this.textScore = textScore;
        this.locationScore = locationScore;
        this.dateProximityScore = dateProximityScore;
        this.totalScore = totalScore;
    }

    public int getCategoryScore() {
        return categoryScore;
    }

    public void setCategoryScore(int categoryScore) {
        this.categoryScore = categoryScore;
    }

    public int getTextScore() {
        return textScore;
    }

    public void setTextScore(int textScore) {
        this.textScore = textScore;
    }

    public int getLocationScore() {
        return locationScore;
    }

    public void setLocationScore(int locationScore) {
        this.locationScore = locationScore;
    }

    public int getDateProximityScore() {
        return dateProximityScore;
    }

    public void setDateProximityScore(int dateProximityScore) {
        this.dateProximityScore = dateProximityScore;
    }

    public int getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(int totalScore) {
        this.totalScore = totalScore;
    }

    public List<String> getMatchedKeywords() {
        return matchedKeywords;
    }

    public void setMatchedKeywords(List<String> matchedKeywords) {
        this.matchedKeywords = matchedKeywords;
    }

    public List<String> getMatchReasons() {
        return matchReasons;
    }

    public void setMatchReasons(List<String> matchReasons) {
        this.matchReasons = matchReasons;
    }
}
