package com.splitflow.controller;

import com.splitflow.service.StripeService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payments")
public class StripeController {

    private final StripeService stripeService;

    public StripeController(
            StripeService stripeService) {
        this.stripeService = stripeService;
    }

    @PostMapping("/create-checkout-session")
    public Map<String, String> createCheckoutSession(
            Authentication authentication) throws Exception {

        String userEmail = authentication.getName();

        String checkoutUrl = stripeService
                .createCheckoutSession(
                        userEmail);

        return Map.of(
                "url",
                checkoutUrl);
    }
}