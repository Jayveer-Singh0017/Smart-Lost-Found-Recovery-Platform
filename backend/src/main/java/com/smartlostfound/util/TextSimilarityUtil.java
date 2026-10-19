package com.smartlostfound.util;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class TextSimilarityUtil {

    private static final Pattern NON_ALPHANUMERIC = Pattern.compile("[^a-zA-Z0-9\\s]");
    private static final Set<String> STOP_WORDS = Set.of(
            "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
            "by", "from", "up", "about", "into", "over", "after", "is", "are", "was", "were",
            "be", "been", "being", "have", "has", "had", "do", "does", "did", "this", "that",
            "these", "those", "my", "your", "his", "her", "its", "our", "their", "it", "i", "you"
    );

    /**
     * Extracts normalized, meaningful keywords from raw text.
     */
    public static Set<String> extractKeywords(String text) {
        if (text == null || text.isBlank()) {
            return Collections.emptySet();
        }

        String cleaned = NON_ALPHANUMERIC.matcher(text.toLowerCase()).replaceAll(" ");
        String[] tokens = cleaned.split("\\s+");

        return Arrays.stream(tokens)
                .map(String::trim)
                .filter(t -> t.length() > 2)
                .filter(t -> !STOP_WORDS.contains(t))
                .collect(Collectors.toSet());
    }

    /**
     * Calculates Jaccard similarity between two texts based on extracted keywords (0.0 to 1.0).
     */
    public static double calculateJaccardSimilarity(String text1, String text2) {
        Set<String> set1 = extractKeywords(text1);
        Set<String> set2 = extractKeywords(text2);

        if (set1.isEmpty() || set2.isEmpty()) {
            return 0.0;
        }

        Set<String> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);

        Set<String> union = new HashSet<>(set1);
        union.addAll(set2);

        return (double) intersection.size() / (double) union.size();
    }

    /**
     * Returns matching keywords present in both texts.
     */
    public static List<String> findOverlappingKeywords(String text1, String text2) {
        Set<String> set1 = extractKeywords(text1);
        Set<String> set2 = extractKeywords(text2);

        Set<String> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);

        return new ArrayList<>(intersection);
    }
}
