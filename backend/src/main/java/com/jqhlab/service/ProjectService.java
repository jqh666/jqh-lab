package com.jqhlab.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.jqhlab.entity.Project;
import com.jqhlab.repository.ProjectMapper;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProjectService {

    private final ProjectMapper projectMapper;

    public ProjectService(ProjectMapper projectMapper) {
        this.projectMapper = projectMapper;
    }

    public List<Project> getAll() {
        return projectMapper.selectList(
            new LambdaQueryWrapper<Project>().orderByAsc(Project::getSortOrder));
    }

    public Project getById(Long id) {
        return projectMapper.selectById(id);
    }

    public void create(Project project) {
        projectMapper.insert(project);
    }

    public void update(Long id, Project project) {
        project.setId(id);
        projectMapper.updateById(project);
    }

    public void delete(Long id) {
        projectMapper.deleteById(id);
    }
}
