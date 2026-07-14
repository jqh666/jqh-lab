package com.jqhlab.controller;

import com.jqhlab.dto.ApiResponse;
import com.jqhlab.entity.BlogPost;
import com.jqhlab.service.BlogService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/blogs")
public class BlogController {

    private final BlogService blogService;

    public BlogController(BlogService blogService) {
        this.blogService = blogService;
    }

    @GetMapping
    public ApiResponse<?> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String category) {
        return ApiResponse.success(blogService.getPosts(page, size, category));
    }

    @GetMapping("/{id}")
    public ApiResponse<?> detail(@PathVariable Long id) {
        return ApiResponse.success(blogService.getPostById(id));
    }

    @GetMapping("/categories")
    public ApiResponse<?> categories() {
        return ApiResponse.success(blogService.getCategories());
    }

    @PostMapping
    public ApiResponse<?> create(@RequestBody BlogPost post) {
        blogService.createPost(post);
        return ApiResponse.success(null);
    }

    @PutMapping("/{id}")
    public ApiResponse<?> update(@PathVariable Long id, @RequestBody BlogPost post) {
        blogService.updatePost(id, post);
        return ApiResponse.success(null);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<?> delete(@PathVariable Long id) {
        blogService.deletePost(id);
        return ApiResponse.success(null);
    }
}
