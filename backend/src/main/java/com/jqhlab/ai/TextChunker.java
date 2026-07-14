package com.jqhlab.ai;

import java.util.ArrayList;
import java.util.List;

public class TextChunker {

    private static final int TARGET_SIZE = 500;
    private static final int OVERLAP = 50;

    public static List<String> chunk(String text) {
        List<String> chunks = new ArrayList<>();
        if (text == null || text.isBlank()) return chunks;

        // Try paragraph split first
        String[] paragraphs = text.split("\n\n+");
        if (paragraphs.length < 2) {
            paragraphs = text.split("\n+");
        }

        StringBuilder current = new StringBuilder();
        for (String p : paragraphs) {
            String trimmed = p.trim();
            if (trimmed.isBlank()) continue;

            // If this single paragraph exceeds target, split it further
            if (trimmed.length() > TARGET_SIZE * 1.5) {
                if (!current.isEmpty()) {
                    chunks.add(current.toString().trim());
                    current = new StringBuilder(takeSuffix(current.toString(), OVERLAP));
                }
                // Recursively split long paragraph by sentences
                for (String sub : splitLongText(trimmed)) {
                    if (!sub.isBlank()) {
                        chunks.add(sub.trim());
                    }
                }
                continue;
            }

            // Add to current chunk
            if (current.length() + trimmed.length() > TARGET_SIZE && !current.isEmpty()) {
                chunks.add(current.toString().trim());
                current = new StringBuilder(takeSuffix(current.toString(), OVERLAP));
            }

            if (!current.isEmpty()) current.append("\n\n");
            current.append(trimmed);
        }

        if (!current.isEmpty()) {
            chunks.add(current.toString().trim());
        }

        return chunks;
    }

    private static List<String> splitLongText(String text) {
        List<String> parts = new ArrayList<>();
        // Try sentence split first
        String[] sentences = text.split("(?<=[。！？.!?])\\s*");
        if (sentences.length < 2) {
            // Fallback to character count split
            for (int i = 0; i < text.length(); i += TARGET_SIZE - OVERLAP) {
                int end = Math.min(i + TARGET_SIZE, text.length());
                parts.add(text.substring(i, end));
            }
            return parts;
        }

        StringBuilder current = new StringBuilder();
        for (String s : sentences) {
            if (current.length() + s.length() > TARGET_SIZE && !current.isEmpty()) {
                parts.add(current.toString().trim());
                current = new StringBuilder(takeSuffix(current.toString(), OVERLAP));
            }
            current.append(s);
        }
        if (!current.isEmpty()) {
            parts.add(current.toString().trim());
        }
        return parts;
    }

    private static String takeSuffix(String text, int len) {
        if (text.length() <= len) return text;
        int start = text.length() - len;
        // Try to find a newline boundary
        int nl = text.indexOf('\n', start);
        if (nl > 0 && nl < text.length()) return text.substring(nl);
        return text.substring(start);
    }
}
