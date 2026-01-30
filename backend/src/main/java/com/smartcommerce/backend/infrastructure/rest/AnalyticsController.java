package com.smartcommerce.backend.infrastructure.rest;

import com.smartcommerce.backend.domain.dto.AnalyticsDTO;
import com.smartcommerce.backend.domain.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/{clientId}")
    public ResponseEntity<AnalyticsDTO> getAnalytics(@PathVariable Long clientId) {
        AnalyticsDTO analytics = analyticsService.getAnalytics(clientId);
        return ResponseEntity.ok(analytics);
    }
}
