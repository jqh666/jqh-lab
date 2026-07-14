package com.jqhlab.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.List;
import java.util.Map;

@Service
public class QwenEmbeddingService {

    private static final int DATABASE_VECTOR_DIMENSIONS = 1024;

    private final WebClient webClient;

    public QwenEmbeddingService(
            @Value("${qwen.api-key}") String apiKey,
            @Value("${qwen.api-url}") String apiUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    @SuppressWarnings("unchecked")
    public List<Double> getEmbedding(String text) {
        Map<String, Object> body = Map.of(
            "model", "text-embedding-v3",
            "input", text
        );

        try {
            Map<String, Object> response = webClient.post()
                    .uri("/v1/embeddings")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("data")) {
                List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");
                if (!data.isEmpty()) {
                    return normalizeDimensions((List<Double>) data.get(0).get("embedding"));
                }
            }
        } catch (Exception e) {
            throw new IllegalStateException("Failed to generate embedding", e);
        }

        throw new IllegalStateException("Embedding response is empty");
    }

    public String vectorToString(List<Double> vector) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < vector.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(vector.get(i));
        }
        sb.append("]");
        return sb.toString();
    }

    private List<Double> normalizeDimensions(List<Double> vector) {
        if (vector == null || vector.isEmpty()) {
            throw new IllegalStateException("Embedding vector is empty");
        }
        if (vector.size() == DATABASE_VECTOR_DIMENSIONS) {
            return vector;
        }
        if (vector.size() > DATABASE_VECTOR_DIMENSIONS) {
            throw new IllegalStateException(
                    "Embedding vector has " + vector.size() + " dimensions, expected at most "
                            + DATABASE_VECTOR_DIMENSIONS);
        }

        java.util.ArrayList<Double> normalized = new java.util.ArrayList<>(DATABASE_VECTOR_DIMENSIONS);
        normalized.addAll(vector);
        while (normalized.size() < DATABASE_VECTOR_DIMENSIONS) {
            normalized.add(0.0);
        }
        return normalized;
    }
}
