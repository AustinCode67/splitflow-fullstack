package com.splitflow.controller;

import com.splitflow.model.LoginRequest;
import com.splitflow.model.LoginResponse;
import com.splitflow.model.User;

import com.splitflow.service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class UserController {

    private final UserService userService;

    public UserController(
            UserService userService) {

        this.userService = userService;
    }

    // =========================================================
    // GET USERS
    // =========================================================

    @GetMapping("/users")
    public List<User> getUsers() {

        return userService
                .getAllUsers();
    }

    // =========================================================
    // REGISTER
    // =========================================================

    @PostMapping("/users")
    public User createUser(
            @Valid @RequestBody User user) {

        return userService
                .createUser(user);
    }

    // =========================================================
    // LOGIN
    // =========================================================

    @PostMapping("/login")
    public LoginResponse login(
            @RequestBody LoginRequest request) {

        return userService.login(
                request.getEmail(),
                request.getPassword());
    }

    // =========================================================
    // DELETE CURRENT ACCOUNT
    // =========================================================

    @DeleteMapping("/users/me")
    public ResponseEntity<Map<String, String>> deleteCurrentUser(
            Authentication authentication) {

        if (authentication == null) {

            return ResponseEntity
                    .status(401)
                    .body(
                            Map.of(
                                    "message",
                                    "Authentication is required."));
        }

        String email = authentication.getName();

        userService
                .deleteUserAccount(email);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Account deleted successfully."));
    }
}