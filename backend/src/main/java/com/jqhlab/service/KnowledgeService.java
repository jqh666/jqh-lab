package com.jqhlab.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.jqhlab.ai.QwenEmbeddingService;
import com.jqhlab.ai.TextChunker;
import com.jqhlab.entity.KnowledgeDoc;
import com.jqhlab.repository.KnowledgeDocMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class KnowledgeService {

    private final KnowledgeDocMapper knowledgeDocMapper;
    private final QwenEmbeddingService qwenEmbeddingService;

    public KnowledgeService(KnowledgeDocMapper knowledgeDocMapper, QwenEmbeddingService qwenEmbeddingService) {
        this.knowledgeDocMapper = knowledgeDocMapper;
        this.qwenEmbeddingService = qwenEmbeddingService;
    }

    public List<KnowledgeDoc> list() {
        return knowledgeDocMapper.selectList(
                new LambdaQueryWrapper<KnowledgeDoc>().orderByDesc(KnowledgeDoc::getCreatedAt));
    }

    public void delete(Long id) {
        knowledgeDocMapper.deleteById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> upload(MultipartFile file, String title) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }

        String fileContent = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))
                .lines()
                .collect(java.util.stream.Collectors.joining("\n"));

        List<String> chunks = TextChunker.chunk(fileContent);
        if (chunks.isEmpty()) {
            throw new IllegalArgumentException("No readable text found in uploaded file");
        }

        String docTitle = resolveTitle(file, title);
        int chunkCount = 0;

        for (String chunk : chunks) {
            List<Double> embedding = qwenEmbeddingService.getEmbedding(chunk);

            KnowledgeDoc doc = new KnowledgeDoc();
            doc.setTitle(docTitle);
            doc.setSource("upload");
            doc.setContent(chunk);
            doc.setEmbedding(qwenEmbeddingService.vectorToString(embedding));
            doc.setCreatedAt(LocalDateTime.now());

            int inserted = knowledgeDocMapper.insertKnowledgeDoc(doc);
            if (inserted != 1 || doc.getId() == null) {
                throw new IllegalStateException("Knowledge document insert was not committed");
            }
            chunkCount++;
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("chunks", chunkCount);
        result.put("title", docTitle);
        return result;
    }

    private String resolveTitle(MultipartFile file, String title) {
        if (title != null && !title.isBlank()) {
            return title.trim();
        }
        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null && !originalFilename.isBlank()) {
            return originalFilename;
        }
        return "untitled";
    }
}
