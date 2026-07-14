package com.jqhlab.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jqhlab.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {}
