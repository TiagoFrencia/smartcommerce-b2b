package com.smartcommerce.backend.domain.dto;

import java.math.BigDecimal;
import java.util.List;

public record AiContextDTO(
                String clientName,
                BigDecimal totalSpent,
                int totalOrders,
                String topProduct,
                List<String> topPurchasedProducts,
                double purchaseFrequencyDays) {
}
