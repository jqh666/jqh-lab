package com.jqhlab.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jqhlab.ai.QwenClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ChatMemoryService {

    private static final Logger log = LoggerFactory.getLogger(ChatMemoryService.class);
    private static final ObjectMapper mapper = new ObjectMapper();
    private static final int MAX_RECENT_MESSAGES = 10;
    private static final int SUMMARY_INTERVAL_TURNS = 5;
    private static final Duration MEMORY_TTL = Duration.ofDays(14);

    private final StringRedisTemplate redisTemplate;
    private final QwenClient qwenClient;

    public ChatMemoryService(StringRedisTemplate redisTemplate, QwenClient qwenClient) {
        this.redisTemplate = redisTemplate;
        this.qwenClient = qwenClient;
    }

    public MemorySnapshot load(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return MemorySnapshot.empty();
        }

        try {
            String summary = redisTemplate.opsForValue().get(summaryKey(sessionId));
            List<String> rawMessages = redisTemplate.opsForList().range(messagesKey(sessionId), 0, -1);
            List<Map<String, String>> recentMessages = new ArrayList<>();
            if (rawMessages != null) {
                for (String raw : rawMessages) {
                    recentMessages.add(mapper.readValue(raw, new TypeReference<Map<String, String>>() {}));
                }
            }
            return new MemorySnapshot(summary == null ? "" : summary, recentMessages);
        } catch (Exception e) {
            log.warn("Failed to load chat memory for session {}", sessionId, e);
            return MemorySnapshot.empty();
        }
    }

    public void saveTurn(String sessionId, String userMessage, String assistantMessage) {
        if (sessionId == null || sessionId.isBlank() || userMessage == null || assistantMessage == null
                || assistantMessage.isBlank()) {
            return;
        }

        try {
            String messageKey = messagesKey(sessionId);
            redisTemplate.opsForList().rightPush(messageKey, mapper.writeValueAsString(message("user", userMessage)));
            redisTemplate.opsForList().rightPush(messageKey, mapper.writeValueAsString(message("assistant", assistantMessage)));
            redisTemplate.opsForList().trim(messageKey, -MAX_RECENT_MESSAGES, -1);

            Long turns = redisTemplate.opsForValue().increment(turnsKey(sessionId));
            expireSessionKeys(sessionId);

            if (turns != null && turns % SUMMARY_INTERVAL_TURNS == 0) {
                rewriteSummary(sessionId);
            }
        } catch (Exception e) {
            log.warn("Failed to save chat memory for session {}", sessionId, e);
        }
    }

    private void rewriteSummary(String sessionId) {
        MemorySnapshot snapshot = load(sessionId);
        if (snapshot.recentMessages().isEmpty()) {
            return;
        }

        String prompt = "请把以下面试咨询对话压缩成一份长期记忆 summary。"
                + "\n要求：保留面试官关注点、候选人偏好、已经解释过的项目/能力、后续对话需要延续的上下文。"
                + "\n不要超过 300 字，不要编造信息。"
                + "\n\n已有 summary：\n" + blankToNone(snapshot.summary())
                + "\n\n最近对话：\n" + formatMessages(snapshot.recentMessages());

        List<Map<String, String>> messages = List.of(
                message("system", "你负责压缩面试问答系统的会话记忆，只输出 summary 正文。"),
                message("user", prompt)
        );

        try {
            String summary = qwenClient.chatOnce(messages).trim();
            if (!summary.isBlank()) {
                redisTemplate.opsForValue().set(summaryKey(sessionId), summary, MEMORY_TTL);
            }
        } catch (Exception e) {
            log.warn("Failed to rewrite chat summary for session {}", sessionId, e);
        }
    }

    private void expireSessionKeys(String sessionId) {
        redisTemplate.expire(messagesKey(sessionId), MEMORY_TTL);
        redisTemplate.expire(summaryKey(sessionId), MEMORY_TTL);
        redisTemplate.expire(turnsKey(sessionId), MEMORY_TTL);
    }

    private String formatMessages(List<Map<String, String>> messages) {
        StringBuilder builder = new StringBuilder();
        for (Map<String, String> message : messages) {
            builder.append(message.getOrDefault("role", "unknown"))
                    .append(": ")
                    .append(message.getOrDefault("content", ""))
                    .append("\n");
        }
        return builder.toString();
    }

    private String blankToNone(String value) {
        return value == null || value.isBlank() ? "暂无" : value;
    }

    private Map<String, String> message(String role, String content) {
        return Map.of("role", role, "content", content);
    }

    private String messagesKey(String sessionId) {
        return "jqh:ai:chat:" + sessionId + ":messages";
    }

    private String summaryKey(String sessionId) {
        return "jqh:ai:chat:" + sessionId + ":summary";
    }

    private String turnsKey(String sessionId) {
        return "jqh:ai:chat:" + sessionId + ":turns";
    }

    public record MemorySnapshot(String summary, List<Map<String, String>> recentMessages) {
        public static MemorySnapshot empty() {
            return new MemorySnapshot("", List.of());
        }
    }
}
