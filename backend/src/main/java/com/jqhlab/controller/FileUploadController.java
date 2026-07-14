package com.jqhlab.controller;

import com.jqhlab.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    @Value("${upload.dir:uploads/images}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<?> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ApiResponse.error(400, "文件为空");
        }

        String originalName = file.getOriginalFilename();
        String ext = "";
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf("."));
        }
        String filename = UUID.randomUUID().toString() + ext;

        try {
            Path target = Paths.get(uploadDir, filename);
            Files.copy(file.getInputStream(), target);
            String url = "/uploads/images/" + filename;
            return ApiResponse.success(Map.of("url", url, "filename", filename));
        } catch (IOException e) {
            return ApiResponse.error(500, "上传失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/image")
    public ApiResponse<?> deleteImage(@RequestParam String url) {
        try {
            String filename = url.substring(url.lastIndexOf("/") + 1);
            Path target = Paths.get(uploadDir, filename);
            Files.deleteIfExists(target);
            return ApiResponse.success(null);
        } catch (IOException e) {
            return ApiResponse.error(500, "删除失败");
        }
    }
}
