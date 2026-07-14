package com.jqhlab.controller;

import com.jqhlab.dto.ApiResponse;
import com.jqhlab.entity.PortfolioItem;
import com.jqhlab.service.PortfolioService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping
    public ApiResponse<?> list() {
        return ApiResponse.success(portfolioService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<?> detail(@PathVariable Long id) {
        return ApiResponse.success(portfolioService.getById(id));
    }

    @PostMapping
    public ApiResponse<?> create(@RequestBody PortfolioItem item) {
        portfolioService.create(item);
        return ApiResponse.success(null);
    }

    @PutMapping("/{id}")
    public ApiResponse<?> update(@PathVariable Long id, @RequestBody PortfolioItem item) {
        portfolioService.update(id, item);
        return ApiResponse.success(null);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<?> delete(@PathVariable Long id) {
        portfolioService.delete(id);
        return ApiResponse.success(null);
    }
}
