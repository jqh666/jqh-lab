package com.jqhlab.controller;

import com.jqhlab.ai.QwenClient;
import com.jqhlab.ai.QwenEmbeddingService;
import com.jqhlab.dto.ApiResponse;
import com.jqhlab.entity.KnowledgeDoc;
import com.jqhlab.repository.KnowledgeDocMapper;
import com.jqhlab.service.ChatMemoryService;
import com.jqhlab.service.KnowledgeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
public class AIChatController {

    private final QwenClient qwenClient;
    private final QwenEmbeddingService qwenEmbeddingService;
    private final KnowledgeDocMapper knowledgeDocMapper;
    private final KnowledgeService knowledgeService;
    private final ChatMemoryService chatMemoryService;

    public AIChatController(QwenClient qwenClient,
            QwenEmbeddingService qwenEmbeddingService,
            KnowledgeDocMapper knowledgeDocMapper,
            KnowledgeService knowledgeService,
            ChatMemoryService chatMemoryService) {
        this.qwenClient = qwenClient;
        this.qwenEmbeddingService = qwenEmbeddingService;
        this.knowledgeDocMapper = knowledgeDocMapper;
        this.knowledgeService = knowledgeService;
        this.chatMemoryService = chatMemoryService;
    }

    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chat(@RequestBody Map<String, Object> body) {
        String message = (String) body.get("message");
        String sessionId = (String) body.get("sessionId");
        @SuppressWarnings("unchecked")
        List<Map<String, String>> history = (List<Map<String, String>>) body.getOrDefault("history", List.of());

        String context = searchContext(message);
        ChatMemoryService.MemorySnapshot memory = chatMemoryService.load(sessionId);

        List<Map<String, String>> messages = new ArrayList<>();
        String sysPrompt = "你是蒋沁昊的面试辅助 AI，主要服务对象是 HR、面试官和招聘方。"
            + "\n你的目标不是泛泛介绍，而是基于知识库，用面试官想听的方式，简洁、可信、有重点地回答关于蒋沁昊的经历、项目、技术栈、能力和匹配度的问题。"
            + "\n\n回答内容要求："
            + "\n1. 优先使用知识库内容回答，不编造不存在的经历、公司、数据或技术细节。"
            + "\n2. 回答要短而有信息密度，默认控制在 2-4 段或 3-6 个要点内，不要长篇大论。"
            + "\n3. 面向招聘场景表达，突出结果、职责、技术深度、工程能力、业务理解和岗位匹配度。"
            + "\n4. 如果问题适合用 STAR 或项目复盘方式回答，可以自然体现：背景、动作、结果、个人贡献。"
            + "\n5. 如果知识库没有足够信息，要坦诚说明，并给出可以进一步询问的方向。"
            + "\n\n排版格式要求："
            + "\n1. 必须使用 Markdown 输出，不要把所有内容挤在一个自然段里。"
            + "\n2. 回答先给 1 句总括，再空一行。"
            + "\n3. 需要列举能力、技术栈、项目点时，使用短列表，每个要点单独一行，格式如：- **后端开发**：Java、Spring Boot、MyBatis-Plus。"
            + "\n4. Markdown 列表项必须以连字符加空格开头，即使用「- 」，不要写成「-项目」或「-**项目**」。"
            + "\n5. 不要在同一行连续堆多个要点；不同类别必须换行。"
            + "\n6. 结尾单独空一行后写「可以继续追问：」，并列出 2-3 个短问题。"
            + "\n7. 不要使用夸张营销口吻，不要自称本人，不要说“我认为蒋沁昊一定适合”。语气应专业、克制、像候选人资料助手。"
            + "\n\n对话长期记忆 summary：\n" + blankToNone(memory.summary())
            + "\n\n知识库内容：\n" + context;
        messages.add(Map.of("role", "system", "content", sysPrompt));

        if (!memory.recentMessages().isEmpty()) {
            messages.addAll(memory.recentMessages());
        } else if (history != null) {
            messages.addAll(history);
        }
        messages.add(Map.of("role", "user", "content", message));

        StringBuilder assistantMessage = new StringBuilder();
        return qwenClient.chatStream(messages)
                .doOnNext(assistantMessage::append)
                .doOnComplete(() -> chatMemoryService.saveTurn(sessionId, message, assistantMessage.toString()));
    }

    private String blankToNone(String value) {
        return value == null || value.isBlank() ? "暂无" : value;
    }

    private String searchContext(String query) {
        List<Double> queryVector = qwenEmbeddingService.getEmbedding(query);
        String vectorStr = qwenEmbeddingService.vectorToString(queryVector);

        List<KnowledgeDoc> docs = knowledgeDocMapper.findSimilar(vectorStr, 4);

        if (docs.isEmpty()) {
            return "No related knowledge found.";
        }

        return docs.stream()
                .map(d -> "[Source: " + d.getTitle() + "]\n" + d.getContent())
                .collect(Collectors.joining("\n\n---\n\n"));
    }

    @GetMapping("/knowledge-list")
    public ApiResponse<?> knowledgeList() {
        return ApiResponse.success(knowledgeService.list());
    }

    @DeleteMapping("/knowledge/{id}")
    public ApiResponse<?> deleteKnowledge(@PathVariable Long id) {
        knowledgeService.delete(id);
        return ApiResponse.success(null);
    }

    @PostMapping(value = "/upload-knowledge", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<?>> uploadKnowledge(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title) {
        try {
            return ResponseEntity.ok(ApiResponse.success(knowledgeService.upload(file, title)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "Upload failed: " + e.getMessage()));
        }
    }
}
