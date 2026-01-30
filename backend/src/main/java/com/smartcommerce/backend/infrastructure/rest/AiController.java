package com.smartcommerce.backend.infrastructure.rest;

import com.smartcommerce.backend.domain.model.SalesAnalysisResponse;
import com.smartcommerce.backend.domain.service.AiService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/analyze-orders")
    public SalesAnalysisResponse analyzeOrders(@RequestBody List<Long> orderIds) {
        return aiService.analyzeSales(orderIds);
    }

    @PostMapping("/chat")
    public java.util.Map<String, String> chatWithAi(
            @RequestBody com.smartcommerce.backend.domain.dto.ChatRequest request) {
        String reply = aiService.chatWithData(request.getOrderIds(), request.getMessage());
        return java.util.Map.of("reply", reply);
    }

    @PostMapping("/simulate")
    public com.smartcommerce.backend.domain.dto.SimulationResponse simulate(
            @RequestBody com.smartcommerce.backend.domain.dto.SimulationRequest request) {
        return aiService.simulateScenario(request);
    }

    @PostMapping("/draft-email")
    public com.smartcommerce.backend.domain.dto.EmailDraftResponse draftEmail(
            @RequestBody com.smartcommerce.backend.domain.dto.EmailDraftRequest request) {
        return aiService.draftEmail(request);
    }
}
