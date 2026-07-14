package com.jqhlab.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class QwenClient {

    private static final Logger log = LoggerFactory.getLogger(QwenClient.class);
    private static final ObjectMapper mapper = new ObjectMapper();

    private final WebClient webClient;
    private final String model;

    public QwenClient(
            @Value("${qwen.api-key}") String apiKey,
            @Value("${qwen.model}") String model,
            @Value("${qwen.api-url}") String apiUrl) {
        this.model = model;
        this.webClient = WebClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    public Flux<String> chatStream(List<Map<String, String>> messages) {
        Map<String, Object> body = Map.of(
            "model", model,
            "messages", messages,
            "stream", true
        );

        return webClient.post()
                .uri("/v1/chat/completions")
                .accept(MediaType.TEXT_EVENT_STREAM)
                .bodyValue(body)
                .retrieve()
                .bodyToFlux(String.class)
                .doOnError(e -> log.error("Qwen API error", e))
                .flatMapIterable(this::parseStreamChunk)
                .filter(content -> !content.isEmpty());
    }

    public String chatOnce(List<Map<String, String>> messages) {
        Map<String, Object> body = Map.of(
            "model", model,
            "messages", messages,
            "stream", false
        );

        Map<?, ?> response = webClient.post()
                .uri("/v1/chat/completions")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response == null) {
            return "";
        }

        try {
            JsonNode root = mapper.valueToTree(response);
            return root.path("choices").get(0).path("message").path("content").asText("");
        } catch (Exception e) {
            log.warn("Failed to parse Qwen non-stream response: {}", response, e);
            return "";
        }
    }

    private List<String> parseStreamChunk(String chunk) {
        List<String> contents = new ArrayList<>();
        if (chunk == null || chunk.isBlank()) {
            return contents;
        }

        for (String line : chunk.split("\\R")) {
            String json = normalizeStreamLine(line);
            if (json == null) {
                continue;
            }

            try {
                JsonNode root = mapper.readTree(json);
                JsonNode choice = root.path("choices").get(0);
                String content = choice.path("delta").path("content").asText("");
                if (content.isEmpty()) {
                    content = choice.path("message").path("content").asText("");
                }
                if (!content.isEmpty()) {
                    contents.add(content);
                }
            } catch (Exception e) {
                log.warn("Failed to parse Qwen stream chunk: {}", json, e);
            }
        }

        return contents;
    }

    private String normalizeStreamLine(String line) {
        if (line == null) {
            return null;
        }
        String normalized = line.trim();
        if (normalized.isEmpty() || normalized.startsWith(":")) {
            return null;
        }
        if (normalized.startsWith("data:")) {
            normalized = normalized.substring(5).trim();
        }
        if (normalized.isEmpty() || "[DONE]".equals(normalized)) {
            return null;
        }
        if (!normalized.startsWith("{")) {
            return null;
        }
        return normalized;
    }
}
