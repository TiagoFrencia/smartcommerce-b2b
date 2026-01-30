package com.smartcommerce.backend.domain.dto;

import java.util.List;

public class ChatRequest {
    private List<Long> orderIds;
    private String message;

    public ChatRequest() {
    }

    public ChatRequest(List<Long> orderIds, String message) {
        this.orderIds = orderIds;
        this.message = message;
    }

    public List<Long> getOrderIds() {
        return orderIds;
    }

    public void setOrderIds(List<Long> orderIds) {
        this.orderIds = orderIds;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
