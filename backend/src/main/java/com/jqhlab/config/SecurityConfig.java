package com.jqhlab.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtConfig jwtConfig;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtConfig jwtConfig, CorsConfigurationSource corsConfigurationSource) {
        this.jwtConfig = jwtConfig;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/blogs/**").permitAll()
                .requestMatchers("/api/projects/**").permitAll()
                .requestMatchers("/api/portfolio/**").permitAll()
                .requestMatchers("/api/ai/chat").permitAll()
                .requestMatchers("/api/ai/knowledge-list").permitAll()
                .requestMatchers("/api/ai/upload-knowledge").authenticated()
                .requestMatchers("/api/ai/knowledge/*").authenticated()
                .requestMatchers("/api/upload/**").authenticated()
                .requestMatchers("/api/dashboard/stats").permitAll()
                .requestMatchers("/api/dashboard/**").authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter(), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    private OncePerRequestFilter jwtAuthFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request,
                    HttpServletResponse response, FilterChain chain)
                    throws ServletException, IOException {
                String header = request.getHeader("Authorization");
                if (header != null && header.startsWith("Bearer ")) {
                    String token = header.substring(7);
                    if (jwtConfig.validateToken(token)) {
                        String username = jwtConfig.getUsernameFromToken(token);
                        var auth = new org.springframework.security.authentication
                            .UsernamePasswordAuthenticationToken(
                                username, null, java.util.Collections.emptyList());
                        org.springframework.security.core.context.SecurityContextHolder
                            .getContext().setAuthentication(auth);
                    }
                }
                chain.doFilter(request, response);
            }
        };
    }
}
