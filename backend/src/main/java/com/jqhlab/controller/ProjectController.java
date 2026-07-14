package com.jqhlab.controller;

import com.jqhlab.dto.ApiResponse;
import com.jqhlab.entity.Project;
import com.jqhlab.service.ProjectService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public ApiResponse<?> list() {
        return ApiResponse.success(projectService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<?> detail(@PathVariable Long id) {
        return ApiResponse.success(projectService.getById(id));
    }

    @PostMapping
    public ApiResponse<?> create(@RequestBody Project project) {
        projectService.create(project);
        return ApiResponse.success(null);
    }

    @PutMapping("/{id}")
    public ApiResponse<?> update(@PathVariable Long id, @RequestBody Project project) {
        projectService.update(id, project);
        return ApiResponse.success(null);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<?> delete(@PathVariable Long id) {
        projectService.delete(id);
        return ApiResponse.success(null);
    }
}
