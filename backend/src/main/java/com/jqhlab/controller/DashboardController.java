package com.jqhlab.controller;

import com.jqhlab.dto.ApiResponse;
import com.jqhlab.repository.BlogPostMapper;
import com.jqhlab.repository.ProjectMapper;
import com.jqhlab.repository.PortfolioItemMapper;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final BlogPostMapper blogPostMapper;
    private final ProjectMapper projectMapper;
    private final PortfolioItemMapper portfolioItemMapper;

    public DashboardController(BlogPostMapper blogPostMapper,
            ProjectMapper projectMapper,
            PortfolioItemMapper portfolioItemMapper) {
        this.blogPostMapper = blogPostMapper;
        this.projectMapper = projectMapper;
        this.portfolioItemMapper = portfolioItemMapper;
    }

    @GetMapping("/stats")
    public ApiResponse<?> stats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("blogCount", blogPostMapper.selectCount(null));
        stats.put("projectCount", projectMapper.selectCount(null));
        stats.put("portfolioCount", portfolioItemMapper.selectCount(null));
        return ApiResponse.success(stats);
    }
}
