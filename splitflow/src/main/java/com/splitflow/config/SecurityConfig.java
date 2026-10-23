package com.splitflow.config;

import com.splitflow.security.JwtAuthFilter;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

        private final JwtAuthFilter jwtAuthFilter;

        @Value("${app.cors.allowed-origins:http://localhost:5173}")
        private String allowedOrigins;

        public SecurityConfig(
                        JwtAuthFilter jwtAuthFilter) {

                this.jwtAuthFilter = jwtAuthFilter;
        }

        // =========================================================
        // SECURITY
        // =========================================================

        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http)
                        throws Exception {

                http
                                .cors(cors -> cors.configurationSource(
                                                corsConfigurationSource()))

                                .csrf(csrf -> csrf.disable())

                                .sessionManagement(session -> session.sessionCreationPolicy(
                                                SessionCreationPolicy.STATELESS))

                                .exceptionHandling(exception -> exception.authenticationEntryPoint(
                                                (
                                                                request,
                                                                response,
                                                                authException) -> response.sendError(
                                                                                401,
                                                                                "Unauthorized")))

                                .authorizeHttpRequests(auth -> auth

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/")
                                                .permitAll()

                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/users")
                                                .permitAll()

                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/login")
                                                .permitAll()

                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/payments/webhook")
                                                .permitAll()

                                                .anyRequest()
                                                .authenticated())

                                .addFilterBefore(
                                                jwtAuthFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        // =========================================================
        // CORS
        // =========================================================

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {

                CorsConfiguration configuration = new CorsConfiguration();

                List<String> origins = Arrays.stream(
                                allowedOrigins.split(","))
                                .map(origin -> origin.trim())
                                .filter(origin -> !origin.isBlank())
                                .toList();

                configuration
                                .setAllowedOrigins(
                                                origins);

                configuration
                                .setAllowedMethods(
                                                List.of(
                                                                "GET",
                                                                "POST",
                                                                "PUT",
                                                                "DELETE",
                                                                "OPTIONS"));

                configuration
                                .setAllowedHeaders(
                                                List.of("*"));

                configuration
                                .setExposedHeaders(
                                                List.of(
                                                                "Authorization"));

                configuration
                                .setAllowCredentials(
                                                true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

                source.registerCorsConfiguration(
                                "/**",
                                configuration);

                return source;
        }
}