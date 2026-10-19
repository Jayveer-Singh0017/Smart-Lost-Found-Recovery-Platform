package com.smartlostfound.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class TextSimilarityUtilTest {

    @Test
    @DisplayName("Should extract normalized keywords and filter stop words")
    void testExtractKeywords() {
        String text = "The lost black Apple iPhone with a red silicone case and cracked screen!";
        Set<String> keywords = TextSimilarityUtil.extractKeywords(text);

        assertTrue(keywords.contains("apple"));
        assertTrue(keywords.contains("iphone"));
        assertTrue(keywords.contains("black"));
        assertTrue(keywords.contains("silicone"));
        assertTrue(keywords.contains("cracked"));
        assertFalse(keywords.contains("the"));
        assertFalse(keywords.contains("and"));
        assertFalse(keywords.contains("with"));
    }

    @Test
    @DisplayName("Should calculate Jaccard similarity between two texts")
    void testCalculateJaccardSimilarity() {
        String text1 = "Lost black iPhone 15 Pro with green case";
        String text2 = "Found black iPhone 15 in green case at station";

        double similarity = TextSimilarityUtil.calculateJaccardSimilarity(text1, text2);
        assertTrue(similarity > 0.4, "Similarity should be significant for high overlap: " + similarity);
    }

    @Test
    @DisplayName("Should extract overlapping keywords correctly")
    void testFindOverlappingKeywords() {
        String text1 = "Silver MacBook Pro laptop with stickers";
        String text2 = "Found silver Apple MacBook Pro in library";

        List<String> overlap = TextSimilarityUtil.findOverlappingKeywords(text1, text2);
        assertTrue(overlap.contains("macbook"));
        assertTrue(overlap.contains("pro"));
        assertTrue(overlap.contains("silver"));
    }

    @Test
    @DisplayName("Should handle empty or blank texts gracefully")
    void testEmptyTexts() {
        assertEquals(0.0, TextSimilarityUtil.calculateJaccardSimilarity("", "something"));
        assertEquals(0.0, TextSimilarityUtil.calculateJaccardSimilarity(null, null));
        assertTrue(TextSimilarityUtil.findOverlappingKeywords(null, "text").isEmpty());
    }
}
