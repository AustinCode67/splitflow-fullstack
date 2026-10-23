package com.splitflow.service;

import com.splitflow.dto.AssistantChatRequest;
import com.splitflow.dto.AssistantChatResponse;
import com.splitflow.dto.AssistantMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiAssistantService {

    private final RestClient restClient;

    @Value("${gemini.api-key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-3.8-flash}")
    private String model;

    public GeminiAssistantService() {

        this.restClient = RestClient
                .builder()
                .baseUrl(
                        "https://generativelanguage.googleapis.com")
                .build();
    }

    public AssistantChatResponse chat(
            String userEmail,
            AssistantChatRequest request) {

        if (apiKey == null ||
                apiKey.isBlank()) {

            throw new IllegalStateException(
                    "Gemini API key is not configured.");
        }

        if (request == null ||
                request.message() == null ||
                request.message().isBlank()) {

            throw new IllegalArgumentException(
                    "Message is required.");
        }

        String financialContext = request.context() == null
                ? "No financial context was supplied."
                : request.context();

        String systemPrompt = """
                You are SplitFlow Assistant, a conversational financial assistant
                inside a group expense sharing application.

                The authenticated user is:
                %s

                IMPORTANT RULES:
                - Answer using the SplitFlow financial context supplied below.
                - Never invent balances, expenses, categories, totals, people, or dates.
                - If the context does not contain enough information, clearly say so.
                - Do not claim that an expense was created, edited, deleted, paid, or settled.
                - You are currently read-only.
                - Keep answers concise and friendly.
                - Use Malaysian Ringgit as RM when the supplied data is in MYR.
                - When useful, explain percentages or comparisons in simple language.
                - Treat previous chat messages as conversation context, but treat the
                  financial context below as the source of truth for financial figures.

                SPLITFLOW FINANCIAL CONTEXT:
                %s
                """.formatted(
                userEmail,
                financialContext);

        List<Map<String, Object>> contents = new ArrayList<>();

        if (request.history() != null) {

            int startIndex = Math.max(
                    0,
                    request.history().size() - 10);

            for (int i = startIndex; i < request.history().size(); i++) {

                AssistantMessage message = request.history().get(i);

                if (message == null ||
                        message.text() == null ||
                        message.text().isBlank()) {
                    continue;
                }

                String role = "assistant".equalsIgnoreCase(
                        message.role())
                                ? "model"
                                : "user";

                contents.add(
                        content(
                                role,
                                message.text()));
            }
        }

        contents.add(
                content(
                        "user",
                        request.message()));

        Map<String, Object> payload = new LinkedHashMap<>();

        payload.put(
                "system_instruction",
                Map.of(
                        "parts",
                        List.of(
                                Map.of(
                                        "text",
                                        systemPrompt))));

        payload.put(
                "contents",
                contents);

        payload.put(
                "generationConfig",
                Map.of(
                        "temperature",
                        0.4,
                        "maxOutputTokens",
                        500));

        Map<String, Object> response = restClient
                .post()
                .uri(
                        "/v1beta/models/{model}:generateContent",
                        model)
                .header(
                        "x-goog-api-key",
                        apiKey)
                .contentType(
                        MediaType.APPLICATION_JSON)
                .body(
                        payload)
                .retrieve()
                .body(
                        new ParameterizedTypeReference<>() {
                        });

        String reply = extractReply(
                response);

        if (reply == null ||
                reply.isBlank()) {

            throw new IllegalStateException(
                    "Gemini returned an empty response.");
        }

        return new AssistantChatResponse(
                reply.trim(),
                "gemini");
    }

    private Map<String, Object> content(
            String role,
            String text) {

        return Map.of(
                "role",
                role,
                "parts",
                List.of(
                        Map.of(
                                "text",
                                text)));
    }

    private String extractReply(
            Map<String, Object> response) {

        if (response == null) {
            return null;
        }

        Object candidatesObject = response.get(
                "candidates");

        if (!(candidatesObject instanceof List<?> candidates) ||
                candidates.isEmpty()) {
            return null;
        }

        Object firstCandidate = candidates.getFirst();

        if (!(firstCandidate instanceof Map<?, ?> candidateMap)) {
            return null;
        }

        Object contentObject = candidateMap.get(
                "content");

        if (!(contentObject instanceof Map<?, ?> contentMap)) {
            return null;
        }

        Object partsObject = contentMap.get(
                "parts");

        if (!(partsObject instanceof List<?> parts) ||
                parts.isEmpty()) {
            return null;
        }

        StringBuilder reply = new StringBuilder();

        for (Object part : parts) {

            if (part instanceof Map<?, ?> partMap) {

                Object text = partMap.get(
                        "text");

                if (text != null) {

                    if (!reply.isEmpty()) {
                        reply.append(
                                "\n");
                    }

                    reply.append(
                            text);
                }
            }
        }

        return reply.toString();
    }
}
