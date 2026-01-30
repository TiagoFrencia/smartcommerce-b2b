package com.smartcommerce.backend.domain.dto;

public record SimulationRequest(
        Long userId,
        int discountPercentage,
        int contractDurationMonths) {
}
