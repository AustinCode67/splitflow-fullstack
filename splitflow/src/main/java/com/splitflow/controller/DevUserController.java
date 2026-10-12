package com.splitflow.controller;

import com.splitflow.model.User;
import com.splitflow.repository.UserRepository;
import com.splitflow.service.JwtService;

import org.springframework.context.annotation.Profile;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dev")
@Profile("dev")
public class DevUserController {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public DevUserController(
            UserRepository userRepository,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    // =========================================================
    // GET ALL REGISTERED USERS
    // =========================================================

    @GetMapping("/users")
    public List<Map<String, Object>> getUsers(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "Authentication required.");
        }

        return userRepository
                .findAll()
                .stream()
                .map(user -> {

                    Map<String, Object> result = new LinkedHashMap<>();

                    result.put(
                            "id",
                            user.getId());

                    result.put(
                            "name",
                            user.getName());

                    result.put(
                            "email",
                            user.getEmail());

                    return result;
                })
                .toList();
    }

    // =========================================================
    // SWITCH DEVELOPMENT ACCOUNT
    // =========================================================

    @PostMapping("/switch-account")
    public Map<String, Object> switchAccount(
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "Authentication required.");
        }

        String email = request.get("email");

        if (email == null ||
                email.isBlank()) {

            throw new RuntimeException(
                    "Email is required.");
        }

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(
                        () -> new RuntimeException(
                                "User not found."));

        String token = jwtService.generateToken(
                user.getEmail());

        Map<String, Object> response = new LinkedHashMap<>();

        response.put(
                "token",
                token);

        response.put(
                "name",
                user.getName());

        response.put(
                "email",
                user.getEmail());

        return response;
    }
}