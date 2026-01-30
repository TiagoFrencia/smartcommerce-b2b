package com.smartcommerce.backend.infrastructure.rest;

import com.smartcommerce.backend.domain.model.SalesAnalysis;
import com.smartcommerce.backend.domain.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
public class AnalysisController {

    private final AiService aiService;

    @GetMapping("/history/{clientId}")
    public ResponseEntity<List<SalesAnalysis>> getAnalysisHistory(@PathVariable Long clientId) {
        List<SalesAnalysis> history = aiService.getHistory(clientId);
        return ResponseEntity.ok(history);
    }
}
