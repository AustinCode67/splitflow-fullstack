package com.splitflow.controller;

import com.splitflow.dto.AssistantChatRequest;
import com.splitflow.dto.AssistantChatResponse;
import com.splitflow.service.GeminiAssistantService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/assistant")
public class AssistantController {

    private final GeminiAssistantService geminiAssistantService;

    public AssistantController(
            GeminiAssistantService geminiAssistantService) {

        this.geminiAssistantService = geminiAssistantService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AssistantChatResponse> chat(
            @RequestBody AssistantChatRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();

        return ResponseEntity.ok(
                geminiAssistantService.chat(
                        userEmail,
                        request));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(
            IllegalArgumentException exception) {

        return ResponseEntity.badRequest().body(
                Map.of(
                        "message",
                        exception.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAssistantError(
            Exception exception) {

        System.out.println(
                "Assistant error: " +
                        exception.getMessage());

        return ResponseEntity.status(503).body(
                Map.of(
                        "message",
                        "AI assistant is temporarily unavailable."));
    }
}
