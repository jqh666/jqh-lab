package com.jqhlab.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jqhlab.entity.BlogPost;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface BlogPostMapper extends BaseMapper<BlogPost> {}
