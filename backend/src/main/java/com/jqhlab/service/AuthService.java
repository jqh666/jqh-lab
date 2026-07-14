package com.jqhlab.service;

import com.jqhlab.config.JwtConfig;
import com.jqhlab.dto.ApiResponse;
import com.jqhlab.entity.User;
import com.jqhlab.repository.UserMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class AuthService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtConfig jwtConfig;

    public AuthService(UserMapper userMapper, PasswordEncoder passwordEncoder, JwtConfig jwtConfig) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtConfig = jwtConfig;
    }

    public ApiResponse<?> login(String username, String password) {
        User user = userMapper.selectOne(
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<User>()
                .eq(User::getUsername, username));

        if (user == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            return ApiResponse.error(401, "用户名或密码错误");
        }

        String token = jwtConfig.generateToken(username);
        return ApiResponse.success(Map.of(
            "token", token,
            "user", Map.of("username", user.getUsername(), "displayName", user.getDisplayName(), "role", user.getRole())
        ));
    }
}
