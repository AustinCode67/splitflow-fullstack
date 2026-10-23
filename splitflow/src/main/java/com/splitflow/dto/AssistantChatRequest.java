package com.splitflow.dto;

import java.util.List;

public record AssistantChatRequest(
        String message,
        String context,
        List<AssistantMessage> history) {
}
