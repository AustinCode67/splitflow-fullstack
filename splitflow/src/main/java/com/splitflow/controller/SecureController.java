package com.splitflow.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SecureController {

    @GetMapping("/secure-test")
    public String secureTest(Authentication authentication) {

        return "JWT valid for: " + authentication.getName();
    }
}