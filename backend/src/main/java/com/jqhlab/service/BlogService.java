package com.jqhlab.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.jqhlab.entity.BlogCategory;
import com.jqhlab.entity.BlogPost;
import com.jqhlab.repository.BlogCategoryMapper;
import com.jqhlab.repository.BlogPostMapper;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BlogService {

    private final BlogPostMapper blogPostMapper;
    private final BlogCategoryMapper blogCategoryMapper;

    public BlogService(BlogPostMapper blogPostMapper, BlogCategoryMapper blogCategoryMapper) {
        this.blogPostMapper = blogPostMapper;
        this.blogCategoryMapper = blogCategoryMapper;
    }

    public Page<BlogPost> getPosts(int page, int size, String category) {
        Page<BlogPost> p = new Page<>(page, size);
        LambdaQueryWrapper<BlogPost> wrapper = new LambdaQueryWrapper<BlogPost>()
            .eq(BlogPost::getStatus, "published")
            .orderByDesc(BlogPost::getCreatedAt);

        if (category != null && !category.isBlank()) {
            BlogCategory cat = blogCategoryMapper.selectOne(
                new LambdaQueryWrapper<BlogCategory>().eq(BlogCategory::getSlug, category));
            if (cat != null) {
                wrapper.eq(BlogPost::getCategoryId, cat.getId());
            }
        }

        return blogPostMapper.selectPage(p, wrapper);
    }

    public BlogPost getPostById(Long id) {
        BlogPost post = blogPostMapper.selectById(id);
        if (post != null) {
            post.setViewCount(post.getViewCount() == null ? 1 : post.getViewCount() + 1);
            blogPostMapper.updateById(post);
        }
        return post;
    }

    public List<BlogCategory> getCategories() {
        return blogCategoryMapper.selectList(
            new LambdaQueryWrapper<BlogCategory>().orderByAsc(BlogCategory::getSortOrder));
    }

    public void createPost(BlogPost post) {
        blogPostMapper.insert(post);
    }

    public void updatePost(Long id, BlogPost post) {
        post.setId(id);
        blogPostMapper.updateById(post);
    }

    public void deletePost(Long id) {
        blogPostMapper.deleteById(id);
    }
}
