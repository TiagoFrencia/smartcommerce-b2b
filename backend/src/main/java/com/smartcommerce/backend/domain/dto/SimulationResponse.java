package com.smartcommerce.backend.domain.dto;

public record SimulationResponse(
        int acceptanceProbability,
        String financialImpact,
        String explanation) {
}
